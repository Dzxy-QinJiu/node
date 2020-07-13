/**
 * Created by xiaojinfeng on  2015/12/22 16:59 .
 */
var React = require('react');
require('./css/sales-stage.less');
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var topHeight = 87; // 22 + 65 : 添加按钮高度+顶部导航高度
var leftWidth = 105;
var SalesStageStore = require('./store/sales-stage-store');
var SalesStageAction = require('./action/sales-stage-actions');
var SalesStageInfo = require('./views/sales-stage-info');
var Spinner = require('../../../components/spinner');
import SalesStageForm from './views/sales-stage-form';
import Trace from 'LIB_DIR/trace';
import {message, Button, Popover, Icon} from 'antd';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import sales_stage_privilegeConst from './privilege-const';

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
        return $(window).width() - leftWidth - BACKGROUG_LAYOUT_CONSTANTS.PADDING_WIDTH -
            BACKGROUG_LAYOUT_CONSTANTS.FRIST_NAV_WIDTH - BACKGROUG_LAYOUT_CONSTANTS.NAV_WIDTH;
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
            let id = _.get(salesStage, 'id');
            let salesStageList = this.state.salesStageList;
            let index = _.findIndex(salesStageList, item => item.id === id);
            salesStage.index = index + 1;
            SalesStageAction.editSalesStage(salesStage, () => {
                SalesStageAction.hideSalesStageeForm();
                message.success(Intl.get('crm.218', '修改成功！'));
            });
        } else {
            let length = _.get(this.state.salesStageList, 'length');
            // 更改订单阶段的顺序，从1开始，依次增加
            _.each(this.state.salesStageList, (item, index) => {
                item.index = index + 1;
            });
            let currentSalesStageList = _.cloneDeep(this.state.salesStageList);
            currentSalesStageList.push({...salesStage, index: length + 1});
            SalesStageAction.addSalesStage(currentSalesStageList, () => {
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
                message.error(this.state.deleteStageErrMsg || Intl.get('crm.139', '删除失败！'));
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

    //渲染操作按钮区
    renderTopNavOperation = () => {
        let length = _.get(this.state.salesStageList, 'length');
        let disabled = false;
        let title = '';
        if (length > 7) {
            disabled = true;
            title = Intl.get('sales.stage.toplimit', '订单阶段个数已达上限（8个）');
        }
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <PrivilegeChecker check={sales_stage_privilegeConst.BGM_SALES_STAGE_ADD} className="sales-stage-top-div">
                        {title ? (
                            <Popover content={title}>
                                <Button
                                    type="ghost"
                                    className="sales-stage-top-btn btn-item"
                                    disabled={disabled}
                                >
                                    <Icon type="plus" />
                                    {Intl.get('sales.stage.add.order.stage', '添加订单阶段')}
                                </Button>
                            </Popover>
                        ) : (
                            <Button
                                type="ghost" className="sales-stage-top-btn btn-item"
                                onClick={this.events_showSalesStageForm.bind(this, 'addSalesStage')}
                                data-tracename="添加订单阶段"
                            >
                                <Icon type="plus" />
                                {Intl.get('sales.stage.add.order.stage', '添加订单阶段')}
                            </Button>
                        )}
                    </PrivilegeChecker>
                </div>
                <div className='pull-right'>
                    {
                        this.state.salesStageEditOrder ?
                            (<div className="sales-stage-top-div-group">
                                <div className="sales-stage-top-div">
                                    <Button
                                        type="ghost"
                                        className="sales-stage-top-btn btn-item"
                                        onClick={this.events_hideSalesStageEditOrder.bind(this)}
                                    >
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                    </Button>
                                </div>
                                <div className="sales-stage-top-div">
                                    <Button
                                        type="ghost"
                                        className="sales-stage-top-btn btn-item"
                                        onClick={this.events_saveSalesStageOrder.bind(this)}
                                    >
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                    </Button>
                                </div>
                            </div>) : (
                                <PrivilegeChecker
                                    check={sales_stage_privilegeConst.BGM_SALES_STAGE_SORT}
                                >
                                    <Button
                                        type="ghost"
                                        className="sales-stage-top-btn btn-item btn-m-r-2"
                                        onClick={this.events_showSalesStageEditOrder.bind(this)}
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
        SalesStageAction.getSalesStageList();
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
        let noDataTips = Intl.get('crm.order.stage.nodata.tips', '暂无订单阶段，请先添加');
        let errMsg = this.state.getSalesStageListErrMsg;
        if (errMsg) {
            noDataTips = this.renderMsgTips(errMsg);
        }
        return (
            <NoDataIntro noDataTip={noDataTips}/>
        );
    };

    render() {
        let width = this.state.salesStageWidth;
        let salesStageList = this.state.salesStageList;
        let length = _.get(salesStageList, 'length');
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        return (
            <div
                className="order-stage-manage-container"
                data-tracename="订单阶段管理"
                style={{height: height}}
            >
                <div className="order-stage-content" style={{height: height}}>
                    <div className="order-stage-top-nav">
                        {this.renderTopNavOperation()}
                    </div>
                    {this.state.salesStageFormShow ? (
                        <SalesStageForm
                            salesStage={this.state.currentSalesStage}
                            salesStageFormShow={this.state.salesStageFormShow}
                            cancelSalesStageForm={this.events_hideSalesStageeForm}
                            submitSalesStageForm={this.events_submitSalesStageForm}
                        />) : null}
                    <GeminiScrollBar style={{height: containerHeight}}>
                        {
                            this.state.loading ? (
                                <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>
                            ) : null
                        }
                        {
                            !this.state.loading && (length === 0 || this.state.getSalesStageListErrMsg) ?
                                this.renderNoDataTipsOrErrMsg() : null
                        }
                        <div className="sales-stage-table-block">
                            {this.state.isSavingSalesStageHome ? (<div className="sales-stage-block">
                                <Spinner className="sales-stage-saving"/>
                            </div>) : null}
                            <ul className="sales-stage-timeline">
                                {
                                    salesStageList.map( (salesStage, key) => {
                                        return (
                                            <li className="sales-stage-timeline-item" key={key}>
                                                <div className="sales-stage-timeline-item-tail"></div>
                                                <div className="sales-stage-timeline-item-head">
                                                    <i className='iconfont icon-order-arrow-down'></i>
                                                </div>
                                                <div className="sales-stage-timeline-item-right"></div>
                                                <SalesStageInfo
                                                    salesStage={salesStage}
                                                    width={width}
                                                    showSalesStageModalDialog={this.events_showSalesStageModalDialog}
                                                    hideSalesStageModalDialog={this.events_hideSalesStageModalDialog}
                                                    deleteSalesStage={this.events_deleteSalesStage}
                                                    showSalesStageForm={this.events_showSalesStageForm.bind(this)}
                                                    salesStageOrderUp={this.events_salesStageOrderUp}
                                                    salesStageOrderDown={this.events_salesStageOrderDown}
                                                    salesStageEditOrder={this.state.salesStageEditOrder}
                                                >
                                                </SalesStageInfo>
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

module.exports = SalesStagePage;

