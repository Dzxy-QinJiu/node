import Bundle from '../../public/sources/route-bundle';

const SchedulePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(SchedulePage) => <SchedulePage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/schedule_management',
    component: SchedulePage
};

