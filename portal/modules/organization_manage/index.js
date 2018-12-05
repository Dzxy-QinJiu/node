/**
 * Created by wangliping on 2016/10/18.
 */
import Bundle from '../../public/sources/route/route-bundle';

const OrganizationPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(OrganizationPage) => <OrganizationPage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: path,
        component: OrganizationPage
    };
};
