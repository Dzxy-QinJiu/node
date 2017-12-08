/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
require("./css/index.less");
var RightContent = require('CMP_DIR/privilege/right-content');
var FilterBlock = require('CMP_DIR/filter-block');
import ClueCustomerFilterBlock from './views/clue-customer-search-block';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import SalesClueAddForm from './views/sales-clue-add-form';
import Trace from "LIB_DIR/trace";
import {message, Icon, Row, Col, Button, Alert, Input} from "antd";
import AlwaysShowSelect from "CMP_DIR/always-show-select";
var hasPrivilege = require("CMP_DIR/privilege/checker").hasPrivilege;
var clueCustomerStore = require("./store/clue-customer-store");
var clueCustomerAction = require("./action/clue-customer-action");
// 没有消息的提醒
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
var Spinner = require("CMP_DIR/spinner");
import ClueRightPanel from './views/clue-right-panel';
var userData = require("../../../public/sources/user-data");
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
var phoneMsgEmitter = require("PUB_DIR/sources/utils/emitters").phoneMsgEmitter;
var rightPanelShow = false;
var classNames = require("classnames");
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
import AntcDropdown from "CMP_DIR/antc-dropdown";
var storageUtil = require("LIB_DIR/utils/storage-util.js");
import AlertTimer from "CMP_DIR/alert-timer";
import {SELECT_TYPE} from "./utils/clue-customer-utils";
import CONSTS from  "LIB_DIR/consts";
import AutosizeTextarea from "CMP_DIR/autosize-textarea";
const clueSourceArray = [Intl.get("crm.sales.clue.baidu", "百度搜索"), Intl.get("crm.sales.clue.weibo", "微博推广"), Intl.get("crm.sales.clue.customer.recommend", "客户推荐")];//线索来源
const accessChannelArray = [Intl.get("crm.sales.clue.phone", "400电话"), Intl.get("crm.sales.clue.qq", "营销QQ")];//接入渠道
import clueCustomerAjax from "./ajax/clue-customer-ajax";
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 70,
    BOTTOM_DISTANCE: 70,
};
const ClueCustomer = React.createClass({
    getInitialState: function () {
        return {
            clueAddFormShow: false,//
            rightPanelIsShow: rightPanelShow,//是否展示右侧客户详情
            tableHeight: 630,
            accessChannelArray: accessChannelArray,//线索渠道
            clueSourceArray: clueSourceArray,//线索来源
            ...clueCustomerStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(clueCustomerStore.getState());
    },
    componentDidMount: function () {
        this.changeTableHeight();
        clueCustomerStore.listen(this.onStoreChange);
        clueCustomerAction.getSalesManList();
        //获取线索来源
        this.getClueSource();
        //获取线索渠道
        this.getClueChannel();
        //管理员默认展示待分配的线索客户 0
        if (this.isSalesManager()){
            //域管理员  默认展示待分配的线索客户 status对应0
            clueCustomerAction.setFilterType(SELECT_TYPE.WILL_DISTRIBUTE);
        }else if (this.isOperation()){
            //运营人员  运营人员默认展示全部线索客户 status对应""
            clueCustomerAction.setFilterType(SELECT_TYPE.ALL);
        } else{
            //普通销售 销售默认展示已分配的线索客户 status对应1
            clueCustomerAction.setFilterType(SELECT_TYPE.HAS_DISTRIBUTE);
        }
        //获取线索客户列表
        this.getClueCustomerList();
        var _this = this;
        //点击客户列表某一行时打开对应的详情
        $(".clue_customer_content").on("click", ".clue-customer-list div.list-item", (e) => {
            if ($(e.target).hasClass("call-out") || $(e.target).hasClass("ant-btn-primary") || $(e.target).closest('.trace-content-wrap').length) {
                return;
            };
            Trace.traceEvent($(_this.getDOMNode()).find(".ant-table-tbody"), "打开线索客户详情");
            var $div = $(e.target).closest('.list-item');
            var id = $div.find(".record-id")[0].innerText;
            this.showRightPanel(id);
        });
        this.getUserPhoneNumber();
    },
    componentWillUnmount: function () {
        clueCustomerStore.unlisten(this.onStoreChange);
        this.hideRightPanel();
    },
    getClueSource: function () {
        clueCustomerAjax.getClueSource().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueSourceArray: _.union(this.state.clueSourceArray, data.result)
                });
            }
        }, errorMsg => {
            console.log("获取线索来源出错了 " + errorMsg);
        });
    },
    getClueChannel: function () {
        clueCustomerAjax.getClueChannel().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    accessChannelArray: _.union(this.state.accessChannelArray, data.result)
                });
            }
        }, errorMsg => {
            console.log("获取线索渠道出错了 " + errorMsg);
        });
    },
    showClueAddForm: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".handle-btn-container"), "点击添加销售线索按钮");
        var pageId = CONSTS.PAGE_ID.CLUE_CUSTOMER;
        var clickCount = storageUtil.get("click_add_cluecustomer_count", pageId);
        if (!clickCount) {
            clickCount = 1;
        }
        //点击一次页面加一
        clickCount++;
        storageUtil.set("click_add_cluecustomer_count", clickCount, pageId);
        this.setState({
            clueAddFormShow: true
        });
    },
    //获取用户的坐席号
    getUserPhoneNumber: function () {
        let member_id = userData.getUserData().user_id;
        crmAjax.getUserPhoneNumber(member_id).then((result) => {
            if (result.phone_order) {
                this.setState({
                    callNumber: result.phone_order
                });
            }
        }, (errMsg) => {
            this.setState({
                errMsg: errMsg || Intl.get("crm.get.phone.failed", "获取座机号失败!")
            });
        })
    },
    renderHandleBtn: function () {
        let isWebMini = $(window).width() < LAYOUT_CONSTANTS.SCREEN_WIDTH;//浏览器是否缩小到按钮展示改成图标展示
        let btnClass = "block ";
        btnClass += isWebMini ? "handle-btn-mini" : "handle-btn-container";
        var pageId = CONSTS.PAGE_ID.CLUE_CUSTOMER;
        var clickCount = storageUtil.get("click_add_cluecustomer_count", pageId);
        var containerCls = classNames("add-clue-customer-container", {
            "hide-des": clickCount > 2
        });
        return (
            <div className={containerCls}>
                {hasPrivilege("CUSTOMER_ADD_CLUE") ?
                    <Button type="primary" icon="plus" onClick={this.showClueAddForm}
                            title={Intl.get("crm.sales.add.clue", "添加线索")}>
                        <span className="button-container">{Intl.get("crm.sales.add.clue", "添加线索")}</span>
                    </Button> :
                    null
                }
            </div>
        )
    },
    changeTableHeight: function (filterPanelHeight = 0) {
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        tableHeight -= filterPanelHeight;
        var selectAllAlertHeight = $(".content-block .ant-alert").outerHeight(true);
        if (selectAllAlertHeight) tableHeight -= selectAllAlertHeight;
        this.setState({tableHeight, filterPanelHeight});
    },
    //关闭增加线索面板
    hideClueAddForm: function () {
        this.setState({
            clueAddFormShow: false
        });
    },
    //增加一个
    addOne: function () {
        this.state.isAddFlag = false;
        this.setState(this.state);
    },
    //展示右侧面板
    showRightPanel: function (id) {
        this.state.rightPanelIsShow = true;
        rightPanelShow = true;
        this.setState(this.state);
        clueCustomerAction.setCurrentCustomer(id);
    },
    hideRightPanel: function () {
        this.state.rightPanelIsShow = false;
        rightPanelShow = false;
        this.setState(this.state);
    },
    showNoMoreDataTip: function () {
        return !this.state.isLoading &&
            this.state.curCustomers.length >= 10 && !this.state.listenScrollBottom;
    },
    handleClickCallOut(phoneNumber, record) {
        Trace.traceEvent($(this.getDOMNode()).find(".column-contact-way"), "拨打电话");
        if (this.state.errMsg) {
            message.error(this.state.errMsg || Intl.get("crm.get.phone.failed", " 获取座机号失败!"));
        } else {
            if (this.state.callNumber) {
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        phoneNum: phoneNumber.replace('-', ''),
                        contact: record.contact
                    }
                );
                let reqData = {
                    from: this.state.callNumber,
                    to: phoneNumber.replace('-', '')
                };
                crmAjax.callOut(reqData).then((result) => {
                    if (result.code == 0) {
                        message.success(Intl.get("crm.call.phone.success", "拨打成功"));
                    }
                }, (errMsg) => {
                    message.error(errMsg || Intl.get("crm.call.phone.failed", "拨打失败"));
                });
            } else {
                message.error(Intl.get("crm.bind.phone", "请先绑定分机号！"));
            }
        }
    },
    // 联系方式的列表
    getContactList(text, record, index) {
        let phoneArray = text && text.split('\n') || [];
        var contactWay = "";
        let className = record.phone_repeat ? "customer-repeat" : "";
        if (_.isArray(phoneArray) && phoneArray.length) {
            contactWay = phoneArray.map((item) => {
                if (item) {
                    return (
                        <div>
                            <span>{item}</span>
                            {this.state.callNumber? <i className="iconfont icon-call-out call-out"
                               title={Intl.get("crm.click.call.phone", "点击拨打电话")}
                               onClick={this.handleClickCallOut.bind(this, item, record)}></i>: null}
                        </div>
                    );
                }
            });
        } else if (_.isArray(record.contacts) && record.contacts.length) {
            var contactArr = record.contacts[0];
            contactWay = (<div><span>{contactArr.email || contactArr.qq}</span></div>);
            return contactWay;
        }
        return (
            <div className={className}>
                {contactWay}
            </div>
        );
    },
    //是否是销售领导 或者是域管理员
    isSalesManager() {
        return userData.isSalesManager()
    },
    //是否是运营人员
    isOperation(){
        return userData.hasRole("operations");
    },
    renderSalesBlock() {
        let dataList = [];
            //销售领导、域管理员,展示其所有（子）团队的成员列表
            this.state.salesManList.forEach(function (salesman) {
                let teamArray = salesman.user_groups;
                //一个销售属于多个团队的处理（旧数据中存在这种情况）
                if (_.isArray(teamArray) && teamArray.length) {
                    //销售与所属团队的组合数据，用来区分哪个团队中的销售
                    teamArray.forEach(team => {
                        dataList.push({
                            name: salesman.user_info.nick_name + "(" + team.group_name + ")",
                            value: salesman.user_info.user_id + "&&" + team.group_id
                        })
                    });
                }
            });
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get("crm.17", "请选择销售人员")}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.getSelectSalesName}
                    notFoundContent={dataList.length ? Intl.get("crm.29", "暂无销售") : Intl.get("crm.30", "无相关销售")}
                    dataList={dataList}
                />
            </div>
        );
    },
    //获取已选销售的id
    onSalesmanChange(salesMan){
        clueCustomerAction.setSalesMan({"salesMan": salesMan});
    },
    //获得已选销售的名字
    getSelectSalesName(salesManNames){
        clueCustomerAction.setSalesManName({"salesManNames": salesManNames})
    },

    handleSubmitAssignSales: function (item) {
        if (!this.state.salesMan) {
            clueCustomerAction.setUnSelectDataTip(Intl.get("crm.17", "请选择销售人员"));
            return;
        } else {
            let sale_id = "", team_id = "", sale_name = "", team_name = "";
            //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
            let idArray = this.state.salesMan.split("&&");
            if (_.isArray(idArray) && idArray.length) {
                sale_id = idArray[0];//销售的id
                team_id = idArray[1];//团队的id
            }
            //销售的名字和团队的名字 格式是 销售名称(团队名称)
            let nameArray = this.state.salesManNames.split("(");
            if (_.isArray(nameArray) && nameArray.length) {
                sale_name = nameArray[0];//销售的名字
                team_name = nameArray[1].substr(0, nameArray[1].length - 1);//团队的名字
            }
            var submitObj = {
                "customer_id": item.id,
                "sale_id": sale_id,
                "sale_name": sale_name,
                "team_id": team_id,
                "team_name": team_name,
            };
            clueCustomerAction.distributeCluecustomerToSale(submitObj, (feedbackObj) => {
                if (feedbackObj && feedbackObj.errorMsg){
                    message.error(feedbackObj.errorMsg || Intl.get("failed.to.distribute.cluecustomer","分配线索客户失败"));
                }else{
                    item.user_name = sale_name;
                    item.user_id = sale_id;
                    item.sales_team = team_name;
                    item.sales_team_id = team_id;
                    //隐藏批量变更销售面板
                    this.refs["changesale" + item.id].handleCancel();
                    this.setState({
                        curCustomers: this.state.curCustomers
                    });
                }
            });
        }

    },
    clearSelectSales: function () {
        clueCustomerAction.setSalesMan({"salesMan": ""});
        clueCustomerAction.setSalesManName({"salesManNames": ""})
    },
    //保存跟进内容
    handleSubmitTraceContent(item, e){
        //获取填写的保存跟进记录的内容
        var textareVal = $(e.target).closest("div.trace-content-wrap").find("textarea").val();
        if (!$.trim(textareVal)) {
            this.setState({
                submitTraceErrMsg: Intl.get("cluecustomer.content.not.empty", "跟进内容不能为空")
            });
        } else {
            var submitObj = {
                "customer_id": item.id,
                "remark": textareVal
            };
            clueCustomerAction.addCluecustomerTrace(submitObj, () => {
                item.addTraceContent = false;
                if (_.isArray(item.customer_traces) && item.customer_traces.length) {
                    item.customer_traces[0].remark = textareVal;
                } else {
                    item.customer_traces = [{"remark": textareVal}];
                };
                this.setState({
                    curCustomers: this.state.curCustomers
                })
            });
        }
    },
    //取消保存跟进内容
    handleCancelTraceContent(item){
        item.addTraceContent = false;
        this.setState({
            curCustomers:this.state.curCustomers
        })
    },
    showAddTraceContent(item){
        if (this.state.isEdit) {
            message.warn(Intl.get("clue.customer.save.content", "请先保存或取消保存正在编辑的跟进内容"));
            return;
        } else {
            item.addTraceContent = true;
            this.setState({
                curCustomers:this.state.curCustomers
            })
        }
    },
    updateCluecustomerContent(item, e){
        item.addTraceContent = true;
        var originContent = "";
        if (_.isArray(item.customer_traces) && item.customer_traces.length) {
            originContent = item.customer_traces[0].remark;
        };
        var $updateWrap = $(e.target).closest("div.trace-content-wrap");
        setTimeout(() => {
            $updateWrap.find("textarea").val(originContent);
        });
        this.setState({
            curCustomers:this.state.curCustomers
        })
    },
    //线索客户列表
    renderClueCustomerList(){
        var customerList = this.state.curCustomers;
        var dropDownContent = <Button type="primary" data-tracename="点击分配线索客户按钮">
            {Intl.get("clue.customer.distribute","分配")}
            </Button>;
        //点击增加按钮 补充跟进记录
        var hide = () => {
            this.setState({
                submitTraceErrMsg: '',
            });
        };
        let errorBlock = this.state.submitTraceErrMsg ? (
            <div className="has-error">
                <AlertTimer
                    time={2000}
                    message={this.state.submitTraceErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        ) : null;
        return (
            _.map(customerList, (item, index) => {
                var itemCls = classNames("list-item-content", {
                    "will-distribute": item.status == SELECT_TYPE.WILL_DISTRIBUTE,
                    "has-distribute": item.status == SELECT_TYPE.HAS_DISTRIBUTE,
                    "has-trace": item.status == SELECT_TYPE.HAS_TRACE,
                });
                var listCls = classNames("list-item", {
                    "current-row": this.state.currentId === item.id && rightPanelShow
                });
                var addContent = "", addTime = "";
                if (_.isArray(item.customer_traces) && item.customer_traces.length) {
                    addContent = item.customer_traces[0].remark;
                    addTime = moment(item.customer_traces[0].time).fromNow();
                }
                return (
                    <div className={listCls}>
                        <div className={itemCls}>
                            <Row>
                                <i></i>
                                <Col sm={12} lg={6}>
                                    <div className="customer-info-wrap">
                                        <h4>{item.name}</h4>
                                        <p>{item.source}</p>
                                        <span className="hidden record-id">{item.id}</span>
                                    </div>
                                </Col>
                                <Col sm={6} lg={4}>
                                    <div>{item.contact}</div>
                                    <p>{this.getContactList(item.contact_way, item)}</p>
                                </Col>
                                <Col sm={6} lg={3}>
                                    <div>
                                        {item.source_user_name}
                                    </div>
                                    <p>
                                        {Intl.get("cluecustomer.create.time", "创建于{startTime}", {"startTime": moment(item.start_time).fromNow()})}
                                    </p>
                                </Col>
                                <Col sm={0} lg={3}>
                                    <div>{item.access_channel}</div>
                                    <p>{item.clue_source}</p>
                                </Col>
                                {item.user_name ? <Col sm={18} lg={6}>
                                    <div className="trace-record-wrap">
                                        <p>
                                            {Intl.get("cluecustomer.trace.person", "跟进人")}:{item.user_name}
                                        </p>
                                        <div className="trace-content-wrap">
                                            {item.addTraceContent ?
                                                <div className="edit-trace-content">
                                                    <AutosizeTextarea
                                                        placeholder={Intl.get("clue.customer.add.trace.content","请填写跟进内容")}
                                                        data-tracename="填写跟进内容"
                                                    />
                                                    <span className="buttons">
                                                    {this.state.submitTraceLoading ? (
                                                        <Icon type="loading"/>
                                                    ) : (
                                                        <span>
                <i title={Intl.get("common.save", "保存")} className="inline-block iconfont icon-choose"
                   onClick={this.handleSubmitTraceContent.bind(this, item)} data-tracename="点击保存跟进内容"/>
                <i title={Intl.get("common.cancel", "取消")} className="inline-block iconfont icon-close"
                   onClick={this.handleCancelTraceContent.bind(this, item)} data-tracename="点击取消保存跟进内容"/>
            </span>
                                                    )}
                                                    </span>
                                                    {errorBlock}
                                                </div>
                                                : (addContent ?
                                                    <span>{addContent} {hasPrivilege("CLUECUSTOMER_ADD_TRACE") ? <i className="iconfont icon-update"
                                                                          title={Intl.get("clue.customer.update.content", "编辑跟进内容按钮")}
                                                                          onClick={this.updateCluecustomerContent.bind(this, item)} data-tracename="点击编辑跟进内容"/> : null} </span> :( hasPrivilege("CLUECUSTOMER_ADD_TRACE") ? <span className="trace-content-flag"
                                                                                                                                                          onClick={this.showAddTraceContent.bind(this, item)} data-tracename="点击填写跟进内容按钮">+ {Intl.get("call.record.follow.content", "跟进内容")}</span>: null)
                                                )}

                                        </div>
                                        {addContent ? <p className="trace-time-wrap">
                                            {addTime}
                                        </p> : null}
                                    </div>
                                </Col>: null}
                                {(hasPrivilege("CLUECUSTOMER_DISTRIBUTE_MANAGER") || hasPrivilege("CLUECUSTOMER_DISTRIBUTE_USER")) && this.isSalesManager() ?
                                    <Col sm={6} lg={2}>
                                        <div className="action-button-wrap">
                                            <AntcDropdown
                                                ref={"changesale" + item.id}
                                                content={dropDownContent}
                                                overlayTitle={Intl.get("user.salesman", "销售人员")}
                                                okTitle={Intl.get("crm.32", "变更")}
                                                cancelTitle={Intl.get("common.cancel", "取消")}
                                                isSaving={this.state.distributeLoading}
                                                overlayContent={this.renderSalesBlock()}
                                                handleSubmit={this.handleSubmitAssignSales.bind(this, item)}
                                                unSelectDataTip={this.state.unSelectDataTip}
                                                clearSelectData={this.clearSelectSales}
                                            />
                                        </div>
                                    </Col> : null
                                }
                            </Row>
                        </div>
                    </div>
                )
            })
        )
    },
    handleScrollBarBottom: function () {
        var currListLength = _.isArray(this.state.curCustomers) ? this.state.curCustomers.length : 0;
        // 判断加载的条件
        if (currListLength <= this.state.customersSize) {
            this.getClueCustomerList();
        }
    },
    onTypeChange:function () {
        clueCustomerAction.setLastCustomerId("");
        this.state.rightPanelIsShow = false;
        rightPanelShow = false;
        this.setState(this.state);
        setTimeout(()=>{
            this.getClueCustomerList();
        });
    },
    //获取线索客户列表
    getClueCustomerList: function () {
        //跟据类型筛选
        const typeFilter = JSON.parse(JSON.stringify(clueCustomerStore.getState().clueCustomerTypeFilter));
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(typeFilter);
        const lastCustomerId = clueCustomerStore.getState().lastCustomerId;
        clueCustomerAction.getClueCustomerList(typeFilter, this.state.rangParams, this.state.pageSize, this.state.sorter, lastCustomerId);
    },
    errTipBlock: function () {
        //加载完成，出错的情况
        var errMsg = <span>{this.state.clueCustomerErrMsg}
            <a onClick={this.getClueCustomerList} style={{marginLeft: "20px", marginTop: "20px"}}>
                        <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
                        </a>
                         </span>;
        return (
            <div className="alert-wrap">
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon={true}
                />
            </div>
        );
    },
    renderClueCustomerBlock: function () {
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        if (!this.state.curCustomers.length) {
            //加载完成，没有数据的情况
            return (
                <div className="show-customer-trace">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            )
        } else {
            return (
                <div id="content-block" className="content-block" ref="clueCustomerList">
                    <div className="clue-customer-list"
                         style={{height: divHeight}}
                    >
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                        >
                            {this.renderClueCustomerList()}
                            <NoMoreDataTip
                                show={this.showNoMoreDataTip}
                            />
                        </GeminiScrollbar>
                    </div>
                    {this.state.customersSize ?
                        <div className="clue-customer-total-tip">
                        {Intl.get("crm.207", "共{count}个客户", {"count": this.state.customersSize})}
                    </div> : null}
                </div>
            )
        }
    },
    //更新线索来源列表
    updateClueSource:function (newSource) {
        this.state.clueSourceArray.push(newSource);
        this.setState({
            clueSourceArray:this.state.clueSourceArray
        })
    },
    //更新线索渠道列表
    updateClueChannel:function (newChannel) {
        this.state.accessChannelArray.push(newChannel);
        this.setState({
            accessChannelArray:this.state.accessChannelArray
        })
    },
    render: function () {
        return (
            <RightContent>
                <div className="clue_customer_content" data-tracename="线索客户列表">
                    <FilterBlock>
                        <ClueCustomerFilterBlock
                            ref="clueCustomerFilter"
                            getClueCustomerList={this.getClueCustomerList}
                            clueCustomerValue={this.state.clueCustomerValue}
                            onTypeChange={this.onTypeChange}
                        />
                        {this.renderHandleBtn()}
                        <div className="filter-block-line"></div>
                    </FilterBlock>
                    {this.state.clueAddFormShow ? (
                        <SalesClueAddForm
                            hideAddForm={this.hideClueAddForm}
                            addOne={this.addOne}
                            accessChannelArray={this.state.accessChannelArray}
                            clueSourceArray={this.state.clueSourceArray}
                            updateClueSource={this.updateClueSource}
                            updateClueChannel={this.updateClueChannel}
                        />
                    ) : null}
                    {this.state.isLoading ? (
                        <div className="table-loading-wrap">
                            <Spinner />
                        </div>
                    ) : (this.state.clueCustomerErrMsg ? this.errTipBlock() : (
                        this.renderClueCustomerBlock()
                    ))}
                    {this.state.rightPanelIsShow ? (
                        <ClueRightPanel
                            showFlag={this.state.rightPanelIsShow}
                            currentId={this.state.currentId}
                            hideRightPanel={this.hideRightPanel}
                            refreshCustomerList={this.refreshCustomerList}
                            curCustomer={this.state.curCustomer}
                            accessChannelArray={this.state.accessChannelArray}
                            clueSourceArray={this.state.clueSourceArray}
                            updateClueSource={this.updateClueSource}
                            updateClueChannel={this.updateClueChannel}
                        />
                    ) : null}
                </div>
            </RightContent>
        )
    }
});
module.exports = ClueCustomer;