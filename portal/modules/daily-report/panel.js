/**
 * 销售报告右侧面板
 */

import Detail from 'CMP_DIR/detail';
import { VIEW_TYPE } from './consts';

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
        return <span>k</span>;
    }
}

export default ReportPanel;
