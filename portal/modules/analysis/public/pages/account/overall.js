/**
 * 总体分析
 */

import { unknownObj, unknownDataMap, USER_TYPES, USER_TYPES_WITH_TITLE } from '../../consts';
import { handleChartClick } from '../../utils';
import { processCustomerStageData } from 'PUB_DIR/sources/utils/analysis-util';
import Store from '../../store';

module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [{
        title: Intl.get('user.analysis.total', '用户统计'),
        url: '/rest/analysis/user/v1/:auth_type/:tab/summary',
        chartType: 'line',
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
    }, {
        title: Intl.get('user.analysis.address', '地域统计'),
        url: '/rest/analysis/user/v1/:auth_type/apps/:tab/zone',
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        customOption: {
            stack: true,
            legendData: USER_TYPES,
        },
        csvOption: {
            rowNames: USER_TYPES_WITH_TITLE,
        },
    }, {
        title: Intl.get('user.analysis.industry', '行业统计'),
        url: '/rest/analysis/user/v1/:auth_type/apps/:tab/industry',
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        customOption: {
            stack: true,
            reverse: true,
            legendData: USER_TYPES,
        },
        csvOption: {
            rowNames: USER_TYPES_WITH_TITLE,
        },
    }, {
        title: Intl.get('user.analysis.team', '团队统计'),
        url: '/rest/analysis/user/v1/:auth_type/apps/:tab/team',
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        customOption: {
            stack: true,
            legendData: USER_TYPES,
        },
        csvOption: {
            rowNames: USER_TYPES_WITH_TITLE,
        },
    }];
}
