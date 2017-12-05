//默认应用平台选项
export const defaultPlatforms = [
    Intl.get("user.third.thirdapp.consts.sina", "新浪微博"),
    Intl.get("user.third.thirdapp.consts.tencent", "腾讯微博")
];

// 国际化
export const SELECT_TIME_TIPS = {
    range: Intl.get("user.log.select.time.range.tips", "只能查看近三个月的数据"),
    time: Intl.get("user.log.select.time.tips", "请选择小于1个月的时间"),
    record: Intl.get("user.log.single.record", "只能查看近三个月的操作记录")
};

// 日志范围，从当前时间，3个月内的数据
export const THREE_MONTH_TIME_RANGE = moment().diff(moment().subtract(3, "months"));

// 自定义中，规定选择31天(提示信息)
export const THIRTY_ONE_DAY_TIME_RANGE = 31 * 24 * 60 * 60 * 1000;
// 自定义中，时间的选择（用来计算开始时间）
export const THIRTY_DAY_TIME_RANGE = 30 * 24 * 60 * 60 * 1000;