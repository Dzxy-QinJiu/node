/**
 * 114占比统计
 */

import { isCommonSales, get114RatioAndServiceTelProcessDataFunc, get114RatioAndServiceTelProcessOptionFunc } from '../../utils';
import {Popover, Icon} from 'antd';

export function getCall114RatioChart() {
    let chart = {
        title: (
            <span>
                {Intl.get('call.record.service.phone.rate', '114占比统计')}
                <Popover
                    content={Intl.get('call.analysis.114.proportion.tip', '拨打的114电话占所有电话的比例')}
                    trigger='click'
                >
                    <Icon type="question-circle-o" style={{cursor: 'pointer', marginLeft: 5}} />
                </Popover>
            </span>
        ),
        chartType: isCommonSales() ? 'pie' : 'bar',
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: true
        }, {
            name: 'filter_invalid_phone',
            value: false
        }],
        processData: get114RatioAndServiceTelProcessDataFunc('114'),
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
