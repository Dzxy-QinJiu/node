import Bundle from '../../public/sources/route-bundle';

const RolePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(RolePage) => <RolePage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/role',
    component: RolePage
};
