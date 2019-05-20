/**
 * 近一个月的通话数量/时长趋势图
 */

import Store from '../../store';
import { Radio, Switch } from 'antd';
const RadioGroup = Radio.Group;

export function getCallNumberTimeTrendChart() {
    this.chart = {
        title: Intl.get('call.record.trend.charts', '近一个月的通话趋势'),
        chartType: 'line',
        layout: {sm: 24},
        url: '/rest/analysis/callrecord/v1/callrecord/histogram',
        conditions: [{
            name: 'interval',
            value: 'day',
        }],
        argCallback: arg => {
            let query = arg.query;

            //开始时间改为从结束时间往前推一个月
            query.start_time = moment(query.end_time).subtract(1, 'month').valueOf();
        },
        dataField: 'total',
        processData: (data, chart) => {
            chart.cardContainer.props.subTitle = renderCallTrendChartSwitch();

            return _.map(data, item => {
                return {
                    name: moment(item.date).format(oplateConsts.DATE_FORMAT),
                    value: item.docments
                };
            });
        },
        cardContainer: {
            getProps: (analysisInstance, charts, chart) => {
                return {
                    subTitle: renderCallTrendChartSwitch(analysisInstance, charts, chart)
                };
            }
        }
    };

    function renderCallTrendChartSwitch(analysisInstance, charts, chart) {
        return (
            <div>
                <RadioGroup defaultValue='count' onChange={handleSelectRadio.bind(this, analysisInstance, charts, chart)}>
                    <Radio value="count">{Intl.get('sales.home.call.cout', '通话数量')}</Radio>
                    <Radio value="duration">{Intl.get('call.record.call.duration', '通话时长')}</Radio>
                </RadioGroup>

                {Store.teamMemberFilterType === 'team' ? (
                    <div style={{display: 'inline-block'}}>
                        {Intl.get('call.record.all.teams.trend', '查看各团队通话趋势图')}：
                        <Switch onChange={handleSwitchChange}
                            checkedChildren={Intl.get('user.yes', '是')}
                            unCheckedChildren={Intl.get('user.no', '否')}/>
                    </div>
                ) : null}
            </div>
        );
    }

    function handleSelectRadio(analysisInstance, charts, chart, value) {
        console.log(analysisInstance, charts, chart, value);
    }
    function handleSwitchChange() {}
}
