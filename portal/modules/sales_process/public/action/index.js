/**
 * Created by hzl on 2019/8/1.
 */
import SalesProcessAjax from '../ajax';

class SalesProcessAction {
    constructor() {
        this.generateActions(
            'showAddProcessFormPanel', // 显示添加销售流程表单程面板
            'closeAddProcessFormPanel', // 关闭销售流程表单程面板
            'upDateSalesProcessList', // 更新销售流程列表
            'showProcessDetailPanel', // 显示销售流程详情面板
            'closeProcessDetailPanel', // 关闭销售流程详情面板
            'afterEditSaleProcessField', // 编辑销售流程字段
            'setShowCustomerStage', // 设置显示客户阶段界面
        );
    }
    // 获取销售流程
    getSalesProcess() {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.getSalesProcess().then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }

    // 添加销售流程
    addSalesProcess(addProcessObj, cb) {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.addSalesProcess(addProcessObj, cb).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
            _.isFunction(cb) && cb();
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
            _.isFunction(cb) && cb();
        } );
    }

    // 更新销售流程
    updateSalesProcess(upDateProcessObj, cb) {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.updateSalesProcess(upDateProcessObj).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
            _.isFunction(cb) && cb();
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
            _.isFunction(cb) && cb();
        } );
    }

}

export default alt.createActions(SalesProcessAction);
