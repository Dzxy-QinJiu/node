import Bundle from '../../public/sources/route/route-bundle';

const SalesCommissionPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(SalesCommissionPage) => <SalesCommissionPage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: path,
        component: SalesCommissionPage
    };
};
