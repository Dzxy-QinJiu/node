/**
 * Created by hzl on 2019/8/6.
 * 客户阶段
 */
require('../css/customer-stage.less');
require('../../../sales_stage/public/css/sales-stage.less');
import Trace from 'LIB_DIR/trace';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanelClose = rightPanelUtil.RightPanelClose;
import {message, Button, Popover, Icon} from 'antd';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import CustomerStageAction from '../action/customer-stage-action';
import CustomerStageStore from '../store/customer-stage-store';
import CustomerStageForm from './customer-stage-form';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import ModalDialog from 'CMP_DIR/ModalDialog';
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
        let salesProcessId = this.props.salesProcessId;
        CustomerStageAction.getCustomerStageList(salesProcessId);
    }

    componentWillUnmount() {
        CustomerStageStore.unlisten(this.onChange);
    }
    // 显示客户阶段表单
    showCustomerStageForm = (customerStage) => {
        if (this.state.isSavingCustomerStage) {
            return;
        }
        CustomerStageAction.showCustomerStageForm(customerStage);
    };

    closeCustomerStageForm = () => {
        CustomerStageAction.closeCustomerStageForm();
    };

    submitCustomerStagForm = (customerStage) => {
        if (customerStage.id) {
            let id = _.get(customerStage, 'id');
            let customerStageList = this.state.customerStageList;
            let index = _.findIndex(customerStageList, item => item.id === id);
            customerStage.index = index + 1;
            CustomerStageAction.editCustomerStage(customerStage, () => {
                CustomerStageAction.closeCustomerStageForm();
                message.success(Intl.get('crm.218', '修改成功！'));
            });
        } else {
            let length = _.get(this.state.customerStageList, 'length');
            // 更改订单阶段的顺序，从1开始，依次增加
            _.each(this.state.customerStageList, (item, index) => {
                item.index = index + 1;
            });
            let currentCustomerStageeList = _.cloneDeep(this.state.customerStageList);
            currentCustomerStageeList.push({...customerStage, index: length + 1});
            CustomerStageAction.addCustomerStage(currentCustomerStageeList, () => {
                CustomerStageAction.closeCustomerStageForm();
                message.success(Intl.get('crm.216', '添加成功！'));
            });
        }
    };

    deleteCustomerStage = (customerStage) => {
        CustomerStageAction.deleteCustomerStage(customerStage, (result) => {
            if (!result.error) {
                message.success(Intl.get('crm.138', '删除成功！'));
            } else {
                message.error(Intl.get('crm.139', '删除失败！'));
            }
        });

    };

    showCustomerStagModalDialog = (customerStage) => {
        CustomerStageAction.showCustomerStagModalDialog(customerStage);
    };

    closeCustomerStagModalDialog = (customerStage) => {
        CustomerStageAction.hideCustomerStagModalDialog(customerStage);
    };

    showCustomerStagEditOrder = () => {
        if (this.state.isSavingCustomerStag) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .sales-stage-top-div:first-child span'), '变更销售阶段顺序');
        CustomerStageAction.showCustomerStagEditOrder();
    };

    hideCustomerStagEditOrder = () => {
        if (this.state.isSavingCustomerStag) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .sales-stage-top-btn:last-child span'), '取消对销售阶段顺序更改的保存');
        CustomerStageAction.hideCustomerStagEditOrder();
    };

    customerStageOrderUp = (customerStage) => {
        CustomerStageAction.customerStageOrderUp(customerStage);
    };

    customerStageOrderDown = (customerStage) => {
        CustomerStageAction.customerStageOrderDown(customerStage);
    };

    saveCustomerStagOrder = () => {
        if (this.state.isSavingCustomerStag) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .sales-stage-top-btn:last-child span'), '保存对销售阶段的更改');
        CustomerStageAction.changeIsSavingCustomerStag();
        CustomerStageAction.saveCustomerStagOrder(this.state.customerStageList);
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        let length = _.get(this.state.customerStageList, 'length');
        let disabled = false;
        let title = '';
        if (length > 7) {
            disabled = true;
            title = Intl.get('sales.stage.toplimit', '订单阶段个数已达上限（8个）');
        }
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <PrivilegeChecker check="BGM_SALES_STAGE_ADD" className="sales-stage-top-div">
                        {title ? (
                            <Popover content={title}>
                                <Button
                                    type="ghost"
                                    className="sales-stage-top-btn btn-item"
                                    disabled={disabled}
                                >
                                    <Icon type="plus" />
                                    {Intl.get('sales.process.add.customer.stage', '添加客户阶段')}
                                </Button>
                            </Popover>
                        ) : (
                            <Button
                                type="ghost" className="sales-stage-top-btn btn-item"
                                onClick={this.showCustomerStageForm.bind(this, 'addCustomerStage')}
                                data-tracename="添加订单阶段"
                            >
                                <Icon type="plus" />
                                {Intl.get('sales.process.add.customer.stage', '添加客户阶段')}
                            </Button>
                        )}
                    </PrivilegeChecker>
                </div>
                <div className='pull-right'>
                    {
                        this.state.customerStageEditOrder ?
                            (<div className="sales-stage-top-div-group">
                                <div className="sales-stage-top-div">
                                    <Button
                                        type="ghost"
                                        className="sales-stage-top-btn btn-item"
                                        onClick={this.hideCustomerStagEditOrder.bind(this)}
                                    >
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                    </Button>
                                </div>
                                <div className="sales-stage-top-div">
                                    <Button
                                        type="ghost"
                                        className="sales-stage-top-btn btn-item"
                                        onClick={this.saveCustomerStagOrder.bind(this)}
                                    >
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                    </Button>
                                </div>
                            </div>) : (
                                <PrivilegeChecker
                                    check="BGM_SALES_STAGE_SORT"
                                >
                                    <Button
                                        type="ghost"
                                        className="sales-stage-top-btn btn-item btn-m-r-2"
                                        onClick={this.showCustomerStagEditOrder.bind(this)}
                                    >
                                        <i className='iconfont icon-transfer'></i>
                                        {Intl.get('sales.stage.change.sort', '变更顺序')}
                                    </Button>
                                </PrivilegeChecker>
                            )
                    }
                    <RightPanelClose onClick={this.props.closeCustomerStagePanel}/>
                </div>
            </div>
        );
    };

    retryGetOrderList = () => {
        CustomerStageAction.getCustomerStagList();
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
        let errMsg = this.state.getCustomerStagListErrMsg;
        if (errMsg) {
            noDataTips = this.renderMsgTips(errMsg);
        }
        return (
            <NoDataIntro noDataTip={noDataTips}/>
        );
    };

    // 渲染客户阶段信息
    renderCustomerStagInfo = (customerStage) => {
        let containerWidth = this.props.containerWidth;
        const modalContent = Intl.get('sales.stage.delete.sales.stage', '确定删除这个销售阶段麽') + '?';
        return (
            <div
                className="sales-stage-timeline-item-content modal-container"
                style={{width: containerWidth}}
                data-tracename="客户阶段列表"
            >
                <div
                    className="sales-stage-content"
                    style={{width: containerWidth - 100}}
                >
                    <div className="sales-stage-content-name">{customerStage.name}</div>
                    <div className="sales-stage-content-describe">{customerStage.description}</div>
                </div>
                {
                    this.state.customerStageEditOrder ?
                        (
                            <div className="sales-stage-btn-div order-arrow">
                                <Button
                                    className="sales-stage-btn-class up-arrow"
                                    onClick={this.customerStageOrderUp.bind(this, customerStage)}
                                    data-tracename="上移客户阶段"
                                >
                                </Button>
                                <Button
                                    className="sales-stage-btn-class down-arrow"
                                    onClick={this.customerStageOrderDown.bind(this, customerStage)}
                                    data-tracename="下移客户阶段"
                                >
                                </Button>
                            </div>
                        ) :
                        (
                            <div className="sales-stage-btn-div operation-btn">
                                <PrivilegeChecker check="BGM_SALES_STAGE_DELETE">
                                    <Button
                                        className="sales-stage-btn-class icon-delete iconfont"
                                        onClick={this.showCustomerStagModalDialog.bind(this, customerStage)}
                                        data-tracename="删除客户阶段"
                                    >
                                    </Button>
                                </PrivilegeChecker>
                                <PrivilegeChecker check="BGM_SALES_STAGE__EDIT">
                                    <Button
                                        className="sales-stage-btn-class icon-update iconfont"
                                        onClick={this.showCustomerStagForm.bind(this, customerStage)}
                                        data-tracename="编辑客户阶段"
                                    >
                                    </Button>
                                </PrivilegeChecker>
                            </div>
                        )
                }

                <ModalDialog
                    modalContent={modalContent}
                    modalShow={customerStage.modalDialogFlag}
                    container={this}
                    hideModalDialog={this.hideSalesStageModalDialog.bind(this, customerStage)}
                    delete={this.deleteCustomerStage.bind(this, customerStage)}
                />
            </div>
        );
    };

    render() {
        let customerStageList = this.state.customerStageList;
        let length = _.get(customerStageList, 'length');
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        return (
            <div
                className="customer-stage-container"
                data-tracename="客户阶段管理"
                style={{height: height}}
            >
                <div className="order-stage-content" style={{height: height}}>
                    <div className="order-stage-top-nav">
                        {this.renderTopNavOperation()}
                    </div>
                    {this.state.isShowCustomerStagePanel ? (
                        <CustomerStageForm
                            customerStage={this.state.currentCustomerStage}
                            isShowCustomerStagePanel={this.state.isShowCustomerStagePanel}
                            cancelCustomerStagForm={this.closeCustomerStageForm}
                            submitCustomerStagForm={this.submitCustomerStagForm}
                        />) : null}
                    <GeminiScrollBar style={{height: containerHeight}}>
                        {
                            this.state.loading ? (
                                <Spinner/>
                            ) : null
                        }
                        {
                            !this.state.loading && (length === 0 || this.state.getCustomerStagListErrMsg) ?
                                this.renderNoDataTipsOrErrMsg() : null
                        }
                        <div className="sales-stage-table-block">
                            {this.state.isSavingCustomerStagHome ? (<div className="sales-stage-block">
                                <Spinner className="sales-stage-saving"/>
                            </div>) : null}
                            <ul className="sales-stage-timeline">
                                {
                                    customerStageList.map( (customerStage, key) => {
                                        return (
                                            <li className="sales-stage-timeline-item" key={key}>
                                                <div className="sales-stage-timeline-item-tail"></div>
                                                <div className="sales-stage-timeline-item-head">
                                                    <i className='iconfont icon-order-arrow-down'></i>
                                                </div>
                                                <div className="sales-stage-timeline-item-right"></div>
                                                <div>{this.renderCustomerStagInfo.bind(this, customerStage)}</div>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </GeminiScrollBar>
                </div>
            </div>
        );
    }
}

CustomerStage.propTypes = {
    salesProcessId: PropTypes.string,
    closeCustomerStagePanel: PropTypes.func,
    containerWidth: PropTypes.number
};

export default CustomerStage;