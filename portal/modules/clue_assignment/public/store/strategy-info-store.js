import StrategyInfoAction from '../action/strategy-info-action';

class StrategyInfoStore {
    constructor() {
        this.isSaving = false; //是否正在保存线索分配策略
        this.saveResult = ''; //是否保存成功,error:失败，success:成功
        this.saveMsg = ''; //保存后的提示信息
        this.isDeleting = false;//是否正在删除线索策略
        this.deleteResult = '';//是否删除成功, error失败，success:成功
        this.deleteMsg = '';//删除后的提示信息
        this.bindActions(StrategyInfoAction);
    }

    //修改线索分配策略
    editClueAssignmentStrategy({isSaving, saveResult, saveMsg}) {
        this.isSaving = isSaving;
        this.saveResult = saveResult;
        this.saveMsg = saveMsg;
    }

    //删除线索分配策略
    deleteClueAssignmentStrategy({isDeleting, deleteResult, deleteMsg}) {
        this.isDeleting = isDeleting;
        this.deleteResult = deleteResult;
        this.deleteMsg = deleteMsg;
    }
}

export default alt.createStore(StrategyInfoStore);