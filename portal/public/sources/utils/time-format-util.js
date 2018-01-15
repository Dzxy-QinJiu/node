/**
 * Created by wangliping on 2016/12/9.
 */

//秒数时间转换成x小时x分x秒
exports.secondsToHourMinuteSecond = function (timeSeconds) {
    let hours = Math.floor(timeSeconds / (60 * 60));//小时数
    let minutes = Math.floor((timeSeconds - hours * 60 * 60) / 60);//分钟数
    let seconds = timeSeconds - hours * 60 * 60 - minutes * 60;//秒数
    let timeDescr = "";//转换后的时间描述
    if (hours > 0) {
        timeDescr = hours + Intl.get("user.time.hour", "小时");
    }
    if (minutes > 0) {
        timeDescr += minutes + Intl.get("user.time.minute", "分");
    }
    if (seconds > 0) {
        timeDescr += seconds + Intl.get("user.time.second", "秒");
    }
    return {
        hours: hours,
        minutes: minutes,
        second: seconds,
        timeDescr: timeDescr || "0"
    };
};
//将数字时间改为字符串
function getStringTime(time) {
    let timeStr = "" + time;
    if (timeStr.length >= 2) {
        return timeStr;
    } else {//不到两位数时，前面补0
        return ("0" + timeStr).slice(-2);
    }
}
//获取01:02:00（1小时2分钟）格式的时间
exports.getFormatTime = function (time = 0) {
    let timeObj = this.secondsToHourMinuteSecond(time);
    let hour = getStringTime(timeObj.hours), minute = getStringTime(timeObj.minutes),
        second = getStringTime(timeObj.second);
    return `${hour}:${minute}:${second}`;
};
//计算出不同过期时间段对应的开始时间 本天 本周 本月 半年
exports.getStartTime = function (time) {
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
exports.getEndTime = function (time) {
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
exports.getCurrentWeek = function (time) {
    var Week = moment(time).format('dddd');
    switch (Week) {
        case 'Monday':
            Week = Intl.get("schedule.user.time.monday", "星期一");
            break;
        case 'Tuesday':
            Week = Intl.get("schedule.user.time.tuesday", "星期二");
            break;
        case 'Wednesday':
            Week = Intl.get("schedule.user.time.wednesday", "星期三");
            break;
        case 'Thursday':
            Week = Intl.get("schedule.user.time.thursday", "星期四");
            break;
        case 'Friday':
            Week = Intl.get("schedule.user.time.friday", "星期五");
            break;
        case 'Saturday':
            Week = Intl.get("schedule.user.time.saturday", "星期六");
            break;
        case 'Sunday':
            Week = Intl.get("schedule.user.time.sunday", "星期日");
            break;
        default:
            break;
    }
    return Week;
}