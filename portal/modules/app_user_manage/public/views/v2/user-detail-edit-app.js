/**
 * 用户管理-已有用户-编辑单个应用
 */
var createReactClass = require('create-react-class');
import AppUserPanelSwitchAction from '../../action/app-user-panelswitch-actions';
import UserDetailEditAppActions from '../../action/v2/user-detail-edit-app-actions';
import UserDetailEditAppStore from '../../store/v2/user-detail-edit-app-store';
import AppPropertySetting from 'CMP_DIR/user_manage_components/app-property-setting';
import {Tabs, Icon, Alert} from 'antd';
import AlertTimer from '../../../../../components/alert-timer';
import OperationStepsFooter from '../../../../../components/user_manage_components/operation-steps-footer';
import AppUserUtil from '../../util/app-user-util';
import PropTypes from 'prop-types';
import {isEqualArray} from 'LIB_DIR/func';
import {getAppList} from 'PUB_DIR/sources/utils/common-data-util';
import {modifyAppConfigEmitter} from 'PUB_DIR/sources/utils/emitters';
var LAYOUT_CONSTANTS = AppUserUtil.LAYOUT_CONSTANTS;//右侧面板常量
require('../../css/edit-app.less');
//记录上下留白布局
const LAYOUT = {
    TAB_TOP_HEIGHT: 66,
    TAB_BOTTOM_PADDING: 60
};

var outerAppsSetting = {};

const UserDetailEditApp = createReactClass({
    displayName: 'UserDetailEditApp',

    getInitialState() {
        return {
            appList: [], // 应用列表
            disabled: true, // 确认按钮，默认禁用状态
            ...UserDetailEditAppStore.getState()
        };
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
        modifyAppConfigEmitter.on(modifyAppConfigEmitter.MODIFY_APP_CONFIG, this.getModifyAppConfig);
        this.getAppList();
        UserDetailEditAppActions.setInitialData(this.props.appInfo);
    },

    getAppList(){
        getAppList(appList => {
            this.setState({appList: appList});
        });
    },

    getModifyAppConfig() {
        this.setState({
            disabled: false
        });
    },

    componentWillUnmount() {
        UserDetailEditAppStore.unlisten(this.onStoreChange);
        modifyAppConfigEmitter.removeListener(modifyAppConfigEmitter.MODIFY_APP_CONFIG, this.getModifyAppConfig);
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

    getChangeAppInfo(appData) {
        let changeAppInfo = {
            app_name: this.props.appInfo.app_name,
            app_id: this.props.appInfo.app_id,
            create_time: this.props.appInfo.create_time
        };
        //开通状态
        changeAppInfo.is_disabled = appData.status.value;
        //到期停用
        changeAppInfo.over_draft = appData.over_draft.value;
        //开始时间
        changeAppInfo.start_time = appData.time.start_time;
        //结束时间
        changeAppInfo.end_time = appData.time.end_time;
        //两步验证
        changeAppInfo.is_two_factor = appData.is_two_factor.value || '0';
        //正式、试用
        changeAppInfo.user_type = appData.user_type.value;
        //多次登录
        changeAppInfo.multilogin = appData.multilogin.value || '0';
        // 多终端状态
        changeAppInfo.terminals = appData.terminals.value;
        //角色
        changeAppInfo.roles = appData.roles;
        //权限
        changeAppInfo.permissions = appData.permissions;


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

        // 判断是否修改了开通状态
        if (_.get(savedAppSetting, 'status.setted')) {
            submitData.status = savedAppSetting.status.value === 'false' ? '1' : '0';
        }

        // 判断是否修改了到期停用
        if (_.get(savedAppSetting, 'over_draft.setted')) {
            submitData.over_draft = savedAppSetting.over_draft.value;
        }

        // 判断是否修改了开通时间
        if (_.get(savedAppSetting, 'time.setted')) {
            submitData.begin_date = savedAppSetting.time.start_time; //开始时间
            submitData.end_date = savedAppSetting.time.end_time; //结束时间
        }

        // 判断是否修改了两步验证
        if (_.get(savedAppSetting, 'is_two_factor.setted')) {
            submitData.is_two_factor = savedAppSetting.is_two_factor.value;
        }

        // 判断是否修改了用户的类型
        if (_.get(savedAppSetting, 'user_type.setted')) {
            submitData.tags = [savedAppSetting.user_type.value];
        }

        // 判断是否修改了多次登录(平台部的单词拼错了)
        if (_.get(savedAppSetting, 'multilogin.setted')) {
            submitData.mutilogin = savedAppSetting.multilogin.value; //多次登录(平台部的单词拼错了)
        }

        // 判断是否修改了多终端类型
        if (_.get(savedAppSetting, 'terminals.setted')) {
            // 修改终端类型，接口需要传id字符串数组
            submitData.terminals = _.map(savedAppSetting.terminals.value, 'id');
        }

        // 未修改之前的应用角色
        let originalAppRoles = this.props.appInfo.roles;
        // 修改之后的应用角色
        let changedAppRoles = savedAppSetting.roles;
        if (!isEqualArray(originalAppRoles, changedAppRoles)) {
            //角色
            submitData.roles = changedAppRoles;
        }

        // 未修改之前的应用权限
        let originalAppPermissions = this.props.appInfo.permissions;
        // 修改之后的应用权限
        let changedAppPermissions = savedAppSetting.permissions;
        if (!isEqualArray(originalAppPermissions, changedAppPermissions)) {
            //权限
            submitData.permissions = changedAppPermissions;
        }
        //设置user_id
        submitData.user_id = this.props.initialUser.user.user_id;

        let changeAppInfo = this.getChangeAppInfo(savedAppSetting);
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
            <div className="user-detail-edit-app-v2" style={{height}}>
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
                    appList={this.state.appList}
                />
                <OperationStepsFooter
                    currentStep={2}
                    prevText={Intl.get('common.cancel', '取消')}
                    finishText={Intl.get('common.confirm', '确认')}
                    onStepChange={this.cancel}
                    onFinish={this.onFinish}
                    disabled={this.state.disabled}
                >
                    {this.renderIndicator()}
                </OperationStepsFooter>
            </div>
        );
    },
});

module.exports = UserDetailEditApp;
