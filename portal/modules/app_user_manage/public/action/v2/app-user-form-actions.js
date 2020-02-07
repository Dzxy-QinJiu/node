import AppUserAjax from '../../ajax/app-user-ajax';
import AppUserUtil from '../../util/app-user-util';
import batchOperate from '../../../../../public/sources/push/batch';
import commonAppAjax from 'MOD_DIR/common/public/ajax/app';

class AppUserFormActions {
    constructor() {
        this.generateActions(
            //上一步、下一步
            'turnStep',
            //显示客户错误
            'showCustomerError',
            //隐藏客户错误
            'hideCustomerError',
            //选中客户
            'customerChoosen',
            //重置表单
            'resetState',
            //保存选中的应用
            'setSelectedApps',
            //没有选中应用时，显示错误提示
            'showSelectedAppsError',
            //隐藏提交完成的（成功、失败）提示
            'hideSubmitTip',
            //保存应用的特殊配置
            'saveAppsSetting',
            // 添加应用时，没有选择角色的错误提示
            'noSelectRoleError',
            // 添加多个应用时，有应用没有选择角色的错误提示
            'someAppsNoSelectRoleError',
            //设置选中的组织
            'setSelectedOrganization',
            //将应用的特殊配置同步到全局配置
            'syncCustomAppSettingToGlobalSetting',
            // 开通时间的错误提示
            'showOpenTimeErrorTips'
        );
    }
    getCurrentRealmApps() {
        this.dispatch({loading: true});
        AppUserAjax.getApps().then((list) => {
            this.dispatch({list: list});
        },() => {
            this.dispatch({error: true});
        });
    }
    addAppUser(submitData,extraData,successCallback) {
        this.dispatch({error: false , loading: true});
        AppUserAjax.addAppUser(submitData).then((taskId) => {
            //创建用户的参数
            var taskParams = AppUserUtil.formatTaskParams(submitData , [] , extraData);
            //将参数存储到sessionStorage
            batchOperate.saveTaskParamByTaskId(taskId , taskParams , {
                //需要弹框
                showPop: true,
                //在用户页面处理
                urlPath: '/users'
            });
            //添加任务id，仅在当前页显示
            batchOperate.addTaskIdToList(taskId);
            //创建用户个数
            var userCount = parseInt(submitData.number) || 0;
            //界面上立即显示一个初始化推送
            batchOperate.batchOperateListener({
                taskId: taskId,
                total: userCount,
                running: userCount,
                typeText: Intl.get('user.add.user', '创建用户')
            });
            //返回页面操作成功
            this.dispatch({error: false});
            _.isFunction(successCallback) && successCallback();
        } , (errorMsg) => {
            this.dispatch({error: true , errorMsg: errorMsg});
        });
    }

    // 获取所选应用的默认配置信息
    getSelectedAppsDefault(apps) {
        let appIds = _.map(apps, 'app_id');
        if (!_.isEmpty(appIds)) {
            commonAppAjax.getAppsDefaultConfigAjax().sendRequest({
                client_id: appIds.join(','),
                with_addition: false
            }).success((dataList) => {
                if (!_.isEmpty(dataList)) {
                    this.dispatch({appIds: appIds, dataList: dataList});
                }
            });
        }
    }
}

export default alt.createActions(AppUserFormActions);