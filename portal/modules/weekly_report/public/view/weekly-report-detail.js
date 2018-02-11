/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/7.
 */
import WeeklyReportDetailAction from '../action/weekly-report-detail-actions';
import WeeklyReportDetailStore from '../store/weekly-report-detail-store';
import Spinner from 'CMP_DIR/spinner';
import commonMethodUtil from "PUB_DIR/sources/utils/common-method-util";
import {AntcTable} from "antc";
import {Alert, Button, Popconfirm, message} from "antd";
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import AskForLeaveForm from "../view/ask-for-leave-form";
var classNames = require("classnames");
import {LEALVE_OPTION} from "../utils/weekly-report-utils";
const WeeklyReportDetail = React.createClass({
    getDefaultProps() {
        return {
            selectedItem: {}
        };
    },
    getInitialState() {
        return {
            selectedItem: this.props.selectedItem,
            isAddingLeaveUserId: "",//正在添加请假信息的销售
            formType: "add",//是添加请假信息还是修改请假信息
            isEdittingItem: {},//正在编辑的请假信息
            ...WeeklyReportDetailStore.getState()
        };
    },
    onStoreChange() {
        this.setState(WeeklyReportDetailStore.getState());
    },
    componentDidMount() {
        WeeklyReportDetailStore.listen(this.onStoreChange);
        if (this.state.selectedItem.teamId && this.state.selectedItem.nWeek) {
            this.getWeeklyReportData(); // 获取电话统计、、、 数据
        }
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.selectedItem.teamId !== this.state.selectedItem.teamId || nextProps.selectedItem.nWeek !== this.state.selectedItem.nWeek) {
            this.setState({
                selectedItem: nextProps.selectedItem,
                isAddingLeaveUserId: ""
            }, () => {
                this.getWeeklyReportData();
            })
        }
    },
    componentWillUnmount() {
        this.setState({
            isAddingLeaveUserId: ""
        });
        WeeklyReportDetailStore.unlisten(this.onStoreChange);
    },
    //获取今年某周的开始日期
    getBeginDateOfWeek: function (weekIndex) {
        //7 * 24 * 60 * 60 *1000是一星期的时间毫秒数,(JS中的日期精确到毫秒)
        var time = (weekIndex - 1) * 7 * 24 * 60 * 60 * 1000;
        return moment().startOf('year').valueOf() + time;
    },

    //获取某年某周的结束日期
    getEndDateOfWeek: function (weekIndex) {
        //获取今年第一天是周几
        var firstDayWeek = new Date(moment().startOf('year').valueOf()).getDay();
        var spendDay = 1;
        if (firstDayWeek !== 0) {
            spendDay = 7 - firstDayWeek + 1;
        }
        var time = ((weekIndex - 1) * 7 + spendDay ) * 24 * 60 * 60 * 1000;
        return moment().startOf('year').valueOf() + time - 1;
    },
    //添加请假信息
    handleAddAskForLeave: function (userId) {
        this.setState({
            formType: "add",
            isAddingLeaveUserId: userId
        })
    },
    //更新请假信息
    handleUpdateAskForLeave: function (item) {
        this.setState({
            formType: "edit",
            isEdittingItem: item
        })

    },

    getWeeklyReportData: function () {
        this.getCallInfoData(); // 接通率
    },
    renderSelectLeaveOptions: function () {

    },
    //添加请假信息之后
    afterAddLeave: function (resData) {
        if (resData.code === 1) {
            message.warning(resData.msg)
        } else {
            var addLeaveItem = resData.result;
            var salesPhoneList = this.state.salesPhone.list;
            var filterArr = _.filter(salesPhoneList, (list) => {
                return list.name === addLeaveItem.nick_name;
            });
            var item = filterArr[0];
            if (!item.leave_info_list) {
                item.leave_info_list = [
                    {
                        "leave_time": addLeaveItem.leave_time,
                        "leave_detail": addLeaveItem.leave_detail,
                        "leave_days": addLeaveItem.leave_days,
                        "id": addLeaveItem.id
                    }];
            } else {
                item.leave_info_list.push(addLeaveItem);
            }
            //更新考核天数
            item.real_work_day = item.real_work_day -  addLeaveItem.leave_days;
            this.setState({
                salesPhone: this.state.salesPhone,
                isAddingLeaveUserId: "",
            })
        }
    },
    //取消添加请假信息
    cancelAddLeave: function () {
        this.setState({
            isAddingLeaveUserId: ""
        })
    },
    //更新请假信息之后
    afterUpdateLeave: function (resData) {
        if (resData.code === 1) {
            message.warning(resData.msg)
        } else {
            var updateObj = resData.result;
            var salesPhoneList = this.state.salesPhone.list;
            _.map(salesPhoneList, (list) => {
                if (_.isArray(list.leave_info_list)) {
                    _.map(list.leave_info_list, (item) => {
                        //正在更新的那一条请假信息
                        if (item.id === updateObj.id) {
                            if (updateObj.leave_days) {
                                list.real_work_day = list.real_work_day + (item.leave_days - updateObj.leave_days);
                                item.leave_days = updateObj.leave_days;
                            }
                            if (updateObj.leave_detail) {
                                item.leave_detail = updateObj.leave_detail;
                            }
                            if (updateObj.leave_time) {
                                item.leave_time = updateObj.leave_time;
                            }
                        }
                    })
                }
            });
            this.setState({
                salesPhone: this.state.salesPhone,
                formType: "add",
                isEdittingItem: {}
            })
        }
    },
    //取消更新请假信息之后
    cancelUpdateLeave: function () {
        this.setState({
            formType: "add",
            isEdittingItem: {}
        })
    },
    //删除某条请假信息
    handleRemoveAskForLeave: function (deleteItem) {
        var removedId = deleteItem.id;
        WeeklyReportDetailAction.deleteForLeave(removedId, () => {
            var salesPhoneList = this.state.salesPhone.list;
            _.map(salesPhoneList, (list) => {
                _.map(list.leave_info_list, (item, index) => {
                    if (item){
                        //因为符合某个条件会item
                        if (item.id === removedId) {
                            list.real_work_day =  list.real_work_day + deleteItem.leave_days;
                            list.leave_info_list.splice(index, 1);
                        }
                        if (!list.leave_info_list.length) {
                            delete list.leave_info_list;
                        }
                    }

                });
            });
            this.setState({
                salesPhone: this.state.salesPhone,

            });
        });
    },
    // 电话接通率的数据
    getPhoneListColumn: function () {
        var _this = this;
        let columns = [{
            title: Intl.get("user.salesman", "销售人员"),
            dataIndex: 'name',
            className: 'table-data-align-left',
        }, {
            title: Intl.get("weekly.report.total.duration", "本周总时长"),
            dataIndex: 'total_time',
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("weekly.report.total.connected", "本周总接通数"),
            dataIndex: 'total_num',
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.average.duration", "日均时长"),
            dataIndex: 'average_time',
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.average.connected", "日均接通数"),
            dataIndex: 'average_num',
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("weekly.report.assessment.days", "考核天数",),
            dataIndex: 'real_work_day',
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("weekly.report.attendance.remarks", "出勤备注"),
            className: 'has-filter table-data-align-left',
            width: '300',
            render: function (text, record, index) {
                var userArr = _.filter(_this.props.memberList.list, (item) => {
                    return item.name === record.name;
                });
                var userId = userArr.length ? userArr[0].id : "";
                //正在添加请假信息
                var isHide = _this.state.isAddingLeaveUserId === userId ? true : false;
                //没有请假信息的时候,是全勤的
                if (!record.leave_info_list) {
                    return (
                        <div className="attendance-remark">
                            {isHide ? (<div className="edit-for-leave-wrap">
                                {/*添加请假信息*/}
                                <AskForLeaveForm
                                    userId={userId}
                                    formType={_this.state.formType}
                                    isEdittingItem={_this.state.isEdittingItem}
                                    startAndEndTimeRange={_this.getStartAndEndTime()}
                                    afterAddLeave={_this.afterAddLeave}
                                    cancelAddLeave={_this.cancelAddLeave}
                                />
                            </div>) : <div>
                                 <span className="text-wrap">
                               {Intl.get("weekly.report.full.work.day", "全勤")}
                            </span>
                                <i className="iconfont icon-update"
                                   onClick={_this.handleAddAskForLeave.bind(this, userId)}></i>
                            </div>}
                        </div>
                    )
                } else if (record.leave_info_list) {
                    //有请假信息的时候 展示请假信息列表
                    return (
                        <div className="leave-info-container">
                            {
                                _.map(record.leave_info_list, (item, index) => {
                                    var leaveArr = _.filter(LEALVE_OPTION, (option) => {
                                        return option.value === item.leave_detail;
                                    });
                                    //是否正在编辑某条请假信息
                                    var isFormShow = _this.state.isEdittingItem.id === item.id && _this.state.formType === "edit" ? true : false;
                                    if (isFormShow) {
                                        return (
                                            <AskForLeaveForm
                                                formType={_this.state.formType}
                                                isEdittingItem={_this.state.isEdittingItem}
                                                startAndEndTimeRange={_this.getStartAndEndTime()}
                                                afterUpdateLeave={_this.afterUpdateLeave}
                                                cancelUpdateLeave={_this.cancelUpdateLeave}
                                            />)
                                    } else {
                                        //展示请假信息
                                        return (
                                            <div>
                                           <span>
                                            {moment(item.leave_time).format(oplateConsts.DATE_FORMAT) + leaveArr[0].label + Intl.get("weekly.report.n.days", "{n}天", {n: item.leave_days})}
                                            </span>
                                                <i className="iconfont icon-update"
                                                   onClick={_this.handleUpdateAskForLeave.bind(this, item)}></i>
                                                <Popconfirm
                                                    title={Intl.get("weekly.report.are.you.sure.del.remark", "确定要删除该条请假信息吗？")}
                                                    onConfirm={_this.handleRemoveAskForLeave.bind(this,item)}
                                                    okText={Intl.get("common.sure", "确认")}
                                                    cancelText={Intl.get("common.cancel", "取消")}
                                                >
                                                    <Button className="remove-ask-leave" icon="delete"
                                                            title={Intl.get("common.delete", "删除")}/>
                                                </Popconfirm>
                                                {index === record.leave_info_list.length - 1  ? (_this.state.isAddingLeaveUserId === userId ? null : <div className="iconfont icon-add"
                                                                                                                                               onClick={_this.handleAddAskForLeave.bind(this, userId)}></div> )                                       :null }
                                                {/*添加请假信息*/}
                                                {_this.state.isAddingLeaveUserId === userId && index === record.leave_info_list.length - 1 ?
                                                    <AskForLeaveForm
                                                        userId={userId}
                                                        formType="add"
                                                        startAndEndTimeRange={_this.getStartAndEndTime()}
                                                        afterAddLeave={_this.afterAddLeave}
                                                        cancelAddLeave={_this.cancelAddLeave}
                                                    />
                                                    : null}
                                            </div>
                                        )
                                    }
                                })
                            }
                        </div>
                    )
                }
            }
        },];
        return columns;
    },

    getCallInfoAuth() {
        let authType = "user";//CUSTOMER_CALLRECORD_STATISTIC_USER
        if (hasPrivilege("CUSTOMER_CALLRECORD_STATISTIC_MANAGER")) {
            authType = "manager";
        }
        return authType;
    },
    // 通话的接通率
    getCallInfoData(params){
        let queryParams = {
            start_time: this.getBeginDateOfWeek(this.state.selectedItem.nWeek),
            end_time: this.getEndDateOfWeek(this.state.selectedItem.nWeek),
            deviceType: this.state.call_type,
            team_ids: this.state.selectedItem.teamId
        };
        let pathParam = commonMethodUtil.getParamByPrivilege();
        let type = this.getCallInfoAuth();
        //不加延时会报错
        setTimeout(() => {
            WeeklyReportDetailAction.getCallInfo(pathParam, queryParams, type);
        });

    },
    // 通话率列表
    renderCallInfo() {
        if (this.state.salesPhone.loading) {
            return (
                <div>
                    <Spinner />
                </div>
            );
        } else if (this.state.salesPhone.errMsg) {
            var errMsg = <span>{this.state.salesPhone.errMsg}
                <a onClick={this.getWeeklyReportData}>
                    {Intl.get("user.info.retry", "请重试")}
                </a></span>;
            return (
                <div>
                    <Alert
                        message={errMsg}
                        type="error"
                        showIcon
                    />
                </div>

            );

        } else {
            return (
                <AntcTable
                    dataSource={this.state.salesPhone.list}
                    columns={this.getPhoneListColumn()}
                    pagination={false}
                    bordered
                />
            );
        }

    },
    getStartAndEndTime() {
        return {
            startTime: moment(this.getBeginDateOfWeek(this.state.selectedItem.nWeek)).format(oplateConsts.DATE_FORMAT),
            endTime: moment(this.getEndDateOfWeek(this.state.selectedItem.nWeek)).format(oplateConsts.DATE_FORMAT)
        }

    },
    render(){
        return (
            <div className="weekly-report-detail-container">
                <h4 className="total-title">
                    {Intl.get("weekly.report.statics.duration", "统计周报内容，统计时间{startTime}至{endTime}", {
                        startTime: this.getStartAndEndTime().startTime,
                        endTime: this.getStartAndEndTime().endTime
                    })}
                </h4>
                <div className="call-info-wrap">
                    <h4 className="item-title">{Intl.get("weekly.report.call.statics", "电话统计")}</h4>
                    <div className="call-info-table-container">
                        {this.renderCallInfo()}
                    </div>
                </div>
            </div>
        )
    }
});
export default WeeklyReportDetail;