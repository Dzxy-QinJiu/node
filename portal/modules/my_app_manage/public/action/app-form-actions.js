/**
 * Created by wangliping on 2016/4/20.
 */
var appAjax = require('../ajax/app-ajax');
var AppActions = require('./app-actions');
function AppFormActions() {
    this.generateActions(
        'setSaveFlag',//设置是否正在保存
        'setEditAppAuthFlag',//是否设置应用角色权限
        'setManagerListLoading',//设置是否正在获取管理员列表
        'setAllAppListLoading'//设置是否正在获取应用列表
    );

    this.getAllAppList = function() {
        var _this = this;
        appAjax.grantApplicationList().then(function(list) {
            _this.dispatch(list);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    this.getAppManagerList = function() {
        var _this = this;
        appAjax.getAppManagerList().then(function(userList) {
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
            _this.dispatch({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功！')});
        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败')});
        });
    };
    //编辑应用
    this.editApp = function(app) {
        var _this = this;
        appAjax.editApp(app).then(function(data) {
            if (data) {
                //保存成功后的处理
                _this.dispatch({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功！')});
                if (app.managers) {
                    app.managers = JSON.parse(app.managers);
                }
                //修改成功后刷新左侧列表对应应用卡片及其详情的数据
                AppActions.afterEditApp(app);
            }

        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败')});
        });
    };

    //清空提示
    this.resetSaveResult = function(saveResult, isEditAppAuth) {
        if (saveResult == 'success' && !isEditAppAuth) {
            //修改成功后返回详情(修改应用权限成功不需要返回详情页)
            AppActions.returnInfoPanel();
        }
        this.dispatch();
    };
}

module.exports = alt.createActions(AppFormActions);