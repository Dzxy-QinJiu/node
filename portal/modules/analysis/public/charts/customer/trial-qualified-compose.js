/**
 * 本月试用合格组成
 */

import { processFallsChartCsvData } from '../../utils';

export function getCustomerTrialQualifiedComposeChart() {
    return {
        title: Intl.get('analysis.qualified.composition.in.probation.this.month', '全部产品'),
        url: '/rest/analysis/customer/v2/statistic/:data_type/customer/qualify',
        chartType: 'bar',
        processOption: (option, chartProps) => {
            option.legend = {
                show: false,
            };

            //瀑布图的tooltip内容有问题，辅助系列的数据也会显示出来，所以先把tooltip禁掉，等找到解决方案再显示出来
            _.set(option, 'tooltip.show', false);

            _.set(option, 'xAxis[0].data', [
                Intl.get('user.time.prev.month', '上月'),
                Intl.get('common.this.month.new', '本月新增'),
                Intl.get('common.this.month.back', '本月回流'),
                Intl.get('common.this.month.lose', '本月流失'),
                Intl.get('common.this.month', '本月'),
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

            //上月个数
            let lastMonthNum = _.sumBy(data, 'last_month.total');
            //本月个数
            let thisMonthNum = _.sumBy(data, 'this_month.total');
            //本月新增
            let thisMonthNewNum = _.sumBy(data, 'this_month_new.total');
            //本月流失
            let thisMonthLoseNum = _.sumBy(data, 'this_month_lose.total');
            //本月回流
            let thisMonthBackNum = _.sumBy(data, 'this_month_back.total');

            //本月新增数据辅助，用于实现阶梯瀑布效果，默认以上月数据为基准
            let thisMonthNewNumAssist = lastMonthNum;

            //如果本月新增数为负值
            if (thisMonthNewNum < 0) {
                //则本月新增数辅助值为上月个数与本月新增之和，也即上月个数减去本月新增的绝对值
                thisMonthNewNumAssist = lastMonthNum + thisMonthNewNum;
                //将本月新增数设为其绝对值，以避免柱子显示在横轴下方
                thisMonthNewNum = Math.abs(thisMonthNewNum);
            }

            //本月回流数辅助值为上月个数与本月新增之和
            let thisMonthBackNumAssist = lastMonthNum + thisMonthNewNum;

            //本月流失数辅助值为本月回流数辅助值与本月回流数之和再减去本月流失数
            let thisMonthLoseNumAssist = thisMonthBackNumAssist + thisMonthBackNum - thisMonthLoseNum;

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
                data: ['-', thisMonthNewNumAssist, thisMonthBackNumAssist, thisMonthLoseNumAssist, '-'],
            });

            //上月系列
            let serieLastMonth = _.extend({}, serie, {
                name: Intl.get('user.time.prev.month', '上月'),
                //数据中只有上月个数为实际值，其他的均为空值，在堆积时会用到
                data: [lastMonthNum, '-', '-', '-', '-', '-'],
            });

            //本月系列
            let serieThisMonth = _.extend({}, serie, {
                name: Intl.get('common.this.month', '本月'),
                //数据中只有本月相关数据为实际值，其他的均为空值，在堆积时会用到
                data: ['-', thisMonthNewNum, thisMonthBackNum, thisMonthLoseNum, thisMonthNum],
            });

            option.series = [
                serieAssist,
                serieLastMonth,
                serieThisMonth,
            ];
        },
        processCsvData: processFallsChartCsvData
    };
}
