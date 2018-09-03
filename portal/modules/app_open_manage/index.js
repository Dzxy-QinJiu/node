import Bundle from '../../public/sources/route-bundle';

const AppPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(AppPage) => <AppPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/openApp',
    component: AppPage
};
