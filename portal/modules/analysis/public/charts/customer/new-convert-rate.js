/**
 * 新开客户转化率统计
 */

export function getNewCustomerConvertRateChart(paramObj = {}) {
    return {
        title: '新开客户转化率统计',
        url: '/rest/analysis/customer/v2/statistic/:auth_type/customer/user/new',
        chartType: 'funnel',
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
        processData: data => {
            data = data.total;

            const customerStages = [
                {
                    tagName: '新增客户数',
                    tagValue: 'newly_customer',
                },
                {
                    tagName: '新增客户开通账号数',
                    tagValue: 'tatol_newly_users',
                },
                {
                    tagName: '新增客户开通账号的登录数',
                    tagValue: 'customer_login',
                },
                {
                    tagName: '新增客户开通账号登录的合格数',
                    tagValue: 'newly_users_login_qualify',
                },
                {
                    tagName: '新增客户签约数',
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
            let thead = ['阶段', '数量', '转化率'];

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
