/**
 * * 请求路径 - app
 */
require('../action/call-analysis-controller');
import call_record_privilegeConst from '../../public/privilege-const'

module.exports = {
    module: 'call_record/server/action/call-analysis-controller',
    routes: [
        { // 获取单次通话时长为top10的数据
            'method': 'post',
            'path': '/rest/call/duration/top/ten/:type/:start_time/:end_time/:page_size/:sort_field/:sort_order',
            'handler': 'getCallDurTopTen',
            'passport': {
                'needLogin': true
            },
            'privileges': [call_record_privilegeConst.CURTAO_CRM_TRACE_QUERY_ALL]
        }, { // 获取通话数量和通话时长趋势图统计
            'method': 'post',
            'path': '/rest/call/duration/count/:start_time/:end_time',
            'handler': 'getCallCountAndDur',
            'passport': {
                'needLogin': true
            }
        }, { // 分别获取各团队通话数量和通话时长趋势图统计
            'method': 'post',
            'path': '/rest/call/duration/count/seperately/:start_time/:end_time',
            'handler': 'getCallCountAndDurSeperately',
            'passport': {
                'needLogin': true
            }
        },
        { // 获取电话的接通情况
            'method': 'post',
            'path': '/rest/call/info',
            'handler': 'getCallInfo',
            'passport': {
                'needLogin': true
            },
            'privileges': []
        }, { // 获取通话记录中，114占比统计
            'method': 'post',
            'path': '/rest/call/rate/:start_time/:end_time',
            'handler': 'getCallRate',
            'passport': {
                'needLogin': true
            }
        }, { // 获取成员信息
            'method': 'get',
            'path': '/rest/get/sale/member/:type',
            'handler': 'getSaleMemberList',
            'passport': {
                'needLogin': true
            }
        }, { //获取通话数量和时长的统计数据
            'method': 'get',
            'path': '/rest/call/interval_data/:authType',
            'handler': 'getCallIntervalData',
            'passport': {
                'needLogin': true
            }
        }, { // 获取通话总次数、总时长为top10的数据
            'method': 'get',
            'path': '/rest/call/total/count_time/:authType',
            'handler': 'getCallTotalList',
            'passport': {
                'needLogin': true
            }
        }, { // 获取通话客户的地域和阶段分布
            'method': 'get',
            'path': '/rest/call/zone/stage/:authType',
            'handler': 'getCallCustomerZoneStage',
            'passport': {
                'needLogin': true
            }
        }
    ]
};