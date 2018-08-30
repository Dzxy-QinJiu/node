import Bundle from '../../public/sources/route-bundle';

const MemberPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(MemberPage) => <MemberPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/user',
    component: MemberPage
};
