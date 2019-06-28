
var CluePoolAjax = require('../ajax');
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
import {handleSubmitClueItemData} from '../utils/clue-customer-utils';
function CluePoolActions() {
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
        'setSortField',
        'updateClueCustomers',//更新线索列表
        //添加、补充跟进记录后，列表中最后联系数据的更新
        'updateCustomerLastContact',
        'updateCurrentClueRemark',
    );
    //获取销售列表
    this.getSalesManList = function(cb) {
        //客户所属销售（团队）下拉列表的数据获取
        CluePoolAjax.getSalesManList().then((list) => {
            this.dispatch(list);
            if (cb) cb();
        }, (errorMsg) => {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };
    //把线索客户分配给对应的销售
    this.distributeCluecustomerToSale = function(submitObj,callback) {
        this.dispatch({error: false, loading: true});
        CluePoolAjax.distributeCluecustomerToSale(submitObj).then((result) => {
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
        CluePoolAjax.distributeCluecustomerToSaleBatch(submitObj).then((result) => {
            this.dispatch({error: false, loading: false});
            _.isFunction(callback) && callback({taskId: _.get(result,'batch_label','')});
        },(errorMsg) => {
            this.dispatch({error: true, loading: false});
            _.isFunction(callback) && callback({errorMsg: errorMsg || Intl.get('failed.distribute.cluecustomer.to.sales','把线索客户分配给对应的销售失败')});
        });
    };
    this.updateCluecustomerDetail = function(submitObj,callback) {
        var data = handleSubmitClueItemData(_.cloneDeep(submitObj));
        CluePoolAjax.updateClueItemDetail(data).then((result) => {
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    };
    //线索关联某个客户
    this.setClueAssociatedCustomer = function(submitObj,callback) {
        CluePoolAjax.setClueAssociatedCustomer(submitObj).then((result) => {
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
        CluePoolAjax.deleteClueById(submitData).then((result) => {
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
        CluePoolAjax.getClueFulltext(queryObj).then((result) => {
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
module.exports = alt.createActions(CluePoolActions);
