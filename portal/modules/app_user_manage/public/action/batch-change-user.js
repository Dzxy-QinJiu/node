import {APPLY_TYPES} from 'PUB_DIR/sources/utils/consts';

/**
 * 批量变更用户action
 */
//用户管理的ajax
var AppUserAjax = require('../ajax/app-user-ajax');
var AppUserUtil = require('../util/app-user-util');
//批量操作推送相关逻辑
var batchOperate = require('../../../../public/sources/push/batch');

//操作对应关系
var OperateTextMap = {
    GRANT_DELAY: Intl.get('user.batch.delay', '批量延期'),
    CHANGE_PASSWORD: Intl.get('common.edit.password', '修改密码'),
    GRANT_CUSTOMER: Intl.get('common.belong.customer', '所属客户'),
    GRANT_TYPE: Intl.get('user.batch.open.type', '开通类型'),
    GRANT_STATUS: Intl.get('common.app.status', '开通状态'),
    GRANT_PERIOD: Intl.get('user.open.cycle', '开通周期'),
    GRANT_APPLICATION: Intl.get('user.batch.app.open', '开通产品'),
    GRANT_ROLES: Intl.get('user.batch.auth.set', '权限设置')
};

function BatchChangeUserActions() {
    this.generateActions(
        //radio的值改变
        'radioValueChange',
        //自定义radio的值改变
        'customRadioValueChange',
        //设置时间
        'timeChange',
        //获取应用列表
        'getApps',
        //设置选中的应用
        'setSelectedApps',
        //重置
        'resetState',
        //隐藏提交提示
        'hideSubmitTip',
        //显示选择app的错误
        'showAppError',
        //显示客户错误
        'showCustomerError',
        //隐藏客户错误
        'hideCustomerError',
        //不显示选择app的错误
        'hideAppError',
        //提交添加应用
        'submitAddApp',
        //更换批量操作tab类型
        'changeMultipleSubType',
        //更改重新选中的客户
        'onCustomerChoosen',
        //权限，角色变化
        'rolesPermissionsChange',
        //延期数字变化
        'delayTimeNumberChange',
        //延期单位发生变化
        'delayTimeRangeChange',
        //延期时间改变
        'delayTimeChange',
        //备注改变(延期备注、启用、应用备注、修改密码备注)
        'remarkChange',
        //批量操作的应用改变
        'batchAppChange',
        //权限设置的应用改变
        'rolePermissionAppChange',
        //设置批量应用选择错误
        'setBatchSelectedAppError',
        //设置权限角色设置应用选择错误
        'setRolePermissionSelectedAppError',
        // 批量变更权限没有选择角色错误
        'batchChangePermissionNoSelectRoleError',
        //设置默认批量操作的选中的应用
        'setDefaultBatchSelectedApps',
        // 将延期时间设置为截止时间（具体到xx年xx月xx日）
        'setDelayDeadlineTime'
    );
    /**
     * 获取应用列表
     */
    this.getApps = function() {
        var _this = this;
        AppUserAjax.getApps().then(function(list) {
            _this.dispatch({error: false, list: list});
        } , function(errorMsg) {
            _this.dispatch({error: true, errorMsg: errorMsg});
        });
    };
    /**
     * 添加一个新应用
       data           提交的数据
       subType        子面板类型
       selectedAppId  选中的应用id
       isSales        是否是销售
       extra          额外信息，批量推送完成之后，界面使用
     */
    this.submitAddApp = function(obj) {
        var _this = this;
        _this.dispatch({loading: true});
        var field = 'grant_application';
        var selectedAppId = '';
        if(obj.subType) {
            field = obj.subType;
        }
        if(field === 'grant_type' ||
            field === 'grant_status' ||
            field === 'grant_period' ||
            field === 'grant_roles' ||
            field === 'grant_delay'
        ){
            selectedAppId = obj.selectedAppId;
        }
        //批量操作的用户个数
        var userCount = obj.data && obj.data.user_ids && obj.data.user_ids.length || 0;
        //提交给后台要求是json字符串
        if(field === 'grant_delay') {
            obj.data.user_ids = JSON.stringify(obj.data.user_ids);
            var submitObj = {
                user_ids: obj.data.user_ids,
                over_draft: obj.data.over_draft,
                application_ids: selectedAppId
            };
            let timeObj = {};
            if (obj.data.delay_time) {
                timeObj.delay_time = obj.data.delay_time;
                submitObj.delay_time = obj.data.delay_time;
            } else if (obj.data.end_date) {
                timeObj.end_date = obj.data.end_date;
                submitObj.end_date = obj.data.end_date;
            }
            //管理员直接延期
            AppUserAjax.delayTime(submitObj).then(function(taskId) {
                //保存提交参数，以便推送批量操作进度时使用更新界面
                var taskParams = AppUserUtil.formatTaskParams(timeObj , selectedAppId , obj.extra);
                //保存任务参数
                batchOperate.saveTaskParamByTaskId(taskId , taskParams , {
                    //需要弹框
                    showPop: true,
                    //在用户页面处理
                    urlPath: '/users'
                });
                //添加到任务列表，仅在当前页显示
                batchOperate.addTaskIdToList(taskId);
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: taskId,
                    total: userCount,
                    running: userCount,
                    typeText: OperateTextMap.GRANT_DELAY
                });
                //返回成功
                _this.dispatch({error: false});
            }, function(errorMsg) {
                _this.dispatch({error: true, errorMsg: errorMsg});
            });
        }else if(field === 'sales_change_password') {
            //todo
            var submitObj = {
                apply_type: APPLY_TYPES.APPLY_PWD_CHANGE,
                customer_id: obj.data.customer_id,
                user_ids: obj.data.user_ids,
                remark: obj.data.remark,
                application_ids: selectedAppId
            };
            //调用修改密码
            AppUserAjax.applyChangePasswordAndOther(submitObj).then(function(newAppObj) {
                _this.dispatch({error: false, app: newAppObj});
            }, function(errorMsg) {
                _this.dispatch({error: true, errorMsg: errorMsg});
            });
        } else {
            AppUserAjax.batchUpdate(field , obj.data, selectedAppId).then(function(taskId) {
                //保存提交参数，以便推送批量操作进度时使用更新界面
                var taskParams = AppUserUtil.formatTaskParams(obj.data , selectedAppId , obj.extra);
                //保存任务参数
                batchOperate.saveTaskParamByTaskId(taskId , taskParams , {
                    //需要弹框
                    showPop: true,
                    //在用户页面处理
                    urlPath: '/users'
                });
                //保存到任务列表，仅在当前页显示
                batchOperate.addTaskIdToList(taskId);
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: taskId,
                    total: userCount,
                    running: userCount,
                    typeText: OperateTextMap[field && field.toUpperCase()] || ''
                });
                //返回界面成功
                _this.dispatch({error: false});
            } , function(errorMsg) {
                _this.dispatch({error: true, errorMsg: errorMsg});
            });
        }
    };
    //用户申请延期、开通状态（多应用）
    this.applyDelayMultiApp = function(obj) {
        this.dispatch({loading: true});
        AppUserAjax.applyDelayMultiApp(obj).then((result) => {
            if (result) {
                this.dispatch({error: false, loading: false});
            } else {
                this.dispatch({error: true, loading: false, errorMsg: Intl.get('common.apply.failed', '申请失败')});
            }
        }).catch((errMsg) => {
            this.dispatch({error: true, loading: false, errorMsg: errMsg || Intl.get('common.apply.failed', '申请失败')});
        });
    };
}

module.exports = alt.createActions(BatchChangeUserActions);