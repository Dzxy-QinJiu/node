import {saveAssignmentStrategy} from '../ajax';

class StrategyFormAction {
    constructor() {
        this.generateActions(
            'initialForm', //初始化编辑面板
        );
    }

    saveClueAssignmentStrategy(strategy, callback) {
        this.dispatch({isSaving: true, saveResult: '', saveMsg: ''});
        saveAssignmentStrategy(strategy).then(result => {
            _.isFunction(callback) && callback(result);
            this.dispatch({ isSaving: false, saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功') });
        }, errorMsg => {
            _.isFunction(callback) && callback();
            this.dispatch({ isSaving: false, saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败') });
        });
    }
}

export default alt.createActions(StrategyFormAction);