/**
 * Created by wangliping on 2016/3/4.
 * * 请求路径 - app
 */
require('../action/call-record-controller');
import call_record_privilegeConst from '../../public/privilege-const'
module.exports = {
    module: 'call_record/server/action/call-record-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/call_record/:type/:start_time/:end_time/:page_size/:sort_field/:sort_order',
        'handler': 'getCallRecordList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    },{
        'method': 'post',
        'path': '/rest/invalid_call_record/:type/:start_time/:end_time/:page_size/:sort_field/:sort_order',
        'handler': 'getInvalidCallRecordList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        'method': 'put',
        'path': '/rest/call/edit/content',
        'handler': 'editCallTraceContent',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, { // 搜索电话号码号码时，提供推荐列表
        'method': 'post',
        'path': '/rest/call/search/phone_number/:filter_phone',
        'handler': 'getRecommendPhoneList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }
    ]
};