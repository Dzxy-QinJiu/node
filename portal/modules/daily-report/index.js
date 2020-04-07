require('./style.less');
import ReportList from './report-list';
import ReportFilter from 'MOD_DIR/analysis/public/top-bar';
import reportLayoutHoc from 'CMP_DIR/report-layout-hoc';

const option = {
    filterProps: {
        currentPage: {
            //调整日期选择器
            adjustDatePicker: function(option) {
                _.extend(option, {
                    range: 'day',
                    startTime: moment().startOf('day').valueOf(),
                    endTime: moment().valueOf(),
                });

                //只允许选择天
                option.periodOptions = _.filter(option.periodOptions, option => option.value === 'day');
            }
        }
    }
};

module.exports = reportLayoutHoc(ReportList, ReportFilter, option);
