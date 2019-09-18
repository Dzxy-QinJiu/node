import {editAssignmentStrategy, deleteAssignmentStrategy} from '../ajax';

class StrategyInfoAction {
    constructor() {
        this.generateActions(
        );
    }

    //修改线索分配策略
    editAssignmentStrategy(strategy, callback) {
        let id = strategy.id;
        this.dispatch({ isSaving: true, saveResult: '', saveMsg: '' });
        editAssignmentStrategy(id, strategy).then(result => {
            let success = { isSaving: false, saveResult: 'success', saveMsg: result };
            if(!_.isEmpty(callback) && _.isFunction(callback)) {
                callback(success);
            }
            this.dispatch(success);
        }, errorMsg => {
            let error = { isSaving: false, saveResult: 'error', saveMsg: errorMsg };
            if(!_.isEmpty(callback) && _.isFunction(callback)) {
                callback(error);
            }
            this.dispatch(error);
        });
    }

    //删除线索分配策略
    deleteAssignmentStrategy(id, callback) {
        this.dispatch({isDeleting: true});
        deleteAssignmentStrategy(id).then(result => {
            let success = { isDeleting: false, deleteResult: 'success', deleteMsg: result };
            if(!_.isEmpty(callback) && _.isFunction(callback)) {
                callback(success);
            }
            this.dispatch(success);
        }, errorMsg => {
            let error = { isDeleting: false, deleteResult: 'error', deleteMsg: errorMsg };
            if(!_.isEmpty(callback) && _.isFunction(callback)) {
                callback(error);
            }
            this.dispatch(error);
        });
    }

}

export default alt.createActions(StrategyInfoAction);