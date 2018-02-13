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
            tagName: Intl.get("sales.stage.signed", "签约"),
            tagValue: "signed",
        },
    ];

    let processedData = [];

    customerStages.forEach(stage => {
        const stageValue = data[stage.tagValue];

        if (stageValue) {
            processedData.push({
                name: stage.tagName,
                value: stageValue,
            });
        }
    });

    return processedData;
}

