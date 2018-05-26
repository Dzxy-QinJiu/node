/**
 * Created by wangliping on 2016/4/20.
 */
var appAjax = require("../ajax/app-ajax");
var AppActions = require("./app-actions");
var cardEmitter = require("../../../../public/sources/utils/emitters").cardEmitter;

function AppFormActions() {
    this.generateActions(
        //设置是否正在保存
        'setSaveFlag',
        //设置是否正在获取管理员列表
        'setManagerListLoading',
        //设置是否正在获取所有者列表
        'setOwnerListLoading',
        //设置是否正在获取应用列表
        'setAllAppListLoading'
    );

    this.getAllAppList = function() {
        var _this = this;
        appAjax.getCurAppList().then(function(listObj) {
            _this.dispatch(listObj);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };
    //获取应用管理员列表
    this.getAppManagerList = function() {
        var _this = this;
        appAjax.getAppUserList("app_manager").then(function(userList) {
            _this.dispatch(userList);
        }, function(errorMsg) {
            _this.dispatch([]);
        });
    };
    //获取应用所有者列表
    this.getAppOwnerList = function() {
        var _this = this;
        appAjax.getAppUserList("app_owner").then(function(userList) {
            _this.dispatch(userList);
        }, function(errorMsg) {
            _this.dispatch([]);
        });
    };

    //保存应用
    this.addApp = function(app) {
        var _this = this;
        appAjax.addApp(app).then(function() {
            //保存成功后的处理
            _this.dispatch({saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功！")});
        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
        });
    };
    //编辑应用
    this.editApp = function(app, callback) {
        var _this = this;
        appAjax.editApp(app).then(function(data) {
            if (data) {
                //保存成功后的处理
                const editResult = {saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功！")};
                if (callback) {
                    //只修改标签时的处理
                    callback.call(_this, editResult);
                    AppActions.afterEditAppTag(app);
                } else {
                    _this.dispatch(editResult);
                    if (app.managers) {
                        app.managers = JSON.parse(app.managers);
                    }
                    //修改成功后刷新左侧列表对应应用卡片及其详情的数据
                    AppActions.afterEditApp(app);
                }
            } else {
                const editResult = {saveResult: "error", saveMsg:Intl.get("common.save.failed", "保存失败")};
                if (callback) {
                    callback.call(_this, editResult);
                } else {
                    _this.dispatch(editResult);
                }
            }
        }, function(errorMsg) {
            //保存失败后的处理
            var editResult = {saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")};
            if (callback) {
                callback.call(_this, editResult);
            } else {
                _this.dispatch(editResult);
            }
        });
    };

    //清空提示
    this.resetSaveResult = function(formType, saveResult) {
        if (saveResult == "success") {
            if (formType == "add") {
                cardEmitter.emit(cardEmitter.ADD_CARD);
                //添加成功后关闭右侧面板
                AppActions.closeAddPanel();
                //清空搜索内容
                AppActions.updateSearchContent("");
            } else if (formType == "edit") {
                //修改成功后返回详情
                AppActions.returnInfoPanel();
            }
        }
        this.dispatch();
    };
}

module.exports = alt.createActions(AppFormActions);