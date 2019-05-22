var menuUtil = require('../../public/sources/utils/menu-util');
//class名
var classNames = require('classnames');
//导航菜单的超链接
import {NavLink} from 'react-router-dom';
require('./index.less');
let history = require('../../public/sources/history');

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

//左侧子导航的导航菜单
class LeftNav extends React.Component {
    render() {
        //获取第一层路由
        var category = getCategory();
        //获取当前界面的子模块
        var subModules = this.props.menuList || (menuUtil.getSubMenus(category));
        //获取pathname
        var locationPath = window.location.pathname;

        return (
            <div className="leftNav" ref={(element) => this.topNav = element}>
                <div className="left-sub-nav-wrap">
                    <ul className="clearfix left-sub-nav-links">
                        {
                            subModules.map(function(menu, i) {
                                var menuRoutePath = menu.routePath.slice(1).replace(/\//g, '_');
                                var icoClassName = 'ico ' + menuRoutePath + '_ico';
                                var cls = classNames(icoClassName, {
                                    'left-sub-menu-selected': locationPath === menu.routePath
                                });

                                var liContent = (<NavLink to={menu.routePath}
                                    activeClassName="active"
                                    ref={(element) => this.navLinks = element}> {menu.name}</NavLink>);
                                return (
                                    <li className={cls} key={i}>
                                        {liContent}
                                    </li>);
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

LeftNav.propTypes = {
    menuList: PropTypes.array
};

export default LeftNav;
