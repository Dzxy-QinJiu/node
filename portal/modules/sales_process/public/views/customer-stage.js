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
import CustomerStageForm from './customer-stage-form';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import ModalDialog from 'CMP_DIR/ModalDialog';
import classNames from 'classnames';

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

    // 显示客户阶段详情
    showCustomerStageDetail() {

    }

    // 显示客户阶段表单
    showCustomerStageForm = (customerStage) => {
        if (this.state.isSavingCustomerStage) {
            return;
        }
        CustomerStageAction.showCustomerStageForm(customerStage);
    };

    // 关闭客户阶段表单
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
            // 更改客户阶段的顺序，从1开始，依次增加
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

    // 显示客户阶段模态框
    showCustomerStageModalDialog = () => {
        CustomerStageAction.showCustomerStageModalDialog();
    };

    // 关闭客户阶段模态
    closeCustomerStageModalDialog = () => {
        CustomerStageAction.closeCustomerStageModalDialog();
    };

    // 删除客户阶段
    deleteCustomerStage = (customerStage) => {
        CustomerStageAction.deleteCustomerStage(customerStage, (result) => {
            this.closeCustomerStageModalDialog();
            if (!result.error) {
                message.success(Intl.get('crm.138', '删除成功！'));
            } else {
                message.error(Intl.get('crm.139', '删除失败！'));
            }
        });

    };

    // 显示客户阶段变更顺序
    showCustomerStageTransferOrder = () => {
        if (this.state.isSavingCustomerStag) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-div:first-child span'), '变更销售阶段顺序');
        CustomerStageAction.showCustomerStageTransferOrder();
    };

    // 关闭客户阶段变更顺序
    closeCustomerStageTransferOrder = () => {
        if (this.state.isSavingCustomerStag) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-btn:last-child span'), '取消对销售阶段顺序更改的保存');
        CustomerStageAction.closeCustomerStageTransferOrder();
    };

    // 上移客户阶段
    customerStageOrderUp = (customerStage) => {
        CustomerStageAction.customerStageOrderUp(customerStage);
    };

    // 下移客户阶段
    customerStageOrderDown = (customerStage) => {
        CustomerStageAction.customerStageOrderDown(customerStage);
    };

    saveCustomerStagOrder = () => {
        if (this.state.isSavingCustomerStag) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-btn:last-child span'), '保存对销售阶段的更改');
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
            title = Intl.get('sales.process.customer.stage.toplimit', '客户阶段个数已达上限（8个）');
        }
        // TODO 需要更改 添加客户阶段权限 CRM_ADD_CUSTOMER_SALES 变更客户阶段权限CRM_UPDATE_CUSTOMER_SALES
        return (
            <div className='condition-operator'>
                <PrivilegeChecker check="BGM_SALES_STAGE_ADD" className="add-customer-stage-btn">
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
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                    </Button>
                                </div>
                                <div className="customer-stage-top-div">
                                    <Button
                                        type="ghost"
                                        className="customer-stage-top-btn btn-item"
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
        );
    };

    retryGetOrderList = () => {
        let salesProcessId = this.props.salesProcessId;
        CustomerStageAction.getCustomerStageList(salesProcessId);
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

    render() {
        let customerStageList = this.state.customerStageList;
        let length = _.get(customerStageList, 'length');
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        const modalContent = Intl.get('sales.process.delete.customer.stage.tips', '确定删除这个客户阶段么') + '?';
        let customerStageContainerWidth = this.props.containerWidth - 100;

        return (
            <RightPanel
                showFlag={this.props.isShowCustomerStage}
                className="customer-stage-panel"
                data-tracename="客户阶段管理"
                style={{height: height, width: this.props.containerWidth}}
            >
                <RightPanelClose onClick={this.props.closeCustomerStagePanel}/>
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
                                /**
                                 * !this.state.loading && (length === 0 || this.state.getCustomerStageListErrMsg) ?
                                 this.renderNoDataTipsOrErrMsg() : null
                                 * */
                            }
                            <div className="customer-stage-table-block">
                                {
                                    this.state.isSavingCustomerStageHome ? (
                                        <div className="customer-stage-block">
                                            <Spinner className="customer-stage-saving"/>
                                        </div>) : null
                                }
                                <ul className="customer-stage-timeline">
                                    {
                                        _.map(customerStageList, (item, idx) => {
                                            let saleActivity = _.get(item, 'sales_activities');
                                            let activity = saleActivity.length ? _.map(saleActivity, 'name') : [];
                                            let twoLineClass = classNames('iconfont', {
                                                'icon-down-twoline': !item.isShowMore,
                                                'icon-up-twoline': item.isShowMore
                                            });
                                            let twoLineTitle = item.isShowMore ? Intl.get('crm.basic.detail.hide', '收起详情') :
                                                Intl.get('crm.basic.detail.show', '展开详情');
                                            return (
                                                <li className="customer-stage-timeline-item" key={idx}>
                                                    <div className="customer-stage-timeline-item-tail"></div>
                                                    <div className="customer-stage-timeline-item-head">
                                                        <i className='iconfont icon-order-arrow-down'></i>
                                                    </div>
                                                    <div className="customer-stage-timeline-item-right"></div>
                                                    <div
                                                        className="customer-stage-timeline-item-content modal-container"
                                                        style={{width: customerStageContainerWidth}}
                                                        data-tracename="客户阶段列表"
                                                    >
                                                        <div
                                                            className="customer-stage-content"
                                                            style={{width: customerStageContainerWidth - 160}}
                                                        >
                                                            <div className="customer-stage-content-name">
                                                                <span>{item.name}</span>
                                                                <span
                                                                    className={twoLineClass}
                                                                    title={twoLineTitle}
                                                                    onClick={this.toggleCustomerStageDetail.bind(this, item)}
                                                                />
                                                            </div>
                                                            <div className="customer-stage-content-describe">{item.description}</div>
                                                            {
                                                                item.isShowMore ? (
                                                                    <div className="customer-stage-content-more">
                                                                        <div className="customer-stage-content-paly">
                                                                            <span>{Intl.get('sales.process.customer.stage.play', '剧本')}:</span>
                                                                            <span>{item.play_books}</span>
                                                                        </div>
                                                                        <div className="customer-stage-content-activity">
                                                                            <span>{Intl.get('sales.process.customer.stage.activity', '销售行为')}:</span>
                                                                            <span>{activity.join('、')}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : null
                                                            }
                                                        </div>
                                                        {
                                                            this.state.isShowCustomerStageTransferOrder ?
                                                                (
                                                                    <div className="customer-stage-btn-div order-arrow">
                                                                        <Button
                                                                            className="customer-stage-btn-class up-arrow"
                                                                            onClick={this.customerStageOrderUp}
                                                                            data-tracename="上移客户阶段"
                                                                        >
                                                                        </Button>
                                                                        <Button
                                                                            className="customer-stage-btn-class down-arrow"
                                                                            onClick={this.customerStageOrderDown}
                                                                            data-tracename="下移客户阶段"
                                                                        >
                                                                        </Button>
                                                                    </div>
                                                                ) :
                                                                (
                                                                    <div className="customer-stage-btn-div operation-btn">
                                                                        <PrivilegeChecker check="BGM_SALES_STAGE_DELETE">
                                                                            <Button
                                                                                className="customer-stage-btn-class icon-delete iconfont"
                                                                                onClick={this.showCustomerStageModalDialog}
                                                                                data-tracename="删除客户阶段"
                                                                            >
                                                                            </Button>
                                                                        </PrivilegeChecker>
                                                                        <PrivilegeChecker check="BGM_SALES_STAGE__EDIT">
                                                                            <Button
                                                                                className="customer-stage-btn-class icon-update iconfont"
                                                                                onClick={this.showCustomerStageForm.bind(this, item)}
                                                                                data-tracename="编辑客户阶段"
                                                                            >
                                                                            </Button>
                                                                        </PrivilegeChecker>
                                                                        <PrivilegeChecker check="BGM_SALES_STAGE__EDIT">
                                                                            <Button
                                                                                className="customer-stage-btn-class icon-role-auth-config iconfont"
                                                                                onClick={this.showCustomerStageDetail.bind(this, item)}
                                                                                data-tracename="设置客户阶段"
                                                                            >
                                                                            </Button>
                                                                        </PrivilegeChecker>
                                                                    </div>
                                                                )
                                                        }
                                                        <ModalDialog
                                                            modalContent={modalContent}
                                                            modalShow={this.state.isShowDeleteModalDialog}
                                                            hideModalDialog={this.closeCustomerStageModalDialog}
                                                            delete={this.deleteCustomerStage.bind(this, item)}
                                                            container={this}
                                                        />
                                                    </div>
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
                                cancelCustomerStagForm={this.closeCustomerStageForm}
                                submitCustomerStagForm={this.submitCustomerStagForm}
                            />) : null
                    }
                </div>
            </RightPanel>
        );
    }
}

CustomerStage.propTypes = {
    salesProcessId: PropTypes.string,
    closeCustomerStagePanel: PropTypes.func,
    containerWidth: PropTypes.number,
    isShowCustomerStage: PropTypes.bool,
};

export default CustomerStage;