/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/23.
 */
const PropTypes = require('prop-types');
var React = require('react');
import {Button, Tag, Select,Menu, Dropdown,Input, Icon, Popconfirm} from 'antd';
const {TextArea} = Input;
const Option = Select.Option;
import Trace from 'LIB_DIR/trace';
import {PHONERINGSTATUS, commonPhoneDesArray} from '../consts';
import {getCallClient, AcceptButton, ReleaseButton} from 'PUB_DIR/sources/utils/phone-util';

var phoneAlertAction = require('../action/phone-alert-action');
var phoneAlertStore = require('../store/phone-alert-store');
var ScheduleAction = require('MOD_DIR/crm/public/action/schedule-action');
var CrmAction = require('MOD_DIR/crm/public/action/crm-actions');
var basicOverviewAction = require('MOD_DIR/crm/public/action/basic-overview-actions');
var AlertTimer = require('CMP_DIR/alert-timer');
import {myWorkEmitter, phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
//挂断电话时推送过来的通话状态，phone：私有呼叫中心（目前有：eefung长沙、济南的电话系统），curtao_phone: 客套呼叫中心（目前有: eefung北京、合天的电话系统）, call_back:回访
const HANG_UP_TYPES = [PHONERINGSTATUS.phone, PHONERINGSTATUS.curtao_phone, PHONERINGSTATUS.call_back];
import {TIME_CALCULATE_CONSTS} from 'PUB_DIR/sources/utils/consts';
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
class phoneStatusTop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCustomerId: '',//跟进记录要绑定的客户
            addTraceItemId: '',//添加某条跟进记录的id
            isConnected: false,//电话是否接通
            detailCustomerId: this.props.detailCustomerId,//客户详情中打电话时，客户的id
            phonemsgObj: this.props.phonemsgObj,
            customerInfoArr: phoneAlertStore.getState().customerInfoArr,
            isEdittingTrace: phoneAlertStore.getState().isEdittingTrace,
            submittingTraceMsg: phoneAlertStore.getState().submittingTraceMsg,
            inputContent: phoneAlertStore.getState().inputContent,
            showAddFeedbackOrAddPlan: false,//要在打完电话后才展示反馈，是否展示反馈
            isAddingMoreProdctInfo: this.props.isAddingMoreProdctInfo,
            isAddingPlanInfo: this.props.isAddingPlanInfo,//正在添加联系计划
            showCancelBtn: false,//是否展示取消保存跟进记录的按钮
            visible: false,//跟进内容下拉框是否展示
            addCustomerSchedule: false,//正在添加联系计划
            addCustomerScheduleMsg: '',//添加联系计划的提示
            hasAddedSchedlue: false,//已经添加了联系计划就不可以再添加了
            messageType: '',
            isCustomerDetailCall: this.props.isCustomerDetailCall//是否是在客户详情中打出的电话
        };
    }

    componentDidMount() {
        phoneAlertStore.listen(this.onStoreChange);
        setTimeout(() => {
            //拨打电话状态展示后，重新计算详情中的高度计算
            phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
        });
    }

    onStoreChange = () => {
        this.setState(phoneAlertStore.getState());
    };

    componentWillUnmount() {
        this.setInitialData();
        phoneAlertStore.unlisten(this.onStoreChange);
    }

    componentWillReceiveProps(nextProps) {
        var phonemsgObj = nextProps.phonemsgObj;
        this.setState({
            detailCustomerId: nextProps.detailCustomerId,
            phonemsgObj: phonemsgObj,
            isAddingMoreProdctInfo: nextProps.isAddingMoreProdctInfo,
            isAddingPlanInfo: nextProps.isAddingPlanInfo,
            isCustomerDetailCall: nextProps.isCustomerDetailCall
        }, () => {
            //通话结束后，展示保存跟进记录的按钮，需重新计算详情的高度
            if (_.includes(HANG_UP_TYPES, _.get(this.state, 'phonemsgObj.type'))){
                phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
            }
        });
        //如果接听后，把状态isConnected 改为true
        if (phonemsgObj.type === PHONERINGSTATUS.ANSWERED) {
            this.setState({
                isConnected: true,
            });
            if (window.location.pathname === '/home'){
                myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
            }
        }
        var $modal = $('#phone-status-content');
        if ($modal && $modal.length > 0 && phonemsgObj.type === PHONERINGSTATUS.ALERT) {
            this.setInitialData(phonemsgObj);
        }
    }

    componentDidUpdate= () => {
        //当自定义计划添加成功并且当前未通过"n小时/n天后"button添加计划时
        if(_.get(this.props, 'isAddingScheduleSuccess') && !_.get(this.state, 'hasAddedSchedlue')){
            this.showMessage(Intl.get('clue.customer,add,schedule,success','联系计划已添加'), 'success');
            this.setState({
                hasAddedSchedlue: true
            });
        }
    };

    setInitialData() {
        this.setState({
            isConnected: false,
            // addTraceItemId: "",
            selectedCustomerId: '',
            showAddFeedbackOrAddPlan: false,//是否展示反馈
        });
    }

    handleEditContent = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-update'), '点击编辑跟进记录按钮');
        phoneAlertAction.setEditStatus({isEdittingTrace: true, submittingTraceMsg: ''});
        this.setState({showCancelBtn: true});
        setTimeout(() => {
            //点击编辑跟进记录按钮后，重新计算详情中的高度计算
            phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
        });
    };

    //获取添加跟进记录的客户id
    getSaveTraceCustomerId() {
        let customerInfoArr = this.state.customerInfoArr;
        //默认保存到获取的客户列表中的第一个客户上
        let customer_id = _.isArray(customerInfoArr) && customerInfoArr[0] ? customerInfoArr[0].id : '';
        //从客户详情中打电话时，跟进记录直接加到当前详情中展示的客户上
        if (this.state.detailCustomerId) {
            customer_id = this.state.detailCustomerId;
        } else if (this.state.selectedCustomerId) {//该电话对应多个客户时，将跟进记录加到选择的客户上
            customer_id = this.state.selectedCustomerId;
        }
        return customer_id;
    }

    //取消保存跟进记录
    handleTraceCancel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.trace-content-container'), '取消保存跟进记录');
        phoneAlertAction.setEditStatus({isEdittingTrace: false, submittingTraceMsg: ''});
        this.setState({showCancelBtn: false});
        setTimeout(() => {
            //取消保存跟进记录后，重新计算详情中的高度计算
            phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
        });
    };
    //提交跟进记录
    handleTraceSubmit = () => {
        //跟进记录的id，只有当通话结束后(type=phone时)，推送过来的数据中才会有id
        let trace_id = this.state.phonemsgObj && this.state.phonemsgObj.id;
        if (!trace_id) {
            phoneAlertAction.setSubmitErrMsg(Intl.get('phone.delay.save', '通话记录正在同步，请稍等再保存！'));
            return;
        }
        if (!_.trim(this.state.inputContent)){
            phoneAlertAction.setSubmitErrMsg(Intl.get('customer.trace.content', '跟进记录内容不能为空'));
            return;
        }
        const submitObj = {
            id: trace_id,
            last_callrecord: 'true',
            remark: this.state.inputContent,
            call_date: _.get(this.state.phonemsgObj, 'call_date')
        };
        //获取保存跟进记录的客户id
        let customer_id = this.getSaveTraceCustomerId();
        //没有客户id时，会只将跟进内容保存到通话记录中
        if(customer_id){
            submitObj.customer_id = customer_id;
        }
        phoneAlertAction.updateCustomerTrace(submitObj, () => {
            let updateData = {customer_id: customer_id, remark: this.state.inputContent};
            if (this.state.isConnected) {
                //如果电话已经接通
                updateData.last_contact_time = new Date().getTime();
            }
            CrmAction.updateCurrentCustomerRemark(updateData);
            this.setState({
                selectedCustomerId: '',
                isConnected: false,
                showAddFeedbackOrAddPlan: true,
                showCancelBtn: false,
            }, () => {
                //保存跟进记录后，重新计算详情中的高度计算
                phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
            });
            if (window.location.pathname === '/home'){
                //写了跟进记录后，对应的首页我的工作设为已完成
                myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
            }
        });
    };
    //将输入框中的文字放在state上
    handleInputChange = (e) => {
        phoneAlertAction.setContent(e.target.value);
        if (e.target.value){
            this.setState({
                visible: false
            });
        }
    };
    handleSelectCustomer = (customerId) => {
        this.setState({
            selectedCustomerId: customerId
        });
    };
    onClickMenu = ({ key }) => {
        var inputContent = _.get(commonPhoneDesArray,`[${key}].value`);
        phoneAlertAction.setContent(inputContent);
        if (this['addTextare']) {
            this['addTextare'].focus();
        }
        this.setState({
            visible: false
        });
    };
    handleVisibleChange = flag => {
        this.setState({ visible: flag });
    };

    renderTraceItem(phonemsgObj) {
        var onHide = function() {
            phoneAlertAction.setSubmitErrMsg('');
        };
        var customerInfoArr = _.get(this,'state.customerInfoArr[0]') ? this.state.customerInfoArr : [];
        if(_.isEmpty(customerInfoArr) && !this.state.isCustomerDetailCall && _.get(phonemsgObj,'customers[0]')) {
            customerInfoArr = phonemsgObj.customers;
        }
        const options = customerInfoArr.map((item) => (
            <Option value={item.id} key={item.id}>{item.name}</Option>
        ));
        const menu =
            <Menu onClick={this.onClickMenu}>{_.isArray(commonPhoneDesArray) ? commonPhoneDesArray.map((item, idx) => {
                if (phonemsgObj.billsec > 0) {
                    if (!item.key){
                        return;
                    }
                }else{
                    if (item.key){
                        return;
                    }
                }
                return (<Menu.Item key={idx} value={item.value}>{item.value}</Menu.Item>);
            }) : null}</Menu>
        ;
        //通话记录的编辑状态
        if (this.state.isEdittingTrace) {
            return (
                <div className="trace-content edit-trace">
                    <div className="input-item">
                        <Dropdown overlay={menu} trigger={['click']} onVisibleChange={this.handleVisibleChange} visible={this.state.visible}>
                            <TextArea
                                ref={addTextare => this['addTextare'] = addTextare}
                                onChange={this.handleInputChange}
                                value={this.state.inputContent}
                                placeholder={Intl.get('phone.status.record.content', '请填写本次跟进内容')}/>
                        </Dropdown>
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
                    {//通话结束后，展示保存跟进记录的按钮
                        _.includes(HANG_UP_TYPES, phonemsgObj.type) ?
                            <div className="btn-select-container">
                                {/*如果获取到的客户不止一个，要手动选择要关联的客户*/}
                                {this.state.customerInfoArr.length > 1 ?
                                    <div className="select-add-trace-customer">
                                        {Intl.get('phone.alert.select.customer', '请选择要跟进的客户')}：
                                        <Select
                                            defaultValue={this.state.customerInfoArr[0].id}
                                            dropdownMatchSelectWidth={false}
                                            onChange={this.handleSelectCustomer}
                                        >
                                            {options}
                                        </Select>

                                    </div> : null}
                                <Button type='primary' className="modal-submit-btn" onClick={this.handleTraceSubmit}
                                    data-tracename="保存跟进记录">
                                    {this.state.submittingTrace ? (Intl.get('retry.is.submitting', '提交中...')) : (Intl.get('common.save', '保存'))}
                                </Button>
                                {this.state.showCancelBtn ?
                                    <Button onClick={this.handleTraceCancel}
                                        data-tracename="取消保存跟进记录">{Intl.get('common.cancel', '取消')}</Button>
                                    : null}
                            </div> : null}
                </div>
            );
        } else {
            return (
                <div className="trace-content">
                    <span className="trace-content-label">
                        {Intl.get('call.record.follow.content', '跟进内容')}:
                    </span>
                    <span>{this.state.inputContent}</span>
                    <i className="iconfont icon-update" onClick={this.handleEditContent}></i>
                </div>
            );
        }
    }

    //获取页面上的描述
    getPhoneTipMsg(phonemsgObj) {
        //拨号的描述
        //如果是系统内拨号，展示联系人和电话，如果是从座机拨号，只展示所拨打的电话
        var phoneNum = this.props.contactNameObj && this.props.contactNameObj.contact ? this.props.contactNameObj.contact + '-' : '';
        if (phonemsgObj.call_type === 'IN') {
            phoneNum += phonemsgObj.extId;
            if (_.includes(HANG_UP_TYPES, phonemsgObj.type)) {
                phoneNum += phonemsgObj.dst;
            }
        } else {
            phoneNum += phonemsgObj.to || phonemsgObj.dst;
        }
        var desTipObj = {
            phoneNum: phoneNum,
            tip: ''
        };
        let callClient = getCallClient();
        if (phonemsgObj.type === PHONERINGSTATUS.ALERT) {
            if (phonemsgObj.call_type === 'IN') {
                //如果是呼入，并且是需要展示接听按钮的情况，如：容联。需要点击接听才开始获取对方声音
                desTipObj.tip = (<AcceptButton callClient={callClient}></AcceptButton>);
            } else {
                let tip = `${Intl.get('call.record.phone.alerting', '已振铃，等待对方接听')}`;
                desTipObj.tip = (<ReleaseButton callClient={callClient} tip={tip} phoneNumber={phoneNum}> </ReleaseButton>);
            }
        } else if (phonemsgObj.type === PHONERINGSTATUS.ANSWERED) {
            let tip = `${Intl.get('call.record.phone.answered', '正在通话中')}`;
            desTipObj.tip = (<ReleaseButton callClient={callClient} tip={tip} phoneNumber={phoneNum}> </ReleaseButton>);
        } else if (phonemsgObj.type === PHONERINGSTATUS.phone || phonemsgObj.type === PHONERINGSTATUS.curtao_phone || phonemsgObj.type === PHONERINGSTATUS.call_back) {
            desTipObj.tip = `${Intl.get('call.record.phone.unknown', '结束通话')}`;
        }
        return desTipObj;
    }

    //点击添加产品反馈
    handleAddProductFeedback = () => {
        this.props.handleAddProductFeedback();
    };
    //点击添加联系计划
    handleAddPlan = () => {
        this.props.handleAddPlan();
    };
    //关闭自定义联系计划面板
    closeAddPlan = () => {
        this.props.closeAddPlan();
    }
    //挂断电话
    releaseCall = (called) => {
        if (getCallClient()) {
            getCallClient().releaseCall();
        }
    };
    addScheduleItem = (startTimeValue) => {
        var submitObj = {
            start_time: startTimeValue,
            end_time: startTimeValue + TIME_CALCULATE_CONSTS.THIRTY * 60 * 1000,
            alert_time: startTimeValue,
            topic: _.get(this, 'state.customerInfoArr[0].name'),
            scheduleType: 'calls',
            socketio_notice: true,
            content: '',
            customer_id: _.get(this, 'state.customerInfoArr[0].id')
        };
        if (!submitObj.customer_id) {
            return;
        }
        
        this.setState({
            addCustomerSchedule: true
        });
        ScheduleAction.addSchedule(submitObj, (resData) => {
            if (resData.id) {
                this.setState({
                    hasAddedSchedlue: true
                });
                //如果添加的是今天的电联联系计划，就在基本资料的日程列表中加一个计划
                var todayTimeObj = TimeStampUtil.getTodayTimeStamp();
                resData.contacts = _.get(this, 'state.customerInfoArr[0].contacts');
                if (resData.type === 'calls' && resData.start_time >= todayTimeObj.start_time && resData.end_time <= todayTimeObj.end_time){
                    basicOverviewAction.afterAddSchedule(resData);
                }
                //当打开自定义面板未进行提交编辑又选择了其他天数、小时数联系计划并确认后，关闭自定义添加的面板
                this.closeAddPlan();
                this.showMessage(Intl.get('clue.customer,add,schedule,success','联系计划已添加'), 'success');
            } else {
                this.showMessage(resData || Intl.get('clue,customer.add.schedule.error', '联系计划添加失败'), 'error');
            }
        });
    };
    showMessage = (content, type) => {
        this.setState({
            addCustomerSchedule: false,
            messageType: type,
            addCustomerScheduleMsg: content || '',
        });
    };
    hideSaveTooltip = () => {
        this.setState({
            messageType: '',
            addCustomerScheduleMsg: '',
        });
    };

    render() {
        var saveResult = this.state.messageType;
        var iconFontCls = 'modal-icon iconfont';
        var phonemsgObj = this.state.phonemsgObj;
        var phoneStatusContainer = 'contact-info-detail';
        if (phonemsgObj.type === PHONERINGSTATUS.ALERT) {
            if (phonemsgObj.call_type === 'OU') {
                iconFontCls += ' icon-callrecord-out';
            } else if (phonemsgObj.call_type === 'IN') {
                iconFontCls += ' icon-callrecord-in';
            }
        } else if (phonemsgObj.type === PHONERINGSTATUS.ANSWERED) {
            iconFontCls += ' icon-phone-answering';
        } else if (_.includes(HANG_UP_TYPES, phonemsgObj.type)) {
            iconFontCls += ' icon-phone-bye';
            phoneStatusContainer += ' finish-phone-call';
        }
        //获取页面描述
        var phoneDes = this.getPhoneTipMsg(phonemsgObj);
        return (
            <div className={this.props.phoneAlertModalTitleCls}>
                <div className={phoneStatusContainer}>
                    <div id="iconfont-tip">
                        <i className={iconFontCls}></i>
                    </div>
                    <div className="phone-status-tip">
                        <div className="contact-phone-title">
                            {phoneDes.phoneNum}
                        </div>
                        <div className="status-tip-title">
                            {phoneDes.tip}
                        </div>
                    </div>
                </div>
                <div className="trace-and-handle-btn">
                    <div className="trace-content-container">
                        {this.renderTraceItem(phonemsgObj)}
                        <div className="add-plan-info-container">
                            <div className="contact-tip">{Intl.get('crm.clue.next.contact.time', '下次联系时间')}
                                <div className="indicator">
                                    {saveResult ?
                                        (
                                            <AlertTimer
                                                time='3000'
                                                message={this.state.addCustomerScheduleMsg}
                                                type={saveResult} showIcon
                                                onHide={this.hideSaveTooltip}/>
                                        ) : ''
                                    }
                                </div>
                            </div>
                            <div className="btn-wrap">
                                <Popconfirm
                                    title={Intl.get('crm.schedule.n.hour.later,confirm', '确定{n}小时之后在联系吗？', {n: 2})}
                                    onConfirm={this.addScheduleItem.bind(this, moment().add(TIME_CALCULATE_CONSTS.TWO, 'h').valueOf())}>
                                    <Button disabled={this.state.hasAddedSchedlue} size="small">{Intl.get('crm.schedule.n.hour.later', '{n}小时后', {n: 2})}</Button>
                                </Popconfirm>
                                <Popconfirm
                                    title={Intl.get('crm.schedule.n.hour.later,confirm', '确定{n}小时之后在联系吗？', {n: 6})}
                                    onConfirm={this.addScheduleItem.bind(this, moment().add(TIME_CALCULATE_CONSTS.SIX, 'h').valueOf())}>
                                    <Button disabled={this.state.hasAddedSchedlue} size="small">{Intl.get('crm.schedule.n.hour.later', '{n}小时后', {n: 6})}</Button>
                                </Popconfirm>
                                <Popconfirm
                                    title={Intl.get('crm.alert.after.n.day.confirm', '确定{n}天之后再联系吗？', {n: 1})}
                                    onConfirm={this.addScheduleItem.bind(this, moment().add(TIME_CALCULATE_CONSTS.TWENTY_FOUR, 'h').valueOf())}>
                                    <Button disabled={this.state.hasAddedSchedlue} size="small">{Intl.get('crm.alert.after.n.day', '{n}天后', {n: 1})}</Button>
                                </Popconfirm>
                                <Popconfirm
                                    title={Intl.get('crm.alert.after.n.day.confirm', '确定{n}天之后再联系吗？', {n: 3})}
                                    onConfirm={this.addScheduleItem.bind(this, moment().add(3 * TIME_CALCULATE_CONSTS.TWENTY_FOUR, 'h').valueOf())}>
                                    <Button disabled={this.state.hasAddedSchedlue} size="small">{Intl.get('crm.alert.after.n.day', '{n}天后', {n: 3})}</Button>
                                </Popconfirm>
                                <Popconfirm
                                    title={Intl.get('crm.alert.after.n.day.confirm', '确定{n}天之后再联系吗？', {n: 5})}
                                    onConfirm={this.addScheduleItem.bind(this, moment().add(5 * TIME_CALCULATE_CONSTS.TWENTY_FOUR, 'h').valueOf())}>
                                    <Button disabled={this.state.hasAddedSchedlue} size="small">{Intl.get('crm.alert.after.n.day', '{n}天后', {n: 5})}</Button>
                                </Popconfirm>
                                <Button disabled={this.state.hasAddedSchedlue} size="small"
                                    onClick={this.handleAddPlan}>{Intl.get('user.time.custom', '自定义')}</Button>
                                {this.state.addCustomerSchedule ? <Icon type="loading"/> : null}
                            </div>
                        </div>
                    </div>
                    {this.state.showAddFeedbackOrAddPlan && (!this.state.isAddingMoreProdctInfo && !this.state.isAddingPlanInfo) ?
                        <div className="add-trace-and-plan">
                            <div className="add-more-info-container">
                                <Button size="small"
                                    onClick={this.handleAddProductFeedback}>{Intl.get('call.record.add.product.feedback', '添加产品反馈')}</Button>
                            </div>
                        </div>
                        : null}
                </div>
            </div>
        );
    }
}

phoneStatusTop.defaultProps = {
    addMoreInfoCls: '',
    phoneAlertModalTitleCls: '',
    phonemsgObj: {},
    addTraceItemId: '',
    detailCustomerId: '',
    isAddingMoreProdctInfo: false,
    contactNameObj: {},
    handleAddProductFeedback: function() {
    },
    isAddingPlanInfo: false,
    handleAddPlan: function() {

    },
    isCustomerDetailCall: true
};
phoneStatusTop.propTypes = {
    addMoreInfoCls: PropTypes.string,
    phoneAlertModalTitleCls: PropTypes.string,
    phonemsgObj: PropTypes.object,
    addTraceItemId: PropTypes.string,
    detailCustomerId: PropTypes.string,
    isAddingMoreProdctInfo: PropTypes.bool,
    contactNameObj: PropTypes.object,
    handleAddProductFeedback: PropTypes.func,
    isAddingPlanInfo: PropTypes.bool,
    handleAddPlan: PropTypes.bool,
    closeAddPlan: PropTypes.func,
    isAddingScheduleSuccess: PropTypes.string,
    isCustomerDetailCall: PropTypes.bool,
};
export default phoneStatusTop;