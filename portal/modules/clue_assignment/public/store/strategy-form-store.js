import StrategyFormAction from '../action/strategy-form-action';

class StrategyFormStore {
    constructor() {
        this.isSaving = false; //是否正在保存线索分配策略
        this.saveResult = ''; //是否保存成功,error:失败，success:成功
        this.saveMsg = ''; //保存后的提示信息
        this.bindActions(StrategyFormAction);
    }

    //保存线索分配策略
    saveClueAssignmentStrategy({isSaving, saveResult, saveMsg}) {
        this.isSaving = isSaving;
        this.saveResult = saveResult;
        this.saveMsg = saveMsg;
    }
}

export default alt.createStore(StrategyFormStore);