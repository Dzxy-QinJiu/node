/**
 * 用户管理-已有用户-编辑单个应用
 */
var React = require('react');
var createReactClass = require('create-react-class');
import AppUserPanelSwitchAction from '../../action/app-user-panelswitch-actions';
import UserDetailEditAppActions from '../../action/v2/user-detail-edit-app-actions';
import UserDetailEditAppStore from '../../store/v2/user-detail-edit-app-store';
import AppPropertySetting from '../v3/app-property-setting';
import {Tabs, Icon, Alert} from 'antd';
import AlertTimer from '../../../../../components/alert-timer';
import OperationStepsFooter from '../../../../../components/user_manage_components/operation-steps-footer';
import AppUserUtil from '../../util/app-user-util';
import PropTypes from 'prop-types';
var LAYOUT_CONSTANTS = AppUserUtil.LAYOUT_CONSTANTS;//右侧面板常量

//记录上下留白布局
const LAYOUT = {
    TAB_TOP_HEIGHT: 66,
    TAB_BOTTOM_PADDING: 60
};

var outerAppsSetting = {};

const UserDetailEditApp = createReactClass({
    displayName: 'UserDetailEditApp',

    getInitialState() {
        return UserDetailEditAppStore.getState();
    },
    propTypes: {
        appInfo: PropTypes.object,
        initialUser: PropTypes.object,
        height: PropTypes.string,
    },

    getDefaultProps() {
        return {
            appInfo: {},
            initialUser: {},
            height: 'auto',
        };
    },
    onStoreChange() {
        this.setState(UserDetailEditAppStore.getState());
    },

    componentDidMount() {
        UserDetailEditAppStore.listen(this.onStoreChange);
        $(window).on('resize', this.onStoreChange);
        UserDetailEditAppActions.setInitialData(this.props.appInfo);
    },

    componentWillUnmount() {
        UserDetailEditAppStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    },

    cancel() {
        if (this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        Trace.traceEvent('变更应用', '点击取消按钮');
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
        UserDetailEditAppActions.resetState();
    },

    //保存表单的值
    appsSetting: outerAppsSetting,

    //表单值，改变了，会触发，保存到 this.appsSetting
    onAppPropertyChange(appsSetting) {
        this.appsSetting = appsSetting;
    },

    getChangeAppInfo(submitData) {
        let changeAppInfo = _.clone(submitData);
        changeAppInfo.app_id = changeAppInfo.client_id;
        changeAppInfo.app_name = this.props.appInfo.app_name;
        changeAppInfo.start_time = changeAppInfo.begin_date;
        changeAppInfo.end_time = changeAppInfo.end_date;
        changeAppInfo.is_disabled = changeAppInfo.status === '1' ? 'false' : 'true';
        changeAppInfo.create_time = this.props.appInfo.create_time;
        changeAppInfo.multilogin = +changeAppInfo.mutilogin;
        changeAppInfo.is_two_factor = +changeAppInfo.is_two_factor;
        delete changeAppInfo.client_id;
        delete changeAppInfo.user_id;
        delete changeAppInfo.begin_date;
        delete changeAppInfo.end_date;
        delete changeAppInfo.status;
        delete changeAppInfo.mutilogin;

        return changeAppInfo;
    },

    //提交时会触发
    onFinish() {
        Trace.traceEvent('变更应用', '点击确定按钮');
        if (this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        //获取提交数据
        //表单信息
        const savedAppSetting = this.appsSetting[this.props.appInfo.app_id];
        //如果没有选中类型，报错
        var USER_TYPE_VALUE_MAP = AppUserUtil.USER_TYPE_VALUE_MAP;
        var hasValue = false;
        _.some(USER_TYPE_VALUE_MAP, function(value) {
            if (savedAppSetting.user_type.value === value) {
                hasValue = true;
            }
        });
        if (!hasValue) {
            emitter.emit('app_user_manage.edit_app.show_user_type_error');//user-type-radiofield/index.js
            return;
        }
        //要提交的数据
        const submitData = {};
        //应用id
        submitData.client_id = this.props.appInfo.app_id;
        //角色
        submitData.roles = savedAppSetting.roles;
        //权限
        submitData.permissions = savedAppSetting.permissions;
        //开通状态
        submitData.status = savedAppSetting.status.value === 'false' ? '1' : '0';
        //到期停用
        submitData.over_draft = savedAppSetting.over_draft.value;
        //开始时间
        submitData.begin_date = savedAppSetting.time.start_time;
        //结束时间
        submitData.end_date = savedAppSetting.time.end_time;
        //两步验证
        submitData.is_two_factor = savedAppSetting.is_two_factor.value;
        //正式、试用
        submitData.user_type = savedAppSetting.user_type.value;
        //设置user_id
        submitData.user_id = this.props.initialUser.user.user_id;
        //多次登录(平台部的单词拼错了)
        submitData.mutilogin = savedAppSetting.multilogin.value;
        if (submitData.roles.length) {
            UserDetailEditAppActions.setAppNoSelectRoleError('');
        } else {
            UserDetailEditAppActions.setAppNoSelectRoleError(Intl.get('user.role.select.tip', '至少选择一个角色'));
            return;
        }
        let changeAppInfo = this.getChangeAppInfo(submitData);
        //修改用户
        UserDetailEditAppActions.editUserApps(submitData, changeAppInfo, (flag) => {
            //发出更新用户列表事件
            if (flag) {
                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.UPDATE_APP_INFO, {
                    user_id: submitData.user_id,
                    app_info: changeAppInfo
                });
            }
            //面板向右滑
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
            //等待3秒界面切换回去
            AppUserPanelSwitchAction.resetState();
            UserDetailEditAppActions.resetState();
        });
    },

    //渲染loading，错误，成功提示
    renderIndicator() {
        if (this.state.submitResult === 'loading') {
            return (
                <Icon type="loading"/>
            );
        }
        var hide = function() {
            UserDetailEditAppActions.hideSubmitTip();
        };
        if (this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get('user.app.edit.success', '修改应用成功')} type="success" showIcon
                    onHide={hide}/>
            );
        }
        if (this.state.submitResult === 'error') {
            return (
                <div className="alert-timer">
                    <Alert message={this.state.submitErrorMsg} type="error" showIcon/>
                </div>
            );
        }
        return null;
    },

    render() {
        const height = this.props.height + LAYOUT_CONSTANTS.BTN_PADDING;//减去底部按钮的padding;
        return (
            <div className="user-manage-v2 user-detail-edit-app-v2" style={{height}}>
                <h4 onClick={this.cancel}>
                    <Icon type="left"/>{Intl.get('user.user.product.set','产品设置')}
                </h4>
                <AppPropertySetting
                    appsSetting={this.state.appSettingConfig}
                    selectedApps={this.state.selectedApps}
                    onAppPropertyChange={this.onAppPropertyChange}
                    height={height}
                    isSingleAppEdit={true}
                    appSelectRoleError={this.state.appSelectRoleError}
                    appInfo={this.props.appInfo}
                />
                <OperationStepsFooter
                    currentStep={2}
                    prevText={Intl.get('common.cancel', '取消')}
                    finishText={Intl.get('common.confirm', '确认')}
                    onStepChange={this.cancel}
                    onFinish={this.onFinish}
                >
                    {this.renderIndicator()}
                </OperationStepsFooter>
            </div>
        );
    },
});

module.exports = UserDetailEditApp;
