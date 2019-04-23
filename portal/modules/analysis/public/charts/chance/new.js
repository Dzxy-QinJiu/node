/**
 * 新机会统计
 */

import { getFunnelWithConvertRateProcessDataFunc } from '../../utils';

export function getNewChanceChart(chartType = 'table') {
    let chart = {
        title: '新机会统计',
        chartType,
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/rate',
        ajaxInstanceFlag: 'sales_opportuniry_new',
        dataField: 'result',
    };

    if (chartType === 'funnel') {
        chart.customOption = {
            valueField: 'showValue',
            showConvertRate: true,
        };

        chart.processData = getFunnelWithConvertRateProcessDataFunc([
            {
                name: '提交数',
                key: 'total',
            },
            {
                name: '通过数',
                key: 'pass',
            },
            {
                name: '成交数',
                key: 'deal',
            }], '\n\n');

        chart.processCsvData = processCsvDataFunnel;
    } else if (chartType === 'table') {
        chart.processData = data => {
            return data ? [data] : [];
        };

        chart.option = {
            columns: [
                {
                    title: '提交数',
                    dataIndex: 'total',
                    width: '20%',
                }, {
                    title: '成交数',
                    dataIndex: 'deal',
                    width: '20%',
                }, {
                    title: '成交率',
                    dataIndex: 'deal_rate',
                    width: '20%',
                    render: text => {
                        text = (text * 100).toFixed(2) + '%';
                        return <span>{text}</span>;
                    }
                }
            ]
        };
    }

    return chart;

    //处理漏斗图导出数据
    function processCsvDataFunnel(chart, option) {
        let csvData = [];
        const data = chart.data;

        let thead = _.map(data, 'csvName');
        thead.push('通过率', '成交率', '总成交率(提交-成交)');
        csvData.push(thead);

        let tbody = _.map(data, 'value');
        tbody.push(data[1].name, data[2].name, data[2].dealRate);
        csvData.push(tbody);

        return csvData;
    }
}
