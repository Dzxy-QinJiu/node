//请假类型
export const LEAVE_TYPES = [
    {
        value: 'leave',
        label: Intl.get('weekly.report.ask.for.leave','请假')
    },
    {
        value: 'business',
        label: Intl.get('weekly.report.business.trip','出差')
    },
    {
        value: 'other',
        label: Intl.get('crm.186', '其他')
    },
];

//请假时间
export const LEAVE_DAYS = [
    {
        value: 1,
        label: Intl.get('weekly.report.n.days','{n}天',{n: 1})
    },
    {
        value: 0.5,
        label: Intl.get('weekly.report.n.days','{n}天',{n: 0.5})
    },
];

