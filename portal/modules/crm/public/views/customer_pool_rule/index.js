/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/26.
 */
// 客户池规则设置
import '../../css/customer-pool-rule.less';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import CustomerPoolVisibleRule from './customer-pool-visible-rule';
import CustomerPoolReleaseRule from './customer-pool-release-rule';
import RightPanelModal from 'CMP_DIR/right-panel-modal';

const TAB_KEYS = {
    VISIBLE_RULE: 'visible_rule',//可见规则
    RELEASE_RULE: 'release_rule',//释放规则
};

class CustomerPoolRule extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            activeKey: TAB_KEYS.VISIBLE_RULE
        };
    }

    changeActiveKey = (key) => {
        this.setState({activeKey: key});
    };

    renderTabContent = () => {
        return (
            <div className="customer-pool-tabs-content">
                <Tabs defaultActiveKey={TAB_KEYS.VISIBLE_RULE} activeKey={this.state.activeKey} onChange={this.changeActiveKey}>
                    <TabPane tab={Intl.get('crm.pool.visible.rules', '可见规则')} key={TAB_KEYS.VISIBLE_RULE}>
                        {this.state.activeKey === TAB_KEYS.VISIBLE_RULE ? (
                            <CustomerPoolVisibleRule/>
                        ) : null}
                    </TabPane>
                    <TabPane tab={Intl.get('crm.pool.release.rules', '释放规则')} key={TAB_KEYS.RELEASE_RULE}>
                        {this.state.activeKey === TAB_KEYS.RELEASE_RULE ? (
                            <CustomerPoolReleaseRule/>
                        ) : null}
                    </TabPane>
                </Tabs>
            </div>
        );
    };

    render() {
        return (
            <RightPanelModal
                className="customer-pool-rules-container"
                isShowMadal={this.props.isShowModal}
                isShowCloseBtn
                onClosePanel={this.props.closeRightPanel}
                content={this.renderTabContent()}
                dataTracename="客户池规则设置"
            />
        );
    }
}
CustomerPoolRule.defaultProps = {
    closeRightPanel: function() {},
    isShowModal: false,
};
CustomerPoolRule.propTypes = {
    isShowModal: PropTypes.bool,
    closeRightPanel: PropTypes.func,

};
export default CustomerPoolRule;
