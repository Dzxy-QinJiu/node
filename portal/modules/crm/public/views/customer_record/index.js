/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var language = require("../../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../../css/customer-trace-es_VE.less");
} else if (language.lan() == "zh") {
    require("../../css/customer-trace-zh_CN.less");
}
import {Icon, Select, Alert, Button, message, Radio, Input, Menu, Dropdown} from 'antd';
const RadioGroup = Radio.Group;
const {TextArea} = Input;
var AlertTimer = require("../../../../../components/alert-timer");
import CustomerRecordActions from '../../action/customer-record-action';
import CustomerRecordStore from '../../store/customer-record-store';
var crmUtil = require("./../../utils/crm-util");
var GeminiScrollbar = require("../../../../../components/react-gemini-scrollbar");
var Spinner = require("../../../../../components/spinner");
import ModalDialog from "CMP_DIR/ModalDialog";
import Trace from "LIB_DIR/trace";
import commonMethodUtil from "PUB_DIR/sources/utils/common-method-util";
import ajax from "../../ajax/contact-ajax";
//获取无效电话的列表  设置某个电话为无效电话
import {getInvalidPhone, addInvalidPhone} from "LIB_DIR/utils/invalidPhone";
import AudioPlayer from "CMP_DIR/audioPlayer";
import SaveCancelButton from "CMP_DIR/detail-card/save-cancel-button";
import TimeUtil from "PUB_DIR/sources/utils/time-format-util";
var classNames = require("classnames");
//用于布局的高度
const LAYOUT_CONSTANTS = {
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8, //跟进记录页的下边距
    ADD_TRACE_HEIGHHT: 155,//添加跟进记录面板的高度
    TOP_TOTAL_HEIGHT: 30,//共xxx条的高度
    OVER_VIEW_TITLE_HEIGHT: 15//概览页”最新跟进“的高度
};

// 通话状态
const CALL_STATUS_MAP = {
    'ALL': Intl.get("common.all", "全部"),
    'ANSWERED': Intl.get("call.record.state.answer", "已接听"),
    'NO ANSWER': Intl.get("call.record.state.no.answer", "未接听"),
    'BUSY': Intl.get("call.record.state.busy", "用户忙")
};

// 通话类型
const CALL_TYPE_MAP = {
    'all': Intl.get("common.all", "全部"),
    'phone': Intl.get("customer.phone.system", "电话系统"),
    'app': Intl.get("customer.ketao.app", "客套app"),
    'visit': Intl.get("customer.visit", "拜访"),
    'other': Intl.get("customer.other", "其他")
};

const CustomerRecord = React.createClass({
    getInitialState: function () {
        return {
            playingItemAddr: "",//正在播放的那条记录的地址
            phoneNumArray: [],//所有联系人的联系电话，通过电话和客户id获取跟进记录
            customerId: this.props.curCustomer.id,
            invalidPhoneLists: [],//无效电话列表
            getInvalidPhoneErrMsg: "",//获取无效电话失败后的信息
            playingItemPhone: "",//正在听的录音所属的电话号码
            isAddingInvalidPhone: false,//正在添加无效电话
            addingInvalidPhoneErrMsg: "",//添加无效电话出错的情况
            addRecordPanelShow: false,//是否展示添加跟进记录面板
            filterType: "",//跟进类型的过滤
            filterStatus: "",//通话状态的过滤
            ...CustomerRecordStore.getState()
        };
    },
    onStoreChange: function () {
        var state = CustomerRecordStore.getState();
        this.setState(state);
    },
    componentDidMount: function () {
        CustomerRecordStore.listen(this.onStoreChange);
        //获取所有联系人的联系电话，通过电话和客户id获取跟进记录
        var customer_id = this.props.curCustomer.customer_id || this.props.curCustomer.id;
        this.getContactPhoneNum(customer_id, () => {
            //获取客户跟踪记录列表
            setTimeout(() => {
                this.getCustomerTraceList();
            }, 10)

        });
        //获取无效电话号码列表
        getInvalidPhone((data) => {
            this.setState({
                invalidPhoneLists: data.result,
                getInvalidPhoneErrMsg: ""
            })
        }, (err) => {
            this.setState({
                invalidPhoneLists: [],
                getInvalidPhoneErrMsg: err.message || Intl.get("call.record.get.invalid.phone.lists", "获取无效电话列表失败")
            })
        });
    },
    //获取所有联系人的联系电话
    getContactPhoneNum: function (customerId, callback) {
        setTimeout(() => {
            //设置customerRecordLoading为true
            CustomerRecordActions.setLoading();
            ajax.getContactList(customerId).then((data) => {
                let contactArray = data.result || [], phoneNumArray = [];
                if (_.isArray(contactArray)) {
                    //把所有联系人的所有电话都查出来
                    contactArray.forEach((item) => {
                        if (_.isArray(item.phone) && item.phone.length) {
                            item.phone.forEach((phoneItem) => {
                                phoneNumArray.push(phoneItem);
                            })
                        }
                    });
                }
                this.setState({phoneNumArray: phoneNumArray});
                if (callback) {
                    setTimeout(() => {
                        callback();
                    });
                }
            }, (errorMsg) => {
                this.setState({phoneNumArray: []});
                if (callback) {
                    setTimeout(() => {
                        callback();
                    });
                }
            });
        })

    },
    //获取客户跟踪列表
    getCustomerTraceList: function (lastId) {
        let phoneNum = this.state.phoneNumArray.join(',');
        let queryObj = {
            customer_id: this.state.customerId || '',
        };
        if (phoneNum) {
            queryObj.dst = phoneNum;
        }
        if (lastId) {
            queryObj.id = lastId;
        }
        //跟进类型的过滤
        if (this.state.filterType && this.state.filterType !== "all") {
            queryObj.type = this.state.filterType;
        }
        //通话状态的过滤
        if (this.state.filterStatus && this.state.filterStatus !== "ALL") {
            queryObj.disposition = this.state.filterStatus;
        }
        CustomerRecordActions.getCustomerTraceList(queryObj);
    },
    componentWillReceiveProps: function (nextProps) {
        var nextCustomerId = nextProps.curCustomer.customer_id || nextProps.curCustomer.id || '';
        var oldCustomerId = this.props.curCustomer.customer_id || this.props.curCustomer.id || '';
        if (nextCustomerId !== oldCustomerId && nextCustomerId) {
            setTimeout(() => {
                this.setState({
                    playingItemAddr: "",
                    playingItemPhone: "",
                    customerId: nextCustomerId
                });
                CustomerRecordActions.dismiss();
                //获取所有联系人的联系电话，通过电话和客户id获取跟进记录
                this.getContactPhoneNum(nextCustomerId, () => {
                    //获取客户跟踪记录列表
                    this.getCustomerTraceList();
                });
            })
        }
    },
    componentWillUnmount: function () {
        CustomerRecordStore.unlisten(this.onStoreChange);
        setTimeout(() => {
            CustomerRecordActions.dismiss();
        });
    },
    handleChange: function (event) {
        Trace.traceEvent($(this.getDOMNode()).find("#add-container .ant-select-selection"), "选择跟进记录的类型");
        CustomerRecordActions.setType(event.target.value);
    },
    //获取列表失败后重试
    retryChangeRecord: function () {
        this.getCustomerTraceList();
    },
    saveAddTraceContent: function () {
        //顶部增加跟进记录的内容
        var customerId = this.state.customerId || '';
        if (this.state.saveButtonType == 'add') {
            Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "确认添加跟进内容");
            //输入框中的内容
            var addcontent = $.trim(this.state.inputContent);
            var queryObj = {
                customer_id: customerId,
                type: this.state.selectedtracetype,
                remark: addcontent,
            };
            CustomerRecordActions.addCustomerTrace(queryObj, () => {
                this.props.refreshCustomerList(customerId);
                this.toggleAddRecordPanel();
            });
            // $('.add-content-input').focus();
        } else {
            //补充跟进记录的内容
            var detail = $.trim(this.state.detailContent);
            var item = this.state.edittingItem;
            Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "确认添加补充的跟进内容");
            var queryObj = {
                id: item.id,
                customer_id: item.customer_id || customerId,
                type: item.type,
                remark: detail
            };
            //把跟进记录中的最后一条电话数据进行标识
            if (item.id === this.state.lastPhoneTraceItemId) {
                queryObj.last_callrecord = "true";
            }
            CustomerRecordActions.setUpdateId(item.id);
            CustomerRecordActions.updateCustomerTrace(queryObj, () => {
                this.props.refreshCustomerList(customerId);
            });
        }
    },
    //点击顶部取消按钮后
    handleCancel: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".add-customer-trace .add-foot .cancel-btn"), "关闭添加跟进内容输入区");
        //下拉框的默认选项为拜访
        CustomerRecordActions.setType(this.state.initialType);
        CustomerRecordActions.setContent(this.state.initialContent);
        this.toggleAddRecordPanel();
        // $('.add-content-input').animate({height: '36px'});
    },
    //提交输入客户跟踪记录成功或者失败后的提示信息
    handleSubmitResult: function () {
        var hide = () => {
            this.setState({
                addCustomerErrMsg: '',
                addCustomerSuccMsg: ''
            });
        };
        if (this.state.addCustomerErrMsg) {
            return (
                <div className="resultTip">
                    <AlertTimer
                        time={2000}
                        message={this.state.addCustomerErrMsg}
                        type="error"
                        showIcon
                        onHide={hide}
                    />
                </div>
            );
        } else {
            return (
                <div className="resultTip">
                    <AlertTimer
                        time={2000}
                        message={this.state.addCustomerSuccMsg}
                        type="info"
                        showIcon
                        onHide={hide}
                    />
                </div>
            );
        }
    },
    //更新失败后的提示信息
    handleUpdateResult: function () {
        var hide = () => {
            this.setState({
                addDetailErrMsg: '',
            });
        };
        return (
            <div className="resultDetailTip">
                <AlertTimer
                    time={2000}
                    message={this.state.addDetailErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        );
    },
    //顶部增加客户跟进记录输入时的处理
    handleInputChange: function (e) {
        CustomerRecordActions.setContent(e.target.value);
    },
    //点击保存按钮，展示模态框
    showModalDialog: function (item) {
        if (item.id) {
            Trace.traceEvent($(this.getDOMNode()).find(".show-customer-trace .add-detail-container .submit-btn"), "添加补充的跟进内容");
            //点击补充客户跟踪记录编辑状态下的保存按钮
            var detail = $.trim(this.state.detailContent);
            if (detail) {
                CustomerRecordActions.setModalDialogFlag(true);
                CustomerRecordActions.changeAddButtonType("update");
                CustomerRecordActions.updateItem(item);
            } else {
                this.setState({
                    addDetailErrTip: Intl.get("customer.trace.content", "客户跟进记录内容不能为空"),
                });
                //输入框中的内容置为空
                this.setState({
                    detailContent: '',
                });
            }
        } else {
            Trace.traceEvent($(this.getDOMNode()).find(".add-customer-trace .add-foot .submit-btn"), "添加跟进内容");
            //点击顶部输入框下的保存按钮
            var addcontent = $.trim(this.state.inputContent);
            if (addcontent) {
                CustomerRecordActions.setModalDialogFlag(true);
                CustomerRecordActions.changeAddButtonType("add");
            } else {
                this.setState({
                    addErrTip: Intl.get("customer.trace.content", "客户跟进记录内容不能为空"),
                });
                //输入框中的内容置为空
                this.setState({
                    inputContent: '',
                });
            }
        }
    },
    //渲染顶部增加记录的teaxare框
    renderAddRecordPanel: function () {
        return (
            <div className="add-customer-trace">
                <div className="add-trace-item">
                    <span
                        className="add-trace-label visit-label">{Intl.get("sales.frontpage.trace.type", "跟进类型")}</span>
                    <RadioGroup onChange={this.handleChange} value={this.state.selectedtracetype}>
                        <Radio value="visit">
                            <span className="iconfont icon-visit-briefcase"/>{Intl.get("common.visit", "拜访")}
                        </Radio>
                        <Radio value="other">
                            <span className="iconfont icon-trace-other"/>{Intl.get("common.others", "其他")}
                        </Radio>
                    </RadioGroup>
                </div>
                <div className="add-trace-item">
                    <span className="add-trace-label">{Intl.get("call.record.follow.content", "跟进内容")}</span>
                    <TextArea placeholder={Intl.get("customer.input.customer.trace.content", "请填写跟进内容，保存后不可修改")}
                              value={this.state.inputContent}
                              onChange={this.handleInputChange}
                              autosize={{minRows: 2, maxRows: 6}}
                    />
                    <SaveCancelButton loading={this.state.addCustomerLoading}
                                      saveErrorMsg={this.state.addCustomerErrMsg}
                                      handleSubmit={this.showModalDialog}
                                      handleCancel={this.handleCancel}
                    />
                </div>
            </div>);
    },
    addDetailContent: function (item) {
        if (this.state.isEdit) {
            message.error(Intl.get("crm.save.customertrace.first", "请先保存或取消保存已编辑的跟进记录内容"));
            return;
        }
        Trace.traceEvent($(this.getDOMNode()).find(".show-container .item-detail-content .add-detail-tip"), "点击补充跟进内容区域");
        item.showAdd = true;
        this.setState({
            customerRecord: this.state.customerRecord,
            isEdit: true,
            detailContent: '',
        });
    },
    handleCancelDetail: function (item) {
        Trace.traceEvent($(this.getDOMNode()).find(".show-customer-trace .add-detail-container .cancel-btn"), "关闭补充跟进内容输入区");
        //点击补充客户跟进记录编辑状态下的取消按钮
        item.showAdd = false;
        this.setState({
            customerRecord: this.state.customerRecord,
            detailContent: this.state.initialDetailContent,
            isEdit: false,
            addDetailErrTip: ''
        });
    },
    handleAddDetailChange: function (e) {
        //补充客户跟进记录
        CustomerRecordActions.setDetailContent(e.target.value);
    },
    renderAddDetail: function (item) {
        //补充跟进记录
        return (
            <div className="add-customer-trace">
                <div className="add-trace-item">
                    <TextArea placeholder={Intl.get("add.customer.trace.detail", "请补充跟进记录详情，保存后不可修改")}
                              value={this.state.detailContent}
                              onChange={this.handleAddDetailChange}
                              autosize={{minRows: 2, maxRows: 6}}
                    />
                    <SaveCancelButton loading={this.state.addCustomerLoading}
                                      saveErrorMsg={this.state.addCustomerErrMsg}
                                      handleSubmit={this.showModalDialog.bind(this, item)}
                                      handleCancel={this.handleCancelDetail.bind(this, item)}
                    />
                </div>
            </div>);
    },
    //点击播放录音
    handleAudioPlay: function (item) {
        //如果是点击切换不同的录音，找到上次点击播放的那一条记录，把他的playSelected属性去掉
        var oldItemId = "";
        var oldSelected = _.find(this.state.customerRecord, function (record) {
            return record.playSelected;
        });
        if (oldSelected) {
            delete oldSelected.playSelected;
            oldItemId = oldSelected.id;
        }
        //给本条记录加上标识
        item.playSelected = true;
        this.setState({
            customerRecord: this.state.customerRecord,
            playingItemAddr: commonMethodUtil.getAudioRecordUrl(item.local, item.recording, item.type),
            playingItemPhone: item.dst //正在播放的录音所属的电话号码
        }, () => {
            var audio = $("#audio")[0];
            if (audio) {
                if (oldItemId && oldItemId == item.id) {
                    //点击当前正在播放的那条记录，重新播放
                    audio.currentTime = 0;
                } else {
                    //播放某条新记录
                    audio.play();
                }
            }
        });
    },
    //关闭音频播放按钮
    closeAudioPlayContainer: function (e) {
        Trace.traceEvent(e, '关闭播放器按钮');
        //找到当前正在播放的那条记录
        var oldSelected = _.find(this.state.customerRecord, function (item) {
            return item.playSelected;
        });
        if (oldSelected) {
            delete oldSelected.playSelected;
        }
        this.setState({
            customerRecord: this.state.customerRecord,
            playingItemAddr: "",
            playingItemPhone: ""
        });
    },
    renderTimeLineItem: function (item, hasSplitLine) {
        var traceObj = crmUtil.processForTrace(item);
        //渲染时间线
        var iconClass = traceObj.iconClass, title = traceObj.title, traceDsc = traceObj.traceDsc;
        //playSelected表示当前正在播放的那条录音，图标显示红色
        var cls = classNames("iconfont", "icon-play", {
            "icon-selected": item.playSelected
        });
        return (
            <div className={classNames("trace-item-content", {"day-split-line": hasSplitLine})}>
                <p className="item-detail-tip">
                    <span className="icon-container" title={title}><i className={iconClass}></i></span>
                    <span>{traceDsc}</span>
                </p>
                <div className="item-detail-content" id={item.id}>
                    {item.remark ? item.remark : ( item.showAdd ? null :
                        <span className="add-detail-tip" onClick={this.addDetailContent.bind(this, item)}>
                                {Intl.get("click.to.add.trace.detail", "请点击此处补充跟进内容")}
                            </span>)}
                    {item.showAdd ? this.renderAddDetail(item) : null}
                </div>
                <div className="item-bottom-content">
                    { item.billsec == 0 ? (/*未接听*/
                        <span className="call-un-answer">
                            {Intl.get("call.record.state.no.answer", "未接听")}
                        </span>
                    ) : /* 电话已接通并且有recording这个字段展示播放图标*/
                        item.recording ? (<span className="audio-container">
                                    <span className={cls} onClick={this.handleAudioPlay.bind(this, item)}
                                          title={Intl.get("call.record.play", "播放录音")}
                                          data-tracename="点击播放录音按钮">
                                        <span className="call-time-descr">
                                            {TimeUtil.getFormatMinuteTime(item.billsec)}
                                        </span>
                                    </span>
                                </span>) : null
                    }
                    <span className="sale-name">{item.nick_name}</span>
                    <span className="trace-record-time">
                        {moment(item.time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                    </span>
                </div>
            </div>
        );
    },
    //监听下拉加载
    handleScrollBarBottom: function () {
        var length = this.state.customerRecord.length;
        if (length < this.state.total) {
            var lastId = this.state.customerRecord[length - 1].id;
            this.getCustomerTraceList(lastId);
        } else if (length == this.state.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    },
    //上报客服电话
    handleAddInvalidPhone: function () {
        var curPhone = this.state.playingItemPhone;
        if (!curPhone) {
            return;
        }
        this.setState({
            isAddingInvalidPhone: true
        });
        addInvalidPhone({"phone": curPhone}, () => {
            this.state.invalidPhoneLists.push(curPhone);
            this.setState({
                isAddingInvalidPhone: false,
                invalidPhoneLists: this.state.invalidPhoneLists,
                addingInvalidPhoneErrMsg: ""
            });
        }, (err) => {
            this.setState({
                isAddingInvalidPhone: false,
                addingInvalidPhoneErrMsg: err.message || Intl.get("fail.report.phone.err.tip", "上报无效电话失败！")
            });
        })
    },
    //提示框隐藏后的处理
    hideErrTooltip: function () {
        this.setState({
            addingInvalidPhoneErrMsg: ""
        })
    },
    //获取第一次出现的年（天）
    getFirstAppearTimeStr: function (curItemTime, prevItemTime, formatTimeStr) {
        //该年(天)是否是第一次出现
        let isFirstApper = false;
        //如果没有之前项，说明该年是第一次出现
        if (!prevItemTime) {
            isFirstApper = true;
        } else {
            //如果当前项的年（天）和之前项的（天）不同，说明该年(天)是第一次出现
            if (curItemTime !== prevItemTime) isFirstApper = true;
        }
        let timeStr = "";
        if (isFirstApper && curItemTime) {
            timeStr = moment(curItemTime).format(formatTimeStr);
        }
        return timeStr;
    },
    renderCustomerTraceList: function () {
        //前一条记录的时间值中的年
        let prevItemYear;
        //当前记录的时间值中的年
        let curItemYear;
        //前一条记录的时间值中的天
        let prevItemDay;
        //当前记录的时间值中的天
        let curItemDay;
        //客户跟进记录
        let customerTraceList = this.state.customerRecord;
        const YEAR_TIME_FORMAT = oplateConsts.DATE_TIME_YEAR_FORMAT + Intl.get("common.time.unit.year", "年");
        if (_.isArray(customerTraceList) && customerTraceList.length) {
            return (<div className="customer-trace-list group-by-day">
                {customerTraceList.map((item, index) => {
                    //处理按天分组逻辑
                    const curItemTime = item.time;
                    curItemYear = moment(curItemTime).startOf("year").valueOf();
                    curItemDay = moment(curItemTime).startOf("day").valueOf();
                    let yearStr = this.getFirstAppearTimeStr(curItemYear, prevItemYear, YEAR_TIME_FORMAT);
                    let dayStr = this.getFirstAppearTimeStr(curItemDay, prevItemDay, oplateConsts.DATE_MONTH_DAY_FORMAT);
                    //将当前项保存下来，以备下次循环中使用
                    prevItemYear = curItemYear;
                    prevItemDay = curItemDay;
                    //每天第一次出现的跟进记录，并且不是第一条时，展示分割线
                    let hasSplitLine = dayStr && index;
                    //今年的跟进记录的年不展示
                    let thisYear = moment().format(YEAR_TIME_FORMAT);
                    return (
                        <div className="customer-trace-item" key={index}>
                            {yearStr && yearStr !== thisYear ? (
                                <div className="group-year">
                                    {yearStr}
                                </div>) : null}
                            <div className="group-day">{dayStr}</div>
                            {this.renderTimeLineItem(item, hasSplitLine)}
                        </div>
                    );
                })}
            </div>);
        } else {
            return (<div className="no-data-tip">{Intl.get("common.no.data", "暂无数据")}</div>);
        }
    },
    renderCustomerRecordLists: function () {
        var recordLength = this.state.customerRecord.length;
        if (this.state.customerRecordLoading && this.state.curPage == 1) {
            //加载中的情况
            return (
                <div className="show-customer-trace">
                    <Spinner />
                </div>
            )
        } else if (this.state.customerRecordErrMsg && !this.state.customerRecordLoading) {
            //加载完成，出错的情况
            var errMsg = <span>{this.state.customerRecordErrMsg}
                <a onClick={this.retryChangeRecord} style={{marginLeft: "20px", marginTop: "20px"}}>
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
        } else if (recordLength == 0 && !this.state.customerRecordLoading) {
            //加载完成，没有数据的情况
            return (
                <div className="show-customer-trace">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        } else {
            var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
            let basicInfoHeight = parseInt($(".basic-info-contianer").outerHeight(true));
            //减头部的客户基本信息高度
            divHeight -= basicInfoHeight;
            //减添加跟进记录面版的高度
            if (this.state.addRecordPanelShow) {
                divHeight -= LAYOUT_CONSTANTS.ADD_TRACE_HEIGHHT;
            } else {//减共xxx条的高度
                divHeight -= LAYOUT_CONSTANTS.TOP_TOTAL_HEIGHT;
            }
            //概览页的跟进记录
            if (this.props.isOverViewPanel) {
                //减概览页”最新跟进“的高度
                divHeight -= LAYOUT_CONSTANTS.OVER_VIEW_TITLE_HEIGHT;
                //减到期用户的高度
                let expireTipHeight = $(".expire-tip-contianer").size() ? parseInt($(".expire-tip-contianer").outerHeight(true)) : 0;
                divHeight -= expireTipHeight;
                //减所属销售的高度
                let salesTeamHeight = parseInt($(".sales-team-container").outerHeight(true));
                divHeight -= salesTeamHeight;
                //减标签的高度
                let tagListHeight = parseInt($(".tag-card-container").outerHeight(true));
                divHeight -= tagListHeight;
            }
            var cls = classNames("audio-play-container", {"is-playing-audio": this.state.playingItemAddr});
            var isShowReportButton = _.indexOf(this.state.invalidPhoneLists, this.state.playingItemPhone) > -1;
            //加载完成，有数据的情况
            return (
                <div className="show-customer-trace">
                    <div className="show-content" style={{'height': divHeight}}>
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                        >
                            {this.renderCustomerTraceList()}
                        </GeminiScrollbar>
                    </div>
                    <div className="show-foot">
                        {/* 底部播放器 */}
                        <div className={cls}>
                            {this.state.playingItemAddr ? (
                                <AudioPlayer
                                    playingItemAddr={this.state.playingItemAddr}
                                    getInvalidPhoneErrMsg={this.state.getInvalidPhoneErrMsg}
                                    addingInvalidPhoneErrMsg={this.state.addingInvalidPhoneErrMsg}
                                    isAddingInvalidPhone={this.state.isAddingInvalidPhone}
                                    isShowReportButton={isShowReportButton}
                                    closeAudioPlayContainer={this.closeAudioPlayContainer}
                                    handleAddInvalidPhone={this.handleAddInvalidPhone}
                                    hideErrTooltip={this.hideErrTooltip}
                                />
                            ) : null
                            }
                        </div>
                    </div>
                </div>
            );
        }
    },
    hideModalDialog: function () {
        CustomerRecordActions.setModalDialogFlag(false);
    },
    //添加跟进记录面板的展示与隐藏
    toggleAddRecordPanel: function () {
        this.setState({addRecordPanelShow: !this.state.addRecordPanelShow});
    },
    onSelectFilterType({item, key, selectedKeys}){
        this.setState({filterType: key});
        CustomerRecordActions.dismiss();
        CustomerRecordActions.setLoading();
        setTimeout(() => {
            this.getCustomerTraceList();
        });
    },
    onSelectFilterStatus({item, key, selectedKeys}){
        this.setState({filterStatus: key});
        CustomerRecordActions.dismiss();
        CustomerRecordActions.setLoading();
        setTimeout(() => {
            this.getCustomerTraceList();
        });
    },
    getTypeMenu(){
        return (
            <Menu selectedKeys={[this.state.filterType]} onClick={this.onSelectFilterType}>
                {_.map(CALL_TYPE_MAP, (value, key) => {
                    return (<Menu.Item key={key}>
                        {value}
                    </Menu.Item>);
                })}
            </Menu>
        );
    },
    getStatusMenu(){
        return (
            <Menu selectedKeys={[this.state.filterStatus]} onClick={this.onSelectFilterStatus}>
                {_.map(CALL_STATUS_MAP, (value, key) => {
                    return (<Menu.Item key={key}>
                        {value}
                    </Menu.Item>);
                })}
            </Menu>
        );
    },
    render: function () {
        //addTrace 顶部增加记录的teaxare框
        //下部时间线列表
        var modalContent = Intl.get("customer.confirm.trace", "是否添加此跟进内容？");
        var detail = $.trim(this.state.detailContent);
        var closedModalTip = $.trim(this.state.detailContent) ? "取消补充跟进内容" : "取消添加跟进内容";

        return (
            <div className="customer-container" data-tracename="跟进记录页面" id="customer-container">
                {this.state.addRecordPanelShow ? this.renderAddRecordPanel() : (
                    <div className="trace-top-block">
                        <span className="total-tip">
                        <ReactIntl.FormattedMessage id="sales.frontpage.total.list" defaultMessage={`共{n}条`}
                                                    values={{"n": this.state.total + ""}}/>
                        </span>

                        <span className="iconfont icon-add" title={Intl.get("sales.frontpage.add.customer", "添加跟进记录")}
                              onClick={this.toggleAddRecordPanel.bind(this)}/>
                        <Dropdown overlay={this.getStatusMenu()} trigger={['click']}>
                            <a className="ant-dropdown-link trace-filter-item">
                                {this.state.filterStatus ? CALL_STATUS_MAP[this.state.filterStatus] : Intl.get("call.record.call.state", "通话状态")}
                                <Icon type="down"/>
                            </a>
                        </Dropdown>
                        <Dropdown overlay={this.getTypeMenu()} trigger={['click']}>
                            <a className="ant-dropdown-link trace-filter-item">
                                {this.state.filterType ? CALL_TYPE_MAP[this.state.filterType] : Intl.get("sales.frontpage.trace.type", "跟进类型")}
                                <Icon type="down"/>
                            </a>
                        </Dropdown>

                    </div>)
                }
                <div className="show-container" id="show-container">
                    {this.renderCustomerRecordLists()}
                </div>
                <ModalDialog modalContent={modalContent}
                             modalShow={this.state.modalDialogFlag}
                             container={this}
                             hideModalDialog={this.hideModalDialog}
                             delete={this.saveAddTraceContent}
                             closedModalTip={closedModalTip}
                />
            </div>
        )
    }
});
module.exports = CustomerRecord;