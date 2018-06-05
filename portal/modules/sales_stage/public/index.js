/**
 * Created by xiaojinfeng on  2015/12/22 16:59 .
 */
require('./css/sales-stage.less');
var Button = require('antd').Button;
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var TopNav = require('../../../components/top-nav');
var topHeight = 87; // 22 + 65 : 添加按钮高度+顶部导航高度
var leftWidth = 281; // 75+45+117+44 左侧导航宽度+右侧内容左边距+右侧右侧边距+销售阶段内容左侧边距

var SalesStageStore = require('./store/sales-stage-store');
var SalesStageAction = require('./action/sales-stage-actions');
var SalesStageForm = require('./views/sales-stage-form');
var SalesStageInfo = require('./views/sales-stage-info');
var Spinner = require('../../../components/spinner');
import Trace from 'LIB_DIR/trace';
function getStateFromStore(_this) {
    return {
        salesStageList: SalesStageStore.getSalesStageListData(),
        currentSalesStage: SalesStageStore.getCurrentSalesStageData(),
        currentSalesStageListData: SalesStageStore.getCurrentSalesStageListData(),
        isFormShow: SalesStageStore.isFormShowFnc(),
        isEditOrder: SalesStageStore.isEditOrderFnc(),
        isSavingSalesStage: SalesStageStore.getIsSavingSalesStage(),
        salesStageWidth: _this.salesStageWidthFnc()
    };
}

var SalesStagePage = React.createClass({
    getInitialState: function() {
        return getStateFromStore(this);
    },

    onChange: function() {
        var datas = getStateFromStore(this);
        this.setState(datas);
    },

    componentDidMount: function() {
        $(window).on('resize', this.resizeWindow);
        SalesStageStore.listen(this.onChange);
        SalesStageAction.getSalesStageList();
    },

    componentWillUnmount: function() {
        $(window).off('resize', this.resizeWindow);
        SalesStageStore.unlisten(this.onChange);
    },

    salesStageWidthFnc: function() {
        return $(window).width() - leftWidth;
    },

    resizeWindow: function() {
        this.setState({
            salesStageWidth: this.salesStageWidthFnc()
        });
    },

    events: {

        showSalesStageForm: function(salesStage) {
            if (this.state.isSavingSalesStage) {
                return;
            }
            SalesStageAction.showSalesStageForm(salesStage);
        },

        hideSalesStageeForm: function() {
            SalesStageAction.hideSalesStageeForm();
        },

        submitSalesStageForm: function(salesStage) {
            if (salesStage.id) {
                SalesStageAction.editSalesStage(salesStage);
            } else {
                SalesStageAction.addSalesStage(salesStage);
            }
        },

        deleteSalesStage: function(salesStage) {
            SalesStageAction.changeIsSavingSalesStage();
            SalesStageAction.deleteSalesStage(salesStage);
        },

        showSalesStageModalDialog: function(salesStage) {
            SalesStageAction.showSalesStageModalDialog(salesStage);
        },

        hideSalesStageModalDialog: function(salesStage) {
            SalesStageAction.hideSalesStageModalDialog(salesStage);
        },

        showSalesStageEditOrder: function() {
            if (this.state.isSavingSalesStage) {
                return;
            }
            Trace.traceEvent($(this.getDOMNode()).find('.topNav .sales-stage-top-div:first-child span'),'变更销售阶段顺序');
            SalesStageAction.showSalesStageEditOrder();
        },

        hideSalesStageEditOrder: function() {
            if (this.state.isSavingSalesStage) {
                return;
            }
            Trace.traceEvent($(this.getDOMNode()).find('.topNav .sales-stage-top-btn:last-child span'),'取消对销售阶段顺序更改的保存');
            SalesStageAction.hideSalesStageEditOrder();
        },

        salesStageOrderUp: function(salesStage) {
            SalesStageAction.salesStageOrderUp(salesStage);
        },

        salesStageOrderDown: function(salesStage) {
            SalesStageAction.salesStageOrderDown(salesStage);
        },

        saveSalesStageOrder: function() {
            if (this.state.isSavingSalesStage) {
                return;
            }
            Trace.traceEvent($(this.getDOMNode()).find('.topNav .sales-stage-top-btn:last-child span'),'保存对销售阶段的更改');
            SalesStageAction.changeIsSavingSalesStage();
            SalesStageAction.saveSalesStageOrder(this.state.salesStageList);
        }
    },

    render: function() {
        var _this = this;
        var width = this.state.salesStageWidth;
        var salesStageList = this.state.salesStageList;
        return (
            <div className="sales-stage-manage-container" data-tracename="销售阶段管理">
                <TopNav>
                    <TopNav.MenuList/>
                    {
                        this.state.isEditOrder ?
                            (<div className="sales-stage-top-div-group">
                                <div className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn"
                                        onClick={_this.events.hideSalesStageEditOrder.bind(this)}
                                    ><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></Button>
                                </div>
                                <div className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn"
                                        onClick={_this.events.saveSalesStageOrder.bind(this)}
                                    ><ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" /></Button>
                                </div>
                            </div>) :
                            (<div className="sales-stage-top-div-group">
                                <PrivilegeChecker check="BGM_SALES_STAGE_SORT" className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn"
                                        onClick={_this.events.showSalesStageEditOrder.bind(this)}

                                    ><ReactIntl.FormattedMessage id="sales.stage.change.sort" defaultMessage="变更顺序" /></Button>
                                </PrivilegeChecker>
                                <PrivilegeChecker check="BGM_SALES_STAGE_ADD" className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn"
                                        onClick={_this.events.showSalesStageForm.bind(this, 'addSalesStage')}
                                        data-tracename="添加销售阶段"
                                    ><ReactIntl.FormattedMessage id="sales.stage.add.sales.stage" defaultMessage="添加销售阶段" /></Button>
                                </PrivilegeChecker>
                            </div>)
                    }

                </TopNav>

                <SalesStageForm
                    salesStage={this.state.currentSalesStage}
                    salesStageFormShow={this.state.isFormShow}
                    cancelSalesStageForm={this.events.hideSalesStageeForm}
                    submitSalesStageForm={this.events.submitSalesStageForm}
                >
                </SalesStageForm>

                <div className="sales-stage-table-block">
                    {this.state.isSavingSalesStage ? (<div className="sales-stage-block">
                        <Spinner className="sales-stage-saving"/>
                    </div>) : null}
                    <ul className="sales-stage-timeline">
                        {
                            salesStageList.map(function(salesStage, key) {
                                return (
                                    <li className="sales-stage-timeline-item" key={key}>
                                        <div className="sales-stage-timeline-item-tail"></div>
                                        <div className="sales-stage-timeline-item-head">{salesStage.index}</div>
                                        <SalesStageInfo
                                            salesStage={salesStage}
                                            width={width}
                                            showSalesStageModalDialog={_this.events.showSalesStageModalDialog}
                                            hideSalesStageModalDialog={_this.events.hideSalesStageModalDialog}
                                            deleteSalesStage={_this.events.deleteSalesStage}
                                            showSalesStageForm={_this.events.showSalesStageForm.bind(_this)}
                                            salesStageOrderUp={_this.events.salesStageOrderUp}
                                            salesStageOrderDown={_this.events.salesStageOrderDown}
                                            isEditOrder={_this.state.isEditOrder}
                                        >
                                        </SalesStageInfo>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }
});

module.exports = SalesStagePage;
