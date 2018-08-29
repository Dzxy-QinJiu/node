require('./index.less');
import BootstrapDatepicker from '../bootstrap-datepicker';
import classNames from 'classnames';

/**
 *
 提供通用日期选择组件
 <DatePicker
 range="day"
 onSelect={this.onSelectDate}>
 <DatePicker.Option value="all">全部时间</DatePicker.Option>
 <DatePicker.Option value="day">天</DatePicker.Option>
 <DatePicker.Option value="week"> 周</DatePicker.Option>
 <DatePicker.Option value="month"> 月</DatePicker.Option>
 <DatePicker.Option value="year"> 年</DatePicker.Option>
 <DatePicker.Option value="quarter">季度</DatePicker.Option>
 <DatePicker.Option value="custom">自定义</DatePicker.Option>
 </DatePicker>

 必要参数说明：
 range 初始范围，会将范围下拉框进行初始定位
 onSelect 更改日期之后的回掉函数
 onSelect(start_time,end_time,range,label){
          //start_time 开始时间毫秒数
          //end_time   结束时间毫秒数
          //range      范围，例如：day
          //label      范围文字，例如  周
     }
 选项说明：
 选项是可配置的，个数由使用的情景设定，可从下面的所有列表中挑选

 如果是自定义日期，需要多传两个参数 start_time 和 end_time
 <DatePicker
 range="custom"
 start_time={1442843728}
 end_time={1443823721}
 onSelect={this.onSelectDate}>
 <DatePicker.Option value="all">全部时间</DatePicker.Option>
 <DatePicker.Option value="quarter">季度</DatePicker.Option>
 <DatePicker.Option value="custom">自定义</DatePicker.Option>
 </DatePicker>

 特殊参数说明：
 endTimeEndOfDay 表示结束时间是00:00:00还是23:59:59
 true 时表示结束时间是23:59:59
 false 时表示结束时间是00:00:00
 默认值是 true

 disableDateAfterToday   表示是否能够选择今天之后的时间
 true 时表示不能选今天之后的时间
 false 时表示能选择今天之后的时间
 默认值是 false

 dateSelectRange 表示是否只能在某个时间范围值选择时间
 > 0 表示从现在往前推dateSelectRange范围内的时间时可选的
 0 时是表示对时间范围不禁用
 默认值是 0

 比如：
 // 日志范围，从当前时间，3个月内的数据
var React = require('react');
 const THREE_MONTH_TIME_RANGE = 3 * 30 * 24 * 60 * 60 * 1000;
 dateSelectRange = THREE_MONTH_TIME_RANGE
 现在是2017/09/27
 表示可选的时间范围是2017/06/29 -- 2017/09/29
 2017/06/29之前的日期是不可选的

 getEndTimeTip  默认值null
 可以提供一个函数，对结束时间进行一个tooltip的说明
 getEndTimeTip(date){return 'xxx' + date + 'xxx'}

 className      可以为日历添加一个特殊的className
 *
 */
import PropTypes from 'prop-types';

import Dropdown from 'rc-dropdown';
import {Button, Radio, Popover, Icon} from 'antd';
import Menu, {Item as MenuItem} from 'rc-menu';
import Utils from './utils';
const RadioGroup = Radio.Group;

//季度中文字
const QUARTER_CHINESE_TEXT_LIST = [
    Intl.get('user.number.first', '一'),
    Intl.get('user.number.second', '二'),
    Intl.get('user.number.three', '三'),
    Intl.get('user.number.four', '四')];
//日期格式
const DATE_FORMAT = Utils.DATE_FORMAT;

//class的前缀
const CLASS_PREFIX = 'range-datepicker';
//日期范围不对的时候，闪烁的样式
const SPLASH_CLASS = 'range-datepicker-splash';
//空函数
function noop() {
}
/**
 * 选择类型
 */
const timeRanges = ['all', 'day', 'week', 'month', 'quarter', 'year', 'custom'];

class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        var menu_lists = [];
        var allMenu;//记录全部时间
        React.Children.forEach(props.children, function(item) {
            var value = item.props.value;
            var label = item.props.children;
            if (value !== 'all') {
                menu_lists.push({
                    name: label,
                    value: value
                });
            } else {
                allMenu = {
                    name: label,
                    value: value
                };
            }
        });
        //全部时间放到最后
        if (allMenu) {
            menu_lists.push(allMenu);
        }
        menu_lists = _.uniqBy(menu_lists, (menu) => menu.value);
        this.componentId = _.uniqueId('DatePicker');
        //验证时间范围
        let timeRange = props.range || 'day';
        var hasRange = _.find(timeRanges, function(range) {
            if (timeRange === range)
                return true;
        });
        if (!hasRange) {
            timeRange = 'day';
        }
        //判断初始范围（range的值）是否在时间范围选择菜单（menu_lists）中
        var rangeExist = _.find(menu_lists, (menu) => menu.value === timeRange);
        //如果默认时间范围（range的值）不在可选选项中，则使用菜单中的第一项的值
        if (!rangeExist) {
            timeRange = menu_lists[0].value;
        }
        let timeObj, showYear = false;//初始时间及是否显示年日历
        if (timeRange === 'all') {
            timeObj = {start_time: '', end_time: ''};
        } else {
            switch (timeRange) {
            case 'day':
                timeObj = Utils.getTodayTime();
                break;
            case 'week':
                timeObj = Utils.getThisWeekTime(props.disableDateAfterToday ? true : false);
                break;
            case 'month':
                timeObj = Utils.getThisMonthTime(props.disableDateAfterToday ? true : false);
                break;
            case 'quarter':
                timeObj = Utils.getThisQuarterTime(props.disableDateAfterToday ? true : false);
                showYear = true;
                break;
            case 'year':
                timeObj = Utils.getThisYearTime(props.disableDateAfterToday ? true : false);
                showYear = true;
                break;
            case 'custom':
                timeObj = Utils.getCustomTime(new Date(props.start_time), new Date(props.end_time));
                break;
            default:
                timeObj = Utils.getTodayTime();
                break;
            }
        }
        this.state = {
            menu_lists: menu_lists,
            //展示时间
            start_time_record: timeObj.start_time,
            end_time_record: timeObj.end_time,
            //初始和选择的时间
            start_time: timeObj.start_time,
            end_time: timeObj.end_time,
            //季度
            quarter: 1,
            //是否显示日历
            isShowCalendar: false,
            //显示年份日历
            showYear: showYear,
            showYearRecord: showYear,
            //两个日历
            showTwoCalendar: timeRange === 'custom' ? true : false,
            showTwoCalendarRecord: timeRange === 'custom' ? true : false,
            //显示天日历
            showDate: !showYear,
            showDateRecord: !showYear,
            //要显示的季度
            displayQuarterList: QUARTER_CHINESE_TEXT_LIST,
            //初始时间范围
            timeRange: timeRange || 'day',
            //确认展示的时间范围
            timeRangeRecord: timeRange || 'day'
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.isShowCalendar && this.state.isShowCalendar) {
            $('body').off('mousedown', this.bodyClickFunc);
            this.bodyClickFunc = null;
        }
    }

    componentWillReceiveProps(nextProps) {
        const newState = {};
        if (this.props.range !== nextProps.range) {
            newState.timeRange = newState.timeRangeRecord = nextProps.range;
        }
        if (this.props.start_time !== nextProps.start_time) {
            newState.start_time = newState.start_time_record = Utils.getDateStr(nextProps.start_time);
        }
        if (this.props.end_time !== nextProps.end_time) {
            newState.end_time = newState.end_time_record = Utils.getDateStr(nextProps.end_time);
        }
        if (!_.isEmpty(newState)) {
            this.setState(newState);
        }
    }

    componentWillUnmount() {
        if (this.bodyClickFunc) {
            $('body').off('mousedown', this.bodyClickFunc);
        }
    }

    //调用this.props.onSelect，将时间传递出去
    transportOuter(start_time, end_time, timeRange) {
        var label;
        var target = _.find(this.state.menu_lists, function(obj) {
            return obj.value === timeRange;
        });
        if (target) {
            label = target.name;
        }
        if (timeRange === 'all') {
            this.props.onSelect('', '', timeRange, label);
        } else {
            const start_time_millis = Utils.getMilliseconds(start_time) + '';
            let end_time_millis = '0';
            if (this.props.endTimeEndOfDay) {
                end_time_millis = Utils.getMilliseconds(end_time, true) + '';
            } else {
                end_time_millis = Utils.getMilliseconds(end_time) + '';
            }
            this.props.onSelect(start_time_millis, end_time_millis, timeRange, label);
        }
    }

    //时间范围选择触发事件
    onRadioChange(e) {
        let whichRange = e.target.value;
        let options = {};
        options.timeRange = whichRange;
        //之前记录的结束时间
        let time_moment = moment(this.state.end_time_record);
        if (!time_moment || !time_moment.isValid()) {
            time_moment = moment();
        }
        //如果是自定义时，需要展示两个日期选择器
        if (whichRange === 'custom') {
            options.showTwoCalendar = true;
            let customTimeObj = Utils.getCustomTime(this.state.start_time_record, this.state.end_time_record);
            options.start_time = customTimeObj.start_time;
            options.end_time = customTimeObj.end_time;
        } else {
            options.showTwoCalendar = false;
            //使用之前记录的结束时间和当前的时间范围计算出要显示的时间
            let timeObj = Utils.autoSelectTime(time_moment, whichRange, this.props.disableDateAfterToday ? true : false);
            options.start_time = timeObj.start_time;
            options.end_time = timeObj.end_time;
        }
        //还原数据
        options.showDate = false;
        options.showYear = false;
        if (whichRange === 'quarter') {
            let quarter = time_moment.quarter() || this.state.quarter || 1;
            let year = time_moment.year() || new Date().getFullYear();
            let displayQuarterList = this.getDisplayQuarterList(year);
            options.quarter = quarter;
            options.displayQuarterList = displayQuarterList;
            options.showYear = true;
        } else if (whichRange === 'year') {
            options.showYear = true;
        } else {
            options.showDate = true;
        }
        this.showCalendar('click_radio', options);
    }

    //时间范围选择菜单
    renderMenus() {
        const menuLists = this.state.menu_lists.map((item) => {
            const radioStyle = {
                display: 'block',
                height: '30px',
                lineHeight: '30px',
            };
            return (<Radio style={radioStyle} value={item.value}>{item.name}</Radio>);
        });
        return (
            <RadioGroup onChange={this.onRadioChange.bind(this)} value={this.state.timeRange}>
                {menuLists}
            </RadioGroup>
        );
    }

    //获取开始时间展示文本
    getStartTimeDisplayText() {
        if (this.state.start_time_record === '0') {
            return '无';
        }
        return this.state.start_time_record;
    }

    //获取结束时间展示文本
    getEndTimeDisplayText() {
        if (this.state.end_time_record === '0') {
            return '无';
        }
        return this.state.end_time_record;
    }

    //单个calendar更换时间
    onCalendarOK(which, time) {
        if (which === 'start_time') {
            let start_time_moment = moment(time);
            let start_time = start_time_moment.format(DATE_FORMAT);
            let end_time = '0';
            if (this.state.timeRange === 'custom') {
                end_time = this.state.end_time;
                if (end_time) {
                    var end_time_moment = moment(this.state.end_time, DATE_FORMAT);
                    //如果开始时间大于结束时间，做动画
                    if (start_time_moment.isAfter(end_time_moment)) {
                        start_time = end_time_moment.format(DATE_FORMAT);
                        end_time = start_time_moment.format(DATE_FORMAT);
                        $(this.refs.start_time_span).addClass(SPLASH_CLASS);
                        setTimeout(() => {
                            $(this.refs.start_time_span).removeClass(SPLASH_CLASS);
                        }, 1000);
                    }
                }
                //只设置开始结束时间，不真正使用时间
                this.setState({start_time, end_time});
            } else {
                //根据选中的时间自动设置时间
                this.setSelectedDate(start_time_moment);
            }
        } else if (which === 'end_time') {
            let end_time_moment = moment(time);
            let end_time = end_time_moment.format(DATE_FORMAT);
            let start_time;
            //只有自定义时间时，才会显示end_time日历；非自定义，不会显示end_time
            if (this.state.timeRange === 'custom') {
                start_time = this.state.start_time;
                if (start_time) {
                    var start_time_moment = moment(this.state.start_time, DATE_FORMAT);
                    //如果开始时间大于结束时间，做动画
                    if (end_time_moment.isBefore(start_time_moment)) {
                        end_time = start_time_moment.format(DATE_FORMAT);
                        start_time = end_time_moment.format(DATE_FORMAT);
                        $(this.refs.end_time_span).addClass(SPLASH_CLASS);
                        setTimeout(() => {
                            $(this.refs.end_time_span).removeClass(SPLASH_CLASS);
                        }, 1000);
                    }
                }
                //只设置开始结束时间，不真正使用时间
                this.setState({start_time, end_time});
            }
        }
    }

    /*
     根据选中的时间自动设置单日历时间
     time_moment  moment格式数据
     */
    setSelectedDate(time_moment) {
        //自动选择时间范围
        let dateObj = Utils.autoSelectTime(time_moment, this.state.timeRange, this.props.disableDateAfterToday ? true : false);
        let start_time = dateObj.start_time;
        let end_time = dateObj.end_time;
        this.setAndRecordState({start_time, end_time});
        this.transportOuter(start_time, end_time, this.state.timeRange);
    }

    /*
     设置state数据，记录上一次的选择
     options中包括start_time，end_time，timeRange
     */
    setAndRecordState(options) {
        if (options && options.start_time && options.end_time) {
            const quarter = options.quarter ? options.quarter : this.state.quarter;
            const isShowCalendar = false;
            const start_time = options.start_time;
            const end_time = options.end_time;
            //记录显示时间
            const start_time_record = start_time;
            const end_time_record = end_time;
            //记录时间范围
            const timeRangeRecord = this.state.timeRange;
            const showDateRecord = this.state.showDate;
            const showYearRecord = this.state.showYear;
            const showTwoCalendarRecord = this.state.showTwoCalendar;
            this.setState({
                quarter,
                start_time,
                end_time,
                isShowCalendar,
                start_time_record,
                end_time_record,
                timeRangeRecord,
                showDateRecord,
                showYearRecord,
                showTwoCalendarRecord
            });
        }
    }

    //确认按钮监听器
    calendarApply() {
        let start_time = this.state.start_time;
        let end_time = this.state.end_time;
        // 设置state数据，并记录上一次的选择
        this.setAndRecordState({start_time, end_time});
        this.transportOuter(start_time, end_time, this.state.timeRange);
    }

    //更换年
    onCalendarYearOK(time) {
        if (this.state.timeRange === 'quarter') {
            var year = time.getFullYear();
            var displayQuarterList = this.getDisplayQuarterList(year);
            //如果上次选中的quarter在新的quarter里没有，则设置quarter为1
            var quarter = this.state.quarter;
            if (quarter > displayQuarterList.length) {
                quarter = 1;
            }
            var timeInfo = Utils.getQuarterTime(quarter, year);
            //如果超过当前时间则设置截止时间为当前时间
            if (moment(timeInfo.end_time, DATE_FORMAT).isAfter(moment())) {
                timeInfo.end_time = moment().format(DATE_FORMAT);
            }
            this.setState({
                quarter: quarter,
                start_time: timeInfo.start_time,
                end_time: timeInfo.end_time,
                displayQuarterList: displayQuarterList
            });
        } else if (this.state.timeRange === 'year') {
            let year = time.getFullYear();
            let timeInfo = Utils.getYearTime(year);
            //如果超过当前时间则设置截止时间为当前时间
            if (moment(timeInfo.end_time, DATE_FORMAT).isAfter(moment())) {
                timeInfo.end_time = moment().format(DATE_FORMAT);
            }
            let start_time = timeInfo.start_time;
            let end_time = timeInfo.end_time;
            // 设置state数据，并记录上一次的选择
            this.setAndRecordState({start_time, end_time});
            this.transportOuter(this.state.start_time, this.state.end_time, this.state.timeRange);
        }
    }

    //点击calendar之外区域
    checkClickCalendarLayer(event) {
        const target = event.target;
        if (!$(target).closest('.' + CLASS_PREFIX).length && !$(target).closest('.date_text').length) {
            this.setState({
                isShowCalendar: false
            });
        }
    }

    //点击calendar之外区域
    checkClickCalendarQuarterLayer(event) {
        const target = event.target;
        if (!$(target).closest('.' + CLASS_PREFIX).length && !$(target).closest('.date_text').length) {
            this.setState({
                showYear: false
            });
        }
    }

    //展示日历
    showCalendar(where, options) {
        let isShowCalendar = this.state.isShowCalendar;
        let showTwoCalendar = this.state.showTwoCalendar;
        let start_time = this.state.start_time;
        let end_time = this.state.end_time;
        let showDate = this.state.showDate;
        let showYear = this.state.showYear;
        let timeRange = this.state.timeRange;
        //改变类型，点击时间范围radio
        if (where === 'click_radio' && options) {
            start_time = options.start_time ? options.start_time : start_time;
            end_time = options.end_time ? options.end_time : end_time;
            showTwoCalendar = options.showTwoCalendar;
            showDate = options.showDate;
            showYear = options.showYear;
            timeRange = options.timeRange ? options.timeRange : timeRange;
            //全部时间时，关闭日历，展示一个日历（还原），开始结束时间都为空
            if (options.timeRange === 'all') {
                isShowCalendar = false;
                showTwoCalendar = false;
                start_time = '';
                end_time = '';
                this.setState({
                    isShowCalendar,
                    showTwoCalendar,
                    start_time,
                    end_time,
                    timeRange: 'all',
                    timeRangeRecord: 'all',
                    start_time_record: start_time,
                    end_time_record: end_time,
                    showDateRecord: showDate,
                    showYearRecord: showYear,
                    showTwoCalendarRecord: showTwoCalendar
                });
                this.transportOuter(start_time, end_time, 'all');
                return;
            }
        } else {
            isShowCalendar = !isShowCalendar;
            //如果是打开日历，使用上一次记录的状态渲染日历
            if (isShowCalendar) {
                start_time = this.state.start_time_record;
                end_time = this.state.end_time_record;
                timeRange = this.state.timeRangeRecord;
                showDate = this.state.showDateRecord;
                showYear = this.state.showYearRecord;
                showTwoCalendar = this.state.showTwoCalendarRecord;
            }
        }
        this.setState({
            isShowCalendar,
            showTwoCalendar,
            timeRange,
            start_time,
            end_time,
            quarter: (options && options.quarter) ? options.quarter : this.state.quarter,
            displayQuarterList: (options && options.displayQuarterList) ? options.displayQuarterList : this.state.displayQuarterList,
            showYear,
            showDate,
        }, () => {
            if (isShowCalendar) {
                $('body').on('mousedown', this.bodyClickFunc = this.checkClickCalendarLayer.bind(this));
                //根据现实时间选择器的数量设置外层宽度
                var datepicker_wrap = $(this.refs.datepicker_wrap);
                if (this.state.showTwoCalendar) {
                    datepicker_wrap.addClass('datepicker_wrap_two');
                } else {
                    datepicker_wrap.removeClass('datepicker_wrap_two');
                }
                //初始位置
                datepicker_wrap.css({left: 0});
                //重新计算并设置时间选择器位置
                this.computeWidth(datepicker_wrap);
                //设置高度
                this.computeHeight(datepicker_wrap);
                //删除arrow
                var $datepicker = $('.datepicker', this.refs.datepicker_wrap);
                if ($datepicker) {
                    $datepicker.find('>.arrow').remove();
                }
            }
        });
    }

    /**
     * 重新计算并设置时间选择器位置
     * @param datepicker_wrap  jquery元素
     */
    computeWidth(datepicker_wrap) {
        if (!datepicker_wrap)return;
        var window_width = $(window).width();
        var page_scroll_left = $(document).scrollLeft();
        var wrapWidth = datepicker_wrap.outerWidth();
        var datepicker_pos_left = datepicker_wrap.offset().left;
        var rightMargin = 40;//离最右边的边距，预留一定宽度
        //定位时间选择最外层区域，超出边界处理
        if ((wrapWidth + datepicker_pos_left + rightMargin) > (window_width + page_scroll_left)) {
            var overage = (wrapWidth + datepicker_pos_left + rightMargin) - (window_width + page_scroll_left);
            datepicker_wrap.css({left: -overage});
            //时间显示框位置
            var datePicker = datepicker_wrap.parents('.range-datepicker');
            var datepickerWidth = $(datePicker[0]).outerWidth();
            var datePickerLeft = $(datePicker[0]).offset().left;
            //日历选择区域的新位置
            wrapWidth = datepicker_wrap.outerWidth();
            var datepicker_pos_left = datepicker_wrap.offset().left;
            if ((datepicker_pos_left + wrapWidth) < (datePickerLeft + datepickerWidth)) {
                datepicker_wrap.css({left: '', right: 0});
            }
        }
    }

    /**
     * 重新计算并设置时间选择器高度
     * @param datepicker_wrap  jquery元素
     */
    computeHeight(datepicker_wrap) {
        if (!datepicker_wrap)return;
        var datepicker_wrap_height_withQuarter = 256;//有季度显示时，时间选择器最小高度
        var datepicker_wrap_height = datepicker_wrap.outerHeight();
        //当显示季度，并且当前高度小于等于最小高度时，使用最小高度
        if (this.state.timeRange === 'quarter' && (!datepicker_wrap_height || datepicker_wrap_height <= datepicker_wrap_height_withQuarter)) {
            datepicker_wrap.css({height: datepicker_wrap_height_withQuarter});
        } else {
            datepicker_wrap.css({height: 'auto'});
        }
    }

    //渲染时间选择器，一个或两个
    renderCalendar() {
        let cls = classNames({
            one_calendar: this.state.showTwoCalendar === false,
            two_calendar: this.state.showTwoCalendar === true
        });
        let disableDateAfterToday = this.props.disableDateAfterToday;
        let dateSelectRange = this.props.dateSelectRange;
        let datepickerDisplay = (this.state.isShowCalendar) ? 'block' : 'none';
        //时间选择器类型，选择周或月时，能在一个选择器中展示两个日期，所以要展示一个datepicker，且展示两个日期，datepickerType设置为dateRange
        let multidate = this.state.timeRange === 'week' ? true : false;
        let datepickerCls = multidate ? classNames('single_datepicker week_datepicker') : classNames('single_datepicker');
        return (
            <div ref="datepicker_wrap" className="datepicker_wrap" style={{display: datepickerDisplay}}>
                <div className={cls} style={{display: this.state.showDate ? 'block' : 'none'}}>
                    <BootstrapDatepicker
                        id="firstBootstrapDatepicker"
                        multidate={multidate}
                        monthMode={this.state.timeRange === 'month' ? true : false}
                        start_time={multidate ? moment(this.state.start_time, DATE_FORMAT).toDate() : ''}
                        end_time={multidate ? moment(this.state.end_time, DATE_FORMAT).toDate() : ''}
                        className={datepickerCls}
                        value={moment(this.state.start_time, DATE_FORMAT).toDate()}
                        onChange={this.onCalendarOK.bind(this, 'start_time')}
                        disableDateAfterToday={disableDateAfterToday}
                        dateSelectRange={dateSelectRange}
                    />
                    <BootstrapDatepicker
                        id="secondBootstrapDatepicker"
                        className="single_datepicker"
                        value={moment(this.state.end_time, DATE_FORMAT).toDate()}
                        onChange={this.onCalendarOK.bind(this, 'end_time')}
                        disableDateAfterToday={disableDateAfterToday}
                        dateSelectRange={dateSelectRange}
                    />
                </div>
                <div className={cls} style={{display: this.state.showYear ? 'block' : 'none'}}>
                    <BootstrapDatepicker
                        id="onlyYearBootstrapDatepicker"
                        className="single_datepicker"
                        onlyYear={true}
                        value={moment(this.state.start_time, DATE_FORMAT).toDate()}
                        onChange={this.onCalendarYearOK.bind(this)}
                        disableDateAfterToday={disableDateAfterToday}
                        dateSelectRange={dateSelectRange}
                    />
                </div>
                {this.renderQuarterMenu()}
                {this.renderDateRange()}
            </div>
        );
    }

    //展示时间范围类型区域
    renderDateRange() {
        const menu = this.renderMenus();
        let range = '选择日期范围' + this.state.timeRange;
        return (
            <div className="period-type"
                style={{display: (this.state.isShowCalendar || this.state.showYear) ? 'block' : 'none'}}>
                {menu}
                <Button type="primary" className="btn_calendar_apply"
                    data-tracename={range}
                    onClick={this.calendarApply.bind(this)}>
                    {Intl.get('common.sure', '确定')}
                </Button>
            </div>
        );
    }

    //获取展示日期
    getDisplayDateText() {
        var timeObj = {
            start_time: this.getStartTimeDisplayText(),
            end_time: this.getEndTimeDisplayText()
        };
        return timeObj;
    }

    //渲染日期显示框里的日期
    renderDisplayDateText() {
        let timeObj = this.getDisplayDateText();
        if (this.state.timeRangeRecord === 'day' || this.state.timeRangeRecord === 'all') {
            let time = this.state.timeRangeRecord === 'all' ? Intl.get('user.time.all', '全部时间') :
                timeObj.start_time;
            return (
                <span className="date_text">
                    <span ref="start_time_span">
                        {time}
                    </span>
                </span>
            );
        }
        return (
            <span className="date_text">
                <span ref="start_time_span">
                    {timeObj.start_time}
                </span>
                <em className="line"></em>
                <span ref="end_time_span">
                    {timeObj.end_time}
                </span>
            </span>
        );
    }

    //选中某个季度
    onQuarterSelect(obj) {
        var quarter = parseInt(obj.key);
        var year = new Date().getFullYear();
        if (this.state.start_time) {
            var start_moment = moment(this.state.start_time, DATE_FORMAT);
            year = start_moment.year();
        }
        var timeInfo = Utils.getQuarterTime(quarter, year);
        //如果超过当前时间则设置截止时间为当前时间
        if (moment(timeInfo.end_time, DATE_FORMAT).isAfter(moment())) {
            timeInfo.end_time = moment().format(DATE_FORMAT);
        }
        const start_time = timeInfo.start_time;
        const end_time = timeInfo.end_time;
        // 设置state数据，并记录上一次的选择
        this.setAndRecordState({start_time, end_time, quarter});
        this.transportOuter(timeInfo.start_time, timeInfo.end_time, 'quarter');
    }

    //获取第几季度
    getQuarterDisplayText() {
        let which = QUARTER_CHINESE_TEXT_LIST[this.state.quarter - 1];
        return Intl.get('user.quarter.number', '第{}季度', {n: which});
    }

    //计算要显示的季度
    getDisplayQuarterList(year) {
        if (!this.props.disableDateAfterToday || new Date().getFullYear() > year) {
            return QUARTER_CHINESE_TEXT_LIST;
        } else {
            return QUARTER_CHINESE_TEXT_LIST.filter(function(text, num) {
                var startTime = moment().year(year).quarter(num + 1).startOf('quarter').toDate().getTime();
                var now = new Date().getTime();
                if (now >= startTime) {
                    return true;
                }
            });
        }
    }

    //渲染季度菜单
    renderQuarterMenu() {
        if (this.state.timeRange !== 'quarter') {
            return null;
        }
        var menu = (<Menu
            prefixCls="ant-menu"
            onClick={this.onQuarterSelect.bind(this)}
            className={CLASS_PREFIX + '-menu'}>
            {
                this.state.displayQuarterList.map((text, num) => {
                    var cls = classNames({
                        active: (num + 1) === this.state.quarter
                    });
                    return (
                        <MenuItem
                            key={num + 1}
                            className={cls}
                        >
                            {Intl.get('user.quarter.number', '第{n}季度', {n: text})}
                        </MenuItem>
                    );
                })
            }
        </Menu>);

        return (this.state.showYear ? <Dropdown
            getPopupContainer={() => {
                return document.getElementById(this.componentId + '_quarter');
            }}
            overlay={menu}
            prefixCls="ant-dropdown">
            <div className="quarter_wrap" id={this.componentId + '_quarter'}>
                <span className="range_text">{this.getQuarterDisplayText()}</span>
                <em className="triangle"></em>
            </div>
        </Dropdown> : null);

    }

    render() {
        const props = this.props;
        const {start_time, end_time, timeRange, onSelect, children, className, endTimeEndOfDay, getEndTimeTip, disableDateAfterToday, dateSelectRange, ...restProps} = props;
        const cls = classNames(CLASS_PREFIX, className, CLASS_PREFIX + '_' + this.state.timeRange);
        var timeObj = this.getDisplayDateText();
        var popover = null;
        if (this.props.getEndTimeTip && timeObj.end_time && timeObj.end_time !== '无') {
            var overlay = (
                <div style={{'whiteSpace': 'nowrap'}}>{this.props.getEndTimeTip(timeObj.end_time)}</div>
            );
            popover = (
                <Popover
                    content={overlay}
                >
                    <Icon type="question-circle-o"/>
                </Popover>
            );
        }
        let options = {};
        return (
            <div className={cls} {...restProps}>
                <div className="border_wrap">
                    <div className="date_text_wrap" ref="date_text_wrap">
                        {this.renderDisplayDateText()}
                        <Icon type="calendar"/>
                        {popover}
                        <i className="click_left"
                            onClick={this.showCalendar.bind(this, 'click_date', options)}></i>
                        <i className="click_right"
                            onClick={this.showCalendar.bind(this, 'click_date', options)}></i>
                        {this.renderCalendar()}
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * 获取默认属性
 */
function getDefaultProps() {
    //开始时间，默认今天
    const start_time = '';
    //结束时间，默认今天往后推1年，12个月
    const end_time = '';
    //范围，默认1年，12个月
    const range = 12;
    //选中的处理函数
    const onSelect = noop;
    //class名
    const className = '';
    //是否结束时间为23:59:59
    const endTimeEndOfDay = true;
    //获取结束时间提示语
    const getEndTimeTip = null;
    //禁止选择今天之后的时间
    const disableDateAfterToday = true;
    const dateSelectRange = 0;
    return {
        start_time,
        end_time,
        range,
        onSelect,
        className,
        endTimeEndOfDay,
        getEndTimeTip,
        disableDateAfterToday,
        dateSelectRange
    };
}

//默认属性
DatePicker.defaultProps = getDefaultProps();
//属性类型
DatePicker.propTypes = {
    //开始时间  string(2016-07-08,1469761355214)   number(1469761355214)
    start_time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    //开始时间  string(2016-07-08,1469761355214)   number(1469761355214)
    end_time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    //区间  string(12,custom)   number(12)
    range: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    //选中函数处理
    onSelect: PropTypes.func,
    //class名
    className: PropTypes.string,
    //是否结束时间为23:59:59
    endTimeEndOfDay: PropTypes.bool,
    //获取结束时间提示信息
    getEndTimeTip: PropTypes.func,
    //禁止选择今天之后的时间
    disableDateAfterToday: PropTypes.bool,
    //禁止选择某个时间之前的时间范围
    dateSelectRange: PropTypes.number
};

/**
 *
 * <DatePickerOption value="month">月</DatePickerOption>
 *
 */
var DatePickerOption = React.createClass({
    getDefaultProps: function() {
        return {
            value: ''
        };
    },
    render: function() {
        return null;
    }
});

//添加option
DatePicker.Option = DatePickerOption;

export default DatePicker;
