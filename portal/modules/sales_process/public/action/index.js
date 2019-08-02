/**
 * Created by hzl on 2019/8/1.
 */
import SalesProcessAjax from '../ajax';

class SalesProcessAction {
    constructor() {
        this.generateActions(

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
    addSalesProcess(addProcessObj) {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.addSalesProcess(addProcessObj).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }

    // 更新销售流程
    updateSalesProcess(upDateProcessObj) {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.updateSalesProcess(upDateProcessObj).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }

}

export default alt.createActions(SalesProcessAction);
