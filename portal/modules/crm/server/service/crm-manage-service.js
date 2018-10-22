'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');

//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;

var crmRestApis = {
    customer: '/rest/customer/v2/customer',
    //获取客户开通的用户列表
    getCrmUserList: '/rest/base/v1/user/customer/users',
    //获取客户的历史分数
    getHistoryScoreList: '/rest/customer/v2/customer/score/:customer_id/:start_time/:end_time',
    list: '/rest/customer/v2/customer/all',
    //我可以查看的客户列表（已分配销售的客户）
    query: '/rest/customer/v2/customer/range',
    //获取所有的客户列表（包括：未分配给销售的客户）
    managerQuery: '/rest/customer/v2/customer/range/manager',
    dynamic: '/rest/customer/v2/customerdynamic',
    upload: '/rest/customer/v2/customer/upload/preview',
    repeatCustomer: '/rest/customer/v2/customer/query/repeat',
    getRepeatCustomerById: '/rest/customer/v2/customer/:customerId',
    delRepeatCustomer: '/rest/customer/v2/customer/delete',
    getCustomerById: '/rest/customer/v2/customer/query/1/name/descend',
    mergeRepeatCustomer: '/rest/customer/v2/customer/merge/customer',
    checkCustomerRepeat: '/rest/customer/v2/customer/repeat/search',
    getFilterIndustries: '/rest/customer/v2/customer/industries',
    //获取筛选面板负责人名称列表
    getOwnerNameList: '/rest/customer/v2/customer/username/:type/500/1',
    //获取阶段标签列表
    getStageTagList: '/rest/customer/v2/customer/customer_label/:type/50/1',
    //获取竞品列表
    getCompetitorList: '/rest/customer/v2/customer/competing_products/:type/100/1',
    //type:manager(管理员调用)，type:user(非管理员调用)
    getFilterProvinces: '/rest/customer/v2/customer/provinces/:type/40/1',
    // 查询客户精确匹配（通话记录中查询客户详情）
    getCustomerByPhone: '/rest/customer/v2/customer/query/term/customer',
    //根据客户名获取行政级别
    getAdministrativeLevel: '/rest/customer/v2/customer/administrative_level/:customer_name',
    //获取销售角色列表（type:manager、user）
    getFilterSalesRoleList: '/rest/customer/v2/customer/:type/member/role',
    basic: {//type:manager(管理员调用)，type:user(非管理员调用)
        //修改客户名
        updateName: '/rest/customer/v2/customer/:url_type/name',
        //修改客户标签
        updateLabel: '/rest/customer/v2/customer/:url_type/label',
        //修改客户竞品
        updateCompetitor: 'rest/customer/v2/customer/:url_type/competing_product',
        //修改客户地域
        updateAddress: '/rest/customer/v2/customer/:url_type/address',
        //更新客户行业
        updateIndustry: '/rest/customer/v2/customer/:url_type/industry',
        //更新客户备注
        updateComment: '/rest/customer/v2/customer/:url_type/remark',
        //修改客户所属销售（团队）
        updateSales: '/rest/customer/v2/customer/:url_type/sales',
        //修改客户的行政级别
        updateAdministrativeLevel: '/rest/customer/v2/customer/:url_type/administrative_level',
        //修改客户的详细地址
        updateDetailAddress: '/rest/customer/v2/customer/:url_type/detail_address',
        //关注或者取消关注某客户
        updateInterest: '/rest/customer/v2/customer/:url_type/interest_member_ids',
        //转出客户
        transferCustomer: '/rest/customer/v2/customer/:url_type/transfer',
        //修改客户阶段
        editCustomerStage: '/rest/customer/v2/customer/:url_type/customer_label',
        //只修改客户的所属团队
        onlyEditCustomerTeam: '/rest/customer/v2/customer/:url_type/sales_team'
    },
    // 拨打电话
    callOut: '/rest/customer/v2/phone/call/ou',
    // 获取电话座机号
    getUserPhoneNumber: '/phone/seat/user/ext/:user_id',
    //获取客户是否还能继续添加客户 返回0是可以继续添加，返回大于0的值，表示超出几个客户
    getCustomerLimit: '/rest/customer/v2/customer/limit/flag',
    //线索生成客户
    addCustomerByClue: '/rest/customer/v2/customer/clue_create_customer',
};
exports.urls = crmRestApis;

//获取客户的历史分数
exports.getHistoryScoreList = function(req, res, queryObj) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getHistoryScoreList.replace(':customer_id', queryObj.customer_id)
                .replace(':start_time', queryObj.start_time).replace(':end_time', queryObj.end_time),
            req: req,
            res: res
        }, null);
};
//获取客户的用户列表
exports.getCrmUserList = function(req, res, queryObj) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCrmUserList,
            req: req,
            res: res
        }, queryObj);
};
//获取筛选面板的行业列表
exports.getFilterIndustries = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getFilterIndustries,
            req: req,
            res: res
        }, null);
};
//获取筛选面板的销售角色列表
exports.getFilterSalesRoleList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getFilterSalesRoleList.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};

//获取筛选面板的地域列表
exports.getFilterProvinces = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getFilterProvinces.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};
//获取阶段标签列表
exports.getStageTagList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getStageTagList.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};
//获取竞品列表
exports.getCompetitorList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCompetitorList.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};

//获取筛选面板的负责人名称列表
exports.getOwnerNameList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getOwnerNameList.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};

//客户名、联系人电话唯一性的验证
exports.checkOnlyCustomer = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.checkCustomerRepeat,
            req: req,
            res: res
        }, req.query);
};

//获取客户列表
exports.getCustomerList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.list + '/' + req.params.pageSize + '/' + req.params.pageNum + '/id',
            req: req,
            res: res
        }, null);
};
//根据客户id获取客户
exports.getCustomerById = function(req, res, customerId) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.getCustomerById,
            req: req,
            res: res
        }, {
            id: customerId
        }, {
            success: function(eventEmitter, data) {
                let customer = null;
                if (_.isObject(data) && _.isArray(data.result) && data.result.length > 0) {
                    customer = data.result[0];
                }
                eventEmitter.emit('success', customer);
            }
        });
};
//获取重复的客户列表
exports.getRepeatCustomerList = function(req, res, queryParams) {
    let url = crmRestApis.repeatCustomer;
    if (queryParams && queryParams.page_size) {
        url += '?page_size=' + queryParams.page_size;
        if (queryParams.id) {
            url += '&id=' + queryParams.id;
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
exports.getRepeatCustomerById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getRepeatCustomerById.replace(':customerId', req.params.customerId),
            req: req,
            res: res
        }, null);
};

//删除重复客户
exports.deleteRepeatCustomer = function(req, res, customerIdArray) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.delRepeatCustomer,
            req: req,
            res: res
        }, customerIdArray);
};
//合并重复客户
exports.mergeRepeatCustomer = function(req, res, mergeObj) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.mergeRepeatCustomer,
            req: req,
            res: res
        }, mergeObj);

};

//查询客户
exports.queryCustomer = function(req, res) {
    let condition = JSON.parse(req.body.data);
    let url = '';
    let call_phone = condition && condition.call_phone;
    let id = condition && condition.id;
    //可以通过线索的id查询客户
    let customer_clue_id = condition && condition.customer_clue_id;
    delete condition.call_phone;
    let bodyData = {};
    if (call_phone) { // 通话记录，查看客户详情
        url = crmRestApis.getCustomerByPhone + '/' + req.params.pageSize + '/' + req.params.sortFeild + '/' + req.params.sortOrder;
        bodyData = _.clone(condition);
    } else if (id || customer_clue_id) { // 根据客户的id,或者线索的id查询客户详情
        url = crmRestApis.query;
        if (req.body.hasManageAuth) {
            url = crmRestApis.managerQuery;
        }
        url += '/' + req.params.pageSize + '/' + req.params.sortFeild + '/' + req.params.sortOrder;
        if (id){
            bodyData.query = {'id': id};
        }else if (customer_clue_id){
            bodyData.query = {'customer_clue_id': customer_clue_id};
        }
    } else { // 客户列表
        let baseUrl = '';
        if (req.body.hasManageAuth) {
            baseUrl = crmRestApis.managerQuery;
        } else {
            baseUrl = crmRestApis.query;
        }
        url = baseUrl + '/' + req.params.pageSize + '/' + req.params.sortFeild + '/' + req.params.sortOrder;
        var query = req.body.queryObj ? JSON.parse(req.body.queryObj) : {};
        url += '?cursor=' + query.cursor;
        if (query.id) {
            url += '&id=' + query.id;
        }
        if (query.total_size) {
            url += '&total_size=' + query.total_size;
        }
        if (condition.exist_fields) {
            bodyData.exist_fields = condition.exist_fields;
            delete condition.exist_fields;
        }
        if (condition.unexist_fields) {
            bodyData.unexist_fields = condition.unexist_fields;
            delete condition.unexist_fields;
        }
        if (condition.term_fields) {//精确匹配项：标签的筛选
            bodyData.term_fields = condition.term_fields;
            delete condition.term_fields;
        }
        bodyData.query = condition;
        if (query && query.user_id) {
            bodyData.query.user_id = query.user_id;
        }
        if(req.body.rangParams){//时间范围的限制参数
            bodyData.rang_params = JSON.parse(req.body.rangParams);
        }
        if(req.body.sort_and_orders){//优先级排序字段数组（靠前的优先）
            bodyData.sort_and_orders = JSON.parse(req.body.sort_and_orders);
        }
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, bodyData);
};

//修改客户
exports.updateCustomer = function(req, res, newCustomer) {
    let type = newCustomer.type;
    let urlType = newCustomer.urlType;
    let url = crmRestApis.basic.updateComment;
    switch (type) {
        case 'name':
            url = crmRestApis.basic.updateName;
            break;
        case 'label':
            url = crmRestApis.basic.updateLabel;
            break;
        case 'competing_products':
            url = crmRestApis.basic.updateCompetitor;
            break;
        case 'industry':
            url = crmRestApis.basic.updateIndustry;
            break;
        case 'address':
            url = crmRestApis.basic.updateAddress;
            break;
        case 'comment':
            url = crmRestApis.basic.updateComment;
            break;
        case 'sales':
            url = crmRestApis.basic.updateSales;
            break;
        case 'administrative_level':
            url = crmRestApis.basic.updateAdministrativeLevel;
            break;
        case 'detail_address':
            url = crmRestApis.basic.updateDetailAddress;
            break;
        case 'customer_interest':
            url = crmRestApis.basic.updateInterest;
            break;
    }
    url = url.replace(':url_type', urlType);
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
exports.transferCustomer = function(req, res, newCustomer) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.basic.transferCustomer.replace(':url_type', req.params.type),
            req: req,
            res: res
        }, newCustomer);
};

//添加客户
exports.addCustomer = function(req, res, newCustomer) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.customer,
            req: req,
            res: res
        }, newCustomer);
};
//由线索生成客户
exports.addCustomerByClue = function(req, res) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.addCustomerByClue + `?clue_id=${req.query.clueId}`,
            req: req,
            res: res
        }, req.body);
};

//删除客户
exports.deleteCustomer = function(req, res, ids) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.customer + '/delete',
            req: req,
            res: res
        }, ids);
};

//获取动态列表
exports.getDynamicList = function(req, res, customer_id) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.dynamic + '/' + customer_id + '/100',
            req: req,
            res: res
        }, null);
};
exports.uploadCustomers = function(req, res) {
    return restUtil.authRest.post({
        url: crmRestApis.upload,
        req: req,
        res: res,
        'pipe-upload-file': true,
        timeout: uploadTimeOut
    }, null);
};

//根据客户名获取行政级别
exports.getAdministrativeLevel = function(req, res, customerName) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getAdministrativeLevel.replace(':customer_name', customerName),
            req: req,
            res: res
        }, null);
};

// 拨打电话
exports.callOut = function(req, res, queryObj) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.callOut,
            req: req,
            res: res
        }, queryObj);
};

// 获取电话座机号
exports.getUserPhoneNumber = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getUserPhoneNumber.replace(':user_id', req.params.user_id),
            req: req,
            res: res
        }, null);
};
//获取是否能继续添加客户
exports.getCustomerLimit = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCustomerLimit,
            req: req,
            res: res
        }, req.query);
};
//修改客户阶段标签
exports.editCustomerStage = function(req, res) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.basic.editCustomerStage.replace(':url_type',req.params.type),
            req: req,
            res: res
        }, req.body);
};
//只修改客户的所属团队
exports.onlyEditCustomerTeam = function(req, res) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.basic.onlyEditCustomerTeam.replace(':url_type',req.params.type),
            req: req,
            res: res
        }, req.body);
};