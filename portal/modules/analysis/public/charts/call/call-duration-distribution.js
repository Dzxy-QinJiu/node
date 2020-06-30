/**
 * 通话时长分布统计
 */

export function getCallDurationDistributionChart(paramObj = {}) {
    let title = Intl.get('analysis.call.record.statistics', '通话时长分布统计');

    return {
        title,
        layout: {sm: 24},
        height: 'auto',
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/callrecord/billsec/histogram',
        option: {
            columns: [
                {
                    title: '成员',
                    dataIndex: 'dst',
                    width: 120,
                }, {
                    title: Intl.get('sales.home.call.top.ten', '单次通话时长分布'),
                    dataIndex: 'billsec',
                    width: 100,
                    align: 'right',
                }
            ]
        }
    };
}
