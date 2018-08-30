import Bundle from '../../public/sources/route-bundle';

const NotificationPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(NotificationPage) => <NotificationPage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: '/notification_system',
        component: NotificationPage
    };
};