import Bundle from '../../public/sources/route/route-bundle';

const SalesHomePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(SalesHomePage) => <SalesHomePage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/sales/home',
    component: SalesHomePage
};
