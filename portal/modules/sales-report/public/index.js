require('./style.less');
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
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import ReportLeftMenu from 'CMP_DIR/report-left-menu';

const Avatar = require('CMP_DIR/Avatar');
const Option = Select.Option;
const TopNav = require('CMP_DIR/top-nav');
const STORED_MEMBER_ID_KEY = 'sales_report_selected_member_id';
const authType = hasPrivilege('CALL_RECORD_VIEW_MANAGER') ? 'manager' : 'user';
const dataType = hasPrivilege('GET_TEAM_LIST_ALL') ? 'all' : 'self';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
//销售角色
const SALES_ROLE = {
    sales_manager: '销售经理',
    customer_manager: '客户经理'
};

class SalesReport extends React.Component {
    state = {
        contentHeight: 600,
        memberList: [],
        stageList: [],
        currentMember: {
            user_id: storageUtil.local.get(STORED_MEMBER_ID_KEY),
        },
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
        const reqData = commonMethodUtil.getParamByPrivilege();

        ajax.send({
            url: '/rest/base/v1/group/team/members/' + reqData.type,
        }).then(result => {
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
            if (result && result.create_date) {
                result.create_date = moment(result.create_date).format(oplateConsts.DATE_FORMAT);

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
                value: moment().startOf('week').valueOf(),
            },
            {
                name: 'end_time',
                value: moment().valueOf(),
            },
            {
                name: 'member_id',
                value: this.state.currentMember.user_id,
            },
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
                    name: 'member_id',
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
    };

    //渲染筛选器
    renderFilter = () => {
        const memberList = this.state.memberList;
        const currentMember = this.state.currentMember;

        return (<ButtonZones>
            <div className="filter">
                {memberList.length ? (
                    <Select
                        showSearch
                        optionFilterProp="children"
                        style={{width: 100}}
                        value={currentMember.user_id}
                        onChange={this.onMemberChange}
                    >
                        {_.map(memberList, (memberItem, index) => {
                            return <Option key={index} value={memberItem.user_id}>{memberItem.nick_name}</Option>;
                        })}
                    </Select>
                ) : null}

                <AntcDatePicker
                    disableDateAfterToday={true}
                    range='week'
                    onSelect={this.onDateChange}>
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
                                    src={currentMember.user_logo}
                                    userName={currentMember.user_name}
                                    nickName={currentMember.nick_name}
                                    round={false}
                                    link={true}
                                    url="/user_info_manage"
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

        let charts = [];

        if (roleName === SALES_ROLE.sales_manager) {
            charts.push(
                reportCharts.getSalesRankingChart('salesManager')
            );
        } else {
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

        if (roleName === SALES_ROLE.sales_manager) {
            charts.push(
                //新销售机会统计
                chanceCharts.getNewChanceChart('table'),
                //所有销售机会统计
                chanceCharts.getAllChanceChart(['total', 'deal', 'deal_rate'])
            );
        } else {
            charts.push(
                reportCharts.contractChart,
                reportCharts.repaymentChart,
            );
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
        if (!this.state.currentMember.team_id) return;

        const roleName = this.state.currentMember.role_name;

        let charts = [];

        if (roleName === SALES_ROLE.sales_manager) {
            charts.push(
                //电话量
                reportCharts.callVolumeChart,
                //客户阶段
                reportCharts.customerStageChart,
                //客户活跃率
                reportCharts.customerActiveChart,
                //新开客户登录
                reportCharts.newCustomerLoginChart(this.state.currentMember.team_id, this.state.currentMember.member_id),
            );
        } else {
            charts.push(
                //销售行为统计
                reportCharts.salesBehaviorChart,
                //订单阶段
                reportCharts.getOrderStageChart(this.state.stageList),
                //客户阶段
                reportCharts.customerStageChart,
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

    render() {
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
                                {this.renderOverallAnalysis()}
                                {this.renderSalesPerformance()}
                                {this.renderSalesBehavior()}
                            </GeminiScrollBar>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

module.exports = SalesReport;
