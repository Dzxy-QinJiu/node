var ThirdAjax = require('../ajax/third-app-ajax');


class ThreePartyAppConfigActions {
    constructor() {
        this.generateActions(
            'dismiss', // 重置应用配置
        );
    }

    // 获取应用配置信息
    getAppConfigList(userId) {
        ThirdAjax.getAppConfigList(userId).then( (appConfigList) => {
            this.dispatch({loading: false, error: false, appConfigList: appConfigList});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true , appConfigErrorMsg: errorMsg ||
            Intl.get('user.third.get.app.failed', '获取应用配置信息失败')});
        });
    }
    
}

export default alt.createActions(ThreePartyAppConfigActions);