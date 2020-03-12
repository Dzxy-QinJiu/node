require('./style.less');
import ReportList from './report-list';
import ReportFilter from 'MOD_DIR/analysis/public/top-bar';
import reportLayoutHoc from 'CMP_DIR/report-layout-hoc';

module.exports = reportLayoutHoc(ReportList, ReportFilter);
