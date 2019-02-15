/**
 * 账号数统计
 */

import { USER_TYPES, USER_TYPES_WITH_TITLE } from '../../consts';
import { ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackMemberIdsToMemberId } from '../../utils';

export function getAccountNumChart(type = 'total', title) {
    return {
        title: title || '账号数统计',
        url: `/rest/analysis/user/v1/:auth_type/${type}/summary`,
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
        chartType: 'bar',
        option: {
            legend: {
                data: USER_TYPES,
            },
        },
        customOption: {
            stack: true,
        },
        csvOption: {
            rowNames: USER_TYPES_WITH_TITLE,
        },
        overide: {
            condition: {
                callback: ifNotSingleApp
            },
            chartType: 'line',
            option: {
                legend: {
                    type: 'scroll',
                    pageIconSize: 10,
                },
            },
            customOption: {
                stack: false,
                multi: true,
                serieNameField: 'app_name',
                serieNameValueMap: {
                    '': Intl.get('oplate.user.analysis.22', '综合'),
                },
            },
            generateCsvData: function(data) {
                let csvData = [];
                let thead = [Intl.get('common.app.name', '应用名称')];
                let subData = data[0] && data[0].data;
                if (!subData) return [];

                thead = thead.concat(_.map(subData, 'name'));
                csvData.push(thead);
                _.each(data, dataItem => {
                    const appName = dataItem.app_name || Intl.get('oplate.user.analysis.22', '综合');
                    let tr = [appName];
                    tr = tr.concat(_.map(dataItem.data, 'value'));
                    csvData.push(tr);
                });
                return csvData;
            },
        },
    };
}
