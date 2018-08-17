/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/14.
 */
import {Row, Col, Button, Icon, Popover,message} from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import dates from 'date-arithmetic';
import BigCalendar from 'react-big-calendar';
var classNames = require('classnames');
import userData from 'PUB_DIR/sources/user-data';
var user_id = userData.getUserData().user_id;
import timeUtil from 'PUB_DIR/sources/utils/time-format-util';
var scheduleManagementStore = require('../store/schedule-management-store');
//执行动画完毕后的时间
const LAY_OUT = {
    SCHEDULE_CONTENT_HEIGHT: 600
};
var curWeek = '';//今天所在的周
var scheduleManagementEmitter = require('PUB_DIR/sources/utils/emitters').scheduleManagementEmitter;
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import Trace from 'LIB_DIR/trace';
import {handleCallOutResult} from 'PUB_DIR/sources/utils/get-common-data-util';
import {isEqualArray} from 'LIB_DIR/func';
class DayAgendaScheduleLists extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curCustomerId: this.props.curCustomerId,
            scheduleList: this.props.scheduleList,
            updateScrollBar: false,
        };
    }

    componentDidMount() {
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE, this.setUpdateScrollBarFalse);
        this.getUserPhoneNumber();
        //鼠标移入的时候，加上背景颜色
        $('#content-block').on('mouseenter', '.list-item', (e) => {
            if ($('.list-item.hover-item').length){
                $('.list-item.hover-item').removeClass('hover-item');
            }
            $(e.target).closest('.list-item').addClass('hover-item');
        });
        //鼠标移出的时候，如果有popover还在显示，就不能去掉标识背景颜色的类，如果没有popover显示，才去掉这个类
        $('#content-block').on('mouseleave','.schedule-items-content',(e) => {
            //调用popover隐藏方法比调用此方法慢，所以要加个延时
            setTimeout(() => {
                if ($('.ant-popover:not(.ant-popover-hidden)').length){
                    return;
                }else{
                    if ($('.list-item.hover-item').length){
                        $('.list-item.hover-item').removeClass('hover-item');
                    }
                }
            },1000);
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.scheduleList && !isEqualArray(nextProps.scheduleList, this.state.scheduleList)) {
            this.setState({
                scheduleList: nextProps.scheduleList
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
    renderUpdateDaySchedule() {
        var divHeight = LAY_OUT.SCHEDULE_CONTENT_HEIGHT;
        return (
            <div className="schedule-items-content" style={{height: divHeight}}>
                {this.renderDayScheduleList()}
            </div>
        );
    }
    //动画执行完毕后渲染日程列表
    renderDaySchedule() {
        var divHeight = LAY_OUT.SCHEDULE_CONTENT_HEIGHT;
        return (
            <div className="schedule-items-content" style={{height: divHeight}}>
                <GeminiScrollbar>
                    {this.renderDayScheduleList()}
                </GeminiScrollbar>
            </div>
        );
    }

    //获取用户的坐席号
    getUserPhoneNumber() {
        let member_id = userData.getUserData().user_id;
        crmAjax.getUserPhoneNumber(member_id).then((result) => {
            if (result.phone_order) {
                this.setState({
                    callNumber: result.phone_order
                });
            }
        }, (errMsg) => {
            this.setState({
                errMsg: errMsg || Intl.get('crm.get.phone.failed', '获取座机号失败!')
            });
        });
    }

    handleClickCallOut = (phoneNumber, contactName, item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.column-contact-way'), '拨打电话');
        handleCallOutResult({
            errorMsg: this.state.errMsg,//获取坐席号失败的错误提示
            callNumber: this.state.callNumber,//坐席号
            contactName: contactName,//联系人姓名
            phoneNumber: phoneNumber,//拨打的电话
        });
    };
    //联系人和联系电话
    renderPopoverContent(item){
        return (
            <div className="contacts-containers">
                {_.map(item.contacts,(contact) => {
                    var cls = classNames('contacts-item',
                        {'def-contact-item': contact.def_contancts === 'true'});
                    return (
                        <div className={cls}>
                            <div className="contacts-name-content">
                                <i className="iconfont icon-contact"></i>
                                {contact.name}
                            </div>
                            <div className="contacts-phone-content" data-tracename="联系人电话列表">
                                {_.map(contact.phone, (phone) => {
                                    return (
                                        <div className="phone-item">
                                            {phone}
                                            <Button size="small" onClick={this.handleClickCallOut.bind(this, phone, contact.name,item)} data-tracename="拨打电话">
                                                {Intl.get('schedule.call.out','拨打')}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
    //渲染日程列表样式
    renderDayScheduleList() {
        return (
            _.map(this.state.scheduleList, (item, index) => {
                var listCls = classNames('list-item', {
                    'has-handled': item.status === 'handle',
                    'selected-customer': item.customer_id === this.state.curCustomerId
                });
                var itemCls = classNames('list-item-content', {});
                var iconFontCls = classNames('iconfont', {
                    'icon-phone-busy': item.type === 'calls',
                    'icon-schedule-visit': item.type === 'visit',
                    'icon-schedule-other': item.type === 'other',
                });
                var content = item.status === 'handle' ? Intl.get('schedule.has.finished', '已完成') : (
                    item.allDay ? Intl.get('crm.alert.full.day', '全天') : moment(item.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) + '-' + moment(item.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)
                );
                var customerContent = this.renderPopoverContent(item);
                return (
                    <div className={listCls} onClick={this.props.showCustomerDetail.bind(this, item.customer_id)}
                        data-tracename="日程列表">
                        <div className={itemCls}>
                            <Row>
                                <Col sm={4}>
                                    <p className="schedule-time-range">{content}</p>
                                    <span className="hidden record-id">{item.id}</span>
                                </Col>
                                <Col sm={9}>
                                    {item.contacts ? <Popover content={customerContent} placement="bottom">
                                        <div className="schedule-customer-name">
                                            <i className={iconFontCls}></i>
                                            {item.customer_name || item.topic}
                                        </div>
                                    </Popover> :
                                        <div className="schedule-customer-name">
                                            <i className={iconFontCls}></i>
                                            {item.customer_name || item.topic}
                                        </div>}
                                    <span className="hidden record-id">{item.id}</span>
                                </Col>
                                <Col sm={10}>
                                    <div className="schedule-content-wrap">
                                        {user_id === item.member_id && item.status !== 'handle' ?
                                            <Button
                                                type="primary"
                                                onClick={this.props.handleScheduleItemStatus.bind(this, item)}
                                                data-tracename="点击标记完成按钮"
                                            >{Intl.get('schedule.list.mark.finish', '标记为完成')}
                                                {this.state.handleStatusLoading && item.id === this.state.isEdittingItemId ?
                                                    <Icon type="loading"/> : null}</Button> : null}
                                        <p className="schedule-content">{item.content}</p>
                                        <span className="hidden record-id">{item.id}</span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                );
            })
        );
    }

    render() {
        return (
            <div id="content-block" className="content-block">
                <div className="dayagenda-schedule-list"
                >
                    <div className="schedule-title">
                        <Row className="week-wrap">
                            <Col className="title-week">
                                {curWeek}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4}>
                                <span className="timerange">{Intl.get('common.login.time', '时间')}</span>
                            </Col>
                            <Col sm={9}>
                                <span className="todo">
                                    {Intl.get('schedule.todo.list', '待办')}
                                </span>
                            </Col>
                            <Col sm={10}>
                                <span className="content">
                                    {Intl.get('crm.177', '内容')}
                                </span>
                            </Col>
                        </Row>
                    </div>
                    {this.state.updateScrollBar ? this.renderUpdateDaySchedule() : this.renderDaySchedule()}
                </div>
            </div>
        );
    }
}
DayAgendaScheduleLists.navigate = (date, action) => {
    //
    switch (action){
        case BigCalendar.Navigate.PREVIOUS:
            return dates.add(date, -1, 'day');

        case BigCalendar.Navigate.NEXT:
            return dates.add(date, 1, 'day');
        default:
            return date;

    }
};
DayAgendaScheduleLists.title = (date, { formats, culture }) => {
    curWeek = timeUtil.getCurrentWeek(date);
    //初次渲染完组件后记录的时间
    scheduleManagementStore.setViewDate(moment(date).valueOf());
    return `${moment(date).format(oplateConsts.DATE_FORMAT)}`;
};
DayAgendaScheduleLists.defaultProps = {
    curCustomerId: '',
    updateScrollBar: false,
    handleScheduleItemStatus: function() {},
    showCustomerDetail: function() {}

};
const PropTypes = React.PropTypes;
DayAgendaScheduleLists.propTypes = {
    curCustomerId: PropTypes.string,
    updateScrollBar: PropTypes.boolean,
    scheduleList: PropTypes.array,
    handleScheduleItemStatus: PropTypes.func,
    showCustomerDetail: PropTypes.func

};
export default DayAgendaScheduleLists;