/**
 * 近一个月的通话数量/时长趋势图
 */

import Store from '../../store';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import { Radio, Switch } from 'antd';
const RadioGroup = Radio.Group;

export function getCallNumberTimeTrendChart() {
    return {
        title: Intl.get('call.record.trend.charts', '近一个月的通话趋势'),
        chartType: 'line',
        option: {
            tooltip: {
                formatter: getTooltipFormatter('count')
            }
        },
        layout: {sm: 24},
        ajaxInstanceFlag: 'getCallNumberTimeTrend',
        url: '/rest/analysis/callrecord/v1/callrecord/histogram',
        conditions: [{
            name: 'interval',
            value: 'day',
        }, {
            name: 'statistics_type',
            value: 'team',
        }],
        argCallback: arg => {
            let query = arg.query;

            //开始时间改为从结束时间往前推一个月
            query.start_time = moment(query.end_time).subtract(1, 'month').valueOf();
        },
        processData: (data, chart, analysisInstance) => {
            _.set(chart, 'cardContainer.props.subTitle', renderCallTrendChartSwitch(chart, analysisInstance));

            //通话数量
            let dataCount = [];
            //通话时长
            let dataDuration = [];

            _.each(data, (v, k) => {
                if (_.isEmpty(dataCount)) {
                    _.each(v, item => {
                        item.name = moment(item.date).format(oplateConsts.DATE_FORMAT);

                        dataCount.push({
                            name: item.name,
                            value: item.docments
                        });

                        dataDuration.push({
                            name: item.name,
                            value: item.sum
                        });
                    });
                } else {
                    _.each(dataCount, (item, index) => {
                        item.value += v[index].docments;
                    });

                    _.each(dataDuration, (item, index) => {
                        item.value += v[index].sum;
                    });
                }
            });

            chart.data_count = dataCount;
            chart.data_duration = dataDuration;
            chart.processedData = data;

            //默认显示通话数量
            return dataCount;
        },
    };

    //渲染切换按钮
    function renderCallTrendChartSwitch(chart, analysisInstance) {
        return (
            <div>
                <RadioGroup defaultValue='count' onChange={handleRadioChange.bind(this, chart, analysisInstance)}>
                    <Radio value="count">{Intl.get('sales.home.call.cout', '通话数量')}</Radio>
                    <Radio value="duration">{Intl.get('call.record.call.duration', '通话时长')}</Radio>
                </RadioGroup>

                {Store.teamMemberFilterType === 'team' ? (
                    <div style={{display: 'inline-block'}}>
                        {Intl.get('call.record.all.teams.trend', '查看各团队通话趋势图')}：
                        <Switch onChange={handleSwitchChange.bind(this, chart, analysisInstance)}
                            checkedChildren={Intl.get('user.yes', '是')}
                            unCheckedChildren={Intl.get('user.no', '否')}/>
                    </div>
                ) : null}
            </div>
        );
    }

    //通话数量、通话时长按钮变化处理函数
    function handleRadioChange(chart, analysisInstance, e) {
        const value = e.target.value;

        analysisInstance.radioType = value;
        analysisInstance.teamViewOption = null;

        chart.data = chart['data_' + value];

        const formatter = getTooltipFormatter(value);

        _.set(chart, 'option.tooltip.formatter', formatter);

        const charts = analysisInstance.state.charts;

        analysisInstance.setState({charts});
    }

    //获取tooltip格式化函数
    function getTooltipFormatter(type) {
        return function(params) {
            let textArr = [];

            _.each(params, (param, index) => {
                if (index === 0) {
                    textArr.push(param.name);
                }

                let value = param.value;
                const seriesName = param.seriesName;

                let text = '';

                //如果系列名不是默认的以series开头的命名，说明指定了系列名，需要把系列名显示出来
                if (!seriesName.startWith('series')) {
                    text += seriesName + ', ';
                }

                if (type === 'count') {
                    text += Intl.get('sales.home.call.cout', '通话数量');
                } else {
                    text += Intl.get('call.record.call.duration', '通话时长');
                    value = TimeUtil.secondsToHourMinuteSecond(value).timeDescr;
                }

                text += ': ' + value;

                textArr.push(text);
            });

            const content = textArr.join('<br>');

            return content;
        };
    }

    //“查看各团队通话趋势图”开关变化处理函数
    function handleSwitchChange(chart, analysisInstance, value) {
        if (value) {
            chart.processOption = option => {
                if (analysisInstance.teamViewOption) {
                    option.legend.data = analysisInstance.teamViewOption.legend.data;
                    option.series = analysisInstance.teamViewOption.series;
                } else {
                    let legendData = [];
                    let series = [];

                    _.each(chart.processedData, (v, k) => {
                        legendData.push(k);
                        series.push({
                            type: 'line',
                            name: k,
                            data: _.map(v, item => {
                                return {
                                    name: item.name,
                                    value: analysisInstance.radioType === 'duration' ? item.sum : item.docments
                                };
                            })
                        });
                    });


                    option.legend.data = legendData;
                    option.series = series;

                    analysisInstance.teamViewOption = _.cloneDeep(option);
                }
            };
        } else {
            delete chart.processOption;
        }

        const charts = analysisInstance.state.charts;

        analysisInstance.setState({charts});
    }
}
