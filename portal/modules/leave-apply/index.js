import Bundle from '../../public/sources/route-bundle';

const BusinessApplyPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(BusinessApplyPage) => <BusinessApplyPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/leave_apply',
    component: BusinessApplyPage
};
