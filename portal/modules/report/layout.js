/**
 * 运营报告布局组件
 */

import "./style.less";
import TopNav from "../../components/top-nav";
import AnalysisFilter from "../../components/analysis/filter";
import { storageUtil } from "ant-utils";

const ReportLayout = React.createClass({
    render() {
        let storedAppId = storageUtil.local.get(this.props.localStorageAppIdKey);

        //将原来在localStorage中存储的appId为用逗号分隔的综合的值改为"all"
        //以修复初次加载时app选择器只显示id，不显示应用名称的问题
        if (storedAppId && storedAppId.indexOf(",") > -1) {
            storedAppId = "all";
            storageUtil.local.set(this.props.localStorageAppIdKey, "all");
        }

        return (
            <div className="operation-report-container">
                <TopNav>
                    <TopNav.MenuList />
                    <AnalysisFilter isSelectFirstApp={!storedAppId} selectedApp={storedAppId} />
                </TopNav>
                <div className="operation-report-content">
                {this.props.sectionList.map((section, index) => { return (
                    <div className="report-item">
                        <h4>{section.name}</h4>
                        <div className="report-item-content">
                        {section.charts.map((chart, index) => { return (
                            <div className="report-chart-container" style={chart.style || {}}>
                                <div className="chart-descr">{index + 1}、{chart.name}</div>
                                <div className="report-chart">
                                    {chart.title? (
                                    <div className="report-chart-title">{chart.title}</div>
                                    ) : null}
                                    {chart.content}
                                </div>
                            </div>
                        );})}
                        </div>
                    </div>
                );})}
                </div>
            </div>
        );
    }
});

module.exports = ReportLayout;
