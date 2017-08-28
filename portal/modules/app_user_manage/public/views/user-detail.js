

var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../css/user-detail-es_VE.scss");
}else if (language.lan() == "zh"){
    require("../css/user-detail-zh_CN.scss");
}
var Tabs = require("antd").Tabs;
var TabPane = Tabs.TabPane;
var classNames = require("classnames");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var RightPanelClose = require("../../../../components/rightPanel").RightPanelClose;
var AppUserAction = require("../action/app-user-actions");
var AppUserDetailAction = require("../action/app-user-detail-actions");
var UserDetailBasic = require("./user-detail-basic");
var SingleUserLogBasic = require('./single_user_log_basic');
var UserDetailChangeRecord = require('./user-detail-change-record');
var UserAbnormalLogin = require('./user-abnormal-login');
var AppUserPanelSwitchStore = require("../store/app-user-panelswitch-store");
var AppUserDetailStore = require("../store/app-user-detail-store");
import UserDetailAddApp from "./v2/user-detail-add-app";
var UserDetailEditApp = require("./v2/user-detail-edit-app");
var SingleUserLogAction = require("../action/single_user_log_action");
var AppUserUtil = require("../util/app-user-util");
var hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;


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
        return AppUserPanelSwitchStore.getState();
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
                console.log('move');
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
                console.log('move');
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
        AppUserAction.closeRightPanel();
        AppUserDetailAction.dismiss();
        SingleUserLogAction.dismiss();
        emitter.emit("user_detail_close_right_panel");
    },

    changeTab : function(){
        this.setState({
            
        });
    },

    render : function() {
        var moveView = null;
        if(this.state.panel_switch_currentView) {
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
            }
        }

        var tabPaneList = [
            <TabPane tab={Intl.get("user.basic.info", "基本资料")} key="detail">
                <div className="user_manage_user_detail">
                    <UserDetailBasic userId={this.props.userId}/>
                </div>
            </TabPane>
        ];
        if(hasPrivilege("USER_AUDIT_LOG_LIST")) {
            tabPaneList.push(
                <TabPane tab={Intl.get("user.detail.analysis", "分析")} key="user_log">
                    <div className="user_manage_user_log">
                        <SingleUserLogBasic userId={this.props.userId} />
                    </div>
                </TabPane>
            );
        }
        if(hasPrivilege("USER_TIME_LINE")) {
            tabPaneList.push(
                <TabPane tab={Intl.get("user.change.record", "变更记录")} key="change_record">
                    <div className="user_manage_user_record">
                        <UserDetailChangeRecord
                            userId={this.props.userId}
                            appLists={this.props.appLists}
                        />
                    </div>
                </TabPane>
            );
        }
        //异常登录isShownExceptionTab
        if (hasPrivilege("GET_LOGIN_EXCEPTION_USERS") && this.props.isShownExceptionTab){
            tabPaneList.push(
                <TabPane tab={Intl.get("user.login.abnormal", "异常登录")} key="login_abnormal">
                    <div className="user_manage_login_abnormal">
                        <UserAbnormalLogin
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
                    <Tabs defaultActiveKey="detail" onChange={this.changeTab}>
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