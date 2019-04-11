/**
 * * 请求路径 - app
 */
require('../action/weekly-report-controller');

module.exports = {
    module: 'weekly_report/server/action/weekly-report-controller',
    routes: [{ // 获取成员信息
        'method': 'get',
        'path': '/rest/get/sale/member/:type',
        'handler': 'getSaleMemberList',
        'passport': {
            'needLogin': true
        }
    }, { // 获取电话的接通情况
        'method': 'post',
        'path': '/rest/weekly_report/call/info',
        'handler': 'getCallInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, { // 获取合同信息
        'method': 'post',
        'path': '/rest/weekly_report/contract/info/:type',
        'handler': 'getContractInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, { // 获取回款信息
        'method': 'post',
        'path': '/rest/weekly_report/repayment/info/:type',
        'handler': 'getRepaymentInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, { // 获取区域覆盖信息
        'method': 'post',
        'path': '/rest/weekly_report/region/overlay/info/:type',
        'handler': 'getRegionOverlayInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, { // 获取销售阶段统计
        'method': 'post',
        'path': '/rest/weekly_report/customer/stage/info/:type',
        'handler': 'getCustomerStageInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }
    ]
};
