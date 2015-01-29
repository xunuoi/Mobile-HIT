/**
 * Cloud MOBILE APP
 * 2013/11/4
 * FOR BASE FUNCTION AND SETUP
 */
;define('HIT', function(require, exports, module) {
  //使用_util
var _util = require('util'),
    _API = require('api'),
    _CONFIG = require('config'),
    _ui = require('ui'),
    _view = require('view'),
    _USER = require('user');

var _HIT = {
  helpCache: function(argObj) {
    if (!argObj.cacheEle) {
      return this;
    }
    var tar = argObj,
      eObj = argObj.cacheEle;

    $.each(eObj, function(k, v) {
      var t = _util.getType(v);
      //if string ,then sel,else expect obj
      if (t == 'string') {
        if (_util.isSelector(v) === null) {
          tar[k] = v;
          return;
        }
        if (argObj.root) {
          tar[k] = $(argObj.root).find(v);
        } else {
          tar[k] = $(v);
        }
      } else if (t == 'object') {
        if (v.constructor == $) {
          tar[k] = v;
        } else {
          $.each(v, function(parent, child) {
            tar[v] = tar[parent].find(child);
          });
        }
      } else if (t == 'number') {
        //number type cache
        tar[k] = v;
      } else {

        throw Error('TypeError help cache');
      }

    });

    return this;
  },
  helpEvent: function(argObj) {
    if (!argObj.event) {
      return this;
    }
    var root = argObj.root || 'body',
        evtObj = argObj.event,
        evtTar = argObj;

    var $root = $(root);

    $.each(evtObj, function(k, v) {
      var evtName0 = k.match(/[\w\.,]+(:?\s)/)[0],
          evtName = evtName0.replace(/\s/, ''),
          elSel = k.replace(evtName0, ''),
          evtFnType = _util.getType(v);
      //是否将函数绑定this到控制器本身
      var isProxyToSelf = false;
      if(v.search(/^@/) != -1){
        isProxyToSelf = true;
        v = v.replace(/^@/, '');
      }
      if (evtFnType == 'string') {
        var evtFn = evtTar[v];
      } else if (evtFnType == 'function') {
        var evtFn = v;
      } else {
        throw Error('TypeError: ' + evtFnType);
      }
      //绑定方式
      if (evtName.search(/^((on)|(delegate)|(bind))\.(\w+)/) != -1) {
        var flex = evtName.split('.'),
            way = flex[0],
            evtName = flex[1];
      } else {
        var way = 'on';
      }
      //add debounce optimize
      if(evtName == 'resize'){
        var evtFn = _util.debounce(evtFn);
      }
      //如果绑定在body
      if (/\bbody\s/g.test(elSel)) {
        if(root == 'body'){
          throw Error('The root is body , invalid selector');
        }
        var $hr = $(elSel).hammer();
        isProxyToSelf ? 
          $hr.on(evtName, function(evt){
            evtFn.call(evtTar, evt, this, evtTar)
          }) : 
          $hr.on(evtName, function(evt){
            evtFn.call(this, evt, this, evtTar)
          });
        return;
      }
      switch (elSel) {
        case 'window':
          $(window).on(evtName, function(evt){
            evtFn.call(window, evt, this, evtTar);
          });
          break;
        default:
          var $hr = $root.hammer();
          if(isProxyToSelf){
            way == 'on' ? 
              $hr.on(evtName, elSel, function(evt){
                evtFn.call(evtTar, evt, this, evtTar);
              }) : 
              $hr.find(elSel)[way](evtName, function(evt){
                evtFn.call(evtTar, evt, this, evtTar);
              });
          }else {
            way == 'on' ? 
              $hr.on(evtName, elSel, function(evt){
                evtFn.call(this, evt, this, evtTar);
              }) : 
              $hr.find(elSel)[way](evtName, function(evt){
                evtFn.call(this, evt, this, evtTar);
              });
          }
      }
    });
    return this;
  },

  /**
   * Register the event to the host Object
   * @param  {[type]} argObj [description]
   * @return {[type]}        [description]
   * @Optimize: for the 'resize' event ,need optimize, setTimeout. use debounde ,not JIT cal
   */
  helpPluginEvent: function(argObj) {
    if (!argObj.pluginEvent) {
      return this;
    }
    var regEvt = argObj.pluginEvent;
    $.each(regEvt, function(hostEvt, fnsList) {
      //this will rewrite thehostEvt Fn
      var _oriHostEvtFn = argObj[hostEvt] || _util.noop;

      argObj[hostEvt] = function(event, contextThis, controller) {
        _oriHostEvtFn.call(contextThis, event, contextThis, controller);

        $.each(fnsList, function(eq, v) {
          var fnType = _util.getType(v);
          var isProxyToSelf = false;
          if(v.search(/^@/) != -1){
            isProxyToSelf = true;
            v = v.replace(/^@/, '');
          }
          if (fnType == 'string') {
            isProxyToSelf ? argObj[v].call(argObj, event, argObj, controller) : argObj[v].call(contextThis, event, contextThis, controller);
          } else {
            isProxyToSelf ? v.call(argObj, event, argObj, controller) : v.call(contextThis, event, contextThis, controller);
          }

        });
      };

    });

    return this;
  },
  setRoot: function(argObj) {
    argObj.root ? argObj.$root = $(argObj.root) : '';

    return this;
  },
  helpRegisterView: function(obj) {
    obj._viewID ? _view.viewBase[obj._viewID] = obj : '';

    return this;
  },
  helpInit: function(obj, args) {
    if(args[0] == '@self'){
      args = [obj];
    }
    // var otherArgs = [].slice.call(arguments, 1);
    // var args = [].slice.call(arguments, 0);
    obj.init ? obj.init.apply(obj, args) : '';
    obj._inited = true;

  },
  helpCacheVar: function(argObj) {
    if (!argObj.cacheVar) {
      return this;
    }
    argObj.cacheVar ? argObj.cacheVar.call(argObj) : '';

    return this;
  },
  create: function(obj) {
    function _Controller(args) {
      var cobj = this.contructObject || obj;
      var args = [].slice.call(arguments, 0);
      //预处理
      cobj._preMake ? cobj._preMake() : '';

      _HIT.setRoot(cobj)
        .helpPluginEvent(cobj)
        .helpEvent(cobj)
        .helpCache(cobj)
        .helpCacheVar(cobj)
        .helpRegisterView(cobj)
        .helpInit(cobj, args);

      return obj;
    }
    _Controller.prototype.inherits = function(first_argument) {
      // body...
    };

    return _Controller;
  }

};

exports.storage = {
    clear: function() {
      localStorage.clear();
    },
    set: function(key, val, type) {
      if (type == 'object' || typeof val == 'object')
        val = JSON.stringify(val);

      localStorage[key] = val;
    },
    get: function(key, type) {
      var val = localStorage[key];
      if (val && type == 'object') {
        val = JSON.parse(val);
      }
      return val;
    },
    remove: function(key) {
      localStorage.removeItem(key);
    },
    storeApi: function(apiName, data) {
      this.set(apiName, data, 'object');
    },
    getApiFromStore: function(apiName, next) {
      var rs = this.get(apiName, 'object');
      if (rs) {
        return rs;
      } else {
        next ? next() : '';
        throw Error('No Storage API Data: ' + apiName);
      }
    }
};

//工作流配置 ===============================
var workFlow = [
    function pluginModule (){
        $.log = $.logon = _util.log;
        //for the online-product ,close log
        $.logoff = _util.noop;
        console ? (console.logoff = _util.noop) : '';
        //挂在UI模块
    },
    function(){
        //场景检测
        $.publish('SITUATION-CHECK', _USER);
    },
    function _quickNav(){
        _ui.initQuicknav(_util);
    }
];
function startFlow(){
    var len = workFlow.length;
    for(var i=0;i<len; i++){
        var _fn = workFlow[i];
        _fn();
        
    }
};
//运行工作流
startFlow();

// =============   exported API ===============

exports.create = _HIT.create;
window.HIT = exports;

HIT.util = _util;
HIT.ui = _ui;
//VIEW
HIT.view = _view;

HIT.USER = _USER;
HIT.API = _API.api;
HIT.newApi = _API.newApi;
HIT.CONFIG = _CONFIG;
HIT.CACHE = {};

//for customer user cache var
HIT.G = {};
//是否启用本地Storage接口数据来开发，或者hash  api_off=true

HIT._version = '1.0';
console.log("%c === HIT init succeed ===", "color:#FFF; background: rgba(57, 60, 61, 0.8);-webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid rgba(0, 0, 0, 0.8);padding: 1px 4px;line-height: 14px;");

});

seajs.use('HIT');
