/**
 * Created by hzl on 2019/8/9.
 * 客户阶段详情- 剧本、销售行为、自动变更
 */
import {Tabs, message} from 'antd';
const TabPane = Tabs.TabPane;
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import SaleBehavior from './sale-behavior';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import CustomerStageAjax from '../ajax';
import AutoConditionsStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';
import CustomerStageAction from '../action/customer-stage-action';
import CUSTOMER_STAGE_PRIVILEGE from '../privilege-const';
import Trace from 'LIB_DIR/trace';
const EDIT_FEILD_LESS_WIDTH = 310;


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

    // 保存编辑自动变更条件
    saveEditAutoConditions = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存自动变更条件的修改');
        let customerStage = this.props.customerStage;
        const stageId = customerStage.id;
        const params = {
            saleProcessId: this.props.saleProcessId,
            stageId: stageId
        };
        const conditions = saveObj.conditions;
        const autoConditionsList = this.props.autoConditionsList;
        const submitObj = _.filter(autoConditionsList, item => item.name === conditions);
        if (submitObj) {
            CustomerStageAjax.editCustomerStageAutoConditions(submitObj, params).then((result) => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();

                } else {
                    if (_.isFunction(errorFunc)) errorFunc();
                }
            }, (errorMsg) => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg);
            });
        } else {
            errorFunc(errorMsg);
        }
    };

    // 修改自动变更的条件
    handleConfirmAutoStatusConditions = (conditionsObj) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '修改自动变更的状态');
        let customerStage = this.props.customerStage;
        const stageId = customerStage.id;
        const params = {
            saleProcessId: this.props.saleProcessId,
            stageId: stageId,
            status: conditionsObj.status === '0' ? '1' : '0'
        };
        const submitObj = {id: conditionsObj.id};
        CustomerStageAjax.changeAutoConditionsStatus(submitObj, params).then((result) => {
            if (result && result.id) {
                message.success(Intl.get('crm.218', '修改成功！'));
                const updateStatusObj = {
                    id: stageId,
                    flag: 'autoConditionsStatus',
                    autoConditions: [result]
                };
                CustomerStageAction.updateCustomerStageList(updateStatusObj);
            } else {
                message.error(Intl.get('crm.218', '修改成功！'));
            }
        }, (errorMsg) => {
            message.error(errorMsg || Intl.get('crm.219', '修改失败！'));
        });
    };

    // 渲染面板的内容
    renderContent = () => {
        const customerStage = this.props.customerStage;
        const id = customerStage.id;
        let playBooks = customerStage.play_books; // 剧本
        let autoConditions = customerStage.auto_conditions; // 自动变更
        let autoId = _.get(autoConditions, '[0].id');
        let autoName = _.get(autoConditions, '[0].name');
        let status = _.get(autoConditions, '[0].status');
        const autoConditionsList = this.props.autoConditionsList;
        const autoConditionsOptions = _.map(autoConditionsList, autoItem => <Option value={autoItem.name}>{autoItem.name}</Option>);
        return (
            <div className="right-panel-wrapper">
                <div className="customer-stage-detail-content" ref="wrap">
                    <Tabs defaultActiveKey="1" onChange={this.changeTab} activeKey={this.state.activeKey}>
                        <TabPane tab={Intl.get('sales.process.customer.stage.play', '剧本')} key="1">
                            <div className="customer-stage-play">
                                <DynamicAddDelField
                                    id={id}
                                    field='play_books'
                                    value={playBooks}
                                    hasEditPrivilege={hasPrivilege(CUSTOMER_STAGE_PRIVILEGE.UPDATE_SPECIFIC_STAGE)}
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
                        <TabPane tab={Intl.get('sales.process.customer.stage.auto.conditions', '自动变更')} key="3">
                            <div className="customer-stage-auto-conditions">
                                <div className="auto-conditions-title">
                                    {Intl.get('sales.process.customer.stage.auto.conditions.title', '当符合以下条件时，客户自动变更为该阶段')}
                                </div>
                                <div className="auto-conditions-content">
                                    <div className="basic-info-conditions">
                                        <span className="basic-info-label">
                                            {Intl.get('sales.process.auto.conditions.label', '选择条件')}:
                                        </span>
                                        <BasicEditSelectField
                                            id={id}
                                            displayText={autoName}
                                            value={autoName}
                                            field="conditions"
                                            selectOptions={autoConditionsOptions}
                                            placeholder={Intl.get('sales.process.auto.conditions.placeholder', '请选择自动变更的条件')}
                                            validators={[{message: Intl.get('sales.process.auto.conditions.placeholder', '请选择自动变更的条件')}]}
                                            width={EDIT_FEILD_LESS_WIDTH}
                                            hasEditPrivilege={hasPrivilege(CUSTOMER_STAGE_PRIVILEGE.UPDATE_SPECIFIC_STAGE)}
                                            saveEditSelect={this.saveEditAutoConditions.bind(this)}
                                            noDataTip={Intl.get('sales.process.auto.conditions.no.conditions', '暂无条件')}
                                            addDataTip={Intl.get('apply.add.apply.condition', '添加条件')}
                                        />
                                    </div>
                                    {
                                        status ? (
                                            <div className="basic-info-status">
                                                <span className="basic-info-label">
                                                    {Intl.get('clue.customer.if.switch', '是否启用')}:
                                                </span>
                                                <AutoConditionsStatusSwitch
                                                    title={Intl.get('sales.process.status.auto.conditions.tip', '确定要{status}该客户阶段的自动变更条件吗？', {
                                                        status: status === '0' ? Intl.get('common.enabled', '启用') :
                                                            Intl.get('common.stop', '停用')
                                                    })}
                                                    handleConfirm={this.handleConfirmAutoStatusConditions.bind(this, autoConditions[0])}
                                                    status={status === '1' ? true : false}
                                                />
                                            </div>
                                        ) : null
                                    }
                                </div>
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
    autoConditionsList: []
};
CustomerStageDetail.propTypes = {
    closeCustomerStageDetail: PropTypes.bool,
    saveCustomerStageSettingPlay: PropTypes.bool,
    customerStage: PropTypes.string,
    salesBehaviorList: PropTypes.array,
    saleProcessId: PropTypes.string,
    autoConditionsList: PropTypes.array,
};

export default CustomerStageDetail;