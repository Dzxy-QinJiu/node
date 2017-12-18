/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/14.
 */
var scheduleManagementStore = require("../store/schedule-management-store");
var scheduleManagementAction = require("../action/schedule-management-action");
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
var classNames = require("classnames");
import {Alert, message, Button} from "antd";
// 没有消息的提醒
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
var Spinner = require("CMP_DIR/spinner");
import userData from "PUB_DIR/sources/user-data";
var user_id = userData.getUserData().user_id;
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
var scheduleManagementEmitter = require("PUB_DIR/sources/utils/emitters").scheduleManagementEmitter;
const DELAY_RANGE = {
    ANIMATION: 1000,//动画结束的时间
};
const LAYOUT = {PADDING_TOP: 40};
class ExpireScheduleLists extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expired_start_time: "",//过期日程的开始时间
            expired_end_time: "",//过期日程的结束时间
            expired_status: "",//过期日程的状态
            isEdittingItemId: "",//正在标记为完成的那一条日程
            isShowExpiredPanel: this.props.isShowExpiredPanel,
            isFirstLogin: this.props.isShowExpiredPanel,
            updateScrollBar: false,
            ...scheduleManagementStore.getState()
        };
        this.onStoreChange = this.onStoreChange.bind(this);
    };

    componentDidMount() {
        scheduleManagementStore.listen(this.onStoreChange);
        //获取超时未完成的日程
        this.setState({
            expired_start_time: new Date().getTime() - 2 * 365 * oplateConsts.ONE_DAY_TIME_RANGE,//开始时间传一个两年前的今天
            expired_end_time: TimeStampUtil.getTodayTimeStamp().start_time,//今日早上的零点作为结束时间
            expired_status: false,//选择日程的状态
        }, () => {
            this.getExpiredScheduleList();
        });
    };

    onStoreChange = () => {
        this.setState(scheduleManagementStore.getState());
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.isShowExpiredPanel !== this.state.isShowExpiredPanel) {
            this.setState({
                isShowExpiredPanel: nextProps.isShowExpiredPanel
            });
        }
    };

    componentWillUnmount() {
        scheduleManagementStore.unlisten(this.onStoreChange);
    };

    //展示没有数据的提示
    showNoMoreDataTip = () => {
        return !this.state.isLoadingScheduleExpired &&
            this.state.scheduleExpiredList.length >= this.state.scheduleExpiredSize &&
            !this.state.listenScrollBottom;
    };

    //获取过期日程列表(不包含今天)
    getExpiredScheduleList() {
        var constObj = {
            page_size: this.state.pageSize,
            //把今天0点作为判断是否过期的时间点
            start_time: this.state.expired_start_time,
            end_time: this.state.expired_end_time,
            status: this.state.expired_status
        };
        if (this.state.lastScheduleExpiredId) {
            constObj.id = this.state.lastScheduleExpiredId;
        }
        scheduleManagementAction.getScheduleList(constObj);
    };

    //获取过期日程列表(不包含今天)
    getExpiredScheduleList = () => {
        var constObj = {
            page_size: this.state.pageSize,
            //把今天0点作为判断是否过期的时间点
            start_time: this.state.expired_start_time,
            end_time: this.state.expired_end_time,
            status: this.state.expired_status
        };
        if (this.state.lastScheduleExpiredId) {
            constObj.id = this.state.lastScheduleExpiredId;
        }
        scheduleManagementAction.getScheduleList(constObj);
    };
    //标记为完成
    handleMarkFinishStatus = (item) => {
        const reqData = {
            id: item.id,
            status: "handle",
        };
        this.setState({
            isEdittingItemId: item.id
        });
        scheduleManagementAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id": item.id,
                };
                this.setState({
                    isEdittingItemId: ""
                });
                scheduleManagementAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list", "修改待办事项状态失败"));
            }
        });
    };
    //渲染超期日程列表
    renderExpiredScheduleList() {
        return (
            <div>
                {_.map(this.state.scheduleExpiredList, (item) => {
                    var cls = classNames("iconfont", {
                        "icon-schedule-visit": item.type == "visit",
                        "icon-phone-busy": item.type == "calls",
                        "icon-schedule-other": item.type == "other"
                    });
                    return (
                        <div className="list-item" data-tracename="超期日程列表">
                            <h4 className="item-title">
                                    <span>
                                        {moment(item.start_time).format(oplateConsts.DATE_FORMAT)}
                                    </span>
                                <span className="pull-right">
                                        {moment(item.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                                    - {moment(item.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                                    </span>
                            </h4>
                            <p className="item-customer-content">
                                <i className={cls}></i>
                                <span onClick={this.props.showCustomerDetail.bind(this, item.customer_id)}
                                      data-tracename="点击查看客户详情">
                                        {item.customer_name}
                                        </span>
                            </p>
                            <p className="item-schedule-content">
                                        <span>
                                            <span className="label">{Intl.get("crm.177", "内容")}</span>
                                            <span className="content">{item.content}</span>
                                        </span>
                                {item.socketio_notice ?
                                    <span>
                                                <span className="label">{Intl.get("schedule.list.remind", "提醒")}</span>
                                                <span
                                                    className="content">{moment(item.alert_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}</span>
                                            </span>
                                    : null}

                            </p>
                            <p className="item-handle-content">
                                {user_id == item.member_id ?
                                    <Button type="primary"
                                            onClick={this.handleMarkFinishStatus.bind(this, item)}
                                            data-tracename="点击标记日程状态为完成"
                                    >{Intl.get("schedule.list.mark.finish", "标记为完成")}
                                        {this.state.handleStatusLoading ?
                                            <Icon type="loading"/> : null}</Button> :
                                    <span>{Intl.get("schedule.create.person", "创建人")}: {item.member_nick}</span>}
                            </p>
                        </div>
                    )

                })
                }
                <NoMoreDataTip
                    show={this.showNoMoreDataTip}
                />
            </div>
        )
    };

    handleScrollBarBottom = () => {
        var currListLength = _.isArray(this.state.scheduleExpiredList) ? this.state.scheduleExpiredList.length : 0;
        // 判断加载的条件
        if (currListLength < this.state.scheduleExpiredSize) {
            this.getExpiredScheduleList();
        }
    };

    //渲染超期日程区域
    renderExpireListContent() {
        //加载出错或者没有数据时
        if (this.state.scheduleExpiredErrMsg && !this.state.isLoadingScheduleExpired) {
            var retry = (
                <span>
                    {this.state.scheduleExpiredErrMsg}，<a href="javascript:void(0)"
                                                          onClick={this.getExpiredScheduleList()}>
                    {Intl.get("common.retry", "重试")}
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
            )
        } else if (!this.state.scheduleExpiredList.length && !this.state.isLoadingScheduleExpired) {
            return (
                <div className="schedule-list-no-data">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        } else {
            var divHeight = $(window).height() - LAYOUT.PADDING_TOP;
            var cls = classNames("list-container", {
                "update-scrollbar": this.state.updateScrollBar
            });
            if (this.state.updateScrollBar) {
                return (
                    <div className={cls} style={{height: divHeight}}>
                        {this.renderExpiredScheduleList()}
                    </div>
                )
            } else {
                return (
                    <div className={cls} style={{height: divHeight}}>
                        <GeminiScrollbar
                            className="scrollbar-container"
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                        >
                            {this.renderExpiredScheduleList()}
                        </GeminiScrollbar>
                    </div>
                )
            }
        }
    };

    handleScrollExpiredPanel = () => {
        scheduleManagementEmitter.emit(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE);
        this.props.updateExpiredPanelState({isShowExpiredPanel: !this.state.isShowExpiredPanel});
        this.setState({
            isShowExpiredPanel: !this.state.isShowExpiredPanel,
            isFirstLogin: false,
            updateScrollBar: true
        }, () => {
            setTimeout(() => {
                this.setState({
                    updateScrollBar: false,
                }, () => {
                    scheduleManagementEmitter.emit(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE);
                })
            }, DELAY_RANGE.ANIMATION)
        });
    };

    render() {
        //左侧超期日程动画 如果没有数据，就不显示左侧面板
        var expiredCls = classNames({
            "show-expire-panel": this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "hide-expire-panel": !this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "nodata-left-expired-panel": !this.state.isShowExpiredPanel && this.state.isFirstLogin
        });
        var cls = classNames("is-loading-schedule-list", {
            "show-spinner": this.state.isLoadingScheduleExpired && !this.state.lastScheduleExpiredId
        });
        var expiredTipContent = this.state.isShowExpiredPanel ? "《" : "》";
        return (
            <div id="expire-list-content" data-tracename="超时未完成日程界面" className={expiredCls}>
                <div className="expire-list-innerwrap">
                    <div className="expire-list-title">
                        {Intl.get("schedule.expired.list", "超时未完成")}
                    </div>
                    <div className="expire-list-content">
                        <div className={cls}>
                            {(this.state.isLoadingScheduleExpired && !this.state.lastScheduleExpiredId) ?
                                <Spinner /> : null}
                        </div>
                        {/*渲染超时未完成日程列表*/}
                        {this.renderExpireListContent()}
                    </div>
                </div>
                <div className="scroll-tip">
                    <span className="scroll-flag" onClick={this.handleScrollExpiredPanel}
                          data-tracename="点击展开或收起超期日程列表">{expiredTipContent}</span>
                </div>
            </div>
        )
    }
}
ExpireScheduleLists.defaultProps = {
    showCustomerDetail: function () {

    }
};
export default ExpireScheduleLists;