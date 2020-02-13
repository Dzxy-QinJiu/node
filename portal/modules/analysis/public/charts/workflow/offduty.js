/**
 * 请假、出差、外出统计
 */

import { LEAVE_TYPE_MAP } from 'PUB_DIR/sources/utils/consts';

export function getOffdutyChart(paramObj) {
    const { type, title } = paramObj;

    return {
        title,
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
            title: '团队',
            dataIndex: 'team_name',
            width: '10%',
        }, {
            title: '销售',
            dataIndex: 'nickname',
            width: '10%',
        }];

        if (type === 'personal_leave') {
            columns.push({
                title: '请假时间',
                dataIndex: 'nickname',
                width: '10%',
            }, {
                title: '请假天数',
                dataIndex: 'offduty_time',
                width: '10%',
            }, {
                title: '请假类型',
                dataIndex: 'leave_type',
                width: '10%',
            }, {
                title: '请假事由',
                dataIndex: 'reason',
                width: '10%',
            });
        }

        //出差
        if (type === 'customer_visit') {
            columns.push({
                title: '出差时间',
                dataIndex: 'nickname',
                width: '10%',
            }, {
                title: '出差天数',
                dataIndex: 'offduty_time',
                width: '10%',
            }, {
                title: '出差地点',
                dataIndex: 'address',
                width: '10%',
            });
        }

        //外出
        if (type === 'businesstrip_awhile') {
            columns.push({
                title: '外出日期',
                dataIndex: 'k',
                width: '10%',
            }, {
                title: '外出时间段',
                dataIndex: 'k',
                width: '10%',
            }, {
                title: '外出地点',
                dataIndex: 'address',
                width: '10%',
            });
        }

        return columns;
    }

    function processDataFunc(type, data) {
        _.each(data, item => {
            item.offduty_time += '天';
            item.leave_type = LEAVE_TYPE_MAP[item.leave_type];

        });

        return data;
    }
}
