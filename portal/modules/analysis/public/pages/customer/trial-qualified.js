/**
 * 试用合格客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    id: 'TRIAL_QUALIFIED',
    title: '试用合格客户分析',
    menuIndex: 5,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts(),
    adjustConditions,
};

function getCharts() {
    return [
        //试用合格客户数统计
        customerChart.getCustomerTrialQualifiedNumChart(),
        //试用合格组成
        customerChart.getCustomerTrialQualifiedComposeChart(),
        //地域统计
        customerChart.getCustomerTrialQualifiedDistributionChart('地域统计', 'province'),
        //行业统计
        customerChart.getCustomerTrialQualifiedDistributionChart('行业统计', 'industry'),
        //趋势图
        customerChart.getCustomerTrialQualifiedTrendChart(),
        //试用合格客户数统计
        customerChart.getCustomerTrialQualifiedChart(),
    ];
}

//调整分析组件中的过滤条件
function adjustConditions(conditions) {
    const startTime = _.find(conditions, condition => condition.name === 'starttime');
    const endTime = _.find(conditions, condition => condition.name === 'endtime');

    if (startTime && endTime) {
        const startOfMonth = moment(endTime.value).startOf('month').valueOf();
        const endOfMonth = moment(endTime.value).endOf('month').valueOf();

        if (startTime.value !== startOfMonth) {
            startTime.value = startOfMonth;
        }

        if (endTime.value !== endOfMonth) {
            endTime.value = endOfMonth;
        }
    }
}
