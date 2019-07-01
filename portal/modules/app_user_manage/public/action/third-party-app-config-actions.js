var ThirdAjax = require('../ajax/third-app-ajax');
import { userBasicInfoEmitter } from 'PUB_DIR/sources/utils/emitters';

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

    // 获取用户基本信息
    getUserBasicInfo(userId) {
        ThirdAjax.getUserBasicInfo(userId).then( (result) => {
            const userInfo = {
                data: _.get(result, 'user'),
                loading: false,
                errorMsg: ''
            };
            userBasicInfoEmitter.emit(userBasicInfoEmitter.GET_USER_BASIC_INFO, userInfo);
        }, (errorMsg) => {
            const userInfo = {
                data: null,
                loading: false,
                errorMsg: errorMsg || Intl.get('user.info.get.user.info.failed', '获取用户信息失败')
            };
            userBasicInfoEmitter.emit(userBasicInfoEmitter.GET_USER_BASIC_INFO, userInfo);
        } );
    }


}

export default alt.createActions(ThreePartyAppConfigActions);