/**
 * 出勤统计
 */

export function getAttendanceChart() {
    return {
        title: '出差次数、请假天数',
        chartType: 'table',
        url: '/rest/base/v1/workflow/businesstrip/statistic',
        argCallback: arg => {
            if (arg.query.member_id) {
                arg.query.user_id = arg.query.member_id;

                delete arg.query.member_id;
            }
        },
        dataField: 'list',
        option: {
            columns: [
                {
                    title: '团队',
                    dataIndex: 'sales_team',
                    width: '20%',
                }, {
                    title: '成员',
                    dataIndex: 'nick_name',
                    width: '20%',
                }, {
                    title: '成交数',
                    dataIndex: 'deal',
                    width: '20%',
                }
            ],
        },
    };
}
