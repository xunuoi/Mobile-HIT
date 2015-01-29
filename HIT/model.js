define('model', function(require, exports, module ){

var ClassMod = require("klass");
// window.ClassMod = ClassMod;
var Model = ClassMod.Class.create();

var GUID = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }).toUpperCase();      
};

var PubSub = {
    _setupPubSub: function(){
        this.o = $({});
        return this;
    },
    subscribe: function() {
        this.o ? '' : this._setupPubSub();
        this.o.bind.apply( this.o, arguments );
    },
    publish: function() {
        this.o ? '' : this._setupPubSub();
        this.o.trigger.apply( this.o, arguments );
    }
};

// Alias create
Model.createSub = Model.create;
Model.setup = function(name, atts){
    var model = Model.createSub();
    if (name) model.name = name;
    if (atts) model.attributes = atts;
    return model;
};

Model.extend({
    init: function(){
        this.records = {};
        this.attributes = [];
    },
    createRemote: function(url, cb){
        $.ajax({
            url: url,
            type: 'POST',
            data: this.attributes(),
            dataType: 'json',
            success: cb
        });
    },
    updateRemote: function(url, cb){
        $.ajax({
            url: url,
            type: 'POST',
            data: this.attributes(),
            dataType: 'json',
            success: cb
        });
    },

    find: function(id){
        var record = this.records[id];
        if ( !record ) throw(">>Unknown record, id: "+id);
        return record.dup();
    },

    exists: function(id){
        try {
            return this.find(id);
        } catch (e) {
            return false;
        }
    },
    clear: function(){
        this.records = {};
    },
    populate: function(values){
        // Reset model & records
        this.records = {};

        for (var i=0, il = values.length; i < il; i++) {    
            var instAttrs = values[i];
            var record = this.inst(instAttrs);
            record._newRecord = false;
            this.records[record.id] = record;
            /**
             * @Cloud Fix 
             */
                // this.fixAttr(instAttrs, record);
                // record.save();
            /* /FIX END */
        }
    },

    select: function(callback){
        var result = [];
     
          for (var key in this.records)
              if (callback(this.records[key]))
              result.push(this.records[key]);
     
        return this.dupArray(result);
    },
    //@Cloud
    findAllBy: function(arg){
        var rs = [];
        typeof arg == 'object' ? $.each(this.records, function(eq, rec){
              var isGood = true;
              $.each(arg, function(attr, val){
                  //check is every attr ok
                  rec[attr] != val ? isGood = false : '';
              });
              //if it is then push in
              isGood ? rs.push(rec) : '';

        }) : rs = this.findByAttribute(arguments[0], arguments[1]);

        return rs;
    },
    findByAttribute: function(name, value){
        for (var key in this.records)
            if (this.records[key][name] == value)
                return this.records[key].dup();
    },

    findAllByAttribute: function(name, value){
        return(this.select(function(item){
            return(item[name] == value);
        }));
    },

    each: function(callback){
        for (var key in this.records) {
            callback(this.records[key]);
        }
    },

    all: function(){
        return this.dupArray(this.recordsValues());
    },

    first: function(){
        var record = this.recordsValues()[0];
        return(record && record.dup());
    },

    last: function(){
        var values = this.recordsValues()
        var record = values[values.length - 1];
        return(record && record.dup());
    },

    count: function(){
        return this.recordsValues().length;
    },

    deleteAll: function(){
        for (var key in this.records)
            delete this.records[key];
    },

    destroyAll: function(){
        for (var key in this.records)
            this.records[key].destroy();
    },

    update: function(id, atts){
        this.find(id).updateAttributes(atts);
    },
    fixAttr: function(attrs, record){
        record._parent = record.parent;
        if('parent' in attrs){
            record.parent = attrs['parent'];
        }else {
            delete record.parent;
        }
    },
    create: function(attrs){
        var record = this.inst(attrs);
        /* @Cloud */
        this.fixAttr(attrs, record);

        record.save();
        return record;
    },
    createMulti: function(list){
        //批量生成对象
        var rs = [],
            len = list.length;

        for(var i=0; i<len; i++){
            rs.push(this.create(list[i]));
        }
        return rs;
    },
    new: function(attrs){
        var record = this.inst(attrs);
        this.fixAttr(attrs, record);
        
        return record;
    },

    destroy: function(id){
        this.find(id).destroy();
    },

    // Private

    recordsValues: function(){
        var result = []
        for (var key in this.records)
            result.push(this.records[key])
        return result;
    },

    dupArray: function(array){
        return array.map(function(item){
            return item.dup();
        });
    }
});
 
Model.include({
    _newRecord: true,

    init: function(atts){
        if (atts) this.load(atts);
    },

    isNew: function(){
        return this._newRecord;
    },

    validate: function(){ },

    load: function(attributes){
        for(var name in attributes)
            this[name] = attributes[name];
    },
    attributes: function(){
        var result = {};
        for(var i in this._parent.attributes) {
            var attr = this._parent.attributes[i];
            result[attr] = this[attr];
        }
        result.id = this.id;
        return result;
    },

    eql: function(rec){
        return(rec && rec.id === this.id && 
            rec._parent === this._parent);
    },

    save: function(){
        if (this.validate() == false) return false;
        this.publish("beforeSave");
        this._newRecord ? this.create() : this.update();
        this.publish("afterSave");
        this.publish("save");
    },

    updateAttribute: function(name, value){
        this[name] = value;
        return this.save();
    },

    updateAttributes: function(attributes){
        this.load(attributes);
        return this.save();
    },

    destroy: function(){

        this.publish("beforeDestroy");
        delete this._parent.records[this.id];
        this.publish("afterDestroy");
        this.publish("destroy");
        //release m;
        this.__proto__ = null;
        delete this._parent;
        var selfItem = this;

        $.each(selfItem, function(k, v){
            selfItem[k] = null;
            delete selfItem[k];
            
        });
    },

    dup: function(){
        return Object.create(this);
    },

    toJSON: function(){
        return(this.attributes());
    },

    // Private

    update: function(){
        this.publish("beforeUpdate");
        this._parent.records[this.id] = this.dup();
        this.publish("afterUpdate");
        this.publish("update");
    },

    create: function(){
        this.publish("beforeCreate");
        if ( !this.id ) this.id = GUID();
        // this._newRecord = false;
        // @Cloud
        delete this._newRecord;
        this._parent.records[this.id] = this.dup();
        this.publish("afterCreate");
        this.publish("create");
    },

    publish: function(channel){
        this._parent.publish(channel, this);
    }
});

// Model.extend(Relation);
Model.extend(PubSub);
exports.Model = Model;
window.Model = Model;

// window.Article = Model.setup('Article', {name: String, date: Date});
/*window.Article = Model.setup('Article', ['name', 'date']);
window.dog = Article.create({name: 'dog', date: new Date()})
window.cat = Article.create({name: 'cat', date: new Date()})*/

});
