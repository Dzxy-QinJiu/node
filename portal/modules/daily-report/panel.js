/**
 * 销售报告右侧面板
 */

import { VIEW_TYPE } from './consts';
import Detail from 'CMP_DIR/detail';
import AddTpl from './add-tpl';
import EditTpl from './edit-tpl';
import SetRule from './set-rule';
import ReportList from './report-list';
import ReportForm from './report-form';
import ReportDetail from './report-detail';
import PreviewTpl from './preview-tpl';
import ManageTpl from './manage-tpl';
import AddNewTpl from './add-new-tpl';

class ReportPanel extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
        currentStep: 1,
    }

    render() {
        return (
            <div>
                <Detail
                    title={this.getDetailTitle()}
                    content={this.getDetailContent()}
                />
            </div>
        );
    }

    getDetailTitle() {
        let title = this.state.currentView;

        return title;
    }

    getDetailContent() {
        const props = {
            updateState: this.updateState,
            ...this.state
        };

        switch(this.state.currentView) {
            case VIEW_TYPE.ADD_TPL: return <AddTpl {...props} />;
            case VIEW_TYPE.EDIT_TPL: return <EditTpl {...props} />;
            case VIEW_TYPE.PREVIEW_TPL: return <PreviewTpl {...props} />;
            case VIEW_TYPE.ADD_NEW_TPL: return <AddNewTpl {...props} />;
            case VIEW_TYPE.SET_RULE: return <SetRule {...props} />;
            case VIEW_TYPE.REPORT_LIST: return <ReportList {...props} />;
            case VIEW_TYPE.REPORT_DETAIL: return <ReportDetail {...props} />;
            case VIEW_TYPE.REPORT_FORM: return <ReportForm {...props} />;
        }
    }

    updateState = newState => {
        this.setState(newState);
    }
}

export default ReportPanel;
