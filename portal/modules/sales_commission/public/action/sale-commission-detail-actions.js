import SalesCommissionAjax from '../ajax/index';

class SaleCommissionDetailActions {
    constructor() {
        this.generateActions(
            'setSort', // 设置排序
            'setGrantStatus', // 设置已发放的状态
            'setInitialState' // 重置
        );
    }
    // 单个的销售提成明细
    getSaleCommissionDetail(params, queryObj) {
        this.dispatch({ loading: true, error: false});
        SalesCommissionAjax.getSaleCommissionDetail(params, queryObj).then( (list) => {
            this.dispatch({ loading: false, error: false, list: list });
        } , (errMsg) => {
            this.dispatch({ loading: false, error: true, errMsg: errMsg });
        });
    }
}

export default alt.createActions(SaleCommissionDetailActions);