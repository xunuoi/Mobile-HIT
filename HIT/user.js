define('user', function(require, exports, module){
var util = require('util'),
    config = require('config');

function User(_uData) {
    this.data =  _uData || {};

    this.info = {
        'AccountId': this.data['forge_id'],
        'OpenId': this.data['open_id']
    };
    /*var href = location.href,
        pList = href.match(/\/view(-staging)?\/(\w)*\//g),
        path;*/

    //pList ? path = pList[0].replace(/\/[\w-], '') : '';*/
    /**
     * some bro has bug pathname == all href
     * @type {[type]}
     */
    var pathList = location.pathname.split('/') || [];
    this.path = pathList[1];
    this.dataHref = location.href;
}
function setup (done, fail) {

    HIT.API.GetPatient({
        cb: function(data) {
            if (data.state == 'success') {
                user.info['IsRegistered'] = data.data.patient.name ? true: false;
                //这里将patien数据全部获取
                $.extend(user.info, data.data.patient);
                //执行回调
                done ? done(data) : '';
            } else {
                alert('服务器或网络错误，请重试');
                console.log(data.error.message);
            }

        },
        fail: function(data) {
            alert('用户信息获取失败，请确认您从微信进入。');
            done ? done(data) : '';
        }
    });
}
User.prototype.setup = setup;

var _userData = util.urlToObj(location.search);
_userData.doctor_id ? _userData.doctor_id = parseInt(_userData.doctor_id) : '';

var user = new User(_userData);

module.exports = user;

});