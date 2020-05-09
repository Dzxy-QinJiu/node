/**
 * 获取不同时间段内的开始时间和结束时间的毫秒数
 */
const MOMENT_DATE_FORMAT = oplateConsts.DATE_FORMAT;
import DatePickerUtils from 'antc/lib/components/datepicker/utils';

function getTimeStamp(timeRange) {
    return {
        start_time: DatePickerUtils.getMilliseconds(timeRange.start_time),
        end_time: DatePickerUtils.getMilliseconds(timeRange.end_time, true)
    };
}

//获取今天的开始、结束时间的毫秒数
exports.getTodayTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getTodayTime());
};

// 获取本周的开始、结束时间的毫秒数
exports.getThisWeekTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getThisWeekTime('true'));
};

// 获取上一周的开始、结束时间的毫秒数
exports.getLastWeekTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getLastWeekTime());
};

// 获取本月的开始、结束时间的毫秒数
exports.getThisMonthTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getThisMonthTime('true'));
};

// 获取本季度的开始、结束时间的毫秒数
exports.getThisQuarterTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getThisQuarterTime('true'));
};

// 获取本年的开始、结束时间的毫秒数
exports.getThisYearTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getThisYearTime('true'));
};

// 获取近一周的开始、结束时间的毫秒数
exports.getNearlyWeekTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getNearlyWeekTime());
};

// 获取近一月的开始、结束时间的毫秒数
exports.getNearlyMonthTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getNearlyMonthTime());
};

// 获取近一季度的开始、结束时间的毫秒数
exports.getNearlyQuarterTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getNearlyQuarterTime());
};

// 获取近一年的开始、结束时间的毫秒数
exports.getNearlyYearTimeStamp = () => {
    return getTimeStamp(DatePickerUtils.getNearlyYearTime());
};