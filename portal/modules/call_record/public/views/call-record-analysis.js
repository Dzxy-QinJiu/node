/**
 * 通话分析 
 */

import {Select} from 'antd';
const Option = Select.Option;
var RightContent = require('CMP_DIR/privilege/right-content');
var TopNav = require('CMP_DIR/top-nav');
import { AntcAnalysis, AntcDatePicker } from 'antc';
import CallAnalysisAction from '../action/call-analysis-action';
import CallAnalysisStore from '../store/call-analysis-store';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanelClose = rightPanelUtil.RightPanelClose;
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import Trace from 'LIB_DIR/trace';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {CALL_TYPE_OPTION} from 'PUB_DIR/sources/utils/consts';
import {dateSelectorEmitter, teamTreeEmitter, callDeviceTypeEmitter} from 'PUB_DIR/sources/utils/emitters';
import callChart from 'MOD_DIR/analysis/public/charts/call';
import BackMainPage from 'CMP_DIR/btn-back';

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 65,
    BOTTOM_DISTANCE: 70
};

const LITERAL_CONSTANT = {
    ALL: Intl.get('common.all', '全部'),
    TEAM: Intl.get('user.user.team', '团队'),
    MEMBER: Intl.get('member.member', '成员')
};

const FIRSR_SELECT_DATA = [LITERAL_CONSTANT.TEAM, LITERAL_CONSTANT.MEMBER];

const DEFAULT_TIME_RANGE = 'day';

class CallRecordAnalyis extends React.Component {
    static propTypes = {
        closeCallAnalysisPanel: PropTypes.func
    };

    constructor(props) {
        super(props);

        const callStateData = CallAnalysisStore.getState();

        this.state = {
            ...callStateData,
            firstSelectValue: FIRSR_SELECT_DATA[0], // 第一个选择框的值
            secondSelectValue: LITERAL_CONSTANT.ALL, // 第二个选择宽的值，默认是全部的状态
            teamMemberFilterType: 'team', // 按团队还是成员筛选
            isShowEffectiveTimeAndCount: this.props.isShowEffectiveTimeAndCount, // 是否展示有效通话时长和有效接通数
            startTime: moment().startOf(DEFAULT_TIME_RANGE).valueOf(),
        };
    }

    onStoreChange = () => {
        this.setState(CallAnalysisStore.getState());
    };

    componentDidMount() {
        CallAnalysisStore.listen(this.onStoreChange);

        let reqData = commonMethodUtil.getParamByPrivilege();

        // 获取销售团队数据
        CallAnalysisAction.getSaleGroupTeams(reqData);
        // 获取成员数据
        CallAnalysisAction.getSaleMemberList(reqData);
    }

    componentWillUnmount() {
        CallAnalysisStore.unlisten(this.onStoreChange);
    }

    // 通话类型的筛选框
    filterCallTypeSelect = () => {
        return (
            <div className="call-type-select btn-item">
                <SelectFullWidth
                    defaultValue={CALL_TYPE_OPTION.ALL}
                    onChange={this.selectCallTypeValue}
                >
                    <Option value={CALL_TYPE_OPTION.ALL}>
                        {Intl.get('user.online.all.type', '全部类型')}
                    </Option>
                    <Option value={CALL_TYPE_OPTION.PHONE}>
                        {Intl.get('call.record.call.center', '呼叫中心')}
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        {Intl.get('common.ketao.app', '客套APP')}
                    </Option>
                </SelectFullWidth>
            </div>
        );
    };

    // 选择通话类型的值
    selectCallTypeValue = (value) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.call-type-select'), '根据通话类型过滤');

        callDeviceTypeEmitter.emit(callDeviceTypeEmitter.CHANGE_CALL_DEVICE_TYPE, value);
    };

    getConditions() {
        return [
            {
                name: 'start_time',
                value: moment().startOf(DEFAULT_TIME_RANGE).valueOf(),
            },
            {
                name: 'end_time',
                value: moment().endOf(DEFAULT_TIME_RANGE).valueOf(),
            },
            {
                name: 'interval',
                value: DEFAULT_TIME_RANGE,
            },
            {
                name: 'team_ids',
                value: '',
            },
            {
                name: 'member_ids',
                value: '',
            },
            {
                name: 'device_type',
                value: 'all',
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
                }, {
                    name: 'interval',
                }],
            },
            {
                emitter: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_TEAM,
                callbackArgs: [{
                    name: 'team_ids',
                    exclusive: 'member_ids',
                    related: {
                        name: 'statistics_type',
                        value: 'team'
                    }
                }],
            }, {
                emitter: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_MEMBER,
                callbackArgs: [{
                    name: 'member_ids',
                    exclusive: 'team_ids',
                    related: {
                        name: 'statistics_type',
                        value: 'user'
                    }
                }],
            }, {
                emitter: callDeviceTypeEmitter,
                event: callDeviceTypeEmitter.CHANGE_CALL_DEVICE_TYPE,
                callbackArgs: [{
                    name: 'device_type'
                }],
            }
        ];
    };

    getCharts() {
        return [
            //通话趋势统计
            callChart.getCallNumberTimeTrendChart({Store: this.state}),
            //通话记录统计
            callChart.getCallRecordChart({
                Store: this.state
            }),
            //电话行业统计
            callChart.getCallIndustryChart(),
            //通话总次数TOP10
            callChart.getTotalNumberTop10Chart(),
            //通话总时长TOP10
            callChart.getTotalDurationTop10Chart(),
            //单次通话时长TOP10
            callChart.getSingleDurationTop10Chart(),
            //114占比统计
            callChart.getCall114RatioChart(),
            //客服电话统计
            callChart.getCallServiceTelChart(),
            //通话时段统计
            callChart.getCallTimeIntervalChart(),
            //客户阶段统计
            callChart.getCallCustomerStageChart(),
            //订单阶段统计
            callChart.getCallOrderStageChart(),
            //客户的地域分布
            callChart.getCallCustomerGeographicalDistributionChart(),
        ];
    }

    //时间的设置
    onSelectDate = (startTime, endTime, interval) => {
        this.setState({ startTime }, () => {
            //根据和后端的约定，对自定义类型和全部时间类型做一下转换
            if (interval === 'custom') interval = 'day';
            if (interval === 'all') interval = 'year';

            dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime, interval);
        });
    };

    handleSelectTeamOrMember = () => {
        if (this.state.teamList.list.length > 1) {
            if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据团队过滤');
            } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据成员过滤');
            }
        } else if (this.state.teamList.list.length === 1) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据成员过滤');
        }
    };

    // 团队和成员筛选框
    renderTeamMembersSelect = () => {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list; // 成员数据

        // 第一个选择框渲染的数据
        let firstOptions = FIRSR_SELECT_DATA.map((item, index) => {
            return <Option value={item} key={index}>{item}</Option>;
        });

        // 第二个选择框的数据
        let secondOptions = [];
        if (teamList.length === 1) { // 只展示成员选择框时
            secondOptions = memberList.map((item, index) => {
                return <Option value={item.id} key={index}>{item.name}</Option>;
            });
        } else if (teamList.length > 1) { // 展示团队和成员
            if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
                secondOptions = teamList.map((item, index) => {
                    return <Option value={item.id} key={index}>{item.name}</Option>;
                });
            } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
                secondOptions = memberList.map((item, index) => {
                    return <Option value={item.id} key={index}>{item.name}</Option>;
                });
            }
        }

        secondOptions.unshift(<Option value={LITERAL_CONSTANT.ALL}>{LITERAL_CONSTANT.ALL}</Option>);

        return (
            <div>
                { teamList.length > 1 ? (
                    <SelectFullWidth
                        defaultValue={FIRSR_SELECT_DATA[0]}
                        onChange={this.handleFirstSelectChange}
                        className="btn-item"
                    >
                        {firstOptions}
                    </SelectFullWidth>
                ) : null }
                { memberList.length > 1 ? (
                    <SelectFullWidth
                        multiple
                        showSearch
                        optionFilterProp="children"
                        value={this.state.secondSelectValue}
                        onChange={this.onSecondSelectChange}
                        className="team-member-select-options btn-item"
                        onSelect={this.handleSelectTeamOrMember}
                    >
                        {secondOptions}
                    </SelectFullWidth>
                ) : null }
            </div>
        );
    };

    // 团队和成员框的选择
    handleFirstSelectChange = (value) => {
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '选择成员过滤');
        } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '选择团队过滤');
        }

        const teamMemberFilterType = value === LITERAL_CONSTANT.MEMBER ? 'member' : 'team';

        this.setState({
            firstSelectValue: value,
            secondSelectValue: LITERAL_CONSTANT.ALL,
            teamMemberFilterType
        }, () => {
            if (value === LITERAL_CONSTANT.MEMBER) {
                teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, '');
            } else {
                teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, '');
            }
        });
    };

    // 第二个选择框，具体的值：全部和多个选择之间的切换显示
    onSecondSelectChange = (value) => {
        // 处理选择全部和多个的情况
        if (value[0] === LITERAL_CONSTANT.ALL && value.length > 1) {
            value.shift(); // 选择具体的某个成员后或团队时，‘全部’应该删除
        } else if (value[0] !== LITERAL_CONSTANT.ALL && _.indexOf(value, LITERAL_CONSTANT.ALL) !== -1 || value.length === 0) {
            value = LITERAL_CONSTANT.ALL; // 选择全部时，其他选项应该不显示
        }

        let valueStr = '';

        if (_.isArray(value)) {
            valueStr = value.join(',');
        }

        //团队数大于一个时，才有可能按团队筛选
        //此时若指定按团队筛选
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM && _.get(this.state.teamList, 'list.length') > 1) {
            //发射团队选中事件
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, valueStr);
        } else {
            //发射成员选中事件
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, valueStr);
        }

        this.setState({ secondSelectValue: value });
    };

    render() {
        const tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - $('.duration-count-chart').height();

        return (
            <RightContent>
                <div className="call-analysis-content" data-tracename="通话分析界面">
                    <TopNav>
                        <div className="date-range-wrap">
                            {/**
                             * 通话类型的筛选条件
                             * */}
                            <BackMainPage className="call-back-btn" handleBackClick={this.props.closeCallAnalysisPanel}></BackMainPage>
                            <div>
                                {this.filterCallTypeSelect()}
                            </div>
                            <span className="btn-item">
                                <AntcDatePicker
                                    disableDateAfterToday={true}
                                    range={DEFAULT_TIME_RANGE}
                                    selectedTimeFormat="int"
                                    onSelect={this.onSelectDate}>
                                    <AntcDatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</AntcDatePicker.Option>
                                    <AntcDatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</AntcDatePicker.Option>
                                    <AntcDatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</AntcDatePicker.Option>
                                    <AntcDatePicker.Option
                                        value="month">{Intl.get('common.time.unit.month', '月')}</AntcDatePicker.Option>
                                    <AntcDatePicker.Option
                                        value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</AntcDatePicker.Option>
                                    <AntcDatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</AntcDatePicker.Option>
                                    <AntcDatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</AntcDatePicker.Option>
                                </AntcDatePicker>
                            </span>
                            {/**
                             * 团队和成员筛选框
                             * */}
                            <div className="team-member-select">
                                {
                                    this.state.teamList.list.length ?
                                        this.renderTeamMembersSelect() :
                                        null
                                }
                            </div>
                        </div>
                    </TopNav>
                    <div className="call-data-analysis">
                        <div className="call-table-container" ref="phoneList">
                            <div style={{height: tableHeight}} className="table-list-containers">
                                <GeminiScrollBar>
                                    <div className="analysis-wrapper">
                                        <AntcAnalysis
                                            charts={this.getCharts()}
                                            conditions={this.getConditions()}
                                            emitterConfigList={this.getEmitters()}
                                            isGetDataOnMount={true}
                                        />
                                    </div>
                                </GeminiScrollBar>
                            </div>
                        </div>);
                    </div>
                </div>
            </RightContent>
        );
    }
}

module.exports = CallRecordAnalyis;
