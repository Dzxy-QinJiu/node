/**
 * Created by hzl on 2019/8/6.
 * 客户阶段
 */
require('../css/customer-stage.less');
import Trace from 'LIB_DIR/trace';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;
import {message, Button, Popover, Icon} from 'antd';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import CustomerStageAction from '../action/customer-stage-action';
import CustomerStageStore from '../store/customer-stage-store';
import CustomerStageAjax from '../ajax';
import CustomerStageForm from './customer-stage-form';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import CustomerStageInfo from './customer-stage-info';

class CustomerStage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...CustomerStageStore.getState(),
        };
    }

    onChange = () => {
        this.setState({...CustomerStageStore.getState()});
    };

    componentDidMount() {
        CustomerStageStore.listen(this.onChange);
        let saleProcessId = this.props.saleProcessId;
        CustomerStageAction.getCustomerStageList(saleProcessId);
        CustomerStageAction.getCustomerStageSaleBehavior(); // 获取销售行为
    }

    componentWillUnmount() {
        CustomerStageStore.unlisten(this.onChange);
    }

    // 显示客户阶段详情
    showCustomerStageDetail(customerStage) {
        CustomerStageAction.showCustomerStageDetail(customerStage);
    }

    // 关闭客户阶段详情
    closeCustomerStageDetail(customerStage) {
        CustomerStageAction.closeCustomerStageDetail(customerStage);
    }

    saveCustomerStageSettingPlay = (type, saveObj, successFunc, errorFunc) => {
        let saleProcessId = this.props.saleProcessId;
        CustomerStageAjax.editCustomerStage(saveObj, saleProcessId).then( (result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                saveObj.flag = 'editPlay';
                CustomerStageAction.updateCustomerStageList(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errMsg);
        } );
    }

    // 显示客户阶段表单
    showCustomerStageForm = (customerStage) => {
        CustomerStageAction.showCustomerStageForm(customerStage);
    };

    // 关闭客户阶段表单
    closeCustomerStageForm = () => {
        CustomerStageAction.closeCustomerStageForm();
    };

    // 提交客户阶段表单数据（添加客户阶段和编辑客户阶段）
    submitCustomerStageForm = (customerStage) => {
        let saleProcessId = this.props.saleProcessId;
        if (customerStage.id) { // 编辑客户阶段
            CustomerStageAjax.editCustomerStage(customerStage, saleProcessId).then( (result) => {
                if (result) {
                    customerStage.flag = 'edit';
                    CustomerStageAction.updateCustomerStageList(customerStage);
                    CustomerStageAction.closeCustomerStageForm();
                    message.success(Intl.get('crm.218', '修改成功！'));
                } else {
                    CustomerStageAction.closeCustomerStageForm();
                    message.success(Intl.get('crm.219', '修改失败！'));
                }
            }, (errMsg) => {
                CustomerStageAction.closeCustomerStageForm();
                message.success(errMsg || Intl.get('crm.219', '修改失败！'));
            } );
        } else { // 添加客户阶段
            let order = _.get(this.state.customerStageList, 'length');
            customerStage.order = order + 1; // 需要传客户阶段的序号
            CustomerStageAjax.addCustomerStage(customerStage, saleProcessId).then( (result) => {
                if (result && result.id) {
                    CustomerStageAction.updateCustomerStageList(result);
                    CustomerStageAction.closeCustomerStageForm();
                    message.success(Intl.get('crm.216', '添加成功！'));
                } else {
                    CustomerStageAction.closeCustomerStageForm();
                    message.error(Intl.get('member.add.failed', '添加失败！'));
                }
            }, (errMsg) => {
                CustomerStageAction.closeCustomerStageForm();
                message.error(errMsg || Intl.get('member.add.failed', '添加失败！'));
            });
        }
    };

    // 显示客户阶段模态框
    showCustomerStageModalDialog = (customerStage) => {
        CustomerStageAction.showCustomerStageModalDialog(customerStage);
    };

    // 关闭客户阶段模态
    closeCustomerStageModalDialog = (customerStage) => {
        CustomerStageAction.closeCustomerStageModalDialog(customerStage);
    };

    // 删除客户阶段
    deleteCustomerStage = (customerStage) => {
        let id = customerStage.id;
        let deleteStage = _.cloneDeep(customerStage);
        CustomerStageAjax.deleteCustomerStage(id).then( (result) => {
            if (result) {
                customerStage.flag = 'delete';
                CustomerStageAction.updateCustomerStageList(customerStage);
                this.closeCustomerStageModalDialog(deleteStage);
                message.success(Intl.get('crm.138', '删除成功！'));
            } else {
                this.closeCustomerStageModalDialog(customerStage);
                message.error(Intl.get('crm.139', '删除失败！'));
            }
        }, (errMsg) => {
            this.closeCustomerStageModalDialog(customerStage);
            message.error(errMsg || Intl.get('crm.139', '删除失败！'));
        });
    };

    // 显示客户阶段变更顺序
    showCustomerStageTransferOrder = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-div:first-child span'), '变更客户阶段顺序');
        CustomerStageAction.showCustomerStageTransferOrder();
    };

    // 关闭客户阶段变更顺序
    closeCustomerStageTransferOrder = (isTransferOrderSuccess) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-btn:last-child span'), '取消对客户阶段顺序更改的保存');
        CustomerStageAction.closeCustomerStageTransferOrder(isTransferOrderSuccess);
    };

    // 上移客户阶段
    customerStageOrderUp = (customerStage) => {
        CustomerStageAction.customerStageOrderUp(customerStage);
    };

    // 下移客户阶段
    customerStageOrderDown = (customerStage) => {
        CustomerStageAction.customerStageOrderDown(customerStage);
    };

    handleChangeCustomerStageOrder = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-btn:last-child span'), '保存对客户阶段的更改');
        CustomerStageAjax.changeCustomerStageOrder(this.state.customerStageList).then( (result) => {
            if (result) {
                this.closeCustomerStageTransferOrder(true);
            } else {
                this.closeCustomerStageTransferOrder();
            }
        }, (errMsg) => {
            this.closeCustomerStageTransferOrder();
            message.error(errMsg || Intl.get('sales.process.change.order.failed', '变更客户阶段顺序失败'));
        } );
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        let length = _.get(this.state.customerStageList, 'length');
        let disabled = false;
        let title = '';
        if (length > 7) {
            disabled = true;
            title = Intl.get('sales.process.customer.stage.toplimit', '客户阶段个数已达上限（8个）');
        }
        return (
            <div className='condition-operator'>
                <div className="customer-stage-title">
                    {this.props.saleProcesTitle}
                </div>
                <div className="customer-stage-operator">
                    <PrivilegeChecker check="CRM_ADD_CUSTOMER_SALES" className="add-customer-stage-btn">
                        {title ? (
                            <Popover content={title}>
                                <Button
                                    type="ghost"
                                    className="customer-stage-top-btn btn-item"
                                    disabled={disabled}
                                >
                                    <Icon type="plus" />
                                    {Intl.get('sales.process.add.customer.stage', '添加客户阶段')}
                                </Button>
                            </Popover>
                        ) : (
                            <Button
                                type="ghost"
                                className="customer-stage-top-btn btn-item"
                                onClick={this.showCustomerStageForm.bind(this, 'addCustomerStage')}
                                data-tracename="添加客户阶段"
                            >
                                <Icon type="plus" />
                                {Intl.get('sales.process.add.customer.stage', '添加客户阶段')}
                            </Button>
                        )}
                    </PrivilegeChecker>
                    <div className="customer-stage-change-order">
                        {
                            this.state.isShowCustomerStageTransferOrder ?
                                (<div className="customer-stage-top-div-group">
                                    <div className="customer-stage-top-div">
                                        <Button
                                            type="ghost"
                                            className="customer-stage-top-btn btn-item"
                                            onClick={this.closeCustomerStageTransferOrder.bind(this)}
                                        >
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                    </div>
                                    <div className="customer-stage-top-div">
                                        <Button
                                            type="ghost"
                                            className="customer-stage-top-btn btn-item"
                                            onClick={this.handleChangeCustomerStageOrder.bind(this)}
                                        >
                                            {Intl.get('common.save', '保存')}
                                        </Button>
                                    </div>
                                </div>) : (
                                    <PrivilegeChecker
                                        check="CRM_UPDATE_CUSTOMER_SALES"
                                    >
                                        <Button
                                            type="ghost"
                                            className="customer-stage-top-btn btn-item"
                                            onClick={this.showCustomerStageTransferOrder.bind(this)}
                                        >
                                            <i className='iconfont icon-transfer'></i>
                                            {Intl.get('sales.stage.change.sort', '变更顺序')}
                                        </Button>
                                    </PrivilegeChecker>
                                )
                        }
                    </div>
                </div>
            </div>
        );
    };

    retryGetOrderList = () => {
        let saleProcessId = this.props.saleProcessId;
        CustomerStageAction.getCustomerStageList(saleProcessId);
    };

    renderMsgTips = (errMsg) => {
        return (
            <div>
                <span>{errMsg},</span>
                <a className="retry-btn" onClick={this.retryGetOrderList}>
                    {Intl.get('user.info.retry', '请重试')}
                </a>
            </div>
        );
    };

    renderNoDataTipsOrErrMsg = () => {
        let noDataTips = Intl.get('sales.process.customer.stage.nodata.tips', '暂无客户阶段，请先添加');
        let errMsg = this.state.getCustomerStageListErrMsg;
        if (errMsg) {
            noDataTips = this.renderMsgTips(errMsg);
        }
        return (
            <NoDataIntro noDataTip={noDataTips}/>
        );
    };

    // 展开收起客户阶段详情（剧本、销售行为）
    toggleCustomerStageDetail = (item) => {
        CustomerStageAction.toggleCustomerStageDetail(item);
    };

    closeCustomerStagePanel = () => {
        CustomerStageAction.setInitialData();
        this.props.closeCustomerStagePanel();
    };

    render() {
        let customerStageList = this.state.customerStageList;
        let length = _.get(customerStageList, 'length');
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        const width = this.props.containerWidth - 100;
        return (
            <RightPanel
                showFlag={this.props.isShowCustomerStage}
                className="customer-stage-panel"
                data-tracename="客户阶段管理"
                style={{height: height, width: this.props.containerWidth}}
            >
                <RightPanelClose onClick={this.closeCustomerStagePanel}/>
                <div className="customer-stage-container">
                    <div className="customer-stage-content" style={{height: height}}>
                        <div className="customer-stage-top-nav">
                            {this.renderTopNavOperation()}
                        </div>
                        <GeminiScrollBar style={{height: containerHeight}}>
                            {
                                this.state.loading ? (
                                    <Spinner/>
                                ) : null
                            }
                            {
                                !this.state.loading && (length === 0 || this.state.getCustomerStageListErrMsg) ?
                                    this.renderNoDataTipsOrErrMsg() : null
                            }
                            <div className="customer-stage-table-block">
                                <ul className="customer-stage-timeline">
                                    {
                                        _.map(customerStageList, (item, idx) => {
                                            return (
                                                <li className="customer-stage-timeline-item" key={idx}>
                                                    <div className="customer-stage-timeline-item-tail"></div>
                                                    <div className="customer-stage-timeline-item-head">
                                                        <i className='iconfont icon-order-arrow-down'></i>
                                                    </div>
                                                    <div className="customer-stage-timeline-item-right"></div>
                                                    <CustomerStageInfo
                                                        width={width}
                                                        customerStage={item}
                                                        toggleCustomerStageDetail={this.toggleCustomerStageDetail}
                                                        showCustomerStageModalDialog={this.showCustomerStageModalDialog}
                                                        closeCustomerStageModalDialog={this.closeCustomerStageModalDialog}
                                                        showCustomerStageForm={this.showCustomerStageForm}
                                                        deleteCustomerStage={this.deleteCustomerStage}
                                                        customerStageOrderUp={this.customerStageOrderUp}
                                                        customerStageOrderDown={this.customerStageOrderDown}
                                                        isShowCustomerStageTransferOrder={this.state.isShowCustomerStageTransferOrder}
                                                        showCustomerStageDetail={this.showCustomerStageDetail}
                                                        closeCustomerStageDetail={this.closeCustomerStageDetail}
                                                        saveCustomerStageSettingPlay={this.saveCustomerStageSettingPlay}
                                                        salesBehaviorList={this.state.salesBehaviorList}
                                                        saleProcessId={this.props.saleProcessId}
                                                    />
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                        </GeminiScrollBar>
                    </div>
                    {
                        this.state.isShowCustomerStageForm ? (
                            <CustomerStageForm
                                customerStage={this.state.currentCustomerStage}
                                isShowCustomerStageForm={this.state.isShowCustomerStageForm}
                                cancelCustomerStageForm={this.closeCustomerStageForm}
                                submitCustomerStageForm={this.submitCustomerStageForm}
                            />) : null
                    }
                </div>
            </RightPanel>
        );
    }
}

CustomerStage.propTypes = {
    saleProcessId: PropTypes.string,
    closeCustomerStagePanel: PropTypes.func,
    containerWidth: PropTypes.number,
    isShowCustomerStage: PropTypes.bool,
    saleProcesTitle: PropTypes.string,
};

export default CustomerStage;