require('./style.less');
import TableListPanel from 'CMP_DIR/table-list-panel';
import ajax from 'ant-ajax';
import userData from 'PUB_DIR/sources/user-data';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {AntcAnalysis, AntcDatePicker} from 'antc';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {dateSelectorEmitter, teamTreeEmitter} from 'PUB_DIR/sources/utils/emitters';
import {storageUtil} from 'ant-utils';
import {Row, Col, Select} from 'antd';
import reportCharts from './charts';
import chanceCharts from 'MOD_DIR/analysis/public/charts/chance';
import customerCharts from 'MOD_DIR/analysis/public/charts/customer';
import salesProductivityCharts from 'MOD_DIR/analysis/public/charts/sales-productivity';
import orderCharts from 'MOD_DIR/analysis/public/charts/order';
import workflowChart from 'MOD_DIR/analysis/public/charts/workflow';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import ReportLeftMenu from 'CMP_DIR/report-left-menu';

const Avatar = require('CMP_DIR/Avatar');
const Option = Select.Option;
const TopNav = require('CMP_DIR/top-nav');
//是否在蚁坊域的判断方法
const isOrganizationEefung = require('PUB_DIR/sources/utils/common-method-util').isOrganizationEefung;
const STORED_MEMBER_ID_KEY = 'sales_report_selected_member_id';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
import publicPrivilegeConst from 'PUB_DIR/privilege-const';
const authType = hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMERTRACE_STATISTICS_MANAGER) ? 'manager' : 'common';
const dataType = hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL) ? 'all' : 'self';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';

const getUserListAjax = require('MOD_DIR/common/public/ajax/user').getUserListAjax;

//销售角色
const SALES_ROLE = {
    sales_manager: '销售经理',
    customer_manager: '客户经理'
};

const now = moment();
const defaultStartTime = now.clone().startOf('week').valueOf();
const defaultEndTime = now.valueOf();

class SalesReport extends React.Component {
    state = {
        contentHeight: 600,
        memberList: [],
        stageList: [],
        currentMember: {
            user_id: storageUtil.local.get(STORED_MEMBER_ID_KEY),
        },
        startTime: defaultStartTime,
        endTime: defaultStartTime
    };

    componentDidMount() {
        //窗口大小改变事件
        $(window).on('resize', this.resizeHandler);
        this.resizeHandler();

        this.getStageList();

        //是否普通销售
        let isCommonSales = userData.getUserData().isCommonSales;

        if (isCommonSales) {
            const memberId = _.get(userData.getUserData(), 'user_id');

            if (memberId) {
                this.getSalesBaseInfo(memberId);
                this.getSalesRole(memberId);
            }
        } else {
            this.getMemberList();
        }
    }

    componentWillUnmount() {
        //卸载窗口大小改变事件
        $(window).off('resize', this.resizeHandler);
    }

    //窗口缩放时候的处理函数
    resizeHandler = () => {
        const height = $(window).height() - 85;

        this.setState({
            contentHeight: height
        });
    };

    //获取订单阶段列表
    getStageList = () => {
        ajax.send({
            url: '/rest/customer/v2/salestage'
        }).then(result => {
            this.setState({
                stageList: result.result,
            });
        });
    };

    //获取成员列表
    getMemberList = () => {
        getUserListAjax().sendRequest().success(result => {
            if (result.data) result = result.data;

            this.setState({
                memberList: result,
            });

            const storedMemberId = storageUtil.local.get(STORED_MEMBER_ID_KEY);
            const memberId = storedMemberId || _.get(result, '[0].user_id');

            if (memberId) {
                this.getSalesBaseInfo(memberId);
                this.getSalesRole(memberId);
            }
        });
    };

    //获取销售基本信息
    getSalesBaseInfo = (id) => {
        ajax.send({
            url: '/rest/global/user/' + id,
        }).then(result => {
            if (result && result.user_id) {
                if (result.create_date) {
                    result.create_date = moment(result.create_date).format(oplateConsts.DATE_FORMAT);
                }

                const currentMember = _.extend({}, this.state.currentMember, result);

                this.setState({
                    currentMember
                });
            }
        });
    };

    //获取销售角色
    getSalesRole = (id) => {
        let roleName = '';

        ajax.send({
            url: '/rest/sales/role?member_id=' + id,
        }).done(result => {
            if (result && result.teamrole_name) {
                roleName = result.teamrole_name;
            }
        }).fail(err => {
        }).always(() => {
            const currentMember = _.extend({}, this.state.currentMember, {role_name: roleName});

            this.setState({
                currentMember
            });
        });
    };

    //获取查询条件
    getConditions = () => {
        return [
            {
                name: 'auth_type',
                value: authType,
                type: 'params',
            },
            {
                name: 'data_type',
                value: dataType,
                type: 'params',
            },
            {
                name: 'start_time',
                value: defaultStartTime,
            },
            {
                name: 'end_time',
                value: defaultEndTime,
            },
            {
                name: 'member_ids',
                value: this.state.currentMember.user_id,
            },
            {
                name: 'statistics_type',
                value: 'user'
            }
        ];
    };

    //获取事件触发器
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
                event: teamTreeEmitter.SELECT_MEMBER,
                callbackArgs: [{
                    name: 'member_ids',
                }],
            },
        ];
    };

    //处理成员变更事件
    onMemberChange = (memberId) => {
        this.getSalesBaseInfo(memberId);
        this.getSalesRole(memberId);

        teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberId);
        storageUtil.local.set(STORED_MEMBER_ID_KEY, memberId);
    };

    //处理日期变更事件
    onDateChange = (startTime, endTime) => {
        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
        this.setState({startTime, endTime});
    };

    //渲染筛选器
    renderFilter = () => {
        const memberList = this.state.memberList;
        const currentMember = this.state.currentMember;

        return (
            <ButtonZones>
                <div className="btn-item-container">
                    {memberList.length ? (
                        <Select
                            showSearch
                            optionFilterProp="children"
                            dropdownMatchSelectWidth={false}
                            value={currentMember.user_id}
                            onChange={this.onMemberChange}
                            className="btn-item"
                            filterOption={(input, option) => ignoreCase(input, option)}
                        >
                            {_.map(memberList, (memberItem, index) => {
                                return <Option key={index} value={memberItem.user_id}>{memberItem.nick_name}</Option>;
                            })}
                        </Select>
                    ) : null}

                    <AntcDatePicker
                        disableDateAfterToday={true}
                        range='week'
                        onSelect={this.onDateChange}
                        selectedTimeFormat='int'
                        className="btn-item"
                    >
                        <AntcDatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</AntcDatePicker.Option>
                        <AntcDatePicker.Option
                            value="day">{Intl.get('common.time.unit.day', '天')}</AntcDatePicker.Option>
                        <AntcDatePicker.Option
                            value="week">{Intl.get('common.time.unit.week', '周')}</AntcDatePicker.Option>
                        <AntcDatePicker.Option
                            value="month">{Intl.get('common.time.unit.month', '月')}</AntcDatePicker.Option>
                        <AntcDatePicker.Option
                            value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</AntcDatePicker.Option>
                        <AntcDatePicker.Option
                            value="year">{Intl.get('common.time.unit.year', '年')}</AntcDatePicker.Option>
                        <AntcDatePicker.Option
                            value="custom">{Intl.get('user.time.custom', '自定义')}</AntcDatePicker.Option>
                    </AntcDatePicker>
                </div>
            </ButtonZones>
        );
    };

    //渲染销售基本信息
    renderBaseInfo = () => {
        const currentMember = this.state.currentMember;

        return (
            <dl className="base-info">
                <dt>{Intl.get('user.user.basic', '基本信息')}</dt>
                <dd>
                    <table>
                        <tr>
                            <td rowSpan="2">
                                <Avatar
                                    className="avatar"
                                    size="100px"
                                    lineHeight="100px"
                                    src={currentMember.user_logo}
                                    userName={currentMember.user_name}
                                    nickName={currentMember.nick_name}
                                    round={false}
                                    link={true}
                                    url="/user-preference"
                                    isUseDefaultUserImage={true}
                                />
                            </td>
                            <td className="field-name">
                                {Intl.get('common.name', '姓名')}
                            </td>
                            <td className="field-value">
                                {currentMember.nick_name}
                            </td>
                            <td className="field-name">
                                {Intl.get('common.entry.time', '入职时间')}
                            </td>
                            <td className="field-value">
                                {currentMember.create_date}
                            </td>
                        </tr>
                        <tr>
                            <td className="field-name">
                                {Intl.get('common.role', '角色')}
                            </td>
                            <td className="field-value">
                                {currentMember.role_name}
                            </td>
                            <td className="field-name">
                                {Intl.get('user.user.team', '团队')}
                            </td>
                            <td className="field-value">
                                {currentMember.team_name}
                            </td>
                        </tr>
                    </table>
                </dd>
            </dl>
        );
    };

    //渲染总体分析
    renderOverallAnalysis = () => {
        const roleName = this.state.currentMember.role_name;

        if (
            //如果当前不是在蚁坊域
            !isOrganizationEefung() || (
            //或者成员的角色不是销售经理
                roleName !== SALES_ROLE.sales_manager &&
            //也不是客户经理
            roleName !== SALES_ROLE.customer_manager)
        ) {
            //不显示总体分析
            return null;
        }

        let charts = [];

        if (roleName === SALES_ROLE.sales_manager) {
            charts.push(
                reportCharts.getSalesRankingChart('salesManager')
            );
        } else if (roleName === SALES_ROLE.customer_manager) {
            charts.push(
                reportCharts.getSalesRankingChart('customerManager')
            );
        }

        return (
            <dl>
                <dt>{Intl.get('common.overall.analysis', '总体分析')}</dt>
                <dd>
                    <AntcAnalysis
                        charts={charts}
                        conditions={this.getConditions()}
                        emitterConfigList={this.getEmitters()}
                        isGetDataOnMount={true}
                        forceUpdate={true}
                    />
                </dd>
            </dl>
        );
    };

    //渲染销售业绩
    renderSalesPerformance = () => {
        const roleName = this.state.currentMember.role_name;

        let charts = [];

        //蚁坊销售经理
        if (isOrganizationEefung() && roleName === SALES_ROLE.sales_manager) {
            charts.push(
                //新销售机会统计
                chanceCharts.getNewChanceChart('table'),
                //所有销售机会统计
                chanceCharts.getAllChanceChart(['total', 'deal', 'deal_rate'])
            );
        //蚁坊客户经理
        } else if (isOrganizationEefung() && roleName === SALES_ROLE.customer_manager) {
            // 开通营收中心
            if(commonMethodUtil.isOpenCash()) {
                charts.push(
                    //合同情况
                    reportCharts.contractChart,
                    //回款情况
                    reportCharts.repaymentChart,
                );
            }else {
                return null;
            }
        } else {
            charts.push(
                //新销售机会统计
                chanceCharts.getNewChanceChart('table'),
                //所有销售机会统计
                chanceCharts.getAllChanceChart(['total', 'deal', 'deal_rate'])
            );

            // 开通营收中心
            if(commonMethodUtil.isOpenCash()) {
                charts.push(
                    //合同情况
                    reportCharts.contractChart,
                    //回款情况
                    reportCharts.repaymentChart,
                );
            }else {
                return null;
            }
        }

        return (
            <dl>
                <dt>{Intl.get('common.sales.performance', '销售业绩')}</dt>
                <dd>
                    <AntcAnalysis
                        charts={charts}
                        conditions={this.getConditions()}
                        emitterConfigList={this.getEmitters()}
                        isGetDataOnMount={true}
                        forceUpdate={true}
                    />
                </dd>
            </dl>
        );
    };

    //渲染销售行为
    renderSalesBehavior = () => {
        const roleName = this.state.currentMember.role_name;

        let charts = [];

        //蚁坊销售经理
        if (isOrganizationEefung() && roleName === SALES_ROLE.sales_manager) {
            // 开通呼叫中心
            if(commonMethodUtil.isOpenCaller()) {
                charts.push(
                    //电话量
                    reportCharts.callVolumeChart
                );
            }
            charts.push(
                //客户阶段
                customerCharts.getCustomerStageChart(),
                //客户活跃度统计
                customerCharts.getCustomerActiveTrendChart('客户活跃度统计', 'day', true),
                //新开客户登录
                reportCharts.newCustomerLoginChart(),
                //合格客户数统计
                customerCharts.getCustomerNumChart({
                    title: '合格客户数统计',
                    stage: 'qualified'
                }),
                //联系客户频率统计
                customerCharts.getContactCustomerIntervalChart(),
            );
        //蚁坊客户经理
        } else if (isOrganizationEefung() && roleName === SALES_ROLE.customer_manager) {
            charts.push(
                //客户数统计
                customerCharts.getCustomerNumChart(),
                //销售行为统计
                salesProductivityCharts.getSalesBehaviorVisitCustomerChart(),
                //订单阶段
                orderCharts.getOrderStageChart({
                    stageList: this.state.stageList
                }),
                //客户阶段
                customerCharts.getCustomerStageChart(),
                //联系客户频率统计
                customerCharts.getContactCustomerIntervalChart(),
                //客户流失率统计
                customerCharts.getCustomerLoseRateChart(),
                //客户活跃度统计
                customerCharts.getCustomerActiveTrendChart('客户活跃度统计', 'day', true),
            );
        } else {
            // 开通呼叫中心
            if(commonMethodUtil.isOpenCaller()) {
                charts.push(
                    //电话量
                    reportCharts.callVolumeChart
                );
            }
            charts.push(
                //客户阶段
                customerCharts.getCustomerStageChart(),
                //客户活跃度统计
                customerCharts.getCustomerActiveTrendChart('客户活跃度统计', 'day', true),
                //新开客户登录
                reportCharts.newCustomerLoginChart(),
                //合格客户数统计
                customerCharts.getCustomerNumChart({
                    title: '合格客户数统计',
                    stage: 'qualified'
                }),
                //联系客户频率统计
                customerCharts.getContactCustomerIntervalChart(),
                //客户数统计
                customerCharts.getCustomerNumChart(),
                //销售行为统计
                salesProductivityCharts.getSalesBehaviorVisitCustomerChart(),
                //订单阶段
                orderCharts.getOrderStageChart({
                    stageList: this.state.stageList
                }),
                //客户阶段
                customerCharts.getCustomerStageChart(),
                //联系客户频率统计
                customerCharts.getContactCustomerIntervalChart(),
                //客户流失率统计
                customerCharts.getCustomerLoseRateChart(),
                //客户活跃度统计
                customerCharts.getCustomerActiveTrendChart('客户活跃度统计', 'day', true),
            );
        }

        return (
            <dl>
                <dt>{Intl.get('common.sales.behavior', '销售行为')}</dt>
                <dd>
                    <AntcAnalysis
                        charts={charts}
                        conditions={this.getConditions()}
                        emitterConfigList={this.getEmitters()}
                        isGetDataOnMount={true}
                        forceUpdate={true}
                    />
                </dd>
            </dl>
        );
    };

    //渲染出勤统计
    renderAttendance = () => {
        const charts = [workflowChart.getAttendanceChart()];

        return (
            <dl>
                <dt>出勤统计</dt>
                <dd>
                    <AntcAnalysis
                        charts={charts}
                        conditions={this.getConditions()}
                        emitterConfigList={this.getEmitters()}
                        isGetDataOnMount={true}
                        forceUpdate={true}
                    />
                </dd>
            </dl>
        );
    };

    render() {
        const memberId = this.state.currentMember.user_id;

        return (
            <div className="sales-report" data-tracename='销售报告'>
                {this.renderFilter()}
                <div className="report-content">
                    <Row>
                        <Col span={3}>
                            <ReportLeftMenu/>
                        </Col>
                        <Col span={21} style={{height: this.state.contentHeight}}>
                            <GeminiScrollBar>
                                {this.renderBaseInfo()}
                                {(memberId) ? (
                                    <div>
                                        {this.renderOverallAnalysis()}
                                        {this.renderSalesPerformance()}
                                        {this.renderSalesBehavior()}
                                        {this.renderAttendance()}
                                    </div>
                                ) : null}
                            </GeminiScrollBar>
                        </Col>
                    </Row>
                </div>
                <TableListPanel/>
            </div>
        );
    }
}

module.exports = SalesReport;
