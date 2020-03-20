/**
 * 报告页面左侧菜单
 */

require('./style.less');
import {NavLink} from 'react-router-dom';
import { getTplList, showReportPanel } from 'MOD_DIR/daily-report/utils';
import userData from 'PUB_DIR/sources/user-data';

const menuUtil = require('PUB_DIR/sources/utils/menu-util');

//获取第二层路径，用于获取第三层路由
function getCategory() {
    //获取路径，去掉开头的/
    let pathname = window.location.pathname.replace(/^\//, '');
    let firstLevelPathes = pathname.split('/');
    if (firstLevelPathes && firstLevelPathes[1]) {
        return '/' + firstLevelPathes[0] + '/' + firstLevelPathes[1];
    } else {
        return '';
    }
}

class ReportLeftMenu extends React.Component {
    state = {
        subMenus: []
    }

    componentDidMount() {
        //获取第二层路由
        var category = getCategory();
        //获取当前界面的子模块
        var subMenus = menuUtil.getSubMenus(category);

        getTplList({
            callback: tplList => {
                tplList = [];//用于暂时隐藏日报菜单
                if (_.isEmpty(tplList)) {
                    const processedMenus = _.filter(subMenus, item => item.routePath !== '/analysis/report/daily-report');
    
                    this.setState({ subMenus: processedMenus });
                } else {
                    this.setState({ subMenus });
                }
            },
            query: { status: 'on' }
        });
    }

    render() {
        const { isCommonSales } = userData.getUserData();

        return (
            <div className='report-left-menu'>
                <ul>
                    {_.map(this.state.subMenus, menuItem => (
                        <li>
                            <NavLink
                                to={menuItem.routePath}
                                activeClassName="active"
                            >
                                {menuItem.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/*isCommonSales ? null : (
                    <div onClick={showReportPanel} style={{marginTop: 100, fontSize: 12, textAlign: 'center', cursor: 'pointer'}}><i className="iconfont icon-nav-setting sidebar-bottom-icon"></i> 报告管理</div>
                )*/}
            </div>
        );
    }
}

export default ReportLeftMenu;
