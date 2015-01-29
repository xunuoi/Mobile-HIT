define('view', function(require, exports, module){

var _viewBase = { };
exports.active = function(view) {
  HIT.view.current = view._viewID;
};
/**
 * judge is the current view
 * @param  {[Object|String]}  _viewId [description]
 * @return {Boolean}         [description]
 */
exports.isActive = function(view) {
  // $.log(arguments.callee.caller)
  if (typeof view == 'string') {
    _viewId = view;
  } else {
    _viewId = view._viewId;
  }

  return HIT.view.current == _viewId;
};
exports.viewBase = _viewBase;

});