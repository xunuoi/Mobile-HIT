define('ui', function(require, exports, module) {
var util = require('util'),
    user = require('user');

//UI SET
$('.cloud-radio-ctn').hammer().on('tap','.radio-width', function(event) {
  var $radio = $(this);
  var $p = $radio.parent();
  $p.find('.public-radio-btn').removeClass('active');
  $radio.find(".public-radio-btn").addClass('active');
});

//ui block ================
var _block_count = 1;
//阻止底层滑动
$('#hit_block_ui, #quick_nav, #hit_mask_ui, #hit_mask_ui-2').on(
    'touchstart touchmove touchend',
    function(evt) {
        evt.gesture ? evt.gesture.preventDefault() : '';
        HIT.util.killEvent(evt);
        return false;
    }
);
exports.mask = function(speed, cb){
    $('#hit_mask_ui-2').stop().fadeIn(speed, function(){
        cb ? cb() : '';
    });
};
exports.unmask = function(speed, cb){
    $('#hit_mask_ui-2').stop().fadeOut(speed, function(){
        cb ? cb() : '';
    });
};
exports.centerBlock=function(text){
    this.shade();
    spiner.create();
    $('.l-cartoon').addClass('l-mask');
};

exports.unCenterBlock = function(text){
    this.unShade();
    spiner.remove();
    $('.l-cartoon').removeClass('l-mask');
}

exports.shade = function(speed, cb){
    $('#hit_mask_ui-3').stop().fadeIn(speed, function(){
        cb ? cb() : '';
    });
};

exports.unShade = function(speed, cb){
    $('#hit_mask_ui-3').stop().fadeOut(speed, function(){
        cb ? cb() : '';
    });
};

//for centerBlock
var spiner = (function() {
    var go12 = /msie 8/.test(navigator.userAgent.toLowerCase()), pos = 0, size = 32, uri;
    var spinerval, outer;//for cycle spiner
    if(go12){
        uri = '/static/img/loading/apple_spinner_white_32.png';
    }else {
        uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAADACAMAAACDB5U0AAAAMFBMVEUAAAD///////////////////////////////////////////////////////////87TQQwAAAAEHRSTlMAUQwWSGr/BSODz+iYN7ioo0T1UwAABSpJREFUeNrtmouSozgMRbFlYfn9/387FoaIJFAYU7s7W5Vb3ZOkMzrIliD2JdNPf79UCOpJPMxV8ABADKC7UakUOgLolHRPvPbz7OEbYI1SxvaMO4Qwu28AqUroAdg4VwR9ArSqgNQ3c5xC+QQkVaWnLrm5Esw7ADi+obqmMczZvgGMMjyFnVKcAu4B1JOAlZbLNQUPAtDmbQaPM0nZO9qecwqutXKAtYTwaihz1FG2BB88ru8spYTtZLK7ElqqLJWOAd6HrNZS1nZkGEBrwq2EwP3ItKMhBM+IuLxpciF5D4yB5ZG7gWlwWD3nlyS8g5NZ3sJPT6oUQ0McZNiyZyWYzmXaTBR7cHzDg1eGLpoBawIhHgOq6LobwflCx0OQwV8g7El2HeHjApGeTmX1Sx9ZmiwqUsSTQrLMezHzTl5qcFAHIQwCzOvno4G6hqBOhzDpgUn85wRndNsXjtEdn+7J0DVCq1hixtMa0EV8cqXEWE4A5upqQC28HA8Brq5HgLGG19+jj0C5Ip6Og1p4QVpeIb7SkLUFmbWLjj4XXMs+rVeVGNHyn+3b2sJS6+N0DChx+/zE6BwDQCng0lTRlgy/SIczGBW8njsXTaUiInOSMpI2JHl+csWyWAFYX2pE5Ed4P+rliWBiBaRJAG19AlOntKvCSQDy+d4nxQnQDtC7wtjPoJreAbZrjSMz6GAPuLfKAk4gTZ+AKfWmoFsTfgE0V7IDIKeBAJpAlkZ9EsCAngNkODT99NNPz2W8N0/iQTbiY6JQRbejYqQPgPgKHdI5hKy/AdA2ctcC3vPgNyD2+inWhYqgTwBxfOm7rHMK8ROQb/gxGCrBvAMUxzO1bxrXnZ8ArG/b8E4pTkHtAcgJYL9/wDv5DALgEs7+YtFNJeOrZ3ge3Vp7WEtoLvyD6LPPuL6zlFJvJxMsJTz1DwTA+yWzdlMIhWF6+YdHQFf+ARWfGeFSa/xIb2e16vAPMC9JZISDNWSXf0CuJVFo2D9I60w88A9U8dm7R/4B5vi/9A/0U/8g7kQD/kEsEl9cp39wDhjwD1IUOXroH9j/3j/Q0zP/QDnUD/wD46KLatw/wMg7nmH/AB0r4ph/oJVbDu9G/YMaykJaN5r6pn+wjr7RAdHJTF74BwKIbtvXGURUtvnB3f4BOvEPsCrJoW/7B6ol0A494B8krKJJAHf9A45XkwDu+geGASCAu/4BcLyZBNDnH4gUA7QAbvsHrYQCuO0ftBIK4L5/IH0igBH/QACjklYeFxnz8w9++umR5P6TGQ6Wjfi4yFfR7SjnthhgAMhasouli/dF7wFih3QNB3jPg98A125Fd2jZedEOIF8qiH2XdU7BfQLK3O/HIKeQ3gGm3Y3vky4VEO0eYJfvA+h+/ypnr/YA5ATUJLrYlMVKKCCNBKEmkKVQJ/0jK9S0llL71sqOE0gvoypkOrtNpLTMY9HbyQRLCTfzn72AfHmjKnsfxT+oTbiWUPmZ5Y9vlTUEtcZfHmVIpj3Oi4I5vdVYERH1d35LUePcdGrKEZaGOPwPKbRwr65vWLqjBH3LHu2Ff1ATKHgKiDB+09aEuaS+c8GeoOlv9g+S22nEP3B7YZ9/cAqIOOIfOBH+/AMwqB74BzZhlRn2D0hxvDOj/oHCRWrQPzDYlOyYf4BN29e30l3/QLXsSbZoN/0DJdnLJvGOfwAKk943PT3wDwwHPPAPSFWN+gdiFgz6B3K4Qf9ABjziH0gJh/0DKfq4f8C1f+QfQEo//+Cnf1t/AFGZQwaktm6jAAAAAElFTkSuQmCC";
    }
    _create = function() {
        outer = document.createElement("div");
        var inner = document.createElement("div"),
        outS = outer.style,
        inS = inner.style,
        inH = size * (go12 ? 12 : 3);
        outer.className = inner.className = "escapes-gpu-disabled";
        outer.style.cssText = "z-index:1000; position: fixed; left:50%; top:50%;margin-left:" + Math.round(size / -2) + "px; margin-top:" + Math.round(size / -2) + "px;width:" + size + "px; height:" + size + "px; overflow:hidden;";
        inner.style.cssText = "position:absolute; left:0px; top:0px;width:" + size + "px; height:" + inH + "px;background-image: url(" + uri + ");background-size:" + size + "px " + inH + "px;";
        outer.appendChild(inner);
        document.body.appendChild(outer);
        spinerval = setInterval(go12 ?
        function() {
            inS.top = -(pos = (pos + 1) % 12) * size + "px"
        } : function() {
            pos = (pos + 1) % 12;
            inS.top = -(pos % 3) * size + "px";
            outS.webkitTransform = outS.msTransform = outS.MozTransform = outS.OTransform = outS.transform = "rotate(" + (Math.floor(pos / 3) * 90) + "deg)"
        },
        56);
    };
    _remove = function() {
        clearInterval(spinerval);
        $(outer).remove();
        /*if (outer.parentNode) {
            outer.parentNode.removeChild(outer)
        }*/
        
    }

    return {
        create: _create,
        remove: _remove
    }

})();

//UI TOOLS =======================
var _loadingTipHtml = '<div class="loading-tip">' + '<img src="/static/img/loading/loading_1.gif"/>' + 'Loading...' + '</div>'

exports.preLoadingTip = function() {

    $('.async-loading-ui').html(_loadingTipHtml);
}
exports.unloading = function(){
    $('#busyIcon').hide();
		this.unShade();
}
exports.loading = function(){
    this.shade();
    $('#busyIcon').show();
}
exports.getViewHeight = function(noHeader) {

    var docH = document.body.clientHeight;
    return docH;
};

exports.enableMode = function() {
    // $('.mob-wrap').hide();
    // $('.mob-wrap').css('position', 'absolute');
    $('html, body').css({
        height: 'auto',
        overflow: 'auto'
    });
};
exports.disableMode = function() {
    // $('.mob-wrap').show();
    // $('.mob-wrap').css('position', 'relative');
    $('html, body').css({
        height: '100%',
        overflow: 'hidden'
    });
};
exports.transitionBind = function(tar, cbfn, isOnce) {
    //====== about CSS3 ANIMATION HELPER ==================
    var $tar = $(tar);
    var ANIMATION_END_NAMES = {
        "Moz": "transitionEnd",
        "webkit": "webkitTransitionEnd",
        "ms": "MSTransitionEnd",
        "O": "oTransitionEnd"
    };

    if (!isOnce) {
        _bind();
    } else {
        _onceBind();
    }

    function _bind() {
        if (util.br.isWebkit) {
            $tar.on('webkitTransitionEnd',
            function(event) {
                cbfn();
            });
        } else {
            $tar.on('transitionEnd',
            function(event) {
                cbfn();
            });
        }
    }

    function _onceBind(argument) {
        $.each(ANIMATION_END_NAMES,
        function(k, v) {
            if (util.br.isWebkit) {
                $tar.one('webkitTransitionEnd',
                function(event) {
                    cbfn();
                    $tar.unbind('webkitTransitionEnd', cbfn);
                });
            } else {
                $tar.one('transitionEnd',
                function(event) {
                    cbfn();
                    $tar.unbind('transitionEnd', cbfn);
                });
            }
        });
    }
};
exports.animationBind = function(tar, cbfn, once) {
    var $tar = $(tar);
    var ANIMATION_END_NAMES = {
        "Moz": "animationend",
        "webkit": "webkitAnimationEnd",
        "ms": "MSAnimationEnd",
        "O": "oAnimationEnd"
    };

    if (!once) {
        _bind();
    } else {
        _onceBind();
    }

    function _bind() {
        $.each(ANIMATION_END_NAMES,
        function(k, v) {
            $tar.get(0).addEventListener(v,
            function(event) {
                cbfn();
            });
        });
    }

    function _onceBind(argument) {
        $.each(ANIMATION_END_NAMES,
        function(k, v) {
            $tar.get(0).addEventListener(v,
            function(event) {
                cbfn();
            });
        });

        _onceBind = null;
    }
};

exports.addEffect = function($tar, className, fn, time) {
    $tar.addClass(className);
    if (!fn) {
        return;
    }
    time ? setTimeout(function() {
        fn();
    },
    time) : fn();
};

exports.removeEffect = function($tar, className, fn, time) {
    $tar.removeClass(className);
    if (!fn) {
        return;
    }
    time ? setTimeout(function() {
        fn();
    },
    time) : fn();
};

exports.initQuicknav = function(){

    var enableList = [
        'help', 
        'case',
        'me',
        'order',
        'chat',
        'package',
        'record',
        'tel',
        'clinic',
        'success',
        'comment',
        'commented'
    ];
    //setTimeout(function(){
        //if(util.inArray(user.path, enableList)){
            //var eStyle = util.addStyleCSS('#menu ~ .items li {visibility: hidden;}');
            //require.async('/static/scripts/widgets/quicknav/pageMain.js', function(main){
                //main.init(eStyle);
            //});
        //}
    //});       
};

var defaultOpts = {
	showCls : 'md-show',
	hideCls: 'opacity0',
	title: "提示",
	text: "",
	defaultFn: function() {
		var that = this;
		this.el.removeClass(this.options.showCls).addClass(this.options.hideCls);
		var txt = this.el.find("textarea");
		if (txt.length > 0) {
			txt.val("");
		}
		setTimeout(function() {
			that.el.addClass("before-show");
		},300);

		HIT.ui.unmask();
	},
	okText: "确定",
	okFn: null,
	cancelText: "取消",
	cancelFn: null
};

function base (templateId,options,type) {

	this.inited = false;
	this.el = $("<div class='md-modal md-effect-14 before-show'></div>");

	this.templateId = templateId;
	this.options = $.extend({},defaultOpts,options);
	//需要额外维护一个初始状态
	this._defaultOpts = $.extend({},defaultOpts,options);
	this.type = type ? type : "prompt";
}

base.prototype.init  = function() {

	var that = this;
	if ( !this.inited ) {

		this.inited = true;
		this.el.append( $(this.templateId).html() ).appendTo($(document.body));

		this.el.hammer().on("tap",function(e) {
			var target = $(e.target);
			var fname = target.data("fn");
			if (fname) {
				var fn = that.options[fname];
				if($.type(fn) === "function" ) {

					var txt = that.el.find("textarea");
					if ( txt.length > 0) {
						that.val = txt.val();
					}
					fn.call(that,target);

				}
				if ($.type(that.options["defaultFn"]) === "function") {
					that.options["defaultFn"].call(that,target);
				}
			}
		});
	}
	HIT.ui.mask();

	this.el.find("[data-role]").each(function(index,element) {
		var role = $(this).data("role");
		$(this).html(that.options[role]);
	});

	this.el.removeClass(this.options.hideCls + " before-show").addClass(this.options.showCls);

}

//参数的设置照实际使用中情况来
base.prototype.setOptions = function() {
	var args = Array.prototype.slice.call( arguments );
	var len = args.length;

	//清除上次的状态。
	this.options = $.extend({},this._defaultOpts);

	if (len == 1) {
		if($.type(args[0]) === "string") {
			this.options["text"] = args[0];

			//隐藏cancel按钮
			if (this.type === "alert") {
				this.options["okText"] = "知道了";
			}

		}
		if($.type(args[0]) === "object") {
			this.options = $.extend({},this._defaultOpts,args[0]);
		}
	}

	if (len == 2) {
		if($.type(args[0] === "string")) {
			this.options["text"] = args[0];
		}
		if($.type(args[1] === "function")) {
			this.options["okFn"] = args[1];
		}
	}

	this.init();

	if (len == 1 && this.type === 'alert' && $.type(args[0]) === 'string') {
		this.el.find("[data-role='cancelText']").addClass("hide");
	}
};

exports.prompt = (function() {
	var prompt =  new base("#prompt-tpl",{});
	return function() {
		var args = arguments;
		prompt.setOptions.apply(prompt,args);
	};
})();

exports.alert = (function() {
	var alert =  new base("#alert-tpl",{
		okText: "好的",
		cancelText: "不了"
	},"alert");
	return function() {
		var args = arguments;
		alert.setOptions.apply(alert,args);
	};
})();

});