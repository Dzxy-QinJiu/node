/**
 * 客服电话统计
 */

import { isCommonSales, get114RatioAndServiceTelProcessDataFunc, get114RatioAndServiceTelProcessOptionFunc } from '../../utils';

export function getCallServiceTelChart() {
    let chart = {
        title: Intl.get('call.record.servicecall', '客服电话统计'),
        chartType: isCommonSales() ? 'pie' : 'bar',
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: false
        }, {
            name: 'filter_invalid_phone',
            value: true
        }],
        processData: get114RatioAndServiceTelProcessDataFunc('service-tel'),
        processOption: get114RatioAndServiceTelProcessOptionFunc(),
    };

    if (!isCommonSales()) {
        chart.customOption = {
            showValueAsPercent: true,
            showYaxisLabelAsPercent: true
        };
    }

    return chart;
}
