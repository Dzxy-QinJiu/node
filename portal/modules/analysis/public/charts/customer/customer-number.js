/**
 * 客户数统计
 */

export function getCustomerNumChart(stage) {
    return {
        title: '客户数统计',
        chartType: 'table',
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        argCallback: arg => {
            if (arg.query) {
                arg.query.starttime = 0;

                if (arg.query.end_time) {
                    arg.query.endtime = arg.query.end_time;
                    delete arg.query.end_time;
                }

                if (!arg.query.app_id) {
                    arg.query.app_id = 'all';
                }
            }
        },
        processOption: (option, chartProps) => {
            let columns = [];
            let dataSource = [];
            const data = chartProps.data;

            if (_.isObject(data)) {
                const stageNameMap = {
                    message: '信息',
                    intention: '意向',
                    trial: '试用',
                    signed: '签约',
                    qualified: '合格',
                    unknown: '未知'
                };
                
                if (stage) {
                    columns.push({
                        title: stageNameMap[stage] + '客户数',
                        dataIndex: stage,
                        width: '50%',
                    });
                } else {
                    data.total = data.message + data.intention + data.trial + data.signed + data.unknown;

                    columns.push({
                        title: '总客户数',
                        dataIndex: 'total',
                        width: '50%',
                    }, {
                        title: '签约客户数',
                        dataIndex: 'signed'
                    });
                }

                dataSource.push(data);
            }

            option.columns = columns;
            option.dataSource = dataSource;
        },
        option: {
            columns: [{
                title: '客户总数',
                dataIndex: 'total'
            }]
        },
    };
}
