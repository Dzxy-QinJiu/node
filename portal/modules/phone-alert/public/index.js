/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/28.
 */
var phoneAlertAction = require("./action/phone-alert-action");
var phoneAlertStore = require("./store/phone-alert-store");
var addMoreInfoAction = require("./action/add-more-info-action");
var userData = require("PUB_DIR/sources/user-data");
var CrmRightPanel = require('MOD_DIR/crm/public/views/crm-right-panel');
var classNames = require("classnames");
import AddCustomerForm from 'CMP_DIR/add-customer-form';
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
import crmUtil from "MOD_DIR/crm/public/utils/crm-util";
import AddMoreInfo from "./view/add-more-info";
import {Button, Tag} from "antd";
import Trace from "LIB_DIR/trace";
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
import {isEqualArray} from "LIB_DIR/func";
require("./css/index.less");
import PhoneStatusTop from "./view/phone-status-top";
const DIVLAYOUT = {
    //出现跟进内容输入框后的高度
    TRACELAYOUT: 160,
    //顶部初始的高度
    INITIALTRACELAYOUT: 86,
    //弹屏上部标题和输入框,添加按钮高度之和
    TRACE_CONTAINER_LAYOUT: 250,
    //弹屏上下的padding之和
    TRACE_CONTAINER_PADDING: 105,
    //弹屏上部标题的高度
    TRACE_INITIAL_CONTAINER_LAYOUT: 126
};
const Add_CUSTOMER_LAYOUT_CONSTANTS = {
    TOP_DELTA: 140,//顶部提示框的高度
    BOTTOM_DELTA: 20//底部的padding
};
const PHONERINGSTATUS = {
    //对方已振铃
    ALERT: "ALERT",
    //对方已应答
    ANSWERED: "ANSWERED",
    phone: "phone",//通话结束后，后端推送过来的状态
};
var phoneRecordObj = {
    callid: "",//通话的id
    received_time: ""//通话时间
};
var phoneMsgEmitter = require("../../../public/sources/utils/emitters").phoneMsgEmitter;
class PhoneAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phonemsgObj: this.props.phonemsgObj,//存储后端推送来的不同通话状态的信息
            customerInfoArr: phoneAlertStore.getState().customerInfoArr,//通过电话号码来获取到客户的基本信息
            // addTraceItemId: "",//添加某条跟进记录的id
            isModalShown: true,//是否显示模态框
            phoneNum: "",//话机打电话时的电话号码
            isAddFlag: false,//是否展示添加客户的右侧面板
            rightPanelIsShow: false,//是否展示右侧客户详情面板
            curCustomerId: "",//已存在客户的id
            scrollLayOut: Add_CUSTOMER_LAYOUT_CONSTANTS.BOTTOM_DELTA + Add_CUSTOMER_LAYOUT_CONSTANTS.TOP_DELTA,
            isAddingMoreProdctInfo: false,//是否添加产品反馈，待办事项，和竞品信息
            isAddingAppFeedback: "",//添加客户反馈的状态,共三种状态，loading success error
            addAppFeedbackErrMsg: "",//添加客户反馈失败后的提示
            customerLayoutHeight: 0,//跟进记录内容确定后，下面客户详情所占的大小
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情
            isInitialHeight: true, //恢复到初始的高度
            addCustomer:false,//是否需要添加客户 true代码需要添加客户，false代表不需要添加客户
            // selectedCustomerId:"",//跟进记录要绑定的客户
        };
    }

    onStoreChange = () => {
        this.setState(phoneAlertStore.getState());
    };

    componentDidMount() {
        Trace.traceEvent("电话弹屏", '弹出电话弹屏');
        phoneMsgEmitter.on(phoneMsgEmitter.CLOSE_PHONE_MODAL, this.closeModal);
        phoneAlertStore.listen(this.onStoreChange);
        var phonemsgObj = this.props.phonemsgObj;
        //根据客户的id获取客户的详情
        this.getCustomerInfoByCustomerId(phonemsgObj);
        //如果是打入的电话，要查来电的号码，如果是拨出的电话，要查所拨打的电话
        var phoneNum = "";
        if (phonemsgObj.call_type == "IN") {
            phoneNum = phonemsgObj.extId;
        } else {
            phoneNum = phonemsgObj.to || phonemsgObj.dst;
        }
        this.setState({
            phoneNum: phoneNum
        });
        //记录一下拨打电话的时间及通话的id
        phoneRecordObj.callid = phonemsgObj.callid;
        phoneRecordObj.received_time = phonemsgObj.recevied_time;
    }

    componentWillReceiveProps(nextProps) {
        var phonemsgObj = nextProps.phonemsgObj;
            //获取客户详情
            if (phonemsgObj.recevied_time > phoneRecordObj.received_time){
                if(phonemsgObj.callid === phoneRecordObj.callid){
                    phoneRecordObj.received_time = phonemsgObj.recevied_time;
                }else{
                    phoneRecordObj.received_time = phonemsgObj.recevied_time;
                    phoneRecordObj.callid = phonemsgObj.callid;
                    phoneAlertAction.setInitialCustomerArr();
                    this.getCustomerInfoByCustomerId(phonemsgObj);
                }
                this.setState({
                    isModalShown:true,
                    phonemsgObj:phonemsgObj
                });
            }
            //如果在打电话的过程中关闭了弹屏，后来的推送状态改变后，又弹出屏幕时，记录下弹屏
            if (!this.state.isModalShown) {
                Trace.traceEvent("电话弹屏", '弹出电话弹屏');
            }
            //通话结束后，包含输入跟进记录的容器的高度需要变大
            if (phonemsgObj.type === PHONERINGSTATUS.phone && (this.state.customerInfoArr.length)) {
                this.setState({
                    isInitialHeight: false
                });
            }
            //页面上如果存在模态框，再次拨打电话的时候
            var $modal = $("body >#phone-alert-modal #phone-alert-container");
            if ($modal && $modal.length > 0 && (phonemsgObj.type == PHONERINGSTATUS.ALERT) && (this.state.phonemsgObj.type == PHONERINGSTATUS.phone)) {
                this.setInitialData(phonemsgObj);
            }
    }
    setInitialData(phonemsgObj){
        var phoneNum = "";
        if (phonemsgObj.call_type == "IN"){
            phoneNum = phonemsgObj.extId;
        }else{
            phoneNum = phonemsgObj.to || phonemsgObj.dst;
        }
        //把数据全部进行重置，不可以用this.setState.这样会有延时，界面展示的还是之前的数据
        this.state.phoneNum = phoneNum;
        this.state.phonemsgObj = phonemsgObj;
        this.state.isAddFlag = false;
        this.state.rightPanelIsShow = false;
        this.state.isInitialHeight = true;
        this.setState(this.state);
        //恢复初始数据
        phoneAlertAction.setInitialState();
        sendMessage && sendMessage("座机拨打电话，之前弹屏已打开" + phoneNum);
        this.props.setInitialPhoneObj();
    }
    closeModal = () => {
        var $modal = $("body >#phone-alert-modal #phone-alert-container");
        if ($modal && $modal.length > 0) {
            this.setState({
                isModalShown: false,
                isAddFlag: false,
            });
            //在最后阶段，将数据清除掉
            if (this.state.phonemsgObj && (this.state.phonemsgObj.type == PHONERINGSTATUS.phone)) {
                //恢复初始数据
                phoneAlertAction.setInitialState();
                this.setState({
                    phoneNum: "",
                    rightPanelIsShow: false,
                    isInitialHeight:true,
                });
            }
        }
    };

    componentWillUnmount() {
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CLOSE_PHONE_MODAL, this.closeModal);
        phoneAlertStore.unlisten(this.onStoreChange);
    }

    showAddCustomerForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find(".handle-btn-container"), "点击添加客户按钮");
        this.setState({
            isAddFlag: true
        });
    };
    hideAddForm = () => {
        this.setState({
            isAddFlag: false
        });
    };
    updateCustomer = (addCustomerInfo) => {
        this.setState({
            isAddFlag: false,
            addCustomer:false
        });
        phoneAlertAction.setEditStatus({isEdittingTrace: true, submittingTraceMsg: ""});
        phoneAlertAction.setAddCustomerInfo(addCustomerInfo);
    };
    //根据客户的id获取客户详情
    getCustomerInfoByCustomerId(phonemsgObj){
        if (_.isArray(phonemsgObj.customers)){
            if (phonemsgObj.customers.length){
                _.each(phonemsgObj.customers,(item)=>{
                    phoneAlertAction.getCustomerById(item.id);
                });
            }
        }
    }
    retryGetCustomer = () => {
        //根据客户的id获取客户详情
        this.getCustomerInfoByCustomerId(this.state.phonemsgObj);
    };
    //展示已有客户的右侧面板
    showRightPanel = (id) => {
        // 舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        this.setState({
            rightPanelIsShow: true,
            curCustomerId: id
        });
    };
    //关闭已有客户的右侧面板
    hideRightPanel = () => {
        this.setState({
            rightPanelIsShow: false
        });
    };
    //获取行政级别
    getAdministrativeLevel(levelId) {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id == levelId);
        return levelObj ? levelObj.level : "";
    }
    renderNotYourCustomer(){
        //如果获取的客户列表数量小于后端传来的客户数量，证明此电话也属于别的销售
        var customerInfoArr = this.state.customerInfoArr;
        var totalCustomerArr = this.state.phonemsgObj.customers;
        var otherCustomerArr =  [];
        if (_.isArray(customerInfoArr) && _.isArray(totalCustomerArr) && customerInfoArr.length < totalCustomerArr.length){
            var customerIdArr = _.pluck(customerInfoArr, 'id');
            _.each(totalCustomerArr, (customerItem)=>{
                if (_.indexOf(customerIdArr, customerItem.id) < 0){
                    otherCustomerArr.push(customerItem);
                }
            });
        }
        if (otherCustomerArr.length){
            return (
                <div className="other-customer-container">
                    {_.map(otherCustomerArr,(item)=>{
                        return (
                            <span>
                                {Intl.get("clue.customer.belong.to.other.sales", "该电话属于客户{customer}，所属销售{sales}",{"customer":item.name,"sales":item.user_name})}
                            </span>
                        );
                    })}
                </div>
            );

        }else{
            return null;
        }
    }
    //渲染客户的基本信息
    renderCustomerInfor(phonemsgObj) {
        //客户是否存在，情况未知
        if (this.state.getCustomerErrMsg) {
            //根据客户id获取客户详情失败
            return (
                <span className="failed-to-get-customer">
                    {Intl.get("crm.phone.failed.get.customer", "查询此号码对应的客户信息失败")}
                    <a onClick={this.retryGetCustomer} data-tracename="点击重试按钮">
                        {Intl.get("user.info.retry", "请重试")}
                    </a>
                </span>
            );
        }else if (_.isArray(this.state.phonemsgObj.customers) && this.state.phonemsgObj.customers.length == 0 && !this.state.customerInfoArr.length) {
            //客户不存在时，展示添加客户的按钮
            return (
                <span className="handle-btn-container" onClick={this.showAddCustomerForm}>
                    {Intl.get("crm.3", "添加客户")}
                </span>
            );
        } else if ((_.isArray(this.state.phonemsgObj.customers) && this.state.phonemsgObj.customers.length != 0) || this.state.customerInfoArr.length) {
            //客户存在时，展示详情
            var divHeight = "";
            if ((phonemsgObj.type == PHONERINGSTATUS.phone) && (this.state.customerInfoArr.length)) {
                //顶部textare输入框展开后
                if (!this.state.isEdittingTrace && this.state.customerLayoutHeight) {
                    divHeight = this.state.customerLayoutHeight;
                } else {
                    divHeight = $(window).height() - DIVLAYOUT.TRACE_CONTAINER_PADDING - DIVLAYOUT.TRACE_CONTAINER_LAYOUT;
                }
            } else {
                //顶部textare输入框未显示
                divHeight = $(window).height() - DIVLAYOUT.TRACE_CONTAINER_PADDING - DIVLAYOUT.TRACE_INITIAL_CONTAINER_LAYOUT;
            }
            return (
                <div style={{'height': divHeight}} className="scrollbar-container">
                    <GeminiScrollbar>
                        {
                            _.map(this.state.customerInfoArr, (item) => {
                                var location = [];
                                if (item.province) {
                                    location.push(item.province);
                                }
                                if (item.city) {
                                    location.push(item.city);
                                }
                                if (item.county) {
                                    location.push(item.county);
                                }
                                return (
                                    <div className="customer-name">
                                        <h3>
                                            <i className="iconfont icon-interested"></i>
                                            <span>{item.name}</span>
                                        </h3>
                                        <dl className="customer-info">
                                            <dt>
                                                {Intl.get("realm.industry", "行业")}:
                                            </dt>
                                            <dd>
                                                {item.industry}
                                            </dd>
                                        </dl>
                                        <dl className="customer-info">
                                            <dt>
                                                {Intl.get("realm.address", "地址")}:
                                            </dt>
                                            <dd>
                                                <span>{location.join("-")}</span>
                                                &nbsp;&nbsp;<span>{item.address}</span>
                                            </dd>
                                        </dl>
                                        <dl className="customer-info">
                                            <dt>
                                                {Intl.get("crm.administrative.level", "行政级别")}:
                                            </dt>
                                            <dd>
                                                {this.getAdministrativeLevel(item.administrative_level)}
                                            </dd>
                                        </dl>
                                        <dl className="customer-info">
                                            <dt>
                                                {Intl.get("call.record.customer.source", "来源")}:
                                            </dt>
                                            <dd>
                                                {item.source}
                                            </dd>
                                        </dl>
                                        <dl className="customer-info">
                                            <dt>
                                                {Intl.get("common.tag", "标签")}:
                                            </dt>
                                            <dd className="tag">
                                                {_.map((item.labels), (label) => {
                                                    return (
                                                        <Tag>{label}</Tag>);
                                                })}
                                            </dd>
                                        </dl>
                                        <dl className="customer-info remark">
                                            <dt>
                                                {Intl.get("common.remark", "备注")}:
                                            </dt>
                                            <dd>
                                                {item.remarks}
                                            </dd>
                                        </dl>
                                        <p className="show-customer-detail">
                                            <Button type="primary" onClick={this.showRightPanel.bind(this, item.id)}
                                                    data-tracename="点击查看客户详情">
                                                {Intl.get("call.record.show.customer.detail", "查看详情")}
                                            </Button>
                                        </p>
                                    </div>
                                );
                            })
                        }
                        {this.renderNotYourCustomer()}
                    </GeminiScrollbar>
                </div>
            );
        }
    }
    //修改客户的基本信息
    editCustomerBasic = (newBasic) => {
        if (newBasic && newBasic.id) {
            let updateCustomer = _.find(this.state.customerInfoArr, customer => customer.id == newBasic.id);
            for (var key in newBasic) {
                if (newBasic[key] || newBasic[key] == "") {
                    updateCustomer[key] = newBasic[key];
                }
            }
        }
    };
    //点击添加产品反馈
    handleAddProductFeedback = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find(".add-more-info-container"), '点击添加反馈按钮');
        this.setState({
            isAddingMoreProdctInfo: true,
        });
    };
    //点击取消按钮
    handleCancel = () => {
        this.setState({
            isAddingMoreProdctInfo: false,
            isAddingAppFeedback: "",
            addAppFeedbackErrMsg: ""
        });
    };
    //点击提交按钮
    handleSubmit = (submitObj) => {
        this.addAppFeedback(submitObj);
    };
    //提交应用反馈
    addAppFeedback(submitObj) {
        this.setState({
            isAddingAppFeedback: "loading",
            addAppFeedbackErrMsg: "",
        });
        addMoreInfoAction.addAppFeedback(submitObj, (result) => {
            if (_.isArray(result)) {
                //保存成功
                this.setState({
                    isAddingAppFeedback: "success",
                    addAppFeedbackErrMsg: ""
                });
            } else if (_.isString(result)) {
                // 保存失败
                this.setState({
                    isAddingAppFeedback: "error",
                    addAppFeedbackErrMsg: result
                });
            }
        });
    }

    renderMainContent() {
        var phonemsgObj = this.state.phonemsgObj;
        if (this.state.isAddingMoreProdctInfo) {
            //添加产品反馈，竞品信息
            return (
                <AddMoreInfo
                    handleCancel={this.handleCancel}
                    handleSubmit={this.handleSubmit}
                    isAddingAppFeedback={this.state.isAddingAppFeedback}
                    addAppFeedbackErrMsg={this.state.addAppFeedbackErrMsg}
                />
            );
        } else if (this.state.isAddFlag) {
            var phoneNum = this.state.phoneNum || this.state.phonemsgObj.to;
            //添加客户表单
            return (
                <AddCustomerForm
                    phoneNum={phoneNum}
                    hideAddForm={this.hideAddForm}
                    updateCustomer={this.updateCustomer}
                    showRightPanel={this.showRightPanel}
                    scrollLayOut={this.state.scrollLayOut}
                />
            );
        } else {
            //客户信息展示或者添加客户按钮
            return (
                <div className="customer-info-container">
                    <div>
                        <div className="customer-count-tip">
                            {/*客户是否存在状态已知并且未点击添加客户按钮*/}
                            {!this.state.isAddFlag && (_.isArray(this.state.phonemsgObj.customers)) ? (
                                !this.state.phonemsgObj.customers.length && !this.state.customerInfoArr.length ? (
                                    <span>{Intl.get("call.record.no.response.customer", "此号码无对应客户")}</span>) : (<span>
                                        {Intl.get("call.record.some.customer", "此号码对应{num}个客户", {num: this.state.phonemsgObj.customers.length || this.state.customerInfoArr.length})}
                                    </span>)
                            ) : null}
                        </div>
                        <div className="customer-detail">{this.renderCustomerInfor(phonemsgObj)}</div>
                    </div>
                </div>
            );
        }
    }

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });

    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    };

    render() {
        var phonemsgObj = this.state.phonemsgObj;
        //有监听到推送消息时再渲染出页面
        if (_.isEmpty(phonemsgObj)) {
            return;
        }
        var AddMoreInfoCls = classNames({
            'phone-alert-modal-inner': true,
            'add-more-info': this.state.isAddingMoreProdctInfo
        });
        var PhoneAlertModalTitleCls = classNames({
            'phone-alert-modal-title': true,
            'initial-height': this.state.isInitialHeight
        });
        return (
            <div data-tracename="电话弹屏">
                {this.state.isModalShown ? (<div id="phone-alert-container">
                    <div className="phone-alert-modal-block"></div>
                    <div className="phone-alert-modal-content">
                        <button className="modal-close iconfont icon-close" type="button"
                                onClick={this.closeModal} data-tracename="关闭电话弹屏"></button>
                        <div className={AddMoreInfoCls}>
                            <PhoneStatusTop
                                phoneAlertModalTitleCls= {PhoneAlertModalTitleCls}
                                phonemsgObj={phonemsgObj}
                                handleAddProductFeedback={this.handleAddProductFeedback}
                                isModalShown={this.state.isModalShown}
                            />
                            <div className="phone-alert-inner-content">
                                {this.renderMainContent()}
                            </div>
                        </div>
                    </div>
                </div>) : null}
                {/*添加客户时，如果该客户存在，需要展示该已有客户的详情*/}
                {this.state.rightPanelIsShow ? (
                    <CrmRightPanel
                        showFlag={this.state.rightPanelIsShow}
                        currentId={this.state.curCustomerId}
                        hideRightPanel={this.hideRightPanel}
                        refreshCustomerList={function () {
                        }}
                        editCustomerBasic={this.editCustomerBasic}
                        ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                    />) : null}
                {/*该客户下的用户列表*/}
                {this.state.isShowCustomerUserListPanel ? <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    { this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={this.state.CustomerInfoOfCurrUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={this.state.CustomerInfoOfCurrUser.name}
                        /> : null
                    }
                </RightPanel> : null}
            </div>
        );
    }
}

PhoneAlert.defaultProps = {
    phonemsgObj: {},
    setInitialPhoneObj: function () {
    }
};
export default PhoneAlert;