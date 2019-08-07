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
        this.customerStageList = [{
            sales_process_id: '1',
            id: '11',
            order: 1,
            name: '信息',
            description: '初始录入的客户初始录入的客户初始录入的客户初始录入的客户初始录入的客户初始录入的客户',
            play_books: '大多数非法发范德萨范德萨范德萨佛挡杀佛',
            sales_activities: [{
                id: 's1',
                name: '核心客户信息',
                description: 'fdfdfddddddd',
                stage_id: 'ad'
            }]
        }, {
            sales_process_id: '1',
            id: '12',
            order: 2,
            name: '意向',
            description: '22意向客户初始录入的客户初始录入的客户初始录入的客户初始录入的客户初始录入的客户',
            play_books: '222大多数非法发范德萨范德萨范德萨佛挡杀佛',
            sales_activities: [{
                id: 's1',
                name: '222核心客户信息',
                description: '22fdfdfddddddd',
                stage_id: 'ad'
            }]
        }, {
            sales_process_id: '1',
            id: '13',
            order: 3,
            name: '试用',
            description: '33意向客户初始录入的客户初始录入的客户初始录入的客户初始录入的客户初始录入的客户',
            play_books: '333大多数非法发范德萨范德萨范德萨佛挡杀佛',
            sales_activities: [{
                id: 's1',
                name: '222核心客户信息',
                description: '22fdfdfddddddd',
                stage_id: 'ad'
            },{
                id: 's2',
                name: '333核心客户信息',
                description: '3322fdfdfddddddd',
                stage_id: 'ad1'
            }]
        }];
        this.loading = true;
        this.getCustomerStageListErrMsg = '';
        this.currentCustomerStage = emptyCustomerStage;
        this.currentCustomerStageList = [];
        this.isShowCustomerStageForm = false; // 是否显示客户阶段表单，默认false
        this.isShowCustomerStageTransferOrder = false; // 是否显示客户阶段变更，默认false
        this.isShowDeleteModalDialog = false; // 是否显示删除客户阶段的模态框，默认false
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

    // 添加客户阶段
    addCustomerStage() {

    }

    // 显示客户阶段模态框
    showCustomerStageModalDialog() {
        this.isShowDeleteModalDialog = true;
    }

    // 关闭客户阶段模态
    closeCustomerStageModalDialog() {
        this.isShowDeleteModalDialog = false;
    }
}

export default alt.createStore(CustomerStageStore, 'CustomerStageStore');
