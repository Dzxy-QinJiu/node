import { DATE_FORMAT } from "./consts";

//获取xx年xx月xx日格式的截至时间
export function getEndDateText(endDate) {
    return moment(endDate).format(DATE_FORMAT);
}

//处理客户阶段统计数据
export function processCustomerStageChartData(data) {
    const customerStages = [
        {
            tagName: Intl.get("sales.stage.message", "信息"),
            tagValue: "message",
        },
        {
            tagName: Intl.get("sales.stage.intention", "意向"),
            tagValue: "intention",
        },
        {
            tagName: Intl.get("common.trial", "试用"),
            tagValue: "trial",
        },
        {
            tagName: Intl.get("common.qualified", "合格"),
            tagValue: "qualified",
        },
        {
            tagName: Intl.get("sales.stage.signed", "签约"),
            tagValue: "signed",
        },
    ];

    let processedData = [];
    let prevStageValue = 0;

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

