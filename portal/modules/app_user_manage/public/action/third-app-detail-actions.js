/**
 * 第三方应用编辑的action
 */
var ThirdAjax = require("../ajax/third-app-ajax");

const asyncDispatchProcessor = function (ajax) {
    return function (paramObj) {
        var _this = this;
        _this.dispatch({error: false, loading: true});
        ajax(paramObj).then(function(data) {
            //统一将请求参数传回store，对象名为paramObj
            _this.dispatch({error: false,loading: false, data, paramObj});
        } , function(errorMsg){
            _this.dispatch({error: true,loading: false, errorMsg, paramObj});
        });
    };
};

function ThirdAppDetailActions() {
    this.generateActions(
        "resetState",
        "addApp",
        "editApp",
        "getAppDetail",
        "changeAppStatus",
        "changePanelStatus",
        "getPlatforms"
    );
    //添加app
    this.addApp = asyncDispatchProcessor(ThirdAjax.addApp);
    
    //编辑app
    this.editApp = asyncDispatchProcessor(ThirdAjax.editApp);
    
    //停用启用app
    this.changeAppStatus = asyncDispatchProcessor(ThirdAjax.changeAppStatus);
    
    //查询app详情
    this.getAppDetail = asyncDispatchProcessor(ThirdAjax.getAppDetail);

    //获取全部应用平台
    this.getPlatforms = asyncDispatchProcessor(ThirdAjax.getPlatforms);

}

module.exports=  alt.createActions(ThirdAppDetailActions);