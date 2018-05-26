import routeList from "../common/route";
import ajax from "../common/ajax";
import GeminiScrollBar from '../../../components/react-gemini-scrollbar';
import rightPanelUtil from "../../../components/rightPanel";
const RightPanel = rightPanelUtil.RightPanel;
const RightPanelReturn = rightPanelUtil.RightPanelReturn;
const RightPanelClose = rightPanelUtil.RightPanelClose;
import Spinner from "../../../components/spinner";
import { Tabs, message, Button } from "antd";
const TabPane = Tabs.TabPane;
import { PRODUCT, PROJECT, SERVICE, PURCHASE, CATEGORY } from "../consts";
import AddBasic from "./add-basic";
import AddProduct from "./add-product";
import AddReport from "./add-report";
import AddRepayment from "./add-repayment";
import AddBuyBasic from "./add-buy-basic";
import AddBuyPayment from "./add-buy-payment";
import DetailBasic from "./detail-basic";
import DetailRepayment from "./detail-repayment";
import DetailInvoice from "./detail-invoice";
import DetailBuyBasic from "./detail-buy-basic";
import DetailBuyPayment from "./detail-buy-payment";
import DetailCost from "./detail-cost";
import Trace from "LIB_DIR/trace";

let stepMap = {
    "1": "基本信息",
    "2": "产品信息",
    "3": "回款计划"
};

const ContractRightPanel = React.createClass({
    getInitialState: function() {
        return {
            isLoading: false,
            currentView: this.props.view,
            currentCategory: this.props.view === "buyForm" ? PURCHASE : PRODUCT,
            currentTabKey: "1",
        };
    },
    componentDidMount: function() {
        $(window).on("resize", this.setContentHeight);
        this.setContentHeight();
    },
    componentDidUpdate: function() {
        const scrollBar = this.refs.gemiScrollBar;

        if (scrollBar) {
            this.setContentHeight();
        }
    },
    componentWillUnmount: function() {
        $(window).off("resize", this.setContentHeight);
    },
    setContentHeight: function() {
        const wrapper = $(".ant-tabs-tabpane");
        //新高度 = 窗口高度 - 容器距窗口顶部的距离 - 底部留空
        wrapper.height($(window).height() - $(".ant-tabs-content").offset().top - 70);
        this.updateScrollBar();
    },
    updateScrollBar: function() {
        const scrollBar = this.refs.gemiScrollBar;

        if (!scrollBar) return;

        scrollBar.update();
    },
    componentWillReceiveProps: function(nextProps) {
        //当前视图是否是合同基本信息添加表单
        const isOnAddForm = ["buyForm", "sellForm"].indexOf(this.state.currentView) > -1;

        //如果当前视图是合同基本信息添加表单
        //并且从外层传进来的视图属性是选择类别的话
        //说明是从添加表单请求外层数据
        //（如重新获取负责人列表的这种操作）
        //此时应该保持在当前视图
        //否则应该切换到外层视图属性指定的视图
        if (!(isOnAddForm && nextProps.view === "chooseType")) {
            this.state.currentView = nextProps.view;
        }

        //从外层点击添加合同按钮直接打开采购合同添加表单时，将合同类别设为采购合同
        if (nextProps.view === "buyForm") {
            this.state.currentCategory = PURCHASE;
        }

        if (nextProps.contract.id !== this.props.contract.id) {
            this.state.currentTabKey = "1";
        }

        this.setState(this.state);
    },
    changeCurrentTabKey: function(key) {
        this.setState({
            currentTabKey: key
        });
    },
    changeToView: function(view, category) {
        Trace.traceEvent(this.getDOMNode(),"添加合同>选择'" + category + "'类型");
        if (view) this.state.currentView = view;
        if (category) this.state.currentCategory = category;
        this.state.currentTabKey = "1";
        this.setState(this.state);
    },
    goPrev: function() {
        //当验证通过时，发送点击事件信息
        if(validation) {
            Trace.traceEvent(this.getDOMNode(),"添加合同>进入上一步");
        }
        if (this.state.currentTabKey == 1) this.state.currentView = "chooseType";
        else {
            let step = parseInt(this.state.currentTabKey);
            step--;
            this.state.currentTabKey = step.toString();
        }
        this.setState(this.state);
    },
    goNext: function() {
        let step = parseInt(this.state.currentTabKey);
        step++;
        this.state.currentTabKey = step.toString();
        this.setState(this.state);
    },
    onNextStepBtnClick: function() {
        let validation;
        
        if (this.state.currentView === "sellForm") {
            if (this.state.currentTabKey === "1") {
                validation = this.refs.addBasic.refs.validation;
            } else {
                if ([PRODUCT, SERVICE].indexOf(this.state.currentCategory) > -1 && this.state.currentTabKey === "2") {
                    validation = this.refs.addProduct.refs.validation;
                }
                else if ([SERVICE].indexOf(this.state.currentCategory) > -1 && this.state.currentTabKey === "3") {
                    validation = this.refs.addReport.refs.validation;
                }
            }
        } else {
            validation = this.refs.addBuyBasic.refs.validation;
        }
        //当验证通过时，发送点击事件信息
        if(validation) {
            Trace.traceEvent(this.getDOMNode(), "添加合同>从'" + stepMap[this.state.currentTabKey] + "'进入下一步");
        }

        //添加服务合同时，产品信息可不填
        if (this.state.currentCategory === SERVICE && this.state.currentTabKey === "2") {
            this.goNext();
            return;
        }

        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                this.goNext();
            }
        });
    },
    showLoading: function() {
        this.setState({isLoading: true});
    },
    hideLoading: function() {
        this.setState({isLoading: false});
    },
    handleSubmit: function(cb) {
        Trace.traceEvent(this.getDOMNode(), stepMap[this.state.currentTabKey] + "添加合同>点击完成按钮");
        this.showLoading();

        const currentView = this.state.currentView;
        let type;
        let contractData;

        if (currentView === "sellForm") {
            type = "sell";
            contractData = _.extend({}, this.props.contract, this.refs.addBasic.state.formData);
            contractData.category = this.state.currentCategory;

            const addProduct = this.refs.addProduct;
            if (addProduct && !_.isEmpty(addProduct.state.products[0])) {
                contractData.products = addProduct.state.products;
            }

            const addReport = this.refs.addReport;
            if (addReport && !_.isEmpty(addReport.state.reports[0])) {
                contractData.reports = addReport.state.reports;
            }

            if (this.refs.addRepayment) contractData.repayments = this.refs.addRepayment.state.repayments;
        } else if (currentView === "buyForm") {
            type = "buy";
            contractData = _.extend({}, this.props.contract, this.refs.addBuyBasic.state.formData);
            contractData.category = this.state.currentCategory;
            if (this.refs.addBuyPayment) contractData.payments = this.refs.addBuyPayment.state.payments;
        } else {
            type = this.props.contract.type;
            if (type === "sell") {
                contractData = _.extend({}, this.props.contract, this.refs.detailBasic.state.formData);
            } else {
                contractData = _.extend({}, this.props.contract, this.refs.detailBuyBasic.state.formData);
            }
        }

        const reqData = contractData;
        const params = {type: type};
        let operateType = "add";
        let operateName = Intl.get("sales.team.add.sales.team", "添加");
        if (reqData.id) {
            operateType = "edit";
            operateName = Intl.get("common.update", "修改");
        }
        const route = _.find(routeList, route => route.handler === operateType + "Contract");
        const arg = {
            url: route.path,
            type: route.method,
            data: reqData,
            params: params
        };
        
        ajax(arg).then(result => {
            this.hideLoading();

            if (result && result.code === 0) {
                message.success(operateName + "成功");

                if (["sellForm", "buyForm"].indexOf(currentView) > -1) {
                    this.props.hideRightPanel();
                }

                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);

                if (operateType === "add") {
                    if (hasResult) {
                        this.props.addContract(result.result);
                    }
                } else {
                    if (hasResult) {
                        this.props.refreshCurrentContract(reqData.id);
                    }
                }

                if (_.isFunction(cb)) cb();
            } else {
                message.error(operateName + "失败");
            }
        }, (errMsg) => {
            this.hideLoading();
            message.error(errMsg || operateName + "失败");
        });
    },
    handleCancel: function() {
        if (this.props.contract.id) {
            this.setState({isFormShow: false});
        } else {
            this.props.hideRightPanel();
        }
    },
    render: function() {
        let endPaneKey = "3";
        if ([PROJECT, PURCHASE].indexOf(this.state.currentCategory) > -1) endPaneKey = "2";
        if (this.state.currentCategory === SERVICE) endPaneKey = "4";

        let sellFormPanes = [];

        sellFormPanes.push((
            <TabPane tab={Intl.get("user.user.basic", "基本信息")} key="1">
                <GeminiScrollBar ref="gemiScrollBar">
                    <AddBasic
                        ref="addBasic"
                        contract={this.props.contract}
                        teamList={this.props.teamList}
                        userList={this.props.userList}
                        getUserList={this.props.getUserList}
                        isGetUserSuccess={this.props.isGetUserSuccess}
                        validateNumRepeat={true}
                    />
                </GeminiScrollBar>
            </TabPane>
        ));
    
        if ([PRODUCT, SERVICE].indexOf(this.state.currentCategory) > -1) sellFormPanes.push((
            <TabPane tab={Intl.get("contract.95", "产品信息")} key="2">
                <GeminiScrollBar ref="gemiScrollBar">
                    <AddProduct
                        ref="addProduct"
                        appList={this.props.appList}
                        updateScrollBar={this.updateScrollBar}
                    />
                </GeminiScrollBar>
            </TabPane>
        ));
    
        if (this.state.currentCategory === SERVICE) sellFormPanes.push((
            <TabPane tab={Intl.get("contract.96", "服务信息")} key="3">
                <GeminiScrollBar ref="gemiScrollBar">
                    <AddReport
                        ref="addReport"
                        contract={this.props.contract}
                        updateScrollBar={this.updateScrollBar}
                    />
                </GeminiScrollBar>
            </TabPane>
        ));
    
        sellFormPanes.push((
            <TabPane tab={Intl.get("contract.97", "回款计划")} key={endPaneKey}>
                <GeminiScrollBar ref="gemiScrollBar">
                    <AddRepayment
                        ref="addRepayment"
                        parent={this}
                        rightPanel={this}
                        updateScrollBar={this.updateScrollBar}
                    />
                </GeminiScrollBar>
            </TabPane>
        ));

        return (
            <div>
                <RightPanelClose 
                    onClick={this.props.hideRightPanel}
                />

                {this.state.currentView === "sellForm" ? (
                    <RightPanelReturn 
                        onClick={this.changeToView.bind(this, "chooseType")}
                    />
                ) : null}

                {this.state.currentView === "chooseType" ? (
                    <Tabs defaultActiveKey="1" className="choose-type">
                        <TabPane tab={Intl.get("contract.98", "添加合同")} key="1">
                        选择类型：
                            <ul>
                                {CATEGORY.map((category, index) => {
                                    //将采购合同排除
                                    if (category === PURCHASE) return;

                                    const className = category === this.state.currentCategory ? "active" : "";
                                    const view = category === PURCHASE ? "buyForm" : "sellForm";
                                    return (<li className={className}
                                        key={index}
                                        onClick={this.changeToView.bind(this, view, category)}
                                    >
                                        {category}
                                    </li>);
                                })}
                            </ul>
                        </TabPane>
                    </Tabs>
                ) : null}

                {this.state.currentView === "sellForm" ? (
                    <div className="add-form">
                        <Tabs activeKey={this.state.currentTabKey}>
                            {sellFormPanes}
                        </Tabs>

                        <div className="step-button">
                            <Button
                                onClick={this.goPrev}
                            >
                                <ReactIntl.FormattedMessage id="user.user.add.back" defaultMessage="上一步" />
                            </Button>
                            {this.state.currentTabKey != endPaneKey ? (
                                <Button
                                    onClick={this.onNextStepBtnClick}
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.next" defaultMessage="下一步" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={this.handleSubmit}
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.finish" defaultMessage="完成" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}

                {this.state.currentView === "buyForm" ? (
                    <div className="add-form">
                        <Tabs activeKey={this.state.currentTabKey}>
                            <TabPane tab={Intl.get("user.user.basic", "基本信息")} key="1">
                                <AddBuyBasic
                                    ref="addBuyBasic"
                                    contract={this.props.contract}
                                    teamList={this.props.teamList}
                                    userList={this.props.userList}
                                    getUserList={this.props.getUserList}
                                    isGetUserSuccess={this.props.isGetUserSuccess}
                                    validateNumRepeat={true}
                                />
                            </TabPane>

                            <TabPane tab={Intl.get("contract.100", "付款计划")} key="2">
                                <GeminiScrollBar ref="gemiScrollBar">
                                    <AddBuyPayment
                                        ref="addBuyPayment"
                                        rightPanel={this}
                                        updateScrollBar={this.updateScrollBar}
                                    />
                                </GeminiScrollBar>
                            </TabPane>
                        </Tabs>

                        <div className="step-button">
                            <Button
                                onClick={this.goPrev}
                            >
                                <ReactIntl.FormattedMessage id="user.user.add.back" defaultMessage="上一步" />
                            </Button>
                            {this.state.currentTabKey != "2" ? (
                                <Button
                                    onClick={this.onNextStepBtnClick}
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.next" defaultMessage="下一步" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={this.handleSubmit}
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.finish" defaultMessage="完成" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}

                {this.state.currentView === "detailCost" ? (
                    <div className="add-form">
                        <Tabs activeKey={this.state.currentTabKey}>
                            <TabPane tab={_.isEmpty(this.props.contract) ? Intl.get("contract.127", "添加费用") : Intl.get("contract.129", "费用信息")} key="1">
                                <DetailCost
                                    ref="detailCost"
                                    cost={this.props.contract}
                                    teamList={this.props.teamList}
                                    userList={this.props.userList}
                                    getUserList={this.props.getUserList}
                                    isGetUserSuccess={this.props.isGetUserSuccess}
                                    showLoading={this.showLoading}
                                    hideLoading={this.hideLoading}
                                    addContract={this.props.addContract}
                                    refreshCurrentContract={this.props.refreshCurrentContract}
                                    deleteContract={this.props.deleteContract}
                                    hideRightPanel={this.props.hideRightPanel}
                                />
                            </TabPane>
                        </Tabs>
                    </div>
                ) : null}

                {this.state.currentView === "detail" ? (
                    <div className="detail">
                        {this.props.contract.type === "sell" ? (
                            <Tabs activeKey={this.state.currentTabKey} onChange={this.changeCurrentTabKey}>
                                <TabPane tab={Intl.get("contract.101", "合同信息")} key="1">
                                    <GeminiScrollBar ref="gemiScrollBar">
                                        <DetailBasic
                                            ref="detailBasic"
                                            contract={this.props.contract}
                                            teamList={this.props.teamList}
                                            userList={this.props.userList}
                                            getUserList={this.props.getUserList}
                                            isGetUserSuccess={this.props.isGetUserSuccess}
                                            appList={this.props.appList}
                                            handleSubmit={this.handleSubmit}
                                            updateScrollBar={this.updateScrollBar}
                                        />
                                    </GeminiScrollBar>
                                </TabPane>
                                <TabPane tab={Intl.get("contract.102", "合同回款")} key="2">
                                    <DetailRepayment
                                        ref="detailRepayment"
                                        contract={this.props.contract}
                                        showLoading={this.showLoading}
                                        hideLoading={this.hideLoading}
                                        refreshCurrentContract={this.props.refreshCurrentContract}
                                    />
                                </TabPane>
                                <TabPane tab={Intl.get("contract.103", "合同发票")} key="3">
                                    <GeminiScrollBar ref="gemiScrollBar">
                                        <DetailInvoice
                                            ref="detailInvoice"
                                            contract={this.props.contract}
                                            showLoading={this.showLoading}
                                            hideLoading={this.hideLoading}
                                            refreshCurrentContract={this.props.refreshCurrentContract}
                                            updateScrollBar={this.updateScrollBar}
                                        />
                                    </GeminiScrollBar>
                                </TabPane>
                            </Tabs>
                        ) : (
                            <Tabs activeKey={this.state.currentTabKey} onChange={this.changeCurrentTabKey}>
                                <TabPane tab={Intl.get("contract.101", "合同信息")} key="1">
                                    <DetailBuyBasic
                                        ref="detailBuyBasic"
                                        contract={this.props.contract}
                                        teamList={this.props.teamList}
                                        userList={this.props.userList}
                                        getUserList={this.props.getUserList}
                                        isGetUserSuccess={this.props.isGetUserSuccess}
                                        handleSubmit={this.handleSubmit}
                                    />
                                </TabPane>
                                <TabPane tab={Intl.get("contract.104", "合同付款")} key="2">
                                    <GeminiScrollBar ref="gemiScrollBar">
                                        <DetailBuyPayment
                                            ref="detailBuyPayment"
                                            contract={this.props.contract}
                                            showLoading={this.showLoading}
                                            hideLoading={this.hideLoading}
                                            refreshCurrentContract={this.props.refreshCurrentContract}
                                            updateScrollBar={this.updateScrollBar}
                                        />
                                    </GeminiScrollBar>
                                </TabPane>
                            </Tabs>
                        )}
                    </div>
                ) : null}

                {this.state.isLoading ? (
                    <Spinner className="isloading"/>
                ) : null}
            </div>
        );
    }
});

module.exports = ContractRightPanel;

