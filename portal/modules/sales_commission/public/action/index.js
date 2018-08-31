import SalesCommissionAjax from '../ajax/index';

class SalesCommissionActions {
    constructor() {
        this.generateActions(
            'setSelectedStandardFlag', // 选择是否达标
            'setSelectDate', // 选择时间
            'setSort', // 设置排序
            'getUserInfo', // 获取销售的信息
            'setRecalculateTips', // 设置重新计算的提示
            'setInitialPartlyState', // 重置
            'setInitialState'//重置所有state
        );
    }
    // 销售提成列表
    getSalesCommissionList(params, queryObj) {
        this.dispatch({ loading: true, error: false});
        SalesCommissionAjax.getSalesCommissionList(params, queryObj).then( (list) => {
            this.dispatch({ loading: false, error: false, list: list });
        } , (errMsg) => {
            this.dispatch({ loading: false, error: true, errMsg: errMsg });
        });
    }
    // 更新销售提成
    updateSaleCommission(queryObj) {
        this.dispatch({ error: false });
        SalesCommissionAjax.updateSaleCommission(queryObj).then( (resData) => {
            this.dispatch({ error: false, resData: resData });
        } , (errMsg) => {
            this.dispatch({ error: true, errMsg: errMsg });
        });
    }
}

export default alt.createActions(SalesCommissionActions);