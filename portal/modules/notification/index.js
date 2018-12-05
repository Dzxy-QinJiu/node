import Bundle from '../../public/sources/route/route-bundle';

const NotificationPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(NotificationPage) => <NotificationPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/notification_system',
    component: NotificationPage
}; 