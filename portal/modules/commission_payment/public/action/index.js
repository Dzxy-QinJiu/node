import CommissionPaymentAjax from '../ajax/index';

class CommissionPaymentActions {
    constructor() {
        this.generateActions(
            'onSelectedRoleFlagChange', // 选择角色
            'setSelectDate', // 选择时间
            'setSort', // 设置排序
            'addCommission', // 添加提成
            'refreshCurrentCommission', // 更新提成,
            'deleteCommission', // 删除提成
            'setInitialPartlyState' // 重置
        );
    }
    // 提成发放列表
    getCommissionPaymentList(params, queryObj) {
        this.dispatch({ loading: true, error: false});
        CommissionPaymentAjax.getCommissionPaymentList(params, queryObj).then( (list) => {
            this.dispatch({ loading: false, error: false, list: list });
        } , (errMsg) => {
            this.dispatch({ loading: false, error: true, errMsg: errMsg });
        });
    }
}

export default alt.createActions(CommissionPaymentActions);