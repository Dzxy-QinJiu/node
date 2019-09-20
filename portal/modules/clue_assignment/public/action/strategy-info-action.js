import {editAssignmentStrategy, deleteAssignmentStrategy} from '../ajax';

class StrategyInfoAction {
    constructor() {
        this.generateActions(
            'clearDeleteMsg', //清除删除的错误提示
            'initialInfo',//重置状态
        );
    }

    //修改线索分配策略
    editAssignmentStrategy(strategy, callback) {
        let id = strategy.id;
        this.dispatch({ isSaving: true, saveResult: '', saveMsg: '' });
        editAssignmentStrategy(id, strategy).then(result => {
            let returnResult = {};
            // result 返回值为 'true', 'false'
            if(result) {
                returnResult = { isSaving: false, saveResult: 'success', saveMsg: '' };
                _.isFunction(callback) && callback(returnResult);

            } else {
                returnResult = { isSaving: false, saveResult: 'error', saveMsg: Intl.get('crm.219', '修改失败') };
                _.isFunction(callback) && callback(returnResult);

            }
            this.dispatch(returnResult);
        }, () => {
            let error = { isSaving: false, saveResult: 'error', saveMsg: Intl.get('crm.219', '修改失败') };
            _.isFunction(callback) && callback(error);
            this.dispatch(error);
        });
    }

    //删除线索分配策略
    deleteAssignmentStrategy(id, callback) {
        this.dispatch({isDeleting: true, deleteResult: '', deleteMsg: ''});
        deleteAssignmentStrategy(id).then((result) => {
            //返回的值为 'true', 'false'
            let returnResult = {};
            if(result) {
                returnResult = { isDeleting: false, deleteResult: 'success', deleteMsg: Intl.get('crm.138', '删除成功') };
                _.isFunction(callback) && callback(returnResult);
            } else {
                returnResult = { isDeleting: false, deleteResult: 'error', deleteMsg: Intl.get('crm.139', '删除失败') };
                _.isFunction(callback) && callback(returnResult);
            }
            this.dispatch(returnResult);
        }, () => {
            let error = { isDeleting: false, deleteResult: 'error', deleteMsg: Intl.get('crm.139', '删除失败') };
            _.isFunction(callback) && callback(error);
            this.dispatch(error);
        });
    }

}

export default alt.createActions(StrategyInfoAction);