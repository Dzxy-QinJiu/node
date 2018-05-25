/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
var TopNav = require("CMP_DIR/top-nav");
import rightPanelUtil from "CMP_DIR/rightPanel/index";
const RightPanelClose = rightPanelUtil.RightPanelClose;
import ClueAnalysisStore from "../store/clue-analysis-store";
import ClueAnalysisAction from "../action/clue-analysis-action";
import DatePicker from "CMP_DIR/datepicker";
import {AntcTable} from "antc";
import { Select } from "antd";
const Option = Select.Option;
class ClueAnalysisPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
            start_time: this.state.startTime || 0,
            end_time: this.state.endTime || moment().toDate().getTime()
        };
        ClueAnalysisAction.getClueAnalysis(queryParams);
    }

    refreshClueAnalysisData() {
        //获取线索分析列表
        this.getClueAnalysisList();
    }

    onSelectDate = (startTime, endTime, timeType) => {
        let timeObj = {startTime: startTime, endTime: endTime, timeType: timeType};
        ClueAnalysisAction.changeSearchTime(timeObj);
        setTimeout(() => {
            this.refreshClueAnalysisData();
        });
    };
    onSelectRelationDate(){

    }
    filterClueTypeSelect(){
        var accessChannelArr = _.extend([],this.props.accessChannelArray);
        accessChannelArr.unshift(Intl.get("common.all", "全部"));

        const AccessOptions = accessChannelArr.map((x, idx) => (
            <Option key={idx} value={x}>{x}</Option>
        ));
        const ClueOptions = this.props.clueSourceArray.map((x, idx) => (
            <Option key={idx} value={x}>{x}</Option>
        ));
        return (
            <div className="clue-select-container">
                {Intl.get("crm.sales.clue.access.channel", "接入渠道")}：
                <Select
                    value={this.state.selectedAccess}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleSelect}
                >
                    {AccessOptions}
                </Select>
                {Intl.get("crm.sales.clue.source", "线索来源")}：
                <Select
                    value={this.state.selectedSource}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleSelect}
                >
                    {ClueOptions}
                </Select>

            </div>
        );
    }

    render() {
        const columns = [
            {
                title: "",
                dataIndex: "team_name",
                key: "team_name",
            },
            {
                title: Intl.get("sales.stage.intention", "意向"),
                render:function () {
                    return (
                        <div>
                            55
                        </div>
                    );
                }
            },{
                title: Intl.get("common.trial", "试用"),
                dataIndex: "team_name",
                key: "team_name",
            },{
                title: Intl.get("common.trial.qualified", "试用合格"),
                dataIndex: "team_name",
                key: "team_name",
            },{
                title: Intl.get("sales.stage.signed", "签约"),
                dataIndex: "team_name",
                key: "team_name",
            },{
                title: Intl.get("sales.stage.lost", "流失"),
                dataIndex: "team_name",
                key: "team_name",
            }
        ];
        return (
            <div className="clue-analysis-panel">
                <TopNav>
                    <div className="date-range-wrap">
                        <div className="consult-time">
                            {Intl.get("clue.analysis.consult.time", "咨询时间：")}
                        </div>
                        <DatePicker
                            disableDateAfterToday={true}
                            range="year"
                            onSelect={this.onSelectDate}>
                            <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                            <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                            <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                            <DatePicker.Option
                                value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                            <DatePicker.Option
                                value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                            <DatePicker.Option value="year">{Intl.get("common.time.unit.year", "年")}</DatePicker.Option>
                            <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                        </DatePicker>
                        <div className="filter-clue-wrap">
                            {this.filterClueTypeSelect()}
                        </div>
                    </div>
                    <RightPanelClose onClick={this.props.closeClueAnalysisPanel}/>
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
            </div>
        );
    }
}
ClueAnalysisPanel.defaultProps = {
    closeClueAnalysisPanel: function () {
    },


};
export default ClueAnalysisPanel;