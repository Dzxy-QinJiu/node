var React = require('react');
require('./style.less');
import { AntcAnalysis } from 'antc';
import { Select, DatePicker} from 'antd';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'ant-ajax';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import { LEAVE_TYPES } from './consts';
import {AntcAttendanceRemarks} from 'antc';
const TopNav = require('CMP_DIR/top-nav');
const AnalysisMenu = require('CMP_DIR/analysis_menu');
const Option = Select.Option;
const MonthPicker = DatePicker.MonthPicker;
const Emitters = require('PUB_DIR/sources/utils/emitters');
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;

class MonthlyReport extends React.Component {
    state = {
        teamList: [],
        memberList: [],
        selectedTeam: '',
        selectedMonth: moment(),
    };

    componentDidMount() {
        this.getTeamList();
        this.getMemberList();
    }

    getTeamList = () => {
        const reqData = commonMethodUtil.getParamByPrivilege();

        ajax.send({
            url: '/rest/get/sale/teams/' + reqData.type,
        }).then(result => {
            this.setState({
                teamList: result,
                selectedTeam: _.get(result, '[0]'),
            });
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
        
        if (hasPrivilege('CALL_RECORD_VIEW_MANAGER')) {
            authType = 'manager';
        }

        return authType;
    };

    getDataType = () => {
        if (hasPrivilege('GET_TEAM_LIST_ALL')) {
            return 'all';
        } else {
            return 'self';
        }
    };

    renderRemarks = (text, record, recordIndex) => {
        const data = record.leave_info_list;
        const userId = record.user_id;

        return (
            <AntcAttendanceRemarks
                data={data}
                userId={userId}
                selectedMonth={this.state.selectedMonth}
            />
        );
    };

    numberRender = text => {
        return <span>{text.toFixed()}</span>;
    };

    //电话量统计表格列定义
    getPhoneStatisticsColumns = () => {
        return [
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
                width: 90,
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
                width: 90,
            },
            {
                title: Intl.get('sales.home.total.connected', '总接通数'),
                dataIndex: 'total_num',
                width: 90,
            },
            {
                title: Intl.get('weekly.report.assessment.days', '考核天数',),
                dataIndex: 'real_work_day',
                width: 90,
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
    };

    //客套app电话量统计表格列定义
    getAppStatisticsColumns = () => {
        return [
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
        return [
            {
                title: Intl.get('common.telephone.statistics', '电话量统计'),
                height: 'auto',
                layout: {sm: 24},
                url: '/rest/callrecord/v2/callrecord/query/:type/call_record/view',
                conditions: [{
                    name: 'return_type',
                    value: 'user'
                }],
                dataField: 'list',
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
                url: '/rest/callrecord/v2/callrecord/query/:type/call_record/view',
                conditions: [{
                    name: 'return_type',
                    value: 'user'
                }, {
                    name: 'deviceType',
                    value: 'app'
                }],
                dataField: 'list',
                chartType: 'table',
                option: {
                    columns: this.getAppStatisticsColumns(),
                },
            },
            {
                title: Intl.get('common.trial.qualified.customer.statistics', '试用合格客户数统计'),
                height: 'auto',
                layout: {sm: 24},
                url: '/rest/analysis/customer/v2/statistic/:data_type/customer/qualify',
                //条件参数，只对当前图表有效
                conditions: [{
                    name: 'data_type',
                    value: this.getDataType(),
                    type: 'params'
                }],
                dataField: 'list',
                processData: data => {
                    _.each(data, (item, index) => {
                        item.this_month_total = item.this_month.total;
                        item.highest_total = item.highest.total;
                        item.this_month_add_highest_total = item.this_month_add_highest.total;
                    });

                    return data;
                },
                chartType: 'table',
                option: {
                    columns: this.getTrialQualifiedColumns(),
                },
            },
        ];
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
            <div className="filter">
                {selectedTeamId ? (
                    <Select
                        defaultValue={selectedTeamId}
                        onChange={this.onTeamChange}
                        dropdownMatchSelectWidth={false}
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
                />
            </div>
        );
    };

    onTeamChange = (teamId) => {
        const selectedTeam = _.find(this.state.teamList, team => team.group_id === teamId);

        this.setState({selectedTeam});

        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamId);
    };

    onDateChange = (date) => {
        this.setState({selectedMonth: date});

        const startTime = date.startOf('month').valueOf();
        const endTime = date.endOf('month').valueOf();

        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    };

    render() {
        const selectedTeamId = _.get(this.state.selectedTeam, 'group_id');
        const selectedTeamName = _.get(this.state.selectedTeam, 'group_name');

        return (
            <div className="monthly-report" data-tracename='销售月报'>
                <TopNav>
                    <AnalysisMenu showTab={true}/>
                    {this.renderFilter(selectedTeamId)}
                </TopNav>
                <div className="monthly-report-content">
                    {selectedTeamName ? (
                        <div className="report-title">
                            <span className="team-name">
                                {selectedTeamName + Intl.get('analysis.sales.monthly.report', '销售月报')}
                            </span>
                            <span className="year-month">
                            （{this.state.selectedMonth.format(oplateConsts.DATE_YEAR_MONTH_FORMAT)}）
                            </span>
                        </div>
                    ) : null}

                    {selectedTeamId ? (
                        <AntcAnalysis
                            charts={this.getCharts()}
                            conditions={this.getConditions(selectedTeamId)}
                            emitterConfigList={this.getEmitters()}
                            isGetDataOnMount={true}
                            isUseScrollBar={true}
                        />
                    ) : null}
                </div>
            </div>
        );
    }
}

module.exports = MonthlyReport;
