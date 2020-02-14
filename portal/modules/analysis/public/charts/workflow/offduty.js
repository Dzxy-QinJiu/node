/**
 * 请假、出差、外出统计
 */

import { LEAVE_TYPE_MAP, MERIDIEM } from 'PUB_DIR/sources/utils/consts';

const TYPE_TITLE_MAP = {
    personal_leave: Intl.get('analysis.leave.statistics', '请假统计'),
    customer_visit: Intl.get('analysis.travel.statistics', '出差统计'),
    businesstrip_awhile: Intl.get('analysis.outgoing.statistics', '外出统计')
};

export function getOffdutyChart(paramObj) {
    const { type } = paramObj;

    return {
        title: TYPE_TITLE_MAP[type],
        chartType: 'table',
        layout: { sm: 24 },
        height: 'auto',
        url: '/rest/base/v1/workflow/offduty/statistics',
        conditions: [{
            name: 'type',
            value: type
        }],
        dataField: 'list',
        processData: processDataFunc.bind(null, type),
        option: {
            columns: getColumns(type)
        },
    };

    function getColumns(type) {
        let columns = [{
            title: Intl.get('user.user.team', '团队'),
            dataIndex: 'team_name',
            width: '20%',
        }, {
            title: Intl.get('sales.home.sales', '销售'),
            dataIndex: 'nickname',
            width: '20%',
        }];

        if (type === 'personal_leave') {
            columns.push({
                title: Intl.get('leave.apply.leave.time', '请假时间'),
                dataIndex: 'leave_time',
                width: '20%',
            }, {
                title: Intl.get('analysis.days.off', '请假天数'),
                dataIndex: 'offduty_time',
                width: '13.33%',
            }, {
                title: Intl.get('leave.apply.leave.type', '请假类型'),
                dataIndex: 'leave_type',
                width: '13.33%',
            }, {
                title: Intl.get('analysis.excuse.for.leave', '请假事由'),
                dataIndex: 'reason',
                width: '13.33%',
            });
        }

        //出差
        if (type === 'customer_visit') {
            columns.push({
                title: Intl.get('leave.apply.for.leave.time', '出差时间'),
                dataIndex: 'leave_time',
                width: '20%',
            }, {
                title: Intl.get('common.number.of.travel.day', '出差天数'),
                dataIndex: 'offduty_time',
                width: '20%',
            }, {
                title: Intl.get('leave.apply.for.city.address', '出差地点'),
                dataIndex: 'address',
                width: '20%',
            });
        }

        //外出
        if (type === 'businesstrip_awhile') {
            columns.push({
                title: Intl.get('analysis.date.of.departure', '外出日期'),
                dataIndex: 'go_out_date',
                width: '20%',
            }, {
                title: Intl.get('analysis.out.time', '外出时间段'),
                dataIndex: 'go_out_time',
                width: '20%',
            }, {
                title: Intl.get('analysis.out.place', '外出地点'),
                dataIndex: 'address',
                width: '20%',
            });
        }

        return columns;
    }

    function processDataFunc(type, data) {
        _.each(data, item => {
            if (type === 'personal_leave') {
                item.leave_type = LEAVE_TYPE_MAP[item.leave_type];
            }

            if (type === 'businesstrip_awhile') {
                item.go_out_date = item.start_time.split(' ')[0];
                item.go_out_time = getGoOutTime(item.start_time, item.end_time);
            } else {
                item.leave_time = getLeaveTime(item.start_time, item.end_time);
                item.offduty_time += Intl.get('common.time.unit.day', '天');
            }
        });

        return data;
    }

    function getLeaveTime(startTime, endTime) {
        const reg = /_([A-Z]+)/;
        const replacer = (match, part) => MERIDIEM[part];

        let leaveTime = startTime.replace(reg, replacer);

        if (endTime !== startTime) {
            leaveTime += Intl.get('analysis.to', '至') + endTime.replace(reg, replacer);
        }

        return leaveTime;
    }

    function getGoOutTime(startTime, endTime) {
        const getHourMinute = fullTime => fullTime.split(' ')[1].substr(0, 5);

        const goOutTime = getHourMinute(startTime) + '-' + getHourMinute(endTime);

        return goOutTime;
    }
}
