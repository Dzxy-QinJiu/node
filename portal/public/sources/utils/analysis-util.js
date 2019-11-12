/**
 * 分析辅助函数
 */

import { num as NumUtils } from 'ant-utils';

//客户阶段
export const customerStages = [
    {
        tagName: Intl.get('sales.stage.message', '信息'),
        tagValue: 'message',
    },
    {
        tagName: Intl.get('sales.stage.intention', '意向'),
        tagValue: 'intention',
    },
    {
        tagName: Intl.get('common.trial', '试用'),
        tagValue: 'trial',
    },
    {
        tagName: Intl.get('common.qualified', '合格'),
        tagValue: 'qualified',
    },
    {
        tagName: Intl.get('sales.stage.signed', '签约'),
        tagValue: 'signed',
    },
];

//处理客户阶段统计数据
export function processCustomerStageData(data) {

    let processedData = [];
    let prevStageValue;

    customerStages.forEach(stage => {
        let stageValue = data[stage.tagValue];

        if (stageValue) {
            //保留原始值，用于在图表上显示
            const showValue = stageValue;

            //如果下一阶段的值比上一阶段的值大，则将下一阶段的值变得比上一阶段的值小，以便能正确排序
            if (prevStageValue && stageValue > prevStageValue) {
                stageValue = prevStageValue * 0.8;
            }

            //将暂存的上一阶段的值更新为当前阶段的值，以供下一循环中使用
            prevStageValue = stageValue;

            processedData.push({
                name: stage.tagName,
                value: stageValue,
                showValue,
            });
        }
    });

    return processedData;
}

//处理订单阶段统计数据
export function processOrderStageData(stageList = [], data) {
    //接口返回数据里没有value字段，但是图表渲染需要该字段，所以需要补上该字段
    _.map(data, stage => {
        stage.value = stage.total;
        if (_.isNumber(stage.budget)) {
            //转换成以万为单位的数值
            stage.budget = (stage.budget / 10000).toFixed(2);
            //对预算额做千分位分隔及加单位处理
            stage.budget = NumUtils.parseAmount(stage.budget) + Intl.get('contract.139', '万');
        }
    });

    let processedData = [];

    //将统计数据按销售阶段列表顺序排序
    _.each(stageList, stage => {
        const dataItem = _.find(data, item => item.name === stage.name);
        if (dataItem) {
            processedData.push(dataItem);
        }
    });

    //将维护阶段的统计数据加到处理后的数据的最后
    let maintainStage = _.find(data, stage => stage.name === Intl.get('oplate_customer_analysis.6', '维护阶段'));
    if (maintainStage) processedData.push(maintainStage);

    return processedData;
}

