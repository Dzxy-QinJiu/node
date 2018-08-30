/**
 * 说明：统计分析-用户分析
 */
import Bundle from '../../public/sources/route-bundle';

const UserAnalysisPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(UserAnalysisPage) => <UserAnalysisPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/analysis/user',
    component: UserAnalysisPage
};
