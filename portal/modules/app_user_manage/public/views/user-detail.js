var React = require('react');
var language = require('../../../../public/language/getLanguage');
require('../css/user-detail-zh_CN.less');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-detail-v3.less');
    require('../css/user-detail-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../css/third-party-app-config.less');
    require('../css/user-detail-v3.less');
}
import DetailCard from 'CMP_DIR/detail-card';
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
var LAYOUT_CONSTANTS = AppUserUtil.LAYOUT_CONSTANTS;//右侧面板常量
const WHEEL_DELAY = 10;//滚轮事件延时
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import UserStatusSwitch from './user-status-switch';
import { getPassStrenth, passwordRegex } from 'CMP_DIR/password-strength-bar';
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {getIntegrationConfig} from 'PUB_DIR/sources/utils/common-data-util';
class UserDetail extends React.Component {
    static defaultProps = {
        userId: '1',
        appLists: [],
    };

    state = {
        activeKey: '1',//tab激活页的key
        //用户基本信息
        userInfo: {
            data: null,
            loading: false,
            erorMsg: ''
        },
        showBasicDetail: true,//是否展示顶部用户信息
        showEditPw: false,
        ...AppUserPanelSwitchStore.getState()
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.userId !== this.props.userId) {
            this.setState({
                activeKey: '1'
            });
        }
    }
    
    reLayout = () => {
        this.onStoreChange();
    };

    onStoreChange = () => {
        var stateData = AppUserPanelSwitchStore.getState();
        this.setState(stateData);
    };

    //滑动的延时
    panelSwitchTimeout = null;

    //面板向左滑
    panelSwitchLeft = (timeout) => {
        clearTimeout(this.panelSwitchTimeout);
        if (!timeout) {
            $(this.refs.wrap).addClass('move_left');
            $(this.refs.topWrap).addClass('move-left-wrapper');
        } else {
            this.panelSwitchTimeout = setTimeout(() => {
                $(this.refs.wrap).addClass('move_left');
                $(this.refs.topWrap).addClass('move-left-wrapper');
            }, timeout);
        }
    };

    //面板向右滑
    panelSwitchRight = (timeout) => {
        clearTimeout(this.panelSwitchTimeout);
        if (!timeout) {
            $(this.refs.wrap).removeClass('move_left');
            $(this.refs.topWrap).removeClass('move-left-wrapper');
        } else {
            this.panelSwitchTimeout = setTimeout(() => {
                $(this.refs.wrap).removeClass('move_left');
                $(this.refs.topWrap).removeClass('move-left-wrapper');
            }, timeout);
        }
    };
    getIntegrateConfig(){
        getIntegrationConfig().then(resultObj => {
            let isOplateUser = _.get(resultObj, 'type') === INTEGRATE_TYPES.OPLATE;
            this.setState({isOplateUser});
        });
    }
    componentDidMount() {
        $(window).on('resize', this.reLayout);
        AppUserPanelSwitchStore.listen(this.onStoreChange);
        this.getIntegrateConfig();
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT, this.panelSwitchLeft);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT, this.panelSwitchRight);
        let scrollWrapElem = document.querySelector('.user_manage_user_detail .gm-scroll-view');
        if (scrollWrapElem) {
            scrollWrapElem.addEventListener('mousewheel', this.handleWheel, false);
        }
    }

    componentWillUnmount() {
        $(window).off('resize', this.reLayout);
        AppUserPanelSwitchStore.unlisten(this.onStoreChange);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT, this.panelSwitchLeft);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT, this.panelSwitchRight);
        let scrollWrapElem = document.querySelector('.user_manage_user_detail .gm-scroll-view');
        if (scrollWrapElem) {
            scrollWrapElem.removeEventListener('mousewheel', this.handleWheel, false);
        }
    }

    wheelTimer = null;

    //滚动监听处理
    handleWheel = (e) => {
        clearTimeout(this.wheelTimer);
        this.wheelTimer = setTimeout(() => {
            // 向上滚动
            if (e.deltaY < 0 && !this.state.showBasicDetail) {
                this.setState({
                    showBasicDetail: true
                });
            }
            // 向下滚动
            if (e.deltaY > 0 && this.state.showBasicDetail) {
                this.setState({
                    showBasicDetail: false
                });
            }
        }, WHEEL_DELAY);
    };

    closeRightPanel = () => {
        if (_.isFunction(this.props.closeRightPanel)) {
            this.props.closeRightPanel();
        } else {
            AppUserAction.closeRightPanel();
        }
        AppUserDetailAction.dismiss();
        SingleUserLogAction.dismiss();
        emitter.emit('user_detail_close_right_panel');
    };

    changeTab = (key) => {
        this.setState({
            activeKey: key
        }, () => {
            document.querySelector('.gm-scroll-view').addEventListener('mousewheel', this.handleWheel, false);
        });
    };

    getBasicInfo = (userInfo) => {
        this.setState({
            userInfo
        });
    };

    //控制显示编辑密码区域
    showEditPw = (isShow) => {
        this.setState({
            showEditPw: isShow
        });
    };

    onPasswordDisplayTypeChange = (type) => {
        if (type === 'edit') {
            this.setState({ isConfirmPasswordShow: true });
        } else {
            this.setState({ isConfirmPasswordShow: false });
        }
    };

    onConfirmPasswordDisplayTypeChange = () => {
        this.setState({ isConfirmPasswordShow: false, showEditPw: false });
    };

    onPasswordValueChange = () => {
        if (this.confirmPasswordRef && this.confirmPasswordRef.state.formData.input) {
            this.confirmPasswordRef.refs.validation.forceValidate();
        }
    };

    //对密码 进行校验
    checkPass = (rule, value, callback) => {
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
    };

    //对确认密码 进行校验
    checkRePass = (rule, value, callback) => {
        if (value && value === this.passwordRef.state.formData.input) {
            callback();
        } else {
            callback(Intl.get('common.password.unequal', '两次输入密码不一致！'));
        }
    };

    //处理用户信息修改的方法,组件用
    handleUserInfoEdit = (params, onSuccess, onError) => {
        params.user_id = params.id;
        delete params.id;
        AppUserAjax.editAppUser(params).then(result => {
            //将修改成功后的数据在用户列表展示
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.UPDATE_USER_INFO, params);
            return onSuccess(result);
        }, onError);
    };

    renderUserStatus = (user, useIcon = false) => {
        let userStatus = user && user.status;
        let hasEditPrivilege = hasPrivilege('APP_USER_EDIT') && this.state.isOplateUser;
        if (!hasEditPrivilege) {
            return userStatus === '1' ? Intl.get('common.enabled', '启用') : Intl.get('common.stop', '停用');
        }
        return (<UserStatusSwitch useIcon={useIcon} userId={_.get(user, 'user_id')} status={userStatus === '1' ? true : false} />);
    };

    render() {
        const { userInfo } = this.state;
        //内容区高度        
        let contentHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DELTA - LAYOUT_CONSTANTS.BOTTOM_DELTA - LAYOUT_CONSTANTS.BASIC_TOP - LAYOUT_CONSTANTS.USER_DETAIL;
        //用户详细信息高度
        if (this.state.showBasicDetail) {
            contentHeight = contentHeight + LAYOUT_CONSTANTS.REMARK_PADDING - LAYOUT_CONSTANTS.TITLE_PADDING;
        } else {
            contentHeight += LAYOUT_CONSTANTS.USER_DETAIL;
        }
        //加载时增加padding
        if (userInfo.loading) {
            contentHeight += LAYOUT_CONSTANTS.LOADING_PADDING;
        }
        //错误信息padding
        if (userInfo.errorMsg) {
            contentHeight += LAYOUT_CONSTANTS.ERROR_PADDING;
        }
        var moveView = null;
        if (this.state.panel_switch_currentView) {
            let { thirdApp } = this.state;
            switch (this.state.panel_switch_currentView) {
                case 'app':
                    var initialUser = AppUserDetailStore.getState().initialUser;
                    moveView = (<UserDetailAddApp height={contentHeight} initialUser={initialUser} />);
                    break;
                case 'editapp':
                    var initialUser = AppUserDetailStore.getState().initialUser;
                    var appInfo = this.state.panel_switch_appToEdit;
                    moveView = (
                        <UserDetailEditApp
                            height={contentHeight}
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
                    <UserDetailBasic height={contentHeight} userId={this.props.userId} selectApp={selectApp} getBasicInfo={this.getBasicInfo} ref={ref => this.userDetailRef = ref} />
                </div> : null}
            </TabPane>
        ];
        if (hasPrivilege('USER_AUDIT_LOG_LIST')) {
            tabPaneList.push(
                <TabPane tab={Intl.get('sales.user.analysis', '用户分析')} key="2">
                    {this.state.activeKey === '2' ? <div className="user-analysis">
                        <UserLoginAnalysis height={contentHeight} userId={this.props.userId} selectedAppId={this.props.selectedAppId} />
                    </div> : null}
                </TabPane>
            );
            tabPaneList.push(
                <TabPane tab={Intl.get('menu.appuser.auditlog', '操作记录')} key="3">
                    {this.state.activeKey === '3' ? <div className="user-log">
                        <SingleUserLog
                            height={contentHeight}
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
                            height={contentHeight}
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
                            height={contentHeight}
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

        const EDIT_FEILD_WIDTH = 395;
        let hasEditPrivilege = hasPrivilege('APP_USER_EDIT') && this.state.isOplateUser;
        return (
            <div className="right-panel-wrapper">
                <span className="iconfont icon-close" onClick={this.closeRightPanel} />
                <div className="full_size app_user_full_size user_manage_user_detail_wrap right-panel-content full-size-container user-detail-v3-content" ref='topWrap'>
                    <StatusWrapper
                    >
                        {
                            !userInfo.errorMsg ? <div className="basic-info-contianer" data-trace="用户基本信息">
                                <div className="basic-info-title-block clearfix">
                                    <div className="basic-info-name">
                                        <span className="basic-name-text" title={_.get(userInfo, 'data.user_name')}>{_.get(userInfo, 'data.user_name')}</span>
                                    </div>
                                    <div className="basic-info-btns">
                                        {
                                            !userInfo.loading && hasEditPrivilege ? <span className="iconfont icon-edit-pw" title={Intl.get('common.edit.password', '修改密码')} onClick={() => { this.showEditPw(true); }} /> : null
                                        }
                                        {
                                            !userInfo.loading ? this.renderUserStatus(userInfo.data, true) : null
                                        }
                                    </div>
                                </div>
                                {
                                    !userInfo.loading ?
                                        <div className={(this.state.showEditPw || this.state.showBasicDetail) ? 'basic-info-content' : 'hide'}>
                                            {
                                                this.state.showEditPw ?
                                                    <div className="edit-pw-container">
                                                        <UserDetailEditField
                                                            ref={ref => this.passwordRef = ref}
                                                            displayType="edit"
                                                            user_id={_.get(userInfo, 'data.user_id')}
                                                            value=''
                                                            field="password"
                                                            type="password"
                                                            hideButtonBlock={true}
                                                            showPasswordStrength={true}
                                                            disabled={hasEditPrivilege ? false : true}
                                                            validators={[{ validator: this.checkPass }]}
                                                            placeholder={Intl.get('login.please_enter_new_password', '请输入新密码')}
                                                            title={Intl.get('user.batch.password.reset', '重置密码')}
                                                            onDisplayTypeChange={this.onPasswordDisplayTypeChange}
                                                            onValueChange={this.onPasswordValueChange}
                                                        />
                                                        <UserDetailEditField
                                                            hideButtonBlock={true}
                                                            ref={ref => this.confirmPasswordRef = ref}
                                                            user_id={_.get(userInfo, 'data.user_id')}
                                                            displayType="edit"
                                                            field="password"
                                                            type="password"
                                                            placeholder={Intl.get('member.type.password.again', '请再次输入密码')}
                                                            validators={[{ validator: this.checkRePass }]}
                                                            onDisplayTypeChange={this.onConfirmPasswordDisplayTypeChange}
                                                            modifySuccess={this.onConfirmPasswordDisplayTypeChange}
                                                            saveEditInput={AppUserAjax.editAppUser}
                                                        />
                                                        <div className="btn-bar">
                                                            <Button type='primary' onClick={() => { if (this.confirmPasswordRef) this.confirmPasswordRef.handleSubmit(); }}>{Intl.get('common.confirm', '确认')}</Button>
                                                            <Button onClick={() => { this.showEditPw(false); }}>{Intl.get('common.cancel', '取消')}</Button>
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <div className="basic-info-remark basic-info-item">
                                                            <span className="basic-info-label">{Intl.get('common.nickname', '昵称')}:</span>
                                                            <BasicEditInputField
                                                                width={EDIT_FEILD_WIDTH}
                                                                id={_.get(userInfo, 'data.user_id')}
                                                                value={_.get(userInfo, 'data.nick_name')}
                                                                type="text"
                                                                field="nick_name"
                                                                editBtnTip={Intl.get('user.nickname.set.tip', '设置昵称')}
                                                                placeholder={Intl.get('user.nickname.write.tip', '请填写昵称')}
                                                                hasEditPrivilege={hasPrivilege('APP_USER_EDIT')}
                                                                saveEditInput={this.handleUserInfoEdit}
                                                                noDataTip={Intl.get('user.nickname.no.tip', '暂无昵称')}
                                                                addDataTip={Intl.get('user.nickname.add.tip', '添加昵称')}
                                                            />
                                                        </div>
                                                        <div className="basic-info-remark basic-info-item">
                                                            <span className="basic-info-label">{Intl.get('common.remark', '备注')}:</span>
                                                            <BasicEditInputField
                                                                width={EDIT_FEILD_WIDTH}
                                                                id={_.get(userInfo, 'data.user_id')}
                                                                value={_.get(userInfo, 'data.description')}
                                                                type="textarea"
                                                                field="description"
                                                                textCut={true}
                                                                editBtnTip={Intl.get('user.remark.set.tip', '设置备注')}
                                                                placeholder={Intl.get('user.input.remark', '请输入备注')}
                                                                hasEditPrivilege={hasPrivilege('APP_USER_EDIT')}
                                                                saveEditInput={this.handleUserInfoEdit}
                                                                noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                                                                addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                                                            />
                                                        </div>
                                                    </div>
                                            }
                                        </div> : null
                                }
                            </div> : null
                        }
                    </StatusWrapper>
                    <div className="full_size app_user_full_size_item wrap_padding user-detail-v3-content" ref="wrap">
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
}
UserDetail.propTypes = {
    closeRightPanel: PropTypes.func,
    selectedAppId: PropTypes.string,
    appLists: PropTypes.array,
    userId: PropTypes.string,
    isShownExceptionTab: PropTypes.bool,
};
module.exports = UserDetail;
