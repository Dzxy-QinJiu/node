//用户是否存在
var userExistAjax;
exports.userExists = function(userName) {
    const Deferred = $.Deferred();
    userExistAjax && userExistAjax.abort();
    userExistAjax = $.ajax({
        url: '/rest/appuser/name/' + encodeURIComponent(userName),
        dataType: "json",
        success: (user) => {
            if(user && user.user_id) {
                Deferred.resolve(user);
            } else {
                Deferred.reject();
            }
        },
        error: (xhr,statusText) => {
            if(statusText !== 'abort') {
                Deferred.reject();
            }
        }
    });
    return Deferred.promise();
};


// 校验用户名的合法性
var checkUserNameAjax;
exports.checkUserName = function(obj) {
    const Deferred = $.Deferred();
    checkUserNameAjax && checkUserNameAjax.abort();
    checkUserNameAjax = $.ajax({
        url: '/rest/apply/user_name/valid',
        dataType: "json",
        type: 'get',
        data: {
            user_name: obj.user_name,
            customer_id: obj.customer_id
        },
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,statusText) => {
            if(statusText !== 'abort') {
                Deferred.reject();
            }
        }
    });
    return Deferred.promise();
};

