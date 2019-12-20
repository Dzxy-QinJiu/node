/**
 * 当前线索阶段统计
 */

export function getCurrentStageChart(paramObj = {}) {
    return {
        title: Intl.get('clue.stage.statics', '线索阶段统计'),
        url: '/rest/analysis/customer/v2/clue/:data_type/statistical/field/customer_label',
        chartType: 'bar',
        dataField: 'result',
        processData: (data) => {
            let processedData = _.map(data, itemObj => {
                //itemObj的数据格式{信息:10},改成item的数据格式{name:信息，value:10}
                let item = {};
                _.each(itemObj, (val, key) => {
                    item.name = key || '未知';
                    item.value = val;
                });
                return item;
            });
            return processedData;
        },
        option: {
            yAxis: [{
                //设置成1保证坐标轴分割刻度显示成整数
                minInterval: 1,
            }]
        }
    };
}
