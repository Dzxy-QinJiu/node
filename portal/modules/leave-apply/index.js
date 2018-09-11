import Bundle from '../../public/sources/route-bundle';

const LeaveApplyPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(LeaveApplyPage) => <LeaveApplyPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/leave_apply',
    component: LeaveApplyPage
};
