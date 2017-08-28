//日期格式
export const DATE_FORMAT = oplateConsts.DATE_FORMAT;

//默认时间区间
export const TIME_RANGE = "ThisWeek";

//用户类型legend
export const USER_TYPE_LEGEND = [
    {name: Intl.get("common.official", "签约"), key: "formal"},
    {name: Intl.get("common.trial", "试用"), key: "trial"},
    {name: Intl.get("user.type.presented", "赠送"), key: "special"},
    {name: Intl.get("user.type.train", "培训"), key: "training"},
    {name: Intl.get("user.type.employee", "员工"), key: "internal"},
    {name: Intl.get("user.unknown", "未知"), key: "unknown"}
];
