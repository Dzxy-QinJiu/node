/**
 * 新增客户转化率统计
 */

//判断是否在蚁坊域的方法
const isOrganizationEefung = require('PUB_DIR/sources/utils/common-method-util').isOrganizationEefung;

export function getNewCustomerConvertRateChart(paramObj = {}) {
    return {
        title: Intl.get('common.new.customer.conversion.rate.statistics', '新增客户转化率统计'),
        url: '/rest/analysis/customer/v2/statistic/:auth_type/customer/user/new',
        chartType: 'funnel',
        noShowCondition: {
            //在户登录的不是蚁坊域时不显示
            callback: () => !isOrganizationEefung()
        },
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
        processData: data => {
            data = data.total;

            const customerStages = [
                {
                    tagName: Intl.get('common.number.of.new.customers', '新增客户数'),
                    tagValue: 'newly_customer',
                },
                {
                    tagName: Intl.get('common.number.of.open.user.customers', '开通用户客户数'),
                    tagValue: 'tatol_newly_users',
                },
                {
                    tagName: Intl.get('common.number.of.customers.logged.in', '登录过的客户数'),
                    tagValue: 'customer_login',
                },
                {
                    tagName: Intl.get('common.number.of.qualified.customers', '合格客户数'),
                    tagValue: 'newly_users_login_qualify',
                },
                {
                    tagName: Intl.get('common.number.of.contracted.customers', '签约客户数'),
                    tagValue: 'newly_customer_sign',
                },
            ];

            let processedData = [];
            let prevStageValue;

            customerStages.forEach(stage => {
                let stageValue = data[stage.tagValue];

                if (stageValue) {
                    //保留原始值，用于在图表上显示
                    const showValue = stage.tagName + '\n\n' + stageValue;

                    //转化率
                    let convertRate = '';

                    if (prevStageValue) {
                        convertRate = ((stageValue / prevStageValue) * 100).toFixed(2) + '%';
                    }

                    //如果下一阶段的值比上一阶段的值大，则将下一阶段的值变得比上一阶段的值小，以便能正确排序
                    if (prevStageValue && stageValue > prevStageValue) {
                        stageValue = prevStageValue * 0.8;
                    }

                    //将暂存的上一阶段的值更新为当前阶段的值，以供下一循环中使用
                    prevStageValue = stageValue;

                    processedData.push({
                        name: convertRate,
                        value: stageValue,
                        showValue,
                    });
                }
            });

            return processedData;
        },
        processCsvData: (chart, option) => {
            let csvData = [];
            let thead = [Intl.get('deal.stage', '阶段'), Intl.get('common.app.count', '数量'), Intl.get('analysis.conversion.rate', '转化率')];

            csvData.push(thead);

            const data = _.get(option, 'series[0].data');

            _.each(data, item => {
                const stageCountArr = item.showValue.split('\n\n');

                //阶段
                const stage = stageCountArr[0];
                //数量
                const count = stageCountArr[1];
                const tr = [stage, count, item.name];

                csvData.push(tr);
            });

            return csvData;
        }
    };
}
