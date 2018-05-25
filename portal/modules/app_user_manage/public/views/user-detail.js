

var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../css/user-detail-es_VE.less");
}else if (language.lan() == "zh"){
    require("../css/user-detail-zh_CN.less");
    require("../css/third-party-app-config.less");
}
var Tabs = require("antd").Tabs;
var TabPane = Tabs.TabPane;
var RightPanelClose = require("../../../../components/rightPanel").RightPanelClose;
var AppUserAction = require("../action/app-user-actions");
var AppUserDetailAction = require("../action/app-user-detail-actions");
var UserDetailBasic = require("./user-detail-basic");
var SingleUserLog = require('./single-user-log');
import UserLoginAnalysis from './user-login-analysis';
var UserDetailChangeRecord = require('./user-detail-change-record');
var UserAbnormalLogin = require('./user-abnormal-login');
var AppUserPanelSwitchStore = require("../store/app-user-panelswitch-store");
var AppUserDetailStore = require("../store/app-user-detail-store");
import UserDetailAddApp from "./v2/user-detail-add-app";
var UserDetailEditApp = require("./v2/user-detail-edit-app");
var SingleUserLogAction = require("../action/single_user_log_action");
var AppUserUtil = require("../util/app-user-util");
var hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
import ThirdPartyAppConfig from './third_app/third-party-app-config';
import ThirdAppDetail from "./third_app/third-app-detail";

var UserDetail = React.createClass({
    getDefaultProps : function() {
        return {
            userId : '1',
            appLists:[],
        };
    },
    reLayout : function() {
        this.onStoreChange();
    },
    getInitialState : function() {
        return {
            activeKey: "1",//tab激活页的key
            ...AppUserPanelSwitchStore.getState()
        };
    },
    onStoreChange : function() {
        var stateData =  AppUserPanelSwitchStore.getState();
        this.setState(stateData);
    },
    //滑动的延时
    panelSwitchTimeout : null,
    //面板向左滑
    panelSwitchLeft : function(timeout) {
        clearTimeout(this.panelSwitchTimeout);
        if(!timeout) {
            $(this.refs.wrap).addClass("move_left");
        } else {
            this.panelSwitchTimeout = setTimeout(() => {
                $(this.refs.wrap).addClass("move_left");
            },timeout);
        }
    },
    //面板向右滑
    panelSwitchRight : function(timeout) {
        clearTimeout(this.panelSwitchTimeout);
        if(!timeout) {
            $(this.refs.wrap).removeClass("move_left");
        } else {
            this.panelSwitchTimeout = setTimeout(() => {
                $(this.refs.wrap).removeClass("move_left");
            } , timeout);
        }
    },
    componentDidMount : function() {
        $(window).on("resize" , this.reLayout);
        AppUserPanelSwitchStore.listen(this.onStoreChange);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT , this.panelSwitchLeft);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT , this.panelSwitchRight);
    },
    componentWillUnmount : function() {
        $(window).off("resize" , this.reLayout);
        AppUserPanelSwitchStore.unlisten(this.onStoreChange);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT , this.panelSwitchLeft);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT , this.panelSwitchRight);
    },
    closeRightPanel : function() {
        if(_.isFunction(this.props.closeRightPanel)){
            this.props.closeRightPanel();
        }else{
            AppUserAction.closeRightPanel();
        }
        AppUserDetailAction.dismiss();
        SingleUserLogAction.dismiss();
        emitter.emit("user_detail_close_right_panel");
    },

    changeTab : function(key){
        this.setState({
            activeKey: key
        });
    },

    render : function() {
        var moveView = null;
        if(this.state.panel_switch_currentView) {
            let {thirdApp} = this.state;
            switch(this.state.panel_switch_currentView) {
                case 'app':
                    var initialUser = AppUserDetailStore.getState().initialUser;
                    moveView = (<UserDetailAddApp initialUser={initialUser}/>);
                    break;
                case 'editapp':
                    var initialUser = AppUserDetailStore.getState().initialUser;
                    var appInfo = this.state.panel_switch_appToEdit;
                    moveView = (
                        <UserDetailEditApp
                            initialUser={initialUser}
                            appInfo={appInfo}/>
                    );
                    break;
                case 'thirdapp':
                    moveView = (
                        <ThirdAppDetail {...thirdApp}/>
                    );
            }
        }
        //当前选择的应用（用户详情的接口中无法返回应用是否合格的属性，需要用用户列表接口中返回的应用是否合格属性）
        let selectApp = {};
        if(this.props.selectedAppId){
            selectApp = _.find(this.props.appLists,app => app.app_id === this.props.selectedAppId);
        }
        var tabPaneList = [
            <TabPane tab={Intl.get("user.basic.info", "基本资料")} key="1">
                {this.state.activeKey=="1" ? <div className="user_manage_user_detail">
                    <UserDetailBasic userId={this.props.userId}  selectApp={selectApp}/>
                </div>: null}
            </TabPane>
        ];
        if(hasPrivilege("USER_AUDIT_LOG_LIST")) {
            tabPaneList.push(
                <TabPane tab="用户分析" key="2">
                    {this.state.activeKey=="2" ? <div className="user-analysis">
                        <UserLoginAnalysis userId={this.props.userId} selectedAppId={this.props.selectedAppId}/>
                    </div>: null}
                </TabPane>
            );
            tabPaneList.push(
                <TabPane tab="审计日志" key="3">
                    {this.state.activeKey=="3" ? <div className="user-log">
                        <SingleUserLog 
                            userId={this.props.userId} 
                            selectedAppId={this.props.selectedAppId}
                            appLists={this.props.appLists}
                        />
                    </div>: null}
                </TabPane>
            );
        }
        if(hasPrivilege("USER_TIME_LINE")) {
            tabPaneList.push(
                <TabPane tab={Intl.get("user.change.record", "变更记录")} key="4">
                    {this.state.activeKey=="4" ?  <div className="user_manage_user_record">
                        <UserDetailChangeRecord
                            userId={this.props.userId}
                            selectedAppId={this.props.selectedAppId}
                        />
                    </div>: null}
                </TabPane>
            );
        }
        //异常登录isShownExceptionTab
        if (hasPrivilege("GET_LOGIN_EXCEPTION_USERS") && this.props.isShownExceptionTab){
            tabPaneList.push(
                <TabPane tab={Intl.get("user.login.abnormal", "异常登录")} key="5">
                    {this.state.activeKey=="5" ?   <div className="user_manage_login_abnormal">
                        <UserAbnormalLogin
                            userId={this.props.userId}
                            selectedAppId={this.props.selectedAppId}
                        />
                    </div>: null}
                </TabPane>
            );
        }

        // 权限控制
        if (hasPrivilege("GET_USER_THIRDPARTYS") || hasPrivilege("THIRD_PARTY_MANAGE")) {
            tabPaneList.push(
                <TabPane tab={Intl.get("third.party.app", "开放应用平台")} key="6">
                    <div className="third_party_app_config">
                        <ThirdPartyAppConfig
                            userId={this.props.userId}
                        />
                    </div>
                </TabPane>
            );
        }
        return (
            <div className="full_size app_user_full_size user_manage_user_detail_wrap" ref="wrap">
                <RightPanelClose onClick={this.closeRightPanel}/>
                <div className="full_size app_user_full_size_item wrap_padding">
                    <Tabs defaultActiveKey="1" onChange={this.changeTab} activeKey={this.state.activeKey}>
                        {tabPaneList}
                    </Tabs>
                </div>
                <div className="full_size app_user_full_size_item">
                    {moveView}
                </div>
            </div>
        );
    }
});

module.exports = UserDetail;