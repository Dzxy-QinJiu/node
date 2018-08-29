//引入用户数据
var React = require('react');
var UserData = require('../../public/sources/user-data');
//class名
var classNames = require('classnames');
//顶部导航菜单的超链接
var Link = require('react-router').Link;
var Dropdown = require('antd').Dropdown;
var topNavEmitter = require('../../public/sources/utils/emitters').topNavEmitter;
//顶部导航外层div
var TopNav = React.createClass({
    resizeHandler: function() {
        //找到外层节点
        var $wrap = $(ReactDOM.findDOMNode(this.refs.topNav));
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
        if(!$topLinks[0] || childNodes.length === 1) {
            cleanUp();
            return;
        }
        cleanUp();
        //将子节点过滤掉菜单
        var extraNodes = _.filter(childNodes , (node) => node !== $topLinks[0]);
        //获取菜单在页面中的位置
        var topLinksPosStart = $topLinks.offset().left;
        var topLinksPosEnd = topLinksPosStart + $topLinks.outerWidth();
        //计算子节点是否存在覆盖情况
        var intersect = _.some(extraNodes , (dom) => {
            var $dom = $(dom);
            var domPosStart = $dom.offset().left;
            var domPosEnd = domPosStart + $dom.outerWidth();
            if(
                topLinksPosStart <= domPosEnd &&
                domPosStart <= topLinksPosEnd
            ) {
                return true;
            }
        });
        //如果存在覆盖的情况，则将菜单节点变成汉堡包
        if(intersect) {
            $topLinks.attr('hidden','true');
            if(isNarrowDropdownOn) {
                $topLinks.addClass('fixed-layout');
            }
        }
    },
    resizeFunc: function() {
        clearTimeout(this.resizeFunc.timeout);
        this.resizeFunc.timeout = setTimeout(this.resizeHandler , 10);
    },
    //点击页面空白处，下拉菜单消失
    clickBodyEmptySpace: function(event) {
        var $target = $(event.target);
        var $topNav = $(ReactDOM.findDOMNode(this.refs.topNav));
        var $topNavLinksWrap = $topNav.find('.topnav-links-wrap');
        var $dropDown = $topNav.find('.topnav-links');
        if($target.is('.navbar-toggle') || $.contains($dropDown[0] , $target[0])) {
            return;
        }
        $('body').off('click' , this.clickBodyEmptySpace);
        $topNavLinksWrap.removeClass('fixed-layout');
    },
    navBarToggle: function() {
        var $topNav = $(ReactDOM.findDOMNode(this));
        var $topLinks = $topNav.find('.topnav-links-wrap');
        $topLinks.toggleClass('fixed-layout');
        if($topLinks.hasClass('fixed-layout')) {
            $('body').on('click' , this.clickBodyEmptySpace);
        }
    },
    componentDidMount: function() {
        $(window).on('resize' , this.resizeFunc);
        $(ReactDOM.findDOMNode(this)).find('.navbar-toggle').on('click' , this.navBarToggle);
        this.resizeFunc();
        topNavEmitter.on(topNavEmitter.RELAYOUT , this.resizeFunc);
    },
    componentWillUnmount: function() {
        $(window).off('resize' , this.resizeFunc);
        $('body').off('click' , this.clickBodyEmptySpace);
        topNavEmitter.removeListener(topNavEmitter.RELAYOUT , this.resizeFunc);
    },
    render: function() {
        return (
            <div className="topNav" ref="topNav">
                {this.props.children}
            </div>
        );
    }
});
//获取路径，去掉开头的/
function getPathname() {
    return window.location.pathname.replace(/^\//, '');
}
//获取第一层路由
function getCategory() {
    var pathname = getPathname();
    var reg = /[\w-]+/gi;
    var ret = pathname.match(reg);
    if (ret) {
        ret.pop();
        return ret.join('/');
    }
    return '';
}
//顶部导航的导航菜单
TopNav.MenuList = React.createClass({
    render: function() {
        //获取第一层路由
        var category = getCategory();
        //获取所有子模块
        var AllSubModules = (UserData.getUserData() && UserData.getUserData().subModules) || {};
        //获取当前界面的子模块
        var subModules = AllSubModules[category] || [];
        //获取pathname
        var locationPath = getPathname();
        //获取样式名
        var locationPathClass = locationPath.replace(/\//g, '_');

        var client_id = UserData.getUserData().auth.client_id;
        //我的应用的菜单
        var subMenu = this.props.subMenu;
        var menuName = this.props.menuName;
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
                            var menuRoutePath = menu.routePath.replace(/\//g, '_');
                            var icoClassName = 'ico ' + menuRoutePath + '_ico';
                            var cls = classNames(icoClassName, {
                                'topNav-menu-item-selected': locationPath === menu.routePath
                            });

                            var liContent = (<Link to={`/${menu.routePath}`}
                                activeClassName="active" ref="navLinks">{menu.name}</Link>);
                            if (menuName === 'myAppMenu' && menu.name === '我的应用') {
                                liContent = (<Dropdown overlay={subMenu}>
                                    {liContent}
                                </Dropdown>);
                            }
                            return (
                                <li className={cls} key={i}>
                                    {liContent}
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    }
});

module.exports = TopNav;
