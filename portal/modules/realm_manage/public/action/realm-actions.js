var realmAjax = require("../ajax/realm-ajax");
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
function RealmActions() {
    this.generateActions(
        'closeAddPanel',
        'afterEditRealm',
        'showRealmForm',
        'showOwnerForm',
        'infoPanel2OwnerForm',
        'showModalDialog',
        'hideModalDialog',
        'startUse',
        'stopUse',
        'updateCurPage',
        'updatePageSize',
        'showRealmInfo',
        'closeRightPanel',
        'returnInfoPanel',
        'updateSearchContent',
        'setCurRealm',
        //将新增的安全域信息加入到安全域列表中
        'expandRealmLists',
        //创建新的安全域
        'createRealms',
        //将创建失败的安全域从页面移除
        'removeFailRealm'

       
    );
    

    this.getCurRealmList = function (searchObj) {
        var _this = this;
        realmAjax.getCurRealmList(searchObj).then(function (listObj) {
            _this.dispatch(listObj);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        });
    };


    this.getCurRealmById = function (realmId) {
        var _this = this;
        realmAjax.getCurRealmById(realmId).then(function (realm) {
            _this.dispatch(realm);
        });
    };

    this.updateRealmStatus = function (realm) {
        var _this = this;
        realmAjax.updateRealmStatus(realm).then(function (data) {
            if (data) {
                _this.dispatch(realm);
            }
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
        });
    };
}

module.exports = alt.createActions(RealmActions);