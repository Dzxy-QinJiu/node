import Bundle from '../../public/sources/route/route-bundle';

const BusinessApplyPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(BusinessApplyPage) => <BusinessApplyPage {...props}/>}
    </Bundle>
);
module.exports = {
    path: '/application/business_apply',
    component: BusinessApplyPage

};