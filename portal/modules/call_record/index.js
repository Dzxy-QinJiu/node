import Bundle from '../../public/sources/route/route-bundle';

const CallRecordPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(CallRecordPage) => <CallRecordPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/call_record',
    component: CallRecordPage
};

