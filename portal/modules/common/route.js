const geoUrl = '/rest/geo/service/v1/';
const customerUrl = '/rest/customer/v2/customer/';
const userAnalysisUrl = '/rest/analysis/user/v1/';
const contractAnalysisUrl = '/rest/analysis/contract/contract/';
const teamUrl = '/rest/base/v1/group/';
const customerCommonAnalysisUrl = '/rest/analysis/customer/v1/common/';
const customerManagerAnalysisUrl = '/rest/analysis/customer/v1/manager/';
const websiteConfigUrl = '/rest/base/v1/user/website/config';
const websiteModuleRecordConfigUrl = '/rest/base/v1/user/website/config/module/record';
const userAnalysisV3Url = '/rest/analysis/user/v3'; //  common（普通权限用户）manager（管理员权限）
const invalidPhone = '/rest/callrecord/v2/callrecord/invalid_phone';//获取或者添加无效电话

module.exports = [{
    'method': 'get',
    'path': geoUrl + 'districts/search',
    'handler': 'getAreaData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': geoUrl + 'poi/search',
    'handler': 'getGeoInfo',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': userAnalysisUrl + ':type/:property',
    'handler': 'getUserAnalysisData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': contractAnalysisUrl + ':type/:property',
    'handler': 'getContractAnalysisData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': teamUrl + 'myteam',
    'handler': 'getTeamList',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': customerUrl + 'upload/confirm/:flag',
    'handler': 'uploadCustomerConfirm',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': customerCommonAnalysisUrl + ':type/:property',
    'handler': 'getCustomerCommonAnalysisData',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        'CUSTOMER_ANALYSIS_COMMON'
    ]
},{
    'method': 'get',
    'path': customerManagerAnalysisUrl + ':type/:property',
    'handler': 'getCustomerManagerAnalysisData',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        'CUSTOMER_ANALYSIS_MANAGER'
    ]
},{
    'method': 'get',
    'path': '/rest/analysis/customer/stage/label/:type/summary',
    'handler': 'getCustomerStageAnalysis',
    'passport': {
        'needLogin': true
    },
}, {
    'method': 'post',
    'path': websiteConfigUrl + '/personnel',//创建（覆盖）个性化配置
    'handler': 'setWebsiteConfig',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        'MEMBER_WEBSITE_CONFIG'
    ]
}, {
    'method': 'post',
    'path': websiteModuleRecordConfigUrl,//是否点击过某个模块
    'handler': 'setWebsiteConfigModuleRecord',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        'MEMBER_WEBSITE_CONFIG'
    ]
}, {
    'method': 'get',
    'path': websiteConfigUrl,//获取网站个性化配置
    'handler': 'getWebsiteConfig',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        'MEMBER_WEBSITE_CONFIG'
    ]
}, {
    'method': 'get',//获取设备类型统计manager
    'path': userAnalysisV3Url + '/manager/device',
    'handler': 'getDeviceTypeBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',//获取设备类型统计common
    'path': userAnalysisV3Url + '/common/device',
    'handler': 'getDeviceTypeBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',//获取浏览器统计manager
    'path': userAnalysisV3Url + '/manager/browser',
    'handler': 'getBrowserBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',//获取浏览器统计common
    'path': userAnalysisV3Url + '/common/browser',
    'handler': 'getBrowserBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',//获取活跃用户省份统计manager
    'path': userAnalysisV3Url + '/manager/zone/province',
    'handler': 'getActiveZoneBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',//获取活跃用户省份统计common
    'path': userAnalysisV3Url + '/common/zone/province',
    'handler': 'getActiveZoneBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',//用户登录次数manager
    'path': userAnalysisV3Url + '/manager/logins/distribution/num',
    'handler': 'getUserLoginCountsDataBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',//用户登录次数common
    'path': userAnalysisV3Url + '/common/logins/distribution/num',
    'handler': 'getUserLoginCountsDataBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',//用户登陆时间manager
    'path': userAnalysisV3Url + '/manager/online_time/distribution/num',
    'handler': 'getUserLoginTimesDataBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',//用户登陆时间common
    'path': userAnalysisV3Url + '/common/online_time/distribution/num',
    'handler': 'getUserLoginTimesDataBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',// 用户登录天数manager
    'path': userAnalysisV3Url + '/manager/login/day/distribution/num',
    'handler': 'getUserLoginDaysDataBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',// 用户登录天数common
    'path': userAnalysisV3Url + '/common/login/day/distribution/num',
    'handler': 'getUserLoginDaysDataBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',// 用户在线时长manager
    'path': userAnalysisV3Url + '/manager/app/avg/online_time/trend',
    'handler': 'getUserOnlineTimeDataBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',// 用户在线时长common
    'path': userAnalysisV3Url + '/common/app/avg/online_time/trend',
    'handler': 'getUserOnlineTimeDataBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',// 用户未登录数manager
    'path': userAnalysisV3Url + '/manager/app/count/no_login',
    'handler': 'getOfflineUserDataBymanager',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',// 用户未登录数common
    'path': userAnalysisV3Url + '/common/app/count/no_login',
    'handler': 'getOfflineUserDataBycommon',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',//获取无效电话
    'path': invalidPhone,
    'handler': 'getInvalidPhone',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',//增加无效电话
    'path': invalidPhone,
    'handler': 'addInvalidPhone',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'delete',
    'path': customerUrl + 'upload/preview/:index',
    'handler': 'deleteDuplicatImportCustomer',
    'passport': {
        'needLogin': true
    }
}, {
    //获取迁出客户数据
    'method': 'post',
    'path': '/rest/customer/v2/customer/transfer/record/:page_size/:sort_field/:order',
    'handler': 'getTransferCustomers',
    'passport': {
        'needLogin': true
    }
}, {
    //获取客户阶段变更数据
    'method': 'post',
    'path': '/rest/customer/v2/customer/:type/customer/label/count',
    'handler': 'getStageChangeCustomers',
    'passport': {
        'needLogin': true
    }
}, {
    //获取客户阶段变更的客户数据
    'method': 'post',
    'path': '/rest/customer/v2/customer/query/label/record/:type/:page_size/:sort_field/:order',
    'handler': 'getStageChangeCustomerList',
    'passport': {
        'needLogin': true
    }
}, {     
    //获取各行业试用客户覆盖率
    'method': 'get',
    'path': '/rest/analysis/customer/v2/statistic/:type/industry/stage/region/overlay',
    'handler': 'getIndustryCustomerOverlay',
    'passport': {
        'needLogin': true
    }
}, {
    //获取销售新开客户数
    'method': 'get',
    'path': '/rest/analysis/customer/v2/statistic/:type/customer/user/new',
    'handler': 'getNewCustomerCount',
    'passport': {
        'needLogin': true
    }
}];