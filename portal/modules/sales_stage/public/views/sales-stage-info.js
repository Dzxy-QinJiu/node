/**
 * Created by xiaojinfeng on  2015/12/25 11:04 .
 */
var React = require('react');
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var Button = require('antd').Button;
var ModalDialog = require('../../../../components/ModalDialog');
import sales_stage_privilegeConst from '../privilege-const';
import Trace from 'LIB_DIR/trace';
function noop() {
}

class SalesStageInfo extends React.Component {
    static defaultProps = {
        hideSalesStageModalDialog: noop,
        editSalesStage: noop,
        deleteSalesStage: noop
    };

    deleteSalesStage = (salesStage) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-dialog .modal-footer'), '确定删除某销售阶段');
        this.props.deleteSalesStage(salesStage);
    };

    showSalesStageForm = (salesStage) => {
        this.props.showSalesStageForm(salesStage);
    };

    hideSalesStageModalDialog = (salesStage) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-dialog .modal-footer'), '关闭删除销售阶段模态框');
        this.props.hideSalesStageModalDialog(salesStage);
    };

    showSalesStageModalDialog = (salesStage) => {
        this.props.showSalesStageModalDialog(salesStage);
    };

    salesStageOrderUp = (salesStage) => {
        this.props.salesStageOrderUp(salesStage);
    };

    salesStageOrderDown = (salesStage) => {
        this.props.salesStageOrderDown(salesStage);
    };

    render() {
        var _this = this;
        var salesStage = this.props.salesStage;
        var width = this.props.width;
        var modalContent = Intl.get('sales.stage.delete.sales.stage', '确定删除这个销售阶段麽') + '?';
        return (
            <div className="sales-stage-timeline-item-content modal-container" style={{width: width}}
                data-tracename="销售阶段列表">
                <div className="sales-stage-content" style={{width: width - 100}}>
                    <div className="sales-stage-content-name">{salesStage.name}</div>
                    <div
                        className="sales-stage-content-describe">{salesStage.description}</div>
                </div>
                {
                    this.props.salesStageEditOrder ?
                        (<div className="sales-stage-btn-div order-arrow">
                            <Button className="sales-stage-btn-class up-arrow"
                                onClick={_this.salesStageOrderUp.bind(this, salesStage)}
                                data-tracename="上移销售阶段"
                            >
                            </Button>
                            <Button
                                className="sales-stage-btn-class down-arrow"
                                onClick={_this.salesStageOrderDown.bind(this, salesStage)}
                                data-tracename="下移销售阶段"
                            >
                            </Button>
                        </div>) :
                        (<div className="sales-stage-btn-div operation-btn">
                            <PrivilegeChecker check={sales_stage_privilegeConst.BGM_SALES_STAGE_DELETE}>
                                <Button className="sales-stage-btn-class icon-delete iconfont handle-btn-item"
                                    onClick={_this.showSalesStageModalDialog.bind(this, salesStage)}
                                    data-tracename="删除销售阶段"
                                >
                                </Button>
                            </PrivilegeChecker>
                            <PrivilegeChecker check={sales_stage_privilegeConst.BGM_SALES_STAGE__EDIT}>
                                <Button
                                    className="sales-stage-btn-class icon-update iconfont"
                                    onClick={_this.showSalesStageForm.bind(this, salesStage)}
                                    data-tracename="编辑销售阶段"
                                >
                                </Button>
                            </PrivilegeChecker>
                        </div>)
                }

                <ModalDialog modalContent={modalContent}
                    modalShow={salesStage.modalDialogFlag}
                    container={_this}
                    hideModalDialog={_this.hideSalesStageModalDialog.bind(_this, salesStage)}
                    delete={_this.deleteSalesStage.bind(_this, salesStage)}
                />
            </div>
        );
    }
}

SalesStageInfo.propTypes = {
    deleteSalesStage: PropTypes.func,
    showSalesStageForm: PropTypes.func,
    hideSalesStageModalDialog: PropTypes.func,
    showSalesStageModalDialog: PropTypes.func,
    salesStageOrderUp: PropTypes.func,
    salesStageOrderDown: PropTypes.func,
    width: PropTypes.number,
    salesStage: PropTypes.object,
    salesStageEditOrder: PropTypes.bool
};

module.exports = SalesStageInfo;
