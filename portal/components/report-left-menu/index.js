/**
 * 报告页面左侧菜单
 */

require('./style.less');
import {NavLink} from 'react-router-dom';
import { getTplList, showReportPanel } from 'MOD_DIR/daily-report/utils';
import { VIEW_TYPE } from 'MOD_DIR/daily-report/consts';
import userData from 'PUB_DIR/sources/user-data';
import { dailyReportEmitter } from 'PUB_DIR/sources/utils/emitters';
import { isCurtao } from 'PUB_DIR/sources/utils/common-method-util';

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
        dailyReportEmitter.on(dailyReportEmitter.CHANGE_STATUS, this.handleReportStatusChange);

        this.getMenu();
    }

    componentWillUnmount() {
        dailyReportEmitter.removeListener(dailyReportEmitter.CHANGE_STATUS, this.handleReportStatusChange);
    }

    getMenu = () => {
        //获取第二层路由
        var category = getCategory();
        //获取当前界面的子模块
        var subMenus = menuUtil.getSubMenus(category);

        getTplList({
            callback: tplList => {
                const dailyReportMenuIndex = _.findIndex(subMenus, item => item.routePath === '/analysis/report/daily-report');
                if (dailyReportMenuIndex === -1) return;

                if (isCurtao() || _.isEmpty(tplList)) {
                    subMenus.splice(dailyReportMenuIndex, 1);
                } else {
                    const currentTpl = _.first(tplList);
                    const { isCommonSales } = userData.getUserData();

                    subMenus[dailyReportMenuIndex].addition = isCommonSales ? null : (
                        <i className="iconfont icon-nav-setting"
                            onClick={showReportPanel.bind(null, {
                                currentView: VIEW_TYPE.MANAGE_TPL,
                                currentTpl,
                                isManageTpl: true,
                            })}
                        />
                    );
                }

                this.setState({ subMenus });
            },
            query: { status: 'on' }
        });
    }

    handleReportStatusChange = () => {
        setTimeout(this.getMenu, 1500);
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
                            {menuItem.addition}
                        </li>
                    ))}
                </ul>

                {isCurtao() || isCommonSales ? null : (
                    <div onClick={showReportPanel.bind(null, { isOpenTpl: true })} style={{position: 'absolute', top: -65, left: 100, zIndex: 11, fontSize: 12, cursor: 'pointer'}} title="开启报告"><i className="iconfont icon-plus"></i></div>
                )}
            </div>
        );
    }
}

export default ReportLeftMenu;
