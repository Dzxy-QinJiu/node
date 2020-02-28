/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
var clueCustomerAjax = require('../ajax/clue-customer-ajax');
var clueTraceAjax = require('../ajax/clue-trace-ajax');
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
import {deleteEmptyProperty, handleSubmitClueItemData} from '../utils/clue-customer-utils';
import {getAllSalesUserList} from 'PUB_DIR/sources/utils/common-data-util';
function ClueCustomerActions() {
    this.generateActions(
        'resetState',
        'setClueInitialData',
        'setCurrentCustomer',
        'afterAddSalesClue',
        'getSalesManList',//获取销售团队列表
        'addCluecustomerTrace',//添加或者更新跟进内容
        'distributeCluecustomerToSale',//分配线索客户给某个销售
        'setTimeRange',//设置开始和结束时间
        'setFilterType',//设置筛选线索客户的类型
        'setStatusLoading',
        'setEdittingStatus',//是否是在编辑跟进内容状态
        'setSalesMan',//获取销售人员及团队的id
        'setSalesManName',//获取销售人员及团队的名字
        'setUnSelectDataTip',//未选择销售人员的提醒信息
        'afterEditCustomerDetail',//修改线索客户完成后更新列表中的信息
        'updateClueProperty',//修改线索是否有效属性
        'removeClueItem',//删除某条线索
        'afterModifiedAssocaitedCustomer',//修改当前线索的绑定客户后在列表中修改该条线索所绑定的客户
        'afterAddClueTrace',//添加完线索的跟进记录后
        'afterReleaseClue', //在释放线索之后
        'afterAssignSales',//分配销售之后
        'setKeyWord',//设置关键字
        'setSortField',
        'updateClueCustomers',//更新线索列表
        //添加、补充跟进记录后，列表中最后联系数据的更新
        'updateCustomerLastContact',
        'updateCurrentClueRemark',
        'afterTranferClueSuccess',//转化客户成功后
        'setLoadingFalse',
        'changeFilterFlag',
        'saveSettingCustomerRecomment',
        'updateRecommendClueLists',
        'updateClueTabNum',
        'updateClueItemAfterAssign',
        'setPageNum',
        'remarkLeadExtractedByOther',//给被别人提取过的线索加一个标识
        'initialRecommendClues',//初始化推荐线索相关条件及状态
        'afterNewExtract',//提取推荐线索后
        'setHotSource',
    );
    //获取销售列表
    this.getSalesManList = function(cb) {
        //客户所属销售（团队）下拉列表的数据获取
        clueCustomerAjax.getSalesManList().then((list) => {
            this.dispatch(list);
            if (cb) cb();
        }, (errorMsg) => {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };
    //获取个人客户推荐配置
    this.getSettingCustomerRecomment = function(condition, callback) {
        //引导页设置了推荐条件后跳转过来时，用引导页设置的推荐条件
        if(condition){
            _.isFunction(callback) && callback(condition);
            this.dispatch({list: [condition]});
        } else {
            clueCustomerAjax.getSettingCustomerRecomment().then((list) => {
                var data = _.get(list,'[0]');
                deleteEmptyProperty(data);
                _.isFunction(callback) && callback(data);
                this.dispatch({list: list});
            },(errorMsg) => {
                _.isFunction(callback) && callback();
            });
        }
    };
    this.getRecommendClueLists = function(obj) {
        this.dispatch({loading: true, error: false});
        clueCustomerAjax.getRecommendClueLists(obj).then((data) => {
            this.dispatch({loading: false, error: false, data});
        },(errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //添加或更新跟进内容
    this.addCluecustomerTrace = function(submitObj,callback) {
        this.dispatch({error: false, loading: true});
        clueTraceAjax.addClueTrace(submitObj).then((result) => {
            this.dispatch({error: false, loading: false, submitTip: result});
            _.isFunction(callback) && callback({error: false});
        },(errorMsg) => {
            this.dispatch({error: true, loading: false, errorMsg: errorMsg || Intl.get('failed.submit.trace.content','添加跟进内容失败')});
            _.isFunction(callback) && callback({error: true, errorMsg: errorMsg || Intl.get('failed.submit.trace.content','添加跟进内容失败')});
        });
    };
    //把线索客户分配给对应的销售
    this.distributeCluecustomerToSale = function(submitObj,callback) {
        this.dispatch({error: false, loading: true});
        clueCustomerAjax.distributeCluecustomerToSale(submitObj).then((result) => {
            this.dispatch({error: false, loading: false});
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            this.dispatch({error: true, loading: false});
            _.isFunction(callback) && callback({errorMsg: errorMsg || Intl.get('failed.distribute.cluecustomer.to.sales','把线索客户分配给对应的销售失败')});
        });
    };
    //批量分配线索
    this.distributeCluecustomerToSaleBatch = function(submitObj,callback) {
        this.dispatch({error: false, loading: true});
        clueCustomerAjax.distributeCluecustomerToSaleBatch(submitObj).then((result) => {
            this.dispatch({error: false, loading: false});
            _.isFunction(callback) && callback({taskId: _.get(result,'batch_label','')});
        },(errorMsg) => {
            this.dispatch({error: true, loading: false});
            _.isFunction(callback) && callback({errorMsg: errorMsg || Intl.get('failed.distribute.cluecustomer.to.sales','把线索客户分配给对应的销售失败')});
        });
    };
    this.updateCluecustomerDetail = function(submitObj,callback) {
        var data = handleSubmitClueItemData(_.cloneDeep(submitObj));
        clueCustomerAjax.updateClueItemDetail(data).then((result) => {
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    };
    //线索标记为无效
    this.updateClueAvailability = function(submitObj,callback) {
        clueCustomerAjax.updateClueItemDetail(submitObj).then((result) => {
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    };
    //线索关联某个客户
    this.setClueAssociatedCustomer = function(submitObj,callback) {
        clueCustomerAjax.setClueAssociatedCustomer(submitObj).then((result) => {
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    };
    //删除某条线索
    this.deleteClueById = function(data,callback) {
        if (data.customer_clue_ids){
            var submitData = {
                customer_clue_ids: data.customer_clue_ids
            };
            clueCustomerAjax.deleteClueById(submitData).then((result) => {
                this.dispatch(data);
                _.isFunction(callback) && callback();
            },(errorMsg) => {
                _.isFunction(callback) && callback(errorMsg || Intl.get('crm.139', '删除失败'));
            });
        }else{
            this.dispatch(data);
        }

    };
    //处理申请详情的数据
    this.getApplyTryData = function(id, version_upgrade_id,version_data) {
        if(version_data){
            this.dispatch({error: false, result: version_data});
        }else{
            clueCustomerAjax.getApplyTryData(version_upgrade_id).then(result => {
                result.clueId = id;
                this.dispatch({error: false,result: result});
            },(error) => {
                this.dispatch({error: error});
            }); 
        }
    };

    //线索的全文搜索
    this.getClueFulltext = function(queryObj,callback) {
        //是否是在全部状态下返回数据
        this.dispatch({error: false, loading: true
        });
        clueCustomerAjax.getClueFulltext(queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, clueCustomerObj: result,callback: callback,queryObj: queryObj});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get('failed.to.get.clue.customer.list', '获取线索列表失败')
            });
        });
        
    };
    
    
    this.getClueFulltextSelfHandle = function(queryObj,callback) {
        //是否是在全部状态下返回数据
        this.dispatch({error: false, loading: true
        });
        clueCustomerAjax.getClueFulltextSelfHandle(queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, clueCustomerObj: result,callback: callback,queryObj: queryObj});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get('failed.to.get.clue.customer.list', '获取线索列表失败')
            });
        });
    };
    // 获取所有成员
    this.getAllSalesUserList = function(cb) {
        getAllSalesUserList((allUserList) => {
            this.dispatch(allUserList);
            if (cb) cb(allUserList);
        });
    };
    //释放线索
    this.releaseClue = function(clueIds, successFunc, errorFunc) {
        clueCustomerAjax.releaseClue({lead_ids: clueIds}).then(() => {
            _.isFunction(successFunc) && successFunc(clueIds);
        }, (errorMsg) => {
            _.isFunction(errorFunc) && errorFunc(errorMsg);
        });
    };
    //批量释放线索
    this.batchReleaseClue = function(condition, successFunc, errorFunc) {
        clueCustomerAjax.batchReleaseClue(condition).then(data => {
            _.isFunction(successFunc) && successFunc(data);
        }, errorMsg => {
            _.isFunction(errorFunc) && errorFunc(errorMsg);
        });
    };
    //线索名或电话唯一性的验证
    this.checkOnlyClueNamePhone = function(queryObj, isTerm, callback) {
        queryObj.isTerm = isTerm;
        clueCustomerAjax.checkOnlyClueNamePhone(queryObj).then(function(data) {
            if (callback) {
                callback(data);
            }
        }, function(errorMsg) {
            if (callback) {
                callback(errorMsg || Intl.get('clue.customer.check.only.exist', '线索名称唯一性校验失败'));
            }
        });
    };
}
module.exports = alt.createActions(ClueCustomerActions);