import Bundle from '../../../public/sources/route/route-bundle';

const ContractAnalysisPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(ContractAnalysisPage) => <ContractAnalysisPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/contract/analysis',
    component: ContractAnalysisPage
};
