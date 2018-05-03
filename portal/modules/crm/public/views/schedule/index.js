require("../../css/schedule.less");
var ScheduleStore = require("../../store/schedule-store");
var ScheduleAction = require("../../action/schedule-action");
var CrmScheduleForm = require("./form");
import {Icon, message, Button, Alert, Popover, Tag} from "antd";
var GeminiScrollbar = require("../../../../../components/react-gemini-scrollbar");
var TimeLine = require("CMP_DIR/time-line-new");
import Trace from "LIB_DIR/trace";
const DATE_TIME_WITHOUT_SECOND_FORMAT = oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT;
import userData from "PUB_DIR/sources/user-data";
var user_id = userData.getUserData().user_id;
import Spinner from 'CMP_DIR/spinner';
import classNames from 'classnames';
import DetailCard from "CMP_DIR/detail-card";
import {DetailEditBtn} from "CMP_DIR/rightPanel";
//高度常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8, //日程的下边距
    TOP_TOTAL_HEIGHT: 30,//共xxx条的高度
};

var CrmSchedule = React.createClass({
    getInitialState: function () {
        return {
            customerId: this.props.curCustomer.id || "",
            ...ScheduleStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(ScheduleStore.getState());
    },
    componentDidMount: function () {
        ScheduleStore.listen(this.onStoreChange);
        //获取日程管理列表
        this.getScheduleList();
    },
    componentWillReceiveProps: function (nextProps) {
        var nextCustomerId = nextProps.curCustomer.id || '';
        var oldCustomerId = this.props.curCustomer.id || '';
        if (nextCustomerId !== oldCustomerId) {
            setTimeout(() => {
                this.setState({
                    customerId: nextCustomerId
                }, () => {
                    ScheduleAction.resetState();
                    this.getScheduleList();
                });
            })
        }
    },
    componentWillUnmount: function () {
        ScheduleStore.unlisten(this.onStoreChange);
        setTimeout(() => {
            ScheduleAction.resetState();
        });
    },
    getScheduleList: function () {
        let queryObj = {
            customer_id: this.state.customerId || '',
            page_size: this.state.pageSize || 20,
        };
        if (this.state.lastScheduleId) {
            queryObj.id = this.state.lastScheduleId;
        }
        ScheduleAction.getScheduleList(queryObj);
    },
    addSchedule: function () {
        const newSchedule = {
            customer_id: this.props.curCustomer.id,
            customer_name: this.props.curCustomer.name,
            start_time: "",
            end_time: "",
            alert_time: "",
            topic: "",
            edit: true
        }
        ScheduleAction.showAddForm(newSchedule);
        //滚动条滚动到顶端以显示添加表单
        GeminiScrollbar.scrollTo(this.refs.alertWrap, 0);
    },
    editSchedule: function (alert) {
        Trace.traceEvent(this.getDOMNode(), "编辑联系计划");
        ScheduleAction.showEditForm(alert);
    },
    //修改状态
    handleItemStatus: function (item) {
        //只能修改自己创建的日程的状态
        if (user_id != item.member_id) {
            return;
        }
        const reqData = {
            id: item.id,
            status: item.status == "false" ? "handle" : "false",
        };
        var status = item.status == "false" ? "完成" : "未完成";
        Trace.traceEvent($(this.getDOMNode()).find(".item-wrapper .ant-btn"), "修改联系计划的状态为" + status);
        ScheduleAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id": item.id,
                    "status": reqData.status
                };
                ScheduleAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list", "修改待办事项状态失败"));
            }
        });
    },
    deleteSchedule: function (id) {
        const reqData = {id: id};
        Trace.traceEvent($(this.getDOMNode()).find(".item-wrapper .anticon-delete"), "删除联系计划");
        ScheduleAction.deleteSchedule(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                ScheduleAction.afterDelSchedule(id);
                this.setState({
                    scheduleList: this.state.scheduleList
                });
            } else {
                message.error(Intl.get("crm.139", "删除失败"));
            }
        });
    },
    //下拉加载
    handleScrollBarBottom: function () {
        var currListLength = _.isArray(this.state.scheduleList) ? this.state.scheduleList.length : 0;
        // 判断加载的条件
        if (currListLength < this.state.total) {
            this.getScheduleList();
        }
    },
    updateScheduleList: function (newItem, type) {
        //如果是新增一个提醒
        if (type == "add") {
            newItem.edit = false;
            this.state.scheduleList.unshift(newItem);
        } else if (type == "delete") {
            this.state.scheduleList = _.filter(this.state.scheduleList, (list) => {
                return list.id !== newItem.id
            });
        }
        this.setState({
            scheduleList: this.state.scheduleList
        })
    },

    getScheduleShowObj(item){
        let scheduleShowOb = {
            iconClass: "",
            title: "",
            // content: item.content,
            startTime: item.start_time ? moment(item.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : "",
            endTime: item.end_time ? moment(item.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : ""
        };
        switch (item.type) {
            case 'visit':
                scheduleShowOb.iconClass = 'icon-visit-briefcase';
                scheduleShowOb.title = Intl.get("customer.visit", "拜访");
                break;
            case 'calls':
                scheduleShowOb.iconClass = 'icon-phone-call-out';
                scheduleShowOb.title = Intl.get("schedule.phone.connect", "电联");
                break;
            case 'other':
                scheduleShowOb.iconClass = 'icon-trace-other';
                scheduleShowOb.title = Intl.get("customer.other", "其他");
                break;
        }
        return scheduleShowOb;
    },
    toggleScheduleContact(item, flag){
        let curSchedule = _.find(this.state.scheduleList, schedule => schedule.id == item.id);
        curSchedule.isShowContactPhone = flag;
        this.setState({scheduleList: this.state.scheduleList});
    },
    getContactPhoneArray(item){
        let phoneArray = [];
        _.each(item.contacts, contact => {
            let contactName = contact.name || "";
            _.each(contact.phone, phone => {
                if (phone) {
                    phoneArray.push({name: contactName, phone: phone});
                }
            });
        });
        return phoneArray;
    },
    renderTimeLineItem(item, hasSplitLine){
        if (item.edit) {
            return (
                <div className="form-wrapper">
                    <CrmScheduleForm
                        getScheduleList={this.getScheduleList}
                        currentSchedule={item}
                        curCustomer={this.props.curCustomer}
                    />
                </div>
            );
        } else {
            let scheduleShowObj = this.getScheduleShowObj(item);
            let phoneArray = this.getContactPhoneArray(item);
            return (
                <div className={classNames("schedule-item", {"day-split-line": hasSplitLine})}>
                    <div className="schedule-item-title">
                        <span className={`iconfont ${scheduleShowObj.iconClass}`}/>
                        <span className="schedule-time-stage">{scheduleShowObj.startTime}</span>
                        {scheduleShowObj.startTime && scheduleShowObj.endTime ? "-" : null}
                        <span className="schedule-time-stage">{scheduleShowObj.endTime}</span>
                        <span className="schedule-type-text">{scheduleShowObj.title}</span>
                    </div>
                    <div className="schedule-item-content">
                        {item.content}
                    </div>
                    {this.props.isMerge ? null : (
                        <div className="schedule-item-buttons">
                            {item.type === "calls" && _.isArray(phoneArray) && phoneArray.length ? item.isShowContactPhone ? (
                                <div className="schedule-contact-phone-block">
                                    {_.map(phoneArray, obj => {
                                        return (
                                            <Button>
                                                {obj.name || ""}
                                                <span className="contact-phone">{obj.phone}</span>
                                                <span className="iconfont icon-phone-call-out"/>
                                            </Button>);
                                    })}
                                    <span className="iconfont icon-close"
                                          title={Intl.get("common.app.status.close", "关闭")}
                                          onClick={this.toggleScheduleContact.bind(this, item, false)}/>
                                </div>) : (
                                <Button className="schedule-contact-btn"
                                        onClick={this.toggleScheduleContact.bind(this, item, true)}
                                        size="small">{Intl.get("customer.contact.customer", "联系客户")}</Button>)
                                : null}
                            <Button className="schedule-status-btn" onClick={this.handleItemStatus.bind(this, item)}
                                    size="small">
                                {item.status == "false" ? Intl.get("crm.alert.not.finish", "未完成") : Intl.get("user.user.add.finish", "完成")}
                            </Button>
                            <span className="right-handle-buttons">
                                {item.socketio_notice && item.alert_time ? (<Popover
                                    content={moment(item.alert_time).format(DATE_TIME_WITHOUT_SECOND_FORMAT)}
                                    trigger="hover" placement="bottom"
                                    overlayClassName="schedule-alert-time">
                                    <span className="iconfont icon-alarm-clock"/>
                                </Popover>) : null}
                                {/*<DetailEditBtn  onClick={this.editSchedule.bind(this, item)}/>*/}
                                {/*只能删除自己创建的日程*/}
                                {user_id == item.member_id ?
                                    <Popover content={Intl.get("common.delete", "删除")}
                                             trigger="hover" placement="bottom" overlayClassName="schedule-alert-time">
                                        <span className="iconfont icon-delete" data-tracename="点击删除日程按钮"
                                              onClick={this.deleteSchedule.bind(this, item.id)}/>
                                    </Popover> : null}
                            </span>
                        </div>)}
                </div>);
        }
    },
    //联系计划列表区域
    renderScheduleLists: function () {
        if (this.state.scheduleList.length) {
            return (
                <TimeLine
                    list={this.state.scheduleList}
                    groupByDay={true}
                    groupByYear={true}
                    timeField="start_time"
                    renderTimeLineItem={this.renderTimeLineItem}
                    relativeDate={false}
                />);
        } else {
            return (
                <div className="schedule-list-no-data">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
    },
    renderContent: function () {
        const _this = this;

        var divHeight = $(window).height()
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP //右侧面板顶部padding
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM //右侧面板底部padding
            - LAYOUT_CONSTANTS.DYNAMIC_LIST_MARGIN_BOTTOM //动态列表距离底部margin
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT //右侧面板tab高度
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM //右侧面板tab的margin
        ;
        var cls = classNames("is-loading-schedule-list", {
            "show-spinner": this.state.isLoadingScheduleList && !this.state.lastScheduleId
        })
        return (
            <div ref="alertWrap" className="schedule-list" style={{height: divHeight}} data-tracename="联系计划页面">
                <GeminiScrollbar
                    className="scrollbar-container"
                    handleScrollBottom={this.handleScrollBarBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    <div className="render-schedule-content">
                        <div className={cls}>
                            {(this.state.isLoadingScheduleList && !this.state.lastScheduleId) ? <Spinner /> : null}
                        </div>
                        {this.renderScheduleLists()}
                    </div>
                </GeminiScrollbar>
                {this.props.isMerge ? null : (
                    <div className="crm-right-panel-addbtn" onClick={this.addSchedule} data-tracename="添加联系计划">
                        <Icon type="plus"/><span>
                    <ReactIntl.FormattedMessage id="crm.178" defaultMessage="添加一个联系计划"/></span>
                    </div>)}
            </div>
        );
    },
    renderScheduleContent(){
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        let basicInfoHeight = parseInt($(".basic-info-contianer").outerHeight(true));
        //减头部的客户基本信息高度
        divHeight -= basicInfoHeight;
        //减添加按钮区的高度
        divHeight -= LAYOUT_CONSTANTS.TOP_TOTAL_HEIGHT;
        const retry = (
            <span>
                {this.state.getScheduleListErrmsg}，
                <a href="javascript:void(0)" onClick={this.getScheduleList}>
                    {Intl.get("common.retry", "重试")}
                </a>
            </span>
        );
        return (
            <div className="schedule-list" style={{height: divHeight}} data-tracename="联系计划页面">
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBarBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    {this.state.isLoadingScheduleList && !this.state.lastScheduleId ? <Spinner />
                        : this.state.getScheduleListErrmsg ? (
                            <div className="schedule-list-error">
                                <Alert message={retry} type="error" showIcon={true}/>
                            </div>)
                            : this.renderScheduleLists()
                    }
                </GeminiScrollbar>
            </div>);
    },
    renderScheduleTitle(){
        return (
            <div className="schedule-title">
                <span>{Intl.get("crm.right.schedule", "联系计划")}:</span>
                <span className="iconfont icon-add schedule-add-btn"
                      title={Intl.get("crm.214", "添加联系计划")}
                      onClick={this.addSchedule}/>
            </div>);
    },
    render(){
        // let containerClassName = classNames("contact-item-container", {
        //     "contact-delete-border": this.props.contact.isShowDeleteContactConfirm
        // });
        return (<DetailCard title={this.renderScheduleTitle()}
                            content={this.renderScheduleContent()}
                            className="schedule-contianer"/>);
    }
});

module.exports = CrmSchedule;
