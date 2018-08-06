/**
 * 筛选面板的action
 */
const AnalysisAjax = require('../ajax');
// 异步操作返回promis,成功会传入{data}，失败传入{errorMsg}
const asyncDispatcher = function(ajax) {
    return function(paramObj) {
        var _this = this;
        _this.dispatch({ errorMsg: '', loading: true });
        return new Promise((resolve, reject) => {
            ajax(paramObj)
                .then(function(data) {                   
                    _this.dispatch({ loading: false, data, paramObj, errorMsg: '' });
                    resolve({ data });
                })
                .fail(function(errorMsg) {
                    _this.dispatch({ loading: false, data: null, errorMsg, paramObj });
                    reject({ errorMsg });
                });
        });
    };
};

function AnalysisAction() {
    this.generateActions(
        'resetState',
        'getFilterRange',
        'getAnalysisData',
        'getTableList',
        'saveTableInfo',
        'getTableInfo',
        'setSortId',
        'getContractData',
        'getRepaymentData',
        'getCostData',
        'setSelectorHeight'
    );
    this.getFilterRange = asyncDispatcher(AnalysisAjax.getFilterRange);
    this.getContractData = asyncDispatcher(AnalysisAjax.getContractData);
    this.getRepaymentData = asyncDispatcher(AnalysisAjax.getRepaymentData);
    this.getCostData = asyncDispatcher(AnalysisAjax.getCostData);
    this.getTableList = asyncDispatcher(AnalysisAjax.getTableList);
    this.getTableInfo = asyncDispatcher(AnalysisAjax.getTableInfo);
    this.saveTableInfo = asyncDispatcher(AnalysisAjax.saveTableInfo);
}

export default alt.createActions(AnalysisAction);