var React = require('react');
require('./index.less');
import { Select, InputNumber,Radio } from 'antd';
var RadioButton = Radio.Button;
var RadioGroup = Radio.Group;
function noop() {

}
let DATE_FORMAT = oplateConsts.DATE_FORMAT;

class TimeSelect extends React.Component {
    static defaultProps = {
        showTimeTypeSelect: false,//是否展示年、月、周的类型选择
        hideYearSelect: false,//是否展示年选择框
        timeType: 'week',//时间类型的选择（年：year，月：month，周：week）
        yearTime: '',//xxxx年
        monthTime: '',//xx月
        weekTime: '',//xx(传参数时，不用带周)
        onChangeTimeType: noop,//时间类型选择的事件处理方法
        onChangeYear: noop,//年的选择处理方法
        onChangeMonth: noop,//月的选择处理方法
        onChangeWeek: noop//周的选择处理方法
    };

    componentWillReceiveProps(nextProps) {
        this.setState(this.getWeekTimeRange(nextProps.yearTime, nextProps.weekTime));
    }

    //获取周的开始结束时间
    getWeekTimeRange = (yearTime, weekTime) => {
        let weekStartTime = '', weekEndTime = '';
        //当前年中的第几周的日期
        let curYear = JSON.stringify(parseInt(yearTime));
        let firstDay = moment(curYear + '-01-01').format(DATE_FORMAT);
        //第一天是第几周
        let firstDayWeek = moment(firstDay).week();
        let firstWeekFirstDay = '';//该年第一周的第一天
        if (firstDayWeek === 1) {
            //该年的第一天就是该年第一周的第一天
            firstWeekFirstDay = moment(firstDay).format(DATE_FORMAT);
        } else {
            //该年的第一天在去年最后一周里,那么该年第一周的第一天则是下一周的开始时间
            firstWeekFirstDay = moment(firstDay).add(7, 'days').startOf('week').format(oplateConsts.DATE_FORMAT);
        }
        weekStartTime = moment(firstWeekFirstDay).add(7 * (weekTime - 1), 'days').format(oplateConsts.DATE_FORMAT);
        weekEndTime = moment(weekStartTime).add(6, 'days').format(oplateConsts.DATE_FORMAT);
        return {
            weekStartTime: weekStartTime,
            weekEndTime: weekEndTime
        };
    };

    //年选项的渲染
    renderYearOptions = () => {
        var yearOptions = [];
        var curYear = moment().year();
        for (var i = 0; i <= 10; i++) {
            yearOptions.push(<Option key={i} value={curYear - i}>{curYear - i}年</Option>);
        }
        return yearOptions;
    };

    //月选项的渲染
    renderMonthOptions = () => {
        var monthOptions = [];
        for (var i = 1; i <= 12; i++) {
            monthOptions.push(<Option key={i} Value={i}>{i}月</Option>);
        }
        return monthOptions;
    };

    state = this.getWeekTimeRange(this.props.yearTime, this.props.weekTime);

    render() {
        return (
            <div className="nature-time-select-container">
                {this.props.showTimeTypeSelect ? (<div className="time-type-div">
                    <RadioGroup onChange={this.props.onChangeTimeType} value={this.props.timeType}>
                        <RadioButton value="week">{Intl.get('common.time.unit.week', '周')}</RadioButton>
                        <RadioButton value="month">{Intl.get('common.time.unit.month', '月')}</RadioButton>
                        <RadioButton value="year">{Intl.get('common.time.unit.year', '年')}</RadioButton>
                    </RadioGroup>
                </div>) : null}
                <div className="time-select-div">
                    {this.props.hideYearSelect ? null : (<div className="year-select-div">
                        <Select value={this.props.yearTime} onChange={this.props.onChangeYear}>
                            {this.renderYearOptions()}
                        </Select>
                    </div>)}
                    {this.props.timeType === 'month' ? (<div className="month-select-div">
                        <Select value={this.props.monthTime} onChange={this.props.onChangeMonth}>
                            {this.renderMonthOptions()}
                        </Select>
                    </div>) : this.props.timeType === 'week' ? (<div className="week-select-div">
                        <div className="week-time-label">{Intl.get('common.font.the', '第')}</div>
                        <InputNumber min={1} max={60} value={this.props.weekTime} onChange={this.props.onChangeWeek}/>
                        <div className="week-time-label week-time-content">
                            {Intl.get('common.weeks', '周')} ( {this.state.weekStartTime} {Intl.get('common.time.connector', '至')} {this.state.weekEndTime} )
                        </div>
                    </div>) : null}

                </div>
            </div>
        );
    }
}

module.exports = TimeSelect;

