import StrategyInfoAction from '../action/strategy-info-action';

class StrategyInfoStore {
    constructor() {
        this.initialInfo();
        this.bindActions(StrategyInfoAction);
    }
    //初始化
    initialInfo() {
        this.isSaving = false; //是否正在保存线索分配策略
        this.saveResult = ''; //是否保存成功,error:失败，success:成功
        this.saveMsg = ''; //保存后的提示信息
        this.isDeleting = false;//是否正在删除线索策略
        this.deleteResult = '';//是否删除成功, error失败，success:成功
        this.deleteMsg = '';//删除后的提示信息
    }
    //修改线索分配策略
    editAssignmentStrategy({isSaving, saveResult, saveMsg}) {
        this.isSaving = isSaving;
        this.saveResult = saveResult;
        this.saveMsg = saveMsg;
    }
    //删除线索分配策略
    deleteAssignmentStrategy({isDeleting, deleteResult, deleteMsg}) {
        this.isDeleting = isDeleting;
        this.deleteResult = deleteResult;
        this.deleteMsg = deleteMsg;
    }
    //清除删除账号的错误提示
    clearDeleteMsg() {
        this.deleteMsg = '';
        this.deleteResult = '';
    }
}

export default alt.createStore(StrategyInfoStore);