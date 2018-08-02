import ContractAction from '../action/contract-action';

class ContractStore {
    constructor(){
        this.sortField = 'date'; // 排序字段
        this.order = 'descend'; //排序方向
        this.pageSize = 100;
        this.isAddFormShow = false; // 是否显示添加合同面板，默认false
        this.resetState();
        this.bindActions(ContractAction);
    }
    resetState(){
        // 合同列表
        this.contractList = {
            loading: false, // loading
            data: [], //数据列表
            errMsg: '' // 获取失败的提示
        };
    }
    // 获取合同信息
    getContractByCustomerId(result) {
        this.contractList.loading = result.loading;
        if (result.error) {
            this.contractList.errMsg = result.errMsg;
        } else {
            this.contractList.errMsg = '';
            let list = result.resData && result.resData.list || [];
            this.contractList.data = _.get(list, '[0]') && list || [];
        }
    }
    // 显示添加面板
    showForm() {
        this.isAddFormShow = true;
    }
    // 隐藏添加面板
    hideForm() {
        this.isAddFormShow = false;
    }
    // 更新列表信息
    refreshContractList(contract) {
        this.isAddFormShow = false;
        this.contractList.data.unshift(contract);
    }
    // 删除合同
    deleteContact(contract) {
        this.contractList.data = _.filter(this.contractList.data, item => item.id !== contract.id);
    }
}

//使用alt导出store
export default alt.createStore(ContractStore , 'ContractStore');