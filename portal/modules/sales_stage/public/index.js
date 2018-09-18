/**
 * Created by xiaojinfeng on  2015/12/22 16:59 .
 */
var React = require('react');
require('./css/sales-stage.less');
var Button = require('antd').Button;
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var TopNav = require('../../../components/top-nav');
var topHeight = 87; // 22 + 65 : 添加按钮高度+顶部导航高度
var leftWidth = 281; // 75+45+117+44 左侧导航宽度+右侧内容左边距+右侧右侧边距+销售阶段内容左侧边距
var SalesStageStore = require('./store/sales-stage-store');
var SalesStageAction = require('./action/sales-stage-actions');
var SalesStageInfo = require('./views/sales-stage-info');
var Spinner = require('../../../components/spinner');
import SalesStageForm from './views/sales-stage-form';
import Trace from 'LIB_DIR/trace';
import {message} from 'antd';

function getStateFromStore(_this) {
    return {
        ...SalesStageStore.getState(),
        salesStageWidth: _this.salesStageWidthFnc(),
    };
}

class SalesStagePage extends React.Component {
    onChange = () => {
        var datas = getStateFromStore(this);
        this.setState(datas);
    };

    componentDidMount() {
        $(window).on('resize', this.resizeWindow);
        SalesStageStore.listen(this.onChange);
        SalesStageAction.getSalesStageList();
    }

    componentWillUnmount() {
        $(window).off('resize', this.resizeWindow);
        SalesStageStore.unlisten(this.onChange);
    }

    salesStageWidthFnc = () => {
        return $(window).width() - leftWidth;
    };

    resizeWindow = () => {
        this.setState({
            salesStageWidth: this.salesStageWidthFnc()
        });
    };

    events_showSalesStageForm = (salesStage) => {
        if (this.state.isSavingSalesStage) {
            return;
        }
        SalesStageAction.showSalesStageForm(salesStage);
    };

    events_hideSalesStageeForm = () => {
        SalesStageAction.hideSalesStageeForm();
    };

    events_submitSalesStageForm = (salesStage) => {
        if (salesStage.id) {
            SalesStageAction.editSalesStage(salesStage, () => {
                SalesStageAction.hideSalesStageeForm();
                message.success(Intl.get('crm.218', '修改成功！'));
            });
        } else {
            SalesStageAction.addSalesStage(salesStage, () => {
                SalesStageAction.hideSalesStageeForm();
                message.success(Intl.get('crm.216', '添加成功！'));
            });
        }
    };

    events_deleteSalesStage = (salesStage) => {
        SalesStageAction.deleteIsSavingSalesStage();
        SalesStageAction.deleteSalesStage(salesStage, (result) => {
            if (!result.error) {
                message.success(Intl.get('crm.138', '删除成功！'));
            } else {
                message.error(Intl.get('crm.139', '删除失败！'));
            }
        });

    };

    events_showSalesStageModalDialog = (salesStage) => {
        SalesStageAction.showSalesStageModalDialog(salesStage);
    };

    events_hideSalesStageModalDialog = (salesStage) => {
        SalesStageAction.hideSalesStageModalDialog(salesStage);
    };

    events_showSalesStageEditOrder = () => {
        if (this.state.isSavingSalesStage) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .sales-stage-top-div:first-child span'), '变更销售阶段顺序');
        SalesStageAction.showSalesStageEditOrder();
    };

    events_hideSalesStageEditOrder = () => {
        if (this.state.isSavingSalesStage) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .sales-stage-top-btn:last-child span'), '取消对销售阶段顺序更改的保存');
        SalesStageAction.hideSalesStageEditOrder();
    };

    events_salesStageOrderUp = (salesStage) => {
        SalesStageAction.salesStageOrderUp(salesStage);
    };

    events_salesStageOrderDown = (salesStage) => {
        SalesStageAction.salesStageOrderDown(salesStage);
    };

    events_saveSalesStageOrder = () => {
        if (this.state.isSavingSalesStage) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .sales-stage-top-btn:last-child span'), '保存对销售阶段的更改');
        SalesStageAction.changeIsSavingSalesStage();
        SalesStageAction.saveSalesStageOrder(this.state.salesStageList);
    };

    state = {
        saveStageErrMsg: '',
        ...getStateFromStore(this)
    };

    render() {
        var _this = this;
        var width = this.state.salesStageWidth;
        var salesStageList = this.state.salesStageList;
        return (
            <div className="sales-stage-manage-container" data-tracename="销售阶段管理">
                <TopNav>
                    <TopNav.MenuList/>
                    {
                        this.state.salesStageEditOrder ?
                            (<div className="sales-stage-top-div-group">
                                <div className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn btn-item"
                                        onClick={_this.events_hideSalesStageEditOrder.bind(this)}
                                    ><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/></Button>
                                </div>
                                <div className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn btn-item"
                                        onClick={_this.events_saveSalesStageOrder.bind(this)}
                                    ><ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/></Button>
                                </div>
                            </div>) :
                            (<div className="sales-stage-top-div-group">
                                <PrivilegeChecker check="BGM_SALES_STAGE_SORT" className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn btn-item btn-m-r-2"
                                        onClick={_this.events_showSalesStageEditOrder.bind(this)}

                                    ><ReactIntl.FormattedMessage id="sales.stage.change.sort"
                                            defaultMessage="变更顺序"/></Button>
                                </PrivilegeChecker>
                                <PrivilegeChecker check="BGM_SALES_STAGE_ADD" className="sales-stage-top-div">
                                    <Button type="ghost" className="sales-stage-top-btn btn-item"
                                        onClick={_this.events_showSalesStageForm.bind(this, 'addSalesStage')}
                                        data-tracename="添加销售阶段"
                                    ><ReactIntl.FormattedMessage id="sales.stage.add.sales.stage"
                                            defaultMessage="添加销售阶段"/></Button>
                                </PrivilegeChecker>
                            </div>)
                    }

                </TopNav>

                <SalesStageForm
                    salesStage={this.state.currentSalesStage}
                    salesStageFormShow={this.state.salesStageFormShow}
                    cancelSalesStageForm={this.events_hideSalesStageeForm}
                    submitSalesStageForm={this.events_submitSalesStageForm}
                >
                </SalesStageForm>

                <div className="sales-stage-table-block">
                    {this.state.isSavingSalesStageHome ? (<div className="sales-stage-block">
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
                                            showSalesStageModalDialog={_this.events_showSalesStageModalDialog}
                                            hideSalesStageModalDialog={_this.events_hideSalesStageModalDialog}
                                            deleteSalesStage={_this.events_deleteSalesStage}
                                            showSalesStageForm={_this.events_showSalesStageForm.bind(_this)}
                                            salesStageOrderUp={_this.events_salesStageOrderUp}
                                            salesStageOrderDown={_this.events_salesStageOrderDown}
                                            salesStageEditOrder={_this.state.salesStageEditOrder}
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
}

module.exports = SalesStagePage;

