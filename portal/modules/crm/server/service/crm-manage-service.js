"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var _ = require("underscore");

//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;

var crmRestApis = {
    customer: "/rest/customer/v2/customer",
    //获取客户开通的用户列表
    getCrmUserList: "/rest/base/v1/user/customer/users",
    list: "/rest/customer/v2/customer/all",
    //我可以查看的客户列表（已分配销售的客户）
    query: "/rest/customer/v2/customer/range",
    //获取所有的客户列表（包括：未分配给销售的客户）
    managerQuery: "/rest/customer/v2/customer/range/manager",
    dynamic: "/rest/customer/v2/customerdynamic",
    upload: "/rest/customer/v2/customer/upload/preview",
    repeatCustomer: "/rest/customer/v2/customer/query/repeat",
    getRepeatCustomerById: "/rest/customer/v2/customer/:customerId",
    delRepeatCustomer: "/rest/customer/v2/customer/delete",
    getCustomerById: "/rest/customer/v2/customer/query/1/name/descend",
    mergeRepeatCustomer: "/rest/customer/v2/customer/merge/customer",
    checkCustomerRepeat: "/rest/customer/v2/customer/repeat/search",
    getFilterIndustries: "/rest/customer/v2/customer/industries",
    //获取阶段标签列表
    getStageTagList: "/rest/customer/v2/customer/customer_label/:type/50/1",
    //获取竞品列表
    getCompetitorList: "/rest/customer/v2/customer/competing_products/:type/100/1",
    //type:manager(管理员调用)，type:user(非管理员调用)
    getFilterProvinces: "/rest/customer/v2/customer/provinces/:type/40/1",
    // 查询客户精确匹配（通话记录中查询客户详情）
    getCustomerByPhone: "/rest/customer/v2/customer/query/term/customer",
    //根据客户名获取行政级别
    getAdministrativeLevel: "/rest/customer/v2/customer/administrative_level/:customer_name",
    //获取销售角色列表（type:manager、user）
    getFilterSalesRoleList: "/rest/customer/v2/customer/:type/member/role",
    basic: {//type:manager(管理员调用)，type:user(非管理员调用)
        //修改客户名
        updateName: "/rest/customer/v2/customer/:url_type/name",
        //修改客户标签
        updateLabel: "/rest/customer/v2/customer/:url_type/label",
        //修改客户地域
        updateAddress: "/rest/customer/v2/customer/:url_type/address",
        //更新客户行业
        updateIndustry: "/rest/customer/v2/customer/:url_type/industry",
        //更新客户备注
        updateComment: "/rest/customer/v2/customer/:url_type/remark",
        //修改客户所属销售（团队）
        updateSales: "/rest/customer/v2/customer/:url_type/sales",
        //修改客户的行政级别
        updateAdministrativeLevel: "/rest/customer/v2/customer/:url_type/administrative_level",
        //修改客户的详细地址
        updateDetailAddress: "/rest/customer/v2/customer/:url_type/detail_address",
        //关注或者取消关注某客户
        updateInterest: "/rest/customer/v2/customer/:url_type/interest",
        //转出客户
        transferCustomer: "/rest/customer/v2/customer/:url_type/transfer"
    },
    // 拨打电话
    callOut: '/rest/customer/v2/phone/call/ou',
    // 获取电话座机号
    getUserPhoneNumber: '/rest/base/v1/user/member/phoneorder',
    //获取客户是否还能继续添加客户 返回0是可以继续添加，返回大于0的值，表示超出几个客户
    getCustomerLimit: '/rest/customer/v2/customer/limit/flag',
};
exports.urls = crmRestApis;

exports.getCrmUserList = function (req, res, queryObj) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCrmUserList,
            req: req,
            res: res
        }, queryObj);
};
//获取筛选面板的行业列表
exports.getFilterIndustries = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getFilterIndustries,
            req: req,
            res: res
        }, null);
};
//获取筛选面板的销售角色列表
exports.getFilterSalesRoleList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getFilterSalesRoleList.replace(":type", req.params.type),
            req: req,
            res: res
        }, null);
};

//获取筛选面板的地域列表
exports.getFilterProvinces = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getFilterProvinces.replace(":type", req.params.type),
            req: req,
            res: res
        }, null);
};
//获取阶段标签列表
exports.getStageTagList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getStageTagList.replace(":type", req.params.type),
            req: req,
            res: res
        }, null);
};
//获取竞品列表
exports.getCompetitorList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCompetitorList.replace(":type", req.params.type),
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

//通过重复客户的客户id获取重复客户
exports.getRepeatCustomerById = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getRepeatCustomerById.replace(":customerId", req.params.customerId),
            req: req,
            res: res
        }, null);
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
    //可以通过线索的id查询客户
    let customer_clue_id = condition && condition.customer_clue_id;
    delete condition.call_phone;
    let queryObj = {};
    if (call_phone) {  // 通话记录，查看客户详情
        url = crmRestApis.getCustomerByPhone + "/" + req.params.pageSize + "/" + req.params.sortFeild + "/" + req.params.sortOrder;
        queryObj = _.clone(condition);
    } else if (id || customer_clue_id) {  // 根据客户的id,或者线索的id查询客户详情
        url = crmRestApis.query;
        if (req.body.hasManageAuth) {
            url = crmRestApis.managerQuery;
        }
        url += "/" + req.params.pageSize + "/" + req.params.sortFeild + "/" + req.params.sortOrder;
        if (id){
            queryObj.query = {"id": id};
        }else if (customer_clue_id){
            queryObj.query = {"customer_clue_id": customer_clue_id};
        }
    } else {  // 客户列表
        let baseUrl = "";
        if (req.body.hasManageAuth) {
            baseUrl = crmRestApis.managerQuery;
        } else {
            baseUrl = crmRestApis.query;
        }
        url = baseUrl + "/" + req.params.pageSize + "/" + req.params.sortFeild + "/" + req.params.sortOrder;
        var query = JSON.parse(req.body.queryObj);
        url += "?cursor=" + query.cursor;
        if (query.id) {
            url += "&id=" + query.id;
        }
        if (query.total_size) {
            url += "&total_size=" + query.total_size;
        }
        if (condition.exist_fields) {
            queryObj.exist_fields = condition.exist_fields;
            delete condition.exist_fields;
        }
        if (condition.unexist_fields) {
            queryObj.unexist_fields = condition.unexist_fields;
            delete condition.unexist_fields;
        }
        if (condition.term_fields) {//精确匹配项：标签的筛选
            queryObj.term_fields = condition.term_fields;
            delete condition.term_fields;
        }
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
    let urlType = newCustomer.urlType;
    let url = crmRestApis.basic.updateComment;
    switch (type) {
        case "name":
            url = crmRestApis.basic.updateName;
            break;
        case "label":
            url = crmRestApis.basic.updateLabel;
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
            break;
        case "customer_interest":
            url = crmRestApis.basic.updateInterest;
            break;
    }
    url = url.replace(":url_type", urlType);
    delete newCustomer.type;
    delete newCustomer.urlType;
    return restUtil.authRest.put(
        {
            url: url,
            req: req,
            res: res
        }, newCustomer);
};
//转出客户的处理
exports.transferCustomer = function (req, res, newCustomer) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.basic.transferCustomer.replace(":url_type", req.params.type),
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
//获取是否能继续添加客户
exports.getCustomerLimit = function (req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCustomerLimit,
            req: req,
            res: res
        },  req.query);
};

