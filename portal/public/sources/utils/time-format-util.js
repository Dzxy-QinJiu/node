/**
 * Created by wangliping on 2016/12/9.
 */

//秒数时间转换成x小时x分x秒
exports.secondsToHourMinuteSecond = function(timeSeconds) {
    let hours = Math.floor(timeSeconds / (60 * 60));//小时数
    let minutes = Math.floor((timeSeconds - hours * 60 * 60) / 60);//分钟数
    let seconds = Math.floor(timeSeconds - hours * 60 * 60 - minutes * 60);//秒数
    let timeDescr = '';//转换后的时间描述
    if (hours > 0) {
        timeDescr = hours + Intl.get('user.time.hour', '小时');
    }
    if (minutes > 0) {
        timeDescr += minutes + Intl.get('user.time.minute', '分');
    }
    if (seconds > 0) {
        timeDescr += seconds + Intl.get('user.time.second', '秒');
    }
    return {
        hours: hours,
        minutes: minutes,
        second: seconds,
        timeDescr: timeDescr || '0'
    };
};
//将数字时间改为字符串
function getStringTime(time) {
    let timeStr = '' + time;
    if (timeStr.length >= 2) {
        return timeStr;
    } else {//不到两位数时，前面补0
        return ('0' + timeStr).slice(-2);
    }
}
//获取01:02:00（1小时2分钟）格式的时间
exports.getFormatTime = function(time = 0) {
    let timeObj = this.secondsToHourMinuteSecond(time);
    let hour = getStringTime(timeObj.hours), minute = getStringTime(timeObj.minutes),
        second = getStringTime(timeObj.second);
    return `${hour}:${minute}:${second}`;
};

//获取02:01（2分钟1秒）格式的时间
exports.getFormatMinuteTime = function(time = 0) {
    let timeObj = this.secondsToHourMinuteSecond(time);
    let minuteTime = timeObj.minutes;
    if (timeObj.hours) {
        minuteTime += timeObj.hours * 60;
    }
    let minute = getStringTime(minuteTime),
        second = getStringTime(timeObj.second);
    return `${minute}:${second}`;
};

//计算出不同过期时间段对应的开始时间 本天 本周 本月 半年
exports.getStartTime = function(time) {
    switch (time) {
        case 'day':
            return moment().startOf('day').valueOf();
        case 'week':
            return moment().startOf('week').valueOf();
        case 'month':
            return moment().startOf('month').valueOf();
        case 'half_year':
            return moment().valueOf();
    }
};

//计算出不同过期时间段对应的结束时间 本天 本周 本月 半年
exports.getEndTime = function(time) {
    switch (time) {
        case 'day':
            return moment().endOf('day').valueOf();
        case 'week':
            return moment().endOf('week').valueOf();
        case 'month':
            return moment().endOf('month').valueOf();
        case 'half_year':
            return moment().add(6, 'months').valueOf();
    }
};
//某个日期时星期几
exports.getCurrentWeek = function(time) {
    var Week = moment(time).format('dddd');
    switch (Week) {
        case 'Monday':
            Week = Intl.get('schedule.user.time.monday', '星期一');
            break;
        case 'Tuesday':
            Week = Intl.get('schedule.user.time.tuesday', '星期二');
            break;
        case 'Wednesday':
            Week = Intl.get('schedule.user.time.wednesday', '星期三');
            break;
        case 'Thursday':
            Week = Intl.get('schedule.user.time.thursday', '星期四');
            break;
        case 'Friday':
            Week = Intl.get('schedule.user.time.friday', '星期五');
            break;
        case 'Saturday':
            Week = Intl.get('schedule.user.time.saturday', '星期六');
            break;
        case 'Sunday':
            Week = Intl.get('schedule.user.time.sunday', '星期日');
            break;
        default:
            break;
    }
    return Week;
};

//获取所传时间是xx:xx:xx(今天)、昨天、前天还是xx天（月、年）前
exports.getTimeStrFromNow = function(time) {
    let timeStr = '';
    if (time) {
        //今天
        let today = {start_time: moment().startOf('day').valueOf(), end_time: moment().endOf('day').valueOf()};
        if (time >= today.start_time && time <= today.end_time) {
            //今天显示具体时间
            timeStr = moment(time).format(oplateConsts.TIME_FORMAT);
        } else if (time >= today.start_time - oplateConsts.ONE_DAY_TIME_RANGE && time <= today.end_time - oplateConsts.ONE_DAY_TIME_RANGE) {
            //昨天
            timeStr = Intl.get('user.time.yesterday', '昨天');
        } else if (time >= today.start_time - 2 * oplateConsts.ONE_DAY_TIME_RANGE && time <= today.end_time - 2 * oplateConsts.ONE_DAY_TIME_RANGE) {
            //前天
            timeStr = Intl.get('sales.frontpage.before.yesterday', '前天');
        } else {
            timeStr = moment(time).fromNow();
        }
    }
    return timeStr;
};

//获取所传时间是今天、明天、后天还是xxx天后
exports.getFutureTimeStr = function(time) {
    let timeStr = '';
    if (time) {
        //今天的起始、结束时间(23:59:59+1)
        let today = {start_time: moment().startOf('day').valueOf(), end_time: moment().endOf('day').valueOf() + 1};
        if (time > today.start_time && time <= today.end_time) {
            //今天
            timeStr = Intl.get('user.time.today', '今天');
        } else if (time > today.start_time + oplateConsts.ONE_DAY_TIME_RANGE && time <= today.end_time + oplateConsts.ONE_DAY_TIME_RANGE) {
            //明天
            timeStr = Intl.get('sales.frontpage.tomorrow', '明天');
        } else if (time > today.start_time + 2 * oplateConsts.ONE_DAY_TIME_RANGE && time <= today.end_time + 2 * oplateConsts.ONE_DAY_TIME_RANGE) {
            //后天
            timeStr = Intl.get('sales.frontpage.after.tomorrow', '后天');
        } else {
            let duration = moment.duration(time - moment().valueOf());
            if (duration > 0) {
                let over_draft_days = duration.days(); //天
                if (duration.months() > 0) {//月
                    over_draft_days += duration.months() * 30;
                }
                if (duration.years() > 0) {//年
                    over_draft_days += duration.years() * 365;
                }
                if (over_draft_days > 0) {
                    timeStr = Intl.get('oplate.user.analysis.25', '{count}天后', {count: over_draft_days});
                }
            }
        }
    }
    return timeStr;
};

// 获取所传时间是今天hh:mm、昨天hh:mm、前天hh:mm 、今年的时间（MM-DD hh:mm）, 其他时间显示（YYYY-MM-DD hh:mm）
exports.transTimeFormat = function(time) {
    let formatTime = '';
    let timeYear = moment(time).get('year'); // 所传时间当前的年份
    let nowYear = moment().get('year'); // 当前时间当前的年份
    if (timeYear === nowYear) { // 同一年
        // 今天的时间范围
        let todayRange = {startTime: moment().startOf('day').valueOf(), endTime: moment().endOf('day').valueOf()};
        // 昨天的时间范围
        let yesterdayRange = {startTime: moment().subtract(1, 'day').startOf('day').valueOf(), endTime: moment().subtract(1, 'day').endOf('day').valueOf()};
        // 前天的时间范围
        let beforeYesRange = {startTime: moment().subtract(2, 'day').startOf('day').valueOf(), endTime: moment().subtract(2, 'day').endOf('day').valueOf()};

        if (time >= todayRange.startTime && time <= todayRange.endTime) {
            formatTime = Intl.get('user.time.today', '今天') + ' ' + moment(time).format(oplateConsts.HOUR_MUNITE_FORMAT);
        } else if (time >= yesterdayRange.startTime && time <= yesterdayRange.endTime) {
            formatTime = Intl.get('user.time.yesterday', '昨天') + ' ' + moment(time).format(oplateConsts.HOUR_MUNITE_FORMAT);
        } else if (time >= beforeYesRange.startTime && time <= beforeYesRange.endTime) {
            formatTime = Intl.get('sales.frontpage.before.yesterday', '前天') + ' ' + moment(time).format(oplateConsts.HOUR_MUNITE_FORMAT);
        } else {
            formatTime = moment(time).format(oplateConsts.DATE_MONTH_DAY_HOUR_MIN_FORMAT);
        }
    } else if (timeYear < nowYear) { // YYYY-MM-DD hh:mm
        formatTime = moment(time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
    }

    return formatTime;
};
