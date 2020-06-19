/**
 * 账号数统计
 */

import { USER_TYPES, USER_TYPES_WITH_TITLE } from '../../consts';
import { ifNotSingleApp, argCallbackUnderlineTimeToTime } from '../../utils';

export function getAccountNumChart(type = 'total', title) {
    return {
        title: title || Intl.get('analysis.account.number.statistics', '账号数统计'),
        url: `/rest/analysis/user/v1/:auth_type/${type}/summary`,
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'line',
        option: {
            legend: {
                data: USER_TYPES,
            },
            yAxis: [{
                //设置成1保证坐标轴分割刻度显示成整数
                minInterval: 1,
            }]
        },
        csvOption: {
            rowNames: USER_TYPES_WITH_TITLE,
        },
        overide: {
            condition: {
                callback: ifNotSingleApp
            },
            option: {
                legend: {
                    type: 'scroll',
                    pageIconSize: 10,
                },
            },
            customOption: {
                multi: true,
                serieNameField: 'app_name',
                serieNameValueMap: {
                    '': Intl.get('oplate.user.analysis.22', '综合'),
                },
            },
            processCsvData: function(chart) {
                const data = chart.data;
                let csvData = [];
                let thead = [Intl.get('common.product.name','产品名称')];
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
        processOption: option => {
            let allData = [];

            //集合各系列中的数据
            _.each(option.series, serie => {
                if (_.isArray(serie.data)) {
                    //系列数据项是数字时
                    if (_.isNumber(serie.data[0])) {
                        //直接合并
                        allData = allData.concat(serie.data);
                    //系列数据项是对象时
                    } else if (_.isObject(serie.data[0])) {
                        //提取value值，再合并
                        allData = allData.concat(_.map(serie.data, 'value'));
                    }
                }
            });

            //找出最小值
            const minValue = _.min(allData);

            //将y轴最小值设置为数据最小值，以解决数据变化过小，看不出趋势的问题
            if (minValue) {
                _.set(option, 'yAxis[0].min', minValue);
            }
        },
    };
}
