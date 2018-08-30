import Bundle from '../../public/sources/route-bundle';

const PositionManagePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(PositionManagePage) => <PositionManagePage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: path,
        compoent: PositionManagePage
    };
};
