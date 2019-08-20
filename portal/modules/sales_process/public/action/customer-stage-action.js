/**
 * Created by hzl on 2019/8/6.
 * 客户阶段-action
 */
import CustomerStageAjax from '../ajax';

class CustomerStageAction {
    constructor() {
        this.generateActions(
            'setInitialData', // 初始化数据
            'toggleCustomerStageDetail', // 展开收起客户阶段详情（剧本、销售行为）
            'showCustomerStageForm', // 显示客户阶段表单
            'closeCustomerStageForm', // 关闭客户阶段表单
            'showCustomerStageTransferOrder', // 显示客户阶段变更顺序
            'closeCustomerStageTransferOrder', // 关闭客户阶段变更顺序
            'customerStageOrderUp', // 上移客户阶段
            'customerStageOrderDown', // 下移客户阶段
            'showCustomerStageModalDialog', // 显示客户阶段模态框
            'closeCustomerStageModalDialog', // 关闭客户阶段模态
            'showCustomerStageInfoPanel', // 显示客户阶段信息面板
            'closeCustomerStageInfoPanel', // 关闭客户阶段信息面板
            'updateCustomerStageList', // 更新客户阶段列表
            'showCustomerStageDetail', // 显示客户阶段详情
            'closeCustomerStageDetail' // 关闭客户阶段详情

        );
    }
    // 获取客户阶段列表
    getCustomerStageList(salesProcessId) {
        this.dispatch({loading: true, error: false});
        CustomerStageAjax.getCustomerStageBySaleProcessId(salesProcessId).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }
    // 获取客户阶段的销售行为
    getCustomerStageSaleBehavior() {
        this.dispatch({error: false});
        CustomerStageAjax.getCustomerStageSaleBehavior().then( (result) => {
            this.dispatch({resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg, error: true});
        } );
    }
    // 获取客户阶段的自动变更条件
    getCustomerStageAutoConditions() {
        this.dispatch({error: false});
        CustomerStageAjax.getCustomerStageAutoConditions().then( (result) => {
            this.dispatch({resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg, error: true});
        } );
    }
}

export default alt.createActions(CustomerStageAction);