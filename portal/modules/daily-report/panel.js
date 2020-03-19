/**
 * 销售报告右侧面板
 */

require('./style.less');
import { VIEW_TYPE } from './consts';
import Detail from 'CMP_DIR/detail';
import AddTpl from './add-tpl';
import SetRule from './set-rule';
import ReportList from './report-list';
import ReportDetail from './report-detail';
import NumberDetail from './number-detail';
import ReportForm from './report-form';

class ReportPanel extends React.Component {
    state = {
        currentView: this.props.currentView || VIEW_TYPE.ADD_TPL,
        currentStep: 1,
        teamList: [],
        tplList: [],
        reportList: [],
        selectedTpl: '',
        clickedTpl: this.props.clickedTpl || {},
        tplValues: {},
        currentReport: this.props.currentReport || {},
        numberDetail: this.props.numberDetail || [],
        isPreview: false,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentView !== this.props.currentView) {
            this.setState(nextProps);
        }
    }

    render() {
        return (
            <div className="daily-report-panel">
                <Detail
                    title={this.getDetailTitle()}
                    content={this.getDetailContent()}
                />
            </div>
        );
    }

    getDetailTitle() {
        let title = this.state.currentView;

        if (title === '报告详情') {
            const nickName = _.get(this.state.currentReport, 'nickname');
            title = nickName + '的报告详情';
        }

        if (title === '数字详情') {
            title = <span>
                <span>{title}</span>
                <span onClick={() => {this.setState({currentView: VIEW_TYPE.REPORT_DETAIL});}}>返回</span>
            </span>;
        }

        return title;
    }

    getDetailContent() {
        const props = {
            updateState: this.updateState,
            ...this.state
        };

        switch(this.state.currentView) {
            case VIEW_TYPE.ADD_TPL: return <AddTpl {...props} />;
            case VIEW_TYPE.SET_RULE: return <SetRule {...props} />;
            case VIEW_TYPE.REPORT_LIST: return <ReportList {...props} />;
            case VIEW_TYPE.REPORT_DETAIL: return <ReportDetail {...props} />;
            case VIEW_TYPE.NUMBER_DETAIL: return <NumberDetail {...props} />;
            case VIEW_TYPE.REPORT_FORM: return <ReportForm {...props} />;
        }
    }

    updateState = newState => {
        this.setState(newState);
    }
}

export default ReportPanel;
