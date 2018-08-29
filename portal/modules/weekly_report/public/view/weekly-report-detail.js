/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/7.
 */
var React = require('react');
import WeeklyReportDetailAction from '../action/weekly-report-detail-actions';
import WeeklyReportDetailStore from '../store/weekly-report-detail-store';
import Spinner from 'CMP_DIR/spinner';
import {AntcTable, AntcCardContainer} from 'antc';
import {Alert, Button, Popconfirm, message} from 'antd';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import AskForLeaveForm from '../view/ask-for-leave-form';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
var classNames = require('classnames');
import {LEALVE_OPTION} from '../utils/weekly-report-utils';
var WeekReportUtil = require('../utils/weekly-report-utils');
var userData = require('PUB_DIR/sources/user-data');
//权限常量
const PRIVILEGE_MAP = {
    CONTRACT_BASE_PRIVILEGE: 'CRM_CONTRACT_COMMON_BASE',//合同基础角色的权限，开通合同管理应用后会有此权限
};
import {formatRoundingData} from 'PUB_DIR/sources/utils/common-method-util';
const WeeklyReportDetail = React.createClass({
    getDefaultProps() {
        return {
            selectedItem: {}
        };
    },
    getInitialState() {
        return {
            selectedItem: this.props.selectedItem,
            selectedTeamName: this.props.selectedTeamName,
            isAddingLeaveUserId: '',//正在添加请假信息的销售
            formType: 'add',//是添加请假信息还是修改请假信息
            isEdittingItem: {},//正在编辑的请假信息
            ...WeeklyReportDetailStore.getState()
        };
    },
    onStoreChange() {
        this.setState(WeeklyReportDetailStore.getState());
    },
    componentDidMount() {
        WeeklyReportDetailStore.listen(this.onStoreChange);
        this.getWeeklyReportData(); // 获取电话统计、、、 数据
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.selectedItem.teamId !== this.state.selectedItem.teamId || nextProps.selectedItem.nWeek !== this.state.selectedItem.nWeek) {
            this.setState({
                selectedTeamName: nextProps.selectedTeamName,
                selectedItem: nextProps.selectedItem,
                isAddingLeaveUserId: ''
            }, () => {
                this.getWeeklyReportData();
            });
        }
    },
    componentWillUnmount() {
        this.setState({
            isAddingLeaveUserId: ''
        });
        WeeklyReportDetailStore.unlisten(this.onStoreChange);
    },
    //获取今年某周的开始日期
    getBeginDateOfWeek: function(weekIndex) {
        var time = (weekIndex - 1) * 7 * oplateConsts.ONE_DAY_TIME_RANGE;
        return moment().startOf('year').valueOf() + time;
    },

    //获取某年某周的结束日期
    getEndDateOfWeek: function(weekIndex) {
        //获取今年第一天是周几
        var firstDayWeek = new Date(moment().startOf('year').valueOf()).getDay();
        var spendDay = 1;
        if (firstDayWeek !== 0) {
            spendDay = 7 - firstDayWeek + 1;
        }
        var time = ((weekIndex - 1) * 7 + spendDay ) * oplateConsts.ONE_DAY_TIME_RANGE;
        return moment().startOf('year').valueOf() + time - 1;
    },
    //添加请假信息
    handleAddAskForLeave: function(userId) {
        this.setState({
            formType: 'add',
            isAddingLeaveUserId: userId
        });
    },
    //更新请假信息
    handleUpdateAskForLeave: function(item) {
        this.setState({
            formType: 'edit',
            isEdittingItem: item
        });

    },
    getWeeklyReportData: function() {
        //不加延时会报错
        setTimeout(() => {
            this.getCallInfoData();// 接通率
            if (hasPrivilege(PRIVILEGE_MAP.CONTRACT_BASE_PRIVILEGE)) {
                this.getContractData();//获取合同信息
                this.getRepaymentData();//获取回款信息
            }
            this.getRegionOverlayData();//获取区域分布信息
            this.getCustomerStageData();//获取客户阶段信息
        });
    },

    //添加请假信息之后
    afterAddLeave: function(resData) {
        //如果某天请假时间超过一天，返回 code为1 返回请假时间不能超过一天的提示信息
        if (resData.code === 1) {
            message.warning(resData.msg);
        } else {
            var addLeaveItem = resData.result;
            var salesPhoneList = this.state.salesPhone.list;
            var item = _.find(salesPhoneList, (obj) => {
                return obj.name === addLeaveItem.nick_name;
            });
            if (_.isArray(item.leave_info_list)) {
                item.leave_info_list.push(addLeaveItem);
            } else {
                item.leave_info_list = [
                    {
                        'leave_time': addLeaveItem.leave_time,
                        'leave_detail': addLeaveItem.leave_detail,
                        'leave_days': addLeaveItem.leave_days,
                        'id': addLeaveItem.id
                    }];
            }
            //更新考核天数
            item.real_work_day = item.real_work_day - addLeaveItem.leave_days;
            //日接通数保留整数
            item.average_num = formatRoundingData(item.total_callout_success / item.real_work_day, 0);
            //日均时长保留一位小数
            item.average_time = formatRoundingData(item.total_time / item.real_work_day, 1);
            this.setState({
                salesPhone: this.state.salesPhone,
                isAddingLeaveUserId: '',
            });
        }
    },
    //取消添加请假信息
    cancelAddLeave: function() {
        this.setState({
            isAddingLeaveUserId: ''
        });
    },
    //更新请假信息之后
    afterUpdateLeave: function(resData) {
        //如果某天请假时间超过一天，返回 code为1 返回请假时间不能超过一天的提示信息
        if (resData.code === 1) {
            message.warning(resData.msg);
        } else {
            var updateObj = resData.result;
            var salesPhoneList = this.state.salesPhone.list;
            _.each(salesPhoneList, (obj) => {
                if (_.isArray(obj.leave_info_list)) {
                    //所修改的那条请假信息
                    var initailObj = _.find(obj.leave_info_list, (item) => {
                        return item.id === updateObj.id;
                    });
                    if (initailObj) {
                        if (updateObj.leave_days) {
                            obj.real_work_day = obj.real_work_day + (initailObj.leave_days - updateObj.leave_days);
                            //日接通数保留整数
                            obj.average_num = formatRoundingData(obj.total_callout_success / obj.real_work_day, 0);
                            //日均时长保留一位小数
                            obj.average_time = formatRoundingData(obj.total_time / obj.real_work_day, 1);
                            initailObj.leave_days = updateObj.leave_days;
                        }
                        if (updateObj.leave_detail) {
                            initailObj.leave_detail = updateObj.leave_detail;
                        }
                        if (updateObj.leave_time) {
                            initailObj.leave_time = updateObj.leave_time;
                        }
                    }
                }
            });
            this.setState({
                salesPhone: this.state.salesPhone,
                formType: 'add',
                isEdittingItem: {}
            });
        }
    },
    //取消更新请假信息之后
    cancelUpdateLeave: function() {
        this.setState({
            formType: 'add',
            isEdittingItem: {}
        });
    },
    //删除某条请假信息
    handleRemoveAskForLeave: function(deleteItem) {
        var removedId = deleteItem.id;
        WeeklyReportDetailAction.deleteForLeave(removedId, () => {
            var salesPhoneList = this.state.salesPhone.list;
            _.each(salesPhoneList, (Obj) => {
                _.each(Obj.leave_info_list, (item, index) => {
                    if (item) {
                        //因为符合某个条件会item
                        if (item.id === removedId) {
                            Obj.real_work_day = Obj.real_work_day + deleteItem.leave_days;
                            //日接通数保留整数
                            Obj.average_num = formatRoundingData(Obj.total_callout_success / Obj.real_work_day, 0);
                            //日均时长保留一位小数
                            Obj.average_time = formatRoundingData(Obj.total_time / Obj.real_work_day, 1);
                            Obj.leave_info_list.splice(index, 1);
                        }
                    }
                });
                if (_.isArray(Obj.leave_info_list) && !Obj.leave_info_list.length) {
                    delete Obj.leave_info_list;
                }
            });
            this.setState({
                salesPhone: this.state.salesPhone,
            });
        });
    },
    //没有请假信息的时候,是全勤的
    renderFullWork: function(isAdding, userId) {
        return (
            <div className="attendance-remark">
                {isAdding ? (<div className="edit-for-leave-wrap">
                    {/*添加请假信息*/}
                    <AskForLeaveForm
                        userId={userId}
                        formType={this.state.formType}
                        isEdittingItem={this.state.isEdittingItem}
                        startAndEndTimeRange={this.getStartAndEndTime()}
                        afterAddLeave={this.afterAddLeave}
                        cancelAddLeave={this.cancelAddLeave}
                    />
                </div>) : <div>
                    <span className="text-wrap">
                        {Intl.get('weekly.report.full.work.day', '全勤')}
                    </span>
                    {hasPrivilege('CALLRECORD_ASKFORLEAVE_UPDATE') ? <i className="iconfont icon-update"
                        onClick={this.handleAddAskForLeave.bind(this, userId)}></i> : null}

                </div>}
            </div>
        );
    },
    //有请假信息的时候 展示请假信息列表
    renderAskForLeave: function(record, userId) {
        return (
            <div className="leave-info-container">
                {
                    _.map(record.leave_info_list, (item, index) => {
                        var leaveArr = _.filter(LEALVE_OPTION, (option) => {
                            return option.value === item.leave_detail;
                        });
                        //是否正在编辑某条请假信息
                        var isFormShow = this.state.isEdittingItem.id === item.id && this.state.formType === 'edit' ? true : false;
                        if (isFormShow) {
                            return (
                                <AskForLeaveForm
                                    formType={this.state.formType}
                                    isEdittingItem={this.state.isEdittingItem}
                                    startAndEndTimeRange={this.getStartAndEndTime()}
                                    afterUpdateLeave={this.afterUpdateLeave}
                                    cancelUpdateLeave={this.cancelUpdateLeave}
                                />);
                        } else {
                            //展示请假信息
                            return (
                                <div>
                                    <span>{moment(item.leave_time).format(oplateConsts.DATE_FORMAT) + leaveArr[0].label + Intl.get('weekly.report.n.days', '{n}天', {n: item.leave_days})}
                                    </span>
                                    <i className="iconfont icon-update"
                                        onClick={this.handleUpdateAskForLeave.bind(this, item)}></i>
                                    <Popconfirm
                                        title={Intl.get('weekly.report.are.you.sure.del.remark', '确定要删除该条请假信息吗？')}
                                        onConfirm={this.handleRemoveAskForLeave.bind(this, item)}
                                        okText={Intl.get('common.sure', '确认')}
                                        cancelText={Intl.get('common.cancel', '取消')}
                                    >
                                        <Button className="remove-ask-leave" icon="delete"
                                            title={Intl.get('common.delete', '删除')}/>
                                    </Popconfirm>
                                    {index === record.leave_info_list.length - 1 ? (this.state.isAddingLeaveUserId === userId ? null :
                                        <div className="iconfont icon-add"
                                            onClick={this.handleAddAskForLeave.bind(this, userId)}></div> ) : null }
                                    {/*添加请假信息*/}
                                    {this.state.isAddingLeaveUserId === userId && index === record.leave_info_list.length - 1 ?
                                        <AskForLeaveForm
                                            userId={userId}
                                            formType="add"
                                            startAndEndTimeRange={this.getStartAndEndTime()}
                                            afterAddLeave={this.afterAddLeave}
                                            cancelAddLeave={this.cancelAddLeave}
                                        />
                                        : null}
                                </div>
                            );
                        }
                    })
                }
            </div>
        );
    },
    //合同数据
    getContractListColumn: function() {
        let columns = [{
            title: Intl.get('crm.6', '负责人'),
            dataIndex: 'nickName',
            align: 'left',
        }, {
            title: Intl.get('weekly.report.project', '项目'),
            dataIndex: 'customerName',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.assign.time', '签约时间'),
            dataIndex: 'date',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.contract.account', '合同金额'),
            dataIndex: 'amount',
            align: 'right',
        }, {
            title: Intl.get('contract.109', '毛利'),
            dataIndex: 'grossProfit',
            align: 'right',
        }];
        return columns;
    },
    //回款数据
    getRepaymentListColumn: function() {
        let columns = [{
            title: Intl.get('crm.6', '负责人'),
            dataIndex: 'nickName',
            align: 'left',
        }, {
            title: Intl.get('weekly.report.project', '项目'),
            dataIndex: 'customerName',
            align: 'right',
        }, {
            title: Intl.get('contract.122', '回款时间'),
            dataIndex: 'date',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.repayment.account', '回款金额'),
            dataIndex: 'amount',
            align: 'right',
        }, {
            title: Intl.get('contract.109', '毛利'),
            dataIndex: 'grossProfit',
            align: 'right',
        }];
        return columns;
    },
    // 电话接通率的数据
    getPhoneListColumn: function() {
        var _this = this;
        let columns = [{
            title: Intl.get('user.salesman', '销售人员'),
            dataIndex: 'name',
            align: 'left',
        }, {
            title: Intl.get('weekly.report.total.duration', '本周总时长'),
            dataIndex: 'total_time',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.total.connected', '本周总接通数'),
            dataIndex: 'total_callout_success',
            align: 'right',
        }, {
            title: Intl.get('sales.home.average.duration', '日均时长'),
            dataIndex: 'average_time',
            align: 'right',
        }, {
            title: Intl.get('sales.home.average.connected', '日均接通数'),
            dataIndex: 'average_num',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.assessment.days', '考核天数',),
            dataIndex: 'real_work_day',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.attendance.remarks', '出勤备注'),
            align: 'left',
            className: 'ask-leave-remark',
            width: '300',
            render: function(text, record, index) {
                var userObj = _.find(_this.props.memberList.list, (item) => {
                    return item.name === record.name;
                });
                var userId = _.get(userObj, 'id', '') || userData.getUserData().user_id;
                //正在添加请假信息
                var isAdding = _this.state.isAddingLeaveUserId === userId ? true : false;
                //没有请假信息的时候,是全勤的
                if (!record.leave_info_list) {
                    return _this.renderFullWork(isAdding, userId);

                } else if (record.leave_info_list) {
                    //有请假信息的时候 展示请假信息列表
                    return _this.renderAskForLeave(record, userId);
                }
            }
        },];
        return columns;
    },
    getCustomerStageListColumn(){
        let columns = [{
            title: Intl.get('user.salesman', '销售人员'),
            dataIndex: 'nick_name',
            align: 'left',
        }];
        _.each(this.state.stageList, (stageItem) => {
            columns.push({
                title: stageItem.name,
                align: 'right',
                render: (text) => {
                    var data = text.statistic_list;
                    //如果获取销售阶段完成并且没有出错时
                    if (stageItem.id && _.isArray(data)) {
                        var obj = _.find(data, (item) => {
                            return item.stage_id === stageItem.id;
                        });
                        return (<span>{obj && obj.statistic_data ? obj.statistic_data : 0}</span>);
                    }
                }
            });
        });
        columns.push({
            title: Intl.get('common.summation', '合计'),
            dataIndex: 'total',
            align: 'right',
        });
        return columns;
    },
    getRegionOverlayListColumn(){
        let columns = [{
            title: Intl.get('realm.select.address.province', '省份'),
            dataIndex: 'province_name',
            align: 'left',
        }, {
            title: Intl.get('weekly.report.city.province', '地市/省'),
            dataIndex: 'city_count',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.open.account', '开通数'),
            dataIndex: 'city_dredge_count',
            align: 'right',
            render: function(text, record, index) {
                return (
                    <span>
                        {text ? text : 0}
                    </span>
                );
            }
        }, {
            title: Intl.get('weekly.report.overlay.radio', '覆盖比例'),
            dataIndex: 'city_dredge_scale',
            align: 'right',
            fixNum: 4
        }, {
            title: Intl.get('weekly.report.login.count', '登录数'),
            dataIndex: 'city_login_count',
            align: 'right',
            render: function(text, record, index) {
                return (
                    <span>
                        {text ? text : 0}
                    </span>
                );
            }
        }, {
            title: Intl.get('weekly.report.active.radio', '活跃率'),
            dataIndex: 'city_active_scale',
            align: 'right',
        }, {
            title: Intl.get('crm.6', '负责人'),
            dataIndex: 'city_principal',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.district.country', '区县'),
            dataIndex: 'district_count',
            align: 'right',
        }, {
            title: Intl.get('weekly.report.open.account', '开通数'),
            dataIndex: 'district_dredge_count',
            align: 'right',
            render: function(text, record, index) {
                return (
                    <span>
                        {text ? text : 0}
                    </span>
                );
            }
        }, {
            title: Intl.get('weekly.report.overlay.radio', '覆盖比例'),
            dataIndex: 'district_dredge_scale',
            align: 'right',
            fixNum: 4
        }, {
            title: Intl.get('weekly.report.login.count', '登录数'),
            dataIndex: 'district_login_count',
            align: 'right',
            render: function(text, record, index) {
                return (
                    <span>
                        {text ? text : 0}
                    </span>
                );
            }
        }, {
            title: Intl.get('weekly.report.active.radio', '活跃率'),
            dataIndex: 'district_active_scale',
            align: 'right',
        }, {
            title: Intl.get('crm.6', '负责人'),
            dataIndex: 'district_principal',
            align: 'right',
        },];
        return columns;
    },

    getCallInfoAuth() {
        let authType = 'user';//CUSTOMER_CALLRECORD_STATISTIC_USER
        if (hasPrivilege('CUSTOMER_CALLRECORD_STATISTIC_MANAGER')) {
            authType = 'manager';
        }
        return authType;
    },
    getContractType(){
        let authType = 'common';
        if (hasPrivilege('KETAO_CONTRACT_ANALYSIS_REPORT_FORM')) {
            authType = 'manager';
        }
        return authType;
    },
    getOverlayType(){
        let authType = 'common';
        if (hasPrivilege('KETAO_SALES_TEAM_WEEKLY_REPORTS_MANAGER')) {
            authType = 'manager';
        }
        return authType;
    },
    //获取query参数
    getQueryParams(){
        let queryParams = {
            start_time: this.getBeginDateOfWeek(this.state.selectedItem.nWeek),
            end_time: this.getEndDateOfWeek(this.state.selectedItem.nWeek),
        };
        if (this.state.selectedItem.teamId){
            queryParams.team_id = this.state.selectedItem.teamId;
        }
        return queryParams;
    },
    //合同和回款的query参数
    getContractAndRepayParams(){
        let queryParams = {
            start_time: this.getBeginDateOfWeek(this.state.selectedItem.nWeek),
            end_time: this.getEndDateOfWeek(this.state.selectedItem.nWeek),
        };
        if (this.state.selectedItem.teamId){
            queryParams.sale_team_ids = this.state.selectedItem.teamId;
        }
        return queryParams;
    },
    //获取通话的queryparams参数
    getCallInfoParams(){
        let queryParams = {
            start_time: this.getBeginDateOfWeek(this.state.selectedItem.nWeek),
            end_time: this.getEndDateOfWeek(this.state.selectedItem.nWeek),
        };
        if (this.state.selectedItem.teamId){
            queryParams.team_ids = this.state.selectedItem.teamId;
        }
        return queryParams;
    },
    // 通话的接通率
    getCallInfoData(){
        var queryObj = _.clone(this.getCallInfoParams());
        queryObj.deviceType = this.state.call_type;
        let type = this.getCallInfoAuth();
        WeeklyReportDetailAction.getCallInfo(queryObj, type);
    },
    //获取合同情况
    getContractData(){
        var queryObj = _.clone(this.getContractAndRepayParams());
        let type = this.getContractType();
        WeeklyReportDetailAction.getContractInfo(queryObj, type);

    },
    //获取回款情况
    getRepaymentData(){
        var queryObj = _.clone(this.getContractAndRepayParams());
        let type = this.getContractType();
        WeeklyReportDetailAction.getRepaymentInfo(queryObj, type);
    },
    //获取区域覆盖情况
    getRegionOverlayData(){
        var queryObj = _.clone(this.getQueryParams());
        let type = this.getOverlayType();
        WeeklyReportDetailAction.getRegionOverlayInfo(queryObj, type);
    },
    //获取客户阶段情况
    getCustomerStageData(){
        var queryObj = _.clone(this.getQueryParams());
        let type = this.getOverlayType();
        WeeklyReportDetailAction.getCustomerStageInfo(queryObj, type);
    },
    //渲染不同的表格
    renderDiffTypeTable(type){
        var data = {}, retryFunction = '', columns = {};
        switch (type) {
            case 'callInfo'://电话接通率
                data = this.state.salesPhone;
                retryFunction = this.getCallInfoData;
                columns = this.getPhoneListColumn();
                break;
            case 'contactInfo'://合同信息
                data = this.state.contractData;
                retryFunction = this.getContractData;
                columns = this.getContractListColumn();
                break;
            case 'repaymentInfo'://回款信息
                data = this.state.repaymentData;
                retryFunction = this.getRepaymentData;
                columns = this.getRepaymentListColumn();
                break;
            case 'regionOverlay'://区域覆盖情况
                data = this.state.regionOverlayData;
                retryFunction = this.getRegionOverlayData;
                columns = this.getRegionOverlayListColumn();
                break;
            case 'customerStageInfo'://客户阶段统计
                data = this.state.customerStageData;
                retryFunction = this.getCustomerStageData;
                columns = this.getCustomerStageListColumn();
                break;
        }

        if (data.loading) {
            return (
                <div>
                    <Spinner />
                </div>
            );
        } else if (data.errMsg) {
            var errMsg = <span>{data.errMsg}
                <a onClick={retryFunction}>
                    {Intl.get('user.info.retry', '请重试')}
                </a></span>;
            return (
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                />
            );

        } else {
            return (
                <AntcTable
                    dataSource={data.list}
                    columns={columns}
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
        };
    },
    //获取报告区域的高度
    getReportDetailDivHeight: function() {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        var height = $(window).height() - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.TOP_DELTA - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.TOP_NAV_HEIGHT;
        return height;
    },
    render: function() {
        var divHeight = this.getReportDetailDivHeight();
        return (
            <div className="weekly-report-detail-container">
                <h4 className="total-title">
                    {this.state.selectedTeamName}{Intl.get('analysis.sales.weekly.report', '销售周报')}({this.getStartAndEndTime().startTime}{Intl.get('common.time.connector', '至')}{this.getStartAndEndTime().endTime})
                </h4>
                <div className="tables-wrap" style={{height: divHeight}}>
                    <GeminiScrollbar>
                        <div className="call-info-wrap">
                            <AntcCardContainer title={Intl.get('weekly.report.call.statics', '电话统计')}>
                                {this.renderDiffTypeTable('callInfo')}
                            </AntcCardContainer>
                        </div>
                        <div className="customer-stage-info-wrap">
                            <AntcCardContainer title={Intl.get('weekly.report.customer.stage', '客户阶段')}>
                                {this.renderDiffTypeTable('customerStageInfo')}
                            </AntcCardContainer>
                        </div>
                        <div className="region-overlay-info-wrap">
                            <AntcCardContainer title={Intl.get('weekly.report.region.overlay', '区域覆盖情况')}>
                                {this.renderDiffTypeTable('regionOverlay')}
                            </AntcCardContainer>
                        </div>
                        {hasPrivilege(PRIVILEGE_MAP.CONTRACT_BASE_PRIVILEGE) ? (
                            <div className="contract-info-wrap">
                                <AntcCardContainer title={Intl.get('weekly.report.contract', '合同情况')}>
                                    {this.renderDiffTypeTable('contactInfo')}
                                </AntcCardContainer>
                            </div>) : null}
                        {hasPrivilege(PRIVILEGE_MAP.CONTRACT_BASE_PRIVILEGE) ? (
                            <div className="repayment-info-wrap">
                                <AntcCardContainer title={Intl.get('weekly.report.repayment', '回款情况')}>
                                    {this.renderDiffTypeTable('repaymentInfo')}
                                </AntcCardContainer>
                            </div>) : null}
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});
export default WeeklyReportDetail;
