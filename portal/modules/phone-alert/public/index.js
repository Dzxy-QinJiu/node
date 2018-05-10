/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/28.
 */
var phoneAlertAction = require("./action/phone-alert-action");
var phoneAlertStore = require("./store/phone-alert-store");
var addMoreInfoAction = require("./action/add-more-info-action");
var AlertTimer = require("CMP_DIR/alert-timer");
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
var CrmAction = require("MOD_DIR/crm/public/action/crm-actions");
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
require("./css/index.less");
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
const RESPONSE_LAYOUT_CONSTANTS = {
    MARGIN: 20,//跟进记录展示内容上下的margin值
    TITLE_HEIGHT: 100//客户名称和电话展示的高度
};
const TAG_COLOR = "#223440";
const PHONERINGSTATUS = {
    //刚拨打后的状态
    BUSY: "BUSY",
    //提示拿起话机
    RING: "RING",
    //对方已振铃
    ALERT: "ALERT",
    //对方已应答
    ANSWERED: "ANSWERED",
    //BYE和record均表示挂断的状态
    BYE: "BYE",
    record: "record",
    phone: "phone",//通话结束后，后端推送过来的状态
};
var phoneMsgEmitter = require("../../../public/sources/utils/emitters").phoneMsgEmitter;
class PhoneAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phonemsgObj: this.props.phonemsgObj,//存储后端推送来的不同通话状态的信息
            customerInfoArr: phoneAlertStore.getState().customerInfoArr,//通过电话号码来获取到客户的基本信息
            phoneObj: this.props.phoneObj,//用于存储所拨打的电话和联系人的信息
            addTraceItemId: "",//添加某条跟进记录的id
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
            isConnected: false,//打电话的过程中是否接通了
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情
            isInitialHeight: true, //恢复到初始的高度
        };
    }

    onStoreChange = () => {
        this.setState(phoneAlertStore.getState());
    };

    componentDidMount() {
        Trace.traceEvent("电话弹屏", '弹出电话弹屏');
        phoneMsgEmitter.on(phoneMsgEmitter.CLOSE_PHONE_MODAL, this.closeModal);
        phoneAlertStore.listen(this.onStoreChange);
        //通过系统拨打电话，就直接把客户信息通过emitter发送出来的
        if (this.props.phoneObj && this.props.phoneObj.customerDetail) {
            phoneAlertAction.setCustomerInfoArr(this.props.phoneObj.customerDetail);
        }
        //如果拿不到客户的详情，只能取到客户的id时，通过发请求获取客户的信息
        //如果state上的客户信息存在，并且state上的客户id和传过来的客户id一致的时候，不需要再重新取数据
        if (this.props.phoneObj && this.props.phoneObj.customerId && ((this.state.customerInfoArr.length === 0 || ((this.state.customerInfoArr.length && this.state.customerInfoArr[0].id !== this.props.phoneObj.customerId) )))) {
            phoneAlertAction.getCustomerById(this.props.phoneObj.customerId);
        }
        var phonemsgObj = this.props.phonemsgObj;
        //通过座机拨打时，在alert状态之前的busy状态，不会推送电话号码，此电话在客户列表中存在的状态未知
        if (_.isEmpty(this.props.phoneObj) && phonemsgObj.to) {
            phoneAlertAction.setCustomerUnknown(true);
            sendMessage && sendMessage("座机拨打电话，首次弹屏" + phonemsgObj.to);
            phoneAlertAction.getCustomerByPhone(phonemsgObj.to);
            this.setState({
                phoneNum: phonemsgObj.to
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        var phoneObj = nextProps.phoneObj;
        var phonemsgObj = nextProps.phonemsgObj;
        //如果在打电话的过程中关闭了弹屏，后来的推送状态改变后，又弹出屏幕时，记录下弹屏
        if (!this.state.isModalShown) {
            Trace.traceEvent("电话弹屏", '弹出电话弹屏');
        }
        var customerId = _.isArray(this.state.customerInfoArr) && this.state.customerInfoArr.length ? this.state.customerInfoArr[0].id : "";
        sendMessage && sendMessage("弹屏上展示的客户id" + customerId + "实际联系的电话号码" + phoneObj.phoneNum);
        if (phoneObj && phoneObj.customerDetail) {
            sendMessage && sendMessage("客户列表中的客户id" + phoneObj.customerDetail.id + "实际联系的电话号码" + phoneObj.phoneNum);
            phoneAlertAction.setCustomerInfoArr(phoneObj.customerDetail);
        }
        //如果拿不到客户的详情，只能取到客户的id时，通过发请求获取客户的信息
        //如果state上的客户信息存在，并且state上的客户id和传过来的客户id一致的时候，不需要再重新取数据
        if (phoneObj && phoneObj.customerId && ((this.state.customerInfoArr.length === 0 || (this.state.customerInfoArr.length && this.state.customerInfoArr[0].id !== phoneObj.customerId)))) {
            phoneAlertAction.getCustomerById(phoneObj.customerId);
        }
        //这个判断是为了防止第一个电话拨打完毕后，表示结束的状态未推送过来，当打第二个电话的时候，要把推送过来的状态和页面emitter过来的电话号码进行比较，一致的时候，再把推送内容改到state中
        // 这样能保证在系统内拨号的时候，避免前一个电话的状态影响后一个电话的状态
        //后端推送过来的电话，要么是在电话号码前面加0，要么是把电话的 - 去掉
        //phoneNum 是界面上emitter过来的电话号码
        var phoneNum = phoneObj && phoneObj.phoneNum ? phoneObj.phoneNum.replace("-", "") : "";
        //如果后端推送过来的状态是Bye或者record，电话是在.to 这个属性上，判断这个电话与界面上的电话是否不一样
        var phoneToDiff = phoneNum && phonemsgObj.to && (phonemsgObj.to !== phoneNum && phonemsgObj.to !== "0" + phoneNum);
        //如果推送过来的状态是phone，电话是在.dst 这个属性上，判断这个电话与界面上的电话是否不一样
        var phoneDstDiff = phoneNum && phonemsgObj.dst && (phonemsgObj.dst !== phoneNum && phonemsgObj.dst !== "0" + phoneNum);
        if (phoneToDiff || phoneDstDiff) {
            this.setState({
                phoneObj: phoneObj,
                isModalShown: true,
            });
        } else {
            this.setState({
                phoneObj: phoneObj,
                phonemsgObj: phonemsgObj,
                isModalShown: true,
            });
        }

        //跟进记录的id
        var addTraceItemId = phonemsgObj.id || "";
        if (addTraceItemId) {
            this.setState({
                addTraceItemId: addTraceItemId,
            });
        }
        //通话结束后，包含输入跟进记录的容器的高度需要变大
        if (phonemsgObj.type === PHONERINGSTATUS.record || phonemsgObj.type === PHONERINGSTATUS.BYE || phonemsgObj.type === PHONERINGSTATUS.phone) {
            this.setState({
                isInitialHeight: false
            });
        }

        //页面上如果存在模态框，并且用座机打电话时
        var $modal = $("body >#phone-alert-modal #phone-alert-container");
        //页面存在模态框，再次用座机拨打电话时，先将模态框清除,电话拨号时没有ring状态,第一个状态是alert
        if ($modal && $modal.length > 0 && phonemsgObj.type == PHONERINGSTATUS.ALERT && ((this.state.phonemsgObj.type == PHONERINGSTATUS.record) || (this.state.phonemsgObj.type == PHONERINGSTATUS.BYE) || (this.state.phonemsgObj.type == PHONERINGSTATUS.phone))) {
            //把数据全部进行重置，不可以用this.setState.这样会有延时，界面展示的还是之前的数据
            this.state.phoneNum = phonemsgObj.to;
            this.state.phoneObj = {};
            this.state.phonemsgObj = phonemsgObj;
            this.state.isAddFlag = false;
            this.state.rightPanelIsShow = false;
            this.state.isConnected = false;
            this.state.addTraceItemId = "";
            this.state.isInitialHeight = true;
            this.setState(this.state);
            //恢复初始数据
            phoneAlertAction.setInitialState();
            phoneAlertAction.getCustomerByPhone(phonemsgObj.to);
            sendMessage && sendMessage("座机拨打电话，之前弹屏已打开" + phonemsgObj.to);
            this.props.setInitialPhoneObj();
        }
        //通过座机拨打电话，区分已有客户和要添加的客户,必须要有to这个字段的时候
        //.to是所拨打的电话
        if (phonemsgObj.to && _.isEmpty(phoneObj) && this.state.customerInfoArr.length == 0) {
            sendMessage && sendMessage("座机拨打电话，弹屏已打开过" + phonemsgObj.to);
            phoneAlertAction.getCustomerByPhone(phonemsgObj.to);
            this.setState({
                phoneNum: phonemsgObj.to
            });
        }
        //如果接听后，把状态isConnected 改为true
        if (phonemsgObj.type == PHONERINGSTATUS.ANSWERED) {
            this.setState({
                isConnected: true
            });
        }
    }

    componentWillUnmount() {
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CLOSE_PHONE_MODAL, this.closeModal);
        phoneAlertStore.unlisten(this.onStoreChange);
    }

    //获取页面上的描述
    getPhoneTipMsg(phonemsgObj) {
        var customerInfoArr = this.state.customerInfoArr;
        var phoneObj = this.state.phoneObj;
        var customerName = customerInfoArr[0] ? customerInfoArr[0].name : "";
        //拨号的描述
        //如果是系统内拨号，展示联系人和电话，如果是从座机拨号，只展示所拨打的电话
        var phonedesObj = phoneObj.contact && phoneObj.phoneNum ? (phoneObj.contact + "—" + phoneObj.phoneNum ) : (phoneObj.contact || phoneObj.phoneNum || this.state.phoneNum || customerName );
        var desTipObj = {
            phonedesObj: phonedesObj,
            tip: ""
        };
        if (phonemsgObj.type == PHONERINGSTATUS.RING) {
            desTipObj.tip = `${Intl.get("call.record.pick.phone", "请拿起话机")}`;
        } else if (phonemsgObj.type == PHONERINGSTATUS.ALERT) {
            desTipObj.tip = `${Intl.get("call.record.phone.alerting", "已振铃，等待对方接听")}`;
        } else if (phonemsgObj.type == PHONERINGSTATUS.ANSWERED) {
            desTipObj.tip = `${Intl.get("call.record.phone.answered", "正在通话中")}`;
        } else if (phonemsgObj.type == PHONERINGSTATUS.BYE || phonemsgObj.type == PHONERINGSTATUS.record || phonemsgObj.type == PHONERINGSTATUS.phone) {
            desTipObj.tip = `${Intl.get("call.record.phone.unknown", "结束通话")}`;
        }
        return desTipObj;
    }

    closeModal = () => {
        var $modal = $("body >#phone-alert-modal #phone-alert-container");
        if ($modal && $modal.length > 0) {
            this.setState({
                isModalShown: false,
                isAddFlag: false,
            });
            //在最后阶段，将数据清除掉
            if (this.state.phonemsgObj && (this.state.phonemsgObj.type == PHONERINGSTATUS.phone || this.state.phonemsgObj.type == PHONERINGSTATUS.BYE || this.state.phonemsgObj.type == PHONERINGSTATUS.record)) {
                //恢复初始数据
                phoneAlertAction.setInitialState();
                this.props.setInitialPhoneObj();
                this.setState({
                    phoneNum: "",
                    rightPanelIsShow: false,
                    isConnected: false,
                    addTraceItemId: ""
                });
            }
        }
    };

    renderTraceItem() {
        var onHide = function () {
            phoneAlertAction.setSubmitErrMsg("");
        };
        //通话记录的编辑状态
        if (this.state.isEdittingTrace) {
            return (
                <div>
                    <div className="input-item">
                        <textarea placeholder="请填写本次跟进内容" onChange={this.handleInputChange}
                                  value={this.state.inputContent}/>
                    </div>
                    <div className="modal-submit-tip">
                        {this.state.submittingTraceMsg ? (
                            <AlertTimer time={3000}
                                        message={this.state.submittingTraceMsg}
                                        type="error" showIcon
                                        onHide={onHide}
                            />
                        ) : null}
                    </div>
                    <Button type="primary" className="modal-submit-btn" onClick={this.handleTraceSubmit}
                            data-tracename="保存跟进记录">
                        {this.state.submittingTrace ? (Intl.get("retry.is.submitting", "提交中...")) : (Intl.get("common.save", "保存"))}
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="trace-content">
                    <span>{this.state.inputContent}</span>
                    <i className="iconfont icon-update" onClick={this.handleEditContent}></i>
                </div>
            );
        }
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
            isAddFlag: false
        });
        phoneAlertAction.setAddCustomer(false);
        phoneAlertAction.setEditStatus({isEdittingTrace: true, submittingTraceMsg: ""});
        phoneAlertAction.setAddCustomerInfo(addCustomerInfo);
    };
    retryGetCustomer = () => {
        if (this.props.phoneObj && this.props.phoneObj.customerId) {
            phoneAlertAction.getCustomerById(this.props.phoneObj.customerId);
        } else {
            var phoneNum = this.state.phonemsgObj.to || this.state.phoneNum;
            sendMessage && sendMessage("座机拨打电话，重新获取客户" + phoneNum);
            phoneAlertAction.getCustomerByPhone(phoneNum);
        }

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

    //渲染客户的基本信息
    renderCustomerInfor(phonemsgObj) {
        //客户是否存在，情况未知
        if (this.state.getCustomerErrMsg) {
            return (
                <span className="failed-to-get-customer">
                    {Intl.get("crm.phone.failed.get.customer", "查询此号码对应的客户信息失败")}
                    <a onClick={this.retryGetCustomer} data-tracename="点击重试按钮">
                        {Intl.get("user.info.retry", "请重试")}
                    </a>
                </span>
            );
        } else if (this.state.customerUnknown) {
            return null;
        } else if (this.state.addCustomer) {
            //客户不存在时，展示添加客户的按钮
            return (
                <span className="handle-btn-container" onClick={this.showAddCustomerForm}>
                    {Intl.get("crm.3", "添加客户")}
                </span>
            );
        } else if (!this.state.addCustomer) {
            //客户存在时，展示详情
            var divHeight = "";
            if ((phonemsgObj.type == PHONERINGSTATUS.phone) && (!this.state.customerUnknown && !this.state.addCustomer)) {
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
                    </GeminiScrollbar>
                </div>
            );
        }
    }

    //提交跟进记录
    handleTraceSubmit = () => {
        var customer_id = this.state.customerInfoArr[0].id;
        if (!this.state.addTraceItemId) {
            phoneAlertAction.setSubmitErrMsg(Intl.get("phone.delay.save", "通话记录正在同步，请稍等再保存！"));
            return;
        }
        const submitObj = {
            id: this.state.addTraceItemId,
            customer_id: customer_id,
            type: "phone",
            last_callrecord: "true",
            remark: this.state.inputContent
        };
        phoneAlertAction.updateCustomerTrace(submitObj, () => {
            let updateData = {customer_id: customer_id, remark: this.state.inputContent};
            if (this.state.isConnected) {
                //如果电话已经接通
                updateData.last_contact_time = new Date().getTime();
            }
            CrmAction.updateCurrentCustomerRemark(updateData);
            var height = $(".trace-content").outerHeight(true);
            $("body #phone-alert-modal .phone-alert-modal-content .trace-content-container").animate({height: height + RESPONSE_LAYOUT_CONSTANTS.MARGIN});
            $("body #phone-alert-modal .phone-alert-modal-content .phone-alert-modal-title").animate({height: height + RESPONSE_LAYOUT_CONSTANTS.TITLE_HEIGHT + RESPONSE_LAYOUT_CONSTANTS.MARGIN});
            this.setState({
                showAddFeedback: true,
                customerLayoutHeight: $(window).height() - height - RESPONSE_LAYOUT_CONSTANTS.TITLE_HEIGHT - RESPONSE_LAYOUT_CONSTANTS.MARGIN - DIVLAYOUT.TRACE_CONTAINER_PADDING
            });
        });
    };
    //将输入框中的文字放在state上
    handleInputChange = (e) => {
        phoneAlertAction.setContent(e.target.value);
    };
    handleEditContent = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find(".icon-update"), "点击编辑跟进记录按钮");
        phoneAlertAction.setEditStatus({isEdittingTrace: true, submittingTraceMsg: ""});
    };
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
        //获取页面描述
        var phoneMsgObj = this.getPhoneTipMsg(phonemsgObj);

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
                            {!this.state.customerUnknown && !this.state.isAddFlag ? (
                                !this.state.customerInfoArr.length ? (
                                    <span>{Intl.get("call.record.no.response.customer", "此号码无对应客户")}</span>) : (<span>
                                        {Intl.get("call.record.some.customer", "此号码对应{num}个客户", {num: this.state.customerInfoArr.length})}
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
        var _this = this;
        var phonemsgObj = this.state.phonemsgObj;
        var iconFontCls = "modal-icon iconfont";

        //有监听到推送消息时再渲染出页面
        if (_.isEmpty(phonemsgObj)) {
            return;
        }
        //获取页面描述
        var phoneMsgObj = this.getPhoneTipMsg(phonemsgObj);
        if (phonemsgObj.type == PHONERINGSTATUS.BUSY) {
            iconFontCls += " icon-phone-busy";
        } else if (phonemsgObj.type == PHONERINGSTATUS.RING) {
            iconFontCls += " icon-call-out";
        } else if (phonemsgObj.type == PHONERINGSTATUS.ALERT) {
            iconFontCls += " icon-phone-waiting";
        } else if (phonemsgObj.type == PHONERINGSTATUS.ANSWERED) {
            iconFontCls += " icon-phone-answering";
        } else if (phonemsgObj.type == PHONERINGSTATUS.BYE || phonemsgObj.type == PHONERINGSTATUS.record || phonemsgObj.type == PHONERINGSTATUS.phone) {
            iconFontCls += " icon-phone-bye";
            //打完电话后，并且不是在编辑状态下，已有客户增加跟进记录，自动将textare增大
            if (!this.state.customerUnknown && !this.state.addCustomer && !this.state.submittingTraceMsg) {
                $("body #phone-alert-modal .phone-alert-modal-content .trace-content-container").animate({height: DIVLAYOUT.TRACELAYOUT});
                $("body #phone-alert-modal .phone-alert-modal-content .phone-alert-modal-title").animate({height: DIVLAYOUT.TRACE_CONTAINER_LAYOUT});
            }
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
                            <div className={PhoneAlertModalTitleCls}>
                                <span id="iconfont-tip">
                                    <i className={iconFontCls}></i>
                                </span>
                                <span className="contact-phone-title">
                                    {phoneMsgObj.phonedesObj}
                                </span>
                                <span className="status-tip-title">
                                    {phoneMsgObj.tip}
                                </span>
                                <div className="trace-content-container">
                                    {(!this.state.customerUnknown && !this.state.addCustomer) ? this.renderTraceItem() : null}
                                </div>
                                {!this.state.isAddingMoreProdctInfo && this.state.showAddFeedback ? (
                                    <div className="add-more-info-container">
                                        <Tag color={TAG_COLOR} onClick={this.handleAddProductFeedback}>
                                            + {Intl.get("call.record.product.feedback", "产品反馈")}</Tag>
                                    </div>
                                ) : null}
                            </div>
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
    phoneObj: {},
    setInitialPhoneObj: function () {
    }
};
export default PhoneAlert;