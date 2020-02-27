/**
 * 销售报告右侧面板
 */

import { VIEW_TYPE } from './consts';
import Detail from 'CMP_DIR/detail';
import AddTpl from './add-tpl';
import EditTpl from './edit-tpl';

class ReportPanel extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
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
            changeView: this.changeView,
        };

        switch(this.state.currentView) {
            case VIEW_TYPE.ADD_TPL: return <AddTpl {...props} />;
            case VIEW_TYPE.EDIT_TPL: return <EditTpl {...props} />;
            case VIEW_TYPE.PREVIEW_TPL:
            case VIEW_TYPE.ADD_NEW_TPL:
            case VIEW_TYPE.SET_RULE:
            case VIEW_TYPE.REPORT_LIST:
            case VIEW_TYPE.REPORT_DETAIL:
            case VIEW_TYPE.FILL_IN_REPORT:
        }
    }

    changeView = currentView => {
        this.setState({ currentView });
    }
}

export default ReportPanel;
