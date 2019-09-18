import {saveAssignmentStrategy} from '../ajax';

class StrategyFormAction {
    constructor() {
        this.generateActions(
        );
    }

    saveClueAssignmentStrategy(strategy, callback) {
        this.dispatch({isSaving: true, saveResult: '', saveMsg: ''});
        saveAssignmentStrategy(strategy).then(result => {
            if(!_.isEmpty(callback) && _.isFunction(callback)) {
                callback(result.strategy);
            }
            this.dispatch({ isSaving: false, saveResult: 'success', saveMsg: result });
        }, errorMsg => {
            if(!_.isEmpty(callback) && _.isFunction(callback)) {
                callback();
            }
            this.dispatch({ isSaving: false, saveResult: 'error', saveMsg: errorMsg });
        });
    }
}

export default alt.createActions(StrategyFormAction);