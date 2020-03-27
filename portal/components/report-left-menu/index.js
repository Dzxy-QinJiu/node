/**
 * 报告页面左侧菜单
 */

require('./style.less');
import {NavLink} from 'react-router-dom';
import { getReportConfigList, handleReportStatusChange, showReportPanel, isShowDailyReport } from 'MOD_DIR/daily-report/utils';
import { VIEW_TYPE } from 'MOD_DIR/daily-report/consts';
import userData from 'PUB_DIR/sources/user-data';
import { dailyReportEmitter } from 'PUB_DIR/sources/utils/emitters';

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
        reportConfigList: []
    }

    componentDidMount() {
        getReportConfigList({
            callback: reportConfigList => { this.setState({reportConfigList}); },
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
            const reportConfigList = _.filter(this.state.reportConfigList, item => item.status === 'on');
    
            if (!isShowDailyReport() || _.isEmpty(reportConfigList)) {
                subMenus.splice(dailyReportMenuIndex, 1);
            } else {
                const { isCommonSales } = userData.getUserData();
                let dailyReportMenu = subMenus[dailyReportMenuIndex];

                if (!isCommonSales && !dailyReportMenu.addition) {
                    const reportConfig = _.first(reportConfigList);

                    dailyReportMenu.addition = (
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
            }
        }

        return subMenus;
    }

    render() {
        const { isCommonSales } = userData.getUserData();
        const menus = this.getMenus();

        return (
            <div className='report-left-menu' data-tracename="分析报告左侧菜单">
                <ul>
                    {_.map(menus, menuItem => (
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

                {!isShowDailyReport() || isCommonSales ? null : (
                    <div onClick={showReportPanel.bind(null, { isOpenReport: true })} className="btn-open-report" title={Intl.get('analysis.open.report', '开启报告')} data-tracename="点击启用报告按钮"><i className="iconfont icon-plus"></i></div>
                )}
            </div>
        );
    }
}

export default ReportLeftMenu;
