import TeleConfigAction from '../action/tele-config-action';

class TeleConfigStore {
    constructor() {
        this.telesList = []; // 密码策略
        this.isLoading = false;
        this.isAdding = false;
        this.deleting = false;
        this.getTelesErrMsg = "";
        this.delTeleErrMsg = "";
        this.bindActions(TeleConfigAction);
    }
    getTeleList(result) {
        if (result.loading) {
            this.isLoading = true;
        } else if (result.error) {
            this.isLoading = false;
            this.getTelesErrMsg = result.errorMsg;
        } else {
            this.isLoading = false;
            this.telesList = result.data.result;
            this.getTelesErrMsg = "";           
            
        }
    }

    delTele(result) {
        if (!result.loading) {
            this.deleting = false;
            this.showSaveBtn = false;
            if (result.error) {                
                this.delTeleErrMsg = result.errorMsg;
            }
            else if (result.data.flag) {
                this.strategy = result.value;
            }            
        }
        else {
            this.deleting = true;            
        }
    }

}

//使用alt导出store
export default alt.createStore(TeleConfigStore, "TeleConfigStore");