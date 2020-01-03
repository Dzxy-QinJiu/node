var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanelClose = rightPanelUtil.RightPanelClose;
import ClueAnalysisStore from '../store/clue-analysis-store';
import ClueAnalysisAction from '../action/clue-analysis-action';
import { AntcDatePicker as DatePicker } from 'antc';
import {Select, Tabs} from 'antd';
const TabPane = Tabs.TabPane;
const Option = Select.Option;
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import {AntcAnalysis} from 'antc';
import PropTypes from 'prop-types';
import {getResultType, getErrorTipAndRetryFunction} from 'PUB_DIR/sources/utils/common-method-util';
const PIE_CENTER_POSITION = ['50%', '60%'];
const CHART_HEIGHT = '400px';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
const TABS = {
    'OVERVIEW': '1',
    'TREND': '2'
};
require('../css/clue_analysis_panel.less');
class ClueAnalysisPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showCustomerIds: [],//所有客户的id
            showTab: TABS.OVERVIEW,//展示的tab页
            ...ClueAnalysisStore.getState()
        };
    }

    componentDidMount() {
        this.refreshClueAnalysisData();
        ClueAnalysisStore.listen(this.onStoreChange);
    }

    onStoreChange = () => {
        this.setState(ClueAnalysisStore.getState());
    };

    componentWillUnmount() {
        ClueAnalysisStore.unlisten(this.onStoreChange);
    }

    //获取线索阶段
    getClueStageList = () => {
        let pathParams = {
            field: 'customer_label',
            page_size: this.state.staticsPageSize,
            num: this.state.staticsNum,
        };
        let queryParams = {};
        if (this.state.selectedAccess !== Intl.get('common.all', '全部')) {
            queryParams.access_channel = this.state.selectedAccess;
        }
        if (this.state.selectedSource !== Intl.get('common.all', '全部')) {
            queryParams.clue_source = this.state.selectedSource;
        }
        ClueAnalysisAction.getClueStatics(pathParams, this.state.rangeParams, queryParams);
    };
    //获取线索来源统计
    getClueSourceLists = () => {
        let pathParams = {
            field: 'clue_source',
            page_size: this.state.staticsPageSize,
            num: this.state.staticsNum,
        };
        ClueAnalysisAction.getClueStatics(pathParams, this.state.rangeParams);
    };
    //获取线索接入渠道统计列表
    getClueAccessChannelList = () => {
        let pathParams = {
            field: 'access_channel',
            page_size: this.state.staticsPageSize,
            num: this.state.staticsNum,
        };
        ClueAnalysisAction.getClueStatics(pathParams, this.state.rangeParams);
    };
    //获取线索分类统计列表
    getClueClassifyList = () => {
        let pathParams = {
            field: 'clue_classify',
            page_size: this.state.staticsPageSize,
            num: this.state.staticsNum,
        };
        ClueAnalysisAction.getClueStatics(pathParams, this.state.rangeParams);
    };
    //获取线索有效性统计
    getClueAvailabilityList = () => {
        let pathParams = {
            field: 'availability',
            page_size: this.state.staticsPageSize,
            num: this.state.staticsNum,
        };
        ClueAnalysisAction.getClueStatics(pathParams, this.state.rangeParams);
    };

    refreshClueAnalysisData() {
        //获取线索阶段分析列表
        this.getClueStageList();
        //获取线索来源统计列表
        this.getClueSourceLists();
        //获取线索接入渠道
        this.getClueAccessChannelList();
        //获取线索分类
        this.getClueClassifyList();
        //获取线索有效无效列表
        this.getClueAvailabilityList();
    }

    getTrendChartList() {
        //获取来源统计趋势
        this.getSourceTrendLists();
        //获取渠道统计趋势
        this.getChannelTrendLists();
        //获取分类统计趋势
        this.getClassifyTrendLists();
        //获取有效性趋势
        this.getAvalibilityTrendLists();
        //获取签约趋势
        this.getAssignedTrendLists();
    }
    getTrendQueryParams = (filed) => {
        var start_time = this.state.start_time;
        var end_time = this.state.end_time;
        const oneDay = oplateConsts.ONE_DAY_TIME_RANGE;
        const oneMonth = 31 * oneDay;//一个月的时间
        const threeMonth = 92 * oneDay;//三个月的时间（3个月最大92天）
        const threeYear = (365 * 3 + 1) * oneDay;//三年的时间
        var queryObj = {
            start_time: start_time,
            end_time: end_time,
            field: filed,
            interval: 'day'
        };
        //不同的时间段选择的聚合时间间隔interval也不一样
        if (start_time && end_time){
            var timeRange = end_time - start_time;
            if (timeRange <= oneMonth ){
                //1个月内按天进行聚合
                queryObj.interval = 'day';
            }else if (timeRange > oneMonth && (timeRange <= threeMonth)){
                // 1-3个月内按周进行聚合（最大92天）
                queryObj.interval = 'week';
            }else if (timeRange > threeMonth && (timeRange <= threeYear)){
                //3个月到3年按月进行聚合
                queryObj.interval = 'month';
            }else if (timeRange > threeYear){
                //大于3年按年进行聚合
                queryObj.interval = 'year';
            }
        }else{
            queryObj.start_time = 0;
            queryObj.end_time = moment().valueOf();
            queryObj.interval = 'year';
        }
        return queryObj;
    }
    //来源统计
    getSourceTrendLists() {
        var queryObj = this.getTrendQueryParams('clue_source');
        ClueAnalysisAction.getClueTrendStatics(queryObj);
    }
    //渠道趋势统计
    getChannelTrendLists() {
        var queryObj = this.getTrendQueryParams('access_channel');
        ClueAnalysisAction.getClueTrendStatics(queryObj);
    }
    //分类趋势统计
    getClassifyTrendLists() {
        var queryObj = this.getTrendQueryParams('clue_classify');
        ClueAnalysisAction.getClueTrendStatics(queryObj);
    }
    //有效性趋势统计
    getAvalibilityTrendLists() {
        var queryObj = this.getTrendQueryParams('availability');
        ClueAnalysisAction.getClueTrendStatics(queryObj);
    }
    //签约趋势统计
    getAssignedTrendLists() {
        var queryObj = this.getTrendQueryParams('customer_label');
        ClueAnalysisAction.getClueTrendStatics(queryObj);
    }

    onSelectDate = (startTime, endTime) => {
        let timeObj = {startTime: startTime, endTime: endTime};
        ClueAnalysisAction.changeSearchTime(timeObj);
        if (this.state.showTab === TABS.OVERVIEW){
            //如果点中的是第一个tab页,切换时间获取概览页的数据
            setTimeout(() => {
                this.refreshClueAnalysisData();
            });
        }else if (this.state.showTab === TABS.TREND){
            setTimeout(() => {
                this.getTrendChartList();
            });
        }

    };
    handleAccessSelect = (access) => {
        ClueAnalysisAction.changeAccess(access);
        setTimeout(() => {
            this.getClueStageList();
        });
    };
    handleSourceSelect = (source) => {
        ClueAnalysisAction.changeSource(source);
        setTimeout(() => {
            this.getClueStageList();
        });
    };

    filterClueTypeSelect() {
        var accessChannelArr = _.extend([], this.props.accessChannelArray);
        accessChannelArr.unshift(Intl.get('common.all', '全部'));
        const AccessOptions = accessChannelArr.map((x, idx) => (
            <Option key={idx} value={x}>{x}</Option>
        ));
        var clueSourceArr = _.extend([], this.props.clueSourceArray);
        clueSourceArr.unshift(Intl.get('common.all', '全部'));
        const ClueOptions = clueSourceArr.map((x, idx) => (
            <Option key={idx} value={x}>{x}</Option>
        ));
        return (
            <div className="filter-clue-wrap">
                {Intl.get('clue.analysis.access.channel', '渠道')}：
                <Select
                    value={this.state.selectedAccess}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleAccessSelect}
                >
                    {AccessOptions}
                </Select>
                {Intl.get('clue.analysis.source', '来源')}：
                <Select
                    value={this.state.selectedSource}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleSourceSelect}
                >
                    {ClueOptions}
                </Select>
            </div>
        );
    }

    handleShowCustomerInfo = (ids, label) => {
        var idsStr = ids.join(',');
        ClueAnalysisAction.getCustomerById(idsStr, label);
        this.setState({
            showCustomerIds: ids,
        });
    };
    closeCustomersContentPanel = () => {
        this.setState({
            showCustomerIds: []
        });
    };
    closeClueAnalysisPanel = () => {
        ClueAnalysisAction.setInitState();
        this.props.closeClueAnalysisPanel();
    };
    //获取行政级别
    getAdministrativeLevel(levelId) {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id === levelId);
        return levelObj ? levelObj.level : '';
    }

    processClueStaticsStageData() {
        const customerStages = [
            {
                tagName: Intl.get('sales.stage.intention', '意向'),
                tagValue: 'intention',
            },
            {
                tagName: Intl.get('common.trial', '试用'),
                tagValue: 'trial',
            },
            {
                tagName: Intl.get('common.trial.qualified', '试用合格'),
                tagValue: 'qualified',
            },
            {
                tagName: Intl.get('sales.stage.signed', '签约'),
                tagValue: 'signed',
            }
        ];

        let processedData = [];
        let prevStageValue;
        customerStages.forEach(stage => {
            let stageValue = 0;
            _.forEach(this.state.clueStageList.list, (item) => {
                _.forEach(item, (value, key) => {
                    if (key === stage.tagName) {
                        stageValue = value;
                    }
                });
            });
            if (stageValue) {
                //保留原始值，用于在图表上显示
                const showValue = stageValue;

                // 如果下一阶段的值比上一阶段的值大，则将下一阶段的值变得比上一阶段的值小，以便能正确排序
                if (prevStageValue && stageValue > prevStageValue) {
                    stageValue = prevStageValue * 0.8;
                }

                //将暂存的上一阶段的值更新为当前阶段的值，以供下一循环中使用
                prevStageValue = stageValue;

                processedData.push({
                    name: stage.tagName,
                    value: stageValue,
                    showValue,
                });
            }
        });

        return processedData;
    }

    handleDataList(originData, isAvalibility) {
        var data = [];
        _.forEach(originData, (dataItem) => {
            _.forEach(dataItem, (value, key) => {
                if (isAvalibility) {
                    if (key === '0') {
                        key = Intl.get('clue.analysis.ability', '有效');
                    }
                    if (key === '1') {
                        key = Intl.get('clue.analysis.inability', '无效');
                    }
                }
                data.push({
                    'value': value,
                    'name': key || Intl.get('common.unknown', '未知')
                });
            });
        });
        return data;
    }

    handleTrendData(originData, type) {
        var trendData = [];
        if (type === 'assigned'){
            originData = _.filter(originData,(item) => {
                return item.name === Intl.get('sales.stage.signed', '签约');
            });
        }
        _.forEach(originData, (item) => {
            var nameItem = item.name;
            if (type === 'isAvaibility') {
                if (nameItem === '0') {
                    nameItem = Intl.get('clue.analysis.ability', '有效');
                }
                if (nameItem === '1') {
                    nameItem = Intl.get('clue.analysis.inability', '无效');
                }
            }
            if (nameItem === 'unknow' ){
                nameItem = Intl.get('common.unknown', '未知');
            }
            trendData.push(
                {
                    clueName: nameItem,
                    type: 'line',
                    data: item.list
                });
            _.forEach(item.list, (subItem) => {
                subItem.name = moment(subItem.date).format(oplateConsts.DATE_FORMAT);
                subItem.value = subItem.count;
            });
        });
        return trendData;
    }
    getChartsTrendOptions(){
        var trendOption = {
            legend: {
                orient: 'horizontal',
                type: 'scroll',
                x: 'left',
                pageIconSize: 10,
            },
            yAxis: [{
                //设置成1保证坐标轴分割刻度显示成整数
                minInterval: 1,
            }]
        };
        return trendOption;
    }
    getTrendCharts(){
        return [{
            title: Intl.get('clue.analysis.source.chart', '来源统计'),
            chartType: 'line',
            data: this.handleTrendData(this.state.clueSourceTrendList.list),
            option: this.getChartsTrendOptions(),
            noExportCsv: true,
            customOption: {
                stack: false,
                multi: true,
                serieNameField: 'clueName',
            },
            resultType: getResultType(this.state.clueSourceTrendList.loading, this.state.clueSourceTrendList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueSourceTrendList.errMsg, this.getSourceTrendLists);
            }
        },{
            title: Intl.get('clue.analysis.access.chart', '渠道统计'),
            chartType: 'line',
            data: this.handleTrendData(this.state.clueChannelTrendList.list),
            option: this.getChartsTrendOptions(),
            noExportCsv: true,
            customOption: {
                stack: false,
                multi: true,
                serieNameField: 'clueName',
            },
            resultType: getResultType(this.state.clueChannelTrendList.loading, this.state.clueChannelTrendList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueChannelTrendList.errMsg, this.getChannelTrendLists);
            }
        },{
            title: Intl.get('clue.analysis.classify.chart', '分类统计'),
            chartType: 'line',
            data: this.handleTrendData(this.state.clueClassiftyTrendList.list),
            option: this.getChartsTrendOptions(),
            noExportCsv: true,
            customOption: {
                stack: false,
                multi: true,
                serieNameField: 'clueName',
            },
            resultType: getResultType(this.state.clueClassiftyTrendList.loading, this.state.clueClassiftyTrendList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueClassiftyTrendList.errMsg, this.getClassifyTrendLists);
            }
        },{
            title: Intl.get('clue.analysis.avalibility.chart', '有效性统计'),
            chartType: 'line',
            data: this.handleTrendData(this.state.clueAvaibilityTrendList.list,'isAvaibility'),
            option: this.getChartsTrendOptions(),
            noExportCsv: true,
            customOption: {
                stack: false,
                multi: true,
                serieNameField: 'clueName',
            },
            resultType: getResultType(this.state.clueAvaibilityTrendList.loading, this.state.clueAvaibilityTrendList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueAvaibilityTrendList.errMsg, this.getAvalibilityTrendLists);
            }
        },{
            title: Intl.get('clue.analysis.assigned.chart','签约统计'),
            chartType: 'line',
            data: this.handleTrendData(this.state.clueAssignedTrendList.list,'assigned'),
            option: this.getChartsTrendOptions(),
            noExportCsv: true,
            customOption: {
                stack: false,
                multi: true,
                serieNameField: 'clueName',
            },
            resultType: getResultType(this.state.clueAssignedTrendList.loading, this.state.clueAssignedTrendList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueAssignedTrendList.errMsg, this.getAssignedTrendLists);
            }
        }];
    }
    //渲染趋势页的chart
    renderChartsTrendView() {
        var charts = this.getTrendCharts();
        return (
            <div className="clue-analysis-trend-container">
                <AntcAnalysis
                    charts={charts}
                    isUseScrollBar={true}
                    chartHeight={CHART_HEIGHT}
                />
            </div>
        );
    }
    handleClickTabs = (e) => {
        this.setState({
            showTab: e
        });
        if (e === TABS.TREND) {
            this.getTrendChartList();
        }else if (e === TABS.OVERVIEW){
            this.refreshClueAnalysisData();
        }
    };
    //获取options的配置
    getChartsOptions(DataObj, centerPosition) {
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                type: 'scroll',
                x: 'left',
                pageIconSize: 10,
                selectedMode: false,
            },
            series: [
                {
                    type: 'pie',
                    radius: '55%',
                    center: centerPosition,
                    data: DataObj
                }
            ]
        };
        return option;
    }
    getOverviewCharts(){
        return [{
            title: Intl.get('clue.stage.statics', '线索阶段统计'),
            chartType: 'funnel',
            data: this.processClueStaticsStageData(),
            noExportCsv: true,
            resultType: getResultType(this.state.clueStageList.loading, this.state.clueStageList.errMsg),
            cardContainer: {
                props: {
                    subTitle: this.filterClueTypeSelect()

                }
            },
            customOption: {
                valueField: 'showValue',
                minSize: '5%',
            },
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueStageList.errMsg, this.getClueStageList);
            }

        },{
            title: Intl.get('clue.analysis.access.chart', '渠道统计'),
            chartType: 'pie',
            data: this.handleDataList(this.state.clueAccessChannelList.list),
            option: this.getChartsOptions(this.state.clueAccessChannelList.list, PIE_CENTER_POSITION),
            noExportCsv: true,
            resultType: getResultType(this.state.clueAccessChannelList.loading, this.state.clueAccessChannelList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueAccessChannelList.errMsg, this.getClueAccessChannelList);
            }
        },{
            title: Intl.get('clue.analysis.source.chart', '来源统计'),
            chartType: 'pie',
            data: this.handleDataList(this.state.clueSourceList.list),
            option: this.getChartsOptions(this.state.clueSourceList.list, PIE_CENTER_POSITION),
            noExportCsv: true,
            resultType: getResultType(this.state.clueSourceList.loading, this.state.clueSourceList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueSourceList.errMsg, this.getClueSourceLists);
            }
        },{
            title: Intl.get('clue.analysis.classify.chart', '分类统计'),
            chartType: 'pie',
            data: this.handleDataList(this.state.clueClassifyList.list),
            option: this.getChartsOptions(this.state.clueClassifyList.list, PIE_CENTER_POSITION),
            noExportCsv: true,
            resultType: getResultType(this.state.clueClassifyList.loading, this.state.clueClassifyList.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueClassifyList.errMsg, this.getClueClassifyList);
            }
        },{
            title: Intl.get('clue.analysis.avalibility.chart', '有效性统计'),
            chartType: 'pie',
            data: this.handleDataList(this.state.clueAvailability.list, true),
            option: this.getChartsOptions(this.state.clueAvailability.list,PIE_CENTER_POSITION),
            noExportCsv: true,
            resultType: getResultType(this.state.clueAvailability.loading, this.state.clueAvailability.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.clueAvailability.errMsg, this.getClueAvailabilityList);
            }
        }];
    }
    //渲染概览页的chart
    renderChartsOverview() {
        const overviewCharts = this.getOverviewCharts();
        return (
            <div className="clue-analysis-overview-container">
                <AntcAnalysis
                    charts={overviewCharts}
                    isUseScrollBar={true}
                    chartHeight={CHART_HEIGHT}
                />
            </div>
        );
    }
    render() {
        return (
            <div className="clue-analysis-panel" data-tracename='线索分析面版'>
                <div className="date-picker-container">
                    <RightPanelClose onClick={this.closeClueAnalysisPanel}/>
                    <div className="date-picker-wrap">
                        <span className="date-picker-tip btn-item">
                            {Intl.get('common.login.time', '时间')}
                        </span>
                        <span className="btn-item">
                            <DatePicker
                                disableDateAfterToday={true}
                                range="year"
                                onSelect={this.onSelectDate}>
                                <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                                <DatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                                <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                                <DatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                                <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                            </DatePicker>
                        </span>
                    </div>                   
                </div>
                <div className="analysis-chart-wrap">
                    <Tabs onChange={this.handleClickTabs}>
                        {hasPrivilege('CRM_CLUE_STATISTICAL') ? <TabPane tab={Intl.get('crm.basic.overview', '概览')}
                            key={TABS.OVERVIEW}>{this.renderChartsOverview()}</TabPane> : null }
                        {hasPrivilege('CRM_CLUE_TREND_STATISTIC_ALL') || hasPrivilege('CRM_CLUE_TREND_STATISTIC_SELF') ? <TabPane tab={Intl.get('clue.customer.analysis.trend', '趋势')}
                            key={TABS.TREND}>{this.renderChartsTrendView()}</TabPane> : null}
                    </Tabs>
                </div>
            </div>
        );
    }
}

ClueAnalysisPanel.defaultProps = {
    closeClueAnalysisPanel: function() {
    },
    accessChannelArray: [],
    clueSourceArray: [],
};
ClueAnalysisPanel.propTypes = {
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    closeClueAnalysisPanel: PropTypes.func
};
export default ClueAnalysisPanel;
