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
            if (arg.query.member_id) {
                arg.query.user_id = arg.query.member_id;

                delete arg.query.member_id;
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
                //一小时的毫秒数
                const oneHour = 60 * 60 * 1000;
                //请假一天按8小时算
                const oneDay = 8 * oneHour;
                //请假天数
                let askForLeaveDayNum = (askForLeaveDuration / oneDay).toFixed();
                //请假小时数
                let askForLeaveHourNum = (askForLeaveDuration % oneDay) / oneHour;
                //请假小时数最多保留两位小数
                askForLeaveHourNum = Math.ceil(askForLeaveHourNum * 100) / 100;

                let askForLeaveDurationStr = askForLeaveDayNum + '天';

                if (askForLeaveHourNum) {
                    askForLeaveDurationStr += askForLeaveHourNum + '小时';
                }

                _.set(processedData, '[0].ask_for_leave_duration', askForLeaveDurationStr);
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
                    title: '请假时长',
                    dataIndex: 'ask_for_leave_duration',
                    align: 'right',
                    width: '50%',
                }
            ],
        },
    };
}
