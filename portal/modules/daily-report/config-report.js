/**
 * 配置报告
 */

import { Tabs } from 'antd';
import { VIEW_TYPE } from './consts';
import SetRule from './set-rule';
import ReportDetail from './report-detail';

const { TabPane } = Tabs;

class ConfigReport extends React.Component {
    render() {
        const { updateState, currentTab } = this.props;

        return (
            <div data-tracename="配置报告视图">
                <Tabs defaultActiveKey="1">
                    <TabPane tab={Intl.get('analysis.content.of.the.report', '报告内容')} key="1">
                        <ReportDetail {...this.props} />
                    </TabPane>
                    <TabPane tab={Intl.get('crm.customer.rule.name', '规则设置')} key="2">
                        <SetRule {...this.props} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default ConfigReport;
