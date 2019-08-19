/**
 * Created by hzl on 2019/8/9.
 * 客户阶段详情- 剧本、销售行为、自动变更
 */
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import SaleBehavior from './sale-behavior';
import Trace from 'LIB_DIR/trace';

class CustomerStageDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: '1'
        };
    }

    // 关闭客户阶段详情面板
    handleCloseStageDetailPanel(event) {
        event.preventDefault();
        Trace.traceEvent(event, '关闭客户阶段详情面板');
        this.props.closeCustomerStageDetail();
    }

    saveCustomerStageSettingPlay = (type, saveObj, successFunc, errorFunc) => {
        this.props.saveCustomerStageSettingPlay(type, saveObj, successFunc, errorFunc);
    };

    // 切换tab项
    changeTab = (key) => {
        this.setState({
            activeKey: key
        });
    };

    // 渲染面板的内容
    renderContent = () => {
        const customerStage = this.props.customerStage;
        let playBooks = customerStage.play_books; // 剧本
        return (
            <div className="right-panel-wrapper">
                <div className="customer-stage-detail-content" ref="wrap">
                    <Tabs defaultActiveKey="1" onChange={this.changeTab} activeKey={this.state.activeKey}>
                        <TabPane tab={Intl.get('sales.process.customer.stage.play', '剧本')} key="1">
                            <div className="customer-stage-play">
                                <DynamicAddDelField
                                    id={customerStage.id}
                                    field='play_books'
                                    value={playBooks}
                                    hasEditPrivilege={hasPrivilege('CRM_UPDATE_CUSTOMER_SALES')}
                                    placeholder={Intl.get('sales.process.customer.stage.play.placeholder', '请输入剧本')}
                                    saveEditData={this.saveCustomerStageSettingPlay.bind(this, {editItem: 'play_books',id: customerStage.id})}
                                    noDataTip={Intl.get('sales.process.customer.stage.no.play', '暂无剧本')}
                                    addDataTip={Intl.get('sales.process.customer.stage.add.play', '添加剧本')}
                                    inputBoxType="textarea"
                                />
                            </div>
                        </TabPane>
                        <TabPane tab={Intl.get('common.sales.behavior', '销售行为')} key="2">
                            <div className="customer-stage-sale-behavior">
                                <SaleBehavior
                                    salesBehaviorList={this.props.salesBehaviorList}
                                    customerStage={this.props.customerStage}
                                    closeCustomerStageDetail={this.props.closeCustomerStageDetail}
                                    saleProcessId={this.props.saleProcessId}
                                />
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    };

    renderBasicInfo = () => {
        return (
            <div className="customer-stage-basic-info">
                <div className="title">{Intl.get('sales.stage.message', '信息')}</div>
                <div className="sub-title">
                    {Intl.get('sales.process.customer.stage.detail.title', '设置信息阶段的剧本、销售行为、自动变更条件')}
                </div>
            </div>
        );
    };

    render() {
        return (
            <RightPanelModal
                className="customer-stage-detail-container"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.handleCloseStageDetailPanel.bind(this)}
                title={this.renderBasicInfo()}
                content={this.renderContent()}
                dataTracename={'客户阶段详情面板'}
            />);
    }
}

function noop() {
}
CustomerStageDetail.defaultProps = {
    closeCustomerStageDetail: noop,
    saveCustomerStageSettingPlay: noop,
    customerStage: {},
    salesBehaviorList: [],
};
CustomerStageDetail.propTypes = {
    closeCustomerStageDetail: PropTypes.bool,
    saveCustomerStageSettingPlay: PropTypes.bool,
    customerStage: PropTypes.string,
    salesBehaviorList: PropTypes.array,
    saleProcessId: PropTypes.string,
};

export default CustomerStageDetail;