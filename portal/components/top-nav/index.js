//引入用户数据
var React = require('react');
var menuUtil = require('../../public/sources/utils/menu-util');
//class名
var classNames = require('classnames');
//顶部导航菜单的超链接
import {NavLink} from 'react-router-dom';

var topNavEmitter = require('../../public/sources/utils/emitters').topNavEmitter;

require('./index.less');
let RIGHT_MARGIN = 10;//右边预留宽度，用户计算
import {Popover} from 'antd';

//顶部导航外层div
class TopNav extends React.Component {
    constructor(props) {
        super(props);
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
    }

    componentWillUnmount() {
        $(window).off('resize', this.resizeFunc);
        $('body').off('click', this.clickBodyEmptySpace);
        topNavEmitter.removeListener(topNavEmitter.RELAYOUT, this.resizeFunc);
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
                            //todo customName是自定义流程tab上描述默认是用的语言包的，但是自定义流程的需要展示保存到后端的description，自定义流程统一之后这个会修改一下
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
                                    ) : (menu.customName || menu.name)
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
