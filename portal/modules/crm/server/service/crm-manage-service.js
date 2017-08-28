"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var _ = require("underscore");

//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;

var crmRestApis = {
    customer: "/rest/customer/v2/customer",
    list: "/rest/customer/v2/customer/all",
    query: "/rest/customer/v2/customer/range",
    managerQuery: "/rest/customer/v2/customer/range/manager",
    dynamic: "/rest/customer/v2/customerdynamic",
    upload: "/rest/customer/v2/customer/upload/preview",
    repeatCustomer: "/rest/customer/v2/customer/query/repeat",
    delRepeatCustomer: "/rest/customer/v2/customer/delete",
    getCustomerById: "/rest/customer/v2/customer/query/1/name/descend",
    mergeRepeatCustomer: "/rest/customer/v2/customer/merge/customer",
    checkCustomerRepeat: "/rest/customer/v2/customer/repeat/search",
    getFilterIndustries: "/rest/customer/v2/customer/industries",
    // 查询客户精确匹配（通话记录中查询客户详情）
    getCustomerByPhone: "/rest/customer/v2/customer/query/term/customer",
    // 根据客户的id查询客户详情
    getQueryCustomerById: "/rest/customer/v2/customer/query",
    //根据客户名获取行政级别
    getAdministrativeLevel: "/rest/customer/v2/customer/administrative_level/:customer_name",
    basic: {
        //修改客户名
        updateName: "/rest/customer/v2/customer/name",
        //修改客户标签
        updateLabel: "/rest/customer/v2/customer/label/",
        //修改客户地域
        updateAddress: "/rest/customer/v2/customer/address",
        //更新客户行业
        updateIndustry: "/rest/customer/v2/customer/industry",
        //更新客户备注
        updateComment: "/rest/customer/v2/customer/remark",
        //修改客户所属销售（团队）
        updateSales: "/rest/customer/v2/customer/sales",
        //修改客户的行政级别
        updateAdministrativeLevel: "/rest/customer/v2/customer/administrative_level",
        //修改客户的详细地址
        updateDetailAddress: "/rest/customer/v2/customer/detail_address",
        //关注或者取消关注某客户
        updateInterest: "/rest/customer/v2/customer/interest",
    },
    // 拨打电话
    callOut: '/rest/customer/v2/phone/call/ou',
    // 获取电话座机号
    getUserPhoneNumber: '/rest/base/v1/user/member/phoneorder',
    // 根据线索筛选客户
    getCustomersByClue: "/rest/customer/v2/customer/range/clue"
};
exports.urls = crmRestApis;

//获取筛选面板的行业列表
exports.getFilterIndustries = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getFilterIndustries,
            req: req,
            res: res
        }, null);
};

//客户名、联系人电话唯一性的验证
exports.checkOnlyCustomer = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.checkCustomerRepeat,
            req: req,
            res: res
        }, req.query);
};

//获取客户列表
exports.getCustomerList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.list + "/" + req.params.pageSize + "/" + req.params.pageNum + "/id",
            req: req,
            res: res
        }, null);
};
//根据客户id获取客户
exports.getCustomerById = function (req, res, customerId) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.getCustomerById,
            req: req,
            res: res
        }, {
            id: customerId
        }, {
            success: function (eventEmitter, data) {
                let customer = null;
                if (_.isObject(data) && _.isArray(data.result) && data.result.length > 0) {
                    customer = data.result[0];
                }
                eventEmitter.emit("success", customer);
            }
        });
};
//获取重复的客户列表
exports.getRepeatCustomerList = function (req, res, queryParams) {
    let url = crmRestApis.repeatCustomer;
    if (queryParams && queryParams.page_size) {
        url += "?page_size=" + queryParams.page_size;
        if (queryParams.id) {
            url += "&id=" + queryParams.id;
        }
    }
    let filterObj = queryParams.filterObj ? JSON.parse(queryParams.filterObj) : {};
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, filterObj);
};
//删除重复客户
exports.deleteRepeatCustomer = function (req, res, customerIdArray) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.delRepeatCustomer,
            req: req,
            res: res
        }, customerIdArray);
};
//合并重复客户
exports.mergeRepeatCustomer = function (req, res, mergeObj) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.mergeRepeatCustomer,
            req: req,
            res: res
        }, mergeObj);

};

//查询客户
exports.queryCustomer = function (req, res, condition) {
    let url = "";
    let call_phone = condition && condition.call_phone;
    let id = condition && condition.id;
    delete condition.call_phone;
    let queryObj = {};
    if (call_phone) {  // 通话记录，查看客户详情
        url = crmRestApis.getCustomerByPhone + "/" + req.params.pageSize + "/" + req.params.sortFeild + "/" + req.params.sortOrder;
        queryObj = _.clone(condition);
    } else if (id) {  // 根据客户的id查询客户详情
        url = crmRestApis.getQueryCustomerById + "/" + req.params.pageSize + "/" + req.params.sortFeild + "/" + req.params.sortOrder;
        queryObj.id = id;
    } else {  // 客户列表
        let baseUrl = "";
        if(req.body.hasManageAuth) {
            baseUrl = crmRestApis.managerQuery;
        }else {
            baseUrl = crmRestApis.query;
        }
        //线索客户的筛选
        if(condition.exist_feilds||condition.unexist_feilds){
            baseUrl= crmRestApis.getCustomersByClue;
        }
        url = baseUrl + "/" + req.params.pageSize + "/" + req.params.sortFeild + "/" + req.params.sortOrder;
        var query = JSON.parse(req.body.queryObj);
        url += "?cursor=" +  query.cursor;
        if (query.id){
            url += "&id=" +  query.id;
        }
        if (query.total_size){
            url +="&total_size=" + query.total_size;
        };
        queryObj.query = condition;
        queryObj.rang_params = JSON.parse(req.body.rangParams);
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, queryObj);
};

//修改客户
exports.updateCustomer = function (req, res, newCustomer) {
    let type = newCustomer.type;
    let url = crmRestApis.basic.updateComment;
    switch (type) {
        case "name":
            url = crmRestApis.basic.updateName;
            break;
        case "label":
            let labels = encodeURI(newCustomer.labels) || "null";
            url = crmRestApis.basic.updateLabel + labels;
            //修改标签时，body里传[id]
            newCustomer = [newCustomer.id];
            break;
        case "industry":
            url = crmRestApis.basic.updateIndustry;
            break;
        case "address":
            url = crmRestApis.basic.updateAddress;
            break;
        case "comment":
            url = crmRestApis.basic.updateComment;
            break;
        case "sales":
            url = crmRestApis.basic.updateSales;
            break;
        case "administrative_level":
            url = crmRestApis.basic.updateAdministrativeLevel;
            break;
        case "detail_address":
            url = crmRestApis.basic.updateDetailAddress;
        case "customer_interest":
            url = crmRestApis.basic.updateInterest;
    }
    delete newCustomer.type;
    return restUtil.authRest.put(
        {
            url: url,
            req: req,
            res: res
        }, newCustomer);
};

//添加客户
exports.addCustomer = function (req, res, newCustomer) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.customer,
            req: req,
            res: res
        }, newCustomer);
};

//删除客户
exports.deleteCustomer = function (req, res, ids) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.customer + "/delete",
            req: req,
            res: res
        }, ids);
};

//获取动态列表
exports.getDynamicList = function (req, res, customer_id) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.dynamic + "/" + customer_id + "/100",
            req: req,
            res: res
        }, null);
};
exports.uploadCustomers = function (req, res) {
    return restUtil.authRest.post({
        url: crmRestApis.upload,
        req: req,
        res: res,
        'pipe-upload-file': true,
        timeout: uploadTimeOut
    }, null);
};

//根据客户名获取行政级别
exports.getAdministrativeLevel = function (req, res, customerName) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getAdministrativeLevel.replace(":customer_name", customerName),
            req: req,
            res: res
        }, null);
};

// 拨打电话
exports.callOut = function (req, res, queryObj) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.callOut,
            req: req,
            res: res
        }, queryObj);
};

// 获取电话座机号
exports.getUserPhoneNumber = function (req, res, member_id) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getUserPhoneNumber,
            req: req,
            res: res
        }, member_id);
};
