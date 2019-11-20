/**
 * 试用合格客户分析
 */

import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

module.exports = {
    title: CUSTOMER_MENUS.TRIAL_QUALIFIED.name,
    key: CUSTOMER_MENUS.TRIAL_QUALIFIED.key,
    menuIndex: 5,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL,
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
    ],
    charts: getCharts(),
    adjustConditions,
    adjustDatePicker
};

function getCharts() {
    return [
        //试用合格客户数统计
        customerChart.getCustomerTrialQualifiedNumChart(),
        //试用合格组成
        customerChart.getCustomerTrialQualifiedComposeChart(),
        //试用合格客户详细统计表
        customerChart.getCustomerTrialQualifiedChart(),
        //地域统计
        customerChart.getCustomerTrialQualifiedDistributionChart('地域统计', 'province'),
        //行业统计
        customerChart.getCustomerTrialQualifiedDistributionChart('行业统计', 'industry'),
        //趋势图
        customerChart.getCustomerTrialQualifiedTrendChart(),
    ];
}

//调整分析组件中的过滤条件
function adjustConditions(conditions) {
    const startTime = _.find(conditions, condition => condition.name === 'starttime');
    const endTime = _.find(conditions, condition => condition.name === 'endtime');

    if (startTime && endTime) {
        const startOfMonth = moment(endTime.value).startOf('month').valueOf();
        const endOfMonth = moment(endTime.value).endOf('month').valueOf();

        //开始时间设为当前选择月的开始时间
        startTime.value = startOfMonth;
        //结束时间设为当前选择月的结束时间
        endTime.value = endOfMonth;
    }
}

//调整日期选择器
function adjustDatePicker(option, startTime, endTime) {
    const endMoment = endTime ? moment(endTime) : moment();
    //时间区间设为月
    option.range = 'month';
    //结束时间设为当前结束时间所在月的第一天
    option.startTime = endMoment.startOf('month').valueOf();
    //结束时间设为当前结束时间所在月的最后一天
    option.endTime = endMoment.endOf('month').valueOf();
    //日期选择器只能选择月，所以无需提供时间区间选项
    option.periodOptions = [];
}
