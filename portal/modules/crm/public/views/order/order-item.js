import {Button, Radio, message, Alert, Icon, Select} from "antd";
const Option = Select.Option;
const RadioGroup = Radio.Group;
const ModalDialog = require("../../../../../components/ModalDialog");
const Spinner = require('../../../../../components/spinner');
const CrmAction = require("../../action/crm-actions");
const OrderAction = require("../../action/order-actions");
const history = require("../../../../../public/sources/history");
import SearchIconList from '../../../../../components/search-icon-list';
import routeList from "../../../common/route";
import ajax from "../../../common/ajax";
const hasPrivilege = require("../../../../../components/privilege/checker").hasPrivilege;
import Trace from "LIB_DIR/trace";

const OrderItem = React.createClass({
    getInitialState: function () {
        return {
            modalDialogFlag: false,//是否展示模态框
            modalContent: "",//模态框提示内容
            modalDialogType: 0,//1：删除
            isLoading: false,
            isAlertShow: false,
            isStageSelectShow: false,
            isAppPanelShow: false,
            apps: this.props.order.apps,
            stage: this.props.order.sale_stages,
            formData: JSON.parse(JSON.stringify(this.props.order)),
        }
    },

    componentWillReceiveProps: function (nextProps) {
        if (nextProps.isMerge||nextProps.order && nextProps.order.id !== this.props.order.id) {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.order)),
                stage: nextProps.order.sale_stages,
                apps: nextProps.order.apps
            });
        }
    },

    //展示是否删除的模态框
    showDelModalDialog: function () {
        this.setState({
            modalDialogFlag: true,
            modalContent: "确定要删除这个订单吗？",
            modalDialogType: 1,
            isLoading: false
        });
    },

    hideModalDialog: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-cancel"), "取消删除某个订单");
        this.setState({
            modalDialogFlag: false
        });
    },

    //模态提示框确定后的处理
    handleModalOK: function (order, apps) {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "确定删除某个订单");
        switch (this.state.modalDialogType) {
            case 1:
                //删除订单
                if (this.props.isMerge) {
                    //合并客户时，删除订单
                    this.props.delMergeCustomerOrder(order.id);
                } else {
                    this.setState({isLoading: true});
                    OrderAction.deleteOrder({}, {id: order.id}, result => {
                        this.setState({isLoading: false});
                        if (result.code === 0) {
                            message.success(Intl.get("crm.138", "删除成功"));
                            OrderAction.afterDelOrder(order.id);
                            //稍后后再去重新获取数据，以防止后端更新未完成从而取到的还是旧数据
                            setTimeout(() => {
                                //删除订单后，更新客户列表中的客户信息
                                this.props.refreshCustomerList(order.customer_id);
                            }, 1000);
                        }
                        else {
                            message.error(Intl.get("crm.139", "删除失败"));
                        }
                    });
                }
                break;
        }
    },

    showApplyForm: function (applyType, order, apps) {
        if (apps && !apps.length) {
            this.setState({isAlertShow: true});
            setTimeout(() => {
                this.setState({isAlertShow: false});
            }, 3000);
            return;
        }

        this.props.showApplyUserForm(applyType, order, apps);
    },

    showStageSelect: function () {
        Trace.traceEvent(this.getDOMNode(), "点击编辑销售阶段按钮");
        this.setState({isStageSelectShow: true});
    },

    closeStageSelect: function () {
        Trace.traceEvent(this.getDOMNode(), "取消客户详情中订单页面销售阶段修改的保存");
        this.setState({
            isStageSelectShow: false,
            stage: this.state.formData.sale_stages
        });
    },

    onStageChange: function (stage) {
        Trace.traceEvent(this.getDOMNode(), "修改销售阶段");
        this.state.stage = stage;
        this.setState(this.state);
    },

    showAppPanel: function () {
        Trace.traceEvent(this.getDOMNode(), "点击修改应用");
        this.setState({isAppPanelShow: true});
    },

    closeAppPanel: function () {
        Trace.traceEvent(this.getDOMNode(), "取消客户详情中订单页面应用修改的保存");
        this.setState({isAppPanelShow: false, apps: this.state.formData.apps});
    },

    onAppsChange: function (selectedApps) {
        Trace.traceEvent(this.getDOMNode(), "点击选中/取消选中某个应用");
        this.state.apps = _.pluck(selectedApps, "client_id");
        this.setState(this.state);
    },

    handleSubmit: function (updateTarget) {
        let reqData = JSON.parse(JSON.stringify(this.props.order));
        if (updateTarget === "stage") reqData.sale_stages = this.state.stage;
        if (updateTarget === "app") reqData.apps = this.state.apps;
        if (this.props.isMerge) {
            //合并客户时，修改订单的销售阶段或应用
            this.props.updateMergeCustomerOrder(reqData);
            if (updateTarget === "stage") {
                this.state.isStageSelectShow = false;
                Trace.traceEvent($(this.getDOMNode()).find(".order-introduce-div"), "保存客户详情中订单页面销售阶段的修改");
            }
            if (updateTarget === "app") {
                this.state.isAppPanelShow = false;
                Trace.traceEvent($(this.getDOMNode()).find(".order-introduce-div"), "保存客户详情中订单页面应用的修改");
            }
        } else {
            //客户详情中修改订单的销售阶段或应用
            this.setState({isLoading: true});
            if (updateTarget === "stage") {
                //修改订单的销售阶段
                this.editOrderStage(reqData);
                Trace.traceEvent($(this.getDOMNode()).find(".order-introduce-div"), "保存客户详情中订单页面销售阶段的修改");
            } else if (updateTarget === "app") {
                //修改订单的应用
                this.editOrderApp(reqData);
                Trace.traceEvent($(this.getDOMNode()).find(".order-introduce-div"), "保存客户详情中订单页面应用的修改");
            }
        }
    },
    //修改订单的销售阶段
    editOrderStage: function (reqData) {
        let {customer_id, id, sale_stages} = reqData;
        OrderAction.editOrderStage({customer_id, id, sale_stages}, {}, result => {
            this.state.isLoading = false;
            if (result.code === 0) {
                message.success(Intl.get("common.save.success", "保存成功"));
                this.state.formData.sale_stages = reqData.sale_stages;
                //关闭编辑状态，返回展示状态
                this.state.isStageSelectShow = false;
                //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据
                setTimeout(() => {
                    this.props.refreshCustomerList(reqData.customer_id);
                }, 1000);
            } else {
                message.error(Intl.get("common.save.failed", "保存失败"));
            }
            this.setState(this.state);
        });
    },
    //修改订单的应用
    editOrderApp: function (reqData) {
        //修改订单的应用
        let {customer_id, id, apps} = reqData;
        OrderAction.editOrder({customer_id, id, apps}, {}, (result) => {
            this.state.isLoading = false;
            if (result.code === 0) {
                message.success(Intl.get("common.save.success", "保存成功"));
                this.state.formData.apps = reqData.apps;
                this.state.isAppPanelShow = false;
                //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据
                setTimeout(() => {
                    this.props.refreshCustomerList(reqData.customer_id);
                }, 1000);
            } else {
                message.error(Intl.get("common.save.failed", "保存失败"));
            }
            this.setState(this.state);
        });
    },

    //生成合同
    generateContract: function () {
        this.setState({isLoading: true});

        const route = _.find(routeList, route => route.handler === "generateContract");

        const params = {
            id: this.props.order.id
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };

        ajax(arg).then(result => {
                this.setState({isLoading: false});

                message.success(Intl.get("crm.140", "生成合同成功"));
                //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据

                setTimeout(() => {
                    this.props.refreshCustomerList(this.props.order.customer_id);
                }, 1000);
            },
            errorMsg => {
                this.setState({isLoading: false});

                message.error(errorMsg);
            });
    },

    //转到合同
    gotoContract: function () {
        history.pushState({
            contractId: this.props.order.contract_id
        }, "/contract/list", {});
    },

    render: function () {
        const _this = this;
        const order = this.state.formData;
        let selectedAppList = [];
        let selectedAppListId = [];
        if (order.apps && order.apps.length > 0) {
            selectedAppList = this.props.appList.filter(app => {
                if (order.apps.indexOf(app.client_id) > -1) {
                    return true;
                }
            });
            selectedAppListId = _.pluck(selectedAppList, "client_id");
        }
        const appList = this.props.appList;
        let apps = [];
        if (appList && appList.length > 0 && order.apps && order.apps.length > 0) {
            apps = _.filter(appList, app => {
                if (order.apps.indexOf(app.client_id) > -1) return true;
            });
        }

        //申请按钮文字
        let applyBtnText = "";
        //申请类型
        let applyType = 2;
        if ([Intl.get("crm.141", "成交阶段"), Intl.get("crm.142", "执行阶段")].indexOf(order.sale_stages) > -1) {
            applyBtnText = Intl.get("user.apply.user.official", "申请签约用户");
            applyType = 3;
        } else if ([Intl.get("crm.143", "试用阶段"), Intl.get("crm.144", "立项报价阶段"), Intl.get("crm.145", "谈判阶段")].indexOf(order.sale_stages) > -1) {
            applyBtnText = Intl.get("common.apply.user.trial", "申请试用用户");
        }

        //区分删除和申请用户的类，用来控制模态框样式的不同
        let className = "order-item order-view modal-container";
        if (this.state.modalDialogType > 1) {
            className += " apply-user-modal";
        }

        //是否显示生成合同的按钮
        let showGenerateContractBtn = false;
        if (this.props.order.sale_stages === Intl.get("crm.141", "成交阶段") && !this.props.order.contract_id && hasPrivilege("SALESOPPORTUNITY_CONTRACT")) {
            showGenerateContractBtn = true;
        }

        return (
            <div className={className}>
                {
                    this.state.isLoading ?
                        (<Spinner className="isloading"/>) :
                        (null)
                }
                <div className="order-title">
                    <div className="order-title-left">
                        <label><ReactIntl.FormattedMessage id="crm.146"
                                                           defaultMessage="日期"/>：{moment(order.time).format(oplateConsts.DATE_FORMAT)}
                        </label>
                        <br />
                        <label><ReactIntl.FormattedMessage id="crm.147" defaultMessage="订单号"/>：{order.id}</label>
                    </div>
                    <div className="order-title-right-btn">
                        <div className="order-btn-class icon-delete iconfont"
                             onClick={this.showDelModalDialog}
                             data-tracename="点击删除某个订单按钮"
                        />
                        <div className="order-btn-class icon-update iconfont"
                             onClick={this.props.showForm.bind(null, order.id)}
                        />
                    </div>
                </div>
                <div className="order-introduce">
                    <div className="order-introduce-div">
                        <label><ReactIntl.FormattedMessage id="sales.stage.sales.stage" defaultMessage="销售阶段"/>：</label>
                        {!this.state.isStageSelectShow ? (
                            <label style={{marginRight: 8}}>{order.sale_stages}</label>
                        ) : (
                            <Select
                                style={{width: 150, marginRight: 8}}
                                value={this.state.stage}
                                onChange={this.onStageChange}
                            >
                                {this.props.stageList.map(function (stage, index) {
                                    return (<Option value={stage.name} key={index}>{stage.name}</Option>);
                                })}
                            </Select>
                        )}
                        {this.state.isStageSelectShow ? (
                            <Button
                                shape="circle"
                                title={Intl.get("common.save", "保存")}
                                className="btn-save"
                                onClick={this.handleSubmit.bind(this, "stage")}
                            >
                                <Icon type="save"/>
                            </Button>
                        ) : null}
                        {this.state.isStageSelectShow ? (
                            <Button
                                shape="circle"
                                title={Intl.get("common.cancel", "取消")}
                                onClick={this.closeStageSelect}
                            >
                                <Icon type="cross"/>
                            </Button>
                        ) : null}
                        {!this.state.isStageSelectShow ? (
                            <Button
                                shape="circle"
                                title={Intl.get("common.edit", "编辑")}
                                onClick={this.showStageSelect}
                            >
                                <Icon type="edit"/>
                            </Button>
                        ) : null}
                    </div>
                    <div className="order-introduce-div">
                        <label
                            className={(order.budget ? "" : " color-gray")}><ReactIntl.FormattedMessage id="crm.148"
                                                                                                        defaultMessage="预算金额"/>：{order.budget ? Intl.get("crm.149", "{num}万", {num: order.budget}) : null}
                        </label>
                    </div>
                    <div className="order-application-list">
                        <label className={(apps ? "" : "color-gray")}><ReactIntl.FormattedMessage id="common.app"
                                                                                                  defaultMessage="应用"/>：</label>
                        <div className="order-application-div">
                            {apps.map(function (app, i) {
                                return (
                                    <div className="app-item" key={i}>
                                        {app.client_name}
                                    </div>
                                )
                            })}
                        </div>
                        {this.state.isAppPanelShow ? (
                            <Button
                                shape="circle"
                                title={Intl.get("common.save", "保存")}
                                className="btn-save"
                                onClick={this.handleSubmit.bind(this, "app")}
                            >
                                <Icon type="save"/>
                            </Button>
                        ) : null}
                        {this.state.isAppPanelShow ? (
                            <Button
                                shape="circle"
                                title={Intl.get("common.cancel", "取消")}
                                onClick={this.closeAppPanel}
                            >
                                <Icon type="cross"/>
                            </Button>
                        ) : null}
                        {!this.state.isAppPanelShow ? (
                            <Button
                                shape="circle"
                                title={Intl.get("common.edit", "编辑")}
                                onClick={this.showAppPanel}
                            >
                                <Icon type="edit"/>
                            </Button>
                        ) : null}
                    </div>
                    {this.state.isAppPanelShow ? (
                        <SearchIconList
                            totalList={this.props.appList}
                            selectedList={selectedAppList}
                            selectedListId={selectedAppListId}
                            id_field="client_id"
                            name_field="client_name"
                            image_field="client_image"
                            search_fields={["client_name"]}
                            onItemsChange={this.onAppsChange}
                        />
                    ) : null}

                    {applyBtnText && this.props.isApplyButtonShow ? (
                        <div className="order-introduce-div">
                            <label><ReactIntl.FormattedMessage id="crm.150" defaultMessage="用户申请"/>：</label>
                            <Button type="ghost" className="order-introduce-btn"
                                    onClick={this.showApplyForm.bind(this, applyType, order, apps)}
                            >
                                {applyBtnText}
                            </Button>
                        </div>
                    ) : null}
                    <div className="order-introduce-div">
                        <label
                            className={"order-label-salesRemarks" + (order.remarks ? "" : " color-gray")}><ReactIntl.FormattedMessage
                            id="common.remark" defaultMessage="备注"/>：</label>
                        <div
                            className="order-div-salesRemarks">{order.remarks}</div>
                    </div>

                    {this.props.order.contract_id ? (
                        <Button type="ghost" className="order-introduce-btn pull-right"
                                onClick={this.gotoContract}
                        >
                            <ReactIntl.FormattedMessage id="crm.151" defaultMessage="查看合同"/>
                        </Button>
                    ) : null}

                    {showGenerateContractBtn ? (
                        <Button type="ghost" className="order-introduce-btn pull-right"
                                onClick={this.generateContract}
                        >
                            <ReactIntl.FormattedMessage id="crm.152" defaultMessage="生成合同"/>
                        </Button>
                    ) : null}
                </div>

                <ModalDialog modalContent={_this.state.modalContent}
                             modalShow={_this.state.modalDialogFlag}
                             container={_this}
                             hideModalDialog={_this.hideModalDialog.bind(_this, order)}
                             delete={_this.handleModalOK.bind(_this, order, apps)}
                />

                {this.state.isAlertShow ? (
                    <Alert
                        message={Intl.get("crm.153", "请先添加应用")}
                        type="error"
                        showIcon
                    />
                ) : null}
            </div>
        );
    }
});

module.exports = OrderItem;
