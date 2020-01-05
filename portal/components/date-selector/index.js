var React = require('react');
require('./index.less');
import BootstrapDatepicker from '../bootstrap-datepicker';

/**
 *
 提供通用日期选择组件
 <DateSelector
      range="-1w"
      onSelect={this.onSelectDate}>
     <DateSelector.Option value="all">全部时间</DateSelector.Option>
     <DateSelector.Option value="-1w">近一周</DateSelector.Option>
     <DateSelector.Option value="-1m">近一月</DateSelector.Option>
     <DateSelector.Option value="-12m">近一年</DateSelector.Option>
     <DateSelector.Option value="quarter">季度</DateSelector.Option>
     <DateSelector.Option value="custom">自定义</DateSelector.Option>
 </DateSelector>

 必要参数说明：
     range 初始范围，会将范围下拉框进行初始定位
     onSelect 更改日期之后的回掉函数
     onSelect(start_time,end_time,range,label){
          //start_time 开始时间毫秒数
          //end_time   结束时间毫秒数
          //range      范围，例如：-1w
          //label      范围文字，例如 近一周
     }
  选项说明：
     选项是可配置的，个数由使用的情景设定，可从下面的所有列表中挑选
      <DateSelector.Option value="all">全部时间</DateSelector.Option>
      <DateSelector.Option value="1w">1周</DateSelector.Option>
      <DateSelector.Option value="0.5m">半个月</DateSelector.Option>
      <DateSelector.Option value="1m">1个月</DateSelector.Option>
      <DateSelector.Option value="6m">6个月</DateSelector.Option>
      <DateSelector.Option value="12m">12个月</DateSelector.Option>
      <DateSelector.Option value="forever">永久</DateSelector.Option>
      <DateSelector.Option value="custom">自定义</DateSelector.Option>
      <DateSelector.Option value="today">今天</DateSelector.Option>
      <DateSelector.Option value="yesterday">昨天</DateSelector.Option>
      <DateSelector.Option value="thisweek">本周</DateSelector.Option>
      <DateSelector.Option value="lastweek">上周</DateSelector.Option>
      <DateSelector.Option value="thismonth">本月</DateSelector.Option>
      <DateSelector.Option value="lastmonth">上月</DateSelector.Option>
      <DateSelector.Option value="-1w">近一周</DateSelector.Option>
      <DateSelector.Option value="-1m">近一月</DateSelector.Option>
      <DateSelector.Option value="-12m">近一年</DateSelector.Option>
      <DateSelector.Option value="seasons">季度</DateSelector.Option>

     如果是自定义日期，需要多传两个参数 start_time 和 end_time
     <DateSelector
         range="custom"
         start_time={1442843728}
         end_time={1443823721}
         onSelect={this.onSelectDate}>
         <DateSelector.Option value="all">全部时间</DateSelector.Option>
         <DateSelector.Option value="-1w">近一周</DateSelector.Option>
         <DateSelector.Option value="-1m">近一月</DateSelector.Option>
         <DateSelector.Option value="-12m">近一年</DateSelector.Option>
         <DateSelector.Option value="quarter">季度</DateSelector.Option>
         <DateSelector.Option value="custom">自定义</DateSelector.Option>
     </DateSelector>

     特殊参数说明：
     endTimeEndOfDay 表示结束时间是00:00:00还是23:59:59
                     true 时表示结束时间是23:59:59
                     false 时表示结束时间是00:00:00
                     默认值是 true

     disableDateBeforeToday   表示是否能够选择今天之前的时间
         true 时表示不能选今天之前的时间
         false 时表示能选择今天之前的时间
         默认值是 false

     disableDateBeforeRange   表示是否能够选择范围之前的时间
         true 时表示不能选范围之前的时间
         false 时表示能选择范围之前的时间
         默认值是 false

     selectRange    选择时间范围：一周、半个月、1个月。。。。

    disableDateAfterToday   表示是否能够选择今天之后的时间
                    true 时表示不能选今天之后的时间
                    false 时表示能选择今天之后的时间
                    默认值是 false

     getEndTimeTip  默认值null
                    可以提供一个函数，对结束时间进行一个tooltip的说明
                    getEndTimeTip(date){return 'xxx' + date + 'xxx'}

     className      可以为日历添加一个特殊的className
 *
 */
import PropTypes from 'prop-types';

import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem} from 'rc-menu';
import classNames from 'classnames';
import {Popover,Icon} from 'antd';
import Utils from './utils';

//季度中文字
const QUARTER_CHINESE_TEXT_LIST = ['一','二','三','四'];
//下拉菜单宽度
const MENU_WIDTH = 80;
//日期格式
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
//支持的选项
//    {name:"1周",value : "1w"},
//    {name:"半个月",value : "0.5m"},
//    {name:"1个月",value : "1m"},
//    {name:"6个月",value : "6m"},
//    {name:"12个月",value : "12m"},
//    {name:"永久",value : "forever"},
//    {name:"自定义",value : "custom"},

//    {name:"今天",value : "today"}
//    {name:"昨天",value : "yesterday"}
//    {name:"本周",value : "thisweek"}
//    {name:"上周",value : "lastweek"}
//    {name:"本月",value : "thismonth"}
//    {name:"上月",value : "lastmonth"}

//    {name:"全部时间",value : "all"}

//    {name:"近一周",value : "-1w"}
//    {name:"近一月",value : "-1m"}
//    {name:"近一年",value : "-12m"}
//    {name:"季度",value : "seasons"}

//class的前缀
const CLASS_PREFIX = 'user-opening-daterange';
//日期范围不对的时候，闪烁的样式
const SPLASH_CLASS = 'user-opening-daterange-splash';
//最近xxx时间正则表达式
const lastRangeRegex = /\-(\d+)([mw])/;
//星期、月份对应关系
const momentMap = {
    'w': 'weeks',
    'm': 'months'
};
//空函数
function noop(){}
/**
 * 用户开通周期
 *
 */

class DateSelector extends React.Component{
    constructor(props){
        super(props);
        var menu_lists = [];

        React.Children.forEach(props.children , function(item) {
            var value = item.props.value;
            var label = item.props.children;
            menu_lists.push({
                name: label,
                value: value
            });
        });
        this.componentId = _.uniqueId('DateSelector');

        let start_time, end_time;

        //如果是今天、昨天、本周、本月，特殊处理
        if(props.range === 'all') {
            start_time = '';
            end_time = '';
        } else if(lastRangeRegex.test(props.range)) {
            var timeObj = Utils.getLastTime(props.range);
            start_time = timeObj.start_time;
            end_time = timeObj.end_time;
        } else if(/today|yesterday|thisweek|lastweek|thismonth|lastmonth/.test(props.range)) {
            var timeObj;
            switch(props.range) {
                case 'today':
                    timeObj = Utils.getTodayTime();
                    break;
                case 'yesterday':
                    timeObj = Utils.getYesterdayTime();
                    break;
                case 'thisweek':
                    timeObj = Utils.getThisWeekTime();
                    break;
                case 'lastweek':
                    timeObj = Utils.getLastWeekTime();
                    break;
                case 'thismonth':
                    timeObj = Utils.getThisMonthTime();
                    break;
                case 'lastmonth':
                    timeObj = Utils.getLastMonthTime();
                    break;
            }
            start_time = timeObj.start_time;
            end_time = timeObj.end_time;
        } else {
        //如果是定位到天的时间
            if(props.start_time || props.start_time === 0) {
                start_time = Utils.getDateStr(props.start_time);
            } else {
                start_time = Utils.getDateStr(new Date().getTime());
            }
            if(props.end_time || props.end_time === 0) {
                end_time = Utils.getDateStr(props.end_time);
            } else {
                if(props.range === '1w') {
                    end_time = Utils.getDateStr(moment().add(6, 'days').endOf('day').valueOf());
                } else if(props.range === '0.5m') {
                    end_time = Utils.getDateStr(moment().add(14, 'days').endOf('day').valueOf());
                } else if(/^\d+m$/.test(props.range)){
                    var num = props.range.replace(/m$/,'');
                    end_time = Utils.getDateStr(moment().add(num , 'month').subtract(1, 'day').endOf('day').valueOf());
                }
            }
        }
        this.state = {
            menu_lists: menu_lists,
            start_time: start_time,
            end_time: end_time,
            //时间范围
            range: props.range,
            //季度
            quarter: '',
            //是否显示日历
            showCalendar: false,
            //显示季度日历
            showQuarterCalendar: false,
            //箭头指向那个日历
            calendarArrow: 'start_time',
            //要显示的季度
            displayQuarterList: QUARTER_CHINESE_TEXT_LIST
        };
    }
    componentDidUpdate(prevProps , prevState) {
        if(!prevState.showCalendar && this.state.showCalendar) {
            $('body').off('mousedown' , this.bodyClickFunc);
            this.bodyClickFunc = null;
        }
    }
    componentWillReceiveProps(nextProps){
        const newState = {};
        if(this.props.range !== nextProps.range) {
            newState.range = nextProps.range;
        }
        if(this.props.start_time !== nextProps.start_time) {
            newState.start_time = Utils.getDateStr(nextProps.start_time);
        }
        if(this.props.end_time !== nextProps.end_time) {
            newState.end_time = Utils.getDateStr(nextProps.end_time);
        }
        if(!_.isEmpty(newState)) {
            this.setState(newState);
        }
    }
    componentWillUnmount() {
        if(this.bodyClickFunc) {
            $('body').off('mousedown' , this.bodyClickFunc);
        }
    }
    //调用this.props.onSelect，将时间传递出去
    transportOuter(start_time,end_time,range) {
        var label;
        var target = _.find(this.state.menu_lists , function(obj) {
            return obj.value === range;
        });
        if(target) {
            label = target.name;
        }
        if(range === 'all') {
            this.props.onSelect('','',range,label);
        } else {
            const start_time_millis = Utils.getMilliseconds(start_time) + '';
            let end_time_millis = '0';
            if(range !== 'forever') {
                end_time_millis = Utils.getMilliseconds(end_time,true) + '';
            }
            this.props.onSelect(start_time_millis,end_time_millis,range,label);
        }
    }
    onRangeSelect(result) {
        const range = result.key;
        const lastRange = this.state.range;
        //重新选择了范围，就要隐藏日历
        this.setState({
            showCalendar: false
        });
        let calculateRange = range;
        //重新计算开始时间、结束时间
        let resetStartEndDate = () => {
            let start_time_moment;
            //对this.state.end_time是"0"的情况做一下处理，否则会报一个moment警告
            const endTime = isNaN(this.state.end_time) ? this.state.end_time : parseInt(this.state.end_time);
            //是否需要过期重新计算
            const needRecalculate = this.props.expiredRecalculate && moment(endTime, DATE_FORMAT).isBefore(moment());
            //如果开始时间是0，或需要过期重新计算，则使用当前时间
            if(this.state.start_time === 0 || this.state.start_time === '0' || needRecalculate) {
                start_time_moment = moment();
            } else {
                start_time_moment = moment(this.state.start_time,DATE_FORMAT);
            }
            const start_time = start_time_moment.format(DATE_FORMAT);
            //结束时间是开始时间+月份
            let end_time;
            //结束时间判断，特殊处理1周
            if(calculateRange === '1w') {
                end_time = start_time_moment.add(6, 'days').endOf('day').format(DATE_FORMAT);
            } else if(calculateRange === '0.5m') {
                end_time = start_time_moment.add(14, 'days').endOf('day').format(DATE_FORMAT);
            } else if(/^\d+m$/.test(calculateRange)) {
                var num = calculateRange.replace(/m$/,'');
                end_time = start_time_moment.add(num , 'month').subtract(1, 'days').endOf('day').format(DATE_FORMAT);
            }
            //隐藏日历
            const showCalendar = false;
            //更改start_time,end_time,range
            this.setState({start_time,end_time,range,showCalendar});
            //向外层调用，将时间传出去
            this.transportOuter(start_time,end_time,range);
        };
        if(range === 'quarter') {
            this.setState({
                range: range
            });
            var quarter = this.state.quarter || 1;
            var year = new Date().getFullYear();
            var displayQuarterList = this.getDisplayQuarterList(year);
            var timeInfo = Utils.getQuarterTime(quarter , year);
            this.setState({
                quarter: quarter,
                start_time: timeInfo.start_time,
                end_time: timeInfo.end_time,
                displayQuarterList: displayQuarterList
            });
            this.transportOuter(timeInfo.start_time , timeInfo.end_time , range);
        } else if(range === 'all') {
            var start_time = '';
            var end_time = '';
            this.setState({
                range: range,
                start_time: start_time,
                end_time: end_time
            });
            this.transportOuter(start_time,end_time,range);
        }
        //今天特殊处理
        //昨天特殊处理
        //本周特殊处理
        //本月特殊处理
        //上月特殊处理
        else if(/today|yesterday|thisweek|lastweek|thismonth|lastmonth/.test(range)) {
            var timeObj;
            if(range === 'today') {
                timeObj = Utils.getTodayTime();
            } else if(range === 'yesterday') {
                timeObj = Utils.getYesterdayTime();
            } else if(range === 'thisweek') {
                timeObj = Utils.getThisWeekTime();
            } else if(range === 'lastweek') {
                timeObj = Utils.getLastWeekTime();
            } else if(range === 'lastmonth') {
                timeObj = Utils.getLastMonthTime();
            } else {
                timeObj = Utils.getThisMonthTime();
            }
            this.setState({
                range: range,
                start_time: timeObj.start_time,
                end_time: timeObj.end_time
            });
            this.transportOuter(timeObj.start_time,timeObj.end_time,range);
            //自定义特殊处理
        } else if(range === 'custom') {
            if(lastRange === 'all') {
                this.setState({
                    range: range
                });
                return;
            } else
            //上次是永久，按12个月计算开始、结束时间
            if(lastRange === 'forever') {
                calculateRange = '12m';
                return resetStartEndDate();
            } else {
                const showCalendar = false;
                //上次不是永久，只改一下range
                return this.setState({range,showCalendar});
            }
        } else if(range === 'forever') {
            var end_time = '0';
            this.transportOuter(this.state.start_time , end_time , range);
            return this.setState({end_time,range});
        } else if(lastRangeRegex.test(range)) {
            var timeObj = Utils.getLastTime(range);
            var start_time = timeObj.start_time;
            var end_time = timeObj.end_time;
            this.setState({
                start_time: start_time,
                end_time: end_time,
                range: range
            });
            this.transportOuter(start_time,end_time,range);
        } else {
            return resetStartEndDate();
        }
    }
    renderMenus() {
        const menuLists = this.state.menu_lists.map((item) => {
            const cls = classNames({
                active: item.value === this.state.range
            });
            return (
                <MenuItem
                    key={item.value}
                    className={cls}
                    style={{width: MENU_WIDTH}}
                >
                    {item.name}
                </MenuItem>
            );
        });
        return (
            <Menu
                prefixCls="ant-menu"
                onClick={this.onRangeSelect.bind(this)}
                className={CLASS_PREFIX + '-menu'}>
                {menuLists}
            </Menu>
        );
    }
    getRangeDisplayText(){
        const range = this.state.range;
        const target = _.find(this.state.menu_lists , (obj) => {
            return obj.value === range;
        });
        if(target) {
            return target.name;
        }
        return '';
    }
    getStartTimeDisplayText() {
        if(this.state.start_time === '0') {
            return Intl.get('data.selector.none', '无');
        }
        return this.state.start_time;
    }
    getEndTimeDisplayText() {
        if(this.state.end_time === '0'){
            return Intl.get('data.selector.none', '无');
        }
        return this.state.end_time;
    }
    //单个calendar更换时间
    onCalendarOK(which , time) {
        if(which === 'start_time') {
            var start_time_moment = moment(time);
            var start_time = start_time_moment.format(DATE_FORMAT);
            let end_time = '0';
            if(this.state.range === 'custom') {
                end_time = this.state.end_time;
                if(end_time) {
                    var end_time_moment = moment(this.state.end_time , DATE_FORMAT);
                    //如果开始时间大于结束时间，做动画
                    if(start_time_moment.isAfter(end_time_moment)) {
                        start_time = end_time_moment.format(DATE_FORMAT);
                        $(this.refs.start_time_span).addClass(SPLASH_CLASS);
                        setTimeout(() => {
                            $(this.refs.start_time_span).removeClass(SPLASH_CLASS);
                        },1000);
                    }
                }
            } else {
                if(this.state.range === '1w') {
                    end_time = start_time_moment.add(6 , 'days').endOf('day').format(DATE_FORMAT);
                } else if(this.state.range === '0.5m') {
                    end_time = start_time_moment.add(14, 'days').endOf('day').format(DATE_FORMAT);
                }else if(lastRangeRegex.test(this.state.range)) {
                    var result = lastRangeRegex.exec(this.state.range);
                    var unit = momentMap[result[2]];
                    end_time = start_time_moment.add(result[1],unit).format(DATE_FORMAT);
                }else if(this.state.range !== 'forever'){
                    if(/^\d+m$/.test(this.state.range)) {
                        var num = this.state.range.replace(/m$/ , '');
                        end_time = start_time_moment.add(num , 'month').subtract(1, 'days').endOf('day').format(DATE_FORMAT);
                    }
                }
            }
            const showCalendar = false;
            this.setState({start_time,end_time,showCalendar});
            this.transportOuter(start_time,end_time,this.state.range);
        } else if(which === 'end_time') {
            var end_time_moment = moment(time);
            var end_time = end_time_moment.format(DATE_FORMAT);
            let start_time;
            if(this.state.range === 'custom') {
                start_time = this.state.start_time;
                if(start_time) {
                    var start_time_moment = moment(this.state.start_time , DATE_FORMAT);
                    //如果开始时间大于结束时间，做动画
                    if(end_time_moment.isBefore(start_time_moment)) {
                        end_time = start_time_moment.format(DATE_FORMAT);
                        $(this.refs.end_time_span).addClass(SPLASH_CLASS);
                        setTimeout(() => {
                            $(this.refs.end_time_span).removeClass(SPLASH_CLASS);
                        },1000);
                    }
                }
            } else {
                if(this.state.range === '1w') {
                    start_time = end_time_moment.subtract(6 , 'days').startOf('day').format(DATE_FORMAT);
                } else if(this.state.range === '0.5m') {
                    start_time = end_time_moment.subtract(14 , 'days').startOf('day').format(DATE_FORMAT);
                } else if(lastRangeRegex.test(this.state.range)) {
                    var result = lastRangeRegex.exec(this.state.range);
                    var unit = momentMap[result[2]];
                    start_time = end_time_moment.subtract(result[1] , unit).format(DATE_FORMAT);
                }else if(this.state.range !== 'forever'){
                    if(/^\d+m$/.test(this.state.range)) {
                        var num = this.state.range.replace(/m$/ , '');
                        start_time = end_time_moment.subtract(num , 'month').add(1,'day').startOf('day').format(DATE_FORMAT);
                    }
                }
            }
            const showCalendar = false;
            this.setState({start_time,end_time,showCalendar});
            this.transportOuter(start_time,end_time,this.state.range);
        }
    }
    //季度更换年
    onCalendarYearOK(time) {
        var year = time.getFullYear();
        var timeInfo = Utils.getQuarterTime(this.state.quarter , year);
        var displayQuarterList = this.getDisplayQuarterList(year);
        //如果上次选中的quarter在新的quarter里没有，则设置quarter为1
        var quarter = this.state.quarter;
        if(quarter > displayQuarterList.length) {
            quarter = 1;
        }
        this.setState({
            quarter: quarter,
            start_time: timeInfo.start_time,
            end_time: timeInfo.end_time,
            showQuarterCalendar: false,
            displayQuarterList: displayQuarterList
        });
        this.transportOuter(timeInfo.start_time , timeInfo.end_time , 'quarter');
    }
    //双calendar更换时间
    onRangeCalendarOK(which,time) {
        var time_moment = moment(time);
        var time_text = time_moment.format(DATE_FORMAT);
        //判断开始、结束时间
        if(which === 'start_time') {
            var end_time_moment = moment(this.state.end_time , DATE_FORMAT);
            //如果开始时间大于结束时间，做动画
            if(time_moment.isAfter(end_time_moment)) {
                time_text = end_time_moment.format(DATE_FORMAT);
                $(this.refs.start_time_span).addClass(SPLASH_CLASS);
                setTimeout(() => {
                    $(this.refs.start_time_span).removeClass(SPLASH_CLASS);
                },1000);
            }
            this.setState({start_time: time_text , showCalendar: false});
            this.transportOuter(time_text,this.state.end_time,this.state.range);
        } else if(which === 'end_time') {
            var start_time_moment = moment(this.state.start_time , DATE_FORMAT);
            //如果开始时间大于结束时间，做动画
            if(time_moment.isBefore(start_time_moment)) {
                time_text = start_time_moment.format(DATE_FORMAT);
                $(this.refs.end_time_span).addClass(SPLASH_CLASS);
                setTimeout(() => {
                    $(this.refs.end_time_span).removeClass(SPLASH_CLASS);
                },1000);
            }
            this.setState({end_time: time_text , showCalendar: false});
            this.transportOuter(this.state.start_time,time_text,this.state.range);
        }
    }
    checkClickCalendarLayer(event) {
        const target = event.target;
        if(!$(target).closest('.' + CLASS_PREFIX).length && !$(target).closest('.date_text').length) {
            this.setState({
                showCalendar: false
            });
        }
    }
    checkClickCalendarQuarterLayer(event) {
        const target = event.target;
        if(!$(target).closest('.' + CLASS_PREFIX).length && !$(target).closest('.date_text').length) {
            this.setState({
                showQuarterCalendar: false
            });
        }
    }
    showCalendar(which,event) {
        if(/(today|yesterday|thisweek|lastweek|thismonth|lastmonth|all|\-\d+[wm])/.test(this.state.range)) {
            return;
        }
        if(which === 'end_time' && this.state.range === 'forever') {
            if(this.state.showCalendar) {
                this.setState({
                    showCalendar: false
                });
            }
            return;
        }

        let showCalendarAfterSetState = !this.state.showCalendar;
        if(this.state.showCalendar && which !== this.state.calendarArrow) {
            showCalendarAfterSetState = true;
        }
        this.setState({
            showCalendar: showCalendarAfterSetState,
            calendarArrow: which
        } , () => {
            if(showCalendarAfterSetState) {
                $('body').on('mousedown' , this.bodyClickFunc = this.checkClickCalendarLayer.bind(this));
            }
            //当datepicker恢复原位，基于原始位置计算
            var $datepickers = $('.datepicker-inline',this.refs.datepicker_wrap);
            $datepickers.css('left',0);
            //保留句柄，以便当日历超出窗口时，重新调整其位置
            var $datepicker,$arrow;
            //根据dom做定位
            if(which === 'start_time') {
                $datepicker = $('.datepicker:eq(0)',this.refs.datepicker_wrap);
                var $left_span = $(event.target);
                $arrow = $datepicker.find('>.arrow');
                var target_left_pos = Math.floor(($left_span.outerWidth()) / 2) - $arrow.outerWidth();
                $arrow.css('left',target_left_pos);
            } else {
                $datepicker = $('.datepicker:eq(1)',this.refs.datepicker_wrap);
                var $right_span = $(event.target);
                $arrow = $datepicker.find('>.arrow');
                var target_left_pos = $right_span.outerWidth() * 1.5 - 0.5 * $arrow.outerWidth();
                $arrow.css('left',target_left_pos);
            }
            //检查如果datepicker在屏幕之外，则向左移动datepicker，同时移动箭头样式
            var datepicker_pos = $datepicker.offset();
            var datepicker_width = $datepicker.outerWidth();
            var window_width = $(window).width();
            var page_scroll_left = $(document).scrollLeft();
            if((datepicker_pos.left + datepicker_width) > (window_width + page_scroll_left + 20)) {
                var over_width = Math.floor(datepicker_pos.left + datepicker_width - window_width - page_scroll_left + 20);
                var date_origin_left = parseInt($datepicker.css('left')) || 0;
                $datepicker.css('left' , (date_origin_left - over_width) + 'px');
                var arrow_origin_left = parseInt($arrow.css('left')) || 0;
                $arrow.css('left' , arrow_origin_left + over_width);
            }
        });
    }
    renderCalendar() {
        var cls = classNames({
            arrow_start_time: this.state.calendarArrow === 'start_time',
            arrow_end_time: this.state.calendarArrow === 'end_time'
        });
        var disableDateBeforeToday = this.props.disableDateBeforeToday;
        var disableDateAfterToday = this.props.disableDateAfterToday;
        let disableDateBeforeRange = this.props.disableDateBeforeRange;
        return (
            <div ref="datepicker_wrap">
                <div className={cls} style={{display: this.state.showCalendar ? 'block' : 'none'}}>
                    <BootstrapDatepicker
                        className="single_datepicker"
                        value={moment(this.state.start_time , DATE_FORMAT).toDate()}
                        onChange={this.onCalendarOK.bind(this , 'start_time')}
                        disableDateBeforeToday={disableDateBeforeToday}
                        disableDateAfterToday={disableDateAfterToday}
                    />
                    <BootstrapDatepicker
                        className="single_datepicker"
                        value={moment(this.state.end_time , DATE_FORMAT).toDate()}
                        onChange={this.onCalendarOK.bind(this , 'end_time')}
                        disableDateBeforeRange={disableDateBeforeRange}
                        disableDateAfterToday={disableDateAfterToday}
                        selectRange={this.state.range}
                    />
                </div>
                <div style={{display: this.state.showQuarterCalendar ? 'block' : 'none'}}>
                    <BootstrapDatepicker
                        className="single_datepicker"
                        onlyYear={true}
                        value={moment(this.state.start_time , DATE_FORMAT).toDate()}
                        onChange={this.onCalendarYearOK.bind(this)}
                        disableDateBeforeToday={disableDateBeforeToday}
                        disableDateAfterToday={disableDateAfterToday}
                    />
                </div>
            </div>
        );
    }
    getDisplayDateText() {
        var timeObj;
        if(this.state.range === 'thisweek') {
            timeObj = Utils.getThisWeekTime();
        } else if (this.state.range === 'today'){
            timeObj = Utils.getTodayTime();
        } else if(this.state.range === 'yesterday') {
            timeObj = Utils.getYesterdayTime();
        } else if(this.state.range === 'lastweek') {
            timeObj = Utils.getLastWeekTime();
        } else if(this.state.range === 'lastmonth') {
            timeObj = Utils.getLastMonthTime();
        }else {
            timeObj = Utils.getThisMonthTime();
        }
        if(this.state.range === 'today') {
            return {
                start_time: timeObj.start_time,
                end_time: ''
            };
        }
        if(/yesterday|thisweek|lastweek|thismonth|lastmonth/.test(this.state.range)) {
            return {
                start_time: timeObj.start_time,
                end_time: timeObj.end_time
            };
        }
        return {
            start_time: this.getStartTimeDisplayText(),
            end_time: this.getEndTimeDisplayText()
        };
    }

    renderDisplayDateText() {
        var timeObj = this.getDisplayDateText();
        if(this.state.range === 'quarter') {
            return (
                <span>{timeObj.start_time.slice(0,4)}</span>
            );
        }
        if(this.state.range === 'today') {
            return (
                <span className="date_text">
                    <span ref="start_time_span">
                        {timeObj.start_time}
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
    //显示选择“年份”的日历
    showYearCalendar() {
        var showQuarterCalendar = !this.state.showQuarterCalendar;
        this.setState({
            showQuarterCalendar: showQuarterCalendar
        } , () => {
            if(showQuarterCalendar) {
                $('body').on('mousedown' , this.bodyClickFunc = this.checkClickCalendarQuarterLayer.bind(this));
            }
        });
    }
    //选中某个季度
    onQuarterSelect(obj) {
        var quarter = parseInt(obj.key);
        var year = new Date().getFullYear();
        if(this.state.start_time) {
            var start_moment = moment(this.state.start_time , DATE_FORMAT);
            year = start_moment.year();
        }
        var timeInfo = Utils.getQuarterTime(quarter,year);
        this.setState({
            quarter: quarter,
            start_time: timeInfo.start_time,
            end_time: timeInfo.end_time
        });
        this.transportOuter(timeInfo.start_time , timeInfo.end_time , 'quarter');
    }
    //获取第几季度
    getQuarterDisplayText() {
        return `第${QUARTER_CHINESE_TEXT_LIST[this.state.quarter - 1]}季度`;
    }
    //计算要显示的季度
    getDisplayQuarterList(year) {
        if(!this.props.disableAfterToday || new Date().getFullYear() > year) {
            return QUARTER_CHINESE_TEXT_LIST;
        } else {
            return QUARTER_CHINESE_TEXT_LIST.filter(function(text,num) {
                var startTime = moment().year(year).quarter(num + 1).startOf('quarter').toDate().getTime();
                var now = new Date().getTime();
                if(now >= startTime) {
                    return true;
                }
            });
        }
    }
    //渲染季度菜单
    renderQuarterMenu() {
        if(this.state.range !== 'quarter') {
            return null;
        }
        var menu = (<Menu
            prefixCls="ant-menu"
            onClick={this.onQuarterSelect.bind(this)}
            className={CLASS_PREFIX + '-menu'}>
            {
                this.state.displayQuarterList.map((text,num) => {
                    var cls = classNames({
                        active: (num + 1) === this.state.quarter
                    });
                    return (
                        <MenuItem
                            key={num + 1}
                            className={cls}
                        >
                                第{text}季度
                        </MenuItem>
                    );
                })
            }
        </Menu>);

        return (<Dropdown
            getPopupContainer={() => {return document.getElementById(this.componentId + '_quarter');}}
            overlay={menu}
            prefixCls="ant-dropdown">
            <div className="quarter_wrap" id={this.componentId + '_quarter'}>
                <span className="range_text">{this.getQuarterDisplayText()}</span>
                <em className="triangle"></em>
            </div>
        </Dropdown>);

    }
    render(){
        const props = this.props;
        const {start_time,end_time,range,onSelect,children,className,endTimeEndOfDay,getEndTimeTip,disableDateBeforeToday,disableDateBeforeRange,disableDateAfterToday,...restProps} = props;
        const cls = classNames(CLASS_PREFIX , className , CLASS_PREFIX + '_' + this.state.range);
        const menu = this.renderMenus();
        var timeObj = this.getDisplayDateText();
        var popover = null;
        if(this.props.getEndTimeTip && timeObj.end_time && timeObj.end_time !== '无') {
            var overlay = (
                <div style={{'whiteSpace': 'nowrap'}}>{this.props.getEndTimeTip(timeObj.end_time)}</div>
            );
            popover = (
                <Popover
                    content={overlay}
                >
                    <Icon type="question-circle-o" />
                </Popover>
            );
        }
        return (
            <div className={cls} {...restProps}>
                <div className="border_wrap">
                    <Dropdown
                        trigger={['click']}
                        getPopupContainer={() => {return document.getElementById(this.componentId + '_range');}}
                        overlay={menu}
                        prefixCls="ant-dropdown">
                        <div className="range_wrap" id={this.componentId + '_range'}>
                            <span className="range_text">{this.getRangeDisplayText()}</span>
                            <em className="triangle"></em>
                        </div>
                    </Dropdown>
                    <div className="date_text_wrap" ref="date_text_wrap">
                        {this.renderDisplayDateText()}
                        <Icon type="calendar" />
                        {popover}
                        <i className="click_left" onClick={this.showCalendar.bind(this , 'start_time')}></i>
                        <i className="click_right" onClick={this.showCalendar.bind(this , 'end_time')}></i>
                        <i className="click_year" onClick={this.showYearCalendar.bind(this)}></i>
                        {this.renderCalendar()}
                    </div>
                </div>
                {this.renderQuarterMenu()}
            </div>
        );
    }
}

/**
 * 获取默认属性
 */
function getDefaultProps(){
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
    //禁止选择今天之前的时间
    const disableDateBeforeToday = false;
    //禁止选择范围之前的时间
    const disableDateBeforeRange = false;
    //禁止选择今天之后的时间
    const disableDateAfterToday = false;
    return {start_time,end_time,range,onSelect,className,endTimeEndOfDay,getEndTimeTip,disableDateBeforeToday,disableDateBeforeRange,disableDateAfterToday};
}

//默认属性
DateSelector.defaultProps = getDefaultProps();
//属性类型
DateSelector.propTypes = {
    //开始时间  string(2016-07-08,1469761355214)   number(1469761355214)
    start_time: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
    //开始时间  string(2016-07-08,1469761355214)   number(1469761355214)
    end_time: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
    //区间  string(12,custom)   number(12)
    range: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
    //选中函数处理
    onSelect: PropTypes.func,
    //class名
    className: PropTypes.string,
    //是否结束时间为23:59:59
    endTimeEndOfDay: PropTypes.bool,
    //获取结束时间提示信息
    getEndTimeTip: PropTypes.func,
    //禁止选择今天之前的时间
    disableDateBeforeToday: PropTypes.bool,
    //禁止选择范围之前的时间
    disableDateBeforeRange: PropTypes.bool,
    //禁止选择今天之后的时间
    disableDateAfterToday: PropTypes.bool
};

/**
 *
 * <DateSelectorOption value="1m">1个月</DateSelectorOption>
 *
 */
class DateSelectorOption extends React.Component {
    static defaultProps = {
        value: ''
    };

    render() {
        return null;
    }
}

//添加option
DateSelector.Option = DateSelectorOption;

export default DateSelector;

