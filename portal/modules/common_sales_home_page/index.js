import Bundle from '../../public/sources/route/route-bundle';

const CommonSalesHomePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(CommonSalesHomePage) => <CommonSalesHomePage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/sales/home',
    component: CommonSalesHomePage
};
