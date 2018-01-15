require("./css/nav-sidebar.less");
var userData = require("../../public/sources/user-data");
var Link = require("react-router").Link;
var Logo = require("../Logo/index.js");
var Avatar = require("../Avatar/index.js");
var LogOut = require("../../modules/logout/views/index.js");
var url = require("url");
var Popover = require("antd").Popover;
var classNames = require("classnames");
var insertStyle = require("../insert-style");
var Icon = require("antd").Icon;
var React = require('react');
var userInfoEmitter = require("../../public/sources/utils/emitters").userInfoEmitter;
var notificationEmitter = require("../../public/sources/utils/emitters").notificationEmitter;
var _ = require("underscore");
var UnreadMixin = require("./mixins/unread");
var websiteConfig = require("../../lib/utils/websiteConfig");
var setWebsiteConfigModuleRecord = websiteConfig.setWebsiteConfigModuleRecord;
var getLocalWebsiteConfigModuleRecord = websiteConfig.getLocalWebsiteConfigModuleRecord;
var getWebsiteConfig = websiteConfig.getWebsiteConfig;
let history = require("../../public/sources/history");
import ModalIntro from "../modal-intro";
import CONSTS from  "LIB_DIR/consts";
import {hasPrivilege} from "CMP_DIR/privilege/checker";
//需要加引导的模块
const menu = CONSTS.STORE_NEW_FUNCTION.SCHEDULE_MANAGEMENT;
/**
 *[
 * {"routePath":"user","name":"用户管理"},
 * {"routePath":"analysis","name":"运营分析"}
 *]
 */
//获取菜单
function getMenus() {
    var userInfo = userData.getUserData();
    var sideBarMenus = userInfo.sideBarMenus;
    return sideBarMenus;
}
//获取用户logo
function getUserInfoLogo() {
    var userInfoLogo = userData.getUserData().user_logo;
    return userInfoLogo;
}
//获取用户名、昵称
function getUserName() {
    var nick_name = userData.getUserData().nick_name;
    var user_name = userData.getUserData().user_name;
    var userInfo = {
        nick_name: nick_name,
        user_name: user_name
    };
    return userInfo;
}

//不需要在左侧图标列表中输出的链接
var ExcludeLinkList = [
    {"name": Intl.get("menu.sales.homepage", "销售主页"), path: "sales/home"},
    {"name": Intl.get("common.my.app", "我的应用"), path: "my_app"},
    {"name": Intl.get("menu.backend", "后台管理"), path: "background_management"},
    {"name": Intl.get("menu.userinfo.manage", "个人信息管理"), path: "user_info_manage"},
    {"name": Intl.get("menu.system.notification", "系统消息"), path: "notification_system"},
    {"name": Intl.get("menu.appuser.apply", "用户审批"), path: "apply"}
];

//后台管理配置
const BackendConfigLinkList = [
    {
        name: Intl.get("menu.user", "成员管理"),
        href: "/background_management/user",
        key: "user",
        privilege: "USER_MANAGE_LIST_USERS"
    }, {
        name: Intl.get("menu.salesstage", "销售阶段管理"),
        href: "/background_management/sales_stage",
        key: "sales_stage",
        privilege: "BGM_SALES_STAGE_ADD"
    }, {
        name: Intl.get("menu.salesteam", "团队管理"),
        href: "/background_management/sales_team",
        key: "sales_team",
        privilege: "BGM_SALES_TEAM_LIST"
    }, {
        name: Intl.get("menu.config", "配置"),
        href: "/background_management/configaration",
        key: "configaration",
        privilege: "CREATE_CONFIG_INDUSTRY"
    }
];

//通知类型
var NotificationLinkList = [
    {
        name: Intl.get("menu.system.notification", "系统消息"),
        href: "/notification_system",
        key: "notification_system",
        privilege: 'NOTIFICATION_SYSTEM_LIST'
    }
];
//审批入口
var applyentryLink = [
    {
        name: Intl.get("menu.appuser.apply", "用户审批"),
        href: "/apply",
        key: "apply", privilege: "APP_USER_APPLY_LIST"
    }
];

//左侧导航图标名称和路径列表
var NavSidebarLists = [];
//左侧响应式导航栏所用各部分高度
var responsiveLayout = {
    //logo 所占的高度
    logoHeight: 0,
    //图标的高度
    MenusHeight: 0,
    //通知、二维码、个人信息的总高度
    userInfoHeight: 0
};
//侧边普通按钮时引导模态框的样式
var commonIntroModalLayout = {
    //展示孔比原图标要变化的宽度
    holeGapWidth : 16,
    //展示孔比原图标要变化的高度
    holeGapHeight : 16,
    //展示孔展示位置比原图标演示变化的左边距
    holeGapLeft : -7,
    //展示孔展示位置比原图标演示变化的上边距
    holeGapTop : -8,
    //提示区域展示位置比原图标展示变化的左边距
    tipAreaLeft: 15,
    //提示区域展示位置比原图标展示变化的上边距
    tipAreaTop: -50,
};
//变成汉堡包按钮后引导模态框的样式
var hamburgerIntroModalLayout = {
    //展示孔比原图标要变化的宽度
    holeGapWidth : -17,
    //展示孔比原图标要变化的高度
    holeGapHeight : 24,
    //展示孔展示位置比原图标演示变化的左边距
    holeGapLeft : 10,
    //展示孔展示位置比原图标演示变化的上边距
    holeGapTop : -12,
    //提示区域展示位置比原图标展示变化的左边距
    tipAreaLeft: 35,
    //提示区域展示位置比原图标展示变化的上边距
    tipAreaTop: -50,
};

var NavSidebar = React.createClass({
    mixins: [UnreadMixin],
    getInitialState: function () {
        return {
            menus: getMenus(),
            userInfoLogo: getUserInfoLogo(),
            userInfo: getUserName(),
            messages: {
                customer: 0,
                apply: 0,
                system: 0
            },
            //需要加引导功能的某个元素
            $introElement:"",
            isShowIntroModal:false,//是否展示引导的模态框
            introModalLayout:{},//模态框上蚂蚁及提示的展示样式
            tipMessage:"",//提示内容
        };
    },
    //轮询获取未读数的清除器
    unreadTimeout: null,
    //动态添加未读数样式，以便在通知页面顶部显示未读数数字
    insertStyleForUnreadCount: function (unreadCountObj) {
        if (this.unreadStyle) {
            this.unreadStyle.destroy();
        }
        if (!_.isObject(unreadCountObj)) {
            return;
        }
        var styles = [];
        for (var message_type in unreadCountObj) {
            var count = unreadCountObj[message_type];
            var className = message_type === 'apply' ? 'applyfor' : message_type;
            styles.push(`.notification_${className}_ico a:before{
                display: ${count > 0 ? 'block' : 'none'};
                content : "${count > 99 ? '99+' : count}";
           }`);
        }
        this.unreadStyle = insertStyle(styles.join('\n'));
    },
    //刷新未读数
    refreshNotificationUnread: function () {
        if (Oplate && Oplate.unread) {
            var messages = Oplate.unread;
            this.setState({
                messages: messages
            });
            //插入样式，以便在客户提醒，系统消息，申请消息处显示未读数的小红点和未读数
            this.insertStyleForUnreadCount(messages);
        }
    },
    changeUserInfoLogo: function (userLogoInfo) {
        //修改名称
        if (userLogoInfo.nickName) {
            this.state.userInfo.nick_name = userLogoInfo.nickName;
            this.setState({
                userInfo: this.state.userInfo
            });
        }
        //logo
        if (userLogoInfo.userLogo) {
            this.setState({
                userInfoLogo: userLogoInfo.userLogo
            });
            //修改缓存中对应的图片信息
            userData.updateUserLogo(userLogoInfo)
        }
    },
    resizeFunction: function () {
        this.setState({});
    },
    //确定要加引导的元素是日程管理的图标还是汉堡包按钮
    selectedIntroElement:function () {
        //查看汉堡包按钮是否存在
        var hamburger = document.getElementById("hamburger");
        var isHamburgerShow = hamburger.style.display;
        //要加引导的元素
        var $introElement = "", introModalLayout = {};
        if (isHamburgerShow == "none"){
            $introElement = $("li." + menu.routePath + "_ico a i");
            introModalLayout = commonIntroModalLayout;
        }else if (isHamburgerShow == "block"){
            $introElement = $("#hamburger");
            introModalLayout = hamburgerIntroModalLayout;
        }
        //只有在要加引导的元素变化之后才会setState，如果元素不变，不需要更改状态
        if ($introElement !== this.state.$introElement){
            this.setState({
                isShowIntroModal: true,
                tipMessage: Intl.get("schedule.tip.intro.message", "日程功能上线了，赶快点开看看吧！"),
                $introElement: $introElement,
                introModalLayout: introModalLayout
            })
        }
    },

    //是否需要发送ajax请求获取"未读数"数据
    needSendNotificationRequest: false,
    componentDidMount: function () {
        userInfoEmitter.on(userInfoEmitter.CHANGE_USER_LOGO, this.changeUserInfoLogo);
        notificationEmitter.on(notificationEmitter.UPDATE_NOTIFICATION_UNREAD, this.refreshNotificationUnread);
        $(window).on('resize', this.resizeFunction);
        var notificationPrivileges = this.getLinkListByPrivilege(NotificationLinkList);
        this.needSendNotificationRequest = notificationPrivileges.length >= 1;
        this.refreshNotificationUnread();
        //响应式设计 logo占据的实际高度
        responsiveLayout.logoHeight = $('.header-logo').outerHeight();
        //响应式设计 如果导航存在计算导航图标 占据的实际高度
        responsiveLayout.MenusHeight = $('.navbar-collapse').outerHeight();
        //计算 通知、二维码、个人信息 占据的实际高度
        responsiveLayout.userInfoHeight = $(this.refs.userInfo).outerHeight();
        this.calculateHeight();
        $(window).on('resize', this.calculateHeight);
        //获取已经点击过的模块
        getWebsiteConfig((WebsiteConfigModuleRecord)=>{
            //本次要加引导的模块是否点击过
            if (this.isIntroModlueNeverClicked(WebsiteConfigModuleRecord)){
                this.selectedIntroElement();
            }
        });
        //重新渲染一次，需要使用高度
        this.setState({});
    },
    //本次要加的引导是否没有被点击过
    isIntroModlueNeverClicked: function (WebsiteConfigModuleRecord) {
       return (_.indexOf(WebsiteConfigModuleRecord, menu.name) < 0);
    },
    calculateHeight: function () {
        //>75  目的是左侧只有一个导航图标时不会出现汉堡包按钮
        //窗口高度小于 （logo高度+导航高度+个人信息高度）时，出现汉堡包按钮，隐藏导航图标
        if ($(window).height() < (responsiveLayout.logoHeight + responsiveLayout.MenusHeight + responsiveLayout.userInfoHeight) && (responsiveLayout.MenusHeight > 75)) {
            $('#hamburger').show();
            $('#menusLists').hide();
        } else {
            $('#hamburger').hide();
            $('#menusLists').show();
        }
        //模态框存在时，才需要选要加引导的元素
        if (this.state.isShowIntroModal){
            this.selectedIntroElement();
        }
    },
    componentWillUnmount: function () {
        userInfoEmitter.removeListener(userInfoEmitter.CHANGE_USER_LOGO, this.changeUserInfoLogo);
        notificationEmitter.removeListener(notificationEmitter.UPDATE_NOTIFICATION_UNREAD, this.refreshNotificationUnread);
        $(window).off('resize', this.resizeFunction);
        clearTimeout(this.unreadTimeout);
    },
    navContainerHeightFnc: function () {
        return $(window).height();
    },
    //是否有未读消息
    hasUnread: function () {
        var numbers = this.state.messages;
        for (var key in numbers) {
            if (numbers[key] > 0 && key !== 'approve' && key !== 'apply') {
                return true;
            }
        }
        return false;
    },
    getNotificationClass: function () {
        var urlInfo = url.parse(window.location.href);
        if (/^\/notification\//.test(urlInfo.pathname)) {
            return "active";
        } else {
            return "";
        }
    },

    getLinkListByPrivilege: function (linkList) {
        let userPrivileges = userData.getUserData().privileges;
        return linkList.filter(function (item) {
            if (userPrivileges.indexOf(item.privilege) >= 0) {
                return true;
            }
        });
    },
    getNotificationLinks: function (notifications) {
        var _this = this;
        var pathname = url.parse(window.location.href).pathname;
        return (
            <ul className="ul-unstyled">
                {
                    notifications.map(function (obj) {
                        var cls = classNames({
                            pad: _this.state.messages[obj.key] > 99
                        });
                        var extraClass = classNames({
                            active: obj.href === pathname
                        });
                        return (
                            <li className={cls} key={obj.key}>
                                <Link to={obj.href} activeClassName="active">
                                    {obj.name}
                                    {_this.state.messages[obj.key] > 0 ? (
                                        <em>{_this.state.messages[obj.key] > 99 ? '99+' : _this.state.messages[obj.key]}</em>) : null}
                                </Link>
                            </li>
                        );
                    })
                }
            </ul>
        );
    },
    //个人信息部分右侧弹框
    getUserInfoLinks: function () {
        //个人资料部分
        var UserInfoLinkList = [
            {
                name: Intl.get("user.info.user.info", "个人资料"),
                href: "/user_info_manage/user_info",
                key: "user_info"
            },
            {
                name: Intl.get("common.edit.password", "修改密码"),
                href: "/user_info_manage/user_pwd",
                key: "user_pwd"
            }
        ];
        return (
            <ul className="ul-unstyled">
                {
                    UserInfoLinkList.map(function (obj) {
                        return (
                            <li key={obj.key}>
                                <Link to={obj.href} activeClassName="active">
                                    {obj.name}
                                </Link>
                            </li>
                        );
                    })
                }
                <li>
                    <LogOut/>
                </li>
            </ul>
        );
    },
    getNotificationBlock: function () {
        var notificationLinks = this.getLinkListByPrivilege(NotificationLinkList);
        if (!notificationLinks.length) {
            return null;
        }
        return (
            <div className="notification">
                <Link to={notificationLinks[0].href} activeClassName="active">
                    <i className="iconfont icon-tongzhi" title={Intl.get("menu.system.notification", "系统消息")}>
                    </i>
                </Link>
            </div>
        );
    },
    getApplyBlock: function () {
        var applyLinks = this.getLinkListByPrivilege(applyentryLink);
        if (!applyLinks.length) {
            return null;
        }
        return (
            <div className="sidebar-applyentry">
                <Link to={applyLinks[0].href} activeClassName="active">
                    <i className="iconfont icon-applyentry" title={Intl.get("menu.appuser.apply", "用户审批")}>
                    </i>
                </Link>

            </div>
        );
    },
    getBackendConfigLinks: function (backendConfigLinks) {
        return (
            <ul className="ul-unstyled">
                {
                    backendConfigLinks.map(function (obj) {
                        return (
                            <li key={obj.key}>
                                <Link to={obj.href} activeClassName="active">
                                    {obj.name}
                                </Link>
                            </li>
                        );
                    })
                }
            </ul>
        );
    },
    //后台管理配置模块
    renderBackendConfigBlock: function () {
        let backendConfigLinks = this.getLinkListByPrivilege(BackendConfigLinkList);
        if (!backendConfigLinks.length) {
            return null;
        }
        let backendConfigList = this.getBackendConfigLinks(backendConfigLinks);
        let defaultLink = backendConfigLinks[0];
        return (
            <div className="sidebar-backend-config">
                <Popover content={backendConfigList} trigger="hover" placement="rightBottom"
                         overlayClassName="nav-sidebar-backend-config">
                    <Link to={defaultLink.href} activeClassName="active">
                        <i className="iconfont icon-role-auth-config"/>
                    </Link>
                </Popover>
            </div>
        )
    },

    //侧边导航左下个人信息
    getUserInfoBlock: function () {
        var userinfoList = this.getUserInfoLinks();
        return (
            <div className="sidebar-userinfo">
                <Popover content={userinfoList} trigger="hover"
                         placement="rightBottom"
                         overlayClassName="nav-sidebar-userinfo">
                    <div className="avatar_container">
                        <Avatar className="avatar"
                                size="51"
                                src={this.state.userInfoLogo}
                                userName={this.state.userInfo.user_name}
                                nickName={this.state.userInfo.nick_name}
                                round="true" link="true" url="/user_info_manage"/>
                    </div>
                </Popover>
            </div>
        )
    },
    getNavbarLists: function () {
        //侧边导航高度减少后，出现汉堡包按钮，汉堡包按钮的弹出框
        return (
            <ul className="ul-unstyled">
                {NavSidebarLists.map(function (obj) {
                    return (
                        <li>
                            <Link to={`/${obj.routePath}`} activeClassName="active">
                                {obj.name}
                            </Link>
                        </li>
                    );
                })
                }
            </ul>
        );
    },
    handleOnclickHole:function () {
        //跳转到新加模块界面
        history.pushState({
        }, "/"+ menu.routePath, {});
        this.saveModalClicked();
    },
    //将该模块存入后端并隐藏模态框
    saveModalClicked: function () {
        this.setState({
            isShowIntroModal:false
        });
        setWebsiteConfigModuleRecord({"module_record":[menu.name]});
    },
    hideModalIntro:function () {
      this.saveModalClicked();
    },
    render: function () {
        var windowHeight = this.navContainerHeightFnc();
        const pathName = location.pathname.replace(/^\/|\/$/g, "");
        var currentPageCategory = pathName.split("/")[0];
        //不在左侧循环输出的链接
        var excludePathList = _.pluck(ExcludeLinkList, 'path');
        var _this = this;
        return (
            <nav className="navbar">
                <div className="container">
                    <div className="logo-and-menus" ref="logoAndMenus"
                    >
                        <div className="header-logo">
                            <Logo />
                        </div>
                        <div className="collapse navbar-collapse">
                            <ul className="nav navbar-nav" id="menusLists">
                                {
                                    //过滤掉不显示的
                                    this.state.menus.filter(function (menu, i) {
                                        if (excludePathList.indexOf(menu.routePath) < 0) {
                                            return true;
                                        }
                                        return false;
                                    }).map(function (menu, i) {
                                        var category = menu.routePath.replace(/\/.*$/, '');
                                        var extraClass = currentPageCategory === category && pathName !== "contract/dashboard" ? 'active' : '';
                                        //将侧边导航图标的名称和路径放在数组NavSidebarLists中
                                        if (!(_.contains(NavSidebarLists, menu))) {
                                            NavSidebarLists.push(menu)
                                        }
                                        return (
                                            <li key={i} className={`ico ${menu.routePath.replace(/\//g, '_')}_ico`}>
                                                <Link to={`/${menu.routePath}`}
                                                      activeClassName={extraClass}
                                                      className={extraClass}
                                                >
                                                    <i title={menu.name}></i>
                                                    <span>{menu.name}</span>
                                                </Link>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                            <Popover content={this.getNavbarLists()} trigger="hover" placement="rightTop"
                                     overlayClassName="nav-sidebar-lists">
                                <div className="hamburger" id="hamburger">
                                    <span className="line"></span>
                                    <span className="line"></span>
                                    <span className="line"></span>
                                </div>
                            </Popover>
                        </div>

                    </div>

                    <div className="sidebar-user" ref="userInfo">
                        {_this.getApplyBlock()}
                        {_this.getNotificationBlock()}
                        {_this.renderBackendConfigBlock()}
                        {_this.getUserInfoBlock()}
                    </div>
                </div>
                {this.state.isShowIntroModal && hasPrivilege("MEMBER_SCHEDULE_MANAGE") ? <ModalIntro
                    introModalLayout={this.state.introModalLayout}
                    $introElement={this.state.$introElement}
                    handleOnclickHole={this.handleOnclickHole}
                    hideModalIntro={this.hideModalIntro}
                    message={this.state.tipMessage}
                />:null}
            </nav>
        );
    }
});

module.exports = NavSidebar;
