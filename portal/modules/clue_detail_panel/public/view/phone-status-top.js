/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/23.
 */
const PropTypes = require('prop-types');
var React = require('react');
import {Button, Tag, Select, Input, Menu, Dropdown, Icon, Popconfirm} from 'antd';
const {TextArea} = Input;
const Option = Select.Option;
import Trace from 'LIB_DIR/trace';
import {PHONERINGSTATUS, HANG_UP_TYPES} from 'MOD_DIR/phone_panel/public/consts';
import {getCallClient, AcceptButton, ReleaseButton} from 'PUB_DIR/sources/utils/phone-util';
var phoneAlertAction = require('../action/phone-alert-action');
var phoneAlertStore = require('../store/phone-alert-store');
var ClueAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var clueFilterStore = require('MOD_DIR/clue_customer/public/store/clue-filter-store');
var ScheduleAction = require('MOD_DIR/clue_customer/public/action/schedule-action');
var AlertTimer = require('CMP_DIR/alert-timer');
var className = require('classnames');
import {AVALIBILITYSTATUS, SELECT_TYPE} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {myWorkEmitter} from 'PUB_DIR/sources/utils/emitters';
import {TIME_CALCULATE_CONSTS} from 'PUB_DIR/sources/utils/consts';
import {subtracteGlobalClue} from 'PUB_DIR/sources/utils/common-method-util';
import { clueEmitter } from 'PUB_DIR/sources/utils/emitters';
class phoneStatusTop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedClueId: '',//跟进记录要绑定的客户
            addTraceItemId: '',//添加某条跟进记录的id
            isConnected: false,//电话是否接通
            detailClueId: this.props.detailClueId,//线索中打电话时，线索的id
            phonemsgObj: this.props.phonemsgObj,
            clueInfoArr: phoneAlertStore.getState().clueInfoArr,
            isEdittingTrace: phoneAlertStore.getState().isEdittingTrace,
            submittingTraceMsg: phoneAlertStore.getState().submittingTraceMsg,
            inputContent: phoneAlertStore.getState().inputContent,
            isAddingMoreProdctInfo: this.props.isAddingMoreProdctInfo,
            isAddingPlanInfo: this.props.isAddingPlanInfo,//正在添加联系计划
            showCancelBtn: false,//是否展示取消保存跟进记录的按钮
            showMarkClueInvalid: this.props.showMarkClueInvalid,
            visible: false,//跟进内容下拉框是否展示
            curClue: this.props.curClue,
            addClueSchedule: false,//正在添加联系计划
            addClueScheduleMsg: '',//添加联系计划的提示
            hasAddedSchedlue: false,//已经添加了联系计划就不可以再添加了
            messageType: '',
            isClueDetailCall: this.props.isClueDetailCall//是否是在线索详情中打出的电话
        };
    }

    componentDidMount() {
        phoneAlertStore.listen(this.onStoreChange);
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
            detailClueId: nextProps.detailClueId,
            phonemsgObj: phonemsgObj,
            isAddingMoreProdctInfo: nextProps.isAddingMoreProdctInfo,
            isAddingPlanInfo: nextProps.isAddingPlanInfo,
            isClueDetailCall: nextProps.isClueDetailCall
        });
        if (!_.isEmpty(nextProps.curClue)) {
            this.setState({
                curClue: nextProps.curClue
            });
        }
        //如果接听后，把状态isConnected 改为true
        if (phonemsgObj.type === PHONERINGSTATUS.ANSWERED) {
            this.setState({
                isConnected: true,
            });
            //首页我的工作中，打通电话，需要将首页的相关工作改为已完成
            if (window.location.pathname === '/home') {
                myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
            }
        }
        var showClueModal = _.get($('#clue-phone-status-content'), 'length', 0) > 0;
        if ((showClueModal) && phonemsgObj.type === PHONERINGSTATUS.ALERT) {
            this.setInitialData(phonemsgObj);
        }
        var curClue = _.isEmpty(nextProps.curClue) ? this.state.curClue : nextProps.curClue;
        //如果电话已经接通，并且是待我审批的线索，需要把待我处理左侧数字减一
        if (phonemsgObj.billsec > 0) {
            subtracteGlobalClue(curClue, (flag) => {
                if(flag){
                    clueEmitter.emit(clueEmitter.REMOVE_CLUE_ITEM,curClue);
                }
            });
        }

    }

    setInitialData() {
        this.setState({
            isConnected: false,
            selectedClueId: '',
        });
    }

    handleEditContent = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-update'), '点击编辑跟进记录按钮');
        //提示父组件此时跟进为编辑状态
        this.props.setTraceEditStatus('edit');
        phoneAlertAction.setEditStatus({isEdittingTrace: true, submittingTraceMsg: ''});
        this.setState({
            showCancelBtn: true,
        });
    };

    //获取添加跟进记录的线索id
    getSaveTraceClueId() {
        let clueInfoArr = this.state.clueInfoArr;
        //默认保存到获取的客户列表中的第一个客户上
        let clue_id = _.isArray(clueInfoArr) && clueInfoArr[0] ? clueInfoArr[0].id : '';
        //从客户详情中打电话时，跟进记录直接加到当前详情中展示的客户上
        if (this.state.detailClueId) {
            clue_id = this.state.detailClueId;
        } else if (this.state.selectedClueId) {//该电话对应多个线索时，将跟进记录加到选择的线索上
            clue_id = this.state.selectedClueId;
        }
        return clue_id;
    }

    //取消保存跟进记录
    handleTraceCancel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.trace-content-container'), '取消保存跟进记录');
        phoneAlertAction.setEditStatus({isEdittingTrace: false, submittingTraceMsg: ''});
        this.props.setTraceEditStatus('text');
        this.setState({
            showCancelBtn: false
        });
    };
    //提交跟进记录
    handleTraceSubmit = () => {
        //跟进记录的id，只有当通话结束后(type=phone时)，推送过来的数据中才会有id
        var phonemsgObj = this.state.phonemsgObj;
        let trace_id = _.get(phonemsgObj, 'id');
        if (!trace_id) {
            phoneAlertAction.setSubmitErrMsg(Intl.get('phone.delay.save', '通话记录正在同步，请稍等再保存！'));
            return;
        }
        if (!_.trim(this.state.inputContent)) {
            phoneAlertAction.setSubmitErrMsg(Intl.get('customer.trace.content', '跟进记录内容不能为空'));
            return;
        }
        const submitObj = {
            id: trace_id,
            type: _.get(phonemsgObj, 'type', 'other'),
            remark: this.state.inputContent,
            call_date: _.get(phonemsgObj, 'call_date')
        };
        let clue_id = this.getSaveTraceClueId();
        if (clue_id) {
            submitObj.lead_id = clue_id;
        }
        phoneAlertAction.updateClueTrace(submitObj, () => {
            let updateData = {lead_id: clue_id, remark: this.state.inputContent};
            var curClue = this.state.curClue;
            ClueAction.afterAddClueTrace(curClue);
            ClueAction.updateCurrentClueRemark(updateData);
            this.setState({
                selectedClueId: '',
                isConnected: false,
                showCancelBtn: false,
            });
            //回调给父组件提示父组件此时跟进已经变为展示状态
            this.props.setTraceEditStatus('text');
            //写了跟进记录后，对应的首页我的工作完成
            if (window.location.pathname === '/home') {
                myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
            }
        });
    };
    //将输入框中的文字放在state上
    handleInputChange = (e) => {
        phoneAlertAction.setContent(e.target.value);
        if (e.target.value) {
            this.setState({
                visible: false
            });
        }
    };
    handleSelectCustomer = (clueId) => {
        this.setState({
            selectedClueId: clueId
        }, () => {
            var item = _.find(this.state.clueInfoArr, item => item.id === clueId);
            if (item.availability === AVALIBILITYSTATUS.INAVALIBILITY) {
                this.setState({
                    showMarkClueInvalid: false
                });
            } else {
                this.setState({
                    showMarkClueInvalid: true
                });
            }
        });
    };
    onClickMenu = ({key}) => {
        var commonPhoneDesArray = this.props.commonPhoneDesArray;
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
        this.setState({visible: flag});
    };

    renderTraceItem(phonemsgObj) {
        var onHide = function() {
            phoneAlertAction.setSubmitErrMsg('');
        };

        var clueInfoArr = _.get(this,'state.clueInfoArr[0]') ? this.state.clueInfoArr : [];
        if(_.isEmpty(clueInfoArr) && !this.state.isClueDetailCall && _.get(phonemsgObj,'leads[0]') ){
            clueInfoArr = phonemsgObj.leads;
        }
        const options = clueInfoArr.map((item) => (
            <Option value={item.id} key={item.id}>{item.name}</Option>
        ));
        var commonPhoneDesArray = this.props.commonPhoneDesArray;
        var saveCls = className('modal-submit-btn', {
            'showCls': this.isFinishedCall(phonemsgObj)
        });
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
                        <Dropdown overlay={menu} trigger={['click']} onVisibleChange={this.handleVisibleChange}
                            visible={this.state.visible}>
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
                        HANG_UP_TYPES.includes(phonemsgObj.type) ? <div className="btn-select-container">
                            {/*如果获取到的线索不止一个，要手动选择要关联的线索*/}
                            {clueInfoArr.length > 1 ?
                                <div className="select-add-trace-customer">
                                    {Intl.get('apply.select.trace.clue', '请选择要跟进的线索')}：
                                    <Select
                                        defaultValue={clueInfoArr[0].id}
                                        dropdownMatchSelectWidth={false}
                                        onChange={this.handleSelectCustomer}
                                    >
                                        {options}
                                    </Select>
                                </div> : null}
                            <Button type='primary' className={saveCls} onClick={this.handleTraceSubmit}
                                data-tracename="保存跟进记录">
                                {this.state.submittingTrace ? (Intl.get('retry.is.submitting', '提交中...')) : (Intl.get('common.save', '保存'))}
                            </Button>

                            {this.state.showCancelBtn ?
                                <Button onClick={this.handleTraceCancel}
                                    data-tracename="取消保存跟进记录">{Intl.get('common.cancel', '取消')}</Button>
                                : null}
                        </div> : null
                    }
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
    //通话结束
    isFinishedCall = (phonemsgObj) => {
        return phonemsgObj.type === PHONERINGSTATUS.phone || phonemsgObj.type === PHONERINGSTATUS.curtao_phone || phonemsgObj.type === PHONERINGSTATUS.call_back;
    };
    //获取页面上的描述
    getPhoneTipMsg = (phonemsgObj) => {
        //拨号的描述
        //如果是系统内拨号，展示联系人和电话，如果是从座机拨号，只展示所拨打的电话
        var phoneNum = this.props.contactNameObj && this.props.contactNameObj.contact ? this.props.contactNameObj.contact + '-' : '';
        if (phonemsgObj.call_type === 'IN') {
            phoneNum += phonemsgObj.extId;
            if (HANG_UP_TYPES.includes(phonemsgObj.type)) {
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
                desTipObj.tip = (
                    <ReleaseButton callClient={callClient} tip={tip} phoneNumber={phoneNum}> </ReleaseButton>);
            }
        } else if (phonemsgObj.type === PHONERINGSTATUS.ANSWERED) {
            let tip = `${Intl.get('call.record.phone.answered', '正在通话中')}`;
            desTipObj.tip = (<ReleaseButton callClient={callClient} tip={tip} phoneNumber={phoneNum}> </ReleaseButton>);
        } else if (phonemsgObj.type === PHONERINGSTATUS.phone || phonemsgObj.type === PHONERINGSTATUS.curtao_phone || phonemsgObj.type === PHONERINGSTATUS.call_back) {
            desTipObj.tip = `${Intl.get('call.record.phone.unknown', '结束通话')}`;
        }
        return desTipObj;
    }
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
            topic: _.get(this, 'state.curClue.name'),
            scheduleType: 'lead',
            socketio_notice: true,
            content: '',
            lead_id: _.get(this, 'state.curClue.id')
        };
        if (!submitObj.lead_id) {
            return;
        }
        
        this.setState({
            addClueSchedule: true
        });
        ScheduleAction.addSchedule(submitObj, (resData) => {
            if (resData.id) {
                this.setState({
                    hasAddedSchedlue: true
                });
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
            addClueSchedule: false,
            messageType: type,
            addClueScheduleMsg: content || '',
        });
    };
    hideSaveTooltip = () => {
        this.setState({
            messageType: '',
            addClueScheduleMsg: '',
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
        } else if (HANG_UP_TYPES.includes(phonemsgObj.type)) {
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
                        { //该电话有对应的客户可以展示跟进记录输入框，通话结束后，展示跟进记录的保存标签
                            this.renderTraceItem(phonemsgObj)}
                    </div>
                    {/*已转化的线索和无效线索不能展示这两个按钮*/}
                    {!this.state.isAddingMoreProdctInfo && !this.state.isAddingPlanInfo && ![SELECT_TYPE.HAS_TRANSFER].includes(_.get(this, 'state.curClue.status')) && _.get(this, 'state.curClue.availability') === AVALIBILITYSTATUS.AVALIBILITY ?
                        <div className="add-trace-and-plan">
                            {this.state.showMarkClueInvalid ? <div className="add-plan-info-container">
                                <div className="contact-tip">{Intl.get('crm.clue.next.contact.time', '下次联系时间')}
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer
                                                    time='3000'
                                                    message={this.state.addClueScheduleMsg}
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
                                    {this.state.addClueSchedule ? <Icon type="loading"/> : null}
                                </div>


                            </div> : null}

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
    detailClueId: '',
    isAddingMoreProdctInfo: false,
    contactNameObj: {},
    isAddingPlanInfo: false,
    handleAddPlan: function() {

    },
    closeAddPlan: function() {

    },
    commonPhoneDesArray: [],
    showMarkClueInvalid: function() {

    },
    curClue: {},
    isClueDetailCall: true
};
phoneStatusTop.propTypes = {
    addMoreInfoCls: PropTypes.string,
    phoneAlertModalTitleCls: PropTypes.string,
    phonemsgObj: PropTypes.object,
    addTraceItemId: PropTypes.string,
    detailClueId: PropTypes.string,
    isAddingMoreProdctInfo: PropTypes.bool,
    contactNameObj: PropTypes.object,
    isAddingPlanInfo: PropTypes.bool,
    handleAddPlan: PropTypes.bool,
    commonPhoneDesArray: PropTypes.object,
    showMarkClueInvalid: PropTypes.func,
    curClue: PropTypes.object,
    closeAddPlan: PropTypes.func,
    setTraceEditStatus: PropTypes.func, //添加跟进内容回调，获取编辑状态 'edit' 'text'
    isClueDetailCall: PropTypes.bool,
};
export default phoneStatusTop;