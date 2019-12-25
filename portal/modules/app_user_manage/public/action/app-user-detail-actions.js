/**
 * 应用用户基本资料的action
 */
//用户管理的ajax
var AppUserAjax = require('../ajax/app-user-ajax');
var AppUserUtil = require('../util/app-user-util');
import { altAsyncUtil } from 'ant-utils';
const {asyncDispatcher} = altAsyncUtil;
function AppUserDetailAction() {

    this.generateActions(
        //隐藏用户详情
        'dismiss',
        //获取用户详情
        'getUserDetail',
        //显示全部停用提示框
        'showDisableAllAppsModal',
        //全部停用
        'submitDisableAllApps',
        //取消全部禁用
        'cancelAllAppsModal',
        //取消显示停用成功
        'hideDisableSuccessMsg',
        //添加应用成功
        'addAppSuccess',
        //修改应用成功,
        'editAppSuccess',
        //修改(昵称，备注)成功
        'changeUserFieldSuccess',
        //修改客户
        'changeCustomer',
        //修改应用单个字段成功
        'changeAppFieldSuccess',
        'showAppDetail',
        //存放应用角色
        'setAppsRoles',
        //修改单个应用
        'updateApp'
    );

    //获取用户详情
    this.getUserDetail = function(userId) {
        var _this = this;
        AppUserAjax.getUserDetail(userId).then(function(userDetail) {
            _this.dispatch({loading: false,error: false,userDetail: userDetail});
        },function(errorMsg) {
            _this.dispatch({loading: false,error: true , userDetailErrorMsg: errorMsg});
        });
    };

    //全部停用
    this.submitDisableAllApps = function({user_id},callback) {
        var _this = this;
        this.dispatch({loading: true});
        AppUserAjax.disableAllAppsByUser(user_id).then(function(result) {
            _this.dispatch({error: false,result: result});
            _.isFunction(callback) && callback(user_id);
        },function(errorMsg) {
            _this.dispatch({error: true , errorMsg: errorMsg});
        });
    };

    //批量获取应用的角色信息
    this.getBatchRoleInfo = function(params, callback){
        this.dispatch({loading: true, error: false});
        AppUserAjax.getBatchRoleInfo(params).then((result) => {
            this.dispatch({loading: false, error: false, roleData: result});
            _.isFunction(callback) && callback(result);
        },(errorMsg) => {
            this.dispatch({loading: false, error: true , errorMsg: errorMsg});
        });
    };
    //批量获取应用的权限信息
    this.getBatchPermissionInfo = function(privilegeParams) {
        AppUserAjax.getBatchPermissionInfo(privilegeParams).then((privilegeData) => {
            this.dispatch(privilegeData);
        });
    };

}

module.exports = alt.createActions(AppUserDetailAction);