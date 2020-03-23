/**
 * 开启报告
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';
import { getReportConfigList } from './utils';
import DetailCard from 'CMP_DIR/detail-card';

class OpenReport extends React.Component {
    componentDidMount() {
        getReportConfigList({
            query: { status: 'off' },
            callback: result => this.props.updateState({ reportConfigList: result })
        });
    }

    render() {
        const { updateState, reportConfig } = this.props;

        return (
            <div>
                {_.map(this.props.reportConfigList, reportConfig => (
                    <DetailCard
                        title={reportConfig.name}
                        content={this.renderCardContent(reportConfig)}
                    />
                ))}
            </div>
        );
    }

    renderCardContent(reportConfig) {
        const { updateState } = this.props;

        return (
            <div>
                <a href="javascript:void(0)" onClick={() => { updateState({ currentView: VIEW_TYPE.REPORT_DETAIL, reportConfig }); }}>查看</a>

                <Button
                    onClick={() => { updateState({ currentView: VIEW_TYPE.SET_RULE, reportConfig }); }}
                >
                    开启
                </Button>
            </div>
        );
    }
}

export default OpenReport;
