/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
var clueCustomerAjax = require('../ajax/clue-customer-ajax');
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
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
        'afterAssignSales',//分配销售之后
        'setKeyWord',//设置关键字
        'setLastClueId',//用于设置下拉加载的最后一个线索的id
        'setSortField'
    );
    //联系人电话唯一性的验证
    this.checkOnlyContactPhone = function(queryObj, callback) {
        clueCustomerAjax.checkOnlyCustomer(queryObj).then(function(data) {
            if (callback) {
                callback(data);
            }
        }, function(errorMsg) {
            if (callback) {
                callback(errorMsg || Intl.get('crm.194', '联系人电话唯一性验证失败'));
            }
        });
    };
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
    //线索名称唯一性校验
    this.checkOnlyClueName = function(queryObj, callback) {
        clueCustomerAjax.checkOnlyCustomer(queryObj).then(function(data) {
            _.isFunction(callback) && callback(data);
        }, function(errorMsg) {
            _.isFunction(callback) && callback(errorMsg || Intl.get('clue.customer.check.only.exist', '线索名称唯一性校验失败'));
        });
    };
    //校验线索电话的唯一性
    this.checkOnlyCluePhone = function(queryObj, callback) {
        clueCustomerAjax.checkOnlyCustomer(queryObj).then(function(data) {
            _.isFunction(callback) && callback(data);
        }, function(errorMsg) {
            _.isFunction(callback) && callback(errorMsg || Intl.get('clue.check.only.clue.phone','线索电话唯一性校验失败'));
        });
    };
    //添加或更新跟进内容
    this.addCluecustomerTrace = function(submitObj,callback) {
        this.dispatch({error: false, loading: true});
        clueCustomerAjax.addCluecustomerTrace(submitObj).then((result) => {
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
    //标记线索是否有效
    this.updateCluecustomerDetail = function(submitObj,callback) {
        clueCustomerAjax.updateCluecustomerDetail(submitObj, true).then((result) => {
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
        var submitData = {
            customer_clue_ids: data.customer_clue_ids
        };
        clueCustomerAjax.deleteClueById(submitData).then((result) => {
            this.dispatch(data);
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            _.isFunction(callback) && callback(errorMsg || Intl.get('crm.139', '删除失败'));
        });
    };

    //线索的全文搜索
    this.getClueFulltext = function(queryObj) {
        //是否是在全部状态下返回数据
        this.dispatch({error: false, loading: true
        });
        clueCustomerAjax.getClueFulltext(queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, clueCustomerObj: result
            });
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get('failed.to.get.clue.customer.list', '获取线索客户列表失败')
            });
        });
    };
}
module.exports = alt.createActions(ClueCustomerActions);