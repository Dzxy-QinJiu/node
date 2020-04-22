require('./css/nav-sidebar.less');
var userData = require('../../public/sources/user-data');
var menuUtil = require('../../public/sources/utils/menu-util');
var Logo = require('../Logo/index.js');
var Avatar = require('../Avatar/index.js');
var LogOut = require('../../modules/logout/views/index.js');
import { Popover, Badge } from 'antd';
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var _ = require('lodash');
var UnreadMixin = require('./mixins/unread');
let history = require('../../public/sources/history');
import {NavLink} from 'react-router-dom';
import CONSTS from 'LIB_DIR/consts';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {storageUtil} from 'ant-utils';
import {DIFF_APPLY_TYPE_UNREAD_REPLY, CALL_TYPES, GIFT_LOGO,APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {hasCalloutPrivilege, isCurtao, checkVersionAndType, 
    isShowUnReadNotice, isShowSystemTab, isResponsiveDisplay,isShowWinningClue, getContactSalesPopoverTip, isExpired} from 'PUB_DIR/sources/utils/common-method-util';
import {phoneEmitter, notificationEmitter, userInfoEmitter,
    phoneMsgEmitter, clickUpgradeNoiceEmitter, showWiningClueEmitter} from 'PUB_DIR/sources/utils/emitters';
import DialUpKeyboard from 'CMP_DIR/dial-up-keyboard';
import {isRongLianPhoneSystem} from 'PUB_DIR/sources/utils/phone-util';
import {getAllUnhandleApplyCount} from 'MOD_DIR/apply_approve_list/public/utils/apply_approve_utils';
const session = storageUtil.session;
const { setWebsiteConfigModuleRecord, getWebsiteConfig} = require('LIB_DIR/utils/websiteConfig');
import WinningClue from '../winning-clue';
import Trace from 'LIB_DIR/trace';
import newComment from '../../static/images/new-comment.svg';

//需要加引导的模块
const schedule_menu = CONSTS.STORE_NEW_FUNCTION.SCHEDULE_MANAGEMENT;
//个人信息菜单部分距离底部的绝对高度18
const USER_INFO_BOTTOM = 18;
//单个菜单的最小高度
const ONE_MENU_HEIGHT = 32;
//拨号键盘图标的大小
const DIAL_ICON_SIZE = {
    NORMAL_FONT: 24,//正常图标的字体大小
    SMALL_FONT: 18//缩小浏览器后的拨号图标大小
};

//需要特殊处理的菜单的idNORMAL
const MENU = {
    'NOTE': 'notification',
    'BACK_CONFIG': 'background_management',
    'USER_INFO': 'user_info_manage'
};

const ROUTE_CONST = {
    'CALL_RECORD': 'call_record',//通话记录id
    'ANALYSIS': 'analysis'//分析
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
            showBootCompletePanel: function() {
            },
        };
    },

    getInitialState: function() {
        let isUnReadNotice = isShowUnReadNotice();
        return {
            menus: menuUtil.getFirstLevelMenus(),
            userInfoLogo: getUserInfoLogo(),
            userInfo: getUserName(),
            //需要加引导功能的某个元素
            $introElement: '',
            isShowIntroModal: false,//是否展示引导的模态框
            introModalLayout: {},//模态框上蚂蚁及提示的展示样式
            tipMessage: '',//提示内容
            hasMyApplyUnreadReply: false,//我的审批是否有未读的回复
            hasTeamApplyUnreadReply: false,//团队申请审批是否有未读回复
            // isReduceNavIcon: false,//是否展示缩小的图标(缩小浏览器时)
            // isReduceNavMargin: false, //是否展示小图标和图标间距
            isShowDialUpKeyboard: false,//是否展示拨号键盘的标识
            ronglianNum: '',//正在拨打的容联的电话
            isUnReadNotice: isUnReadNotice, // 是否有未读的公告，默认false
            noticeSubMenuSelectedType: isUnReadNotice ? 'notice' : 'system', // 通知二级子菜单选中的类型
            isShowWinningClueContent: false, // 是否显示领线索内容
        };
    },
    propTypes: {
        toggleNotificationPanel: PropTypes.func,
        closeNotificationPanel: PropTypes.func,
        showBootCompletePanel: PropTypes.func,
        isShowNotificationPanel: PropTypes.bool,
        rewardClueCount: PropTypes.number,
        handleOpenLeftPanel: PropTypes.func,
        isShowCustomerService: PropTypes.bool,
        closeChatPanel: PropTypes.func,
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

    toggleUpgradeNotice(flag) {
        this.setState({
            isUnReadNotice: flag
        });
    },

    clickSystemPanelTabsType(type) {
        this.setState({
            noticeSubMenuSelectedType: type
        });
    },

    componentDidMount: function() {
        userInfoEmitter.on(userInfoEmitter.CHANGE_USER_LOGO, this.changeUserInfoLogo);
        //我的申请回复列表变化后触发
        notificationEmitter.on(notificationEmitter.MY_UNREAD_REPLY, this.refreshMyApplyHasUnreadReply);
        phoneEmitter.on(phoneEmitter.CALL_CLIENT_INITED, this.triggerDialUpKeyboardShow);
        //团队申请审批未读回复列表变化后触发
        notificationEmitter.on(notificationEmitter.TEAM_UNREAD_REPLY, this.refreshTeamApplyHasUnreadReply);
        //正在拨打容联的电话
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_CLUE_PANEL, this.callingRonglianBtn);
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.callingRonglianBtn);
        // 查看系统公告的触发
        clickUpgradeNoiceEmitter.on(clickUpgradeNoiceEmitter.CLICK_NOITCE_TAB, this.toggleUpgradeNotice);
        // 点击通知面板上tabs类型的触发
        notificationEmitter.on(notificationEmitter.CLICK_NOTICE_TABS_TYPE, this.clickSystemPanelTabsType);
        // //响应式设计 logo和菜单占据的实际高度
        // responsiveLayout.logoAndMenusHeight = $('.logo-and-menus').outerHeight(true);
        // //计算 拨号按钮、通知、设置、个人信息 占据的实际高度
        // responsiveLayout.userInfoHeight = $(this.userInfo).outerHeight(true);
        // this.calculateHeight();
        // $(window).on('resize', this.calculateHeight);
        //获取已经点击过的模块
        getWebsiteConfig((WebsiteConfigModuleRecord) => {
            //
            let personnel_setting = storageUtil.local.get('websiteConfig');
            personnel_setting = personnel_setting ? JSON.parse(personnel_setting) : {};
            this.props.showBootCompletePanel(personnel_setting);
            //本次要加引导的模块是否点击过
            if (this.isIntroModlueNeverClicked(WebsiteConfigModuleRecord)) {
                this.selectedIntroElement();
            }
        });
        $('.navbar').on('click', '.leads_icon_container', function(e) {
            //点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到线索未处理的数字上，进行跳转
            history.push('/leads', {clickUnhandleNum: true});
        });
    },
    //呼叫中心的电话系统初始化完成后，触发拨号键盘是否展示的判断
    triggerDialUpKeyboardShow: function() {
        //电话系统初始化完成后，判断是否有打电话的权限（是否配坐席号，配置了才可以打电话）
        if (hasCalloutPrivilege) {
            this.setState({isShowDialUpKeyboard: true});
        }
    },

    refreshMyApplyHasUnreadReply: function(unreadReplyList) {
        if (_.isArray(unreadReplyList) && unreadReplyList.length) {
            this.setState({hasMyApplyUnreadReply: true});
        } else {
            this.setState({hasMyApplyUnreadReply: false});
        }
    },
    refreshTeamApplyHasUnreadReply: function(unreadReplyList) {
        if (_.isArray(unreadReplyList) && unreadReplyList.length) {
            this.setState({hasTeamApplyUnreadReply: true});
        } else {
            this.setState({hasTeamApplyUnreadReply: false});
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
    //获取窗口高度是否小于导航展示的高度
    getWinHeightLessNavHeight(){
        let curLogoMenusHeight = $('.logo-and-menus').outerHeight(true);
        let curUserInfoHeight = $(this.userInfo).outerHeight(true);
        //当前窗口高度小于当前导航展示的高度（logo和菜单高度+个人信息高度+个人信息离底部的绝对高度）
        return $(window).height() < (curLogoMenusHeight + curUserInfoHeight + USER_INFO_BOTTOM);
    },
    //计算并设置菜单展示样式
    calculateHeight: function() {
        if (this.calculateHeightTimeOut) {
            clearTimeout(this.calculateHeightTimeOut);
            this.calculateHeightTimeOut = null;
        }
        this.calculateHeightTimeOut = setTimeout(() => {
            //窗口高度小于正常图标的导航展示高度 （logo和菜单高度+个人信息高度+个人信息离底部的绝对高度）时，展示小点的导航图标
            if (this.getWinHeightLessNavHeight()) {
                this.hideHamburger();
                this.setState({
                    isReduceNavIcon: true,
                    isReduceNavMargin: false
                }, () => {
                    //如果再缩放，则缩小图标和图标间距
                    if (this.getWinHeightLessNavHeight()) {
                        this.hideHamburger();
                        this.setState({
                            isReduceNavIcon: false,
                            isReduceNavMargin: true
                        }, () => {
                            //再缩小时展示汉堡包按钮
                            if (this.getWinHeightLessNavHeight()) {
                                //>32  目的是左侧只有一个导航菜单时不会出现汉堡包按钮
                                this.showHamburger();
                            }
                        });
                    }
                });
            } else {
                this.hideHamburger();
                this.setState({
                    isReduceNavIcon: false,
                    isReduceNavMargin: false
                });
            }
            //模态框存在时，才需要选要加引导的元素
            if (this.state.isShowIntroModal) {
                this.selectedIntroElement();
            }
        }, 100);
    },

    getPhonemsgObj(paramObj) {
        return paramObj.call_params && paramObj.call_params.phonemsgObj || null;
    },
    callingRonglianBtn: function(data) {
        var phonemsgObj = this.getPhonemsgObj(data);
        //监听推送来的消息，如果是容联的电话系统,在打通状态需要把左边导航的图标改掉
        if (isRongLianPhoneSystem() && _.get(phonemsgObj, 'type')) {
            //电话接通推过来状态
            if ([CALL_TYPES.ALERT].indexOf(phonemsgObj.type) !== -1) {
                var phoneNum = '';
                if (phonemsgObj.call_type === 'IN') {
                    phoneNum += phonemsgObj.extId;
                } else {
                    phoneNum += phonemsgObj.to || phonemsgObj.dst;
                }
                this.setState({
                    ronglianNum: phoneNum
                });
            } else if ([CALL_TYPES.phone, CALL_TYPES.curtao_phone, CALL_TYPES.call_back].indexOf(phonemsgObj.type) !== -1) {
                this.setState({
                    ronglianNum: ''
                });
            }
        }
    },
    componentWillUnmount: function() {
        userInfoEmitter.removeListener(userInfoEmitter.CHANGE_USER_LOGO, this.changeUserInfoLogo);
        notificationEmitter.removeListener(notificationEmitter.MY_UNREAD_REPLY, this.refreshMyApplyHasUnreadReply);
        notificationEmitter.removeListener(notificationEmitter.TEAM_UNREAD_REPLY, this.refreshTeamApplyHasUnreadReply);
        phoneEmitter.removeListener(phoneEmitter.CALL_CLIENT_INITED, this.triggerDialUpKeyboardShow);
        //正在拨打容联的电话
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_CLUE_PANEL, this.callingRonglianBtn);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.callingRonglianBtn);
        clickUpgradeNoiceEmitter.removeListener(clickUpgradeNoiceEmitter.CLICK_NOITCE_TAB, this.toggleUpgradeNotice);
        notificationEmitter.removeListener(notificationEmitter.CLICK_NOTICE_TABS_TYPE, this.clickSystemPanelTabsType);
    },


    toggleNotificationPanel(event) {
        event.stopPropagation();
        this.props.toggleNotificationPanel(this.state.isUnReadNotice);
    },

    handleClickNoticeSubMenu(noticeType, event) {
        event.stopPropagation();
        notificationEmitter.emit(notificationEmitter.CLICK_SYSTEM_NOTICE, noticeType);
        this.setState({
            noticeSubMenuSelectedType: noticeType
        });
        if (noticeType === 'notice') {
            this.toggleUpgradeNotice(false);
        }
    },
    
    renderNoticeSubMenu() {
        let isUnReadNotice = this.state.isUnReadNotice;
        let noticeSubMenuSelectedType = this.state.noticeSubMenuSelectedType;
        let systemCls = classNames({
            'active': !isUnReadNotice && noticeSubMenuSelectedType === 'system',
        });
        let upgradeNotice = classNames({
            'active': isUnReadNotice || noticeSubMenuSelectedType === 'notice',
        });
        return (
            <div>
                <a onClick={this.handleClickNoticeSubMenu.bind(this, 'system')} className={systemCls}>
                    {Intl.get('menu.notification', '通知')}
                </a>
                <a onClick={this.handleClickNoticeSubMenu.bind(this, 'notice')} className={upgradeNotice}>
                    {Intl.get('rightpanel_notice','公告')}
                </a>
            </div>
        );
    },

    //渲染通知菜单
    getNotificationBlock: function(trigger) {
        let notification = menuUtil.getMenuById(MENU.NOTE);
        if (!notification) {
            return null;
        }
        let noticeCls = classNames('iconfont icon-nav-notice', 'sidebar-bottom-icon', {
            'active': this.props.isShowNotificationPanel,
            // 'nav-small-icon': this.isShowSmallIcon()
        });
        // let aCls = classNames({
        //     'acitve': this.props.isShowNotificationPanel,
        // });
        let wrapCls = classNames('notification', {
            'active': this.props.isShowNotificationPanel,
        });
        return (
            <div className={wrapCls} onClick={this.toggleNotificationPanel}>
                <Badge
                    dot={this.state.isUnReadNotice}
                    onClick={this.toggleNotificationPanel}
                >
                    {
                        isShowSystemTab() ? (
                            <Popover
                                content={this.renderNoticeSubMenu()}
                                trigger={trigger}
                                placement="rightBottom"
                                overlayClassName="nav-sidebar-notification"
                            >
                                <i className={noticeCls} title={notification.name}/>
                            </Popover>
                        ) : (
                            <i className={noticeCls} title={notification.name}/>
                        )
                    }

                </Badge>
            </div>
        );
    },
    renderCustomerServiceBlock: function() {
        if(isCurtao()) {
            let cls = classNames('customer-service-navicon', {
                active: this.props.isShowCustomerService
            });
            return (
                <div className={cls} onClick={this.onChatClick}>
                    <a className='iconfont icon-customer-service sidebar-bottom-icon' title={Intl.get('menu.online.consulting', '在线咨询')}/>
                </div>
            );
        }
        return null;
    },
    //在线咨询
    onChatClick(event) {
        event.stopPropagation();
        //如果有客服时，点击触发出客服界面
        _.isFunction(this.props.handleOpenLeftPanel) && this.props.handleOpenLeftPanel();
    },
    // 渲染二级子菜单，isShowLogOut用来区分是后台管理的二级菜单还是个人信息的二级菜单，个人信息包含退出操作
    renderSubMenuLinks(linkList, isShowLogOut) {
        //过滤掉不展示的二级菜单
        linkList = _.filter(linkList, menu => !menuUtil.menuIsNotShow(menu));
        return (
            <ul className="ul-unstyled">
            
                {
                    _.map(linkList, obj =>
                        <li key={obj.id} onClick={this.closeNotificationAndChatPanel}>
                            <NavLink to={obj.routePath} activeClassName="active">
                                {obj.name}
                            </NavLink>
                        </li>
                    )
                }
                {
                    isShowLogOut ? (
                        <li>
                            <LogOut/>
                        </li>
                    ) : null
                }
            </ul>
        );
    },

    //后台管理配置模块
    renderBackendConfigBlock: function(trigger) {
        let backendConfigMenu = menuUtil.getMenuById(MENU.BACK_CONFIG);
        if (!backendConfigMenu || !backendConfigMenu.routes) {
            return null;
        }
        const currentPageCategory = this.getCurrentCategory();
        let wrapperCls = classNames('sidebar-menu-li', {
            'sidebar-backend-config': true,
            'active': !this.props.isShowCustomerService && !this.props.isShowNotificationPanel && currentPageCategory === 'settings',
            // 'reduce-nav-icon-li': this.state.isReduceNavIcon,
            // 'reduce-nav-margin-li': this.state.isReduceNavMargin
        });
        let backendConfigCls = classNames('iconfont icon-nav-setting', 'sidebar-bottom-icon', {
            'deactivation': this.props.isShowCustomerService || this.props.isShowNotificationPanel,
            // 'nav-small-icon': this.isShowSmallIcon()
        });
        // let backendConfigSpanCls = classNames({
        //     'deactivation': this.props.isShowNotificationPanel,
        // });
        return (
            <div className={wrapperCls}>
                <Popover
                    content={this.renderSubMenuLinks(backendConfigMenu.routes)}
                    trigger={trigger}
                    placement="rightBottom"
                    overlayClassName="nav-sidebar-backend-config"
                >
                    <NavLink to={backendConfigMenu.routePath} activeClassName="active">
                        <i className={backendConfigCls} title={backendConfigMenu.name}/>
                    </NavLink>
                </Popover>
            </div>
        );
    },

    //侧边导航左下个人信息
    getUserInfoBlock: function(trigger) {
        //个人资料部分
        let userInfoLinkList = menuUtil.getMenuById(MENU.USER_INFO);
        if (!userInfoLinkList || !userInfoLinkList.routes) {
            return;
        }
        const currentPageCategory = this.getCurrentCategory();
        let userInfoCls = classNames('sidebar-userinfo', {
            'active': currentPageCategory === 'user-preference' && !this.props.isShowNotificationPanel && !this.props.isShowCustomerService
        });
        let defaultUserImage = (<NavLink className='user-default-logo-wrap' to='/user-preference'><i className='iconfont icon-user-logo-default'/></NavLink>);
        return (
            <div className={userInfoCls}>
                <Popover
                    content={this.renderSubMenuLinks(userInfoLinkList.routes, true)}
                    trigger={trigger}
                    placement="rightBottom"
                    overlayClassName="nav-sidebar-userinfo"
                >
                    <div className="avatar_container">
                        <Avatar
                            className="avatar"
                            size="24px"
                            lineHeight="24px"
                            src={this.state.userInfoLogo}
                            userName={this.state.userInfo.user_name}
                            nickName={this.state.userInfo.nick_name}
                            round="true" link="true" url="/user-preference"
                            isActiveFlag={this.props.isShowNotificationPanel || this.props.isShowCustomerService}
                            isUseDefaultUserImage={true}
                            defaultUserImage={defaultUserImage}
                        />
                    </div>
                </Popover>
            </div>
        );
    },

    //汉堡包弹窗列表
    getNavbarLists: function() {
        let _this = this;
        //侧边导航高度减少后，出现汉堡包按钮，汉堡包按钮的弹出框
        return (
            <ul className="ul-unstyled">
                {this.state.menus.map(function(obj) {
                    let category = obj.routePath.replace(/\//, '');
                    let routeContent = (
                        <NavLink to={`${obj.routePath}`} activeClassName="active">
                            {obj.name}
                        </NavLink>
                    );
                    //判断是否是个人版，以及有通话路由
                    let versionAndType = checkVersionAndType();
                    if(ROUTE_CONST.CALL_RECORD === category && versionAndType.personal) {
                        routeContent = _this.disableClickBlock('', obj.name);
                    } else if (ROUTE_CONST.ANALYSIS === category && isExpired()) {//分析，企业账号过期后不可访问分析，点击提示升级或续费
                        routeContent = _this.disableClickBlock('', obj.name, getContactSalesPopoverTip());
                    }
                    return (
                        <li key={obj.id}>
                            {routeContent}
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

    closeNotificationAndChatPanel(event) {
        event.stopPropagation();
        this.props.closeNotificationPanel();
        // 关闭聊天窗口
        _.isFunction(this.props.closeChatPanel) && this.props.closeChatPanel();
    },
    
    //展示未读回复的图标提示
    renderUnreadReplyTip() {
        //是申请审批，有未读回复数并且，待审批数为0
        //所有待审批总数
        var allUnhandleApplyTotal = 0;
        if (_.has(Oplate, 'unread')) {
            allUnhandleApplyTotal = getAllUnhandleApplyCount();
        }
        let unreadReplyTipShowFlag =
            (this.state.hasMyApplyUnreadReply || this.state.hasTeamApplyUnreadReply) &&//我的审批或者团队类型审批的有未读回复
            allUnhandleApplyTotal === 0;//待我审批数为0

        if (unreadReplyTipShowFlag) {
            return (
                <img
                    src={newComment}
                    className="new-message-tip"
                    title={Intl.get('user.apply.unread.reply', '有未读回复')}
                />
            );
        } else {
            return null;
        }
    },
    //是否展示小图标
    isShowSmallIcon(){
        //缩放到显示小图标或（显示小图标并缩小图标间距）时
        return this.state.isReduceNavIcon || this.state.isReduceNavMargin;
    },
    disableClickBlock(cls = '', text, tipContent) {
        const trigger = this.getTriggerType();
        return (
            <Popover
                placement='right'
                content={tipContent || Intl.get('payment.please.upgrade.company.version', '请先升级到基础版以上版本，联系销售：{contact}',{contact: '400-6978-520'})}
                trigger={trigger}
            >
                <a className={`${cls} disable-link`}>{text}</a>
            </Popover>
        );
    },
    // 获取当前页面的路由
    getCurrentCategory(){
        const pathName = location.pathname.replace(/^\/|\/$/g, '');
        return pathName.split('/')[0];
    },
    //生成主菜单
    generateMenu: function() {
        const currentPageCategory = this.getCurrentCategory();
        return this.state.menus.map((menu, i) => {
            let category = menu.routePath.replace(/\//, '');
            //是否添加选中的菜单样式类
            const addActive = currentPageCategory === category && !this.props.isShowCustomerService && !this.props.isShowNotificationPanel;
            //选中状态类
            let extraClass = classNames('iconfont', {
                [`icon-${category}-ico`]: true,
                'active': addActive,
                'deactivation': this.props.isShowNotificationPanel || this.props.isShowCustomerService
            });
            //菜单项类
            let routeCls = classNames('sidebar-menu-li', {
                [`${category}_icon_container`]: true,
                'active': addActive,
            });
            let routeContent = (
                <NavLink to={`${menu.routePath}`}
                    activeClassName='active'
                    className={extraClass}
                >
                    {
                        category === 'apply' ? (this.renderUnreadReplyTip()) : null
                    }
                    {/*{this.state.isReduceNavIcon ? (<span> {menu.shortName} </span>) : null}*/}
                </NavLink>
            );
            //判断是否是个人版，以及有通话路由
            let versionAndType = checkVersionAndType();
            if(ROUTE_CONST.CALL_RECORD === category && versionAndType.personal) {
                routeContent = this.disableClickBlock(extraClass);
            } else if (ROUTE_CONST.ANALYSIS === category && isExpired()) {//分析，企业账号过期后不可访问分析，点击提示升级或续费
                routeContent = this.disableClickBlock(extraClass, '', getContactSalesPopoverTip());
            }
            return (
                <li key={i} title={menu.name} className={routeCls}>
                    {routeContent}
                </li>
            );
        });
    },

    //生成拨号按钮
    renderDailCallBlock(trigger) {
        if(this.state.isShowDialUpKeyboard) {
            const DialIcon = this.state.hideNavIcon ? Intl.get('phone.dial.up.text', '拨号') :
                (<i className={'iconfont sidebar-bottom-icon icon-nav-dial-up'}/>);

            const versionAndType = checkVersionAndType();
            let dialUpKeyBoardContent = null;
            //个人版，拨号功能不可用，需提示升级为企业版
            if(versionAndType.personal) {
                return this.disableClickBlock('dial-up-keyboard-btn', DialIcon);
            } else if (versionAndType.company && isExpired()) {//企业账号过期后不可拨打电话，点击提示升级或续费
                return this.disableClickBlock('dial-up-keyboard-btn', DialIcon, getContactSalesPopoverTip());
            }
            return (
                <DialUpKeyboard
                    placement={userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) ? 'right' : 'rightBottom'}
                    content={dialUpKeyBoardContent}
                    dialIcon={DialIcon}
                    inputNumber={this.state.ronglianNum}
                />
            );
        }
        return null;
    },

    handleClickCloseWinningClue(flag){
        this.setState({
            isShowWinningClueContent: flag
        });
    },

    handleVisibleChange(visible) {
        if (visible) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.winning-clue'), '菜单中查看领线索活动');
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.winning-clue'), '菜单中取消查看领线索活动');
        }
        this.setState({
            isShowWinningClueContent: visible
        }, () => {
            if (visible) {
                showWiningClueEmitter.emit(showWiningClueEmitter.SHOW_WINNING_CLUE);
            }
        });
    },

    renderWinningContent() {
        return (
            <WinningClue
                isNavBar={true}
                handleClickClose={this.handleClickCloseWinningClue}
                count={this.props.rewardClueCount}
            />
        );
    },

    renderWinningClueBlock() {
        let winCls = classNames('winning-clue', {
            'show-detail': this.state.isShowWinningClueContent
        });
        return (
            <Popover
                content={ this.renderWinningContent() }
                placement= "right"
                visible={this.state.isShowWinningClueContent}
                onVisibleChange={this.handleVisibleChange}
                overlayClassName="nav-sidebar-winning-clue"
            >
                <div className={winCls}>
                    <img className="gift-logo" src={GIFT_LOGO} />
                </div>
            </Popover>
        );
    },

    getTriggerType: function() {
        const { isWebMin } = isResponsiveDisplay();
        let trigger = 'hover';
        if(isWebMin) {
            trigger = 'click';
        }
        return trigger;
    },
    render: function() {
        const trigger = this.getTriggerType();
        return (
            <nav className="navbar" onClick={this.closeNotificationAndChatPanel}>
                <div className="container">
                    <div className="logo-and-menus" ref="logoAndMenus">
                        <div className="header-logo" title={Intl.get('menu.home.page', '首页')}>
                            <NavLink to='/' className='iconfont icon-curtao-wihte-logo'/>
                        </div>
                        <div className="collapse navbar-collapse">
                            <ul className="nav navbar-nav" id="menusLists">
                                {
                                    this.generateMenu()
                                }
                            </ul>
                            <Popover
                                content={this.getNavbarLists()}
                                trigger={trigger}
                                placement="rightTop"
                                overlayClassName="nav-sidebar-lists"
                            >
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
                        {/**  版本：个人试用版、企业试用版，角色：管理员、销售角色 是并的关系 显示写跟进，赢线索 **/}
                        {
                            isShowWinningClue() ? (
                                this.renderWinningClueBlock()
                            ) : null
                        }
                        {this.renderDailCallBlock()}
                        {this.renderCustomerServiceBlock()}
                        {this.getNotificationBlock(trigger)}
                        {this.renderBackendConfigBlock(trigger)}
                        {this.getUserInfoBlock(trigger)}
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
