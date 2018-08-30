import Bundle from '../../public/sources/route-bundle';

const AppUserManagePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(AppUserManagePage) => <AppUserManagePage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: path,
        component: AppUserManagePage
    };
};
