/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
var TopNav = require('CMP_DIR/top-nav');
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;
import ClueAnalysisStore from '../store/clue-analysis-store';
import ClueAnalysisAction from '../action/clue-analysis-action';
import DatePicker from 'CMP_DIR/datepicker';
import {AntcTable} from 'antc';
import {Select, Tabs} from 'antd';
const TabPane = Tabs.TabPane;
const Option = Select.Option;
import CustomerStageTable from 'MOD_DIR/sales_home_page/public/views/customer-stage-table';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import {AntcAnalysis} from 'antc';
import {getResultType, getErrorTipAndRetryFunction} from 'PUB_DIR/sources/utils/common-method-util';
const PIE_CENTER_POSITION = ['50%', '60%'];
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const CHART_HEIGHT = '400';
class ClueAnalysisPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showCustomerIds: [],//所有客户的id
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

    //获取线索阶段分析列表
    getClueStageList = () => {
        let queryParams = {
            source_start_time: this.state.start_time,
            source_end_time: this.state.end_time
        };
        if (!this.state.start_time) {
            queryParams = {};
        }
        if (this.state.selectedAccess !== Intl.get('common.all', '全部')) {
            queryParams.access_channel = this.state.selectedAccess;
        }
        if (this.state.selectedSource !== Intl.get('common.all', '全部')) {
            queryParams.clue_source = this.state.selectedSource;
        }
        ClueAnalysisAction.getClueStageAnalysis(queryParams);
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
    //获取线索是否关联客户统计


    refreshClueAnalysisData() {
        //获取线索阶段分析列表
        this.getClueStageList();
        //获取线索来源统计列表
        this.getClueSourceLists();
        //获取线索接入渠道
        this.getClueAccessChannelList();
        //获取线索分类
        this.getClueClassifyList();
    }

    onSelectDate = (startTime, endTime) => {
        let timeObj = {startTime: startTime, endTime: endTime};
        ClueAnalysisAction.changeSearchTime(timeObj);
        setTimeout(() => {
            this.refreshClueAnalysisData();
        });
    };
    handleAccessSelect = (access) => {
        ClueAnalysisAction.changeAccess(access);
        setTimeout(() => {
            this.refreshClueAnalysisData();
        });
    };
    handleSourceSelect = (source) => {
        ClueAnalysisAction.changeSource(source);
        setTimeout(() => {
            this.refreshClueAnalysisData();
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
            <div className="clue-select-container">
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
            let targetObj = _.find(this.state.clueStageList, (item) => {
                return item.label === stage.tagName;
            });
            let stageValue = 0;
            if (targetObj) {
                stageValue = targetObj.num;
            }
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

    handleDataList(originData) {
        var innerCircleData = [{
                name: Intl.get('clue.analysis.ability', '有效'),
                value: 0
            },{
                name: Intl.get('clue.analysis.inability', '无效'),
                value: 0
            }], outerCircleData = [], tooltipData = [];
        _.forEach(originData, (dataItem, ItemKey) => {
            if (ItemKey === 'inavaililityData' && _.isArray(dataItem.result)) {
                _.forEach(dataItem.result, (item) => {
                    _.forEach(item, (value, key) => {
                        outerCircleData.push({
                            'value': value,
                            'name': key || Intl.get('common.unknown', '未知')
                        });
                        innerCircleData[1].value += value;
                    });
                });
            } else if (ItemKey === 'availabilityData' && _.isArray(dataItem.result)) {
                _.forEach(dataItem.result, (item) => {
                    _.forEach(item, (value, key) => {
                        outerCircleData.push({
                            'value': value,
                            'name': key || Intl.get('common.unknown', '未知')
                        });
                        innerCircleData[0].value += value;
                    });
                });
            }
        });
        return {
            'innerCircleData': innerCircleData,
            'outerCircleData': outerCircleData,
        };

    }
    renderDiffTypeChart(clueData, title, retryCallback){
        var originData = clueData.list;
        var DataObj = this.handleDataList(originData);
        var clueCharts = [
            {
                title: title,
                chartType: 'pie',
                layout: {
                    sm: 24,
                },
                data: DataObj.innerCircleData,
                option: this.getChartsOptions(DataObj, title,PIE_CENTER_POSITION),
                noExportCsv: true,
                resultType: getResultType(clueData.loading, clueData.errMsg),
                errMsgRender: () => {
                    return getErrorTipAndRetryFunction(clueData.errMsg, retryCallback);
                }
            }
        ];
        return (
            <div>
                <AntcAnalysis
                    charts={clueCharts}
                    chartHeight={CHART_HEIGHT}
                />
            </div>
        );
    }

    //获取options的配置
    getChartsOptions(DataObj,title,centerPosition){
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
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
                    name: title,
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '20%'],
                    label: {
                        normal: {
                            position: 'inner',
                            formatter: '{b}'
                        },

                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    center: centerPosition,
                    data: DataObj.innerCircleData
                },
                {
                    name: title,
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: centerPosition,
                    data: DataObj.outerCircleData
                }
            ]
        };
        return option;
    }
    //渲染概览页的chart
    renderChartsOverview() {
        var clueStageCharts = [
            {
                title: Intl.get('clue.stage.statics', '线索阶段统计'),
                chartType: 'funnel',
                data: this.processClueStaticsStageData(),
                layout: {
                    sm: 24,
                },
                noExportCsv: true,
                resultType: getResultType(this.state.getClueStageLoading, this.state.getClueStageErrMsg),
                customOption: {
                    valueField: 'showValue',
                    minSize: '5%',
                },
                errMsgRender: () => {
                    return getErrorTipAndRetryFunction(this.state.getClueStageErrMsg, this.getClueStageList);
                }
            }
        ];
        var HEIGHT = $(window).height() - $('.clue-analysis-panel .ant-tabs-nav-container').height() - 10;
        return (
            <div className="clue-analysis-overview-container" style={{'height': HEIGHT}}>
                <GeminiScrollbar>
                    <div className="clue-trend-analysis col-xs-6">
                        <div className="filter-clue-wrap">
                            {this.filterClueTypeSelect()}
                        </div>
                        <AntcAnalysis
                            charts={clueStageCharts}
                            chartHeight={CHART_HEIGHT}
                        />
                    </div>
                    {/*线索渠道统计*/}
                    <div className="clue-access-analysis col-xs-6">
                        {this.renderDiffTypeChart(this.state.clueAccessChannelList,Intl.get('clue.analysis.access.chart', '渠道统计'),this.getClueAccessChannelList)}
                    </div>
                    {/*线索来源统计*/}
                    <div className="clue-source-analysis col-xs-6">
                        {this.renderDiffTypeChart(this.state.clueSourceList,Intl.get('clue.analysis.source.chart','来源统计'),this.getClueSourceLists)}
                    </div>
                    {/*线索分类统计*/}
                    <div className="clue-classify-analysis col-xs-6">
                        {this.renderDiffTypeChart(this.state.clueClassifyList,Intl.get('clue.analysis.classify.chart','分类统计'),this.getClueClassifyList)}
                    </div>
                </GeminiScrollbar>
            </div>
        );
    }
    render() {
        return (
            <div className="clue-analysis-panel">
                <div className="date-picker-container">
                    <div className="date-picker-wrap">
                        <span className="date-picker-tip">
                            {Intl.get('clue.analysis.consult.time', '咨询时间：')}
                        </span>
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
                    </div>
                    <RightPanelClose onClick={this.closeClueAnalysisPanel}/>
                </div>
                <div className="analysis-chart-wrap">
                    <Tabs>
                        <TabPane tab={Intl.get('crm.basic.overview', '概览')}
                            key="1">{this.renderChartsOverview()}</TabPane>
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
    clueSourceArray: React.PropTypes.object,
    accessChannelArray: React.PropTypes.object,
    closeClueAnalysisPanel: React.PropTypes.func
};
export default ClueAnalysisPanel;