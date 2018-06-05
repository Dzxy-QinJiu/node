import ThreePartyAppConfigActions from '../action/third-party-app-config-actions';

class ThreePartyAppConfigStore {
    constructor() {
        this.resetState(); //初始化state数据
        this.bindActions(ThreePartyAppConfigActions); //绑定action
    }
    resetState() {
        this.isLoading = true; //默认loading状态
        this.getAppConfigErrorMsg = ''; //获取应用配置失败的错误提示
        this.initialApp = []; //初始状态的app对象
    }

    dismiss() {
        this.resetState();
    }

    //获取应用配置详情
    getAppConfigList(result) {
        this.isLoading = false;
        if(result.error) {
            this.getAppConfigErrorMsg = result.appConfigErrorMsg;
            this.initialApp = {};
        } else {
            this.getAppConfigErrorMsg = '';
            this.initialApp = result.appConfigList;
        }
    }
}

//使用alt导出store
export default alt.createStore(ThreePartyAppConfigStore , 'ThreePartyAppConfigStore');