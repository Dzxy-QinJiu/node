/**
 * 请假、出差、外出统计
 */

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

        return columns;
    }
}
