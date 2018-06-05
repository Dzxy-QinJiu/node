/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/5.
 */
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import WeeklyReportAction from './action/weekly-report-actions';
import WeeklyReportStore from './store/weekly-report-store';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SearchInput from 'CMP_DIR/searchInput';
require('./css/index.less');
import Spinner from 'CMP_DIR/spinner';
var classNames = require('classnames');
var WeekReportUtil = require('./utils/weekly-report-utils');
import WeeklyReportDetail from './view/weekly-report-detail';
import {Alert} from 'antd';
const WeeklyReport = React.createClass({
    getInitialState: function() {
        return {
            ...WeeklyReportStore.getState(),
            nweek: '',//当前日期是今年的第几周
            keywordValue: '',//跟据关键词进行搜索
        };
    },
    componentDidMount: function() {
        WeeklyReportStore.listen(this.onStoreChange);
        this.getTeamMemberData(); //获取销售团队和成员数据
    },
    onStoreChange: function() {
        this.setState(WeeklyReportStore.getState());
    },

    componentWillUnmount: function() {
        WeeklyReportStore.unlisten(this.onStoreChange);
    },

    // 获取销售团队和成员数据
    getTeamMemberData() {
        let reqData = commonMethodUtil.getParamByPrivilege();
        WeeklyReportAction.getSaleGroupTeams(reqData);
        WeeklyReportAction.getSaleMemberList(reqData);
    },
    onSearchInputChange: function(keyword) {
        keyword = keyword ? keyword : '';
        if (keyword.trim() !== this.state.searchKeyword.trim()) {
            Trace.traceEvent($(this.getDOMNode()).find('.search-content'), '根据关键词搜索');
            WeeklyReportAction.changeSearchInputValue(keyword);
        }
    },
    handleClickReportTitle: function(obj, idx) {
        Trace.traceEvent($(this.getDOMNode()).find('.report-title-item'), '查看周报详情');
        WeeklyReportAction.setSelectedWeeklyReportItem({obj, idx});
    },
    handleErrResult: function() {
        var errMsg = <span>{this.state.teamList.errMsg}
            <a onClick={this.getTeamMemberData}>{Intl.get('user.info.retry', '请重试')}</a></span>;
        return (
            <Alert
                message={errMsg}
                type="error"
                showIcon
            />
        );
    },
    //统计周报的标题
    renderWeeklyReportTitle: function() {
        if (this.state.teamList.loading) {
            return (
                <Spinner/>
            );
        } else if (this.state.teamList.errMsg) {
            return this.handleErrResult();
        } else {
            if (this.state.teamDescArr.length) {
                return (
                    <ul className="report-title-list">
                        {_.map(this.state.teamDescArr, (teamItem, i) => {
                            var Cls = classNames('report-title-item', {
                                'current-item': teamItem.teamId === this.state.selectedReportItem.teamId && i === this.state.selectedReportItemIdx
                            });
                            return (
                                <li className={Cls}
                                    onClick={this.handleClickReportTitle.bind(this, teamItem, i)}>
                                    {teamItem.teamDsc}
                                </li>
                            );
                        })}
                    </ul>
                );
            } else {
                var noDataMsg = <span>{Intl.get('weekly.report.no.report', '暂无符合条件的周报')}</span>;
                return <Alert
                    message={noDataMsg}
                    type="info"
                    showIcon={true}
                />;
            }
        }
    },
    getReportTitleListDivHeight: function() {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        var height = $(window).height() - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.TOP_DELTA - WeekReportUtil.REPORT_TITLE_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return height;
    },
    //左侧标题列表顶部的筛选区域
    renderSearchBarHeader: function() {
        return (
            <div className="search-content pull-left">
                <SearchInput
                    ref="searchInput"
                    type="input"
                    searchPlaceHolder={Intl.get('user.search.placeholder', '请输入关键词搜索')}
                    searchEvent={this.onSearchInputChange}
                />
            </div>
        );
    },
    render: function() {
        //列表高度
        //详情高度
        var reportTitleListHeight = 'auto';
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
            reportTitleListHeight = this.getReportTitleListDivHeight();
        }
        var noShowReportDetail = this.state.teamDescArr.length === 0;
        return (
            <div className="weekly-report-container">
                <div className="weekly-report-wrap">
                    <div className="weekly-report-content clearfix">
                        <GeminiScrollbar>
                            <div className="col-md-3 weekly-report-title-wrap">
                                <div className="search-bar clearfix">
                                    {this.renderSearchBarHeader()}
                                </div>
                                <div>
                                    <div style={{height: reportTitleListHeight}}>
                                        <GeminiScrollbar>
                                            <div className="report-des-content">
                                                {this.renderWeeklyReportTitle()}
                                            </div>
                                        </GeminiScrollbar>
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-9 weekly-report-detail-wrap">
                                {noShowReportDetail ? null : (
                                    <WeeklyReportDetail
                                        selectedItem={this.state.selectedReportItem}
                                        memberList={this.state.memberList}
                                    />
                                )}
                            </div>
                        </GeminiScrollbar>
                    </div>
                </div>
            </div>
        );
    }
});
module.exports = WeeklyReport;