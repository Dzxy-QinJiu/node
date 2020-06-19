/**
 * 出勤统计
 */

export function getAttendanceChart() {
    return {
        title: Intl.get('analysis.travel.leave.statistics', '出差请假统计'),
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
                processedData.push({
                    value: Intl.get('analysis.number.of.business.trips', '出差次数') + ': ' + businessTripNum
                });
            }

            if (_.isNumber(askForLeaveDuration)) {
                processedData.push({
                    value: Intl.get('analysis.days.off', '请假天数') + ': ' + askForLeaveDuration
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
            //因为列数较少，按表格形式展示不太好看，所以把表头隐去，让展示上就像普通的文本行一样
            showHeader: false,
            columns: [
                {
                    dataIndex: 'value'
                }
            ],
        },
    };
}
