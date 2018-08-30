import Bundle from '../../public/sources/route-bundle';

const UserPasswordPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(UserPasswordPage) => <UserPasswordPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/user_info_manage/user_pwd',
    component: UserPasswordPage
};
