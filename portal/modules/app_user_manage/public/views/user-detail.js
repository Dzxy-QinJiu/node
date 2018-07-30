

var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-detail-zh_CN.less');
    require('../css/user-detail-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../css/user-detail-zh_CN.less');
    require('../css/third-party-app-config.less');
}
var Tabs = require('antd').Tabs;
var TabPane = Tabs.TabPane;
var RightPanelClose = require('../../../../components/rightPanel').RightPanelClose;
var AppUserAction = require('../action/app-user-actions');
var AppUserDetailAction = require('../action/app-user-detail-actions');
var UserDetailBasic = require('./user-detail-basic');
var SingleUserLog = require('./single-user-log');
import UserLoginAnalysis from './user-login-analysis';
var UserDetailChangeRecord = require('./user-detail-change-record');
var UserAbnormalLogin = require('./user-abnormal-login');
var AppUserPanelSwitchStore = require('../store/app-user-panelswitch-store');
var AppUserDetailStore = require('../store/app-user-detail-store');
import UserDetailAddApp from './v2/user-detail-add-app';
var UserDetailEditApp = require('./v2/user-detail-edit-app');
var SingleUserLogAction = require('../action/single_user_log_action');
var AppUserUtil = require('../util/app-user-util');
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
import ThirdPartyAppConfig from './third_app/third-party-app-config';
import ThirdAppDetail from './third_app/third-app-detail';
var UserDetailEditField = require('CMP_DIR/basic-edit-field/input');
import { StatusWrapper } from 'antc';
import { Button } from 'antd';
var AppUserAjax = require('../ajax/app-user-ajax');

var UserDetail = React.createClass({
    getDefaultProps: function() {
        return {
            userId: '1',
            appLists: [],
        };
    },
    reLayout: function() {
        this.onStoreChange();
    },
    getInitialState: function() {
        return {
            activeKey: '1',//tab激活页的key
            //用户基本信息
            userInfo: {
                data: null,
                loading: false,
                erorMsg: ''
            },
            showBasicDetail: true,
            showEditPw: false,
            ...AppUserPanelSwitchStore.getState()
        };
    },
    onStoreChange: function() {
        var stateData = AppUserPanelSwitchStore.getState();
        this.setState(stateData);
    },
    //滑动的延时
    panelSwitchTimeout: null,
    //面板向左滑
    panelSwitchLeft: function(timeout) {
        clearTimeout(this.panelSwitchTimeout);
        if (!timeout) {
            $(this.refs.wrap).addClass('move_left');
        } else {
            this.panelSwitchTimeout = setTimeout(() => {
                $(this.refs.wrap).addClass('move_left');
            }, timeout);
        }
    },
    //面板向右滑
    panelSwitchRight: function(timeout) {
        clearTimeout(this.panelSwitchTimeout);
        if (!timeout) {
            $(this.refs.wrap).removeClass('move_left');
        } else {
            this.panelSwitchTimeout = setTimeout(() => {
                $(this.refs.wrap).removeClass('move_left');
            }, timeout);
        }
    },
    componentDidMount: function() {
        $(window).on('resize', this.reLayout);
        AppUserPanelSwitchStore.listen(this.onStoreChange);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT, this.panelSwitchLeft);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT, this.panelSwitchRight);
        document.querySelector('.gm-scroll-view').addEventListener('mousewheel', this.handleWheel, false);
    },
    componentWillUnmount: function() {
        $(window).off('resize', this.reLayout);
        AppUserPanelSwitchStore.unlisten(this.onStoreChange);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT, this.panelSwitchLeft);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT, this.panelSwitchRight);
        document.querySelector('.gm-scroll-view').removeEventListener('mousewheel', this.handleWheel, false);
    },
    wheelTimer: null,
    //滚动监听处理
    handleWheel: function(e) {
        clearTimeout(this.wheelTimer);
        this.wheelTimer = setTimeout(() => {
            // 向上滚动
            if (e.deltaY < 0) {
                this.setState({
                    showBasicDetail: true
                });
            }
            // 向下滚动
            if (e.deltaY > 0) {
                this.setState({
                    showBasicDetail: false
                });
            }
        }, 100);
    },

    closeRightPanel: function() {
        if (_.isFunction(this.props.closeRightPanel)) {
            this.props.closeRightPanel();
        } else {
            AppUserAction.closeRightPanel();
        }
        AppUserDetailAction.dismiss();
        SingleUserLogAction.dismiss();
        emitter.emit('user_detail_close_right_panel');
    },

    changeTab: function(key) {
        this.setState({
            activeKey: key
        });
    },

    getBasicInfo(userInfo) {
        this.setState({
            userInfo
        });
    },
    //控制显示编辑密码区域
    showEditPw(isShow) {
        this.setState({
            showEditPw: isShow
        });
    },
    onPasswordValueChange: function() {
        if (this.confirmPasswordRef && this.confirmPasswordRef.state.formData.input) {
            this.confirmPasswordRef.refs.validation.forceValidate();
        }
    }, 
    //对密码 进行校验
    checkPass(rule, value, callback) {
        if (value && value.match(passwordRegex)) {
            let passStrength = getPassStrenth(value);
            this.passwordRef.setState({ passStrength: passStrength });
            callback();
        } else {
            this.passwordRef.setState({
                passStrength: {
                    passBarShow: false,
                    passStrength: 'L'
                }
            });
            callback(Intl.get('common.password.validate.rule', '请输入6-18位数字、字母、符号组成的密码'));
        }
    },
    //对确认密码 进行校验
    checkRePass(rule, value, callback) {
        if (value && value === this.passwordRef.state.formData.input) {
            callback();
        } else {
            callback(Intl.get('common.password.unequal', '两次输入密码不一致！'));
        }
    },
    render: function() {
        var moveView = null;
        if (this.state.panel_switch_currentView) {
            let { thirdApp } = this.state;
            switch (this.state.panel_switch_currentView) {
                case 'app':
                    var initialUser = AppUserDetailStore.getState().initialUser;
                    moveView = (<UserDetailAddApp initialUser={initialUser} />);
                    break;
                case 'editapp':
                    var initialUser = AppUserDetailStore.getState().initialUser;
                    var appInfo = this.state.panel_switch_appToEdit;
                    moveView = (
                        <UserDetailEditApp
                            initialUser={initialUser}
                            appInfo={appInfo} />
                    );
                    break;
                case 'thirdapp':
                    moveView = (
                        <ThirdAppDetail {...thirdApp} />
                    );
            }
        }
        //当前选择的应用（用户详情的接口中无法返回应用是否合格的属性，需要用用户列表接口中返回的应用是否合格属性）
        let selectApp = {};
        if (this.props.selectedAppId) {
            selectApp = _.find(this.props.appLists, app => app.app_id === this.props.selectedAppId);
        }
        var tabPaneList = [
            <TabPane tab={Intl.get('user.basic.info', '基本资料')} key="1">
                {this.state.activeKey === '1' ? <div className="user_manage_user_detail">
                    <UserDetailBasic userId={this.props.userId} selectApp={selectApp} getBasicInfo={this.getBasicInfo} ref={ref => this.userDetailRef = ref} />
                </div> : null}
            </TabPane>
        ];
        if (hasPrivilege('USER_AUDIT_LOG_LIST')) {
            tabPaneList.push(
                <TabPane tab="用户分析" key="2">
                    {this.state.activeKey === '2' ? <div className="user-analysis">
                        <UserLoginAnalysis userId={this.props.userId} selectedAppId={this.props.selectedAppId} />
                    </div> : null}
                </TabPane>
            );
            tabPaneList.push(
                <TabPane tab="审计日志" key="3">
                    {this.state.activeKey === '3' ? <div className="user-log">
                        <SingleUserLog
                            userId={this.props.userId}
                            selectedAppId={this.props.selectedAppId}
                            appLists={this.props.appLists}
                        />
                    </div> : null}
                </TabPane>
            );
        }
        if (hasPrivilege('USER_TIME_LINE')) {
            tabPaneList.push(
                <TabPane tab={Intl.get('user.change.record', '变更记录')} key="4">
                    {this.state.activeKey === '4' ? <div className="user_manage_user_record">
                        <UserDetailChangeRecord
                            userId={this.props.userId}
                            selectedAppId={this.props.selectedAppId}
                        />
                    </div> : null}
                </TabPane>
            );
        }
        //异常登录isShownExceptionTab
        if (hasPrivilege('GET_LOGIN_EXCEPTION_USERS') && this.props.isShownExceptionTab) {
            tabPaneList.push(
                <TabPane tab={Intl.get('user.login.abnormal', '异常登录')} key="5">
                    {this.state.activeKey === '5' ? <div className="user_manage_login_abnormal">
                        <UserAbnormalLogin
                            userId={this.props.userId}
                            selectedAppId={this.props.selectedAppId}
                        />
                    </div> : null}
                </TabPane>
            );
        }

        // 权限控制
        if (hasPrivilege('GET_USER_THIRDPARTYS') || hasPrivilege('THIRD_PARTY_MANAGE')) {
            tabPaneList.push(
                <TabPane tab={Intl.get('third.party.app', '开放应用平台')} key="6">
                    <div className="third_party_app_config">
                        <ThirdPartyAppConfig
                            userId={this.props.userId}
                        />
                    </div>
                </TabPane>
            );
        }
        const { userInfo } = this.state;
        return (
            <div className="right-panel-wrapper">
                <span className="iconfont icon-close" onClick={this.closeRightPanel} />
                <div className="full_size app_user_full_size user_manage_user_detail_wrap right-panel-content">
                    <StatusWrapper
                        loading={userInfo.loading}
                        size='medium'
                    >
                        <div className="basic-info-contianer" data-trace="客户基本信息">
                            <div className="basic-info-title-block clearfix">
                                <div className="basic-info-name">
                                    <span className="basic-name-text" title={_.get(userInfo, 'data.user_name')}>{_.get(userInfo, 'data.user_name')}</span>
                                </div>
                                <div className="basic-info-btns">
                                    <span className="iconfont icon-edit-pw" onClick={() => { this.showEditPw(true); }} />
                                    {
                                        !userInfo.loading ? this.userDetailRef && this.userDetailRef.renderUserStatus(userInfo.data, true) : null
                                    }
                                </div>
                            </div>
                            <div className={(this.state.showEditPw || this.state.showBasicDetail) ? 'basic-info-content' : 'hide'}>
                                {
                                    this.state.showEditPw ?
                                        <div className="edit-pw-container">
                                            <UserDetailEditField
                                                ref={ref => this.passwordRef = ref}
                                                displayType="edit"
                                                user_id={userInfo.user_id}
                                                value={Intl.get('user.password.tip', '保密中')}
                                                field="password"
                                                type="password"
                                                hideButtonBlock={true}
                                                showPasswordStrength={true}
                                                disabled={hasPrivilege('APP_USER_EDIT') ? false : true}
                                                validators={[{ validator: this.userDetailRef.checkPass }]}
                                                placeholder={Intl.get('login.please_enter_new_password', '请输入新密码')}
                                                title={Intl.get('user.batch.password.reset', '重置密码')}
                                                onDisplayTypeChange={this.userDetailRef.onPasswordDisplayTypeChange}
                                                onValueChange={this.onPasswordValueChange}
                                            />
                                            <UserDetailEditField
                                                hideButtonBlock={true}
                                                ref={ref => this.confirmPasswordRef = ref}
                                                user_id={userInfo.user_id}
                                                displayType="edit"
                                                field="password"
                                                type="password"
                                                placeholder={Intl.get('member.type.password.again', '请再次输入密码')}
                                                validators={[{ validator: this.checkRePass }]}
                                                onDisplayTypeChange={this.userDetailRef.onConfirmPasswordDisplayTypeChange}
                                                modifySuccess={this.userDetailRef.onConfirmPasswordDisplayTypeChange}
                                                saveEditInput={AppUserAjax.editAppUser}
                                            />
                                            <div className="btn-bar">
                                                <Button type='primary' onClick={() => {if(this.confirmPasswordRef) this.confirmPasswordRef.handleSubmit();}}>{Intl.get('common.confirm', '确认')}</Button>
                                                <Button onClick={() => { this.showEditPw(false); }}>{Intl.get('common.cancel', '取消')}</Button>
                                            </div>
                                        </div> :
                                        <div>
                                            <p>{Intl.get('common.nickname', '昵称')}: {_.get(userInfo, 'data.nick_name')}</p>
                                            <p>{Intl.get('common.remark', '备注')}: {_.get(userInfo, 'data.description')}</p>
                                        </div>
                                }
                            </div>
                        </div>
                    </StatusWrapper>
                    <div className="full_size app_user_full_size_item wrap_padding" ref="wrap">
                        <Tabs defaultActiveKey="1" onChange={this.changeTab} activeKey={this.state.activeKey}>
                            {tabPaneList}
                        </Tabs>
                    </div>
                    <div className="full_size app_user_full_size_item">
                        {moveView}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UserDetail;