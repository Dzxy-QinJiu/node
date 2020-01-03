const MOMENT_DATE_FORMAT = oplateConsts.DATE_FORMAT;
const momentMap = {
    'w': 'weeks',
    'm': 'months'
};
exports.DATE_FORMAT = MOMENT_DATE_FORMAT;
//获取日期字符串
exports.getDateStr = function(dateStr) {
    dateStr += '';
    if (dateStr === '0') {
        return dateStr;
    }
    if (/^\d+$/.test(dateStr)) {
        dateStr = moment(new Date(+dateStr)).format(MOMENT_DATE_FORMAT);
    } else if (/^\-/.test(dateStr)) {
        dateStr = '0';
    }
    return dateStr;
};
//获取时间戳 开始时间00:00:00 结束时间00:00:00
exports.getMilliseconds = function(dateStr, endTimeEndOfDay) {
    if (dateStr === '0') {
        return dateStr;
    }
    if (!dateStr) {
        return '';
    }
    let momentObj = moment(dateStr, MOMENT_DATE_FORMAT);
    if (endTimeEndOfDay) {
        momentObj.endOf('day');
    } else {
        momentObj.startOf('day');
    }
    return momentObj.toDate().getTime();
};

//获取今天的开始、结束时间
exports.getTodayTime = function() {
    var start_time = moment().format(MOMENT_DATE_FORMAT);
    var end_time = moment().format(MOMENT_DATE_FORMAT);
    return {start_time, end_time};
};

//获取昨天的开始、结束时间
exports.getYesterdayTime = function() {
    var start_time = moment().subtract(1, 'days').format(MOMENT_DATE_FORMAT);
    var end_time = moment().subtract(1, 'days').format(MOMENT_DATE_FORMAT);
    return {start_time, end_time};
};

/**
 * 获取本周的开始、结束时间
 * @param endOfToday  是否截止到今天
 * @returns {{start_time, end_time: string}}
 */
exports.getThisWeekTime = function(endOfToday) {
    return {
        start_time: moment().weekday(0).format(MOMENT_DATE_FORMAT),
        end_time: endOfToday ? moment().format(MOMENT_DATE_FORMAT) : moment().weekday(6).format(MOMENT_DATE_FORMAT)//  截止到今天或周日
    };
};

//获取上周的开始、结束时间
exports.getLastWeekTime = function() {
    var start_time = moment().weekday(0).subtract(7, 'days').format(MOMENT_DATE_FORMAT);
    var end_time = moment().weekday(6).subtract(7, 'days').format(MOMENT_DATE_FORMAT);
    return {start_time, end_time};
};

/**
 * 获取本月的开始、结束时间
 * @param endOfToday  是否截止到今天
 * @returns {{start_time, end_time: *}}
 */
exports.getThisMonthTime = function(endOfToday) {
    return {
        start_time: moment().date(1).format(MOMENT_DATE_FORMAT),
        end_time: endOfToday ? moment().format(MOMENT_DATE_FORMAT) : moment().add(1, 'month').date(1).subtract(1, 'day').format(MOMENT_DATE_FORMAT)
    };
};

//获取上月的开始、结束时间
exports.getLastMonthTime = function() {
    var start_time = moment().date(1).subtract('1', 'months').format(MOMENT_DATE_FORMAT);
    var end_time = moment().date(1).subtract(1, 'day').format(MOMENT_DATE_FORMAT);
    return {start_time, end_time};
};

//获取一周时间
exports.getOneWeekTime = function() {
    return {
        start_time: moment().format(MOMENT_DATE_FORMAT),
        end_time: moment().add(7, 'days')
    };
};
//获取月份时间
exports.getMonthTime = function(num) {
    return {
        start_time: moment().format(MOMENT_DATE_FORMAT),
        end_time: moment().add(num, 'month').format(MOMENT_DATE_FORMAT)
    };
};
//获取永久时间
exports.getForeverTime = function() {
    return {
        start_time: moment().format(MOMENT_DATE_FORMAT),
        end_time: '0'
    };
};
//获取全部时间
exports.getAllTime = function() {
    return {
        start_time: '',
        end_time: ''
    };
};
/**
 * 根据给定开始结束时间获取自定义时间范围,
 * 如果时间有效直接使用时间，如果无效则使用当前时间；
 * 如果开始时间大于结束时间时，会将时间翻转
 * @param start_time
 * @param end_time
 * @param endOfToday endOfToday为true时，如果结束时间超过当前时间则设置截止时间为当前时间
 * @returns {{start_time, end_time}}
 */
exports.getCustomTime = function(start_time, end_time, endOfToday) {
    let start_time_moment = moment(start_time);
    let end_time_moment = moment(end_time);
    if (!start_time_moment.isValid()) {
        start_time_moment = moment();
    }
    if (!end_time_moment.isValid()) {
        end_time_moment = moment();
    }
    let temp = start_time_moment.clone();
    //如果开始时间大于结束时间,互换开始和结束时间
    if (start_time_moment.isAfter(end_time_moment)) {
        start_time_moment = end_time_moment;
        end_time_moment = temp;
    }
    //如果endOfToday为true
    if (endOfToday) {
        // 超过当前时间则设置时间为当前时间
        if (start_time_moment.isAfter(moment())) {
            start_time_moment = moment();
        }
        if (end_time_moment.isAfter(moment())) {
            end_time_moment = moment();
        }
    }
    return {
        start_time: start_time_moment.format(MOMENT_DATE_FORMAT),
        end_time: end_time_moment.format(MOMENT_DATE_FORMAT)
    };
};


//获取最近时间
exports.getLastTime = function(word) {
    var result = /\-(\d+)([mw])/.exec(word);
    if (!result) {
        throw 'date-selector/utils getLastTime Error , please check arguments';
    }
    var unit = momentMap[result[2]];
    var start_time = moment().subtract(result[1], unit).format(MOMENT_DATE_FORMAT);
    var end_time = moment().format(MOMENT_DATE_FORMAT);
    return {
        start_time: start_time,
        end_time: end_time
    };
};

//获取自然时间单位
exports.getNatureUnit = function(startTime, endTime) {
    if (!startTime && !endTime) {
        return 'month';
    }
    var result = {
        startTime: startTime,
        endTime: endTime
    };
    var startMoment = moment(new Date(+result.startTime));
    var endMoment = moment(new Date(+result.endTime));
    var daysMinus = endMoment.diff(startMoment, 'days');
    if (daysMinus <= 90) {
        return 'day';
    } else if (daysMinus <= 180) {
        return 'week';
    } else {
        return 'month';
    }
};

//获取季度的时间值
exports.getQuarterTime = function(which, year) {
    which += '';
    if (!/^[1234]$/.test(which)) {
        throw 'date-selector/utils getQuarterTime Error , please check arguments';
    }
    year = year || new Date().getFullYear();
    return {
        start_time: moment().year(year).quarter(which).startOf('quarter').format(MOMENT_DATE_FORMAT),
        end_time: moment().year(year).quarter(which).endOf('quarter').format(MOMENT_DATE_FORMAT)
    };
};
/**
 * 获取当前季度的时间值
 * @param endOfToday  是否截止到今天
 * @returns {{start_time, end_time: *}}
 */

exports.getThisQuarterTime = function(endOfToday) {
    return {
        start_time: moment().startOf('quarter').format(MOMENT_DATE_FORMAT),
        end_time: endOfToday ?
            moment().format(MOMENT_DATE_FORMAT) : moment().endOf('quarter').format(MOMENT_DATE_FORMAT)
    };
};
/**
 * 获取当前年的时间值
 * @param endOfToday 是否截止到今天
 * @returns {{start_time, end_time}}
 */
exports.getThisYearTime = function(endOfToday) {
    return {
        start_time: moment().startOf('year').format(MOMENT_DATE_FORMAT),
        end_time: endOfToday ?
            moment().format(MOMENT_DATE_FORMAT) : moment().endOf('year').format(MOMENT_DATE_FORMAT)
    };
};
//根据年获取开始结束时间值
exports.getYearTime = function(year) {
    year = year || new Date().getFullYear();
    return {
        start_time: moment().year(year).startOf('year').format(MOMENT_DATE_FORMAT),
        end_time: moment().year(year).endOf('year').format(MOMENT_DATE_FORMAT)
    };
};
//返回按照 自然日、自然周、自然月 的横轴时间
exports.getNaturalDate = function(list, unit) {
    var yearMap = {};
    var result = list.map(function(obj, idx) {
        var concat = '';
        var startMoment = moment(obj.starttime);
        var endMoment = moment(obj.endtime);
        if (!startMoment.isValid() || !endMoment.isValid()) {
            return '';
        }
        if (unit === 'day') {
            concat = startMoment.format(oplateConsts.DATE_MONTH_DAY_FORMAT);
        } else if (unit === 'week') {
            var startDate = startMoment.format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            var endDate = endMoment.format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            concat = startDate + '~' + endDate;
        } else {
            var startDate = startMoment.format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            var endDate = endMoment.format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            var days = moment(obj.starttime).daysInMonth();
            var diff = endMoment.diff(startMoment, 'days');
            if ((diff + 1) !== days) {
                concat = startDate + '~' + endDate;
            } else {
                concat = startMoment.format('MM');
            }
        }
        var year = startMoment.format('YYYY');
        if (!yearMap[year]) {
            yearMap[year] = true;
            concat += '\n' + year;
        }
        return concat;
    });
    return result;
};
//获取echart的tooltip上显示的日期
exports.getEchartTooltipDate = function(list, idx, unit) {
    var obj = list[idx];
    var timeRange = obj.timerange;
    var startMoment = moment(timeRange.starttime);
    var endMoment = moment(timeRange.endtime);
    if (!startMoment.isValid() || !endMoment.isValid()) {
        return '';
    }
    if (unit === 'day') {
        return startMoment.format(oplateConsts.DATE_FORMAT);
    } else if (unit === 'week') {
        return startMoment.format(oplateConsts.DATE_FORMAT) + '~' + endMoment.format(oplateConsts.DATE_FORMAT);
    } else if (unit === 'month') {
        var startDate = startMoment.format(oplateConsts.DATE_FORMAT);
        var endDate = endMoment.format(oplateConsts.DATE_FORMAT);

        var days = moment(timeRange.starttime).daysInMonth();
        var diff = endMoment.diff(startMoment, 'days');
        if ((diff + 1) !== days) {
            return startDate + '~' + endDate;
        } else {
            return startMoment.format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
        }
    }
};
/**
 * 根据时间及范围类型自动获取时间范围
 * @param time_moment  时间
 * @param timeRange   时间范围类型
 * @param endOfToday  是否截止到今天
 * @returns {{}}
 */
exports.autoSelectTime = function(time_moment, timeRange, endOfToday) {
    //如果时间不存在或者无效，使用当前时间
    if (!time_moment || !time_moment.isValid()) {
        time_moment = moment();
    }
    let dateObj = {};
    let start_time, end_time;
    if (timeRange === 'all') {
        start_time = end_time = '';
    } else if (timeRange === 'day') {
        start_time = end_time = time_moment.format(MOMENT_DATE_FORMAT);
    } else if (timeRange === 'week') {
        start_time = time_moment.startOf('week').format(MOMENT_DATE_FORMAT);
        end_time = time_moment.endOf('week').format(MOMENT_DATE_FORMAT);
    } else if (timeRange === 'month') {
        start_time = time_moment.startOf('month').format(MOMENT_DATE_FORMAT);
        end_time = time_moment.endOf('month').format(MOMENT_DATE_FORMAT);
    } else if (timeRange === 'quarter') {
        start_time = time_moment.startOf('quarter').format(MOMENT_DATE_FORMAT);
        end_time = time_moment.endOf('quarter').format(MOMENT_DATE_FORMAT);
    } else if (timeRange === 'year') {
        start_time = time_moment.startOf('year').format(MOMENT_DATE_FORMAT);
        end_time = time_moment.endOf('year').format(MOMENT_DATE_FORMAT);
    }
    //不是所有时间和某一天时，要判断截止时间是否大于当前日期
    if (timeRange !== 'all' && timeRange !== 'day' && endOfToday) {
        //如果超过当前时间则设置截止时间为当前时间
        if (moment(end_time, MOMENT_DATE_FORMAT).isAfter(moment())) {
            end_time = moment().format(MOMENT_DATE_FORMAT);
        }
    }
    dateObj.start_time = start_time;
    dateObj.end_time = end_time;
    return dateObj;
};

// 近一周的时间
exports.getNearlyWeekTime = function() {
    return {
        start_time: moment().add(-7, 'days'),
        end_time: moment().format(MOMENT_DATE_FORMAT)
    };
};

// 近一月的时间
exports.getNearlyMonthTime = function() {
    return {
        start_time: moment().subtract(1, 'months').format(MOMENT_DATE_FORMAT),
        end_time: moment().format(MOMENT_DATE_FORMAT)
    };
};

// 近一季度的时间
exports.getNearlyQuarterTime = function() {
    return {
        start_time: moment().subtract(1, 'quarter').format(MOMENT_DATE_FORMAT),
        end_time: moment().format(MOMENT_DATE_FORMAT)
    };
};

// 近一年的时间
exports.getNearlyYearTime = function() {
    return {
        start_time: moment().subtract(1, 'year').format(MOMENT_DATE_FORMAT),
        end_time: moment().format(MOMENT_DATE_FORMAT)
    };
};
