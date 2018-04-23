require("../../css/schedule.less");
var ScheduleStore = require("../../store/schedule-store");
var ScheduleAction = require("../../action/schedule-action");
var CrmScheduleForm = require("./form");
import {Icon, message, Button, Alert} from "antd";
var GeminiScrollbar = require("../../../../../components/react-gemini-scrollbar");
var TimeLine = require("../../../../../components/time-line");
import Trace from "LIB_DIR/trace";
const DATE_TIME_WITHOUT_SECOND_FORMAT = oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT;
import userData from "PUB_DIR/sources/user-data";
var user_id = userData.getUserData().user_id;
import Spinner from 'CMP_DIR/spinner';
import classNames from 'classnames';
//高度常量
var LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 40,//右侧面板底部padding
    DYNAMIC_LIST_MARGIN_BOTTOM: 30,//动态列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
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
            });
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
        };
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
        if (user_id != item.member_id){
            return;
        }
        const reqData = {
            id: item.id,
            status: item.status == "false" ? "handle" : "false",
        };
        var status = item.status == "false" ? "完成" :"未完成";
        Trace.traceEvent($(this.getDOMNode()).find(".item-wrapper .ant-btn"), "修改联系计划的状态为" + status);
        ScheduleAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id":item.id,
                    "status":reqData.status
                };
                ScheduleAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list","修改待办事项状态失败"));
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
                    scheduleList:this.state.scheduleList
                });
            } else {
                message.error(Intl.get("crm.139", "删除失败"));
            }
        });
    },
    //下拉加载
    handleScrollBarBottom:function () {
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
                return list.id !== newItem.id;
            });
        }
        this.setState({
            scheduleList: this.state.scheduleList
        });
    },
    //联系计划列表区域
    renderScheduleLists: function () {
        //加载出错或者没有数据时
        if (this.state.getScheduleListErrmsg && !this.state.isLoadingScheduleList){
            var retry = (
                <span>
                    {this.state.getScheduleListErrmsg}，<a href="javascript:void(0)"
                                                           onClick={this.getScheduleList()}>
                    {Intl.get("common.retry","重试")}
                </a>
                </span>
            );
            return (
                <div className="schedule-list-error">
                    <Alert
                        message={retry}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }else if (!this.state.scheduleList.length  && !this.state.isLoadingScheduleList){
            return (
                <div className="schedule-list-no-data">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }else{
            return (
                _.map(this.state.scheduleList, (item) => {
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
                        return (
                            <div className="item-wrapper">
                                <dl>
                                    <dt>
                                        <p>
                            <span className="schedule-content-label">
                                {Intl.get("crm.177", "内容")}
                            </span>
                                            <span className="schedule-content">
                             {item.content}
                            </span>
                                        </p>
                                        <p>
                                        <span className="schedule-content-label">
                                            {Intl.get("crm.146", "日期")}
                                        </span>
                                            <span className="schedule-content">
                                 {moment(item.start_time).format(DATE_TIME_WITHOUT_SECOND_FORMAT)} {Intl.get("contract.83", "至")} {moment(item.end_time).format(DATE_TIME_WITHOUT_SECOND_FORMAT)}
                            </span>
                                        </p>
                                        <p>
                                        <span className="schedule-content-label">
                                            {Intl.get("crm.40", "提醒")}
                                        </span>
                                            <span className="schedule-content">
                               {!item.socketio_notice ? Intl.get("crm.not.alert", "不提醒") : moment(item.alert_time).format(DATE_TIME_WITHOUT_SECOND_FORMAT)}
                            </span>
                                        </p>
                                        {this.props.isMerge ? null : (
                                            <p className="icon-content">
                                                {/*<Icon type="edit" onClick={this.editSchedule.bind(this, item)} />*/}
                                                {/*只能删除自己创建的日程*/}
                                                {user_id == item.member_id ? <Icon type="delete" onClick={this.deleteSchedule.bind(this, item.id)}/>:null}

                                                <Button onClick={this.handleItemStatus.bind(this, item)} size="small">
                                                    {item.status == "false" ? Intl.get("crm.alert.not.finish", "未完成") : Intl.get("user.user.add.finish", "完成")}
                                                </Button>
                                            </p>)
                                        }
                                    </dt>
                                </dl>
                            </div>

                        );
                    }
                })
            );
        }
    },
    render: function () {
        const _this = this;

        var divHeight = $(window).height()
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP //右侧面板顶部padding
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM //右侧面板底部padding
            - LAYOUT_CONSTANTS.DYNAMIC_LIST_MARGIN_BOTTOM //动态列表距离底部margin
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT //右侧面板tab高度
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM //右侧面板tab的margin
        ;
        var cls = classNames("is-loading-schedule-list",{
            "show-spinner":this.state.isLoadingScheduleList && !this.state.lastScheduleId
        });
        return (
            <div ref="alertWrap" className="schedule-list" style={{height: divHeight}} data-tracename="联系计划页面">
                <GeminiScrollbar
                    className="scrollbar-container"
                    handleScrollBottom={this.handleScrollBarBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    <div className="render-schedule-content">
                        <div className={cls}>
                            {(this.state.isLoadingScheduleList && !this.state.lastScheduleId)? <Spinner />:null}
                        </div>
                        {this.renderScheduleLists()}
                    </div>
                </GeminiScrollbar>
                {this.props.isMerge ? null : (<div className="crm-right-panel-addbtn" onClick={this.addSchedule} data-tracename="添加联系计划">
                    <Icon type="plus"/><span>
                    <ReactIntl.FormattedMessage id="crm.178" defaultMessage="添加一个联系计划"/></span>
                </div>)}
            </div>
        );
    }
});

module.exports = CrmSchedule;
