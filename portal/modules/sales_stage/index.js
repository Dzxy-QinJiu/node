import Bundle from '../../public/sources/route-bundle';

const SalesStagePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(SalesStagePage) => <SalesStagePage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/sales_stage',
    component: SalesStagePage
};
