import OnlineUserFilterAction from "../action/filter";
import AppUserUtil from '../../../app_user_manage/public/util/app-user-util';

function OnlineUserFilterStore() {
    this.condition = {
        client_id: "",
        tag: "",
        is_expire: ""
    };

    this.bindActions(OnlineUserFilterAction);
}

OnlineUserFilterStore.prototype.setCondition = function(condition) {
    if('client_id' in condition){
        let obj = AppUserUtil.getLocalStorageObj('onlineAppId', condition.client_id);
        localStorage.setItem(AppUserUtil.saveSelectAppKeyUserId, JSON.stringify(obj));
    }
    $.extend(this.condition, condition);
};

module.exports = alt.createStore(OnlineUserFilterStore , 'OnlineUserFilterStore');
