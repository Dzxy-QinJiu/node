/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/7.
 */
import WeeklyReportDetailAction from '../action/weekly-report-detail-actions';
import WeeklyReportDetailStore from '../store/weekly-report-detail-store';
import Spinner from 'CMP_DIR/spinner';
import commonMethodUtil from "PUB_DIR/sources/utils/common-method-util";
import weeklyReportUtils from "../utils/weekly-report-utils";
import {AntcTable} from "antc";
import {Alert} from "antd";
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
const WeeklyReportDetail = React.createClass({
    getDefaultProps() {
        return {
            selectedItem: {}
        };
    },
    getInitialState() {
        return {
            selectedItem: this.props.selectedItem,
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
                selectedItem: nextProps.selectedItem
            },()=>{
                this.getWeeklyReportData();
            })
        }
    },
    componentWillUnmount() {
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
        var time = ((weekIndex - 1) * 7  + spendDay ) * 24 * 60 * 60 * 1000 ;
        return moment().startOf('year').valueOf() + time -1;
    },


    getWeeklyReportData: function () {
        this.getCallInfoData(); // 接通率
    },
    // 电话接通率的数据
    getPhoneListColumn: function () {
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
        },{
            title: Intl.get("weekly.report.assessment.days","考核天数",),
            dataIndex: 'real_work_day',
            className: 'has-filter table-data-align-right'
        },{
            title: Intl.get("weekly.report.attendance.remarks","出勤备注"),
            className: 'has-filter table-data-align-left',
            dataIndex: 'leave_remark',
            render:function (text, record, index) {
                return (
                    <div className="attendance-remark">
                        <span>
                           {text}
                        </span>
                        <i className="iconfont icon-update"></i>
                    </div>
                )
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
        setTimeout(()=>{
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
        }else if (this.state.salesPhone.errMsg){
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

        }else{
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
    render(){
        return (
            <div className="weekly-report-detail-container">
                <h4 className="total-title">
                    {Intl.get("weekly.report.statics.duration","统计周报内容，统计时间{startTime}至{endTime}",{startTime:moment(this.getBeginDateOfWeek(this.state.selectedItem.nWeek)).format(oplateConsts.DATE_FORMAT),endTime:moment(this.getEndDateOfWeek(this.state.selectedItem.nWeek)).format(oplateConsts.DATE_FORMAT)})}
                </h4>
                <div className="call-info-wrap">
                    <h4 className="item-title">{Intl.get("weekly.report.call.statics","电话统计")}</h4>
                    <div className="call-info-table-container">
                        {this.renderCallInfo()}
                    </div>
                </div>
            </div>
        )
    }
});
export default WeeklyReportDetail;