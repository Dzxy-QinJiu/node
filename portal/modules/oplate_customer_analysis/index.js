/**
 * 说明：统计分析-客户分析
 */
import Bundle from '../../public/sources/route/route-bundle';

const CustomerAnalysisPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(CustomerAnalysisPage) => <CustomerAnalysisPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/analysis/customer',
    component: CustomerAnalysisPage
};
