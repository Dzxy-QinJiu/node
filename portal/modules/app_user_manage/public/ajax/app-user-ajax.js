var AppUserUtil = require('../util/app-user-util');
var appAjaxTrans = require('../../../common/public/ajax/app');
import { storageUtil } from 'ant-utils';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajaxPro from 'MOD_DIR/common/ajaxUtil';

//批量获取应用的角色信息
exports.getBatchRoleInfo = params => ajaxPro('getBatchRoleInfo', params);
//批量获取应用的权限信息
exports.getBatchPermissionInfo = params => ajaxPro('getBatchPermissionInfo', params);

//申请延期 多应用
exports.applyDelayMultiApp = params => ajaxPro('applyDelayMultiApp', params);

//获取近期登录的用户列表
var recentLoginUsersAjax = null;
exports.getRecentLoginUsers = function(params) {
    var Deferred = $.Deferred();
    if(recentLoginUsersAjax) {
        recentLoginUsersAjax.abort();
    }
    recentLoginUsersAjax = $.ajax({
        url: '/rest/recent/login/users',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr , textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.list.get.failed', '获取用户列表失败'));
            }
        }
    });
    return Deferred.promise();
};

/**
 * 获取应用用户列表
 */
//用户ajax请求返回值
var appUserAjax = null;
exports.getAppUserList = function(obj) {
    obj = obj || {};
    if(appUserAjax) {
        appUserAjax.abort();
    }
    var pageSize = parseInt(storageUtil.local.get(AppUserUtil.localStorageUserViewPageSizeKey));
    if(!pageSize || !_.isNumber(pageSize) || isNaN(pageSize)) {
        pageSize = 20;
    }
    //团队id
    if (obj.team_ids){
        //从销售首页点击即将过期用户的数字跳转过来时，传的team_ids是字符串
        obj.team_ids = obj.team_ids;
        if (_.isArray(obj.team_ids)){
            //在已有用户页面，点击筛选团队时，team_ids是数组
            obj.team_ids = obj.team_ids.join(',');
        }
    }else{
        obj.team_ids = '';
    }
    //用于下拉加载的id
    obj.id = obj.id || '',
    //一页多少条
    obj.page_size = obj.page_size || 20,
    //应用id
    obj.app_id = obj.app_id || '',
    //关键词
    obj.keyword = obj.keyword || '',
    //用户类型
    obj.user_type = obj.user_type || '',
    //启用、禁用
    obj.user_status = obj.user_status || '',
    // 所属客户
    obj.customer_unknown = obj.customer_unknown || '',
    //排序顺序
    obj.sort_order = obj.sort_order || '',
    //排序字段
    obj.sort_field = obj.sort_field || '',
    //角色字段
    obj.role_id = obj.role_id || '',
    //到期停用
    obj.over_draft = obj.over_draft || '',
    //开始时间
    obj.start_date = obj.start_date || '',
    //结束时间
    obj.end_date = obj.end_date || '',
    //异常登录
    obj.user_exception = obj.user_exception || '',
    //销售id
    obj.sales_id = obj.sales_id || '';
    let queryObj = obj;

    //针对过期时间进行处理
    var outdate = obj.outdate;
    //永不过期处理
    if(outdate === 'is_filter_forever') {
        queryObj.is_filter_forever = 'true';
    } else {
        //一周内过期
        if(outdate === '1w') {
            queryObj.start_date = moment().valueOf();
            queryObj.end_date = moment().add(7, 'days').endOf('day').valueOf();
        } else {
            //过期的
            if(outdate === '1') {
                queryObj.end_date = moment().valueOf();
            } else if(outdate === '0') {
                //未过期的
                queryObj.start_date = moment().valueOf();
            }
        }
    }
    delete queryObj.outdate;
    var requestObj = {};
    for(var key in queryObj) {
        if(queryObj[key] !== '' && key !== 'tag_all') {
            requestObj[key] = queryObj[key];
        }
    }
    //如果是从客户页面跳转过来的，会传customer_id
    if(obj.customer_id) {
        requestObj.customer_id = obj.customer_id;
    }

    var Deferred = $.Deferred();
    appUserAjax = $.ajax({
        url: '/rest/appuser',
        dataType: 'json',
        type: 'get',
        data: requestObj,
        timeout: 180 * 1000,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr , textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.app.user.list.failed', '获取应用的用户列表失败'));
            }
        }
    });
    return Deferred.promise();
};

var appUserDetailAjax = null;
exports.getUserDetail = function(userId) {
    var Deferred = $.Deferred();
    appUserDetailAjax && appUserDetailAjax.abort();
    appUserDetailAjax = $.ajax({
        url: '/rest/appuser/detail/' + userId,
        dataType: 'json',
        type: 'get',
        timeout: 180 * 1000,
        success: function(userDetail) {
            //获取的用户详情为空时，说明详情获取失败了
            if (_.isEmpty(userDetail)) {
                Deferred.reject(Intl.get('user.get.user.detail.failed', '获取用户详情失败'));
            } else {
                Deferred.resolve(userDetail);
            }
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.get.user.detail.failed', '获取用户详情失败'));
            }
        }
    });
    return Deferred.promise();
};

/**
 * 添加应用用户
 */
exports.addAppUser = function(user) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appuser',
        dataType: 'json',
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify(user),
        timeout: 180 * 1000,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.add.user.failed', '添加用户失败'));
        }
    });
    return Deferred.promise();
};

/**
 * 修改应用用户
 */
exports.editAppUser = function(user,succCallback,errCallback) {
    var Deferred = $.Deferred();
    var userData = user;
    //用于兼容新旧输入组件
    if(user.id){
        userData.user_id = user.id;
        delete userData.id;
    }
    $.ajax({
        url: '/rest/appuser',
        dataType: 'json',
        contentType: 'application/json',
        type: 'put',
        data: JSON.stringify(userData),
        timeout: 180 * 1000,
        success: function(newUser) {
            _.isFunction(succCallback) ? succCallback() : null;
            Deferred.resolve(newUser);
        },
        error: function(xhr) {
            _.isFunction(errCallback) ? errCallback() : null;
            Deferred.reject(xhr.responseJSON || Intl.get('errorcode.17','修改用户失败'));
        }
    });
    return Deferred.promise();
};

/**
 * 获取应用列表
 */
exports.getApps = function() {
    var Deferred = $.Deferred();
    appAjaxTrans.getGrantApplicationListAjax().sendRequest({integration: true, page_size: 1000}).
        success(function(list) {
            Deferred.resolve(list);
        }).error(function(xhr, code , errText) {
            Deferred.reject(Intl.get('errorcode.53', '获取应用列表失败'));
        }).timeout(function() {
            Deferred.reject(Intl.get('errorcode.53', '获取应用列表失败'));
        });
    return Deferred.promise();
};

/**
 * 获取销售人员
 */
exports.getSales = function(groupId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/getSalesTeamMemberList/' + groupId,
        dataType: 'json',
        type: 'get',
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || '获取销售人员列表失败');
        }
    });
    return Deferred.promise();
};

/**
 * 全部停用
 */
exports.disableAllAppsByUser = function(user_id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appuser/disable_apps',
        dataType: 'json',
        type: 'post',
        data: {
            user_id: user_id,
        },
        timeout: 180 * 1000,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.all.stop.failed', '全部停用失败'));
        }
    });
    return Deferred.promise();
};

/**
 * 添加应用
 */
exports.addApp = function(appList) {
    var Deferred = $.Deferred();
    var DEFAULT_ERROR_MSG = Intl.get('errorcode.54', '添加应用失败');
    $.ajax({
        url: '/rest/appuser/addapp',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(appList),
        timeout: 180 * 1000,
        success: function(result) {
            if(result) {
                Deferred.resolve(appList);
            } else {
                Deferred.reject(DEFAULT_ERROR_MSG);
            }
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || DEFAULT_ERROR_MSG);
        }
    });
    return Deferred.promise();
};
/**
 * 批量操作
 */
exports.batchUpdate = function(field, submitData,selectedAppId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appuser/batch',
        type: 'put',
        data: {
            application_ids: selectedAppId,
            field: field,
            data: JSON.stringify(submitData)
        },
        timeout: 180 * 1000,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            var errorMsg = xhr.responseJSON || Intl.get('errorcode.20', '批量操作失败');
            Deferred.reject(errorMsg);
        }
    });
    return Deferred.promise();
};

/**
 * 获取某个客户下的用户列表
 */
exports.getCustomerUserList = function(obj) {
    var Deferred = $.Deferred();
    //首先获取localStorage中保存的页数
    var pageSize = parseInt(storageUtil.local.get(AppUserUtil.localStorageCustomerViewPageSizeKey));
    if(!pageSize || !_.isNumber(pageSize) || isNaN(pageSize)) {
        pageSize = 20;
    }
    $.ajax({
        url: '/rest/appuser/customer/' + obj.customer_id,
        dataType: 'json',
        type: 'get',
        data: {
            num: obj.num,
            page_size: pageSize,
            filter_content: obj.keyword
        },
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject((xhr && xhr.responseJSON) || Intl.get('user.crm.user.failed', '获取客户下的用户列表失败'));
        }
    });
    return Deferred.promise();
};

//修改用户的单个应用
exports.editApp = function(appInfo) {
    var Deferred = $.Deferred();
    var DEFAULT_ERROR_MSG = Intl.get('user.edit.app.failed', '修改应用失败');
    $.ajax({
        url: '/rest/appuser/editapp',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(appInfo),
        timeout: 180 * 1000,
        success: function(flag) {
            if (flag) {
                Deferred.resolve(flag);
            } else {
                Deferred.reject(DEFAULT_ERROR_MSG);
            }
        },
        error: function(xhr) {
            var responseJSON = xhr.responseJSON || DEFAULT_ERROR_MSG;
            Deferred.reject(responseJSON);
        }
    });
    return Deferred.promise();
};

//管理员直接延期
exports.delayTime = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/batch_delay',
        type: 'post',
        dataType: 'json',
        data: data,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.batch.delay.failed', '批量延期失败'));
        }
    });
    return Deferred.promise();
};

//申请用户
exports.applyUser = function(data) {
    data = {reqData: JSON.stringify(data)};
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/base/v1/user/apply_grants',
        type: 'post',
        dataType: 'json',
        data: data,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('common.apply.failed', '申请失败'));
        }
    });
    return Deferred.promise();
};

//编辑用户应用单个字段
exports.editAppField = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/appdetail',
        type: 'put',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            //操作成功返回true
            if(result === true) {
                Deferred.resolve(result);
            } else {
                Deferred.reject( Intl.get('common.edit.failed', '修改失败'));
            }
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('common.edit.failed', '修改失败'));
        }
    });
    return Deferred.promise();
};

//申请修改密码
exports.applyChangePasswordAndOther = function(data) {
    const ERROR_MSG = Intl.get('user.apply.password.failed', '申请修改密码失败');
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/apply/password',
        type: 'post',
        data: data,
        success: function(result) {
            //操作成功返回申请对象
            if(_.get(result,'id')) {
                Deferred.resolve(result);
            } else {
                Deferred.reject(ERROR_MSG);
            }
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || ERROR_MSG);
        }
    });
    return Deferred.promise();
};

// 添加一个用户时，提示用户名信息
exports.addOneUserSuggestName = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add/one/user/suggest',
        type: 'get',
        dataType: 'json',
        data: data,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.get.suggest.name.error', '获取建议用户名失败'));
        }
    });
    return Deferred.promise();
};
// 获取安全域信息列表
exports.getRealmList = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/realm/list',
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.info.get.managed.realm.failed', '获取安全域信息失败'));
        }
    });
    return Deferred.promise();
};
// 获取用户查询条件
exports.getUserCondition = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/userquery/condition',
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.info.get.user.condition.failed', '获取用户查询条件失败'));
        }
    });
    return Deferred.promise();
};