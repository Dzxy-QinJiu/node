var React = require('react');
require('./index.less');
import { InputNumber,Radio } from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
var RadioButton = Radio.Button;
var RadioGroup = Radio.Group;
function noop() {

}
let DATE_FORMAT = oplateConsts.DATE_FORMAT;

class TimeSelect extends React.Component {
    static defaultProps = {
        showTimeTypeSelect: false,//是否展示年、月、周的类型选择
        hideYearSelect: false,//是否展示年选择框
        canSelectFutureWeek: true,//是否可以选择将来的周
        timeType: 'week',//时间类型的选择（年：year，月：month，周：week）
        yearTime: '',//xxxx年
        monthTime: '',//xx月
        weekTime: '',//xx(传参数时，不用带周)
        onChangeTimeType: noop,//时间类型选择的事件处理方法
        onChangeYear: noop,//年的选择处理方法
        onChangeMonth: noop,//月的选择处理方法
        onChangeWeek: noop//周的选择处理方法
    };

    static propTypes = {
        showTimeTypeSelect: PropTypes.bool,
        hideYearSelect: PropTypes.bool,
        canSelectFutureWeek: PropTypes.bool,
        timeType: PropTypes.string,
        yearTime: PropTypes.string,
        monthTime: PropTypes.string,
        weekTime: PropTypes.string,
        onChangeTimeType: PropTypes.func,
        onChangeYear: PropTypes.func,
        onChangeMonth: PropTypes.func,
        onChangeWeek: PropTypes.func
    };

    componentWillReceiveProps(nextProps) {
        this.setState(this.getWeekTimeRange(nextProps.yearTime, nextProps.weekTime));
    }

    //获取周的开始结束时间
    getWeekTimeRange = (yearTime, weekTime) => {
        //传进来的yearTime是带单位的，需要转成整数以供后续计算使用
        yearTime = parseInt(yearTime);

        const weekStartTime = moment().year(yearTime).isoWeek(weekTime).startOf('isoWeek').format(oplateConsts.DATE_FORMAT);
        const weekEndTime = moment().year(yearTime).isoWeek(weekTime).endOf('isoWeek').format(oplateConsts.DATE_FORMAT);

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
            yearOptions.push(<Option key={i} value={curYear - i}>{curYear - i}{Intl.get('common.time.unit.year', '年')}</Option>);
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
        //选择的年
        const yearNum = this.props.yearTime ? parseInt(this.props.yearTime) : moment().year();
        //选择的年的最后一周是当年的第几周
        let lastWeekNum = moment().year(yearNum).endOf('year').isoWeek();
        //如果计算出来的值是1，说明最后一周跨年了，可以认为是选择的年的第53周
        if (lastWeekNum === 1) {
            lastWeekNum = 53;
        }

        if (!this.props.canSelectFutureWeek) {
            const thisYear = moment().year();
            if (thisYear === yearNum) {
                const thisWeek = moment().isoWeek();
                lastWeekNum = thisWeek;
            }
        }

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
                        <AntcSelect value={this.props.yearTime} onChange={this.props.onChangeYear}>
                            {this.renderYearOptions()}
                        </AntcSelect>
                    </div>)}
                    {this.props.timeType === 'month' ? (<div className="month-select-div">
                        <AntcSelect value={this.props.monthTime} onChange={this.props.onChangeMonth}>
                            {this.renderMonthOptions()}
                        </AntcSelect>
                    </div>) : this.props.timeType === 'week' ? (<div className="week-select-div">
                        <div className="week-time-label">{Intl.get('common.font.the', '第')}</div>
                        <InputNumber min={1} max={lastWeekNum} value={this.props.weekTime} onChange={this.props.onChangeWeek}/>
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

