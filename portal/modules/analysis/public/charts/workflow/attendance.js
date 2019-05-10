/**
 * 出勤统计
 */

export function getAttendanceChart() {
    return {
        title: '出差请假统计',
        chartType: 'table',
        url: [
            '/rest/base/v1/workflow/businesstrip/statistic',
            '/rest/base/v1/workflow/leave/statistic'
        ],
        argCallback: arg => {
            if (arg.query.member_ids) {
                arg.query.user_id = arg.query.member_ids;

                delete arg.query.member_ids;
            }
        },
        processData: data => {
            let processedData = [];

            //出差次数，返回值应为整数
            const businessTripNum = _.get(data, [0]);
            //请假时长，返回值应为毫秒
            const askForLeaveDuration = _.get(data, [1]);

            if (_.isNumber(businessTripNum)) {
                _.set(processedData, '[0].business_trip_num', businessTripNum);
            }

            if (_.isNumber(askForLeaveDuration)) {
                _.set(processedData, '[0].ask_for_leave_duration', askForLeaveDuration);
            }

            return processedData;
        },
        option: {
            columns: [
                {
                    title: '出差次数',
                    dataIndex: 'business_trip_num',
                    width: '50%',
                }, {
                    title: '请假天数',
                    dataIndex: 'ask_for_leave_duration',
                    align: 'right',
                    width: '50%',
                }
            ],
        },
    };
}
