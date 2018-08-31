const PropTypes = require('prop-types');
/**
 * 时间线组件
 *
 * 使用方法：<TimeLine list="..." render="..." ... />
 *
 */

var React = require('react');
require('./style.less');

import { Timeline } from 'antd';
const classNames = require('classnames');

class TimeLine extends React.Component {
    static defaultProps = {
        //列表数据
        list: [],
        //是否按天分组
        groupByDay: false,
        //时间字段名
        timeField: '',
        //左侧是否用相对时间显示
        relativeDate: false,
        //渲染函数，根据回调返回的列表项数据，渲染列表项html
        render: function(item){return null;},
    };

    render() {
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
                                    if (relativeDate){
                                        dayStr = moment(curItemTime).fromNow();
                                    }else{
                                        dayStr = moment(curItemTime).format(oplateConsts.DATE_FORMAT);
                                    }

                                    dayJsx = (<div className="group-day">{dayStr}</div>);
                                }

                                //将当前项保存下来，以备下次循环中使用
                                prevItemDay = curItemDay;
                            }
                            const cls = classNames(this.props.className, {
                                'day-first-item': dayJsx
                            });
                            return (
                                <Timeline.Item key={index} dot={this.props.dot} className={cls}>
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
}

TimeLine.propTypes = {
    list: PropTypes.array,
    groupByDay: PropTypes.bool,
    relativeDate: PropTypes.bool,
    timeField: PropTypes.string,
    render: PropTypes.func,

};

module.exports = TimeLine;

