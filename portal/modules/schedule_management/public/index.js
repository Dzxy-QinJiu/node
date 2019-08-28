/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/8.
 */
var React = require('react');
require('./css/index.less');
require('react-big-calendar/lib/css/react-big-calendar.css');
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import Trace from 'LIB_DIR/trace';
import { message, Radio } from 'antd';

var scheduleManagementStore = require('./store/schedule-management-store');
var scheduleManagementAction = require('./action/schedule-management-action');
var classNames = require('classnames');
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import { RightPanel } from 'CMP_DIR/rightPanel';
//天视图组件
import DayAgendaScheduleLists from './views/day-agenda-schedule-lists';
//周视图组件
import WeekAgendaScheduleLists from './views/week-agenda-schedule-list';
import ExpireScheduleLists from './views/expire-schedule-lists';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
// 引入联系计划表单
import CrmScheduleForm from 'MOD_DIR/crm/public/views/schedule/form';
import DetailCard from 'CMP_DIR/detail-card';

require('MOD_DIR/crm/public/css/schedule.less');
BigCalendar.momentLocalizer(moment);
const CALENDAR_LAYOUT = {
    TOPANDBOTTOM: 50
};
//自定义的点击日程数字后，日程列表的样式
import CustomEvent from './views/customer-event';
import { LESSONESECOND } from './utils/schedule-manage-utils';

class ScheduleManagement extends React.Component {
    state = {
        rightPanelIsShow: false,//是否展示右侧客户详情
        scheduleTableListTotal: 0,//日程列表是数量
        dayLists: [],//天视图所用的日程数据
        weekLists: [],//周视图所用的日程数据
        calendarLists: [],//右侧日程列表中的日程数据
        curViewName: 'day',//当前被按下的视图的名称
        curCustomerId: '',//查看详情的客户的id
        isShowAddToDo: false,// 是否显示右侧添加待办项
        scheduleLists: [],// 用于存放请求接口后返回的日程数据
        topicValue: 'customer', //添加待办项时选择主题为"客户"还是"线索"
        ...scheduleManagementStore.getState()
    };

    onStoreChange = () => {
        this.setState(scheduleManagementStore.getState());
    };

    componentDidMount() {
        scheduleManagementStore.listen(this.onStoreChange);
        //获取今天要展示的数据
        var startTime = moment().startOf('day').valueOf();
        var endTime = moment().endOf('day').valueOf();
        //获取日程数据 第一个参数是开始和结束时间 第二个参数是视图类型
        this.getAgendaData({start_time: startTime, end_time: endTime}, 'day');
    }

    //根据不同视图对日程数据进行处理
    handleScheduleData = (events, viewType) => {
        var _this = this;
        if (viewType === 'day') {
            this.setState({
                dayLists: events//日视图的数据
            });
        } else if (viewType === 'week') {
            var weekScheduleLists = {
                'Mon': [], 'Tus': [], 'Wed': [], 'Thur': [], 'Fri': [], 'Sat': [], 'Sun': []
            };
            _.map(events, (even) => {
                //对数据进行处理
                var Week = moment(even.start_time).format('dddd');
                switch (Week) {
                    case Intl.get('schedule.user.time.monday', '星期一'):
                        weekScheduleLists.Mon.push(even);
                        break;
                    case Intl.get('schedule.user.time.tuesday', '星期二'):
                        weekScheduleLists.Tus.push(even);
                        break;
                    case Intl.get('schedule.user.time.wednesday', '星期三'):
                        weekScheduleLists.Wed.push(even);
                        break;
                    case Intl.get('schedule.user.time.thursday', '星期四'):
                        weekScheduleLists.Thur.push(even);
                        break;
                    case Intl.get('schedule.user.time.friday', '星期五'):
                        weekScheduleLists.Fri.push(even);
                        break;
                    case Intl.get('schedule.user.time.saturday', '星期六'):
                        weekScheduleLists.Sat.push(even);
                        break;
                    case Intl.get('schedule.user.time.sunday', '星期日'):
                        weekScheduleLists.Sun.push(even);
                        break;
                    default:
                        break;
                }
            });
            this.setState({
                weekLists: weekScheduleLists//周视图的数据
            });
        } else {
            var monthEvent = [];
            //以日程所在天的零点为key，对数据按天进行分组
            var lists = _.groupBy(events, 'DayStart');
            for (var key in lists) {
                var item = lists[key];
                monthEvent.push(
                    {
                        'start': item[0].start,//某个日程的开始时间
                        'end': item[0].end,//某个日程的结束时间
                        'count': item.length > 99 ? '99+' : item.length,
                        'totalCustomerObj': item,
                        'showCustomerOrClueDetail': _this.showCustomerOrClueDetail,
                    }
                );
            }
            this.setState({
                calendarLists: monthEvent//月视图的数据
            });
        }
    };

    //获取日程列表的方法
    getAgendaData = (dateObj, viewType) => {
        var _this = this;
        var startTime = dateObj.start_time;
        var endTime = dateObj.end_time;
        var constObj = {
            page_size: 1000,//现在是把所有的日程都取出来，先写一个比较大的数字，后期可能会改成根据切换的视图类型选择不同的pagesize
            start_time: startTime,
            end_time: endTime,
            sort_field: 'start_time',//排序字段 按开始时间排序
            order: 'ascend',//排序方式，按升序排列
        };
        $.ajax({
            url: '/rest/get/schedule/list',
            dataType: 'json',
            type: 'get',
            data: constObj,
            success: function(data) {
                _this.setState({
                    scheduleLists: _.clone(data.list)
                });
                var events = _this.processForList(data.list);
                _this.handleScheduleData(events, viewType);
            },
            error: function(errorMsg) {
                message.error(Intl.get('schedule.get.schedule.list.failed', '获取日程管理列表失败'));
            }
        });
    };

    //把数据转换成组件需要的类型
    processForList = (originList) => {
        if (!_.isArray(originList)) return [];
        let list = _.clone(originList);
        for (let i = 0, len = list.length; i < len; i++) {
            let curSchedule = list[i];
            curSchedule.title = curSchedule.topic;
            //之前新建日程的时候，把全天的结束时间设置为23:59:59,所以比0点少1s
            if (curSchedule.end_time - curSchedule.start_time === LESSONESECOND) {
                curSchedule.allDay = true;
            }
            //The start date/time of the event. Must resolve to a JavaScript Date object.
            curSchedule.start = new Date(curSchedule.start_time);
            curSchedule.end = new Date(curSchedule.end_time);
            //给每条日程加一个DayStart字段，标识日程所在天的零点
            // 后期要以日程所在天的零点为key，以天为单位进行分组
            curSchedule.DayStart = moment(curSchedule.start_time).startOf('day').valueOf();
            curSchedule.description = curSchedule.content;
        }
        //状态是已完成的日程
        var hasFinishedList = _.filter(list, (item) => {
            return item.status === 'handle';
        });
        //未完成的日程
        var notFinishedList = _.filter(list, (item) => {
            return item.status === 'false';
        });
        //不是全天日程
        var notFulldaylist = _.filter(notFinishedList, (item) => {
            return !item.allDay;
        });
        //全天的日程
        var Fulldaylist = _.filter(notFinishedList, (item) => {
            return item.allDay;
        });
        //对日程数据进行排序，把全天的放在最上面，已完成的放在最下面
        var sortedList = _.flatten([Fulldaylist, notFulldaylist, hasFinishedList]);
        return sortedList;
    };

    componentWillUnmount() {
        scheduleManagementAction.setInitState();
        scheduleManagementStore.unlisten(this.onStoreChange);
    }

    //点击日程列表中的标记为完成
    handleScheduleItemStatus = (item, event) => {
        var target = event.target;
        const reqData = {
            id: item.id,
            status: 'handle',
        };
        scheduleManagementAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                //标记为完成后，把样式改成标记完成的样式
                $(target).closest('.list-item').removeClass('selected-customer').addClass('has-handled').find('button').hide();
            } else {
                message.error(resData || Intl.get('crm.failed.alert.todo.list', '修改待办事项状态失败'));
            }
        });
    };
    showCustomerOrClueDetail = (schedule, event) => {
        var showCustomerModal = _.get($('#customer-phone-status-content'),'length',0) > 0;
        var showClueModal = _.get($('#clue_phone_panel_wrap'),'length',0) > 0;
        if (schedule.lead_id){
            //关闭客户详情
            if (showCustomerModal){
                phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_PHONE_PANEL);
            }
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
                clue_params: {
                    currentId: schedule.lead_id,
                    hideRightPanel: this.hideRightPanel
                }
            });
        }else if (schedule.customer_id){
            //关闭线索详情
            if (showClueModal){
                phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_CLUE_PANEL);
            }
            this.showCustomerDetail(schedule.customer_id, event);
        }
    }
    //查看客户或者线索的详情
    showCustomerDetail = (customer_id, event) => {
        //如果点击到更改状态的按钮上，就不用展示客户详情了
        if (event && event.target.className === 'ant-btn ant-btn-primary') {
            return;
        }
        this.setState({
            curCustomerId: customer_id,
            rightPanelIsShow: true
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer_id,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.hideRightPanel
            }
        });
    };

    //关闭右侧客户详情
    hideRightPanel = () => {
        $('.list-item.selected-customer').removeClass('selected-customer');
        this.setState({
            curCustomerId: '',
            rightPanelIsShow: false
        });
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    // 显示待办项
    showAddToDo = () => {
        this.setState({
            isShowAddToDo: true
        });
    };

    // 处理待办项的关闭事件
    handleCancel = (e) => {
        e && e.preventDefault();
        this.setState({
            isShowAddToDo: false
        });
    };

    // 添加待办项
    handleScheduleAdd = (resData) => {
        // 判断当前的日程视图
        let view = this.state.curViewName;
        let scheduleLists = this.state.scheduleLists;
        let start_time = moment(resData.start_time).startOf('day');
        let end_time = moment(scheduleManagementStore.getViewDate()).startOf('day');
        let result;
        // 得判断待办项的日期是否在当前日程内
        if (view === 'day') {// 判断是否大于当天
            result = start_time.diff(end_time, 'days') > 0; // 大于当天
        } else if (view === 'week') {// 判断是否大于这一周
            result = start_time.diff(end_time, 'weeks') > 0;
        } else if (view === 'month') {// 判断是否大于这一月
            result = start_time.diff(end_time, 'months') > 0;
        }
        if(result) return; // 如果为true，说明不在当前日程内，不做其他操作
        scheduleLists.unshift(resData);//插入第一个
        this.setState({
            scheduleLists
        });
        // 调用日程处理函数对日程数据重新处理
        let events = this.processForList(scheduleLists);
        this.handleScheduleData(events, view);
    };

    // 待办项的topic修改时
    onTopicChange = (e) => {
        this.setState({
            topicValue: e.target.value
        });
    }
    // 渲染待办项
    renderCrmFormContent() {
        return (
            <div className="add-todo-container">
                <div className="todo-topic-switch">
                    <Radio.Group
                        size="large"
                        value={_.get(this.state, 'topicValue')}
                        onChange={this.onTopicChange}
                    >
                        <Radio.Button value="customer">{Intl.get('call.record.customer', '客户')}</Radio.Button>
                        <Radio.Button value="clue">{Intl.get('crm.sales.clue', '线索')}</Radio.Button>
                    </Radio.Group>
                </div>
                <DetailCard className='add-todo' content={
                    <CrmScheduleForm
                        isAddToDoClicked
                        handleScheduleAdd={this.handleScheduleAdd}
                        handleScheduleCancel={this.handleCancel}
                        topicValue={_.get(this.state, 'topicValue')}
                        currentSchedule={{}}/>
                }>
                </DetailCard>
            </div>
        );
    }

    renderModalContent = () => {
        return (
            <div>
                <p>{Intl.get('crm.4', '客户名称')}：{this.state.isEdittingItem.customer_name}</p>
                <p>{Intl.get('schedule.management.schedule.content', '日程内容')}：{this.state.isEdittingItem.content}</p>
            </div>
        );
    };
    //切换不同的视图
    changeView = (viewName) => {
        var preViewName = this.state.curViewName;
        this.state.curViewName = viewName;
        this.setState({
            curViewName: this.state.curViewName
        });
        //如果从月视图点击日期跳转到日视图，也会触发handleNavigateChange，先走changeView方法，这时候取到的日期是上一次的日期，取到的数据是上次的数据，走handleNavigateChange会取到正确的数据，但是不知道两次谁先返回，故会出现错误数据，所以在月视图跳转到日视图的时候，限制值发一次请求就可以了
        if (preViewName === 'month' && viewName === 'day') {
            return;
        }
        var dateObj = this.getDifTypeStartAndEnd(scheduleManagementStore.getViewDate(), viewName);
        //获取日程数据
        this.getAgendaData(dateObj, viewName);
        if (viewName === 'day') {
            Trace.traceEvent('日程界面管理', '点击day的日程筛选');
        } else if (viewName === 'week') {
            Trace.traceEvent('日程界面管理', '点击week的日程筛选');
        } else if (viewName === 'month') {
            Trace.traceEvent('日程界面管理', '点击month的日程筛选');
        }
    };

    //获取不同视图的开始和结束时间
    getDifTypeStartAndEnd = (date, view) => {
        var dateObj = {
            start_time: '',
            end_time: ''
        };
        switch (view) {
            case 'day':
                dateObj.start_time = moment(date).startOf('day').valueOf();
                dateObj.end_time = moment(date).endOf('day').valueOf();
                break;
            case 'week':
                dateObj.start_time = moment(date).startOf('week').valueOf();
                dateObj.end_time = moment(date).endOf('week').valueOf();
                break;
            case 'month':
                dateObj.start_time = moment(date).startOf('month').valueOf();
                dateObj.end_time = moment(date).endOf('month').valueOf();
                break;
        }
        return dateObj;
    };

    //点击 前，后翻页，点击月视图的日期跳转到日视图,或者返回今天的按钮
    handleNavigateChange = (date) => {
        var view = this.state.curViewName;
        //把当前展示视图的时间记录一下
        scheduleManagementStore.setViewDate(moment(date).valueOf());
        var dateObj = this.getDifTypeStartAndEnd(date, view);
        this.getAgendaData(dateObj, view);
        Trace.traceEvent('日程管理界面', '点击 前，后翻页图,或者返回今天的按钮');
    };

    render() {
        //右侧日程列表动画 如果没有超时日程，那么左侧日程列表不显示
        var calendarCls = classNames({
            'initial-calendar-panel': this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            'expand-calendar-panel': !this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            'nodata-left-expired-panel': !this.state.isShowExpiredPanel && this.state.isFirstLogin
        });
        var height = $(window).height() - CALENDAR_LAYOUT.TOPANDBOTTOM;
        //月视图顶部标题的日期样式
        var formats = {
            'monthHeaderFormat': (date, culture, localizer) => {
                return localizer.format(date, 'YYYY' + Intl.get('common.time.unit.year', '年') + 'MM' + Intl.get('common.time.unit.month', '月'), culture);
            }
        };
        let customerOfCurUser = this.state.customerOfCurUser;
        return (
            <div data-tracename="日程管理界面" className="schedule-list-content">
                <ExpireScheduleLists
                    updateExpiredPanelState={this.updateExpiredPanelState}
                    showCustomerOrClueDetail={this.showCustomerOrClueDetail}
                    showAddToDo={this.showAddToDo}
                />
                <div id="calendar-wrap" className={calendarCls} data-tracename="日程列表界面">
                    <div id="calendar" style={{height: height}}>
                        <BigCalendar
                            events={this.state.calendarLists}
                            onView={this.changeView}
                            defaultView="day"
                            views={{
                                month: true,
                                week: WeekAgendaScheduleLists,
                                day: DayAgendaScheduleLists,
                            }}
                            components={{event: CustomEvent}}
                            messages={{
                                month: Intl.get('common.time.unit.month', '月'),
                                week: Intl.get('common.time.unit.week', '周'),
                                today: Intl.get('schedule.back.to.today', '今'),
                                previous: '<',
                                next: '>',
                                allDay: Intl.get('crm.alert.full.day', '全天'),
                                day: Intl.get('common.time.unit.day', '天'),
                            }}
                            scheduleList={this.state.dayLists}//日视图数据
                            weekLists={this.state.weekLists}
                            handleScheduleItemStatus={this.handleScheduleItemStatus}
                            showCustomerOrClueDetail={this.showCustomerOrClueDetail}
                            onNavigate={this.handleNavigateChange}
                            curCustomerId={this.state.curCustomerId}
                            formats={formats}
                        />
                    </div>
                </div>
                {/*添加待办项*/}
                {this.state.isShowAddToDo ? (
                    <RightPanelModal
                        className="todo-add-container"
                        isShowMadal={true}
                        isShowCloseBtn={true}
                        onClosePanel={this.handleCancel.bind(this)}
                        title={Intl.get('shedule.list.add.todo', '添加待办')}
                        content={this.renderCrmFormContent()}
                        dataTracename='添加待办项'/>) : null}
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    {this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel>
            </div>
        );
    }
}

module.exports = ScheduleManagement;
