/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/7.
 */

import { num as antUtilNum } from 'ant-utils';
import WeeklyReportDetailAction from '../action/weekly-report-detail-actions';
import WeeklyReportDetailStore from '../store/weekly-report-detail-store';
import Spinner from 'CMP_DIR/spinner';
import {AntcTable, AntcCardContainer, AntcAttendanceRemarks, AntcAnalysis} from 'antc';
import {Alert, Button, Popconfirm, message} from 'antd';
import {dateSelectorEmitter, teamTreeEmitter} from 'PUB_DIR/sources/utils/emitters';
import customerCharts from 'MOD_DIR/analysis/public/charts/customer';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
var classNames = require('classnames');
import {LEALVE_OPTION} from '../utils/weekly-report-utils';
var WeekReportUtil = require('../utils/weekly-report-utils');
var userData = require('PUB_DIR/sources/user-data');
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {isOpenCaller, isOpenCash} from 'PUB_DIR/sources/utils/common-method-util';
import {formatRoundingData} from 'PUB_DIR/sources/utils/common-method-util';
import {PRIVILEGE_MAP} from 'PUB_DIR/sources/utils/consts';

const isCommonSales = userData.getUserData().isCommonSales;
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
class WeeklyReportDetail extends React.Component {
    static defaultProps = {
        selectedItem: {}
    };

    state = {
        selectedItem: this.props.selectedItem,
        selectedTeamName: this.props.selectedTeamName,
        isAddingLeaveUserId: '',//正在添加请假信息的销售
        formType: 'add',//是添加请假信息还是修改请假信息
        isEdittingItem: {},//正在编辑的请假信息
        ...WeeklyReportDetailStore.getState(),
        isShowEffectiveTimeAndCount: false, // 是否展示有效通话时长和有效接通数
    };

    onStoreChange = () => {
        this.setState(WeeklyReportDetailStore.getState());
    };

    componentDidMount() {
        WeeklyReportDetailStore.listen(this.onStoreChange);
        this.getWeeklyReportData(); // 获取电话统计、、、 数据
        this.getCallSystenConfig();
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.selectedItem, this.state.selectedItem)) {
            this.setState({
                selectedTeamName: nextProps.selectedTeamName,
                selectedItem: nextProps.selectedItem,
                isAddingLeaveUserId: ''
            }, () => {
                this.getWeeklyReportData();
            });
        }
    }

    componentWillUnmount() {
        this.setState({
            isAddingLeaveUserId: ''
        });
        WeeklyReportDetailStore.unlisten(this.onStoreChange);
    }

    // 获取组织电话系统配置
    getCallSystenConfig = () => {
        commonDataUtil.getCallSystemConfig().then(config => {
            let isShowEffectiveTimeAndCount = _.get(config,'filter_114',false) || _.get(config,'filter_customerservice_number',false);
            this.setState({ isShowEffectiveTimeAndCount });
        });
    };

    //获取某年某周的开始日期
    getBeginDateOfWeek = (year, weekIndex) => {
        return moment().year(year).isoWeek(weekIndex).startOf('isoWeek').valueOf();
    };

    //获取某年某周的结束日期
    getEndDateOfWeek = (year, weekIndex) => {
        return moment().year(year).isoWeek(weekIndex).endOf('isoWeek').valueOf();
    };

    getWeeklyReportData = () => {
        //不加延时会报错
        setTimeout(() => {
            this.getCallInfoData();// 接通率
            //开通营收中心时
            if (isOpenCash()) {
                this.getContractData();//获取合同信息
                this.getRepaymentData();//获取回款信息
            }
            this.getRegionOverlayData();//获取区域分布信息
            this.getCustomerStageData();//获取客户阶段信息
        });
    };

    //合同数据
    getContractListColumn = () => {
        let columns = [{
            title: Intl.get('crm.6', '负责人'),
            dataIndex: 'nickName',
        }, {
            title: Intl.get('weekly.report.project', '项目'),
            dataIndex: 'customerName',
        }, {
            title: Intl.get('weekly.report.assign.time', '签约时间'),
            dataIndex: 'date',
        }, {
            title: Intl.get('weekly.report.contract.account', '合同金额'),
            dataIndex: 'amount',
        }, {
            title: Intl.get('contract.109', '毛利'),
            dataIndex: 'grossProfit',
        }];
        return columns;
    };

    //回款数据
    getRepaymentListColumn = () => {
        let columns = [{
            title: Intl.get('crm.6', '负责人'),
            dataIndex: 'nickName',
        }, {
            title: Intl.get('weekly.report.project', '项目'),
            dataIndex: 'customerName',
        }, {
            title: Intl.get('contract.122', '回款时间'),
            dataIndex: 'date',
        }, {
            title: Intl.get('weekly.report.repayment.account', '回款金额'),
            dataIndex: 'amount',
        }, {
            title: Intl.get('contract.109', '毛利'),
            dataIndex: 'grossProfit',
        }];
        return columns;
    };

    // 电话接通率的数据
    getPhoneListColumn = () => {
        var _this = this;
        const col_width = 95,num_col_width = 90;
        let columns = [{
            title: Intl.get('user.salesman', '销售人员'),
            dataIndex: 'name',
            width: num_col_width,
            align: 'left',
        }, {
            title: `${Intl.get('weekly.report.total.duration', '本周总时长')}(${Intl.get('user.time.second', '秒')})`,
            dataIndex: 'total_time',
            width: 105,
            align: 'right',
        }, {
            title: `${Intl.get('sales.home.average.duration', '日均时长')}(${Intl.get('user.time.second', '秒')})`,
            dataIndex: 'average_time',
            width: 100,
            align: 'right',
            render: text => {
                return <span>{parseFloat(text).toFixed()}</span>;
            }
        }, {
            title: Intl.get('weekly.report.total.connected', '本周总接通数'),
            dataIndex: 'total_callout_success',
            width: col_width,
            align: 'right',
        }, {
            title: Intl.get('sales.home.average.connected', '日均接通数'),
            dataIndex: 'average_num',
            width: num_col_width,
            align: 'right',
        }, {
            title: Intl.get('weekly.report.assessment.days', '考核天数',),
            dataIndex: 'real_work_day',
            width: num_col_width,
            align: 'right',
        }, {
            title: Intl.get('weekly.report.attendance.remarks', '出勤备注'),
            align: 'left',
            className: 'ask-leave-remark',
            width: '300px',
            render: (text, record, index) => {
                var userObj = _.find(_this.props.memberList.list, (item) => {
                    return item.name === record.name;
                });
                var userId = _.get(userObj, 'id', '') || userData.getUserData().user_id;
                const selectedDate = moment().week(this.state.selectedItem.nWeek);
                let data = null;

                if (record.real_work_day === record.work_day) {
                    data = [];
                }

                return (
                    <AntcAttendanceRemarks
                        readOnly={isCommonSales}
                        data={data}
                        userId={userId}
                        selectedDate={selectedDate}
                        dateRangeType='week'
                        onChange={diffValue => {
                            record.real_work_day -= diffValue;
                            this.setState(this.state);
                        }}
                    />
                );
            }
        },];

        // 展示有效通话时长和有效接通数
        if(this.state.isShowEffectiveTimeAndCount){
            columns.splice(5, 0, {
                title: Intl.get('sales.home.phone.effective.connected', '有效接通数'),
                dataIndex: 'total_effective',
                key: 'total_effective',
                width: num_col_width,
                align: 'right',
                render: function(text, record, index){
                    return !text ? 0 : text;
                }
            }, {
                title: `${Intl.get('sales.home.phone.effective.time', '有效通话时长')}(${Intl.get('user.time.second', '秒')})`,
                dataIndex: 'total_effective_time',
                key: 'total_effective_time',
                align: 'right',
                width: 125,
                render: function(text, record, index){
                    return !text ? 0 : text;
                }
            });
        }

        return columns;
    };

    getCustomerStageListColumn = () => {
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
    };

    getRegionOverlayListColumn = () => {
        let columns = [{
            title: Intl.get('common.select.address.province', '省份'),
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
            render: value => {
                return <span>{antUtilNum.decimalToPercent(value)}</span>;
            }
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
            render: value => {
                return <span>{antUtilNum.decimalToPercent(value)}</span>;
            }
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
        },];
        return columns;
    };

    getCallInfoAuth = () => {
        let authType = 'user';//CUSTOMER_CALLRECORD_STATISTIC_USER
        if (hasPrivilege('CUSTOMER_CALLRECORD_STATISTIC_MANAGER')) {
            authType = 'manager';
        }
        return authType;
    };

    getContractType = () => {
        let authType = 'common';
        if (hasPrivilege(analysisPrivilegeConst.CRM_CONTRACT_SALES_REPORTS_MANAGER)) {
            authType = 'manager';
        }
        return authType;
    };

    getOverlayType = () => {
        let authType = 'common';
        if (hasPrivilege(analysisPrivilegeConst.CRM_CONTRACT_SALES_REPORTS_MANAGER)) {
            authType = 'manager';
        }
        return authType;
    };

    //获取query参数
    getQueryParams = () => {
        let queryParams = {
            start_time: this.getBeginDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek),
            end_time: this.getEndDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek),
        };
        if (this.state.selectedItem.teamId){
            queryParams.team_id = this.state.selectedItem.teamId;
        }
        return queryParams;
    };

    //合同和回款的query参数
    getContractAndRepayParams = () => {
        let queryParams = {
            start_time: this.getBeginDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek),
            end_time: this.getEndDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek),
        };
        if (this.state.selectedItem.teamId){
            queryParams.sale_team_ids = this.state.selectedItem.teamId;
        }
        return queryParams;
    };

    //获取通话的queryparams参数
    getCallInfoParams = () => {
        let queryParams = {
            start_time: this.getBeginDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek),
            end_time: this.getEndDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek),
        };

        const currentTime = moment().valueOf();

        //如果选定的结束时间大于当前时间，则将结束时间置为当前时间
        //以防止出现本周还未过的天也被统计到考核天数里的问题
        if (queryParams.end_time > currentTime) {
            queryParams.end_time = currentTime;
        }

        if (this.state.selectedItem.teamId){
            queryParams.team_ids = this.state.selectedItem.teamId;
        }
        return queryParams;
    };

    // 通话的接通率
    getCallInfoData = () => {
        var queryObj = _.clone(this.getCallInfoParams());
        queryObj.device_type = this.state.call_type;
        queryObj.statistics_type = 'user';

        if (isCommonSales) {
            const userId = userData.getUserData().user_id;
            queryObj.member_ids = userId;
            delete queryObj.team_ids;
        }
        WeeklyReportDetailAction.getCallInfo(queryObj);
    };

    //获取合同情况
    getContractData = () => {
        var queryObj = _.clone(this.getContractAndRepayParams());
        let type = this.getContractType();
        WeeklyReportDetailAction.getContractInfo(queryObj, type);

    };

    //获取回款情况
    getRepaymentData = () => {
        var queryObj = _.clone(this.getContractAndRepayParams());
        let type = this.getContractType();
        WeeklyReportDetailAction.getRepaymentInfo(queryObj, type);
    };

    //获取区域覆盖情况
    getRegionOverlayData = () => {
        var queryObj = _.clone(this.getQueryParams());
        let type = this.getOverlayType();
        WeeklyReportDetailAction.getRegionOverlayInfo(queryObj, type);
    };

    //获取客户阶段情况
    getCustomerStageData = () => {
        var queryObj = _.clone(this.getQueryParams());
        let type = this.getOverlayType();
        WeeklyReportDetailAction.getCustomerStageInfo(queryObj, type);
    };

    //渲染不同的表格
    renderDiffTypeTable = (type) => {
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
    };

    getStartAndEndTime = () => {
        return {
            startTime: moment(this.getBeginDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek)).format(oplateConsts.DATE_FORMAT),
            endTime: moment(this.getEndDateOfWeek(this.state.selectedItem.nYear, this.state.selectedItem.nWeek)).format(oplateConsts.DATE_FORMAT)
        };
    };

    //获取报告区域的高度
    getReportDetailDivHeight = () => {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        var height = $(window).height() - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.TOP_DELTA - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.TOP_NAV_HEIGHT;
        return height;
    };

    getConditions() {
        const params = this.getQueryParams();

        return [
            {
                name: 'start_time',
                value: params.start_time,
            },
            {
                name: 'end_time',
                value: params.end_time,
            },
            {
                name: 'team_ids',
                value: params.team_id,
            },
        ];
    }

    getEmitters = () => {
        return [
            {
                emitter: dateSelectorEmitter,
                event: dateSelectorEmitter.SELECT_DATE,
                callbackArgs: [{
                    name: 'start_time',
                }, {
                    name: 'end_time',
                }],
            },
            {
                emitter: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_TEAM,
                callbackArgs: [{
                    name: 'team_ids',
                }],
            },
        ];
    };

    renderSalesBehavior() {
        let salesBehaviorChart = customerCharts.getSalesBehaviorChart({
            teamList: this.props.teamList
        });

        let columns = salesBehaviorChart.option.columns;
        // 没有开通呼叫中心时，不显示日均电话时长(average_billsec)，日均电话数(average_total)这两列
        if(!isOpenCaller()) {
            salesBehaviorChart.option.columns = _.filter(columns, column => {
                return !_.includes(['average_billsec','average_total'], column.dataIndex);
            });
        }
        const charts = [
            salesBehaviorChart
        ];

        return (
            <AntcAnalysis
                charts={charts}
                conditions={this.getConditions()}
                emitterConfigList={this.getEmitters()}
                isGetDataOnMount={true}
                style={{padding: 0}}
            />
        );
    }

    render() {
        var divHeight = this.getReportDetailDivHeight();
        return (
            <div className="weekly-report-detail-container">
                <h4 className="total-title">
                    {this.state.selectedTeamName}{Intl.get('analysis.sales.weekly.report', '销售周报')}({this.getStartAndEndTime().startTime}{Intl.get('common.time.connector', '至')}{this.getStartAndEndTime().endTime})
                </h4>
                <div className="tables-wrap" style={{height: divHeight}}>
                    <GeminiScrollbar>
                        {this.state.selectedItem.teamId ? this.renderSalesBehavior() : null}
                        {/*开通呼叫中心*/}
                        {isOpenCaller() ? (
                            <div className="call-info-wrap">
                                <AntcCardContainer title={Intl.get('weekly.report.call.statics', '电话统计')}>
                                    {this.renderDiffTypeTable('callInfo')}
                                </AntcCardContainer>
                            </div>
                        ) : null}
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
                        {/*开通营收中心*/}
                        {isOpenCash() ? (
                            <div className="contract-info-wrap">
                                <AntcCardContainer title={Intl.get('weekly.report.contract', '合同情况')}>
                                    {this.renderDiffTypeTable('contactInfo')}
                                </AntcCardContainer>
                            </div>) : null}
                        {/*开通营收中心*/}
                        {isOpenCash() ? (
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
}
WeeklyReportDetail.defaultProps = {
    selectedItem: {},
    selectedTeamName: '',
    memberList: {},
    teamList: {},
};
WeeklyReportDetail.propTypes = {
    selectedItem: PropTypes.object,
    selectedTeamName: PropTypes.string,
    memberList: PropTypes.object,
    teamList: PropTypes.object,
};

export default WeeklyReportDetail;
