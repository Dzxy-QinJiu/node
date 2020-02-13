/**
 * 请假、出差、外出统计
 */

export function getOffdutyChart(paramObj) {
    const { type, title } = paramObj;

    return {
        title,
        chartType: 'table',
        url: '/rest/base/v1/workflow/offduty/statistics',
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
                processedData.push({
                    value: '出差次数: ' + businessTripNum
                });
            }

            if (_.isNumber(askForLeaveDuration)) {
                processedData.push({
                    value: '请假天数: ' + askForLeaveDuration
                });
            }

            return processedData;
        },
        processCsvData: (chart, option) => {
            return _.map(option.dataSource, item => {
                return [item.value];
            });
        },
        option: {
            columns: [
                {
                    dataIndex: 'value'
                }
            ],
        },
    };
}
