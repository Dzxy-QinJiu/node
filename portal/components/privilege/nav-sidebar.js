require('./css/nav-sidebar.less');
var userData = require('../../public/sources/user-data');
var menuUtil = require('../../public/sources/utils/menu-util');
var Logo = require('../Logo/index.js');
var Avatar = require('../Avatar/index.js');
var LogOut = require('../../modules/logout/views/index.js');
var Popover = require('antd').Popover;
var classNames = require('classnames');
var React = require('react');
var createReactClass = require('create-react-class');
var _ = require('lodash');
var UnreadMixin = require('./mixins/unread');
var websiteConfig = require('../../lib/utils/websiteConfig');
var setWebsiteConfigModuleRecord = websiteConfig.setWebsiteConfigModuleRecord;
var getWebsiteConfig = websiteConfig.getWebsiteConfig;
let history = require('../../public/sources/history');
import {NavLink} from 'react-router-dom';
import ModalIntro from '../modal-intro';
import CONSTS from 'LIB_DIR/consts';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {storageUtil} from 'ant-utils';
import {DIFF_APPLY_TYPE_UNREAD_REPLY} from 'PUB_DIR/sources/utils/consts';
import {hasCalloutPrivilege} from 'PUB_DIR/sources/utils/common-method-util';
import {phoneEmitter, notificationEmitter, userInfoEmitter,phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import DialUpKeyboard from 'CMP_DIR/dial-up-keyboard';


const session = storageUtil.session;
//需要加引导的模块
const schedule_menu = CONSTS.STORE_NEW_FUNCTION.SCHEDULE_MANAGEMENT;
//个人信息菜单部分距离底部的绝对高度18
const USER_INFO_BOTTOM = 18;
//单个菜单的最小高度
const ONE_MENU_HEIGHT = 32;

//需要特殊处理的菜单的id
const MENU = {
    'NOTE': 'notification',
    'BACK_CONFIG': 'background_management',
    'USER_INFO': 'user_info_manage'
};

//获取用户logo
function getUserInfoLogo() {
    return userData.getUserData().user_logo;
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


//左侧响应式导航栏所用各部分高度
const responsiveLayout = {
    //logo和菜单占据的实际高度
    logoAndMenusHeight: 0,
    //通知、二维码、个人信息的总高度
    userInfoHeight: 0,
    //只显示名字的菜单高度
    shortNameMenusHeight: 0,
    //只显示名字的个人信息高度
    shortNameUserInfoHeight: 0
};
//侧边普通按钮时引导模态框的样式
const commonIntroModalLayout = {
    //展示孔比原图标要变化的宽度
    holeGapWidth: 16,
    //展示孔比原图标要变化的高度
    holeGapHeight: 16,
    //展示孔展示位置比原图标演示变化的左边距
    holeGapLeft: -7,
    //展示孔展示位置比原图标演示变化的上边距
    holeGapTop: -8,
    //提示区域展示位置比原图标展示变化的左边距
    tipAreaLeft: 15,
    //提示区域展示位置比原图标展示变化的上边距
    tipAreaTop: -50,
};
//变成汉堡包按钮后引导模态框的样式
const hamburgerIntroModalLayout = {
    //展示孔比原图标要变化的宽度
    holeGapWidth: -17,
    //展示孔比原图标要变化的高度
    holeGapHeight: 24,
    //展示孔展示位置比原图标演示变化的左边距
    holeGapLeft: 10,
    //展示孔展示位置比原图标演示变化的上边距
    holeGapTop: -12,
    //提示区域展示位置比原图标展示变化的左边距
    tipAreaLeft: 35,
    //提示区域展示位置比原图标展示变化的上边距
    tipAreaTop: -50,
};

var NavSidebar = createReactClass({
    displayName: 'NavSidebar',
    mixins: [UnreadMixin],
    getDefaultProps: function() {
        return {
            toggleNotificationPanel: function() {
            },
            closeNotificationPanel: function() {
            },
        };
    },

    getInitialState: function() {
        return {
            menus: menuUtil.getFirstLevelMenus(),
            userInfoLogo: getUserInfoLogo(),
            userInfo: getUserName(),
            messages: {
                unhandleClue: 0,//待处理的线索数
                approve: 0,//用户申请待审批数
                unhandleCustomerVisit: 0,//出差申请待我审批数
                unhandleBusinessOpportunities: 0,//销售机会申请待我审批数
                unhandlePersonalLeave: 0//请假申请待我审批数
            },
            //需要加引导功能的某个元素
            $introElement: '',
            isShowIntroModal: false,//是否展示引导的模态框
            introModalLayout: {},//模态框上蚂蚁及提示的展示样式
            tipMessage: '',//提示内容
            hasUnreadReply: false,//是否有未读的回复
            hasDiffApplyUnreadReply: false,//除用户申请外其他申请是否有未读回复
            hideNavIcon: false,//是否隐藏图标（小屏幕只展示文字）
            isShowDialUpKeyboard: false,//是否展示拨号键盘的标识
            ronglianNum: ''//正在拨打的容联的电话
        };
    },
    propTypes: {
        toggleNotificationPanel: PropTypes.func,
        closeNotificationPanel: PropTypes.func,
        isShowNotificationPanel: PropTypes.bool
    },

    changeUserInfoLogo: function(userLogoInfo) {
        //修改名称
        if (userLogoInfo.nickName) {
            var userInfo = this.state.userInfo;
            userInfo.nick_name = userLogoInfo.nickName;
            this.setState({
                userInfo: userInfo
            });
        }
        //logo
        if (userLogoInfo.userLogo) {
            this.setState({
                userInfoLogo: userLogoInfo.userLogo
            });
            //修改缓存中对应的图片信息
            userData.updateUserLogo(userLogoInfo);
        }
    },

    //确定要加引导的元素是日程管理的图标还是汉堡包按钮
    selectedIntroElement: function() {
        //查看汉堡包按钮是否存在
        var hamburger = document.getElementById('hamburger');
        var isHamburgerShow = hamburger && hamburger.style.display;
        //要加引导的元素
        var $introElement = '', introModalLayout = {};
        if (isHamburgerShow === 'none') {
            $introElement = $('li.' + schedule_menu.routePath + '_icon_container a');
            introModalLayout = commonIntroModalLayout;
        } else if (isHamburgerShow === 'block') {
            $introElement = $('#hamburger');
            introModalLayout = hamburgerIntroModalLayout;
        }
        //只有在要加引导的元素变化之后才会setState，如果元素不变，不需要更改状态
        if ($introElement !== this.state.$introElement) {
            this.setState({
                isShowIntroModal: true,
                tipMessage: Intl.get('schedule.tip.intro.message', '日程功能上线了，赶快点开看看吧！'),
                $introElement: $introElement,
                introModalLayout: introModalLayout
            });
        }
    },

    componentDidMount: function() {
        userInfoEmitter.on(userInfoEmitter.CHANGE_USER_LOGO, this.changeUserInfoLogo);
        //未读回复列表变化后触发
        notificationEmitter.on(notificationEmitter.APPLY_UNREAD_REPLY, this.refreshHasUnreadReply);
        phoneEmitter.on(phoneEmitter.CALL_CLIENT_INITED,this.triggerDialUpKeyboardShow);
        //其他类型的未读回复列表变化后触发
        notificationEmitter.on(notificationEmitter.DIFF_APPLY_UNREAD_REPLY, this.refreshDiffApplyHasUnreadReply);
        //正在拨打容联的电话
        phoneMsgEmitter.on(phoneMsgEmitter.CALLING_RONGLIAN_BTN,this.callingRonglianBtn);
        //获取用户审批的未读回复列表
        this.getHasUnreadReply();
        //获取其他类型的用户审批的未读回复列表
        this.getHasDiffApplyUnreadReply();
        //响应式设计 logo和菜单占据的实际高度
        responsiveLayout.logoAndMenusHeight = $('.logo-and-menus').outerHeight(true);
        //计算 拨号按钮、通知、设置、个人信息 占据的实际高度
        responsiveLayout.userInfoHeight = $(this.userInfo).outerHeight(true);
        this.calculateHeight();
        $(window).on('resize', this.calculateHeight);
        //获取已经点击过的模块
        getWebsiteConfig((WebsiteConfigModuleRecord) => {
            //本次要加引导的模块是否点击过
            if (this.isIntroModlueNeverClicked(WebsiteConfigModuleRecord)) {
                this.selectedIntroElement();
            }
        });
        $('.navbar').on('click', '.clue_customer_icon_container', function(e) {
            //点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到线索未处理的数字上，进行跳转
            history.push('/clue_customer', {clickUnhandleNum: true});
        });
    },
    //呼叫中心的电话系统初始化完成后，触发拨号键盘是否展示的判断
    triggerDialUpKeyboardShow: function() {
        //电话系统初始化完成后，判断是否有打电话的权限（是否配坐席号，配置了才可以打电话）
        if (hasCalloutPrivilege) {
            this.setState({isShowDialUpKeyboard: true});
            setTimeout(() => {
                //计算 拨号按钮、通知、设置、个人信息 占据的实际高度
                responsiveLayout.userInfoHeight = $(this.userInfo).outerHeight(true);
                this.calculateHeight();
            });
        }
    },
    getHasDiffApplyUnreadReply: function() {
        const DIFF_APPLY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.DIFF_APPLY_UNREAD_REPLY;
        let userId = userData.getUserData().user_id;
        //获取sessionStore中已存的未读回复列表
        let applyUnreadReply = session.get(DIFF_APPLY_UNREAD_REPLY);
        if (applyUnreadReply) {
            let applyUnreadReplyObj = JSON.parse(applyUnreadReply);
            let applyUnreadReplyList = _.isArray(applyUnreadReplyObj[userId]) ? applyUnreadReplyObj[userId] : [];
            this.refreshDiffApplyHasUnreadReply(applyUnreadReplyList);
        }
    },
    getHasUnreadReply: function() {
        const APPLY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.APPLY_UNREAD_REPLY;
        let userId = userData.getUserData().user_id;
        //获取sessionStore中已存的未读回复列表
        let applyUnreadReply = session.get(APPLY_UNREAD_REPLY);
        if (applyUnreadReply) {
            let applyUnreadReplyObj = JSON.parse(applyUnreadReply);
            let applyUnreadReplyList = _.isArray(applyUnreadReplyObj[userId]) ? applyUnreadReplyObj[userId] : [];
            this.refreshHasUnreadReply(applyUnreadReplyList);
        }
    },

    refreshHasUnreadReply: function(unreadReplyList) {
        if (_.isArray(unreadReplyList) && unreadReplyList.length) {
            this.setState({hasUnreadReply: true});
        } else {
            this.setState({hasUnreadReply: false});
        }
    },
    refreshDiffApplyHasUnreadReply: function(unreadReplyList) {
        if (_.isArray(unreadReplyList) && unreadReplyList.length) {
            this.setState({hasDiffApplyUnreadReply: true});
        } else {
            this.setState({hasDiffApplyUnreadReply: false});
        }
    },
    //本次要加的引导是否没有被点击过
    isIntroModlueNeverClicked: function(WebsiteConfigModuleRecord) {
        return (_.indexOf(WebsiteConfigModuleRecord, schedule_menu.name) < 0);
    },
    //菜单展示成汉堡包
    showHamburger: () => {
        $('#hamburger').show();
        $('#menusLists').hide();
    },
    //隐藏汉堡包，展示菜单
    hideHamburger: () => {
        $('#hamburger').hide();
        $('#menusLists').show();
    },
    //计算并设置菜单展示样式
    calculateHeight: function() {
        if (this.calculateHeightTimeOut) {
            clearTimeout(this.calculateHeightTimeOut);
            this.calculateHeightTimeOut = null;
        }
        this.calculateHeightTimeOut = setTimeout(() => {
            //窗口高度小于 （logo和菜单高度+个人信息高度+个人信息离底部的绝对高度）时，隐藏导航图标，只展示文字
            if ($(window).height() < (responsiveLayout.logoAndMenusHeight + responsiveLayout.userInfoHeight + USER_INFO_BOTTOM)) {
                this.hideHamburger();
                this.setState({
                    hideNavIcon: true
                }, () => {
                    //如果再缩放，则展示汉堡包
                    responsiveLayout.shortNameMenusHeight = $('.logo-and-menus').outerHeight(true);
                    responsiveLayout.shortNameUserInfoHeight = $(this.userInfo).outerHeight(true);
                    if ($(window).height() < (responsiveLayout.shortNameMenusHeight + responsiveLayout.shortNameUserInfoHeight + USER_INFO_BOTTOM)
                        && (responsiveLayout.shortNameMenusHeight > ONE_MENU_HEIGHT)) {
                        //>32  目的是左侧只有一个导航菜单时不会出现汉堡包按钮
                        this.showHamburger();
                    }
                });
            } else {
                this.hideHamburger();
                this.setState({
                    hideNavIcon: false
                });
            }
            //模态框存在时，才需要选要加引导的元素
            if (this.state.isShowIntroModal) {
                this.selectedIntroElement();
            }
        }, 100);
    },
    callingRonglianBtn: function(data) {
        if (_.get(data,'callNum')){
            this.setState({
                ronglianNum: _.get(data,'callNum')
            });
        }else{
            this.setState({
                ronglianNum: ''
            });
        }
    },
    componentWillUnmount: function() {
        userInfoEmitter.removeListener(userInfoEmitter.CHANGE_USER_LOGO, this.changeUserInfoLogo);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UNREAD_REPLY, this.refreshHasUnreadReply);
        notificationEmitter.removeListener(notificationEmitter.DIFF_APPLY_UNREAD_REPLY, this.refreshDiffApplyHasUnreadReply);
        phoneEmitter.removeListener(phoneEmitter.CALL_CLIENT_INITED, this.triggerDialUpKeyboardShow);
        //正在拨打容联的电话
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CALLING_RONGLIAN_BTN,this.callingRonglianBtn);
        $(window).off('resize', this.calculateHeight);
    },


    toggleNotificationPanel(event) {
        event.stopPropagation();
        this.props.toggleNotificationPanel();
    },
    //渲染通知菜单
    getNotificationBlock: function() {
        let notification = menuUtil.getMenuById(MENU.NOTE);
        if (!notification) {
            return null;
        }
        let noticeCls = classNames('iconfont icon-tongzhi',{
            'acitve': this.props.isShowNotificationPanel,
        });
        let aCls = classNames({
            'acitve': this.props.isShowNotificationPanel,
        });
        return (
            <div className="notification" onClick={this.toggleNotificationPanel}>
                {
                    this.state.hideNavIcon ? <a className={aCls}>{notification.shortName}</a> :
                        <i className={noticeCls} title={notification.name}></i>
                }
            </div>
        );
    },

    //后台管理的二级菜单
    getBackendConfigLinks: function(backendConfigLinks) {
        return (
            <ul className="ul-unstyled">
                {
                    backendConfigLinks.map(function(obj) {
                        return (
                            <li key={obj.id}>
                                <NavLink to={obj.routePath} activeClassName="active">
                                    {obj.name}
                                </NavLink>
                            </li>
                        );
                    })
                }
            </ul>
        );
    },
    //后台管理配置模块
    renderBackendConfigBlock: function() {
        let backendConfigMenu = menuUtil.getMenuById(MENU.BACK_CONFIG);
        if (!backendConfigMenu || !backendConfigMenu.routes) {
            return null;
        }
        let backendConfigList = this.getBackendConfigLinks(backendConfigMenu.routes);
        let wrapperCls = classNames({
            'sidebar-backend-config': true,
            'text-nav-li': this.state.hideNavIcon
        });
        let backendConfigCls = classNames('iconfont icon-role-auth-config',{
            'deactivation': this.props.isShowNotificationPanel,
        });
        let backendConfigSpanCls = classNames({
            'deactivation': this.props.isShowNotificationPanel,
        });
        return (
            <div className={wrapperCls}>
                <Popover content={backendConfigList} trigger="hover" placement="rightBottom"
                    overlayClassName="nav-sidebar-backend-config">
                    <NavLink to={backendConfigMenu.routePath} activeClassName="active">
                        {this.state.hideNavIcon ? <span className={backendConfigSpanCls}>
                            {backendConfigMenu.shortName}
                        </span> :
                            <i className={backendConfigCls} title={backendConfigMenu.name}/>}
                    </NavLink>
                </Popover>
            </div>
        );
    },
    //个人信息部分右侧弹框
    getUserInfoLinks: function() {
        //个人资料部分
        let userInfoLinkList = menuUtil.getMenuById(MENU.USER_INFO);
        if (!userInfoLinkList || !userInfoLinkList.routes) {
            return;
        }
        return (
            <ul className="ul-unstyled">
                {
                    userInfoLinkList.routes.map(function(obj) {
                        return (
                            <li key={obj.id}>
                                <NavLink to={obj.routePath} activeClassName="active">
                                    {obj.name}
                                </NavLink>
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
    //侧边导航左下个人信息
    getUserInfoBlock: function() {
        return (
            <div className="sidebar-userinfo">
                <Popover content={this.getUserInfoLinks()} trigger="hover"
                    placement="rightBottom"
                    overlayClassName="nav-sidebar-userinfo">
                    <div className="avatar_container">
                        <Avatar
                            className="avatar"
                            size="51px"
                            src={this.state.userInfoLogo}
                            userName={this.state.userInfo.user_name}
                            nickName={this.state.userInfo.nick_name}
                            round="true" link="true" url="/user_info_manage"
                            isActiveFlag={this.props.isShowNotificationPanel}
                        />
                    </div>
                </Popover>
            </div>
        );
    },

    //汉堡包弹窗列表
    getNavbarLists: function() {
        //侧边导航高度减少后，出现汉堡包按钮，汉堡包按钮的弹出框
        return (
            <ul className="ul-unstyled">
                {this.state.menus.map(function(obj) {
                    return (
                        <li key={obj.id}>
                            <NavLink to={`${obj.routePath}`} activeClassName="active">
                                {obj.name}
                            </NavLink>
                        </li>
                    );
                })
                }
            </ul>
        );
    },

    handleOnclickHole: function() {
        //跳转到新加模块界面
        history.push('/' + schedule_menu.routePath, {});
        this.saveModalClicked();
    },

    //将该模块存入后端并隐藏模态框
    saveModalClicked: function() {
        this.setState({
            isShowIntroModal: false
        });
        setWebsiteConfigModuleRecord({'module_record': [schedule_menu.name]});
    },

    hideModalIntro: function() {
        this.saveModalClicked();
    },

    closeNotificationPanel(event) {
        event.stopPropagation();
        this.props.closeNotificationPanel();
    },
    //展示未读回复的图标提示
    renderUnreadReplyTip(category) {
        //是申请审批，有未读回复数并且，所有申请待审批数都为0
        let unreadReplyTipShowFlag = category === 'application' &&//申请审批
            (this.state.hasUnreadReply || this.state.hasDiffApplyUnreadReply) &&//有用户审批或者其他类型审批的未读回复
            this.state.messages.approve === 0 &&//用户申请待审批数
            this.state.messages.unhandleCustomerVisit === 0 && //出差申请待我审批数
            this.state.messages.unhandleBusinessOpportunities === 0 &&//销售机会申请待我审批数
            this.state.messages.unhandlePersonalLeave === 0;//请假申请待我审批数
        if (unreadReplyTipShowFlag) {
            return (
                <span className="iconfont icon-apply-message-tip"
                    title={Intl.get('user.apply.unread.reply', '有未读回复')}/>
            );
        } else {
            return null;
        }
    },
    //生成主菜单
    generateMenu: function() {
        const pathName = location.pathname.replace(/^\/|\/$/g, '');
        const currentPageCategory = pathName.split('/')[0];
        return this.state.menus.map((menu, i) => {
            let category = menu.routePath.replace(/\//, '');
            //是否添加选中的菜单样式类
            const addActive = !this.state.hideNavIcon && currentPageCategory === category;
            //选中状态类
            let extraClass = classNames({
                'iconfont': !this.state.hideNavIcon,
                [`icon-${category}-ico`]: !this.state.hideNavIcon && currentPageCategory !== category,
                [`icon-active-${category}-ico`]: addActive,
                'active': addActive,
                'deactivation': this.props.isShowNotificationPanel
            });
            //菜单项类
            let routeCls = classNames({
                [`${category}_icon_container`]: true,
                'text-nav-li': this.state.hideNavIcon
            });
            return (
                <li key={i} title={menu.name} className={routeCls}>
                    <NavLink to={`${menu.routePath}`}
                        activeClassName='active'
                        className={extraClass}
                    >
                        {this.renderUnreadReplyTip(category)}
                        {this.state.hideNavIcon ? (<span> {menu.shortName} </span>) : null}
                    </NavLink>
                </li>
            );
        });
    },

    render: function() {
        var _this = this;
        var iconCls = classNames('iconfont ',{
            'icon-dial-up-keybord': !this.state.ronglianNum,
            'icon-active-call_record-ico': this.state.ronglianNum,
        });
        const DialIcon = this.state.hideNavIcon ? Intl.get('phone.dial.up.text', '拨号') :
            (<i className={iconCls} style={{fontSize: 24}}/>);
        return (
            <nav className="navbar" onClick={this.closeNotificationPanel}>
                <div className="container">
                    <div className="logo-and-menus" ref="logoAndMenus"
                    >
                        <div className="header-logo">
                            <Logo/>
                        </div>
                        <div className="collapse navbar-collapse">
                            <ul className="nav navbar-nav" id="menusLists">
                                {
                                    _this.generateMenu()
                                }
                            </ul>
                            <Popover content={_this.getNavbarLists()} trigger="hover" placement="rightTop"
                                overlayClassName="nav-sidebar-lists">
                                <div className="hamburger" id="hamburger">
                                    <span className="line"></span>
                                    <span className="line"></span>
                                    <span className="line"></span>
                                </div>
                            </Popover>
                        </div>

                    </div>

                    <div className="sidebar-user" ref={(element) => {
                        this.userInfo = element;
                    }}>
                        {this.state.isShowDialUpKeyboard ? (<DialUpKeyboard placement="right" dialIcon={DialIcon} inputNumber={this.state.ronglianNum}/>) : null}
                        {_this.getNotificationBlock()}
                        {_this.renderBackendConfigBlock()}
                        {_this.getUserInfoBlock()}
                    </div>
                </div>
                {/*暂时将引导的功能都去掉*/}
                {/*{this.state.isShowIntroModal && hasPrivilege('MEMBER_SCHEDULE_MANAGE') ? <ModalIntro*/}
                {/*introModalLayout={this.state.introModalLayout}*/}
                {/*$introElement={this.state.$introElement}*/}
                {/*handleOnclickHole={this.handleOnclickHole}*/}
                {/*hideModalIntro={this.hideModalIntro}*/}
                {/*message={this.state.tipMessage}*/}
                {/*/> : null}*/}
            </nav>
        );
    }
});

module.exports = NavSidebar;
