/**
 * 报告页面左侧菜单
 */

require('./style.less');
import {NavLink} from 'react-router-dom';
import { getReportConfigList, handleReportStatusChange, showReportPanel, isShowDailyReport } from 'MOD_DIR/daily-report/utils';
import { VIEW_TYPE } from 'MOD_DIR/daily-report/consts';
import userData from 'PUB_DIR/sources/user-data';
import { dailyReportEmitter } from 'PUB_DIR/sources/utils/emitters';
import history from 'PUB_DIR/sources/history';

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
        openedReportConfigList: [],
        unopenedReportConfigList: []
    }

    componentDidMount() {
        getReportConfigList({
            callback: reportConfigList => {
                const openedReportConfigList = _.filter(reportConfigList, item => item.status === 'on');
                const unopenedReportConfigList = _.filter(reportConfigList, item => item.status === 'off');
                this.setState({ openedReportConfigList, unopenedReportConfigList });
            }
        });

        dailyReportEmitter.on(dailyReportEmitter.CHANGE_STATUS, handleReportStatusChange.bind(this));
    }

    componentWillUnmount() {
        dailyReportEmitter.removeListener(dailyReportEmitter.CHANGE_STATUS, handleReportStatusChange);
    }

    getMenus = () => {
        //获取第二层路由
        const category = getCategory();
        //获取当前界面的子模块
        let subMenus = _.cloneDeep(menuUtil.getSubMenus(category));

        const dailyReportMenuIndex = _.findIndex(subMenus, item => item.routePath === '/analysis/report/daily-report');

        if (dailyReportMenuIndex > -1) {
            const { openedReportConfigList, unopenedReportConfigList } = this.state;

            if (isShowDailyReport()) {
                const { isCommonSales } = userData.getUserData();

                if (!_.isEmpty(openedReportConfigList)) {
                    let dailyReportMenu = _.cloneDeep(subMenus[dailyReportMenuIndex]);

                    subMenus.splice(dailyReportMenuIndex, 1);

                    _.each(openedReportConfigList, reportConfig => {
                        let menu = _.cloneDeep(dailyReportMenu);
                        menu.type = 'dailyReport';
                        menu.name = reportConfig.name;
                        menu.reportConfigId = reportConfig.id;
                        menu.routePath = menu.routePath + '?id=' + reportConfig.id;

                        if (!isCommonSales && !menu.addition) {
                            menu.addition = (
                                <i className="iconfont icon-nav-setting"
                                    data-tracename="点击配置报告按钮"
                                    onClick={showReportPanel.bind(null, {
                                        currentView: VIEW_TYPE.CONFIG_REPORT,
                                        reportConfig,
                                        isConfigReport: true,
                                    })}
                                />
                            );
                        }

                        subMenus.push(menu);
                    });
                }

                if (!_.isEmpty(unopenedReportConfigList) && !isCommonSales) {
                    subMenus.push({
                        name: Intl.get('analysis.open.report', '开启报告'),
                        type: 'openReport'
                    });
                }
            }
        }

        return subMenus;
    }

    render() {
        const { isCommonSales } = userData.getUserData();
        const menus = this.getMenus();
        const reportConfigId = _.get(location.href.match(/id=(.*)/), [1]);

        return (
            <div className='report-left-menu' data-tracename="分析报告左侧菜单">
                <ul>
                    {_.map(menus, menuItem => {
                        if (menuItem.type === 'openReport') {
                            return (
                                <li>
                                    <a
                                        href="javascript:void(0);"
                                        onClick={showReportPanel.bind(null, { isOpenReport: true })}
                                        className={menuItem.reportConfigId === reportConfigId ? 'active' : ''}
                                        data-tracename="点击启用报告按钮"
                                    >
                                        <i className="iconfont icon-plus" />
                                        {menuItem.name}
                                    </a>
                                    {menuItem.addition}
                                </li>
                            );
                        } else if (menuItem.type === 'dailyReport') {
                            return (
                                <li>
                                    <a
                                        href="javascript:void(0);"
                                        onClick={() => { history.push(menuItem.routePath); }}
                                        className={menuItem.reportConfigId === reportConfigId ? 'active' : ''}
                                    >
                                        {menuItem.name}
                                    </a>
                                    {menuItem.addition}
                                </li>
                            );
                        } else {
                            return (
                                <li>
                                    <NavLink
                                        to={menuItem.routePath}
                                        activeClassName="active"
                                    >
                                        {menuItem.name}
                                    </NavLink>
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>
        );
    }
}

export default ReportLeftMenu;
