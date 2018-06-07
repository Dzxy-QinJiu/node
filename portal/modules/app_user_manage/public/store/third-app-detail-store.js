var ThirdAppDetailActions = require('../action/third-app-detail-actions');
var AppUserPanelSwitchAction = require('../action/app-user-panelswitch-actions');
import { defaultPlatforms } from '../util/consts';
import AppUserUtil from '../util/app-user-util';
import { message } from 'antd';
import ThirdPartyAppConfigAction from '../action/third-party-app-config-actions';


function ThirdAppDetailStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(ThirdAppDetailActions);
}

ThirdAppDetailStore.prototype.resetState = function() {
    this.status = 'display';
    this.platforms = _.clone(defaultPlatforms);
    this.result = {
        addApp: '',
        editApp: '',
        getAppDetail: '',
        changeAppStatus: '',
    };
    this.errMsg = {
        addApp: '',
        editApp: '',
        getAppDetail: '',
        changeAppStatus: '',
    };
    this.app = {
        'id': '',
        'name': '',
        'type': '',
        'platform': '',
        'status': 'enable',
        'user_id': '',
        'redirect_uri': '',
        'about': '',
        'logo': '',
        'create_time': null,
        'app_key': '',
        'app_secret': ''
    };
};

ThirdAppDetailStore.prototype.changePanelStatus = function(status) {
    this.status = status;
};

/**
 * 原型方法内部才能取到store的实例，所以此处传字符串
 * @param {string} status 请求状态
 * @param {string} errMsg 错误信息
 * @param {function} fn   成功后的回调,会传入result
 */
const resultHandler = function(status, errMsg, fn) {
    return function(result) {
        if (result.loading) {
            this[status] = 'loading';
        }
        else if (result.error) {
            this[status] = 'error';
            this[errMsg] = result.errorMsg;
        }
        else {
            this[status] = '';
            this[errMsg] = '';
            fn.call(this, result);
        }
    };
};

//get app detail
ThirdAppDetailStore.prototype.getAppDetail = resultHandler('result.getAppDetail', 'errMsg.getAppDetail', function(result) {
    this.app = result.data;
    if (this.app.create_time) {
        this.app.create_time = moment(this.app.create_time).format('YYYY-MM-DD hh:ss');
    }
});

//add app
ThirdAppDetailStore.prototype.addApp = function(result) {
    if (result.loading) {
        this.result.addApp = 'loading';
    } else if (result.error) {
        this.result.addApp = 'error';
        this.errMsg.addApp = result.errorMsg;
    } else {
        this.result.addApp = '';
        message.success(Intl.get('user.user.add.success', '添加成功'));
        ThirdPartyAppConfigAction.getAppConfigList(result.data.user_id);
        setTimeout(() => {
            ThirdAppDetailActions.getPlatforms();
            AppUserPanelSwitchAction.resetState();
        });
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
    }
};

//edit app
ThirdAppDetailStore.prototype.editApp = resultHandler('result.editApp', 'result.error', function(result) {
    message.success(Intl.get('user.third.thirdapp.success.edit', '修改成功'));
    this.app = result.paramObj;
    if (this.app.create_time) {
        this.app.create_time = moment(this.app.create_time).format('YYYY-MM-DD hh:ss');
    }
    ThirdPartyAppConfigAction.getAppConfigList(this.app.user_id);
    setTimeout(() => {
        ThirdAppDetailActions.getPlatforms();
        ThirdAppDetailActions.changePanelStatus('display');
    });
});

//chagne status
ThirdAppDetailStore.prototype.changeAppStatus = resultHandler('result.changeAppStatus', 'errMsg.changeAppStatus', function(result) {
    let tipMap = {
        'enable': Intl.get('user.third.thirdapp.success.enable', '启用成功'),
        'disable': Intl.get('user.third.thirdapp.success.disable', '禁用成功')
    };

    message.success(tipMap[result.paramObj.status]);
    this.app.status = result.paramObj.status;
    ThirdPartyAppConfigAction.getAppConfigList(result.paramObj.userId);
});

ThirdAppDetailStore.prototype.getPlatforms = resultHandler('result.getPlatforms', 'errMsg.getPlatforms', function(result) {
    this.platforms = _.union(defaultPlatforms, result.data);
});

module.exports = alt.createStore(ThirdAppDetailStore, 'ThirdAppDetailStore');