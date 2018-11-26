/**
 * 销售月报
 */
import Bundle from '../../public/sources/route-bundle';

const MonthlyReportPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(MonthlyReportPage) => <MonthlyReportPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/analysis/report/monthly_report',
    component: MonthlyReportPage
};

