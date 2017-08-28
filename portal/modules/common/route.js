const geoUrl = "/rest/geo/service/v1/";
const customerUrl = "/rest/customer/v2/customer/";
const userAnalysisUrl = "/rest/analysis/user/v1/";
const contractAnalysisUrl = "/rest/analysis/contract/contract/";
const teamUrl = "/rest/base/v1/group/";
const customerCommonAnalysisUrl = "/rest/analysis/customer/v1/common/";
const customerManagerAnalysisUrl = "/rest/analysis/customer/v1/manager/";

module.exports = [{
    "method": "get",
    "path": geoUrl + "districts/search",
    "handler": "getAreaData",
    "passport": {
        "needLogin": true
    }
}, {
    "method": "get",
    "path": geoUrl + "poi/search",
    "handler": "getGeoInfo",
    "passport": {
        "needLogin": true
    }
}, {
    "method": "get",
    "path": userAnalysisUrl + ":type/:property",
    "handler": "getUserAnalysisData",
    "passport": {
        "needLogin": true
    }
}, {
    "method": "get",
    "path": contractAnalysisUrl + ":type/:property",
    "handler": "getContractAnalysisData",
    "passport": {
        "needLogin": true
    }
}, {
    "method": "get",
    "path": teamUrl + "myteam",
    "handler": "getTeamList",
    "passport": {
        "needLogin": true
    }
}, {
    "method": "get",
    "path": customerUrl + "upload/confirm/:flag",
    "handler": "uploadCustomerConfirm",
    "passport": {
        "needLogin": true
    }
}, {
    "method": "get",
    "path": customerCommonAnalysisUrl + ":type/:property",
    "handler": "getCustomerCommonAnalysisData",
    "passport":{
        "needLogin": true
    },
    "privileges":[
        "CUSTOMER_ANALYSIS_COMMON"
    ]
}, {
    "method": "get",
    "path": customerManagerAnalysisUrl + ":type/:property",
    "handler": "getCustomerManagerAnalysisData",
    "passport":{
        "needLogin": true
    },
    "privileges":[
        "CUSTOMER_ANALYSIS_MANAGER"
    ]
}];
