/**
 * 有效账号数统计
 */

import { ifNotSingleApp } from '../../utils';

export function getAccountValidChart() {
    return {
        title: Intl.get('analysis.statistics.of.effective.accounts', '有效账号数统计'),
        url: '/rest/analysis/user/v3/:data_type/total/valid',
        chartType: 'pie',
        noShowCondition: {
            callback: ifNotSingleApp
        },
        argCallback: args => {
            delete args.query.start_time;
            delete args.query.end_time;
        },
        processData: data => {
            return [{
                name: Intl.get('analysis.no.charge', '未收费数'),
                value: data.valid,
            }, {
                name: Intl.get('analysis.number.of.charges', '收费数'),
                value: data.formal,
            }];
        },
    };
}
