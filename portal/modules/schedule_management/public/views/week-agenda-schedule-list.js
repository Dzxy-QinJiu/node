/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/30.
 */
import {Row, Col} from 'antd';
import BigCalendar from 'react-big-calendar';
import dates from 'date-arithmetic';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
var classNames = require('classnames');
var scheduleManagementEmitter = require('PUB_DIR/sources/utils/emitters').scheduleManagementEmitter;
var startDate = [];
const CALENDAR_LAYOUT = {
    TOPANDBOTTOM: 110
};
var containToday = {
    flag: false
};
class WeekAgendaScheduleLists extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curCustomerId: this.props.curCustomerId,
            weekLists: this.props.weekLists,
            updateScrollBar: false,
            containToday: containToday.flag,// 今天所在的周  和today这两个状态共同判断给哪一天是今天，给今天加背景颜色
            today: this.switchToday(moment().format('dddd'))//今天是星期几
        };
    }

    switchToday(Week) {
        switch (Week) {
            case Intl.get('schedule.user.time.monday', '星期一'):
                Week = 'Mon';
                break;
            case Intl.get('schedule.user.time.tuesday', '星期二'):
                Week = 'Tus';
                break;
            case Intl.get('schedule.user.time.wednesday', '星期三'):
                Week = 'Wed';
                break;
            case Intl.get('schedule.user.time.thursday', '星期四'):
                Week = 'Thur';
                break;
            case Intl.get('schedule.user.time.friday', '星期五'):
                Week = 'Fri';
                break;
            case Intl.get('schedule.user.time.saturday', '星期六'):
                Week = 'Sat';
                break;
            case Intl.get('schedule.user.time.sunday', '星期日'):
                Week = 'Sun';
                break;
            default:
                break;
        }
        return Week;
    }

    componentDidMount() {
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE, this.setUpdateScrollBarFalse);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.weekLists !== this.state.weekLists) {
            this.setState({
                weekLists: nextProps.weekLists
            });
        }
        if (nextProps.curCustomerId !== this.state.curCustomerId){
            this.setState({
                curCustomerId: nextProps.curCustomerId
            });
        }
    }

    setUpdateScrollBarTrue = () => {
        this.setState({
            updateScrollBar: true
        });
    };
    setUpdateScrollBarFalse = () => {
        this.setState({
            updateScrollBar: false
        });
    };

    componentWillUnmount() {
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE, this.setUpdateScrollBarFalse);
    }

    //动画执行过程中渲染日程列表
    renderUpdateWeekSchedule() {
        var height = $(window).height() - CALENDAR_LAYOUT.TOPANDBOTTOM;
        return (
            <div className="schedule-items-content" style={{height: height}}>
                {this.renderScheduleTitle()}
                {this.renderWeekScheduleList()}
            </div>
        );
    }

    //动画执行完毕后渲染日程列表
    renderWeekSchedule() {
        var height = $(window).height() - CALENDAR_LAYOUT.TOPANDBOTTOM;
        return (
            <div className="schedule-items-content" style={{height: height}}>
                {this.renderScheduleTitle()}
                <GeminiScrollBar>
                    {this.renderWeekScheduleList()}
                </GeminiScrollBar>
            </div>
        );
    }

    renderScheduleTitle(){
        return (
            <div className="schedule-bg-content">
                {_.map(startDate, (item, key) => {
                    var cls = classNames('schedule-line-grid',
                        {'rbc-today': containToday.flag && key == this.state.today});
                    return (
                        <div className={cls}></div>
                    );
                })}
            </div>
        );
    }
    renderWeekScheduleList() {
        return (
            _.map(this.state.weekLists, (list, key) => {
                return (
                    <div className="event-container">
                        <div className="even-items-wrapper">
                            {list.length ? _.map(list, (item) => {
                                var cls = classNames('iconfont',
                                    {
                                        'icon-schedule-visit': item.type === 'visit',
                                        'icon-phone-busy': item.type === 'calls',
                                        'icon-schedule-other': item.type === 'other'
                                    });
                                var listCls = classNames('list-item', {
                                    'has-handled': item.status == 'handle',
                                    'selected-customer': item.customer_id == this.state.curCustomerId
                                });
                                return (
                                    <div className={listCls}
                                        onClick={this.props.showCustomerOrClueDetail.bind(this, item)}>
                                        <Row>
                                            <Col sm={4}>
                                                <i className={cls}></i>
                                            </Col>
                                            <Col sm={20}>
                                                <p className="topic-container">
                                                    {item.topic}
                                                </p>
                                            </Col>
                                        </Row>
                                    </div>
                                );
                            }) : <div className="no-data-container">
                                <i className="iconfont icon-no-schedule-list"></i>
                                <div>
                                    {Intl.get('schedule.no.item', '无待办')}
                                </div>
                            </div>}

                        </div>
                    </div>
                );
            })
        );
    }

    render() {
        return (
            <div className="week-list-container">
                <div className="week-list-content">
                    <div className="title-wrap">
                        {_.map(startDate, (item, key) => {
                            var cls = classNames('even-title',
                                {'rbc-today': containToday.flag && key === this.state.today});
                            var scheduleLength = _.get(this, `state.weekLists[${key}].length`);
                            return (
                                <div className={cls}>
                                    <div className="num-wrap">
                                        {item}{scheduleLength > 0 ? <div className="schedule-count">{scheduleLength}</div> : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {this.state.updateScrollBar ? this.renderUpdateWeekSchedule() : this.renderWeekSchedule()}
                </div>
            </div>
        );
    }
}

WeekAgendaScheduleLists.navigate = (date, action) => {
    //前一周，或者后一周
    switch (action) {
        case BigCalendar.Navigate.PREVIOUS:
            return dates.add(date, -1, 'week');

        case BigCalendar.Navigate.NEXT:
            return dates.add(date, 1, 'week');
        default:
            return date;
    }
};
WeekAgendaScheduleLists.title = (date, {formats, culture}) => {
    var startTime = moment(date).startOf('week').format(oplateConsts.DATE_MONTH_DAY_FORMAT);
    var endTime = moment(date).endOf('week').format(oplateConsts.DATE_MONTH_DAY_FORMAT);
    startDate = {
        'Mon': Intl.get('user.time.monday', '周一') + ' ' + startTime,
        'Tus': Intl.get('user.time.tuesday', '周二') + ' ' + moment(date).startOf('week').add(1, 'days').format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        'Wed': Intl.get('user.time.wednesday', '周三') + ' ' + moment(date).startOf('week').add(2, 'days').format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        'Thur': Intl.get('user.time.thursday', '周四') + ' ' + moment(date).startOf('week').add(3, 'days').format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        'Fri': Intl.get('user.time.friday', '周五') + ' ' + moment(date).startOf('week').add(4, 'days').format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        'Sat': Intl.get('user.time.saturday', '周六') + ' ' + moment(date).startOf('week').add(5, 'days').format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        'Sun': Intl.get('user.time.sunday', '周日') + ' ' + endTime,
    };
    //如果当前时间是在标题展示那一周的范围之内，就是今天所在的周
    if (moment().valueOf() >= moment(date).startOf('week').valueOf() && moment().valueOf() <= moment(date).endOf('week').valueOf()) {
        containToday.flag = true;
    } else {
        containToday.flag = false;
    }
    return `${startTime} ${Intl.get('contract.83', '至')} ${endTime}`;
};
WeekAgendaScheduleLists.defaultProps = {
    curCustomerId: '',
    showCustomerOrClueDetail: function() {}

};
export default WeekAgendaScheduleLists;