const contractAjax = require('../ajax/contract-ajax');

class ContractAction {
    constructor() {
        this.generateActions(
            'resetState',
            'showForm'
        );
    }
    // 获取合同信息
    getContractByCustomerId(reqData, reqBody) {
        this.dispatch({loading: true,error: false});
        contractAjax.getContractByCustomerId(reqData, reqBody).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        },(errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    }
}

export default alt.createActions(ContractAction);
