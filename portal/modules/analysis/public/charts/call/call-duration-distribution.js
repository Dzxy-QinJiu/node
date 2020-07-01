/**
 * 通话时长分布统计
 */

//时间区间
const TIME_INTERVAL = {
    '0.0': '通话时长小于30秒的通话个数',
    '30.0': '通话时长30-60秒的通话个数',
    '60.0': '通话时长60-90秒的通话个数',
    '90.0': '通话时长90-120秒的通话个数',
    '120.0': '通话时长大于120秒的通话个数',
};

//集客方式
const SOURCE_CLASSIFY = {
    inbound: '市场',
    outbound: '拓展',
};

export function getCallDurationDistributionChart(paramObj = {}) {
    const { type } = paramObj;
    let title = '线索通话分析';

    if (SOURCE_CLASSIFY[type]) title = SOURCE_CLASSIFY[type] + title;

    return {
        title,
        layout: {sm: 24},
        height: 'auto',
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/callrecord/billsec/histogram',
        argCallback: arg => {
            if (type) arg.query.source_classify = type;
        },
        dataField: 'list',
        processData: data => {
            _.each(data, item => {
                _.each(item.billsec_list, billsecItem => {
                    item[billsecItem.name] = billsecItem.count;
                });
            });

            return data;
        },
        processOption: (option, chart) => {
            let columns = [];
            option.columns = columns;

            const hasNickName = _.chain(chart.data).first().has('nick_name').value();

            if (hasNickName) {
                columns.push({
                    title: '成员',
                    dataIndex: 'nick_name',
                    width: 120,
                });
            }

            columns.push({
                title: '团队',
                dataIndex: 'sales_team',
                width: 120,
            });

            _.each(TIME_INTERVAL, (value, key) => {
                columns.push({
                    title: value,
                    dataIndex: key,
                    width: 120,
                    align: 'right',
                });
            });
        }
    };
}
