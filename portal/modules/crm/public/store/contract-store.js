import ContractAction from '../action/contract-action';

class ContractStore {
    constructor(){
        this.sortField = 'date'; // 排序字段
        this.order = 'descend'; //排序方向
        this.pageSize = 100;
        this.resetState();
        this.bindActions(ContractAction);
    }
    resetState(){
        // 合同列表
        this.contractList = {
            loading: true, // loading
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
            if (_.isArray(list) && list.length) {
                this.contractList.data = list;
            }
        }
    }
}

//使用alt导出store
export default alt.createStore(ContractStore , 'ContractStore');