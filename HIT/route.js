define(function(require, exports, module) {

  if (location !== window.location) location = window.location;
  if (history !== window.history) history = window.history;

  var routes = {};
  var PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/;

  function inherit(parent, extra) {
    return $.extend(new($.extend(function() {}, {
      prototype: parent
    }))(), extra);
  }

  function pathRegExp(path) {
    ret = {
      originalPath: path,
      regexp: path
    },
    keys = ret.keys = [];

    path = path
      .replace(/([().])/g, '\\$1')
      .replace(/(\/)?:(\w+)([\?\*])?/g, function(_, slash, key, option) {
        var optional = option === '?' ? option : null;
        var star = option === '*' ? option : null;
        keys.push({
          name: key,
          optional: !! optional
        });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star && '(.+?)' || '([^/]+)') + (optional || '') + ')' + (optional || '');
      })
      .replace(/([\/$\*])/g, '\\$1');

    ret.regexp = new RegExp('^' + path + '$', 'i');
    return ret;
  }

  /*
   * @param on {string} current url
   * @param route {Object} route regexp to match the url against
   * @return {?Object}
   *
   * @description
   * Check if the route matches the current url.
   *
   * Inspired by match in
   * visionmedia/express/lib/router/router.js.
   */
  function switchRouteMatcher(on, route) {
    var keys = route.keys,
      params = {};

    if (!route.regexp) return null;

    var m = route.regexp.exec(on);
    if (!m) return null;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];

      var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];

      if (key && val) {
        params[key.name] = val;
      }
    }
    return params;
  }

  function parseKeyValue(params) {
		var rx = /([^=]*)(?:=)([^=]*)/ig;
		var obj = {};
		params.replace(rx,function($0,$1,$2) {
			obj[decodeURIComponent($1)] = decodeURIComponent($2);
		});
		return obj;
  }

  function Route() {
    var self = this;
    var lastBrowserUrl = location.href;
    /**
     * @returns {Object} the current active route, by matching it against the URL
     */
    function parseRoute() {
      var params, match, search,m;
      var rs = PATH_MATCH.exec(self.url());

      if (rs[2] || rs[1]) {
				m = rs[5].split("?");
        search = parseKeyValue(m[1] || '');
      }

      $.each(routes, function(path, route) {
        if (!match && (params = switchRouteMatcher(decodeURIComponent(m[0]), route))) {
          match = inherit(route, {
            params: $.extend({}, search, params),
            pathParams: params
          });
          match.$$route = route;
        }
      });
      // No route matched; fallback to "otherwise" route
      return match || routes[null] && inherit(routes[null], {
        params: {},
        pathParams: {}
      });
    }


    this.when = function(path, route) {
      if ($.isFunction(route)) {
        route = {
          callback: route
        };
      }
      routes[path] = $.extend({}, route, path && pathRegExp(path));
      return self;
    }

    this.otherwise = function(params) {
      this.when(null, params);
      return this;
    };

    this.url = function() {
      return location.href.replace(/%27/g, "'");
    };

    $(window).on("hashchange popstate", function() {
      if (lastBrowserUrl == self.url()) return;
      lastBrowserUrl = self.url();

			var match = parseRoute();
			if (match) {
				match["callback"].call(window,match["params"]);
			}
    });
  }

  var route = new Route();
  module.exports = route;
});
