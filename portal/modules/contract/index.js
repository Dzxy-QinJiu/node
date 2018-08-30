import Bundle from '../../public/sources/route-bundle';

const ContractPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(ContractPage) => <ContractPage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: path,
        component: ContractPage
    };
};
