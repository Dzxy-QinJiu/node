/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/5.
 */
import commonMethodUtil from "PUB_DIR/sources/utils/common-method-util";
import WeeklyReportAction from './action/weekly-report-actions';
import WeeklyReportStore from './store/weekly-report-store';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
import {AntcTable} from "antc";
const WeeklyReport = React.createClass({
    getInitialState: function () {
        return {
            ...WeeklyReportStore.getState(),
        };
    },
    componentDidMount : function() {
        WeeklyReportStore.listen(this.onStoreChange);
        this.getTeamMemberData(); //获取销售团队和成员数据
        this.getWeeklyReportData(); // 获取电话统计、、、 数据
    },
    // 获取团队或成员的参数
    getTeamMemberParam() {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list;  // 成员数据
        let secondSelectValue = this.state.secondSelectValue;
        let params = {};
        if (this.state.firstSelectValue == LITERAL_CONSTANT.TEAM && this.state.teamList.list.length > 1) { // 团队时
            if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体团队时
                let secondSelectTeamId = this.getTeamOrMemberId(teamList, secondSelectValue);
                params.sales_team_id = secondSelectTeamId.join(',');
            }
        } else { // 成员时
            if (this.state.secondSelectValue == LITERAL_CONSTANT.ALL) { // 全部时
                let userIdArray = _.pluck(this.state.memberList.list, 'id');
                params.user_id = userIdArray.join(',');
            } else if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体成员时
                let secondSelectMemberId = this.getTeamOrMemberId(memberList, secondSelectValue);
                params.user_id = secondSelectMemberId.join(','); // 成员
            }
        }
        return params;
    },
    getWeeklyReportData: function () {
        this.getCallInfoData(); // 接通率
    },
    // 通话的接通率
    getCallInfoData(params){
        let queryParams = {
            start_time: this.state.start_time,
            end_time: this.state.end_time,
            deviceType: this.state.callType
        };
        let pathParam = commonMethodUtil.getParamByPrivilege();
        if (this.state.teamList.list.length) { // 有团队时（普通销售时没有团队的）
            let teamMemberParam = this.getTeamMemberParam();
            if (teamMemberParam) {
                if (teamMemberParam.sales_team_id) {
                    queryParams.team_ids = teamMemberParam.sales_team_id;
                } else if (teamMemberParam.user_id) {
                    queryParams.member_ids = teamMemberParam.user_id;
                }
            }
        }
        let type = this.getCallInfoAuth();
        WeeklyReportAction.getCallInfo(pathParam, queryParams, type);
    },
    getCallInfoAuth() {
        let authType = "user";//CUSTOMER_CALLRECORD_STATISTIC_USER
        if (hasPrivilege("CUSTOMER_CALLRECORD_STATISTIC_MANAGER")) {
            authType = "manager";
        }
        return authType;
    },
    componentWillUnmount: function () {
        WeeklyReportStore.unlisten(this.onStoreChange);
    },
    onStoreChange: function () {
        this.setState(WeeklyReportStore.getState());
    },
    // 获取销售团队和成员数据
    getTeamMemberData() {
        let reqData = commonMethodUtil.getParamByPrivilege();
        WeeklyReportAction.getSaleGroupTeams(reqData);
        WeeklyReportAction.getSaleMemberList(reqData);
    },
    // 电话接通率的数据
    getPhoneListColumn: function () {
        let columns = [{
            title: Intl.get("user.salesman", "销售人员"),
            width: 114,
            dataIndex: 'salesName',
            className: 'table-data-align-left',
            key: 'sales_Name'
        }, {
            title: Intl.get("weekly.report.total.duration","本周总时长"),
            width: 114,
            dataIndex: 'totalTimeDescr',
            key: 'total_time',
            sorter: function (a, b) {
                return a.totalTime - b.totalTime;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("weekly.report.total.connected","本周总接通数"),
            width: 114,
            dataIndex: 'calloutSuccess',
            key: 'callout_success',
            sorter: function (a, b) {
                return a.calloutSuccess - b.calloutSuccess;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.average.duration", "日均时长"),
            width: 114,
            dataIndex: 'averageTimeDescr',
            key: 'average_time',
            sorter: function (a, b) {
                return a.averageTime - b.averageTime;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.average.connected", "日均接通数"),
            width: 114,
            dataIndex: 'averageAnswer',
            key: 'average_answer',
            sorter: function (a, b) {
                return a.averageAnswer - b.averageAnswer;
            },
            className: 'has-filter table-data-align-right'
        }, ];
        return columns;
    },
    // 通话率列表
    renderCallInfo() {
        if (this.state.salesPhone.loading) {
            return (
                <div>
                    <Spinner />
                </div>
            );
        }
        return (
            <AntcTable dataSource={this.state.salesPhone.list}
                       columns={this.getPhoneListColumn()}
                       pagination={false}
                       bordered
            />
        );
    },
    // 团队和成员筛选框
    renderTeamMembersSelect() {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list;  // 成员数据

        // 第一个选择框渲染的数据
        let firstOptions = FIRSR_SELECT_DATA.map((item) => {
            return <Option value={item}>{item}</Option>;
        });

        // 第二个选择框的数据
        let secondOptions = [];
        if (teamList.length == 1) { // 只展示成员选择框时
            secondOptions = memberList.map((item) => {
                return <Option value={item.name}>{item.name}</Option>;
            });
        } else if (teamList.length > 1) { // 展示团队和成员
            if (this.state.firstSelectValue == LITERAL_CONSTANT.TEAM) {
                secondOptions = teamList.map((item) => {
                    return <Option value={item.name}>{item.name}</Option>;
                });
            } else if (this.state.firstSelectValue == LITERAL_CONSTANT.MEMBER) {
                secondOptions = memberList.map((item) => {
                    return <Option value={item.name}>{item.name}</Option>;
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
                        onSelect={this.handleFirstSelect}
                    >
                        {firstOptions}
                    </SelectFullWidth>
                ) : null }
                <SelectFullWidth
                    multiple
                    value={this.state.secondSelectValue}
                    onChange={this.onSecondSelectChange}
                    className="team-member-select-options"
                    onSelect={this.handleSelectTeamOrMember}
                >
                    {secondOptions}
                </SelectFullWidth>
            </div>
        );
    },
    render:function () {
      return (
         <div>{this.renderCallInfo()}</div>
      )
    }
    });
module.exports = WeeklyReport;