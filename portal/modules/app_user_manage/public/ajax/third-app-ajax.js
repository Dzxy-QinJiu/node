const ajaxPro = function(config) {
    let jqXHR = null;
    return function(param) {
        var Deferred = $.Deferred();
        if (typeof param === 'object') {
            config.data = param;
        }        
        //默认格式为json
        if(!config.dataType) {
            config.dataType = 'json';
        } 
        _.extend(config,{
            success: function(result) {
                Deferred.resolve(result);
            },
            error: function(xhr, status) {
                if (status !== 'abort') {
                    Deferred.reject(xhr.responseJSON);
                }
            }
        });        
        jqXHR && jqXHR.abort();
        jqXHR = $.ajax(config);
        return Deferred.promise();
    };
};

// 添加app
exports.addApp = ajaxPro({
    url: '/rest/thirdapp/add',
    type: 'post'    
});

// 编辑app
exports.editApp = ajaxPro({
    url: '/rest/thirdapp/edit',
    type: 'put'
});

// 改变app状态
exports.changeAppStatus = ajaxPro({
    url: '/rest/thirdapp/status',
    type: 'put'
});

// 查询app详情
exports.getAppDetail = ajaxPro({
    url: '/rest/thirdapp/query',
    type: 'get',
});

// 获取所有应用平台
exports.getPlatforms = ajaxPro({
    url: '/rest/thirdapp/getPlatforms',
    type: 'get'
});

let AppConfigListAjax = null;
exports.getAppConfigList = function(userId) {
    var Deferred = $.Deferred();
    AppConfigListAjax && AppConfigListAjax.abort();
    AppConfigListAjax = $.ajax({
        url: '/rest/user/third/party/app/config/' + userId, //获取应用列表的url
        dataType: 'json',
        type: 'get',
        success: (appConfigList) => {
            Deferred.resolve(appConfigList);
        },
        error: (xhr, status) => {
            if (status !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 根据用户user_id获取用户基本信息
let userBasicInfoAjax = null;
exports.getUserBasicInfo = (userId) => {
    let Deferred = $.Deferred();
    userBasicInfoAjax && userBasicInfoAjax.abort();
    userBasicInfoAjax = $.ajax({
        url: '/rest/appuser/detail/' + userId,
        type: 'get',
        dateType: 'json',
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,status) => {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};