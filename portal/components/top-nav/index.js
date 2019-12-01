//引入用户数据
var React = require('react');
var menuUtil = require('../../public/sources/utils/menu-util');
//class名
var classNames = require('classnames');
//顶部导航菜单的超链接
import {NavLink} from 'react-router-dom';

var topNavEmitter = require('../../public/sources/utils/emitters').topNavEmitter;
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';

var insertStyle = require('CMP_DIR/insert-style');
require('./index.less');
var notificationEmitter = require('../../public/sources/utils/emitters').notificationEmitter;
let history = require('../../public/sources/history');
let RIGHT_MARGIN = 10;//右边预留宽度，用户计算
import {Popover, Icon} from 'antd';
/**
 * 待处理的数据列表
 * name:待处理数在Oplate.unread对象中的key或key数组
 * cls: 左侧导航中，显示线索、申请审批图标的类
 * style: 显示待处理数的样式
 */
const unhandleApplyNumObj = [
    {
        name: APPLY_APPROVE_TYPES.UNHANDLE_USER_APPLY,
        cls: 'application_user_apply_ico',
        style: 'unhandleUserAplplyNumStyle'
    }, {
        name: APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT,
        cls: 'application_business_apply_ico',
        style: 'unhandleBusinessApplyNumStyle'
    }, {
        name: APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE,
        cls: 'application_leave_apply_ico',
        style: 'unhandleLeaveApplyNumStyle'
    }, {
        name: APPLY_APPROVE_TYPES.UNHANDLEBUSINESSOPPORTUNITIES,
        cls: 'application_sales_opportunity_ico',
        style: 'unhandleSalesOpperNumStyle'
    }, {
        name: APPLY_APPROVE_TYPES.UNHANDLEREPORTSEND,
        cls: 'application_report_send_ico',
        style: 'unhandleReportSendNumStyle'
    }, {
        name: APPLY_APPROVE_TYPES.UNHANDLEDOCUMENTWRITE,
        cls: 'application_document_write_ico',
        style: 'unhandleDocumentWriteNumStyle'
    }, {
        name: APPLY_APPROVE_TYPES.UNHANDLEMEVISISTAPPLY,
        cls: 'application_self_setting_ico',
        style: 'unhandleVisitNumStyle'
    }, {
        name: APPLY_APPROVE_TYPES.UNHANDLEMEDOMAINAPPLY,
        cls: 'application_domain_name_ico',
        style: 'unhandleDomainNumSyle'
    }];

//顶部导航外层div
class TopNav extends React.Component {
    constructor(props) {
        super(props);
        //未处理数的提示样式初始化
        _.forEach(unhandleApplyNumObj,(item) => {
            this[item.style] = null;
        });
    }

    resizeHandler = () => {
        //找到外层节点
        var $wrap = $(ReactDOM.findDOMNode(this.topNav));
        //找到菜单列表
        var $topLinks = $wrap.find('.topnav-links-wrap');
        //找到所有显示出来的子节点
        var childNodes = $wrap.children().filter(':visible');
        //是否已经处于窄界面的下拉菜单显示状态
        var isNarrowDropdownOn = $topLinks.hasClass('fixed-layout');

        //界面清理操作
        function cleanUp() {
            //将菜单节点设置为显示状态
            $topLinks.removeAttr('hidden');
            //下拉菜单归位
            $topLinks.removeClass('fixed-layout');
        }

        if (!$topLinks[0]) {
            cleanUp();
            return;
        }
        cleanUp();
        //将子节点过滤掉菜单
        // var extraNodes = _.filter(childNodes, (node) => node !== $topLinks[0]);
        //获取菜单在页面中的位置
        var topLinksPosStart = $topLinks.offset().left;
        var topLinksPosEnd = topLinksPosStart + $topLinks.outerWidth();
        //计算子节点是否存在覆盖情况
        var intersect = topLinksPosEnd + RIGHT_MARGIN > $(window).width();
        // var intersect = _.some(extraNodes, (dom) => {
        //     var $dom = $(dom);
        //     var domPosStart = $dom.offset().left;
        //     var domPosEnd = domPosStart + $dom.outerWidth();
        //     if (
        //         topLinksPosStart <= domPosEnd &&
        //         domPosStart <= topLinksPosEnd
        //     ) {
        //         return true;
        //     }
        // });
        //如果存在覆盖的情况，则将菜单节点变成汉堡包
        if (intersect) {
            $topLinks.attr('hidden', 'true');
            if (isNarrowDropdownOn) {
                $topLinks.addClass('fixed-layout');
            }
        }
    };

    resizeFunc = () => {
        clearTimeout(this.resizeFunc.timeout);
        this.resizeFunc.timeout = setTimeout(this.resizeHandler, 10);
    };

    //点击页面空白处，下拉菜单消失
    clickBodyEmptySpace = (event) => {
        var $target = $(event.target);
        var $topNav = $(ReactDOM.findDOMNode(this.topNav));
        var $topNavLinksWrap = $topNav.find('.topnav-links-wrap');
        var $dropDown = $topNav.find('.topnav-links');
        if ($target.is('.navbar-toggle') || $.contains($dropDown[0], $target[0])) {
            return;
        }
        $('body').off('click', this.clickBodyEmptySpace);
        $topNavLinksWrap.removeClass('fixed-layout');
    };

    navBarToggle = () => {
        var $topNav = $(ReactDOM.findDOMNode(this));
        var $topLinks = $topNav.find('.topnav-links-wrap');
        $topLinks.toggleClass('fixed-layout');
        if ($topLinks.hasClass('fixed-layout')) {
            $('body').on('click', this.clickBodyEmptySpace);
        }
    };

    componentDidMount() {
        $(window).on('resize', this.resizeFunc);
        $(ReactDOM.findDOMNode(this)).find('.navbar-toggle').on('click', this.navBarToggle);
        this.resizeFunc();
        topNavEmitter.on(topNavEmitter.RELAYOUT, this.resizeFunc);
        //用户申请的待审批数的监听
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.renderUnhandleApplyStyle);
        //出差申请、请假申请、销售机会申请待我审批数的监听
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.renderUnhandleApplyStyle);
        this.renderUnhandleApplyStyle();
        //点击审批数字后，查看待审批的数量
        $('.topNav').on('click', '.application_user_apply_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/users');
        });
        $('.topNav').on('click', '.application_business_apply_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/business');
        });
        $('.topNav').on('click', '.application_sales_opportunity_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/oppotunities');
        });
        $('.topNav').on('click', '.application_leave_apply_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/leave');
        });
        $('.topNav').on('click', '.application_report_send_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/reports');
        });
        $('.topNav').on('click', '.application_document_write_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/documents');
        });
        $('.topNav').on('click', '.application_self_setting_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/visits');
        });
        $('.topNav').on('click', '.application_domain_name_ico', function(e) {
            //如果点击到a标签上，不做处理
            if ($(e.target).is('a')) {
                return;
            }
            //点击到数字上，进行跳转
            history.push('/apply/domain-name');
        });


    }

    componentWillUpdate() {
        this.renderUnhandleApplyStyle();
    }

    renderUnhandleNum = (item) => {
        if (this[item.style]) {
            this[item.style].destroy();
            this[item.style] = null;
        }
        var styleText = '';
        var count = Oplate.unread[item.name] || 0;
        //设置数字
        if (count > 0) {
            var len = (count + '').length;
            if (len >= 3) {
                styleText = `.${item.cls}:before{content:\'99+\';display:block;padding:0 2px 0 2px;}`;
            } else {
                styleText = `.${item.cls}:before{content:'${count}';display:block}`;
            }
        } else {
            styleText = `.${item.cls}:before{content:\'\';display:none}`;
        }
        //展示数字
        this[item.style] = insertStyle(styleText);
    };
    renderUnhandleApplyStyle = () => {
        if (Oplate && Oplate.unread) {
            _.forEach(unhandleApplyNumObj, (item) => {
                this.renderUnhandleNum(item);
            });
        }
    };

    componentWillUnmount() {
        $(window).off('resize', this.resizeFunc);
        $('body').off('click', this.clickBodyEmptySpace);
        topNavEmitter.removeListener(topNavEmitter.RELAYOUT, this.resizeFunc);
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.renderUnhandleApplyStyle);
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.renderUnhandleApplyStyle);
        _.forEach(unhandleApplyNumObj, (item) => {
            if (this[item.style]) {
                this[item.style].destroy();
                this[item.style] = null;
            }
        });

    }

    render() {
        return (
            <div className="topNav" ref={(element) => this.topNav = element}>
                {this.props.children}
            </div>
        );
    }
}


//获取第一层路由
function getCategory() {
    //获取路径，去掉开头的/
    let pathname = window.location.pathname.replace(/^\//, '');
    let firstLevelPathes = pathname.split('/');
    if (firstLevelPathes) {
        return '/' + firstLevelPathes[0];
    } else {
        return '';
    }
}

//顶部导航的导航菜单
TopNav.MenuList = class extends React.Component {
    render() {
        //获取第一层路由
        var category = getCategory();
        //获取当前界面的子模块
        var subModules = this.props.menuList || (menuUtil.getSubMenus(category));
        //获取pathname
        var locationPath = window.location.pathname;

        return (
            <div className="topnav-links-wrap">
                <button type="button" className="navbar-toggle">
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <ul className="clearfix topnav-links">
                    {
                        subModules.map(function(menu, i) {
                            var menuRoutePath = menu.routePath.slice(1).replace(/\//g, '_');
                            var icoClassName = 'ico ' + menuRoutePath + '_ico';
                            var cls = classNames(icoClassName, {
                                'topNav-menu-item-selected': locationPath === menu.routePath
                            });
                            // 2019/09/27 暂时改为:鼠标悬停显示解释信息
                            let isExplainShowActiveUserFlag = menu.id === 'active_user_list';

                            var liContent = (<NavLink to={menu.routePath}
                                activeClassName="active"
                                ref={(element) => this.navLinks = element}>
                                {
                                    isExplainShowActiveUserFlag ? (
                                        <Popover
                                            content={Intl.get('user.active.tips','选择时间内登录过的用户')}
                                            placement="right"
                                        >
                                            {menu.name}
                                        </Popover>
                                    ) : (menu.name)
                                }
                                {/**2019/09/27 todo 这样展示不好，待设计在进行调整，先注释掉*/}
                                {/*{*/}
                                {/*menu.id === 'active_user_list' ? (*/}
                                {/*<Popover*/}
                                {/*content={Intl.get('user.active.tips','选择时间内登录过的用户')}*/}
                                {/*trigger='click'*/}
                                {/*placement="right"*/}
                                {/*>*/}
                                {/*<Icon type="question-circle-o" />*/}
                                {/*</Popover>*/}
                                {/*) : null*/}
                                {/*}*/}
                            </NavLink>);
                            return (
                                <li className={cls} key={i}>
                                    {liContent}
                                </li>);
                        })
                    }
                </ul>
            </div>
        );
    }
};
TopNav.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};
TopNav.MenuList.propTypes = {
    menuList: PropTypes.array
};

module.exports = TopNav;
