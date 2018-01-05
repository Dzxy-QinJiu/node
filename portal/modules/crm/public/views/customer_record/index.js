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
import {Icon, Select, Alert, Button, message} from 'antd';
var Option = Select.Option;
var AlertTimer = require("../../../../../components/alert-timer");
import CustomerRecordActions from '../../action/customer-record-action';
import CustomerRecordStore from '../../store/customer-record-store';
var crmUtil = require("./../../utils/crm-util");
var GeminiScrollbar = require("../../../../../components/react-gemini-scrollbar");
var Spinner = require("../../../../../components/spinner");
var TimeLine = require("../../../../../components/time-line");
import ModalDialog from "CMP_DIR/ModalDialog";
import Trace from "LIB_DIR/trace";
import commonMethodUtil from "PUB_DIR/sources/utils/common-method-util";
import ajax from "../../ajax/contact-ajax";
var classNames = require("classnames");
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_HEIGHT_OPEN: 250,
    TOP_HEIGHT_CLOSE: 178,
    BOTTOM_HEIGHT: 40,
    TOP_NAV: 92
};

const CustomerRecord = React.createClass({
    getInitialState: function () {
        return {
            playingItemAddr: "",//正在播放的那条记录的地址
            phoneNumArray: [],//所有联系人的联系电话，通过电话和客户id获取跟进记录
            customerId: this.props.curCustomer.id,
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
        this.getContactPhoneNum(this.props.curCustomer.id, () => {
            //获取客户跟踪记录列表
            this.getCustomerTraceList();
        });
    },
    //获取所有联系人的联系电话
    getContactPhoneNum: function (customerId, callback) {
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
        CustomerRecordActions.getCustomerTraceList(queryObj);
    },
    componentWillReceiveProps: function (nextProps) {
        var nextCustomerId = nextProps.curCustomer.id || '';
        var oldCustomerId = this.props.curCustomer.id || '';
        if (nextCustomerId !== oldCustomerId) {
            setTimeout(() => {
                this.setState({
                    playingItemAddr: "",
                    customerId: nextCustomerId
                });
                CustomerRecordActions.dismiss();
                //获取所有联系人的联系电话，通过电话和客户id获取跟进记录
                this.getContactPhoneNum(nextCustomerId, () => {
                    setTimeout(() => {
                        //获取客户跟踪记录列表
                        this.getCustomerTraceList();
                    });
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
    handleChange: function (item) {
        Trace.traceEvent(this.getDOMNode(), "选择跟进记录的类型");
        CustomerRecordActions.setType(item);
    },
    //获取列表失败后重试
    retryChangeRecord: function () {
        this.getCustomerTraceList();
    },
    saveAddTraceContent: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "点击确认添加跟进记录内容按钮");
        //顶部增加跟进记录的内容
        var customerId = this.state.customerId || '';
        if (this.state.saveButtonType == 'add') {
            //输入框中的内容
            var addcontent = $.trim(this.state.inputContent);
            var queryObj = {
                customer_id: customerId,
                type: this.state.selectedtracetype,
                remark: addcontent,
            };
            CustomerRecordActions.addCustomerTrace(queryObj, () => {
                this.props.refreshCustomerList(customerId);
            });
            $('.add-content-input').focus();
        } else {
            //补充跟进记录的内容
            var detail = $.trim(this.state.detailContent);
            var item = this.state.edittingItem;
            Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "点击模态框提交按钮的跟进记录的ID为" + item.id + "跟进记录的时间为" + moment(item.time).format(oplateConsts.DATE_TIME_FORMAT));
            var queryObj = {
                id: item.id,
                customer_id: item.customer_id || customerId,
                type: item.type,
                remark: detail
            };
            //把跟进记录中的最后一条电话数据进行标识
            if (item.id === this.state.lastPhoneTraceItemId){
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
        Trace.traceEvent(this.getDOMNode(), "取消对跟进记录内容的保存");
        //下拉框的默认选项为拜访
        CustomerRecordActions.setType(this.state.initialType);
        CustomerRecordActions.setContent(this.state.initialContent);
        $('.add-content-input').animate({height: '36px'});
        this.setState({
            focus: false
        });
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
    //获取焦点后输入框高度增大
    inputOnFocus: function () {
        $('.add-content-input').animate({height: '70px'});
        this.setState({
            focus: true
        });
    },
    //点击保存按钮，展示模态框
    showModalDialog: function (item) {
        if (item.id) {
            Trace.traceEvent(this.getDOMNode(), "保存补充客户跟进内容下的保存按钮，编辑状态的跟进记录的ID为" + item.id + "跟进记录的时间为" + moment(item.time).format(oplateConsts.DATE_TIME_FORMAT));
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
            Trace.traceEvent(this.getDOMNode(), "保存新添加的跟进内容");
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
    addTrace: function () {
        var hide = () => {
            this.setState({
                addErrTip: '',
            });
        };
        //增加跟进记录
        return (
            <div className="add-customer-trace">
                <div className="add-content">
                    <textarea className="add-content-input" id="add-content-input" type="text"
                              placeholder={Intl.get("customer.input.customer.trace.content", "请填写客户跟进记录内容")}
                              onFocus={this.inputOnFocus}
                              onChange={this.handleInputChange} value={this.state.inputContent}
                              data-tracename="填写跟进记录内容"/>
                    {this.state.addErrTip ?
                        <AlertTimer
                            time={2000}
                            message={this.state.addErrTip}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                        : null
                    }
                </div>
                {this.state.focus ? (<div className="add-foot">
                    <Button
                        type="ghost"
                        onClick={this.handleCancel}
                        className="pull-right btn-primary-cancel cancel-btn"
                    >
                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                    </Button>
                    <Button
                        type="primary"
                        onClick={this.showModalDialog}
                        className="pull-right btn-primary-sure submit-btn"
                    >
                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                        {this.state.addCustomerLoading ?
                            <Icon type="loading"/> : <span></span>}
                    </Button>
                    {this.state.addCustomerErrMsg || this.state.addCustomerSuccMsg ? this.handleSubmitResult() : null}
                    <Select
                        style={{width: 90}}
                        onChange={this.handleChange}
                        className="pull-left"
                        value={this.state.selectedtracetype}
                    >
                        <Option value="visit">
                            <ReactIntl.FormattedMessage id="common.visit" defaultMessage="拜访"/>
                        </Option>
                        <Option value="other">
                            <ReactIntl.FormattedMessage id="common.others" defaultMessage="其他"/>
                        </Option>
                    </Select>
                </div>) : null}
            </div>
        )
    },
    addDetailContent: function (item) {
        if (this.state.isEdit) {
            message.error(Intl.get("crm.save.customertrace.first", "请先保存或取消保存已编辑的跟进记录内容"));
            return;
        }
        Trace.traceEvent(this.getDOMNode(), "点击添加补充客户跟进内容的按钮");
        item.showAdd = true;
        this.setState({
            customerRecord: this.state.customerRecord,
            isEdit: true,
            detailContent: '',
        });
    },
    handleCancelDetail: function (item) {
        Trace.traceEvent(this.getDOMNode(), "取消补充客户跟进内容的保存");
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
        //点击增加按钮 补充跟进记录
        var hide = () => {
            this.setState({
                addDetailErrTip: '',
            });
        };
        return (
            <div className="add-detail-container">
                <div className="add-detail-content">
                    {this.state.addDetailErrMsg ? this.handleUpdateResult() : null}
                    <textarea
                        type="text"
                        placeholder={Intl.get("add.customer.trace.detail", "请补充客户跟进记录详情")}
                        onChange={this.handleAddDetailChange}
                        value={this.state.detailContent}
                        className="add-detail-content-input"
                        data-tracename="补充客户跟进记录详情"
                    />
                </div>
                {this.state.addDetailErrTip ? <AlertTimer
                    time={2000}
                    message={this.state.addDetailErrTip}
                    type="error"
                    showIcon
                    onHide={hide}
                />
                    : null}
                <div className="add-detail-foot">
                    <Button className="pull-right cancel-btn btn-primary-cancel" type="ghost"
                            onClick={this.handleCancelDetail.bind(this, item)}>
                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                    </Button>
                    <Button className="pull-right submit-btn btn-primary-sure" type="primary"
                            onClick={this.showModalDialog.bind(this, item)}>
                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                        {this.state.addDetailLoading ? <Icon type="loading"/> : <span></span>}
                    </Button>
                </div>
            </div>
        )
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
        var urlObj = commonMethodUtil.urlConifg(item.local, item.recording);
        //录音的地址
        var playItemAddr = "/record/" + urlObj.local + item.recording + urlObj.audioType;
        this.setState({
            customerRecord: this.state.customerRecord,
            playingItemAddr: playItemAddr
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
        });
    },
    renderTimeLineItem: function (item) {
        var traceObj = crmUtil.processForTrace(item);
        //渲染时间线
        var iconClass = traceObj.iconClass, title = traceObj.title, traceDsc = traceObj.traceDsc;
        //playSelected表示当前正在播放的那条录音，图标显示红色
        var cls = classNames("iconfont", "icon-audio-play", {
            "icon-selected": item.playSelected
        });
        return (
            <dl>
                <dd>
                    <p className="item-detail-tip">
                        <span className="icon-container" title={title}><i className={iconClass}></i></span>
                        <span>{traceDsc}</span>
                        <span className="audio-container">{
                            /* 电话已接通并且有recording这个字段展示播放图标*/
                            item.recording && item.billsec != 0 ?
                                <i className={cls} onClick={this.handleAudioPlay.bind(this, item)}
                                   title={Intl.get("call.record.play", "播放录音")} data-tracename="点击播放录音按钮"></i> : null
                        }</span>
                    </p>
                    <div className="item-detail-content" id={item.id}>
                        {item.remark ? item.remark : ( item.showAdd ? null :
                            <span className="add-detail-tip" onClick={this.addDetailContent.bind(this, item)}>
                                {Intl.get("click.to.add.trace.detail", "请点击此处补充跟进内容")}
                            </span>)}
                        {item.showAdd ? this.renderAddDetail(item) : null}
                    </div>
                </dd>
                <dt>
                    <span className="sale-name">{item.nick_name}</span>
                    {moment(item.time).format(oplateConsts.DATE_TIME_FORMAT)}
                </dt>
            </dl>
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
            var divHeight = '';
            if (this.state.focus) {
                divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_HEIGHT_OPEN - LAYOUT_CONSTANTS.BOTTOM_HEIGHT;
            } else {
                divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_HEIGHT_CLOSE - LAYOUT_CONSTANTS.BOTTOM_HEIGHT;
            }
            var cls = classNames("audio-play-container", {"is-playing-audio": this.state.playingItemAddr})
            //加载完成，有数据的情况
            return (
                <div className="show-customer-trace">
                    <div className="show-content" style={{'height': divHeight}}>
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                        >
                            <TimeLine
                                list={this.state.customerRecord}
                                groupByDay={true}
                                timeField="time"
                                render={this.renderTimeLineItem}
                                relativeDate={true}
                            />
                        </GeminiScrollbar>
                    </div>
                    <div className="show-foot">
                        <ReactIntl.FormattedMessage
                            id="customer.total.record"
                            defaultMessage={`共{num}条跟进记录`}
                            values={{
                                'num': this.state.total
                            }}
                        />
                        {/*
                         底部播放器
                         */}
                        <div className={cls}>
                            {this.state.playingItemAddr ? (
                                <div>
                                    <audio id="audio" controls="controls" autoplay="autoplay"
                                           src={this.state.playingItemAddr}>
                                    </audio>
                                    <i className="iconfont icon-close close-panel"
                                       onClick={this.closeAudioPlayContainer}></i>
                                </div>
                            ) : null
                            }
                        </div>
                    </div>
                </div>
            );
        }
    },
    hideModalDialog: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-cancel"), "点击取消添加跟进记录内容按钮");
        CustomerRecordActions.setModalDialogFlag(false);
    },
    render: function () {
        //addTrace 顶部增加记录的teaxare框
        //下部时间线列表
        var modalContent = Intl.get("customer.confirm.trace", "是否添加此跟进内容？");
        return (
            <div className="customer-container" data-tracename="跟进记录页面" id="customer-container">
                <div className="add-container" id="add-container">
                    {this.addTrace()}
                </div>
                <div className="show-container" id="show-container">
                    {this.renderCustomerRecordLists()}
                </div>
                <ModalDialog modalContent={modalContent}
                             modalShow={this.state.modalDialogFlag}
                             container={this}
                             hideModalDialog={this.hideModalDialog}
                             delete={this.saveAddTraceContent}

                />
            </div>
        )
    }
});
module.exports = CustomerRecord;