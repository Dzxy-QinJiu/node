import Bundle from '../../public/sources/route/route-bundle';

const CommissionPaymentPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(CommissionPaymentPage) => <CommissionPaymentPage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: path,
        component: CommissionPaymentPage
    };
};
