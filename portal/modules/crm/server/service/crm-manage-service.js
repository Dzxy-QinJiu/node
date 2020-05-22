'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');

//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;
const editCustomerBaseUrl = '/rest/customer/v3/customer/property/:url_type';
var crmRestApis = {
    customer: '/rest/customer/v3/customer',
    //获取客户的历史分数
    getHistoryScoreList: '/rest/customer/v2/customer/score/:customer_id/:start_time/:end_time',
    list: '/rest/customer/v2/customer/all',
    //我可以查看的客户列表（已分配销售的客户）
    // query: '/rest/customer/v2/customer/range',
    //获取所有的客户列表（包括：未分配给销售的客户）全量信息
    managerQuery: '/rest/customer/v3/customer/range/:type/:page_size/:page_num/:sort_field/:sort_order',
    //获取所有的客户列表（精简信息）
    managerQuerySimple: '/rest/customer/v3/customer/range/simple/:type/:page_size/:page_num/:sort_field/:sort_order',
    //获取回收站中的客户列表
    getRecycleBinCustomers: '/rest/customer/v3/customer_bak/range/customer_bak/:type/:page_size',
    //恢复回收站中的客户
    recoveryCustomer: '/rest/customer/v3/customer_bak',
    //删除回收站中的客户
    deleteCustomerBak: '/rest/customer/v3/customer_bak/:customer_id',
    dynamic: '/rest/customer/v2/customerdynamic',
    upload: '/rest/customer/v3/customer/upload/preview',
    repeatCustomer: '/rest/customer/v3/customer/range/:type/:page_size/repeat_id/descend',
    getRepeatCustomerById: '/rest/customer/v3/customer/all/:type/:page_size/repeat_id/descend',
    delRepeatCustomer: '/rest/customer/v2/customer/delete',
    getCustomerById: '/rest/customer/v2/customer/query/1/name/descend',
    mergeRepeatCustomer: '/rest/customer/v3/customer/merge/customer',
    checkCustomerRepeat: '/rest/customer/v3/customer/repeat/search',
    getFilterIndustries: '/rest/customer/v3/customer/term/:type/field/industry',
    //获取筛选面板负责人列表
    getOwnerList: '/rest/customer/v2/customer/nickname/:type/500/1',
    //获取阶段标签列表
    getStageTagList: '/rest/customer/v3/customer/term/:type/field/customer_label',
    //获取竞品列表
    getCompetitorList: '/rest/customer/v3/customer/term/:type/field/competing_products',
    //获取系统标签列表
    getSystemLabelsList: '/rest/customer/v3/customer/term/:type/field/immutable_labels',
    //type:manager(管理员调用)，type:user(非管理员调用)
    getFilterProvinces: '/rest/customer/v3/customer/term/:type/field/province',
    // 查询客户精确匹配（通话记录中查询客户详情）
    getCustomerByPhone: '/rest/customer/v2/customer/query/term/customer',
    //根据客户名获取行政级别
    getAdministrativeLevel: '/rest/customer/v2/customer/administrative_level/:customer_name',
    //获取销售角色列表（type:manager、user）
    getFilterSalesRoleList: '/rest/customer/v2/customer/:type/member/role',
    basic: {//type:manager(管理员调用)，type:user(非管理员调用)
        //修改客户名
        updateName: `${editCustomerBaseUrl}/name`,
        //修改客户标签
        updateLabel: `${editCustomerBaseUrl}/label`,
        //修改客户竞品
        updateCompetitor: `${editCustomerBaseUrl}/competing_product`,
        //修改客户地域
        updateAddress: `${editCustomerBaseUrl}/address`,
        //更新客户行业
        updateIndustry: `${editCustomerBaseUrl}/industry`,
        //更新客户备注
        updateComment: `${editCustomerBaseUrl}/remark`,
        //修改客户所属销售（团队）
        updateSales: `${editCustomerBaseUrl}/sales`,
        //修改客户的行政级别
        updateAdministrativeLevel: `${editCustomerBaseUrl}/administrative_level`,
        //修改客户的详细地址
        updateDetailAddress: `${editCustomerBaseUrl}/detail_address`,
        //关注或者取消关注某客户
        updateInterest: `${editCustomerBaseUrl}/interest_member_ids`,
        //转出客户
        transferCustomer: `${editCustomerBaseUrl}/transfer`,
        //修改客户阶段
        editCustomerStage: `${editCustomerBaseUrl}/customer_label`,
        //只修改客户的所属团队
        onlyEditCustomerTeam: `${editCustomerBaseUrl}/sales_team`,
        // 修改自定义信息
        updateCustomField: `${editCustomerBaseUrl}/custom_variables`,

    },
    // 拨打电话
    callOut: '/rest/customer/v2/phone/call/ou',
    //获取客户是否还能继续添加客户 返回0是可以继续添加，返回大于0的值，表示超出几个客户
    getCustomerLimit: '/rest/customer/v3/customer/limit/flag',
    //线索生成客户（在关联客户时）
    addCustomerByClue: '/rest/customer/v2/customer/clue_create_customer',
    //线索生成客户（在转客户时）
    addCustomerByClueAtConvert: '/rest/clue/v2/lead_transfer/customer/create',
    //获取客户所属销售及联合跟进人
    getSalesByCustomerId: '/rest/customer/v3/customer/customer/users/:customer_id',
    //修改客户的联合跟进人
    editSecondSales: '/rest/customer/v3/customer/customer/assert/user',
    //释放客户
    releaseCustomer: '/rest/customer/v3/customer/customer/pool/:id',
    //获取客户池中的客户
    getPoolCustomer: '/customerpool/resource/customers',
    //提取客户
    extractCustomer: '/customerpool/resource/customers/pull',
    //获取客户池中聚合的筛选项
    getCustomerPoolFilterItems: '/customerpool/resource/customers/field/aggregation',
    // 通过团队id获取客户阶段（销售流程）
    getCustomerStageByTeamId: '/rest/customer/v3/salesprocess/:team_id',
    // 验证是否有权限处理负责人
    checkCustomerUpdateUser: '/rest/customer/v3/customer/check/update/user/:customer_id',
    // 是否有权限处理联合跟进人
    checkCustomerJoinUser: '/rest/customer/v3/customer/check/join/user/:customer_id',
};
exports.urls = crmRestApis;

// 通过团队id获取客户阶段（销售流程）
exports.getCustomerStageByTeamId = (req, res) => {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCustomerStageByTeamId.replace(':team_id', _.get(req, 'params.teamId')),
            req: req,
            res: res
        }, null);
};

//获取回收站中的客户列表
exports.getRecycleBinCustomers = function(req, res) {
    let url = crmRestApis.getRecycleBinCustomers.replace(':type', req.params.type || 'user')
        .replace(':page_size', req.params.page_size || 20);
    if (req.query.id) {
        url = `${url}?id=${req.query.id}`;
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, req.body);
};

//恢复回收站中的客户
exports.recoveryCustomer = function(req, res) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.recoveryCustomer,
            req: req,
            res: res
        }, req.body);
};
//删除回收站中的客户
exports.deleteCustomerBak = function(req, res) {
    return restUtil.authRest.del(
        {
            url: crmRestApis.deleteCustomerBak.replace(':customer_id', req.params.customer_id),
            req: req,
            res: res
        });
};

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

//获取筛选面板的行业列表
exports.getFilterIndustries = function(req, res) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.getFilterIndustries.replace(':type', req.params.type),
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
    return restUtil.authRest.post(
        {
            url: crmRestApis.getFilterProvinces.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};
//获取阶段标签列表
exports.getStageTagList = function(req, res) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.getStageTagList.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};
//获取竞品列表
exports.getCompetitorList = function(req, res) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.getCompetitorList.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};

//获取系统标签列表
exports.getSystemLabelsList = function(req, res) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.getSystemLabelsList.replace(':type', req.params.type),
            req: req,
            res: res
        }, null);
};
//获取筛选面板的负责人列表
exports.getOwnerList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getOwnerList.replace(':type', req.params.type),
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
    let url = crmRestApis.repeatCustomer.replace(':type', queryParams.type || 'user').replace(':page_size', queryParams.page_size || 20);
    //cursor=true向后翻页的标识
    url += '?cursor=true';
    if (queryParams.id) {
        url += '&id=' + queryParams.id;
    }
    let filterObj = queryParams.filterObj ? JSON.parse(queryParams.filterObj) : {};
    //用于查询重复客户的标识
    filterObj.repeat = true;
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, {query: filterObj});
};

//通过重复客户的客户id获取重复客户
exports.getRepeatCustomerById = function(req, res) {
    let customerIds = req.params.customer_id || '';
    let page_size = _.get(customerIds.split(','), 'length', 0);
    return restUtil.authRest.post(
        {
            url: crmRestApis.getRepeatCustomerById.replace(':type', req.params.type || 'user').replace(':page_size', page_size),
            req: req,
            res: res
        }, {query: {id: customerIds}});
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
        url = crmRestApis.getCustomerByPhone + '/' + req.params.pageSize + '/' + req.params.sortField + '/' + req.params.sortOrder;
        bodyData = _.clone(condition);
    } else if (id || customer_clue_id) { // 根据客户的id,或者线索的id查询客户详情
        let type = req.body.hasManageAuth ? 'manager' : 'user';
        //.replace(':page_num',req.params.pageNum)改为图数据库后翻页需要
        //由于精简方式查询信息不完整， 所以这里按全量方式查询客户详情
        url = crmRestApis.managerQuery.replace(':type', type).replace(':page_size', req.params.pageSize)
            .replace(':page_num',req.params.pageNum)
            .replace(':sort_field', req.params.sortField)
            .replace(':sort_order',req.params.sortOrder);
        if (id){
            bodyData.query = {'id': id};
        }else if (customer_clue_id){
            bodyData.query = {'customer_clue_id': customer_clue_id};
        }
    } else { // 客户列表
        let type = req.body.hasManageAuth ? 'manager' : 'user';
        //判断是否获取精简客户列表信息（simple）
        let managerQueryUrl = req.body.getSimpleCrm ? crmRestApis.managerQuerySimple : crmRestApis.managerQuery;
        url = managerQueryUrl.replace(':type', type).replace(':page_size', req.params.pageSize)
            .replace(':page_num',req.params.pageNum).replace(':sort_field', req.params.sortField)
            .replace(':sort_order',req.params.sortOrder);
        let query = req.body.queryObj ? JSON.parse(req.body.queryObj) : {};
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
        case 'customer_label':
            url = crmRestApis.basic.editCustomerStage;
            break;
        case 'custom_variables':
            url = crmRestApis.basic.updateCustomField;
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
//修改客户信息
//小程序中使用
exports.editCustomer = function(req, res) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.customer,
            req: req,
            res: res
        }, req.body);
};

//由线索生成客户
exports.addCustomerByClue = function(req, res) {
    let url;

    //在线索转客户过程中生成客户时
    if (req.query.is_convert) {
        url = crmRestApis.addCustomerByClueAtConvert + `?lead_id=${req.query.clueId}`;
    //在线索关联客户过程中生成客户时
    } else {
        url = crmRestApis.addCustomerByClue + `?clue_id=${req.query.clueId}`;
    }

    return restUtil.authRest.post(
        {
            url,
            req: req,
            res: res
        }, req.body);
};

//删除客户
exports.deleteCustomer = function(req, res) {
    return restUtil.authRest.del(
        {
            url: crmRestApis.customer + '/' + req.params.customer_id,
            req: req,
            res: res
        });
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
exports.uploadCustomers = function(req, res, formData) {
    return restUtil.authRest.post({
        url: crmRestApis.upload,
        req: req,
        res: res,
        formData: formData,
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

//获取联合跟进人
exports.getSalesByCustomerId = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getSalesByCustomerId.replace(':customer_id',req.params.customer_id),
            req: req,
            res: res
        });
};

//修改客户的联合跟进人
exports.editSecondSales = function(req, res) {
    return restUtil.authRest.put(
        {
            url: crmRestApis.editSecondSales,
            req: req,
            res: res,
        }, req.body);
};

//释放客户
exports.releaseCustomer = function(req, res) {
    let url = crmRestApis.releaseCustomer.replace(':id',req.body.id);
    if(_.get(req.query, 'type')) {
        url += `?type=${req.query.type}`;
    }

    return restUtil.authRest.put(
        {
            url: url,
            req: req,
            res: res,
        }, req.body);
};

//获取客户池中的客户
exports.getPoolCustomer = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getPoolCustomer,
            req: req,
            res: res,
        }, req.query);
};
//提取客户
exports.extractCustomer = function(req, res) {
    return restUtil.authRest.post(
        {
            url: crmRestApis.extractCustomer,
            req: req,
            res: res,
        }, req.body);
};
//获取客户池中聚合的筛选项
exports.getCustomerPoolFilterItems = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.getCustomerPoolFilterItems,
            req: req,
            res: res,
        }, req.query);
};
//验证是否有权限处理负责人
exports.checkCustomerUpdateUser = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.checkCustomerUpdateUser.replace(':customer_id', req.params.customer_id),
            req: req,
            res: res,
        });
};
//是否有权限处理联合跟进人
exports.checkCustomerJoinUser = function(req, res) {
    return restUtil.authRest.get(
        {
            url: crmRestApis.checkCustomerJoinUser.replace(':customer_id', req.params.customer_id),
            req: req,
            res: res,
        });
};