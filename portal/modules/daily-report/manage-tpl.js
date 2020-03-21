/**
 * 管理模板
 */

import { Tabs } from 'antd';
import { VIEW_TYPE } from './consts';
import ReportForm from './report-form';
import SetRule from './set-rule';

const { TabPane } = Tabs;

class ManageTpl extends React.Component {
    render() {
        const { updateState, currentTab } = this.props;

        return (
            <div>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="报告内容" key="1">
                        <ReportForm {...this.props} />
                    </TabPane>
                    <TabPane tab="规则设置" key="2">
                        <SetRule {...this.props} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }

    next() {
        if (!this.props.currentTpl) {
            message.warning('请选择模板');
            return;
        }

        this.props.updateState({ currentView: VIEW_TYPE.SET_RULE, currentTab: 2 });
    }
}

export default ManageTpl;
