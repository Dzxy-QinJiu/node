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
import { Select} from 'antd';
const Option = Select.Option;
import CustomerStageTable from 'MOD_DIR/sales_home_page/public/views/customer-stage-table';
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

    getClueAnalysisList() {
        let queryParams = {
            source_start_time: this.state.source_start_time,
            source_end_time: this.state.source_end_time
        };
        if (!this.state.source_start_time){
            queryParams = {};
        }
        if (this.state.selectedAccess !== Intl.get('common.all', '全部')){
            queryParams.access_channel = this.state.selectedAccess;
        }
        if (this.state.selectedSource !== Intl.get('common.all', '全部')){
            queryParams.clue_source = this.state.selectedSource;
        }
        ClueAnalysisAction.getClueAnalysis(queryParams);
    }

    refreshClueAnalysisData() {
        //获取线索分析列表
        this.getClueAnalysisList();
    }

    onSelectDate = (startTime, endTime) => {
        let timeObj = {sourceStartTime: startTime, sourceEndTime: endTime};
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

    filterClueTypeSelect(){
        var accessChannelArr = _.extend([],this.props.accessChannelArray);
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
                {Intl.get('crm.sales.clue.access.channel', '接入渠道')}：
                <Select
                    value={this.state.selectedAccess}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleAccessSelect}
                >
                    {AccessOptions}
                </Select>
                {Intl.get('crm.sales.clue.source', '线索来源')}：
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
        ClueAnalysisAction.getCustomerById(idsStr,label);
        this.setState({
            showCustomerIds: ids,
        });
    };
    closeCustomersContentPanel=() => {
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
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id == levelId);
        return levelObj ? levelObj.level : '';
    }
    render() {
        const handleNum = num => {
            if (num && num > 0) {
                return '+' + num;
            }
        };
        const columns = [
            {
                title: Intl.get('sales.stage.intention', '意向'),
                align: 'right',
                width: 100,
                render: (text, record, index) => {
                    if (record.label === Intl.get('sales.stage.intention', '意向')){
                        return (
                            <div className="customer-num" onClick={this.handleShowCustomerInfo.bind(this, record.customer_ids, record.label)}>
                                {handleNum(record.num)}
                            </div>
                        );
                    }

                }
            },{
                title: Intl.get('common.trial', '试用'),
                align: 'right',
                width: 100,
                render: (text, record, index) => {
                    if (record.label === Intl.get('common.trial', '试用')){
                        return (
                            <div className="customer-num" onClick={this.handleShowCustomerInfo.bind(this, record.customer_ids, record.label)}>
                                {handleNum(record.num)}
                            </div>
                        );
                    }

                }
            },{
                title: Intl.get('common.trial.qualified', '试用合格'),
                align: 'right',
                width: 100,
                render: (text, record, index) => {
                    if (record.label === Intl.get('common.trial.qualified', '试用合格')){
                        return (
                            <div className="customer-num" onClick={this.handleShowCustomerInfo.bind(this, record.customer_ids, record.label)}>
                                {handleNum(record.num)}
                            </div>
                        );
                    }

                }
            },{
                title: Intl.get('sales.stage.signed', '签约'),
                align: 'right',
                width: 100,
                render: (text, record, index) => {
                    if (record.label === Intl.get('sales.stage.signed', '签约')){
                        return (
                            <div className="customer-num" onClick={this.handleShowCustomerInfo.bind(this, record.customer_ids, record.label)}>
                                {handleNum(record.num)}
                            </div>
                        );
                    }

                }
            },{
                title: Intl.get('sales.stage.lost', '流失'),
                align: 'right',
                width: 100,
                render: (text, record, index) => {
                    if (record.label === Intl.get('sales.stage.lost', '流失')){
                        return (
                            <div className="customer-num" onClick={this.handleShowCustomerInfo.bind(this, record.customer_ids, record.label)}>
                                {handleNum(record.num)}
                            </div>
                        );
                    }

                }
            }
        ];
        var stageChangedCustomerList = {
            data: this.state.customersList,
            errorMsg: this.state.getCustomersErrMsg,
            loading: this.state.getCustomersLoading,
            lastId: '',
            listenScrollBottom: false
        };
        return (
            <div className="clue-analysis-panel">
                <TopNav>
                    <div className="date-range-wrap">
                        <div className="consult-time">
                            {Intl.get('clue.analysis.consult.time', '咨询时间：')}
                        </div>
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
                        <div className="filter-clue-wrap">
                            {this.filterClueTypeSelect()}
                        </div>
                    </div>
                    <RightPanelClose onClick={this.closeClueAnalysisPanel}/>
                </TopNav>
                <div className="analysis-clue-container">
                    <AntcTable
                        loading={this.state.getClueAnalysisLoading}
                        columns={columns}
                        scroll={{ x: true, y: 200 }}
                        pagination={false}
                        dataSource={this.state.clueAnalysisList}
                    />
                </div>
                <RightPanel
                    className="customer-stage-table-wrapper"
                    showFlag={this.state.showCustomerIds.length}
                >
                    {this.state.showCustomerIds.length ?
                        <CustomerStageTable
                            result={stageChangedCustomerList}
                            onClose={this.closeCustomersContentPanel}
                        /> : null}
                </RightPanel>
            </div>
        );
    }
}
ClueAnalysisPanel.defaultProps = {
    closeClueAnalysisPanel: function() {
    },


};
export default ClueAnalysisPanel;