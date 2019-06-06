const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/4/28.
 * 新版时间线组件（新版客户详情的日程、跟进记录）
 * 使用方法：<TimeLine list="..." render="..." ... />
 */
require('./style.less');
import classNames from 'classnames';
class TimeLine extends React.Component {
    renderLine() {
        let classNameArr = ['time-line'];

        if (this.props.groupByDay) classNameArr.push('group-by-day');

        const className = classNameArr.join(' ');

        //前一条记录的时间值中的天
        let prevItemDay;

        //当前记录的时间值中的天
        let curItemDay;

        return (
            <div className={className}>
                {this.props.list.length ? (
                    <Timeline>
                        {this.props.list.map((item, index) => {
                            let dayJsx = null;
                            const groupByDay = this.props.groupByDay;
                            const timeField = this.props.timeField;
                            const relativeDate = this.props.relativeDate;

                            //如果需要按天分组且指明了时间字段，则处理按天分组逻辑
                            if (groupByDay && timeField) {
                                //该天是否第一次出现
                                let isDayFirstApper = false;
                                const curItemTime = item[timeField];
                                curItemDay = moment(curItemTime).startOf('day').valueOf();

                                //如果没有之前项，说明该天是第一次出现
                                if (!prevItemDay) {
                                    isDayFirstApper = true;
                                } else {
                                    //如果当前项的天和之前项的天不同，说明该天是第一次出现
                                    if (curItemDay !== prevItemDay) isDayFirstApper = true;
                                }

                                //如果该天是第一次出现且当前项时间有值，则显示该天
                                if (isDayFirstApper && curItemTime) {
                                    let dayStr = '';
                                    if (relativeDate) {
                                        dayStr = moment(curItemTime).fromNow();
                                    } else {
                                        dayStr = moment(curItemTime).format(oplateConsts.DATE_FORMAT);
                                    }

                                    dayJsx = (<div className="group-day">{dayStr}</div>);
                                }

                                //将当前项保存下来，以备下次循环中使用
                                prevItemDay = curItemDay;
                            }

                            return (
                                <Timeline.Item key={index} className={dayJsx ? 'day-first-item' : ''}>
                                    {dayJsx}
                                    {this.props.render(item)}
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                ) : null}
            </div>
        );
    }

    //获取第一次出现的年（天）
    getFirstAppearTimeStr(curItemTime, prevItemTime, formatTimeStr, relativeDate) {
        //该年(天)是否是第一次出现
        let isFirstApper = false;
        //如果没有之前项，说明该年是第一次出现
        if (!prevItemTime) {
            isFirstApper = true;
        } else {
            //如果当前项的年（天）和之前项的（天）不同，说明该年(天)是第一次出现
            if (curItemTime !== prevItemTime) isFirstApper = true;
        }
        let timeStr = '';
        if (isFirstApper && curItemTime) {
            if (relativeDate) {
                timeStr = moment(curItemTime).fromNow();
            } else {
                timeStr = moment(curItemTime).format(formatTimeStr);
            }
        }
        return timeStr;
    }

    render() {
        //前一条记录的时间值中的年
        let prevItemYear;
        //当前记录的时间值中的年
        let curItemYear;
        //前一条记录的时间值中的天
        let prevItemDay;
        //当前记录的时间值中的天
        let curItemDay;
        //时间线数据
        let dataList = this.props.list;
        const YEAR_TIME_FORMAT = oplateConsts.DATE_FORMAT;
        if (_.isArray(dataList) && dataList.length) {
            return (<div className="time-line">
                {dataList.map((item, index) => {
                    let dayStr = null, yearStr = null;
                    const groupByDay = this.props.groupByDay;
                    const groupByYear = this.props.groupByYear;
                    const timeField = this.props.timeField;
                    const relativeDate = this.props.relativeDate;
                    if (timeField && item[timeField]) {
                        //处理按天分组逻辑
                        if (groupByDay) {
                            curItemDay = moment(item[timeField]).startOf('day').valueOf();
                            dayStr = this.getFirstAppearTimeStr(curItemDay, prevItemDay, oplateConsts.DATE_MONTH_DAY_FORMAT, relativeDate);
                            //将当前项保存下来，以备下次循环中使用
                            prevItemDay = curItemDay;
                        }
                        //处理按年分组逻辑
                        if (groupByYear && !relativeDate) {
                            curItemYear = moment(item[timeField]).startOf('year').valueOf();
                            yearStr = this.getFirstAppearTimeStr(curItemYear, prevItemYear, YEAR_TIME_FORMAT, relativeDate);
                            //将当前项保存下来，以备下次循环中使用
                            prevItemYear = curItemYear;
                        }
                    }
                    //每天第一次出现的跟进记录，并且不是第一条时，展示分割线
                    let hasSplitLine = dayStr && index;
                    //今年的跟进记录的年不展示
                    let thisYear = moment().format(YEAR_TIME_FORMAT);
                    if (yearStr && yearStr.substr(0, 4) !== thisYear.substr(0, 4)) {
                        //每年的第一条跟进记录，展示完整的日期 YYYY-MM-DD
                        dayStr = moment(item[timeField]).format(YEAR_TIME_FORMAT);
                    }
                    return (
                        <div className="time-line-item" key={index}>
                            {dayStr ? <div className="group-day">{dayStr}</div> : null}
                            {_.isFunction(this.props.renderTimeLineItem) ? this.props.renderTimeLineItem(item, hasSplitLine) : null}
                        </div>
                    );
                })}
            </div>);
        } else {
            return null;
        }
    }
}
TimeLine.propTypes = {
    list: PropTypes.array,
    groupByDay: PropTypes.bool,
    groupByYear: PropTypes.bool,
    relativeDate: PropTypes.bool,
    timeField: PropTypes.string,
    renderTimeLineItem: PropTypes.func,

};
TimeLine.defaultProps = {
    //列表数据
    list: [],
    //是否按天分组
    groupByDay: false,
    //是否按年分组
    groupByYear: false,
    //时间字段名
    timeField: '',
    //左侧是否用相对时间显示
    relativeDate: false,
    //渲染函数，根据回调返回的列表项数据，渲染列表项html
    renderTimeLineItem: function(item, hasSplitLine) {
        return null;
    },
};

module.exports = TimeLine;
