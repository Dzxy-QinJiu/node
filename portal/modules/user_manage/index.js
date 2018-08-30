import Bundle from '../../public/sources/route-bundle';

const AppUserPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(AppUserPage) => <AppUserPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/user',
    component: AppUserPage
};
