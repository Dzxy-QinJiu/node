/**
 * 总体分析
 */

import { unknownObj, unknownDataMap } from '../../consts';
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
        title: Intl.get('oplate_customer_analysis.1', '趋势统计'),
        url: '/rest/analysis/customer/v1/:auth_type/:tab/trend',
        chartType: 'line',
        customOption: {
            multi: true,
        },
        processOption: option => {
            let allData = [];

            //集合各系列中的数据
            _.each(option.series, serie => {
                if (_.isArray(serie.data)) {
                    allData = allData.concat(serie.data);
                }
            });

            //找出最小值
            const minValue = _.min(allData);

            //将y轴最小值设置为数据最小值，以解决数据变化过小，看不出趋势的问题
            if (minValue) {
                _.set(option, 'yAxis[0].min', minValue);
            }
        },
    }, {
        title: Intl.get('oplate_customer_analysis.3', '地域统计'),
        url: '/rest/analysis/customer/v1/:auth_type/:tab/zone',
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'zone'),
    }, {
        title: Intl.get('oplate_customer_analysis.5', '行业统计'),
        url: '/rest/analysis/customer/v1/:auth_type/:tab/industry',
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'industry'),
        customOption: {
            reverse: true
        },
    }, {
        title: Intl.get('oplate_customer_analysis.4', '团队统计'),
        url: '/rest/analysis/customer/v1/:auth_type/:tab/team',
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
    }, {
        title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        chartType: 'funnel',
        processData: processCustomerStageData,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
    }];
}
