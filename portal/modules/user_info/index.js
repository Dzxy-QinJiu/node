import Bundle from '../../public/sources/route/route-bundle';

const UserInfoPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(UserInfoPage) => <UserInfoPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/user_info_manage/user_info',
    component: UserInfoPage
};

