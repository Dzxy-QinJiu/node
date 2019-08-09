/**
 * Created by hzl on 2019/8/6.
 */
import CustomerStageAction from '../action/customer-stage-action';

let emptyCustomerStage = {
    id: '',
    name: '',
    index: '',
    description: ''
};

class CustomerStageStore {
    constructor() {
        this.setInitialData();
        this.bindActions(CustomerStageAction);
    }
    setInitialData() {
        this.customerStageList = [];
        this.loading = true;
        this.getCustomerStageListErrMsg = '';
        this.currentCustomerStage = emptyCustomerStage;
        this.currentCustomerStageList = [];
        this.isShowCustomerStageForm = false; // 是否显示客户阶段表单，默认false
        this.isShowCustomerStageTransferOrder = false; // 是否显示客户阶段变更，默认false
        this.customerStageEditOrder = false;
        this.isSavingCustomerStage = false;
        this.isSavingCustomerStageHome = false;
        this.saveStageErrMsg = '';
        this.deleteStageErrMsg = '';
    }

    // 获取客户阶段列表
    getCustomerStageList(result) {
        if (result.loading) {
            this.loading = result.loading;
            this.getCustomerStageListErrMsg = '';
        } else {
            this.loading = false;
            if (result.error) {
                this.getCustomerStageListErrMsg = result.errorMsg;
            } else {
                this.customerStageList = result.resData;
            }
        }
        this.currentCustomerStageList = _.cloneDeep(this.customerStageList); //返回对象的深拷贝
    }

    // 展开收起客户阶段详情（剧本、销售行为）
    toggleCustomerStageDetail(customerStage) {
        customerStage.isShowMore = !customerStage.isShowMore;
    }

    // 显示客户阶段表单
    showCustomerStageForm(customerStage) {
        this.isShowCustomerStageForm = true;
        if (customerStage === 'addCustomerStage') {
            this.currentCustomerStage = emptyCustomerStage;
        } else {
            this.currentCustomerStage = customerStage;
        }
    }

    // 关闭客户阶段表单
    closeCustomerStageForm() {
        this.isShowCustomerStageForm = false;
    }

    // 更新客户阶段列表
    updateCustomerStageList(customerStage) {
        let flag = customerStage.flag;
        if (flag) {
            if (flag === 'delete') { //删除
                _.remove(this.customerStageList, customerStage);
            } else if (flag === 'edit') {
                let upDateStage = _.find(this.customerStageList, item => item.id === customerStage.id);
                upDateStage.name = customerStage.name;
                upDateStage.description = customerStage.description;
            }
        } else { // 添加
            this.customerStageList.push(customerStage);
        }
    }

    // 显示客户阶段变更顺序
    showCustomerStageTransferOrder() {
        this.isShowCustomerStageTransferOrder = true;
    }

    // 关闭客户阶段变更顺序
    closeCustomerStageTransferOrder() {
        this.isShowCustomerStageTransferOrder = false;
    }

    // 上移客户阶段
    customerStageOrderUp(customerStage) {
        let oldOrder = parseInt(customerStage.order);
        this.customerStageList = _.filter(this.customerStageList, item => {
            let order = item.order;
            if (parseInt(item.order) === oldOrder) {
                order = (parseInt(item.order) - 1).toString();
            }

            if (parseInt(item.order) === (oldOrder - 1)) {
                order = (parseInt(item.order) + 1).toString();
            }

            item.order = order;
            return true;
        });

        this.customerStageList = this.customerStageList.sort((item1, item2) => {
            return item1.order - item2.order;
        });
    }

    // 下移客户阶段
    customerStageOrderDown(customerStage) {
        let oldOrder = parseInt(customerStage.order);
        this.customerStageList = _.filter(this.customerStageList, item => {
            let order = item.order;
            if (parseInt(item.order) === oldOrder) {
                order = (parseInt(item.order) + 1).toString();
            }

            if (parseInt(item.order) === (oldOrder + 1)) {
                order = (parseInt(item.order) - 1).toString();
            }
            item.order = order;
            return true;
        });

        this.customerStageList = this.customerStageList.sort((item1, item2) => {
            return item1.order - item2.order;
        });
    }

    // 显示客户阶段模态框
    showCustomerStageModalDialog(customerStage) {
        customerStage.isShowDeleteModalDialog = true;
    }

    // 关闭客户阶段模态
    closeCustomerStageModalDialog(customerStage) {
        customerStage.isShowDeleteModalDialog = false;
    }
}

export default alt.createStore(CustomerStageStore, 'CustomerStageStore');
