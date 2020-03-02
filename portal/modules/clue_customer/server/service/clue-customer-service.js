/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
'use strict';
//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;
const clueBaseUrl = '/rest/clue/v2';
const ROLE_CONSTANTS = require('../../../../lib/consts').ROLE_CONSTANS;
const auth = require('../../../../lib/utils/auth');
import cluePrivilegeConst from '../../../clue_customer/public/privilege-const';
const restApis = {
    //获取线索来源
    getClueSource: clueBaseUrl + '/clue_source/100/1',
    //获取线索渠道
    getClueChannel: clueBaseUrl + '/access_channel/100/1',
    //获取线索分类
    getClueClassify: clueBaseUrl + '/clue_classify/100/1',
    //查询线索客户用户查询
    queryCluecustomer: clueBaseUrl + '/query/user',
    //查询线索客户 管理员查询
    queryCluecustomerManager: clueBaseUrl + '/query/manager',
    //添加跟进内容
    addCluecustomerTrace: clueBaseUrl + '/trace',
    //把线索客户分配给对应的销售
    distributeCluecustomerToSale: clueBaseUrl + '/distribute/:type',
    //对线索客户的详情进行更新
    updateCluecustomerDetail: clueBaseUrl + '/update/:type/:updateItem',
    //将线索和客户进行关联
    RelateClueAndCustomer: clueBaseUrl + '/:type/customer_clue_relation',
    //导入线索
    upload: clueBaseUrl + '/upload/preview',
    //确认导入线索预览
    uploadClueConfirm: clueBaseUrl + '/upload/confirm/:flag',
    //删除某条线索
    deleteRepeatClue: clueBaseUrl + '/upload/preview/:index',
    //获取线索分析
    getClueAnalysis: '/rest/analysis/customer/v2/clue/customer/label',
    //获取线索统计
    getClueStatics: clueBaseUrl + '/:type/statistical/:field/:page_size/:num',
    //获取线索趋势统计
    getClueTrendStatics: '/rest/analysis/customer/v2/:type/clue/trend/statistic',
    //线索的全文搜索
    getClueFulltext: clueBaseUrl + '/query/lead/range/fulltext/:type/:page_size/:page_num/:sort_field/:order',
    //导出线索的全文搜索
    exportClueFulltext: clueBaseUrl + '/query/lead/range/fulltext/:type/:page_size/:sort_field/:order',
    //获取线索的动态
    getClueDynamic: clueBaseUrl + '/dynamic/:clue_id/:page_size',
    //根据线索的id查询线索的详情
    getClueDetailById: clueBaseUrl + '/query/clue/:clueId',
    //删除某个线索
    deleteClueById: clueBaseUrl + '/delete',
    //批量修改线索的跟进人
    changeClueSalesBatch: clueBaseUrl + '/distribute/:type/batch/new',
    //获取相似线索
    getSimilarClueLists: '/rest/clue/v2/query/leads/by/ids',
    //获取相似客户
    getSimilarCustomerLists: '/rest/customer/v3/customer/query/customers/by/ids',
    //获取推荐的线索
    getRecommendClueLists: '/rest/clue/v2/companys/search/drop_down_load',
    //获取行业配置
    getClueIndustryLists: '/rest/company/v1/ent/industrys',
    //获取个人配置
    selfConditionConfig: '/rest/clue/v2/ent/search',
    //提取某条线索
    extractRecommendClue: '/rest/clue/v2/ent/clue',
    //批量提取线索
    batchExtractRecommendLists: '/rest/clue/v2/ent/clues',
    //根据关键词获取线索
    getClueListByKeyword: clueBaseUrl + '/query/:type/:page_size/:sort_field/:order',
    //获取已经提取推荐线索数量
    getRecommendClueCount: '/rest/clue/v2/ent/clues/get',
    //释放线索
    releaseClue: clueBaseUrl + '/lead_pool/release/:type',
    //批量释放线索
    batchReleaseClue: clueBaseUrl + '/lead_pool/release/batch/:type',
    //线索名、电话唯一性验证
    checkOnlyClueNamePhone: clueBaseUrl + '/repeat/search',
    //获取线索最大提取量的数值（适用用户是今天的最大提取量，正式用户是本月的最大提取量）及已经提取了多少的数值
    getMaxLimitCountAndHasExtractedClue: 'rest/clue/v2/month/able/clues',
    //获取申请试用的数据
    getApplyTryData: '/rest/base/v1/realm/version/upgrade/apply'
};

//获取线索来源
exports.getClueSource = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueSource,
            req: req,
            res: res
        }, null);
};
//获取线索最大提取量及已经提取了多少
exports.getMaxLimitCountAndHasExtractedClue = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getMaxLimitCountAndHasExtractedClue,
            req: req,
            res: res
        }, null);
};
//提取单条线索
exports.extractRecommendClue = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.extractRecommendClue,
            req: req,
            res: res
        }, req.body);
};
//批量提取线索
exports.batchExtractRecommendLists = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.batchExtractRecommendLists,
            req: req,
            res: res
        }, req.body);
};
//获取已经提取推荐线索数量
exports.getRecommendClueCount = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getRecommendClueCount,
            req: req,
            res: res
        }, req.query);
};

exports.changeClueSalesBatch = function(req, res) {
    var url = restApis.changeClueSalesBatch.replace(':type',req.params.type);
    if(req.body.query_param){
        var queryObj = handleBatchClueSalesParams(req, url);
        req.body.query_param = queryObj.bodyObj;
        url = queryObj.url;
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, req.body);
};
//获取线索渠道
exports.getClueChannel = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueChannel,
            req: req,
            res: res
        }, null);
};
//获取线索分类
exports.getClueClassify = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueClassify,
            req: req,
            res: res
        }, null);
};
//添加跟进内容
exports.addCluecustomerTrace = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addCluecustomerTrace,
            req: req,
            res: res
        }, req.body);
};
//把线索客户分配给对应的销售
//添加跟进内容
exports.distributeCluecustomerToSale = function(req, res) {
    var queryObj = req.body;
    var type = 'user';
    if (queryObj.hasDistributeAuth){
        type = 'manager';
    }
    delete queryObj.hasDistributeAuth;
    return restUtil.authRest.post(
        {
            url: restApis.distributeCluecustomerToSale.replace(':type',type),
            req: req,
            res: res
        }, queryObj);
};
//对线索客户的详情进行更新
exports.updateCluecustomerDetail = function(req, res) {
    var updateItem = req.body.updateItem;
    return restUtil.authRest.put(
        {
            url: restApis.updateCluecustomerDetail.replace(':type', req.body.type).replace(':updateItem', updateItem),
            req: req,
            res: res
        }, JSON.parse(req.body.updateObj));
};
//将线索和客户进行关联
exports.relateClueAndCustomer = function(req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.RelateClueAndCustomer.replace(':type',req.params.type),
            req: req,
            res: res
        }, req.body);
};
//上传线索
exports.uploadClues = function(req, res, formData) {
    return restUtil.authRest.post({
        url: restApis.upload,
        req: req,
        res: res,
        formData: formData,
        timeout: uploadTimeOut
    }, null);
};
//上传线索预览
exports.confirmUploadClues = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.uploadClueConfirm.replace(':flag',req.params.flag),
            req: req,
            res: res
        }, null);
};
//删除某个重复线索
exports.deleteRepeatClue = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.deleteRepeatClue.replace(':index',req.params.index),
            req: req,
            res: res
        }, null);
};
//线索分析
exports.getClueAnalysis = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getClueAnalysis,
            req: req,
            res: res
        }, req.body);
};
exports.getClueStatics = function(req, res) {
    let queryObj = {};
    queryObj.rang_params = JSON.parse(req.body.rangeParams);
    //销售取值时，query参数必须有，管理员可以没有
    if (req.body.query){
        queryObj.query = JSON.parse(req.body.query);
    }else{
        queryObj.query = {};
    }
    return restUtil.authRest.post({
        url: restApis.getClueStatics.replace(':type',req.params.type).replace(':field',req.params.field).replace(':page_size',req.params.page_size).replace(':num',req.params.num),
        req: req,
        res: res
    }, queryObj);

};
//线索趋势统计
exports.getClueTrendStatics = function(req, res) {
    var url = restApis.getClueTrendStatics.replace(':type', req.params.type);
    if (req.body.start_time || req.body.start_time === 0){
        url += `?start_time=${req.body.start_time}`;
    }
    if (req.body.end_time){
        url += `&end_time=${req.body.end_time}`;
    }
    if (req.body.field){
        url += `&field=${req.body.field}`;
    }
    if (req.body.interval){
        url += `&interval=${req.body.interval}`;
    }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};
function handleBatchClueSalesParams(req, clueUrl) {
    var reqBody = req.body.query_param;
    var queryParams = _.get(reqBody,'queryParam');
    var bodyParams = _.get(reqBody,'bodyParam');
    var bodyObj = {
        ...bodyParams,
        rangParams: _.get(bodyParams,'rang_params'),

    };

    if (queryParams.keyword){
        var keyword = encodeURI(queryParams.keyword);
        bodyObj.keyword = keyword;
    }
    if(reqBody.self_no_traced){
        clueUrl += `?self_no_traced=${reqBody.self_no_traced}`;
    }
    return {url: clueUrl, bodyObj: bodyObj};
}
function handleClueParams(req, clueUrl) {
    var reqBody = _.cloneDeep(req.body);
    //有导出的线索会用这个条件
    if (_.isString(req.body.reqData)){
        reqBody = JSON.parse(req.body.reqData);
    }
    var url = clueUrl.replace(':type',req.params.type).replace(':page_size',req.params.page_size).replace(':page_num',req.params.page_num).replace(':order',req.params.order);
    var queryParams = _.get(reqBody,'queryParam',{});
    var self_pending = _.get(queryParams,'self_pending',false);
    url += `?self_pending=${self_pending}`;
    if (queryParams.statistics_fields){
        url += `&statistics_fields=${queryParams.statistics_fields}`;
    }
    if (queryParams.keyword){
        var keyword = encodeURI(queryParams.keyword);
        url += `&keyword=${keyword}`;
    }
    if (queryParams.id){
        url += `&id=${queryParams.id}`;
    }
    var bodyParams = _.get(reqBody,'bodyParam');
    var exist_fields = _.get(bodyParams,'exist_fields',[]);
    if (_.isArray(exist_fields) && exist_fields.length){
        //如果是查询重复线索，要按repeat_id排序
        if (_.indexOf(exist_fields,'repeat_id') > -1){
            url = url.replace(':sort_field', 'repeat_id');
        }else {
            url = url.replace(':sort_field',req.params.sort_field);
        }
    }else {
        url = url.replace(':sort_field',req.params.sort_field);
    }
    return {url: url, bodyObj: bodyParams};
}
//获取各类线索数量的统计
function getTypeClueLists(req, res, obj) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.post({
            url: obj.url,
            req: req,
            res: res
        }, obj.bodyObj, {
            success: (emitter, data) => {
                resolve(data);
            },
            error: (eventEmitter, errorDesc) => {
                reject(errorDesc);
            }
        });
    });
}
function getExistTypeClueLists(req, res,obj, selfHandleFlag) {
    //首次登录的时候先获取各类线索的值，然后再获取有值的那一类线索并且把有值选中的字段传到前端
    //如果筛选相中有无效线索，需要再发个请求，请求相同条件下有效线索的统计值，这样可以避免选中无效线索后，切换左边的筛选后，统计值不对的问题,统计字段只统计无效的字段
    let emitter = new EventEmitter();
    let promiseList = [getTypeClueLists(req, res, obj)];
    var searchInvalidClue = _.get(obj,'bodyObj.query.availability') === '1';
    if (searchInvalidClue){
        var cloneObj = _.cloneDeep(obj);
        cloneObj.bodyObj.query.availability = '0';
        promiseList.push(getTypeClueLists(req, res, cloneObj));
    }
    Promise.all(promiseList).then((dataList) => {
        //data[0]和data[1]的数据结构相同
        // {
        //     result:[],
        //     msg:'操作完成',
        //     total:100,
        //     agg_list:[]
        // }
        var data = dataList[0] || {};
        var avalibilityData = dataList[1] || {};
        //无效线索的agg_list
        //     agg_list:[{
        //         availability:[{total:11,name:’1’}]
        //     }],
        //有效线索的agg_list
        //      agg_list:[{
        //          status:[{name:0,total:10},{name:1,total:20},{name:2,total:20},{name:3,total:20}],
        //          availability:[{total:11,name:0},{total:11,name:1}]
        //      }]
        if(searchInvalidClue && !_.isEmpty(avalibilityData) && _.get(data,'agg_list.length') === 1){
            var targetObj = _.find(_.get(avalibilityData,'agg_list'), item => item.status);
            data['agg_list'].unshift(targetObj);
        }
        //当前类型没有线索
        if (!_.get(data, 'total') && req.body.firstLogin === 'true'){
            delete req.body.firstLogin;
            //如果想要查询线索类型的不存在，需要找统计值中有值的发请求
            var staticsData = [],avalibilityData = [];
            _.forEach(_.get(data, 'agg_list',[]),item => {
                if (item['status']){
                    //如果不是管理员也不是运营人员，需要把已转化的去掉
                    if (!(auth.hasRole(req, ROLE_CONSTANTS.OPERATION_PERSON) ||
                        auth.hasRole(req, ROLE_CONSTANTS.REALM_ADMIN))){
                        item['status'] = _.filter(item['status'], status => status.name !== '3');
                    }
                    staticsData = item['status'];
                }
                if (item['availability']){
                    avalibilityData = item['availability'];
                }
            });
            staticsData = _.sortBy(staticsData, item => item.name);
            //没有数据
            var noData = !_.get(staticsData,'[0]') && !_.get(avalibilityData,'[0]');
            //没有有效的线索，有无效的线索时
            if(!_.get(staticsData,'[0]') && _.get(avalibilityData,'[0]')){
                data.setting_avaliability = '1';//无效
                if (selfHandleFlag){//待我处理
                    data.filterAllotNoTraced = 'yes';
                    delete data.setting_avaliability;
                }
                emitter.emit('success', data);
            }else if (selfHandleFlag && ((_.get(staticsData,'[0].name') === '3' && !_.get(avalibilityData,'[0]')) || noData)){
                //如果是发我待我处理的数据并且只有已转化有数据, 无需选中已转化
                data.agg_list = [{status: [], availability: []}];
                data.filterAllotNoTraced = 'no';
                emitter.emit('success', data);
            }else if (noData){//没有数据
                data.agg_list = [{status: [],availability: []}];
                emitter.emit('success', data);
            }else{//找到有数据的发有数据的请求
                if (obj.bodyObj.query){
                    obj.bodyObj.query.status = _.get(staticsData,'[0].name');
                    //如果是已跟进或者已转化状态，需要按跟进时间倒序排列
                    if(_.get(staticsData,'[0].name') === '2' || _.get(staticsData,'[0].name') === '3'){
                        if (obj.url.indexOf('source_time') > -1){
                            obj.url = obj.url.replace('source_time','last_contact_time');
                        }
                    }
                }
                getTypeClueLists(req, res, obj).then((data) => {
                    if (selfHandleFlag){
                        data.filterAllotNoTraced = 'yes';
                    }
                    data.setting_status = _.get(staticsData,'[0].name');
                    emitter.emit('success', data);
                } ).catch( (errorObj) => {
                    emitter.emit('error', errorObj);
                });
            }
        }else{
            if (selfHandleFlag){
                data.filterAllotNoTraced = 'yes';
            }
            //如果获取的数据为0
            if(_.get(data, 'total') === 0 && _.isEmpty(_.get(data,'agg_list'))){
                data.agg_list = [{status: [], availability: []}];
            }
            emitter.emit('success', data);
        }
    }, function(errorMsg) {
        emitter.emit('error', errorMsg);
    });
    return emitter;
}

//线索全文搜索
exports.getClueFulltext = function(req, res) {
    var obj = handleClueParams(req, restApis.getClueFulltext);
    return getExistTypeClueLists(req, res, obj);
};
//线索全文搜索
exports.exportClueFulltext = function(req, res) {
    var obj = handleClueParams(req, restApis.exportClueFulltext);
    return getExistTypeClueLists(req, res, obj);
};
//获取动态列表
exports.getDynamicList = function(req, res) {
    var url = restApis.getClueDynamic.replace(':clue_id',req.params.clue_id).replace(':page_size',req.params.page_size);
    //todo 现在后端接口的下拉加载有问题
    // if (req.query.id){
    //     url += `?id=${req.query.id}`
    // }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};
//删除某条线索
exports.deleteClue = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.deleteClueById,
            req: req,
            res: res
        }, req.body);
};
//根据线索的id获取线索的详情
exports.getClueDetailById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueDetailById.replace(':clueId', req.params.clueId),
            req: req,
            res: res
        }, null);
};
//根据线索id获取属于我的线索
exports.getClueDetailByIdBelongTome = function(req, res){
    //这里之所以用导出的这个接口，是因为获取线索的接口返回的数据不止包括线索列表还有统计数据，数据比较多
    var obj = handleClueParams(req, restApis.exportClueFulltext);
    let emitter = new EventEmitter();
    let promiseList = [getTypeClueLists(req, res, obj)];
    Promise.all(promiseList).then((dataList) => {
        emitter.emit('success', _.get(dataList,'[0].result[0]'));
    }, function(errorMsg) {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};
//获取相似线索
exports.getSimilarClueLists = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getSimilarClueLists,
            req: req,
            res: res
        }, req.body);
};
//获取相似客户
exports.getSimilarCustomerLists = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getSimilarCustomerLists,
            req: req,
            res: res
        }, req.body);
};
//获取行业配置
exports.getClueIndustryLists = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueIndustryLists + '?load_size=1000',
            req: req,
            res: res
        }, null);
};
//获取个人查询配置
exports.getSelfClueConditionConfig = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.selfConditionConfig,
            req: req,
            res: res
        }, null);
};
//添加和修改个人查询配置
exports.addOrEditSelfClueConditionConfig = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.selfConditionConfig,
            req: req,
            res: res
        }, req.body);
};
//获取推荐线索
exports.getRecommendClueLists = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getRecommendClueLists,
            req: req,
            res: res
        }, req.body);
};
//根据关键词获取线索
exports.getClueListByKeyword = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getClueListByKeyword
                .replace(':type', req.params.type)
                .replace(':page_size', req.params.page_size)
                .replace(':sort_field', req.params.sort_field)
                .replace(':order', req.params.order),
            req: req,
            res: res
        }, req.body);
};
//释放线索
exports.releaseClue = function(req, res) {
    return restUtil.authRest.post({
        url: restApis.releaseClue.replace(':type', req.params.type) + `?lead_ids=${req.body.lead_ids}`,
        req: req,
        res: res,
    });
};
//线索批量释放
exports.batchReleaseClue = function(req,res) {
    let url = restApis.batchReleaseClue.replace(':type', req.params.type);
    let reqBody = _.cloneDeep(req.body);
    if(_.has(reqBody, 'self_no_traced')) {
        delete reqBody.self_no_traced;
        url += '?self_no_traced=true';
    }
    return restUtil.authRest.post({
        url: url,
        req: req,
        res: res
    } , reqBody);
};
//线索名、电话唯一性验证
exports.checkOnlyClueNamePhone = function(req, res) {
    let queryBody = req.query;
    let isTerm = queryBody.isTerm;
    delete queryBody.isTerm;
    return restUtil.authRest.get(
        {
            url: restApis.checkOnlyClueNamePhone + `?is_term=${isTerm}`,
            req: req,
            res: res
        }, queryBody);
};
exports.getApplyTryData = function(req, res) {
    return restUtil.authRest.get({
        url: restApis.getApplyTryData,
        req: req,
        res: res
    }, req.query);
};