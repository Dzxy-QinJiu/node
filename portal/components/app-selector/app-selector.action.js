/**
 * 应用选择器的action
 */

//应用选择器的ajax
var appSelectorAjax = require("./app-selector.ajax");
var AppSelectorActionMap = {};

function AppSelectorAction() {

    this.generateActions(
        'addApp',//添加应用
        'removeApp',//移除应用
        'setArrowPosition',//设置应用选择器的位置(左、右)
        'showAppLayer',//显示app选择层
        'hideAppLayer',//隐藏app选择层
        'setInitialData',//从prop接到数据，同步到store中
        'showPermissionLayerForApp',//选中一个应用，显示权限层
        'hidePermissionLayer',//隐藏选择权限层
        'rolesPermissionChange',//角色、权限变化后触发
        'getImageSrcByAjax'//根据ajax获取image的图片
    );

    //通过ajax请求获取图片的src
    this.getImageSrcByAjax = function(app) {
        var _this = this;
        appSelectorAjax.getAppInfo(app.app_id).then(function(data) {
            _this.dispatch({app : app , src : data.image});
        });
    };
}

module.exports = function(uniqueId) {
    if(AppSelectorActionMap[uniqueId]) {
        return AppSelectorActionMap[uniqueId];
    }
    var action = alt.createActions(AppSelectorAction);
    action.destroy = function() {
        delete AppSelectorActionMap[uniqueId];
    };
    AppSelectorActionMap[uniqueId] = action;
    return action;
};

