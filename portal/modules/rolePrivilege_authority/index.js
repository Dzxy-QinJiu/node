import Bundle from '../../public/sources/route-bundle';

const AuthorityPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(AuthorityPage) => <AuthorityPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/authority',
    component: AuthorityPage
};

