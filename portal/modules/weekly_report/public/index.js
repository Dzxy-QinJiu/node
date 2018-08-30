/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/5.
 */
var React = require('react');
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import WeeklyReportAction from './action/weekly-report-actions';
import WeeklyReportStore from './store/weekly-report-store';
require('./css/index.less');
var WeekReportUtil = require('./utils/weekly-report-utils');
import WeeklyReportDetail from './view/weekly-report-detail';
import { Alert } from 'antd';
var TopNav = require('CMP_DIR/top-nav');
var AnalysisMenu = require('CMP_DIR/analysis_menu');
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import NatureTimeSelect from 'CMP_DIR/nature-time-select';

class WeeklyReport extends React.Component {
    constructor(props) {
        super(props);
        let time = moment();

        this.state = {
            ...WeeklyReportStore.getState(),
            // nweek: '',//当前日期是今年的第几周
            keywordValue: '',//跟据关键词进行搜索
        };
    }

    componentDidMount() {
        WeeklyReportStore.listen(this.onStoreChange);
        this.getTeamMemberData(); //获取销售团队和成员数据
    }

    onStoreChange = () => {
        this.setState(WeeklyReportStore.getState());
    };

    componentWillUnmount() {
        WeeklyReportStore.unlisten(this.onStoreChange);
    }

    // 获取销售团队和成员数据
    getTeamMemberData = () => {
        let reqData = commonMethodUtil.getParamByPrivilege();
        WeeklyReportAction.getSaleGroupTeams(reqData);
        WeeklyReportAction.getSaleMemberList(reqData);
    };

    onSearchInputChange = (keyword) => {
        keyword = keyword ? keyword : '';
        if (keyword.trim() !== this.state.searchKeyword.trim()) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-content'), '根据关键词搜索');
            WeeklyReportAction.changeSearchInputValue(keyword);
        }
    };

    handleClickReportTitle = (obj, idx) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.report-title-item'), '查看周报详情');
        WeeklyReportAction.setSelectedWeeklyReportItem({ obj, idx });
    };

    handleErrResult = () => {
        var errMsg = <span>{this.state.teamList.errMsg}
            <a onClick={this.getTeamMemberData}>{Intl.get('user.info.retry', '请重试')}</a></span>;
        return (
            <Alert
                message={errMsg}
                type="error"
                showIcon
            />
        );
    };

    getReportTitleListDivHeight = () => {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        var height = $(window).height() - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.TOP_DELTA - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.TOP_NAV_HEIGHT;
        return height;
    };

    onTeamChange = (teamId, e) => {
        Trace.traceEvent(e, '选择团队');
        WeeklyReportAction.setSelectedTeamId(teamId);
    };

    renderTeamSelect = () => {
        let teamList = _.get(this.state, 'teamList.list') || [];
        if (teamList.length > 1){
            return (
                <div className='report-team-select-container'>
                    <SelectFullWidth
                        value={this.state.selectedTeamId}
                        onChange={this.onTeamChange.bind(this)}
                    >
                        {_.map(this.state.teamList.list, (teamItem, index) => {
                            return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                        })}
                    </SelectFullWidth>
                </div>);
        }else{
            return null;
        }
    };

    //周的选择
    onChangeWeek = (week, e) => {
        if (this.state.weekTime === week) {
            return;
        }
        Trace.traceEvent(e, `时间范围-选择第${week}周`);
        WeeklyReportAction.setSelectedWeek(week);
    };

    renderWeekSelect = () => {
        return (
            <div className="report-time-container">
                <NatureTimeSelect ref="timeSelect" onChangeYear={this.onChangeYear}
                    onChangeWeek={this.onChangeWeek}
                    showTimeTypeSelect={false}
                    hideYearSelect={true}
                    timeType="week"
                    yearTime={this.state.yearDescr}
                    weekTime={this.state.nWeek} />
            </div>);
    };

    render() {
        //列表高度
        //判断是否屏蔽窗口的滚动条
        if ($(window).width() < Oplate.layout['screen-md']) {
            $('body').css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
        } else {
            $('body').css({
                'overflow-x': 'hidden',
                'overflow-y': 'hidden'
            });
            //计算列表高度
        }
        return (
            <div className="weekly-report-container" data-tracename='销售周报'>
                <TopNav>
                    <AnalysisMenu />
                    {this.renderWeekSelect()}
                    {this.renderTeamSelect()}
                </TopNav>
                <div className="weekly-report-wrap">
                    <div className="weekly-report-content clearfix">
                        <div className="col-md-12 weekly-report-detail-wrap">
                            <WeeklyReportDetail
                                selectedItem={{ teamId: this.state.selectedTeamId, nWeek: this.state.nWeek }}
                                selectedTeamName={this.state.selectedTeamName}
                                memberList={this.state.memberList}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = WeeklyReport;
