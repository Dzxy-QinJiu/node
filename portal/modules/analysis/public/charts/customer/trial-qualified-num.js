/**
 * 本月试用合格客户数统计
 */

import { processFallsChartCsvData } from '../../utils';

export function getCustomerTrialQualifiedNumChart() {
    return {
        title: Intl.get('analysis.statistics.of.qualified.customers.in.probation.this.month', '本月试用合格客户数统计'),
        url: '/rest/analysis/customer/v3/statistic/:data_type/customer/qualify/current/highest',
        chartType: 'bar',
        processOption: (option, chartProps) => {
            option.legend = {
                show: false,
            };

            //瀑布图的tooltip内容有问题，辅助系列的数据也会显示出来，所以先把tooltip禁掉，等找到解决方案再显示出来
            _.set(option, 'tooltip.show', false);

            _.set(option, 'xAxis[0].data', [
                Intl.get('common.this.month', '本月'),
                Intl.get('common.this.month.add.highest', '本月比历史最高净增'),
                Intl.get('common.history.highest', '历史最高'),
            ]);

            const serie = {
                type: 'bar',
                stack: 'num',
                label: {
                    show: true,
                    position: 'top',
                }
            };

            const data = chartProps.data.list;

            //本月个数
            let thisMonthNum = _.sumBy(data, 'this_month.total');

            //历史最高
            let highestNum = _.sumBy(data, 'highest.total');
            //本月比历史最高净增
            let thisMonthAddHighestNum = thisMonthNum - highestNum;
            
            if (thisMonthAddHighestNum < 0) {
                _.set(option, 'xAxis[0].data[1]', Intl.get('common.this.month.reduce.highest', '本月比历史最高减少'));
            }

            //本月比历史最高净增数辅助值默认为历史最高个数
            let thisMonthAddHighestNumAssist = highestNum;

            //如果本月比历史最高净增数为负值
            if (thisMonthAddHighestNum < 0) {
                //则本月比历史最高净增数辅助值为历史最高个数与本月比历史最高净增之和，也即历史最高个数减去本月比历史最高净增的绝对值
                thisMonthAddHighestNumAssist = highestNum + thisMonthAddHighestNum;
                //将本月比历史最高净增数设为其绝对值，以避免柱子显示在横轴下方
                thisMonthAddHighestNum = Math.abs(thisMonthAddHighestNum);
            }

            //辅助系列，会在堆积的柱子中占空间，但不会显示出来，这样就能呈现出阶梯瀑布效果了
            let serieAssist = _.extend({}, serie, {

                //通过将系列项的颜色设置为透明来实现系列项的隐藏效果
                itemStyle: {
                    normal: {
                        barBorderColor: 'rgba(0,0,0,0)',
                        color: 'rgba(0,0,0,0)'
                    },
                    emphasis: {
                        barBorderColor: 'rgba(0,0,0,0)',
                        color: 'rgba(0,0,0,0)'
                    }
                },
                data: ['-', thisMonthAddHighestNumAssist, '-'],
            });

            //本月系列
            let serieThisMonth = _.extend({}, serie, {
                name: Intl.get('common.this.month', '本月'),
                //数据中只有本月相关数据为实际值，其他的均为空值，在堆积时会用到
                data: [thisMonthNum,'-', '-'],
            });

            //历史系列
            let serieHistory = _.extend({}, serie, {
                name: Intl.get('common.history', '历史'),
                //数据中只有历史最高数为实际值，其他的均为空值，在堆积时会用到
                data: ['-', thisMonthAddHighestNum, highestNum],
            });

            option.series = [
                serieAssist,
                serieThisMonth,
                serieHistory
            ];
        },
        processCsvData: processFallsChartCsvData
    };
}
