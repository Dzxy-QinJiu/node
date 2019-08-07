/**
 * Created by hzl on 2019/8/6.
 * 客户阶段-action
 */
import SalesProcessAjax from '../ajax';

class CustomerStageAction {
    constructor() {
        this.generateActions(
            'toggleCustomerStageDetail', // 展开收起客户阶段详情（剧本、销售行为）
            'showCustomerStageForm', // 显示客户阶段表单
            'closeCustomerStageForm', // 关闭客户阶段表单
            'showCustomerStageModalDialog', // 显示客户阶段模态框
            'closeCustomerStageModalDialog', // 关闭客户阶段模态
            'showCustomerStageInfoPanel', // 显示客户阶段信息面板
            'closeCustomerStageInfoPanel', // 关闭客户阶段信息面板
        );
    }
    // 获取客户阶段列表
    getCustomerStageList(salesProcessId) {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.getCustomerStageBySaleProcessId(salesProcessId).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }
}

export default alt.createActions(CustomerStageAction);