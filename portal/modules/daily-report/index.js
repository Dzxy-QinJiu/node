require('./style.less');
import ReportList from './report-list';
import ReportFilter from './report-filter';
import reportLayoutHoc from 'CMP_DIR/report-layout-hoc';

module.exports = reportLayoutHoc(ReportList, ReportFilter);
