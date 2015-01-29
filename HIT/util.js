define('util', function(require, exports, module){

var UA = navigator.userAgent.toLowerCase();

module.exports = {
    getEvent: function(event) {
        return event ? event: window.event; // or default e
    },
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    preventDefault: function(event) {
        if (event.preventDefault != undefined) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        } //for IE
    },
    stopPropagation: function(event) {
        if (event.stopPropagation != undefined) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    addStyleCSS: function(str, id){
        var style = document.createElement('style');
        id ? style.id = id : '';

        style.textContent = str;
        document.getElementsByTagName('head')[0].appendChild(style);
        return style;
    },
    validate: function(tar, type) {
        switch (type) {

        case 'number':
            return _number_pt = /^\d+(\.\d+)?$/.test(tar);
        case 'integer':
            var _integer_pt = /^(-|\+)?\d+$/;
            return _integer_pt.test(tar);

        case 'mail':
            //MAIL : "^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$",
            var _email_pt = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
            return _email_pt.test(tar);

        case 'tel':
            //TEL : "^0(10|2[0-5789]|\\d{3})-\\d{7,8}$",
            var _tel_pt = /^[0-9]{3,4}(\-|\s)[0-9]{7,8}$/;
            return _tel_pt.test(tar);
        case 'mobile':
            var _mobile_pt = new RegExp('^1(3[0-9]|5[0-35-9]|8[0235-9])\\d{8}$');
            return _mobile_pt.test(tar);
        case 'url':
            var _url_pt = new RegExp('^http[s]?://[\\w\\.\\-]+$');
            return _url_pt.test(tar);
        case 'idcard':
            var _id_pt = new RegExp('((11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|91)\\d{4})((((19|20)(([02468][048])|([13579][26]))0229))|((20[0-9][0-9])|(19[0-9][0-9]))((((0[1-9])|(1[0-2]))((0[1-9])|(1\\d)|(2[0-8])))|((((0[1,3-9])|(1[0-2]))(29|30))|(((0[13578])|(1[02]))31))))((\\d{3}(x|X))|(\\d{4}))');
            return _id_pt.test(tar);
        case 'ip':
            var _ip_pt = new RegExp('^((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]|[*])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]|[*])$');
            return _ip_pt.test(tar);
        case 'chinese':
            var _ch_pt = new RegExp('^([\u4E00-\uFA29]|[\uE7C7-\uE7F3])*$');
            return _ch_pt.test(tar);

            // default ==========================================================
        default:
            throw Error('TypeError', 'No Type Matched: ' + type);

        }

        return false;
    },
    ///validate
    killEvent: function(event) {
        if (!event) {
            return;
        }
        if (typeof event == 'object' && this.getTarget(event) != undefined) {
            this.stopPropagation(event);
            this.preventDefault(event);
        } else {
            return false;
        }
    },
    addURLParam: function(url, name, value) { //put the parameters into url
        url += (url.indexOf('?') == -1 ? '?': '&');
        url += encodeURIComponent(name) + '=' + encodeURIComponent(value);

        return url;
    },
    chinese: {
        encode: function(str) {
            var arr = [];
            var hex;
            for (var i = 0; i < str.length; i++) {
                hex = ("00" + str.charCodeAt(i).toString(16)).slice( - 4);
                arr.push(hex);
            }

            return "\\u" + arr.join("\\u");
        },

        uncode: function(str) {
            return unescape(str.replace(/\/\//g, "%"));
        }
    },

    addParam: function(url, name, value) {
        url += (url.indexOf('?') == -1 ? '?': '&');
        url += name + '=' + value;
        return url;
    },

    parseObject: function(url) { //translate the URL resolve to Object
        return (new Function('return' + ' {' + url.substring(url.indexOf('?') + 1).replace(/&/g, '",').replace(/=/g, ': "') + '" }'))(); //before '}' add " for:the end parameters. eg: rs=true  ,then rs: "true ,need  "  to end this
    },
    calUrl: function(base, tar) {
        return base.replace(/^.\//g, '');
    },
    urlToObj: function(url) {
        if (url.indexOf('?') == '-1' || url == '?') {
            return null;
        }
        return (new Function('return' + ' {' + url.substring(url.indexOf('?') + 1).replace(/&/g, '",').replace(/=/g, ': "') + '" }'))();
    },

    objToUrl: function(parObj, curUrlRoot) {
        var curUrl = curUrlRoot || '';
        for (var key in parObj) {
            if (parObj.hasOwnProperty(key)) {
                curUrl = this.addURLParam(curUrl, key, parObj[key]);
            }
        }
        return curUrl;
    },

    objGetUrl: function(parObj, curUrlRoot) {
        var curUrl = curUrlRoot || '';
        for (var key in parObj) {
            if (parObj.hasOwnProperty(key)) {
                curUrl = this.addParam(curUrl, key, parObj[key]);
            }
        }
        return curUrl;
    },
    parseResetfulHash: function(s){
        var _obj = {},k ,v,
            tl = s.slice(2).split(/\//g).slice(1),
            len = tl.length;
        for(var i=0; i<len ; (k = tl[i], v = tl[i+1], _obj[k] = v, i+=2)){}
        
        return _obj;
    },
    getHashObj: function(str) {
        var url = str || location.hash;

        if(url.search(/#!\//g) != -1){
            return this.parseResetfulHash(url);
        }else {
            if (url.indexOf('#!') == '-1') {
                return null;
            } else {
                url = url.replace('#!', '?');
            }
            return this.urlToObj(url);
        }

    },
    setHashParam: function(k, v) {
        var upObj = {};
        if (typeof k == 'object') {
            upObj = k;
        } else {
            upObj[k] = v;
        }
        var oriHashObj = this.getHashObj();
        if (oriHashObj == null) {
            oriHashObj = {};
        }
        $.each(upObj,
        function(eq, v) {
            if (v === null) {
                delete upObj[k];
                delete oriHashObj[k];
            }
        });
        //extend null仍然得到null
        $.extend(oriHashObj, upObj);

        // $.log(oriHashObj);
        var newHash = '#!' + this.objGetUrl(oriHashObj).substring(1);

        location.hash = newHash;

        return newHash;
    },

    cloneObj: function(obj) {
        var objClone;
        if (obj.constructor == Object) {
            objClone = new obj.constructor();
        } else {
            objClone = new obj.constructor(obj.valueOf());
        }

        for (var key in obj) {

            if (objClone[key] != obj[key]) {
                if (typeof obj[key] == 'object') {
                    objClone[key] = this.cloneObj(obj[key]); //深度克隆
                } else {
                    objClone[key] = obj[key];
                }
            }
        }

        objClone.toString = obj.toString;
        objClone.valueOf = obj.valueOf;

        return objClone;

    },

    cloneArray: function(a) {
        var r = a.concat([]);
        return r;
    },

    clone: function(tar) {
        var t = this.getType(tar),
        rt;
        t == 'array' ? rt = this.cloneArray(tar) : (t == 'object' ? rt = this.cloneObj(tar) : (t == 'string' ? rt = tar: ''));

        return rt;
    },
    formatTime: function(time) {

        var r = /^[+-]?[1-9]?[0-9]*\.[0-9]*$/;
        var tr = time / 60;

        var times = r.test(tr) ? Math.floor(tr) + ":" + 60 * 0.5 : tr + ":00";
        return times;
    },
    getDateStr: function(str) {
        return this.formatTime(str).substring(0, 10);
    },
    getCHDay: function(dateObj) {
        var cur = dateObj || (new Date());
        return "日一二三四五六".charAt(cur.getDay());
    },
    timeToDate: function(time) {
        var oString = time + '';
        if (oString.length < 13) {
            var nLength = 13 - oString.length;
            var nList = [];
            while (nLength) {
                nList.push(0);
                nLength--;
            }
            var oList = oString.split('').concat(nList);
            time = parseInt(oList.join(''));
        }

        return new Date(time);
    },
    getCHDateFromTime: function(time) {
        return this.getCHTime(this.timeToDate(time));
    },
    getCHTime: function(dateObj) { //get the Chinese-format time
        var now = dateObj || (new Date());

        var year = now.getFullYear(); //year
        var month = now.getMonth() + 1; //month
        var day = now.getDate(); //day
        var hh = now.getHours(); //hour
        var mm = now.getMinutes(); //minute
        var ss = now.getSeconds();

        var clock = year + "-"; //clock the final time show
        if (month < 10) {
            clock += "0";
        }
        clock += month + "-";

        if (day < 10) {
            clock += "0";
        }
        clock += day + " ";

        if (hh < 10) {
            clock += "0";
        }
        clock += hh + ":";

        if (mm < 10) {
            clock += '0';
        }
        clock += mm + ":";

        if (ss < 10) {
            clock += "0";
        }

        clock += ss;

        return (clock);
    },
    getCHDate: function() {
        return this.getCHTime().slice(0, 10);
    },
    isLessThanToday: function(a, b, isEqual) {
        var aDateObj = new Date(2014, a.month, a.day),
        aTime = aDateObj.getTime();

        var bObj = new Date(2014, b.month, b.day),
        bTime = bObj.getTime();

        if (!isEqual) return bTime < aTime;
        else {
            return bTime <= aTime;
        }
    },
    getStrLength: function(str) {
        return str.replace(/[^\x00-\xff]/g, 'xx').length / 2;
    },
    inString: function(tar, str) {
        return !! (str.indexOf(tar) + 1);
    },

    ins: function(tar, source) {
        var stype = this.getType(source);
        if (stype == 'array') {
            return this.inArray(tar, source);
        } else if (stype == 'string') {
            return this.inString(tar, source);
        } else {
            throw Error('TypeError: Expected arguments[1] string or array.');
        }
    },

    inArray: function(t, a, isRemove) {
        if (this.classOf(a) == 'Array') {
            if (!a.length) {
                return false;
            }
            var len = a.length;
            for (var i = 0; i < len; i++) {
                if (t === a[i]) {
                    return true;
                }
            }

            return false;
        } else {
            this.throwError('TypeError', 'Argumegs[1] Expected Array in Stone.inArray()');
        }
    },
    subMixstr: function(str, cutLen) {
        //resolve to array
        var pt = /[^\x00-\xff]/,
        temp = [],
        rs = [];
        if (!pt.test(str)) {
            return str.substring(0, cutLen - 1);
        } else {
            for (var i = 0,
            len = str.length; i < len; i++) {
                pt.test(str[i]) ? temp.push([str[i], 2]) : temp.push([str[i], 1]);
            }
        }
        for (var p = 0,
        lenCounter = 0; p < len; p++) {
            var tStr = temp[p][0];
            rs.push(tStr);
            if ((lenCounter += temp[p][1]) >= cutLen) {
                return rs.join('');
            }
        }

        return rs.join('');
    },
    getTicket: function(len) {
        len = len || 32;
        var chars = '0123456789abcdef';
        var max_pos = chars.length;
        var hash = '';
        for (i = 0; i < len; i++) {
            hash += chars.charAt(Math.floor(Math.random() * max_pos));
        }
        return hash;
    },
    classOf: function(o, note) {
        if (o === null) return 'Null';
        if (o === undefined) return 'Undefined';
        if (!note) return Object.prototype.toString.call(o).slice(8, -1);
        if (note) return Object.prototype.toString.call(o);
    },
    getType: function(t) {
        var cur = this.classOf(t).toLowerCase();
        return cur;
    },
    isSelector: function(str) {
        //judge is the str is an selector-string
        return str.match(/([.#])|(^((div)|(body)|(window)|(html)|(i)|(input)|(button)|(textarea)|(select)|(span)|(section)|(header)|(nav)|(ul)|(li)|(a))(\b|\s))/);
    },
    isNormalServer: !_isTestServer,
    isTestServer: _isTestServer,
    isIOS: function() {
        var ua = navigator.userAgent;
        return ua.search('iPhone OS') != -1;
    },
    ltIOS: function(ver) {
        if (!this.isIOS()) {
            return false;
        }
        var ua = navigator.userAgent;
        var cur = ua.split('iPhone OS ')[1].charAt(0);
        return cur < ver;
    },
    isAndroid: function() {
        var ua = navigator.userAgent;
        return ua.search('android') != -1;
    },
    once: function() {
        var _base = {};

        return function(fn) {
          if (_base[fn]) {
            return;
          } else {
            fn();
          }
        }
    }(),
    debounce: function(func, wait, immediate) {
        var timeout, result;
        return function() {
            var context = this,
            args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    },
    weed: function(obj, attr){
        if(this.getType(attr) == 'array'){
            this.each(attr, function(i, v){
                delete obj[v];
            })
        }else {
            delete obj[v];
        }
        return obj;
    },
    filter: function(obj, cb){
        type = this.getType(obj);
        var ee = {};
        if(type == 'object'){   
            this.each(obj, function(k, v){
                if(cb(k, v)) ee[k] = v;
            })
        }else if(type == 'array'){
            var ee = [];
            this.each(obj, function(i, v){
                ee.push(v);
            });
        }
        return ee;
    },
    getInputsObj: function(tar) {
        var $tar = $(tar),
        $ipt = $tar.find('input, textarea, select'),
        rtObj = {};

        $ipt.each(function(eq, v) {
            var $cur = $(this),
            fName = $cur.attr('name') || $cur.attr('id');

            rtObj[fName] = $cur.val();
        });

        return rtObj;
    },
    //返回到初始历史状态。点击微信返回按钮可以立即返回
    backToFirstHistory: function() {
        if (!history) return;

        var count = history.length;
        history.go( - (count - 1));

    },
    //时间计算=========
    getMonthCount: function(year, month) {
        var m_aMonHead = new Array(12); //定义阳历中每个月的最大天数
        m_aMonHead[0] = 31;
        m_aMonHead[1] = 28;
        m_aMonHead[2] = 31;
        m_aMonHead[3] = 30;
        m_aMonHead[4] = 31;
        m_aMonHead[5] = 30;
        m_aMonHead[6] = 31;
        m_aMonHead[7] = 31;
        m_aMonHead[8] = 30;
        m_aMonHead[9] = 31;
        m_aMonHead[10] = 30;
        m_aMonHead[11] = 31;
        //判断某年是否为闰年
        function isPinYear(year) {
            var bolRet = false;
            if (0 == year % 4 && ((year % 100 != 0) || (year % 400 == 0))) {
                bolRet = true;
            }
            return bolRet;
        }
        //得到一个月的天数，闰年为29天
        var c = m_aMonHead[month - 1];
        if ((month == 2) && isPinYear(year)) c++;

        return c;
    },
    afterDaysDate: function(year, month, curDay, offDay) {
        year = parseInt(year);
        month = parseInt(month);
        curDay = parseInt(curDay);
        offDay = parseInt(offDay);

        var rsYear = year,
        rsMonth = month,
        rsDay;

        var daySum = offDay + curDay;

        var dayTotal = this.getMonthCount(year, month);
        //仅仅相差天数不多的情况有效
        if (daySum > dayTotal) {
            rsMonth++;
            rsDay = daySum - dayTotal;
        } else {
            rsDay = daySum;
        }
        if (rsMonth > 12) {
            rsYear++;
            rsMonth = (rsMonth - 12);
        }

        return {
            year: rsYear,
            month: rsMonth,
            day: rsDay
        }
    },
    'br': {
        isTrident: function() {
            if (/trident/i.test(UA)) return true;
            else return false;
        },
        isWebkit: function() {
            if (/webkit/i.test(UA)) return true;
            else return false;
        }
    },

    log: function() {
        var logStyle = {
            'tip': "color:#FFF; background: rgba(57, 60, 61, 0.8);-webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid rgba(0, 0, 0, 0.8);padding: 1px 4px;line-height: 14px;",
            'log': 'color: #0EBFD8;'
        };
        return function(){
            var hashObj = HIT.util.getHashObj();
            if (hashObj) {
                if (hashObj['debug_trace']) console.trace();
                if (hashObj['debug_off']) return;
            }
            // console.log(arguments.callee.caller);
            var args = [].slice.call(arguments, 0);
            if (HIT.util.getType(args[0]) == 'string') {
                args[0] = '%c' + args[0];
            } else {
                args.unshift('%c');
            }

            args.splice(1, 0, logStyle.log);
            console.log.apply(console, args);
        }
    }(),
    client: function(){
        $(window).on('resize',function() {
            HIT.util.client.refresh();
        });

        return {
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            refresh: function() {
                this.width = document.body.clientWidth;
                this.height = document.body.clientHeight;
            }
        };
    }(),
    //business tools ====================================
    isAction: function(status, type) {
        if (status === null) {
            return true;
        }
        if (type == 'teleinquiry') {

            return ["pending", "paid", "completed"].indexOf(status) >= 0;

        } else if (type == 'clinic') {

            return ["pending", "paid", "completed"].indexOf(status) >= 0;

        } else if (type == 'inquiry') {

            return ["resolved_by_doctor", "completed", "paid"].indexOf(status) >= 0;

        } else {

            return ["pending", "paid"].indexOf(status) >= 0;

        }
    },

    jump: function(argObj) {
        var to = argObj.to,
            dataObj = $.extend(HIT.USER.data, argObj.data,{
							timestamp: new Date().getTime()
						});
        argObj.filter ? (dataObj = argObj.filter(dataObj)) : '';

        //过滤无效参数
        if(to in HIT.CONFIG.dict['routeFilter']){
            $.each(dataObj, function(k, v){
                //只保留该路由的合法参数
                if(!HIT.util.ins(k, HIT.CONFIG.dict.routeFilter[to])){
                    delete dataObj[k];
                }
            });
        }

        //清除病历夹路由标识
        HIT.util.setHashParam('catalog', null);

        //浏览器历史
        if(to == '@back'){
					location.href = document.referrer;
            return ;
        }else if(to == '@forward'){
            history.forward();
            return;
        }
        var argUrl = HIT.util.objGetUrl(dataObj),
            hash = argObj.hash || location.hash,
            tarUrl = ['/', to, argUrl, hash].join('');

        location.href = tarUrl;
    },
    jumpToPay: function(recordId){
        var midfix = '';
        if (_isTestServer) {
            midfix = 'staging-';
        }
        var url = ['http://pay.', midfix, 'fangmingyi.com/alipay/checkout/create/', recordId];
        location.href = url.join("");
    },
    'noop': function(argument) {}
};
});