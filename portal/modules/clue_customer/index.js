import Bundle from '../../public/sources/route-bundle';

const CluePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(CluePage) => <CluePage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/clue_customer',
    component: CluePage
};

