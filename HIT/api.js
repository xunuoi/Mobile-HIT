;
define('api', function(require, exports, module) {
var ctrl = {}

ctrl.apiTo = function(argObj) {
  var typedData = {
    forge_id: HIT.USER.info['AccountId'],
    openid: HIT.USER.info['OpenId'],
    ticket: HIT.util.getTicket(),

    data: argObj.data
  };
  //设置url
  //强制指定到正式服务器；
  var hashObj = HIT.util.getHashObj(location.hash) || {};

  var apiUrl = api._getBaseAPIURL();
  var apiFnName = argObj.data.url;

  //加入正在请求标识
  api._requestBase[apiFnName] = true;
  /**
  如果启用本地接口数据
  **/
  if (HIT._dataFromStorage || hashObj.api_off) {
    delete api._requestBase[apiFnName];

    var sData = HIT.storage.getApiFromStore(apiFnName);
    argObj.done(sData);
    api.pubCache(apiFnName);
    return;
  }
  function _onSuccess(data){
      delete api._requestBase[apiFnName]

      argObj.done(data)
      api.pubCache(apiFnName)
      //HIT SRORE
      HIT.storage.storeApi(apiFnName, data)
      //清理_apiData，避免过期
      delete _apiData[apiFnName]
  }
  //如果数据从bigPipe进入
  if(_apiData[apiFnName]){
    $.logon(_apiData[apiFnName]);
    _onSuccess(_apiData[apiFnName]);
    $.log(apiFnName+': Get API Data From Pipe');
  }else {
    $.ajax({
      url: apiUrl,
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify(typedData),
      success: _onSuccess,
      error: function(err) {
        delete api._requestBase[apiFnName];
        argObj.fail ? argObj.fail(err) : '';
        $.log(err);
        HIT.ui.alert('服务器错误: ' + err.status + ' ' + err.statusText);
      }
    });
  }
};

var api = {
  'envError': function(e) {
    HIT.ui.alert('用户信息错误或不完整');
    return false;
  },
  _cache: function(apiName, data) {
    if (arguments.length == 1)
      return HIT.CACHE[apiName];

    HIT.CACHE[apiName] = data;

  },
  _subCacheFnBase: {},
  //订阅缓存，回调函数存贮
  subCache: function(apiName, fn) {
    this._subCacheFnBase[apiName] ?
      this._subCacheFnBase[apiName].push(fn) :
      this._subCacheFnBase[apiName] = [fn];
  },
  //正在请求中
  _requestBase: {},
  inRequest: function(apiName) {
    return this._requestBase[apiName];
  },
  autoCall: function(apiName, fn) {
    var data = HIT.CACHE[apiName];
    if (data) //已经获取了数据
      fn(data)
    else if (this.inRequest(apiName)) //如果再请求中，订阅并加入队列
      this.subCache(apiName, fn);
    else //如果从未请求，那么发起请求
      this[apiName](fn);
  },
  pubCache: function(apiName) {
    var q = this._subCacheFnBase[apiName],
      Data = HIT.CACHE[apiName];
    if (!q) {
      return;
    }
    var len = q.length;
    for (var i = 0; i < len; i++) {
      var fn = q[i];
      fn(Data);
    }
  },
  //问诊记录和发起结束等有关接口
  //获取所有问诊
  'GetRecords': function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/record/history',
      }, apiObj.data),
      done: function(data) {
        //接口数据缓存
        api._cache('GetRecords', data);
        //RECORD 储存入内存
        $.publish('MODEL-RECORD-LOAD', [data.data]);

        apiObj.cb ? apiObj.cb(data) : '';
      }

    });
  },
  //立即使用接口

  'toUseDeliver': function(apiObj){
  	 ctrl.apiTo({
      data: $.extend({
        url: '/product/deliver',
      }, apiObj.data),
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      }

    });
  },
  'GetCurrentRecords': function(cb) {
    this.autoCall('GetRecords', function(data) {
      var curR = [];
      var records = data.data;
      // console.log(records)
      records ? $.each(records, function(eq, cur) {
        if (cur.Status == 0) {
          curR.push(cur);
        }
      }) : '';

      cb(curR);
    });

  },
  'GetRecordChats': function(apiObj) {
    ctrl.apiTo({
      // api: '/GetRecordChats',
      data: $.extend({
        'url': '/record/show'
      }, apiObj.data),

      done: function(data) {
        // $.log( data)
        apiObj.cb ? apiObj.cb(data) : '';
      }

    });
  },
  'CommentRecord': function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/record/comment'

      }, apiObj.data),

      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
      }
    });
  },
  //病历相关信息接口apiObj
  'GetPatientAttachments': function(apiObj) {

    ctrl.apiTo({
      // api: '/GetPatientAttachments',
      data: $.extend({
        url: '/attachment/timeline',
      }, apiObj.data),

      done: function(data) {
        api._cache('GetPatientAttachments', data);
        apiObj.cb ? apiObj.cb(data) : '';
      }
    });

  },

  'DeletePatientAttachment': function(apiObj) {
    ctrl.apiTo({
      // api: '/DeletePatientAttachment',
      // data: apiObj.data,
      data: $.extend({
        url: '/attachment/destroy',
      }, apiObj.data),
      done: function(data) {

        apiObj.cb ? apiObj.cb(data) : '';
      }
    });

  },
  'UpdatePatientAttachment': function(apiObj) {
    ctrl.apiTo({
      // api: '/UpdatePatientAttachment',
      // data: apiObj.data,
      data: $.extend({
        'url': '/attachment/update'
      }, apiObj.data),
      done: function(data) {

        apiObj.cb ? apiObj.cb(data) : '';
      }
    });
  },
  /* UN-USED*/
  'Register': function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/patient/register'
      }, apiObj.data),
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
      }
    });
  },
  'GetMobileCode': function(apiObj) {
    ctrl.apiTo({
      // api: '/GetMobileCode',
      data: $.extend({
        url: '/mobile/captcha'
      }, apiObj.data),
      done: function(data) {

        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
      }
    });
  },
  'GetPatient': function(apiObj) {
    ctrl.apiTo({
      data: {
        url: '/patient/profile'
      },
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
      }
    });
  },
  'UpdatePatient': function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/patient/update_profile'
      }, (apiObj.data || HIT.USER.info)),

      done: function(data) {
        $.log(data)
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
      }
    });
  },
  'Login': function(apiObj) {
    ctrl.apiTo({
      api: '/Login',
      data: apiObj.data,
      done: function(data) {

        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
      }
    });
  },

  CreatePatientAttachment: function(apiObj){
      ctrl.apiTo({
    			data: $.extend({
					    url: '/attachment/create'
					    // rul /upload/attachment_as_base64
					}, apiObj.data),
          done: function(data){
              apiObj.cb ? apiObj.cb(data) : '';
          },
          fail: function(e){
              apiObj.fail ? apiObj.fail(e) : '';
              alert('Server or Network Error');
          }

    });
  },
  UploadB64Img: function(apiObj){
      ctrl.apiTo({
        data: $.extend({
            'url': '/upload/attachment_as_base64'
        }, apiObj.data),
        done: function(data){
            apiObj.cb ? apiObj.cb(data) : '';
        },
        fail: function(e){
            apiObj.fail ? apiObj.fail(e) : '';
            alert('Server or Network Error');
        }
      });
  },
  Contact: function(apiObj) {
    ctrl.apiTo({
      api: '/Contact',
      data: apiObj.data,
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
        alert('Server or Network Error');
      }

    });
  },
  //feedback interface
  Feedback: function(apiObj) {
    ctrl.apiTo({
      // api: '/Feedback',/feedback/create
      data: $.extend({
        url: '/feedback/create'
      }, apiObj.data),
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
        alert('Server or Network Error');
      }

    });
  },
  GetProduct: function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/product/show'
      }, apiObj.data),
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
        alert('Server or Network Error');
      }
    });
  },
  Purchase: function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/product/purchase'
      }, apiObj.data),
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
        alert('Server or Network Error');
      }

    });
  },
  GetDoctorTime: function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/timetable/show'
      }, apiObj.data),
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      },
      fail: function(e) {
        apiObj.fail ? apiObj.fail(e) : '';
        alert('Server or Network Error');
      }
    });
  },
  //提交电话预约
  CreateTelAppointment: function(apiObj) {
    ctrl.apiTo({
      data: $.extend({
        url: '/timetable/apply'
      }, apiObj.data),
      done: function(data) {
        apiObj.cb ? apiObj.cb(data) : '';
      }
    });
  },

  _getBaseAPIURL: function(){
    if(!_isTestServer){
      return 'http://message.api.vzhen.com/v1/sandbox';
    }else {
      return 'http://message.api.staging-fangmingyi.com/v1/sandbox';
    }
  },
  _getUploadURL: function(){
    var uploadUrl = "http://message.api.vzhen.com/v1/web?url=uaaf";
    if(_isTestServer){
        uploadUrl = "http://message.api.staging-fangmingyi.com/v1/web?url=uaaf";
    }
    return uploadUrl;
  }
};

function newApi(url,opts) {
	var baseUrl = _isTestServer ? "http://staging-open.vzhen.com/api_v1/sandbox" : "http://open.vzhen.com/api_v1/sandbox";
	var re = /hash(?:=)([^=& ]+)/g;
	var hash = re.exec(location.search)[1];

	var typedData = {
		"head" : {
			forge_id: HIT.USER.info['AccountId'],
			openid: HIT.USER.info['OpenId'],
			ticket: HIT.util.getTicket()
		},
		"body" : {
			"url": url,
			"hash":hash
		}
	};
	$.extend(typedData.body,opts || {});
	return $.ajax({
		url: baseUrl,
		dataType: 'json',
		type: 'POST',
		data: JSON.stringify(typedData),
	});
};

exports.api = api;
exports.newApi = newApi;
exports.apiTo = ctrl.apiTo;
});

