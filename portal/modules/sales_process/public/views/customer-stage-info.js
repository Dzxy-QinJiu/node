/**
 * Created by hzl on 2019/8/8.
 */
import { Button } from 'antd';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import ModalDialog from 'CMP_DIR/ModalDialog';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';

class CustomerStageInfo extends React.Component {

    constructor(props) {
        super(props);
    }
    
    // 确定删除客户阶段
    deleteCustomerStage = (customerStage) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-dialog .modal-footer'), '确定删除某销售阶段');
        this.props.deleteCustomerStage(customerStage);
    };

    // 显示客户阶段表单
    showCustomerStageForm = (customerStage) => {
        this.props.showCustomerStageForm(customerStage);
    };

    //  显示客户阶段模态框
    showCustomerStageModalDialog = (customerStage) => {
        this.props.showCustomerStageModalDialog(customerStage);
    };

    // 关闭客户阶段模态
    closeCustomerStageModalDialog = (customerStage) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-dialog .modal-footer'), '关闭删除销售阶段模态框');
        this.props.closeCustomerStageModalDialog(customerStage);
    };

    // 上移客户阶段
    customerStageOrderUp = (customerStage) => {
        this.props.customerStageOrderUp(customerStage);
    };

    // 下移客户阶段
    customerStageOrderDown = (customerStage) => {
        this.props.customerStageOrderDown(customerStage);
    };

    // 展开收起客户阶段详情（剧本、销售行为）
    toggleCustomerStageDetail = (customerStage) => {
        this.props.toggleCustomerStageDetail(customerStage);
    };

    // 显示客户阶段详情
    showCustomerStageDetail = (customerStage) => {
        this.props.showCustomerStageDetail(customerStage);
    };

    render() {
        const modalContent = Intl.get('sales.process.delete.customer.stage.tips', '确定删除这个客户阶段么') + '?';
        const customerStageContainerWidth = this.props.width;
        let customerStage = this.props.customerStage;
        let saleActivity = _.get(customerStage, 'sales_activities');
        let activity = saleActivity && saleActivity.length ? _.map(saleActivity, 'name') : [];
        let isShowMore = customerStage.isShowMore;
        let twoLineClass = classNames('iconfont', {
            'icon-down-twoline': !isShowMore,
            'icon-up-twoline': isShowMore
        });
        let twoLineTitle = isShowMore ? Intl.get('crm.basic.detail.hide', '收起详情') :
            Intl.get('crm.basic.detail.show', '展开详情');
        return (
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
                        <span>{customerStage.name}</span>
                        <span
                            className={twoLineClass}
                            title={twoLineTitle}
                            onClick={this.toggleCustomerStageDetail.bind(this, customerStage)}
                        />
                    </div>
                    <div className="customer-stage-content-describe">{customerStage.description}</div>
                    {
                        isShowMore ? (
                            <div className="customer-stage-content-more">
                                <div className="customer-stage-content-paly">
                                    <span>{Intl.get('sales.process.customer.stage.play', '剧本')}:</span>
                                    <span>{customerStage.play_books}</span>
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
                    this.props.isShowCustomerStageTransferOrder ?
                        (
                            <div className="customer-stage-btn-div order-arrow">
                                <Button
                                    className="customer-stage-btn-class up-arrow"
                                    onClick={this.customerStageOrderUp.bind(this, customerStage)}
                                    data-tracename="上移客户阶段"
                                >
                                </Button>
                                <Button
                                    className="customer-stage-btn-class down-arrow"
                                    onClick={this.customerStageOrderDown.bind(this, customerStage)}
                                    data-tracename="下移客户阶段"
                                >
                                </Button>
                            </div>
                        ) :
                        (
                            <div className="customer-stage-btn-div operation-btn">
                                <PrivilegeChecker check="CRM_DELETE_CUSTOMER_STAGE">
                                    <Button
                                        className="customer-stage-btn-class icon-delete iconfont"
                                        onClick={this.showCustomerStageModalDialog.bind(this, customerStage)}
                                        data-tracename="删除客户阶段"
                                    >
                                    </Button>
                                </PrivilegeChecker>
                                <PrivilegeChecker check="CRM_UPDATE_CUSTOMER_SALES">
                                    <Button
                                        className="customer-stage-btn-class icon-update iconfont"
                                        onClick={this.showCustomerStageForm.bind(this, customerStage)}
                                        data-tracename="编辑客户阶段"
                                    >
                                    </Button>
                                </PrivilegeChecker>
                                <PrivilegeChecker check="CRM_UPDATE_CUSTOMER_SALES">
                                    <Button
                                        className="customer-stage-btn-class icon-role-auth-config iconfont"
                                        onClick={this.showCustomerStageDetail.bind(this, customerStage)}
                                        data-tracename="设置客户阶段"
                                    >
                                    </Button>
                                </PrivilegeChecker>
                            </div>
                        )
                }
                <ModalDialog
                    modalContent={modalContent}
                    modalShow={customerStage.isShowDeleteModalDialog}
                    hideModalDialog={this.closeCustomerStageModalDialog.bind(this, customerStage)}
                    delete={this.deleteCustomerStage.bind(this, customerStage)}
                    container={this}
                />
            </div>
        );
    }
}

CustomerStageInfo.propTypes = {
    toggleCustomerStageDetail: PropTypes.func,
    deleteCustomerStage: PropTypes.func,
    showCustomerStageForm: PropTypes.func,
    closeCustomerStageModalDialog: PropTypes.func,
    showCustomerStageModalDialog: PropTypes.func,
    customerStageOrderUp: PropTypes.func,
    customerStageOrderDown: PropTypes.func,
    showCustomerStageDetail: PropTypes.func,
    width: PropTypes.number,
    customerStage: PropTypes.object,
    isShowCustomerStageTransferOrder: PropTypes.bool,
};

export default CustomerStageInfo;