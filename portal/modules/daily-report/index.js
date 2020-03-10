require('./style.less');
import ReportList from './report-list';
import ReportFilter from './report-filter';
import reportLayoutHoc from 'CMP_DIR/report-layout-hoc';
import { getTplList } from './utils';

function processLeftMenu(menus) {
    getTplList({
        callback: tplList => {
            if (_.isEmpty(tplList)) menus = _.filter(menus, item => item.routePath !== '/analysis/report/daily-report');
        },
        query: { status: 'on' }
    });
}

module.exports = reportLayoutHoc(ReportList, ReportFilter, processLeftMenu);
