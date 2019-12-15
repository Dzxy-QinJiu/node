/**
 * Created by hzl on 2019/8/8.
 */
import { Button } from 'antd';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import ModalDialog from 'CMP_DIR/ModalDialog';
import Trace from 'LIB_DIR/trace';
import customerStagePrivilege from '../privilege-const';
const OPERATE_ZONE_WIDTH = 100; // 按钮操作区的宽度

class CustomerStageInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerStage: this.props.customerStage
        };
    }
    
    // 确定删除客户阶段
    deleteCustomerStage = (customerStage) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-dialog .modal-footer'), '确定删除某销售阶段');
        this.props.deleteCustomerStage(customerStage);
    };

    // 显示客户阶段表单
    showCustomerStageForm = (customerStage) => {
        if (this.props.saleProcessType === 'default') {
            return;
        }
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

    // 关闭客户阶段详情
    closeCustomerStageDetail = (customerStage) => {
        this.props.closeCustomerStageDetail(customerStage);
    };

    render() {
        const modalContent = Intl.get('sales.process.delete.customer.stage.tips', '确定删除这个客户阶段么') + '?';
        const customerStageContainerWidth = this.props.width;
        let customerStage = this.props.customerStage;
        let name = customerStage.name; // 阶段名称
        // TODO 客户阶段的剧本、销售行为、自动变更暂不展示
        // let saleActivity = _.get(customerStage, 'sales_activities');
        // let activity = saleActivity && saleActivity.length ? _.map(saleActivity, 'name') : [];
        // let isShowMore = customerStage.isShowMore;
        // let twoLineClass = classNames('iconfont', {
        //     'icon-down-twoline': !isShowMore,
        //     'icon-up-twoline': isShowMore
        // });
        // let twoLineTitle = isShowMore ? Intl.get('crm.basic.detail.hide', '收起详情') :
        //     Intl.get('crm.basic.detail.show', '展开详情');
        // let playBooks = customerStage.play_books; // 剧本

        return (
            <div
                className="customer-stage-timeline-item-content modal-container"
                style={{width: customerStageContainerWidth}}
                data-tracename="客户阶段列表"
            >
                <div
                    className="customer-stage-content"
                    style={{width: customerStageContainerWidth - OPERATE_ZONE_WIDTH}}
                    onClick={this.showCustomerStageForm.bind(this, customerStage)}
                    title={this.props.saleProcessType === 'default' ? '' : Intl.get('customer.stage.edit.stage', '编辑{stage}阶段', {stage: name})}
                >
                    <div className="customer-stage-content-name">
                        <span>{name}</span>
                        {/**TODO 暂时隐藏,只显示客户阶段的名称和描述*/}
                        {/*<span*/}
                        {/*className={twoLineClass}*/}
                        {/*title={twoLineTitle}*/}
                        {/*onClick={this.toggleCustomerStageDetail.bind(this, customerStage)}*/}
                        {/*/>*/}
                    </div>
                    <div className="customer-stage-content-describe">{customerStage.description}</div>
                    {/*{*/}
                    {/*// TODO 隐藏剧本和销售行为*/}
                    {/*isShowMore ? (*/}
                    {/*<div className="customer-stage-content-more">*/}
                    {/*<div className="customer-stage-content-paly">*/}
                    {/*<span>{Intl.get('sales.process.customer.stage.play', '剧本')}:</span>*/}
                    {/*{*/}
                    {/*_.isArray(playBooks) && playBooks.length ? (*/}
                    {/*<ul className="customer-stage-playbooks">*/}
                    {/*{*/}
                    {/*_.map(playBooks, (item, idx) => {*/}
                    {/*return (*/}
                    {/*<li className="play-item" key={idx}>*/}
                    {/*{item}*/}
                    {/*</li>*/}
                    {/*);*/}
                    {/*})*/}
                    {/*}*/}
                    {/*</ul>*/}
                    {/*) : null*/}
                    {/*}*/}
                    {/*</div>*/}
                    {/*<div className="customer-stage-content-activity">*/}
                    {/*<span>{Intl.get('sales.process.customer.stage.activity', '销售行为')}:</span>*/}
                    {/*<span>{activity.join(',')}</span>*/}
                    {/*</div>*/}
                    {/*</div>*/}
                    {/*) : null*/}
                    {/*}*/}
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
                            this.props.saleProcessType === 'custom' ? (
                                <div className="customer-stage-btn-div operation-btn">
                                    <PrivilegeChecker check={customerStagePrivilege.DELETE_SPECIFIC_STAGE}>
                                        <Button
                                            className="customer-stage-btn-class icon-delete iconfont handle-btn-item"
                                            onClick={this.showCustomerStageModalDialog.bind(this, customerStage)}
                                            data-tracename="删除客户阶段"
                                        >
                                        </Button>
                                    </PrivilegeChecker>
                                    <PrivilegeChecker check={customerStagePrivilege.UPDATE_SPECIFIC_STAGE}>
                                        <Button
                                            className="customer-stage-btn-class icon-update iconfont"
                                            onClick={this.showCustomerStageForm.bind(this, customerStage)}
                                            data-tracename="编辑客户阶段"
                                        >
                                        </Button>
                                    </PrivilegeChecker>
                                    {
                                        /*** 先注释到客户阶段的设置功能
                                         * <PrivilegeChecker check={customerStagePrivilege.UPDATE_SPECIFIC_STAGE}>
                                         <Button
                                         className="customer-stage-btn-class icon-role-auth-config iconfont"
                                         onClick={this.showCustomerStageDetail.bind(this, customerStage)}
                                         data-tracename="设置客户阶段"
                                         >
                                         </Button>
                                         </PrivilegeChecker>
                                         * */
                                    }

                                </div>
                            ) : null
                        )
                }
                {/*{*/}
                {/*// TODO 客户阶段的剧本、销售行为、自动变更*/}
                {/*customerStage.isShowCustomerStageDetailPanel ? (*/}
                {/*<CustomerStageDetail*/}
                {/*closeCustomerStageDetail={this.closeCustomerStageDetail.bind(this, customerStage)}*/}
                {/*customerStage={customerStage}*/}
                {/*saveCustomerStageSettingPlay={this.props.saveCustomerStageSettingPlay}*/}
                {/*salesBehaviorList={this.props.salesBehaviorList}*/}
                {/*saleProcessId={this.props.saleProcessId}*/}
                {/*autoConditionsList={this.props.autoConditionsList}*/}
                {/*/>*/}
                {/*) : null*/}
                {/*}*/}
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
    closeCustomerStageDetail: PropTypes.func,
    saveCustomerStageSettingPlay: PropTypes.func,
    salesBehaviorList: PropTypes.array,
    saleProcessId: PropTypes.string,
    autoConditionsList: PropTypes.array,
    saleProcessType: PropTypes.string,
};

export default CustomerStageInfo;