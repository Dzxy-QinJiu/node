/**
 * 报告页面左侧菜单
 */

require('./style.less');
import {NavLink} from 'react-router-dom';

class ReportLeftMenu extends React.Component {
    render() {
        return (
            <div className='report-left-menu'>
                <ul>
                    <li>
                        <NavLink
                            to='/analysis/weekly_report'
                            activeClassName="active">
                            {Intl.get('analysis.sales.weekly.report', '销售周报')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to='/analysis/monthly_report'
                            activeClassName="active">
                            {Intl.get('analysis.sales.monthly.report', '销售月报')}
                        </NavLink>
                    </li>
                </ul>
            </div>
        );
    }
}

export default ReportLeftMenu;
