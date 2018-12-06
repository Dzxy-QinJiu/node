import Bundle from '../../public/sources/route/route-bundle';

const SalesOpportunityPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(SalesOpportunityPage) => <SalesOpportunityPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/application/sales_opportunity',
    component: SalesOpportunityPage
};
