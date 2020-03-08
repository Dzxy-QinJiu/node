/**
 * 新机会统计
 */

import { getFunnelWithConvertRateProcessDataFunc, funnelWithConvertRateProcessCsvData } from '../../utils';

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
            }]);

        chart.processCsvData = funnelWithConvertRateProcessCsvData;
    } else if (chartType === 'table') {
        chart.processData = data => {
            return data ? [data] : [];
        };

        chart.option = {
            columns: [
                {
                    title: '提交数',
                    dataIndex: 'total',
                    align: 'right',
                    width: '20%',
                }, {
                    title: '成交数',
                    dataIndex: 'deal',
                    align: 'right',
                    width: '20%',
                }, {
                    title: '成交率',
                    dataIndex: 'deal_rate',
                    align: 'right',
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
}
