import Bundle from '../../public/sources/route-bundle';

const ConfigarationPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(ConfigarationPage) => <ConfigarationPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/configaration',
    component: ConfigarationPage
};
