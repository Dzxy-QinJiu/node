/**
 * 线索成交额及成交数统计
 */

export function getClueDealChart() {
    return {
        title: Intl.get('analysis.statistics.of.lead.turnover.and.turnover', '线索成交额及成交数统计'),
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
                        ${Intl.get('common.deal.amount', '成交额')}：${params[0].data.date_gross_profit_total}${Intl.get('contract.82', '元')}
                    `;
                }
            },
            yAxis: [{
                name: Intl.get('common.deal.number', '成交数'),
                //设置成1保证坐标轴分割刻度显示成整数
                minInterval: 1,
            }]
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
            const dealAmountTitle = Intl.get('common.deal.amount', '成交额') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.82', '元') + ')';
            const dealAmountTr = [dealAmountTitle].concat(dealAmountData);

            csvData.push(dealAmountTr);

            return csvData;
        }
    };
}
