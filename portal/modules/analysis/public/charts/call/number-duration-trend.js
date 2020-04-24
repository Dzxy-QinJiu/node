/**
 * 近一个月的通话数量/时长趋势图
 */

import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import { Radio, Switch } from 'antd';
const RadioGroup = Radio.Group;

export function getCallNumberTimeTrendChart(paramObj = {}) {
    const Store = paramObj.Store;

    return {
        title: Intl.get('call.record.trend.charts', '通话趋势统计'),
        chartType: 'line',
        option: {
            tooltip: {
                formatter: getTooltipFormatter('count')
            }
        },
        layout: {sm: 24},
        ajaxInstanceFlag: 'getCallNumberTimeTrend',
        url: '/rest/analysis/callrecord/v1/callrecord/histogram',
        argCallback: arg => {
            let query = arg.query;

            query.interval = 'day';

            const teamList = _.get(Store, 'teamList.list');

            if (
                //指定了要按成员筛选
                Store.teamMemberFilterType === 'member' || 
                //只有一个团队时，只会按成员筛选
                (teamList && teamList.length === 1)
            ) {
                query.statistics_type = 'user';
            } else {
                query.statistics_type = 'team';
            }
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
                        const name = moment(item.date).format(oplateConsts.DATE_FORMAT);

                        dataCount.push({
                            name,
                            value: item.docments
                        });

                        dataDuration.push({
                            name,
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
            chart.rawData = data;

            //默认显示通话数量
            return dataCount;
        },
        processOption: (option, chart) => {
            //是否分团队显示
            const isShowSeparateTeam = chart.isTeamView;

            //是否分成员显示
            //筛选类型选的是成员
            //并且选择了具体的成员时
            //分成员显示
            const isShowSeparateMember = Store.teamMemberFilterType === 'member' && _.isArray(Store.secondSelectValue);

            //如果需要分团队或成员显示
            //处理图表选项，生成多个显示系列
            if (isShowSeparateTeam || isShowSeparateMember) {
                let legendData = [];
                let series = [];

                _.each(chart.rawData, (v, k) => {
                    legendData.push(k);
                    series.push({
                        type: 'line',
                        name: k,
                        data: _.map(v, item => {
                            return chart.radioType === 'duration' ? item.sum : item.docments;
                        })
                    });
                });

                option.legend.data = legendData;
                option.legend.type = 'scroll';
                option.series = series;

            }
        },
        processCsvData: (chart, option) => {
            let csvData = [];

            let thead = option.xAxis[0].data;

            const series = option.series;

            if (_.has(series[0], 'name')) {
                thead.unshift('');
            }

            csvData.push(thead);

            _.each(option.series, (serie, index) => {
                const values = _.map(serie.data, 'value');

                let tr = [];

                if (serie.name) {
                    tr.push(serie.name);
                }

                tr = tr.concat(values);

                csvData.push(tr);
            });

            return csvData;
        }
    };

    //渲染切换按钮
    function renderCallTrendChartSwitch(chart, analysisInstance) {
        //是否显示"查看各团队通话趋势图"开关
        //筛选类型选的是团队
        //并且团队选的是全部，这个是根据Store.secondSelectValue的值来判断的，只有选全部的时候这个值不是数组，所以可以根据这个值是否是数组来判断选择的是否是全部
        //或者选择的团队大于一个时
        //显示"查看各团队通话趋势图"开关
        const isTeamSwitchShow = Store.teamMemberFilterType === 'team' && (!_.isArray(Store.secondSelectValue) || (_.isArray(Store.secondSelectValue) && Store.secondSelectValue.length > 1));

        return (
            <div>
                <RadioGroup defaultValue='count' onChange={handleRadioChange.bind(this, chart, analysisInstance)}>
                    <Radio value="count">{Intl.get('sales.home.call.cout', '通话数量')}</Radio>
                    <Radio value="duration">{Intl.get('call.record.call.duration', '通话时长')}</Radio>
                </RadioGroup>

                {isTeamSwitchShow ? (
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

        chart.radioType = value;

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
        chart.isTeamView = value;

        const charts = analysisInstance.state.charts;

        analysisInstance.setState({charts});
    }
}
