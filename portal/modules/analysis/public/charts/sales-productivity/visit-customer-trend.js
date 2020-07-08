/**
 * 拜访客户趋势统计
 */

import { TIME_INTERVALS } from '../../consts';

export function getVisitCustomerTrendChart() {
    return {
        title: Intl.get('analysis.visit.customer.trend.statistics', '拜访客户趋势统计'),
        chartType: 'line',
        layout: {sm: 24},
        url: '/rest/base/v1/workflow/businesstrip/customervisit/sum',
        conditions: [{
            name: 'time_unit',
            value: 'day',
        }],
        cardContainer: {
            selectors: [{
                options: TIME_INTERVALS,
                activeOption: 'day',
                conditionName: 'time_unit',
            }],
        },
        option: {
            yAxis: [{
                minInterval: 1
            }],
        }
    };
}
