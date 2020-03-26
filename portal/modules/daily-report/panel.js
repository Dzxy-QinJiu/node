/**
 * 销售报告右侧面板
 */

require('./style.less');
import { Switch } from 'antd';
import { VIEW_TYPE } from './consts';
import { saveReportConfig } from './utils';
import Detail from 'CMP_DIR/detail';
import OpenReport from './open-report';
import ConfigReport from './config-report';
import SetRule from './set-rule';
import ReportList from './report-list';
import ReportDetail from './report-detail';
import NumberDetail from './number-detail';

class ReportPanel extends React.Component {
    state = {
        currentView: this.props.currentView || VIEW_TYPE.OPEN_REPORT,
        teamList: [],
        reportConfigList: [],
        reportList: [],
        reportConfig: this.props.reportConfig || {},
        reportDetail: this.props.reportDetail || {},
        numberDetail: this.props.numberDetail || [],
        isConfigReport: this.props.isConfigReport || false,
        isOpenReport: this.props.isOpenReport || false,
        isPreviewReport: this.props.isPreviewReport || false,
    }

    componentWillReceiveProps(nextProps) {
        const viewTypeChanged = nextProps.currentView !== this.state.currentView;
        const numberFieldChanged = _.get(nextProps.numberDetail, 'name') !== this.state.numberDetail.name;
        const reportIdChanged = _.get(nextProps.reportDetail, 'id') !== this.state.reportDetail.id;

        if (viewTypeChanged || numberFieldChanged || reportIdChanged) {
            this.setState(nextProps);
        }
    }

    render() {
        return (
            <div className="daily-report daily-report-panel">
                <Detail
                    title={this.getPanelTitle()}
                    content={this.getPanelContent()}
                />
            </div>
        );
    }

    onReportStatusSwitchChange = (reportConfig, checked) => {
        const status = checked ? 'on' : 'off';
        const postData = _.extend({}, reportConfig, { status });

        saveReportConfig(postData, { isChangeStatus: true });
    }

    getPanelTitle() {
        const { currentView, reportConfig, reportDetail, numberDetail, isPreviewReport } = this.state;

        let title = '';
        const nickname = _.get(reportDetail, 'nickname', '');

        switch(currentView) {
            case VIEW_TYPE.NUMBER_DETAIL:
                title = <span>
                    {isPreviewReport ? (
                        <i className="iconfont icon-left-arrow" onClick={() => {this.setState({currentView: VIEW_TYPE.REPORT_DETAIL});}} />
                    ) : null}

                    <span>
                        {moment(reportDetail.time).format(oplateConsts.DATE_FORMAT)} &nbsp;
                        {nickname}
                        {numberDetail.name} &nbsp;
                        {numberDetail.value}
                        {_.isNumber(numberDetail.value) ? Intl.get('contract.22', '个') : null}
                    </span>
                </span>;
                break;
            case VIEW_TYPE.REPORT_DETAIL:
                if (isPreviewReport) {
                    title = Intl.get('analysis.someone.report.details', '{someone}的报告详情', {someone: nickname});
                } else {
                    title = reportConfig.name;
                }
                break;
            case VIEW_TYPE.CONFIG_REPORT:
                title = <div>
                    <span>{reportConfig.name}</span>
                    <Switch defaultChecked={reportConfig.status === 'on'} onChange={this.onReportStatusSwitchChange.bind(this, reportConfig)} />
                </div>;
                break;
            case VIEW_TYPE.OPEN_REPORT:
                title = Intl.get('analysis.open.report', '开启报告');
                break;
            case VIEW_TYPE.SET_RULE:
                title = Intl.get('crm.customer.rule.name', '规则设置');
                break;
        }

        return title;
    }

    getPanelContent() {
        const props = {
            updateState: this.updateState,
            ...this.state
        };

        switch(this.state.currentView) {
            case VIEW_TYPE.OPEN_REPORT: return <OpenReport {...props} />;
            case VIEW_TYPE.CONFIG_REPORT: return <ConfigReport {...props} />;
            case VIEW_TYPE.SET_RULE: return <SetRule {...props} />;
            case VIEW_TYPE.REPORT_DETAIL: return <ReportDetail {...props} />;
            case VIEW_TYPE.NUMBER_DETAIL: return <NumberDetail {...props} />;
        }
    }

    updateState = newState => {
        this.setState(newState);
    }
}

export default ReportPanel;
