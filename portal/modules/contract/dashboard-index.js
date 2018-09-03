import Bundle from '../../public/sources/route-bundle';

const ContractDashboardPage = (props) => (
    <Bundle load={() => import('./dashboard')}>
        {(ContractDashboardPage) => <ContractDashboardPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/contract/dashboard',
    component: ContractDashboardPage
};
