/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
// var language = require("../../../../../public/language/getLanguage");
// if (language.lan() == "es" || language.lan() == "en") {
//     require("../../css/customer-trace-es_VE.less");
// } else if (language.lan() == "zh") {
//     require("../../css/customer-trace-zh_CN.less");
// }
require("../css/customer-record.less");
import {Icon, Select, Alert, Button, message} from 'antd';
var Option = Select.Option;
var AlertTimer = require("CMP_DIR/alert-timer");
import CustomerRecordActions from '../action/customer-record-actions';
import CustomerRecordStore from '../store/customer-record-store';
var crmUtil = require("../utils/crm-util");
var GeminiScrollbar = require("CMP_DIR/react-gemini-scrollbar");
var Spinner = require("CMP_DIR/spinner");
var TimeLine = require("CMP_DIR/time-line");
import ModalDialog from "CMP_DIR/ModalDialog";
import Trace from "LIB_DIR/trace";
import commonMethodUtil from "PUB_DIR/sources/utils/common-method-util";
import ajax from "../ajax/customer-record-ajax";
//获取无效电话的列表  设置某个电话为无效电话
import {getInvalidPhone, addInvalidPhone} from "LIB_DIR/utils/invalidPhone";
import AudioPlayer from "CMP_DIR/audioPlayer";
var classNames = require("classnames");
import AddCustomerTrace from "./add-customer-trace-panel";
//用于布局的高度
var LAYOUT_CONSTANTS = {
    CUSTOMER_RECORD_HEIGHT: 55
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
            showAddCustomerTrace: false,//展示添加跟进记录面板
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
                getInvalidPhoneErrMsg: err.msg || Intl.get("call.record.get.invalid.phone.lists", "获取无效电话列表失败")
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
                    setTimeout(() => {
                        //获取客户跟踪记录列表
                        this.getCustomerTraceList();
                    }, 10);
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
        Trace.traceEvent($(this.getDOMNode()).find("#add-container .ant-select-selection"), "选择跟进记录的类型");
        CustomerRecordActions.setType(item);
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
            });
            $('.add-content-input').focus();
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
        $('.add-content-input').animate({height: '36px'});
        this.setState({
            focus: false
        });
    },
    //todo 待删除
    //提交输入客户跟踪记录成功或者失败后的提示信息
    handleSubmitResult: function () {
        // var hide = () => {
        this.setState({
            addCustomerErrMsg: '',
            addCustomerSuccMsg: ''
        });
        // };
        // if (this.state.addCustomerErrMsg) {
        //     return (
        //         <div className="resultTip">
        //             <AlertTimer
        //                 time={2000}
        //                 message={this.state.addCustomerErrMsg}
        //                 type="error"
        //                 showIcon
        //                 onHide={hide}
        //             />
        //         </div>
        //     );
        // } else {
        //     return (
        //         <div className="resultTip">
        //             <AlertTimer
        //                 time={2000}
        //                 message={this.state.addCustomerSuccMsg}
        //                 type="info"
        //                 showIcon
        //                 onHide={hide}
        //             />
        //         </div>
        //     );
        // }
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
    //todo 待删除的方法 1
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
                              placeholder={Intl.get("customer.input.customer.trace.content", "请填写跟进内容，保存后不可修改")}
                              onFocus={this.inputOnFocus}
                              onChange={this.handleInputChange} value={this.state.inputContent}/>
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
    //todo 待删除的方法 end
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
                        placeholder={Intl.get("add.customer.trace.detail", "请补充跟进记录详情，保存后不可修改")}
                        onChange={this.handleAddDetailChange}
                        value={this.state.detailContent}
                        className="add-detail-content-input"
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
            playingItemAddr: playItemAddr,
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
    calculateTime: function (billsec) {
        var secondTime = parseInt(billsec);// 秒
        var minuteTime = 0;// 分
        var hourTime = 0;// 小时
        if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = parseInt(secondTime / 60);
            //获取秒数，秒数取佘，得到整数秒数
            secondTime = parseInt(secondTime % 60);
            //如果分钟大于60，将分钟转换成小时
            if (minuteTime > 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = parseInt(minuteTime / 60);
                //获取小时后取佘的部分，获取分钟除以60取佘的分
                minuteTime = parseInt(minuteTime % 60);
            }
        }
        var result = [];
        if (0 < hourTime && hourTime < 10) {
            hourTime = "0" + hourTime;
            result.push(hourTime);
        }
        if (minuteTime < 10) {
            minuteTime = "0" + minuteTime;
        }
        result.push(minuteTime);
        if (secondTime < 10) {
            secondTime = "0" + secondTime;
        }
        result.push(secondTime);
        return result.join(":");
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
                        <span className="icon-container" title={title}>
                            <i className={iconClass}></i></span>
                        <span>{item.contact_name}</span>
                        <span>{item.dst}</span>
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
                    <span className="audio-container">{
                        /* 电话已接通并且有recording这个字段展示播放图标*/
                        item.recording && item.billsec && item.billsec != 0 ?
                            <span><i className={cls} onClick={this.handleAudioPlay.bind(this, item)}
                                     title={Intl.get("call.record.play", "播放录音")} data-tracename="点击播放录音按钮"></i>
                                <span className="vertical-style">{this.calculateTime(item.billsec)}</span> </span>
                            : (item.billsec && item.billsec != 0 ?
                            <span><i className="iconfont icon-audio-play play-enabled"></i>
                            <span className="vertical-style">{this.calculateTime(item.billsec)}</span></span> :
                            <span className="no-connected">{Intl.get("customer.no.connect", "未接通")}</span>)
                    }

                    </span>
                    <span
                        className="pull-right">{moment(item.time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}</span>

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
                addingInvalidPhoneErrMsg: err.msg || Intl.get("fail.report.phone.err.tip", "上报无效电话失败！")
            });
        })
    },
    //提示框隐藏后的处理
    hideErrTooltip: function () {
        this.setState({
            addingInvalidPhoneErrMsg: ""
        })
    },
    //渲染跟进记录列表
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
                <a onClick={this.retryChangeRecord}>
                    {Intl.get("user.info.retry", "请重试")}
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
            var divHeight = this.props.wrapHeight - LAYOUT_CONSTANTS.CUSTOMER_RECORD_HEIGHT;
            var cls = classNames("audio-play-container", {"is-playing-audio": this.state.playingItemAddr});
            var isShowReportButton = _.indexOf(this.state.invalidPhoneLists, this.state.playingItemPhone) > -1;
            //加载完成，有数据的情况
            return (
                <div className="show-customer-trace">
                    <div className="show-content" style={{height: divHeight}}>
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
                        {/*
                         底部播放器
                         */}
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
    showAddCustomerTrace: function () {
        this.setState({
            showAddCustomerTrace: true
        })
    },
    closeAddCustomerTrace: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".add-customer-trace .add-foot .cancel-btn"), "关闭添加跟进内容输入区");
        //下拉框的默认选项为拜访
        CustomerRecordActions.setType(this.state.initialType);
        CustomerRecordActions.setContent(this.state.initialContent);
        this.setState({
            showAddCustomerTrace: false
        })
    },
    afterHideErrTip: function () {
        this.setState({
            addErrTip: ""
        })
    },
    render: function () {
        //addTrace 顶部增加记录的teaxare框
        //下部时间线列表
        var modalContent = Intl.get("customer.confirm.trace", "是否添加此跟进内容？");
        var detail = $.trim(this.state.detailContent);
        var closedModalTip = $.trim(this.state.detailContent) ? "取消补充跟进内容" : "取消添加跟进内容";
        return (
            <div className="customer-container" data-tracename="跟进记录页面" id="customer-trace-container">
                <div className="add-customer-title">{Intl.get("sales.frontpage.recent.record", "最新跟进")}：</div>
                <div className="add-container" id="add-trace-container">
                    {this.state.showAddCustomerTrace ?
                        <AddCustomerTrace
                            selectedtracetype={this.state.selectedtracetype}
                            closeAddCustomerTrace={this.closeAddCustomerTrace}
                            handleChange={this.handleChange}
                            handleInputChange={this.handleInputChange}
                            showModalDialog={this.showModalDialog}
                            addCustomerLoading={this.state.addCustomerLoading}
                            inputContent={this.state.inputContent}
                            addErrTip={this.state.addErrTip}
                            addCustomerErrMsg={this.state.addCustomerErrMsg}
                            addCustomerSuccMsg={this.state.addCustomerSuccMsg}
                            handleSubmitResult={this.handleSubmitResult}
                            afterHideErrTip={this.afterHideErrTip}
                        /> : <div>
                            <div className="add-customer-record pull-right">
                                <i className="iconfont icon-add" onClick={this.showAddCustomerTrace}></i>
                            </div>
                            <div className="customer-list-total">
                                {
                                    this.state.total ? Intl.get("sales.frontpage.total.list", "共{n}条", {n: this.state.total}) : null
                                }</div>
                        </div>}
                    {/*{this.addTrace()}*/}
                </div>
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