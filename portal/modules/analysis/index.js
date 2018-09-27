/**
 * 分析
 */
import Bundle from '../../public/sources/route-bundle';

const AnalysisPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(AnalysisPage) => <AnalysisPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/analysis/analysis',
    component: AnalysisPage
};

