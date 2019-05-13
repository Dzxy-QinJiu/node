/**
 * 线索成交额及成交数统计
 */

export function getClueDealChart() {
    return {
        title: '线索成交额及成交数统计',
        chartType: 'line',
        url: '/rest/analysis/customer/v2/clue/:data_type/sign/contract/amount',
        dataField: 'list',
        nameField: 'date_str',
        valueField: 'date_list_num',
        option: {
            tooltip: {
                formatter: params => {
                    return `
                        ${params[0].name}<br>
                        ${Intl.get('common.deal.number', '成交数')}：${params[0].value}<br>
                        ${Intl.get('common.deal.amount', '成交额')}：${params[0].data.date_gross_profit_total}
                    `;
                }
            },
            yAxis: [{name: Intl.get('common.deal.number', '成交数')}]
        },
        processCsvData: (chart, option) => {
            const csvData = [];

            const xAxisData = _.get(option, 'xAxis[0].data', []);
            const thead = [''].concat(xAxisData);

            csvData.push(thead);

            const serieData = _.get(option, 'series[0].data');

            const dealNumberData = _.map(serieData, 'value');
            const dealNumberTr = [Intl.get('common.deal.number', '成交数')].concat(dealNumberData);

            csvData.push(dealNumberTr);

            const dealAmountData = _.map(serieData, 'date_gross_profit_total');
            const dealAmountTr = [Intl.get('common.deal.amount', '成交额')].concat(dealAmountData);

            csvData.push(dealAmountTr);

            return csvData;
        }
    };
}
