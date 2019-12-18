import common_privilegeConst from 'MOD_DIR/common/public/privilege-const';

var language = require('../../../../public/language/getLanguage');
require('../css/user-detail-zh_CN.less');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-detail-v3.less');
    require('../css/user-detail-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../css/user-detail-v3.less');
}
var Tabs = require('antd').Tabs;
var TabPane = Tabs.TabPane;
var AppUserAction = require('../action/app-user-actions');
var AppUserDetailAction = require('../action/app-user-detail-actions');
var UserDetailBasic = require('./user-detail-basic');
import UserLoginAnalysis from './user-login-analysis';
var SingleUserLog = require('./single-user-log');
var UserDetailChangeRecord = require('./user-detail-change-record');
var UserAbnormalLogin = require('./user-abnormal-login');
var AppUserPanelSwitchStore = require('../store/app-user-panelswitch-store');
var AppUserPanelSwitchAction = require('../action/app-user-panelswitch-actions');
var AppUserDetailStore = require('../store/app-user-detail-store');
import UserDetailAddApp from './v2/user-detail-add-app';
var UserDetailEditApp = require('./v2/user-detail-edit-app');
var SingleUserLogAction = require('../action/single_user_log_action');
var AppUserUtil = require('../util/app-user-util');
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
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
import {RightPanel} from 'CMP_DIR/rightPanel';
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import classNames from 'classnames';
import userManagePrivilege from '../privilege-const';
import publicPrivilege from 'PUB_DIR/privilege-const';
const EDIT_PASSWORD_WIDTH = 260;
//当前面板z-index
let thisPanelZIndex;


class UserDetail extends React.Component {
    static defaultProps = {
        userId: '1',
        appLists: [],
        userConditions: [],
    };

    state = {
        activeKey: '1',//tab激活页的key
        showBasicDetail: true,//是否展示顶部用户信息
        showEditPw: false,
        isChangingActiveKey: false, // 是否正在切换tab,默认false
        ...AppUserPanelSwitchStore.getState(),
        ...AppUserDetailStore.getState()
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.userId !== this.props.userId) {
            AppUserDetailAction.getUserDetail(nextProps.userId);
            $(this.refs.wrap).removeClass('move_left');
            $(this.refs.topWrap).removeClass('move-left-wrapper');
            // 若当前tab页是异常登录，切换用户时，若此用户没有异常登录项，则返回到基本资料
            if (!nextProps.isShownExceptionTab && this.state.activeKey === '5') {
                this.setState({
                    activeKey: '1'
                });
            }

        }
    }
    
    reLayout = () => {
        this.onStoreChange();
    };

    onStoreChange = () => {
        var stateData = AppUserPanelSwitchStore.getState();
        this.setState(stateData);
    };

    onDetailStoreChange = () => {
        var stateData = AppUserDetailStore.getState();
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
        this._isMounted = true;
        $(window).on('resize', this.reLayout);
        AppUserPanelSwitchStore.listen(this.onStoreChange);
        AppUserDetailStore.listen(this.onDetailStoreChange);
        this.getIntegrateConfig();
        AppUserDetailAction.getUserDetail(this.props.userId);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT, this.panelSwitchLeft);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT, this.panelSwitchRight);
        let scrollWrapElem = document.querySelector('.user_manage_user_detail .gm-scroll-view');
        if (scrollWrapElem) {
            scrollWrapElem.addEventListener('mousewheel', this.handleWheel, false);
        }
        //增加打开客户详情面板的事件监听
        //打开客户详情面板时，当前面板的z-index减1
        //以使当前面板显示在后面
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.adjustThisPanelZIndex.bind(this, -1));

        //增加关闭客户详情面板的事件监听
        //关闭客户详情面板时，恢复当前面板的原始z-index
        phoneMsgEmitter.on(phoneMsgEmitter.CLOSE_PHONE_PANEL, this.adjustThisPanelZIndex);

        //增加打开用户详情面板的事件监听
        //从客户详情面板打开当前面板时，恢复当前面板的原始z-index
        //以使当前面板显示在前面
        userDetailEmitter.on(userDetailEmitter.OPEN_USER_DETAIL, this.adjustThisPanelZIndex.bind(this, -1));

        //获取当前面板原始的z-index
        thisPanelZIndex = $(ReactDOM.findDOMNode(this)).css('zIndex');

        //转为数字，以便进行加减计算
        thisPanelZIndex = _.toInteger(thisPanelZIndex);
    }

    componentWillUnmount() {
        this._isMounted = false;
        $(window).off('resize', this.reLayout);
        // 查看用户详情，切换到单个应用的设置界面，再次打开用户详情时，切换面板需要重置，
        // 若不重置，有可能会不在用户详情的基本资料面板上
        AppUserPanelSwitchAction.resetState();
        AppUserPanelSwitchStore.unlisten(this.onStoreChange);
        AppUserDetailStore.unlisten(this.onDetailStoreChange);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT, this.panelSwitchLeft);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT, this.panelSwitchRight);
        let scrollWrapElem = document.querySelector('.user_manage_user_detail .gm-scroll-view');
        if (scrollWrapElem) {
            scrollWrapElem.removeEventListener('mousewheel', this.handleWheel, false);
        }
        //移除打开客户详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.adjustThisPanelZIndex);

        //移除关闭客户详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CLOSE_PHONE_PANEL, this.adjustThisPanelZIndex);

        //移除打开用户详情面板的事件监听
        userDetailEmitter.removeListener(userDetailEmitter.OPEN_USER_DETAIL, this.adjustThisPanelZIndex);
    }

    //调整当前面板的z-index
    //参数addend: 被加数
    adjustThisPanelZIndex = (addend) => {
        let zIndex = thisPanelZIndex;

        if (_.isNumber(addend)) {
            zIndex += addend;
        }
        if (this._isMounted) {
            $(ReactDOM.findDOMNode(this)).css('zIndex', zIndex);
        }
    };

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
        userDetailEmitter.emit(userDetailEmitter.USER_DETAIL_CLOSE_RIGHT_PANEL);
    };

    changeTab = (key) => {
        this.setState({
            activeKey: key,
            isChangingActiveKey: true
        }, () => {
            document.querySelector('.gm-scroll-view').addEventListener('mousewheel', this.handleWheel, false);
            // 切换tab时，完全显示有一定的延迟，加setTimeout是为了，防止在切换到操作记录时，有滑动的问题
            setTimeout( () => {
                this.setState({
                    isChangingActiveKey: false
                });
            }, 1000);
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
            callback(Intl.get('common.password.validate.rule', '请输入6-18位包含数字、字母和字符组成的密码，不能包含空格、中文和非法字符'));
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
        if(this.state.isOplateUser) {
            let hasEditPrivilege = hasPrivilege(userManagePrivilege.USER_MANAGE);
            if (!hasEditPrivilege) {
                return userStatus === '1' ? Intl.get('common.enabled', '启用') : Intl.get('common.stop', '停用');
            }
            return (
                <UserStatusSwitch
                    useIcon={useIcon}
                    userId={_.get(user, 'user_id')}
                    status={userStatus === '1' ? true : false}
                />);
        }else {
            return null;
        }
    };

    saveEditUserPassword = (saveObj, successFunc, errorFunc) => {
        AppUserAjax.editAppUser(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.onConfirmPasswordDisplayTypeChange();
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };

    render() {
        let userInfo = {data: _.get(this.state.initialUser, 'user')};
        let appLists = _.get(this.state.initialUser, 'apps', []);
        let loading = this.state.isLoading;
        let errorMsg = this.state.getDetailErrorMsg;
        //内容区高度        
        let contentHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DELTA - LAYOUT_CONSTANTS.BOTTOM_DELTA - LAYOUT_CONSTANTS.BASIC_TOP - LAYOUT_CONSTANTS.USER_DETAIL;
        //用户详细信息高度
        if (this.state.showBasicDetail) {
            contentHeight = contentHeight + LAYOUT_CONSTANTS.REMARK_PADDING - LAYOUT_CONSTANTS.TITLE_PADDING;
        } else {
            contentHeight += LAYOUT_CONSTANTS.USER_DETAIL;
        }

        //加载时增加padding
        if (loading) {
            contentHeight += LAYOUT_CONSTANTS.LOADING_PADDING;
        }
        //错误信息padding
        if (errorMsg) {
            contentHeight += LAYOUT_CONSTANTS.ERROR_PADDING;
        }

        var moveView = null;
        if (this.state.panel_switch_currentView) {
            let { thirdApp } = this.state;
            switch (this.state.panel_switch_currentView) {
                case 'app':
                    var initialUser = this.state.initialUser;
                    moveView = (
                        <UserDetailAddApp 
                            height={contentHeight} 
                            initialUser={initialUser} 
                        />
                    );
                    break;
                case 'editapp':
                    var initialUser = this.state.initialUser;
                    var appInfo = this.state.panel_switch_appToEdit;
                    moveView = (
                        <UserDetailEditApp
                            height={contentHeight}
                            initialUser={initialUser}
                            appInfo={appInfo} />
                    );
                    break;
            }
        }
        //当前选择的应用（用户详情的接口中无法返回应用是否合格的属性，需要用用户列表接口中返回的应用是否合格属性）
        let selectApp = {};
        // 当前应用的自定义筛选条件
        let userConditions = [];
        if (this.props.selectedAppId) {
            selectApp = _.find(this.props.appLists, app => app.app_id === this.props.selectedAppId);
            userConditions = _.filter(this.props.userConditions, item => {
                return item.app_id === this.props.selectedAppId;
            });
        }

        var tabPaneList = [
            <TabPane tab={Intl.get('user.basic.info', '基本资料')} key="1">
                {this.state.activeKey === '1' ? <div className="user_manage_user_detail">
                    <UserDetailBasic
                        height={contentHeight}
                        userId={this.props.userId}
                        selectApp={selectApp}
                        ref={ref => this.userDetailRef = ref}
                        userConditions={userConditions}
                    />
                </div> : null}
            </TabPane>
        ];
        if (hasPrivilege(userManagePrivilege.CRM_USER_ANALYSIS_ALL_ROLE_QUERY)) {
            tabPaneList.push(
                <TabPane tab={Intl.get('sales.user.analysis', '用户分析')} key="2">
                    {
                        this.state.activeKey === '2' ?
                            <div className="user-analysis">
                                <UserLoginAnalysis
                                    height={contentHeight}
                                    userId={this.props.userId}
                                    selectedAppId={this.props.selectedAppId}
                                    appLists={appLists}
                                />
                            </div> : null
                    }
                </TabPane>
            );
        }
        if (hasPrivilege(userManagePrivilege.USER_AUDIT_LOG_LIST)) {
            tabPaneList.push(
                <TabPane tab={Intl.get('menu.appuser.auditlog', '操作记录')} key="3">
                    {this.state.activeKey === '3' ? <div className="user-log">
                        <SingleUserLog
                            height={contentHeight}
                            userId={this.props.userId}
                            selectedAppId={this.props.selectedAppId}
                            appLists={appLists}
                            operatorRecordDateSelectTime={this.props.operatorRecordDateSelectTime}
                        />
                    </div> : null}
                </TabPane>
            );
        }

        if (hasPrivilege(publicPrivilege.MEMBER_QUERY_PERMISSION)) {
            tabPaneList.push(
                <TabPane tab={Intl.get('user.change.record', '变更记录')} key="4">
                    {this.state.activeKey === '4' ? <div className="user_manage_user_record">
                        <UserDetailChangeRecord
                            height={contentHeight}
                            userId={this.props.userId}
                            selectedAppId={this.props.selectedAppId}
                            appLists={appLists}
                        />
                    </div> : null}
                </TabPane>
            );
        }
        //异常登录isShownExceptionTab
        if (hasPrivilege(userManagePrivilege.USER_QUERY) && this.props.isShownExceptionTab) {
            tabPaneList.push(
                <TabPane tab={Intl.get('user.login.abnormal', '异常登录')} key="5">
                    {
                        this.state.activeKey === '5' ?
                            <div className="user_manage_login_abnormal">
                                <UserAbnormalLogin
                                    height={contentHeight}
                                    userId={this.props.userId}
                                    selectedAppId={this.props.selectedAppId}
                                    appLists={appLists}
                                />
                            </div> : null
                    }
                </TabPane>
            );
        }
        
        const EDIT_FEILD_WIDTH = 395;
        let hasEditPrivilege = hasPrivilege(userManagePrivilege.USER_MANAGE) && this.state.isOplateUser;
        let rightPanelCls = classNames('apply_detail_rightpanel app_user_manage_rightpanel white-space-nowrap right-panel detail-v3-panel', {
            'notification-system-user': this.props.isNotificationOpenUserDetail
        });
        // 在操作记录界面，有时间选择组件，为了解决时间组件显示不全的问题，增加样式控制
        let tabcls = classNames({
            'single-log-tabs': this.state.activeKey === '3' && !this.state.isChangingActiveKey
        });
        return (
            <RightPanel
                className={rightPanelCls}
                showFlag='true'
            >
                <div className="right-panel-wrapper">
                    <span className="iconfont icon-close" onClick={this.closeRightPanel} />
                    <div className="full_size app_user_full_size user_manage_user_detail_wrap right-panel-content full-size-container user-detail-v3-content" ref='topWrap'>
                        <StatusWrapper>
                            {
                                !errorMsg ? (
                                    <div className="basic-info-contianer" data-trace="用户基本信息">
                                        <div className="basic-info-title-block clearfix">
                                            <div className="basic-info-name">
                                                <span className="basic-name-text" title={_.get(userInfo, 'data.user_name')}>{_.get(userInfo, 'data.user_name')}</span>
                                            </div>
                                            <div className="basic-info-btns">
                                                {
                                                    !loading && hasEditPrivilege ? <span className="iconfont icon-edit-pw handle-btn-item" title={Intl.get('common.edit.password', '修改密码')} onClick={() => { this.showEditPw(true); }} /> : null
                                                }
                                                {
                                                    !loading ? this.renderUserStatus(userInfo.data, true) : null
                                                }
                                            </div>
                                        </div>
                                        {
                                            !loading ? (
                                                <div className={(this.state.showEditPw || this.state.showBasicDetail) ? 'basic-info-content' : 'hide'}>
                                                    {
                                                        this.state.showEditPw ?
                                                            <div className="edit-pw-container">
                                                                <BasicEditInputField
                                                                    ref={ref => this.passwordRef = ref}
                                                                    id={_.get(userInfo, 'data.user_id')}
                                                                    width={EDIT_PASSWORD_WIDTH}
                                                                    field="password"
                                                                    type="password"
                                                                    displayType="edit"
                                                                    hasEditPrivilege={hasEditPrivilege}
                                                                    hideButtonBlock={true}
                                                                    showPasswordStrength={true}
                                                                    validators={[{validator: this.checkPass}]}
                                                                    placeholder={Intl.get('login.please_enter_new_password', '请输入新密码')}
                                                                    title={Intl.get('user.batch.password.reset', '重置密码')}
                                                                    onDisplayTypeChange={this.onPasswordDisplayTypeChange}
                                                                    onValueChange={this.onPasswordValueChange}
                                                                />
                                                                <BasicEditInputField
                                                                    hideButtonBlock={true}
                                                                    ref={ref => this.confirmPasswordRef = ref}
                                                                    width={EDIT_PASSWORD_WIDTH}
                                                                    id={_.get(userInfo, 'data.user_id')}
                                                                    displayType="edit"
                                                                    field="password"
                                                                    type="password"
                                                                    placeholder={Intl.get('common.input.confirm.password', '请输入确认密码')}
                                                                    validators={[{validator: this.checkRePass}]}
                                                                    onDisplayTypeChange={this.onConfirmPasswordDisplayTypeChange}
                                                                    saveEditInput={this.saveEditUserPassword}
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
                                                                        hasEditPrivilege={hasPrivilege(userManagePrivilege.USER_MANAGE)}
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
                                                                        hasEditPrivilege={hasPrivilege(userManagePrivilege.USER_MANAGE)}
                                                                        saveEditInput={this.handleUserInfoEdit}
                                                                        noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                                                                        addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                                                                    />
                                                                </div>
                                                            </div>
                                                    }
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                ) : null
                            }
                        </StatusWrapper>
                        <div className="full_size app_user_full_size_item wrap_padding user-detail-v3-content" ref="wrap">
                            <Tabs
                                defaultActiveKey="1"
                                onChange={this.changeTab}
                                activeKey={this.state.activeKey}
                                className={tabcls}
                            >
                                {tabPaneList}
                            </Tabs>
                        </div>
                        <div className="full_size app_user_full_size_item">
                            {moveView}
                        </div>
                    </div>
                </div>
            </RightPanel>
        );
    }
}
UserDetail.propTypes = {
    closeRightPanel: PropTypes.func,
    selectedAppId: PropTypes.string,
    appLists: PropTypes.array,
    userId: PropTypes.string,
    isShownExceptionTab: PropTypes.bool,
    userConditions: PropTypes.array,
    operatorRecordDateSelectTime: PropTypes.object, // 操作记录界面，选择的时间
    isNotificationOpenUserDetail: PropTypes.bool, // 是否是系统通知界面，打开用户详情
};
module.exports = UserDetail;
