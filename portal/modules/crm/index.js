import Bundle from '../../public/sources/route/route-bundle';

const CrmPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(CrmPage) => <CrmPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/crm',
    component: CrmPage
};
