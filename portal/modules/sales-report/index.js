/**
 * 销售报告
 */
import Bundle from '../../public/sources/route/route-bundle';

const SalesReportPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(SalesReportPage) => <SalesReportPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/analysis/report/sales_report',
    component: SalesReportPage
};

