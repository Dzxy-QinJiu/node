import RealmConfigAction from '../action/realm-config-action';

class RealmConfigStore {
    constructor() {
        this.strategy = '1'; // 密码策略
        this.isLoading = false;
        this.getRealmConfigErrMsg = '';
        this.setRealmConfigErrMsg = '';
        this.bindActions(RealmConfigAction);
    }
    getRealmStrategy(result) {
        if (result.loading) {
            this.isLoading = true;
        } else if (result.error) {
            this.isLoading = false;
            this.getRealmConfigErrMsg = result.errorMsg;
        } else if(result.data) {
            this.isLoading = false;
            this.getRealmConfigErrMsg = '';
            this.strategy = result.data.pwd_strategy;
            if(!this.strategy) {               
                this.strategy = '1';
            }            
        } else {
            this.getRealmConfigErrMsg = Intl.get('config.manage.realm.get.failed','获取密码策略失败');
        }
    }

    updateRealmStrategy(result) {
        if (!result.loading) {
            this.updating = false;                   
            if (result.error) {
                this.isLoading = false;
                this.setRealmConfigErrMsg = result.errorMsg;
            }
            else if (result.data) {
                this.strategy = result.value.pwd_strategy;
            }
            else {
                this.setRealmConfigErrMsg = Intl.get('config.manage.realm.update.failed','修改密码策略失败');
            }
        }
        else {
            this.updating = true;
            this.strategy = result.value;
        }
    }




}

//使用alt导出store
export default alt.createStore(RealmConfigStore, 'RealmConfigStore');