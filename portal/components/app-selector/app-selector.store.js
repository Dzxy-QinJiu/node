/**
 * 应用选择器的store
 */

var AppSelectorAction = require("./app-selector.action");
var AppSelectorStoreMap = {};
var extend = require("extend");
//深度克隆
function deepClone(obj){
    if(_.isArray(obj)) {
        return extend(true , [] , obj);
    } else {
        return extend(true , {} , obj);
    }
}

function createStoreWithUniqueId(uniqueId) {

    function AppSelectorStore() {
        //从应用列表中选中的应用，设置角色和权限
        this.selectedApp = {};
        //组件唯一id
        this.uniqueId = uniqueId;
        //系统中所有应用列表
        this.totalApps = [];
        //在所有应用中，选出来的应用
        this.selectedApps = [];
        //是否在左边显示
        this.arrow_position = 'right';
        //是否显示应用下拉列表
        this.appLayerShow = false;
        //获取action
        var action = AppSelectorAction(this.uniqueId);
        //绑定action
        this.bindActions(action);
    }
    //扩展roles和permissions字段
    function expandRoleAndPermissionProperty(obj) {
        if(!_.isArray(obj.roles)) {
            obj.roles = [];
        }
        if(!_.isArray(obj.permissions)) {
            obj.permissions = [];
        }
    }

    //设置初始数据
    AppSelectorStore.prototype.setInitialData = function(obj) {
        if('totalApps' in obj) {
            var totalApps = obj.totalApps;
            if(!_.isArray(totalApps)) {
                totalApps = [];
            }
            totalApps = deepClone(totalApps);
            _.each(totalApps , function(obj) {
                expandRoleAndPermissionProperty(obj);
            });
            this.totalApps = totalApps;
        }
        if('selectedApps' in obj) {
            var selectedApps = obj.selectedApps;
            if(!_.isArray(selectedApps)) {
                selectedApps = [];
            }
            var clonedSelectedApps = deepClone(selectedApps);
            _.each(clonedSelectedApps , function(obj) {
                expandRoleAndPermissionProperty(obj);
            });
            this.selectedApps = clonedSelectedApps;
            //当前selectedApp重新放到selectedApps中，因为是clone的
            var _this = this;
            //将selectedApp重新赋值到selectedApps上
            _.find(this.selectedApps , function(targetApp , i) {
                if(targetApp.app_id === _this.selectedApp.app_id) {
                    _this.selectedApps.splice(i , 1 , _this.selectedApp);
                    return true;
                }
            })
        }
    };

    //添加应用
    AppSelectorStore.prototype.addApp = function(app) {
        //首先查找是否已经存在该应用
        var targetApp = _.find(this.selectedApps , function(appItem) {
            return app.app_id === appItem.app_id;
        });
        //不存在的时候，添加应用
        if(!targetApp) {
            this.selectedApps.push(app);
        }
        //设置隐藏弹出层
        this.appLayerShow = false;
    };
    //移除应用
    AppSelectorStore.prototype.removeApp = function(app) {
        //在selectedApps中移除app
        this.selectedApps = _.filter(this.selectedApps , function(appItem) {
            return appItem.app_id !== app.app_id;
        });
        //设置隐藏弹出层
        this.appLayerShow = false;
        //如果把选中的要设置权限的app移除掉了，则隐藏设置权限层
        if(app.app_id === this.selectedApp.app_id) {
            this.hidePermissionLayer();
        }
    };
    //设置显示位置（左边、右边）
    AppSelectorStore.prototype.setArrowPosition = function(arrow_position) {
        this.arrow_position = arrow_position;
    };
    //显示选择应用的层
    AppSelectorStore.prototype.showAppLayer = function() {
        this.appLayerShow = true;
    };
    //隐藏选择应用的层
    AppSelectorStore.prototype.hideAppLayer = function() {
        this.appLayerShow = false;
    };
    //发请求获取image的src
    AppSelectorStore.prototype.getImageSrcByAjax = function({app,src}) {
        var targetAppOfSelected = _.find(this.selectedApps , function(appItem) {
            return appItem.app_id === app.app_id;
        });
        if(targetAppOfSelected) {
            targetAppOfSelected.app_logo = src;
        }
    };
    //角色、权限变化后触发
    AppSelectorStore.prototype.rolesPermissionChange = function({roles,permissions}) {
        if(this.selectedApp.app_id) {
            this.selectedApp.roles = roles.slice();
            this.selectedApp.permissions = permissions.slice();
        }
    };
    AppSelectorStore.prototype.showPermissionLayerForApp = function(app) {
        //保留原始数据，改变的是克隆的数据，所以selectedApp要找到克隆的那个app
        var clonedApp = _.find(this.selectedApps , function(app_item) {
            return app.app_id === app_item.app_id;
        });
        this.selectedApp = clonedApp;
    };
    //隐藏权限选择层
    AppSelectorStore.prototype.hidePermissionLayer = function() {
        this.selectedApp = {};
    };
    return AppSelectorStore;
}


module.exports = function(uniqueId) {
    if(AppSelectorStoreMap[uniqueId]) {
        return AppSelectorStoreMap[uniqueId];
    }
    var store = alt.createStore(createStoreWithUniqueId(uniqueId) , 'AppSelectorStore' + uniqueId);
    store.destroy = function() {
        delete AppSelectorStoreMap[uniqueId];
    };
    AppSelectorStoreMap[uniqueId] = store;
    return store;
};

