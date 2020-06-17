/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/5.
 */

import {dateSelectorEmitter, teamTreeEmitter} from 'PUB_DIR/sources/utils/emitters';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import WeeklyReportAction from './action/weekly-report-actions';
import WeeklyReportStore from './store/weekly-report-store';
var userData = require('PUB_DIR/sources/user-data');

require('./css/index.less');
var WeekReportUtil = require('./utils/weekly-report-utils');
import WeeklyReportDetail from './view/weekly-report-detail';
import {Row, Col, Alert} from 'antd';

import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import NatureTimeSelect from 'CMP_DIR/nature-time-select';
import ReportLeftMenu from 'CMP_DIR/report-left-menu';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';

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
        if (_.trim(keyword) !== _.trim(this.state.searchKeyword)) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-content'), Intl.get('analysis.search.by.keyword', '根据关键词搜索'));
            WeeklyReportAction.changeSearchInputValue(keyword);
        }
    };

    handleClickReportTitle = (obj, idx) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.report-title-item'), Intl.get('analysis.view.weekly.report.details', '查看周报详情'));
        WeeklyReportAction.setSelectedWeeklyReportItem({obj, idx});
    };

    handleErrResult = () => {
        var errMsg = <span>{this.state.teamList.errMsg}
            <a onClick={this.getTeamMemberData}>{Intl.get('user.info.retry', '请重试')}</a></span>;
        return (
            <Alert
                message={errMsg}
                type='error'
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
        Trace.traceEvent(e, Intl.get('analysis.select.team', '选择团队'));
        WeeklyReportAction.setSelectedTeamId(teamId);
        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamId);
    };

    renderTeamSelect = () => {
        let teamList = _.get(this.state, 'teamList.list') || [];
        if (teamList.length > 1) {
            return (
                <div className='btn-item report-team-select-container'>
                    <SelectFullWidth
                        value={this.state.selectedTeamId}
                        onChange={this.onTeamChange.bind(this)}
                    >
                        {_.map(this.state.teamList.list, (teamItem, index) => {
                            return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                        })}
                    </SelectFullWidth>
                </div>);
        } else {
            return null;
        }
    };

    //获取选中周的开始结束时间
    getStartEndTime(yearNum, weekNum) {
        const week = moment().year(yearNum).isoWeek(weekNum);
        const startTime = week.startOf('isoWeek').valueOf();
        const endTime = week.endOf('isoWeek').valueOf();

        return { startTime, endTime };
    }

    //年的选择
    onChangeYear = (year, e) => {
        if (this.state.yearTime === year) {
            return;
        }
        Trace.traceEvent(e, Intl.get('analysis.time.frame', '时间范围') + '-' + Intl.get('analysis.select.the.some.year', '选择第{year}年', {year: year}));
        WeeklyReportAction.setSelectedYear(year);

        const startTime = this.getStartEndTime(year, this.state.nWeek).startTime;
        const endTime = this.getStartEndTime(year, this.state.nWeek).endTime;

        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    };

    //周的选择
    onChangeWeek = (week, e) => {
        if (this.state.weekTime === week) {
            return;
        }
        Trace.traceEvent(e, Intl.get('analysis.time.frame', '时间范围') + '-' + Intl.get('analysis.select.the.some.week', '选择第{week}周', {week: week}));
        WeeklyReportAction.setSelectedWeek(week);

        const startTime = this.getStartEndTime(this.state.nYear, week).startTime;
        const endTime = this.getStartEndTime(this.state.nYear, week).endTime;

        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    };

    renderWeekSelect = () => {
        return (
            <div className='btn-item report-time-container'>
                <NatureTimeSelect onChangeYear={this.onChangeYear}
                    onChangeWeek={this.onChangeWeek}
                    showTimeTypeSelect={false}
                    canSelectFutureWeek={false}
                    timeType='week'
                    yearTime={this.state.nYear + Intl.get('common.time.unit.year', '年')}
                    weekTime={this.state.nWeek}/>
            </div>);
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        return (<ButtonZones>
            <div className='btn-item-container'>
                {this.renderTeamSelect()}
                {this.renderWeekSelect()}
            </div>
        </ButtonZones>
        );
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

        const isCommonSales = userData.getUserData().isCommonSales;

        return (
            <div className='weekly-report-container' data-tracename={Intl.get('analysis.sales.weekly.report', '销售周报')}>
                {
                    this.renderTopNavOperation()
                }
                <div className='weekly-report-wrap'>
                    <Row>
                        <Col span={3}>
                            <ReportLeftMenu/>
                        </Col>
                        <Col span={21}>
                            <div className='weekly-report-content clearfix'>
                                <div className='col-md-12 weekly-report-detail-wrap'>
                                    {isCommonSales || this.state.selectedTeamId ? (
                                        <WeeklyReportDetail
                                            selectedItem={{teamId: this.state.selectedTeamId, nYear: this.state.nYear, nWeek: this.state.nWeek}}
                                            selectedTeamName={this.state.selectedTeamName}
                                            memberList={this.state.memberList}
                                            teamList={this.state.teamList.list}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

module.exports = WeeklyReport;
