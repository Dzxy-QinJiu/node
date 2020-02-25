/**
 * 销售报告右侧面板
 */

import Detail from 'CMP_DIR/detail';

class ReportPanel extends React.Component {
    render() {
        return (
            <div>
                <Detail
                    title="k"
                    content={this.getDetailContent()}
                />
            </div>
        );
    }

    getDetailContent() {
        return <span>k</span>;
    }
}

export default ReportPanel;
