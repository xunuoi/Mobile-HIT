define('config', function(require, exports, module){
var util = require('util');
require('model');
//Model 设置 ===================================

window.Store = {};
Store.Record = Model.setup(
'Record', 
[
  'comment',
  'comment_time',
  'create_time',
  'update_time',
  'description',
  'diagnostic',
  'diagnostic_time',
  'finish_time',
  'update_time',

  'doctor',

  'id',
  'package_Id',
  'is_paid',
  'payment_id',
  'payment_time',
  
  'product_type',
  'price',
  'rank',
  'status'
]);

//将获取的records信息存入内存中
$.subscribe('MODEL-RECORD-LOAD', function(event, records) {
    Store.Record.clear();
    records ? Store.Record.createMulti(records) : '';
});
$.subscribe('MODEL-ORDER-LOAD', function(event, records) {
    Store.Order.clear();
    records ? Store.Order.createMulti(records) : '';
});
//END =================================================

//配置

//服务类型映射表   HIT.CONFIG.Dict
var dict = exports.dict = {
    'routeFilter': {
        'order': ['open_id', 'forge_id']
    },
    //基本类型服务映射
    'inquiry': {
        "pending": "问诊中",
        "processing": "问诊中",
        "resolved_by_patient": "待结诊",
        "resolved_by_doctor": "待支付",
        "paid": "待评价",
        "paying": "支付中",
        "completed": "待评价",
        "commented": "已评价",
        "migrated": "已转诊"
    },
    'teleinquiry': {
        "pending": "待支付",
        "processing": "等待确认",
        "paid": "待预约",
        "paying": "支付中",
        "completed": "待评价",
        "commented": "已评价",
        "accepted": "已预约",
        "rejected": "已拒绝",
        "canceled": "已取消"
    },
    'clinic': {
        "pending": "待支付",
        "processing": "等待确认",
        "paid": "待预约",
        "paying": "支付中",
        "completed": "待评价",
        "commented": "已评价",
        "accepted": "已预约",
        "rejected": "已拒绝",
        "canceled": "已取消"
    },
    'package': {
        "pending": "待支付",
        "processing": "使用中",
        "paid": "待使用",
        "paying": "支付中",
        "completed": "已评价",
        "canceled": "已取消"
    },
    //类型状态

    'caseType': {     
        '1': '检查化验单',
        '2': '体征照片',
        '3': '病历',
        '4': '处方',
        '5': '未定义'
    },
    //进行中：0，已结束：1，已结诊：2，已支付：3，已评论：4
    'recordStatus': {
        "pending": "等待处理",
        "processing": "处理中",
        "resolved_by_patient": "患者结诊",
        "resolved_by_doctor": "医生结诊",
        "paid": "已支付",
        "completed": "已完成",
        "commented": "已评论",
        "accepted": "已接受",
        "rejected": "已拒绝",
        "canceled": "已取消"
    },
    'serviceType': {
        "inquiry": "在线问诊",
        "teleinquiry": "电话问诊",
        "clinic": "门诊预约",
        "package": "综合服务"
    },
    //对外呈现
    'express': {
        'icon': {
            "package" : "/static/img/icon/icon2.png",
            "综合服务" : "/static/img/icon/icon2.png",
            "inquiry" : "/static/img/icon/icon3.png",
            "在线问诊" : "/static/img/icon/icon3.png",
            "clinic": "/static/img/icon/icon4.png",
            "门诊预约": "/static/img/icon/icon4.png",
            "预约门诊": "/static/img/icon/icon4.png",
            "teleinquiry" : "/static/img/icon/icon.png",
            "电话问诊" : "/static/img/icon/icon.png",

            '电话咨询': '/static/img/icon/yishi/1.png',
            '养生餐茶': '/static/img/icon/yishi/2.png',
            '在线咨询': '/static/img/icon/yishi/3.png',
            '整脊治疗': '/static/img/icon/yishi/4.png',
            '中医面诊': '/static/img/icon/yishi/5.png'
        },
        'icon-for-buy': {
            "package" : "/static/img/casefolder_menu/fuwubao.png",
            "inquiry" : "/static/img/casefolder_menu/talk.png",
            "clinic": "/static/img/casefolder_menu/talk.png",
            "teleinquiry" : "/static/img/casefolder_menu/icon-phone.png"
        },
        'guide': {
            'order': '/static/img/guide/g0.png'
        },

        getICON: function(name){
            var standardName = name.replace(/(（.*）)|([A-Za-z])/g, '').split(' ')[0];
            return this.icon[standardName];
        }
    }

};

var SITUATION = {
    //益士医疗，服务配置 ===================
    'yishi': {
        doctor_id: [ 119, 120, 121, 122, 123 ],
        'express': {
            'guide': {
                'order': '/static/img/guide/g0.png'
            } 
        } 
    }
    //END ==============================
};

// busineess tools ============== =====
function checkSituation (where, _USER){
    return util.inArray(_USER.data.doctor_id, SITUATION[where].doctor_id);
};
function setupConfig (_USER){
    if(checkSituation('yishi', _USER)){
        //重写服务模板文字配置
        // dict['serviceType'] = SITUATION['yishi']['serviceType'];
        $.extend(dict['express'], SITUATION['yishi']['express']);
    }
};
//订阅场景检测事件
$.subscribe('SITUATION-CHECK', function(event, _USER) {
    setupConfig(_USER);
});


});