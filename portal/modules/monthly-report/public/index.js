import { ORGANIZATION_TYPE } from 'PUB_DIR/sources/utils/consts';

var React = require('react');
require('./style.less');
import {AntcAnalysis} from 'antc';
import workflowChart from 'MOD_DIR/analysis/public/charts/workflow';
import {Row, Col, Select, DatePicker} from 'antd';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import ajax from 'ant-ajax';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {LEAVE_TYPES} from './consts';
import {AntcAttendanceRemarks} from 'antc';
import publicPrivilegeConst from 'PUB_DIR/privilege-const';

import ReportLeftMenu from 'CMP_DIR/report-left-menu';

const Option = Select.Option;
const MonthPicker = DatePicker.MonthPicker;
const Emitters = require('PUB_DIR/sources/utils/emitters');
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;
const userData = require('PUB_DIR/sources/user-data');
//是否普通销售
const isCommonSales = userData.getUserData().isCommonSales;
const commanSalesCallback = function(arg) {
    //如果是普通销售
    if (isCommonSales) {
        const userId = userData.getUserData().user_id;
        //只查询他自己的数据
        arg.query.member_ids = userId;
        delete arg.query.team_ids;
    }
};

import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import {storageUtil} from 'ant-utils';

const STORED_TEAM_KEY = 'monthly_report_selected_team';
import {getMyTeamTreeAndFlattenList,getCallSystemConfig} from 'PUB_DIR/sources/utils/common-data-util';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

class MonthlyReport extends React.Component {
    state = {
        teamList: [],
        memberList: [],
        selectedTeam: '',
        selectedMonth: moment(),
        isShowEffectiveTimeAndCount: false, // 是否展示有效通话时长和有效接通数
    };

    componentDidMount() {
        //让顶部栏上的报告菜单显示选中状态
        $('.analysis_report_ico a').addClass('active');
        this.getTeamList();
        this.getMemberList();
        this.getCallSystemConfig();
    }

    // 获取组织电话系统配置
    getCallSystemConfig = () => {
        getCallSystemConfig().then(config => {
            let isShowEffectiveTimeAndCount = _.get(config,'filter_114',false) || _.get(config,'filter_customerservice_number',false);
            this.setState({ isShowEffectiveTimeAndCount });
        });
    };

    getTeamList = () => {
        const reqData = commonMethodUtil.getParamByPrivilege();
        getMyTeamTreeAndFlattenList(data => {
            var result = data.teamList;
            if (!data.errorMsg) {
                const storedTeam = storageUtil.local.get(STORED_TEAM_KEY);
                const selectedTeam = storedTeam || _.get(result, '[0]');
                this.setState({
                    teamList: result,
                    selectedTeam,
                });
            }
        });
    };

    getMemberList = () => {
        const reqData = commonMethodUtil.getParamByPrivilege();

        ajax.send({
            url: '/rest/base/v1/group/team/members/' + reqData.type,
        }).then(result => {
            this.setState({
                memberList: result,
            });
        });
    };

    getAuthType = () => {
        let authType = 'user';//CALL_RECORD_VIEW_USER

        if (hasPrivilege(analysisPrivilegeConst.CALL_RECORD_VIEW_MANAGER)) {
            authType = 'manager';
        }

        return authType;
    };

    getDataType = () => {
        if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL)) {
            return 'all';
        } else {
            return 'self';
        }
    };

    renderRemarks = (text, record, recordIndex) => {
        const userId = record.user_id;
        let data = null;

        if (record.real_work_day === record.work_day) {
            data = [];
        }

        return (
            <AntcAttendanceRemarks
                readOnly={isCommonSales}
                data={data}
                userId={userId}
                selectedDate={this.state.selectedMonth}
                onChange={() => {
                    teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, this.state.selectedTeam);
                }}
            />
        );
    };

    numberRender = text => {
        return <span>{_.isNumber(text) && text.toFixed()}</span>;
    };

    //电话量统计表格列定义
    getPhoneStatisticsColumns = () => {
        const num_col_width = 90;
        let columns = [
            {
                title: Intl.get('common.ranking', '排名'),
                dataIndex: 'rank',
                width: 50,
            },
            {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'name',
                width: 80,
            },
            {
                title: Intl.get('common.assessment.index', '考核指标'),
                dataIndex: 'assessment_index',
                sorter: (a, b) => a.assessment_index - b.assessment_index,
                render: this.numberRender,
                width: 95,
            },
            {
                title: `${Intl.get('sales.home.average.duration', '日均时长')}(${Intl.get('user.time.second', '秒')})`,
                dataIndex: 'average_time',
                render: this.numberRender,
                width: 100,
            },
            {
                title: Intl.get('sales.home.average.connected', '日均接通数'),
                dataIndex: 'average_num',
                render: this.numberRender,
                width: 90,
            },
            {
                title: `${Intl.get('sales.home.total.duration', '总时长')}(${Intl.get('user.time.second', '秒')})`,
                dataIndex: 'total_time',
                width: num_col_width,
            },
            {
                title: Intl.get('sales.home.total.connected', '总接通数'),
                dataIndex: 'total_callout_success',
                width: num_col_width,
            },
            {
                title: Intl.get('weekly.report.assessment.days', '考核天数',),
                dataIndex: 'real_work_day',
                width: num_col_width,
            },
            {
                title: Intl.get('common.remark', '备注'),
                dataIndex: 'leave_info_list',
                render: this.renderRemarks,
                csvRenderTd: leaveInfoList => {
                    let content = Intl.get('weekly.report.full.work.day', '全勤');

                    if (leaveInfoList) {
                        const remarksList = _.map(leaveInfoList, remarks => {
                            const leaveTime = moment(remarks.leave_time).format(oplateConsts.DATE_FORMAT);
                            const leaveDetail = remarks.leave_detail;
                            const leaveDays = remarks.leave_days;
                            const leaveType = _.find(LEAVE_TYPES, typeItem => typeItem.value === leaveDetail);
                            let leaveDetailLabel = '';

                            if (leaveType) {
                                leaveDetailLabel = leaveType.label;
                            }

                            const text = leaveTime + leaveDetailLabel + Intl.get('weekly.report.n.days', '{n}天', {n: leaveDays});
                            return text;
                        });

                        content = remarksList.join('; ');
                    }

                    return content;
                },
            },
        ];

        // 展示有效通话时长和有效接通数
        if(this.state.isShowEffectiveTimeAndCount){
            columns.splice(7, 0, {
                title: Intl.get('sales.home.phone.effective.connected', '有效接通数'),
                dataIndex: 'total_effective',
                key: 'total_effective',
                align: 'right',
                width: num_col_width,
                render: text => {
                    return text || 0;
                }
            }, {
                title: `${Intl.get('sales.home.phone.effective.time', '有效通话时长')}(${Intl.get('user.time.second', '秒')})`,
                dataIndex: 'total_effective_time',
                key: 'total_effective_time',
                align: 'right',
                width: 130,
                render: text => {
                    return text || 0;
                }
            });
        }

        return columns;
    };

    //客套app电话量统计表格列定义
    getAppStatisticsColumns = () => {
        let columns = [
            {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'name',
                width: '10%',
            },
            {
                title: `${Intl.get('sales.home.total.duration', '总时长')}(${Intl.get('user.time.second', '秒')})`,
                dataIndex: 'total_time',
                width: '10%',
            },
            {
                title: Intl.get('sales.home.total.connected', '总接通数'),
                dataIndex: 'total_num',
                width: '10%',
            },
            {
                title: `${Intl.get('sales.home.phone.billing.time', '计费时长')}(${Intl.get('common.app.minute', '分钟')})`,
                dataIndex: 'charged_duration',
                render: this.numberRender,
                sorter: (a, b) => a.charged_duration - b.charged_duration,
                width: '10%',
            },
            {
                title: `${Intl.get('common.call.charge', '话费')}(${Intl.get('contract.82', '元')})`,
                dataIndex: 'call_charge',
                width: '10%',
            },
        ];

        // 展示有效通话时长和有效接通数
        if(this.state.isShowEffectiveTimeAndCount){
            columns.push({
                title: Intl.get('sales.home.phone.effective.connected', '有效接通数'),
                dataIndex: 'total_effective',
                key: 'total_effective',
                width: '10%',
            }, {
                title: `${Intl.get('sales.home.phone.effective.time', '有效通话时长')}(${Intl.get('user.time.second', '秒')})`,
                dataIndex: 'total_effective_time',
                key: 'total_effective_time',
                width: '10%',
            });
        }
        return columns;
    };

    //试用合格客户数统计表格列定义
    getTrialQualifiedColumns = () => {
        return [
            {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'nick_name',
                width: '10%',
            },
            {
                title: Intl.get('common.this.month.qualified.customers.num', '本月合格客户数'),
                dataIndex: 'this_month_total',
                width: '10%',
            },
            {
                title: Intl.get('common.history.highest.qualified.customers.num', '历史最高合格客户数'),
                dataIndex: 'highest_total',
                width: '10%',
            },
            {
                title: Intl.get('common.net.increase.qualified.customers.num', '净增合格客户数'),
                dataIndex: 'this_month_add_highest_total',
                sorter: (a, b) => a.this_month_add_highest_total - b.this_month_add_highest_total,
                width: '10%',
            },
        ];
    };

    getCharts = () => {
        let conditions = [{
            name: 'statistics_type',
            value: 'user'
        }];

        let charts = [];

        // 开通呼叫中心
        if(commonMethodUtil.isOpenCaller()) {
            charts.push(
                {
                    title: Intl.get('common.telephone.statistics', '电话量统计'),
                    height: 'auto',
                    layout: {sm: 24},
                    url: '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
                    conditions,
                    argCallback: commanSalesCallback,
                    dataField: 'result',
                    processData: data => {
                        data = _.orderBy(data, 'assessment_index', 'desc');

                        _.each(data, (item, index) => {
                            item.rank = index + 1;
                            const currentMember = _.find(this.state.memberList, member => member.nick_name === item.name);
                            item.user_id = _.get(currentMember, 'user_id');
                        });

                        return data;
                    },
                    chartType: 'table',
                    option: {
                        columns: this.getPhoneStatisticsColumns(),
                    },
                },
                {
                    title: Intl.get('common.ketao.app.telephone.statistics', '客套APP电话量统计'),
                    height: 'auto',
                    layout: {sm: 24},
                    url: '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
                    conditions: [...conditions, {
                        name: 'device_type',
                        value: 'app'
                    }],
                    argCallback: commanSalesCallback,
                    dataField: 'result',
                    chartType: 'table',
                    option: {
                        columns: this.getAppStatisticsColumns(),
                    },
                }
            );
        }
        charts.push({
            title: Intl.get('common.trial.qualified.customer.statistics', '试用合格客户数统计'),
            height: 'auto',
            layout: {sm: 24},
            url: '/rest/analysis/customer/v2/statistic/:data_type/customer/qualify',
            //条件参数，只对当前图表有效
            conditions: [{
                name: 'data_type',
                value: this.getDataType(),
                type: 'params'
            }, {
                name: 'statistics_type',
                value: 'user',
            }],
            argCallback: (arg) => {
                let query = arg.query;

                //因后端统计规则原因，这个统计和其他统计不太一样，其查询区间为当月的2号到下月的1号
                //所以查询开始时间从当月2号开始
                query.start_time = moment(query.start_time).startOf('month').add(1, 'days').valueOf();
                //查询结束时间为下月1号
                query.end_time = moment(query.end_time).endOf('month').add(1, 'days').valueOf();
            },
            dataField: 'list',
            processData: data => {
                _.each(data, (item, index) => {
                    item.this_month_total = _.get(item, 'this_month.total', 0);
                    item.highest_total = _.get(item, 'highest.total', 0);
                    item.this_month_add_highest_total = _.get(item, 'this_month_add_highest.total', 0);
                });

                return data;
            },
            chartType: 'table',
            option: {
                columns: this.getTrialQualifiedColumns(),
            },
        });

        charts.push(
            workflowChart.getOffdutyChart({
                type: 'personal_leave',
                title: '请假统计'
            }),
            workflowChart.getOffdutyChart({
                type: 'customer_visit',
                title: '出差统计'
            }),
            workflowChart.getOffdutyChart({
                type: 'businesstrip_awhile',
                title: '外出统计'
            })
        );

        return charts;
    };

    //公共条件，应用于所有图表
    getConditions = (selectedTeamId) => {
        return [
            {
                name: 'type',
                value: this.getAuthType(),
                type: 'params',
            },
            {
                name: 'start_time',
                value: moment().startOf('month').valueOf(),
            },
            {
                name: 'end_time',
                value: moment().valueOf(),
            },
            {
                name: 'team_ids',
                value: selectedTeamId,
            },
        ];
    };

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

    renderFilter = (selectedTeamId) => {
        return (
            <div className="btn-item-container">
                {selectedTeamId && this.state.teamList.length > 1 ? (
                    <Select
                        defaultValue={selectedTeamId}
                        onChange={this.onTeamChange}
                        dropdownMatchSelectWidth={false}
                        className="btn-item"
                    >
                        {_.map(this.state.teamList, (teamItem, index) => {
                            return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                        })}
                    </Select>
                ) : null}

                <MonthPicker
                    defaultValue={moment()}
                    onChange={this.onDateChange}
                    allowClear={false}
                    disabledDate={current => current && current > moment()}
                    className="btn-item"
                />
            </div>
        );
    };

    onTeamChange = (teamId) => {
        const selectedTeam = _.find(this.state.teamList, team => team.group_id === teamId);

        this.setState({selectedTeam});

        storageUtil.local.set(STORED_TEAM_KEY, selectedTeam);

        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamId);
    };

    onDateChange = (date) => {
        this.setState({selectedMonth: date});

        const startTime = date.startOf('month').valueOf();
        const endTime = date.endOf('month').valueOf();

        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    };
    //渲染操作按钮区
    renderTopNavOperation = () => {
        const selectedTeamId = _.get(this.state.selectedTeam, 'group_id');
        return (<ButtonZones>{this.renderFilter(selectedTeamId)}</ButtonZones>);
    };

    render() {
        const selectedTeamId = _.get(this.state.selectedTeam, 'group_id');
        const selectedTeamName = _.get(this.state.selectedTeam, 'group_name', '');

        return (
            <div className="monthly-report" data-tracename='销售月报'>
                {
                    this.renderTopNavOperation()
                }
                <div className="monthly-report-content">
                    <Row>
                        <Col span={3}>
                            <ReportLeftMenu/>
                        </Col>
                        <Col span={21}>
                            <div className="report-title">
                                <span className="team-name">
                                    {selectedTeamName + Intl.get('contract.15', '月报')}
                                </span>
                                <span className="year-month">
                                （{this.state.selectedMonth.format(oplateConsts.DATE_YEAR_MONTH_FORMAT)}）
                                </span>
                            </div>

                            <AntcAnalysis
                                charts={this.getCharts()}
                                conditions={this.getConditions(selectedTeamId)}
                                emitterConfigList={this.getEmitters()}
                                isGetDataOnMount={true}
                                isUseScrollBar={true}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

module.exports = MonthlyReport;
