/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/23.
 */
const PropTypes = require('prop-types');
var React = require('react');
import {Button, Tag, Select, Input, Menu, Dropdown} from 'antd';
const {TextArea} = Input;
const Option = Select.Option;
import Trace from 'LIB_DIR/trace';
import {PHONERINGSTATUS, HANG_UP_TYPES} from 'MOD_DIR/phone_panel/public/consts';
import {getCallClient, AcceptButton, ReleaseButton} from 'PUB_DIR/sources/utils/phone-util';
var phoneAlertAction = require('../action/phone-alert-action');
var phoneAlertStore = require('../store/phone-alert-store');
var ClueAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var AlertTimer = require('CMP_DIR/alert-timer');
var className = require('classnames');
import {AVALIBILITYSTATUS} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
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
            visible: false//跟进内容下拉框是否展示
        };
    }

    componentDidMount() {
        phoneAlertStore.listen(this.onStoreChange);
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
            detailClueId: nextProps.detailClueId,
            phonemsgObj: phonemsgObj,
            isAddingMoreProdctInfo: nextProps.isAddingMoreProdctInfo,
            isAddingPlanInfo: nextProps.isAddingPlanInfo
        });
        //如果接听后，把状态isConnected 改为true
        if (phonemsgObj.type === PHONERINGSTATUS.ANSWERED) {
            this.setState({
                isConnected: true
            });
        }
        var showClueModal = _.get($('#clue-phone-status-content'),'length',0) > 0;
        if ((showClueModal) && phonemsgObj.type === PHONERINGSTATUS.ALERT) {
            this.setInitialData(phonemsgObj);
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
        phoneAlertAction.setEditStatus({isEdittingTrace: true, submittingTraceMsg: ''});
        this.setState({
            showCancelBtn: true,
        });
    };

    //获取添加跟进记录的线索id
    getSaveTraceClueId(){
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
        if (!_.trim(this.state.inputContent)){
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
            ClueAction.updateCurrentClueRemark(updateData);
            this.setState({
                selectedClueId: '',
                isConnected: false,
                showCancelBtn: false
            });
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
    handleSelectCustomer = (clueId) => {
        this.setState({
            selectedClueId: clueId
        },() => {
            var item = _.find(this.state.clueInfoArr, item => item.id === clueId);
            if (item.availability === AVALIBILITYSTATUS.INAVALIBILITY){
                this.setState({
                    showMarkClueInvalid: false
                });
            }else{
                this.setState({
                    showMarkClueInvalid: true
                });
            }
        });
    };
    onClickMenu = ({ key }) => {
        var commonPhoneDesArray = this.props.commonPhoneDesArray;
        var inputContent = commonPhoneDesArray[key];
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
        const options = this.state.clueInfoArr.map((item) => (
            <Option value={item.id} key={item.id}>{item.name}</Option>
        ));
        var commonPhoneDesArray = this.props.commonPhoneDesArray;
        var saveCls = className('modal-submit-btn',{
            'showCls': this.isFinishedCall(phonemsgObj)
        });
        const menu =
            <Menu onClick={this.onClickMenu}>{_.isArray(commonPhoneDesArray) ? commonPhoneDesArray.map((Des, idx) => {
                //如果电话已经接通，不需要展示 “未接通这个提示”
                if (phonemsgObj.billsec > 0 && idx === 0) {
                    return;
                }
                return (<Menu.Item key={idx} value={Des}>{Des}</Menu.Item>);
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
                        HANG_UP_TYPES.includes(phonemsgObj.type) ? <div className="btn-select-container">
                            {/*如果获取到的客户不止一个，要手动选择要关联的客户*/}
                            {this.state.clueInfoArr.length > 1 ?
                                <div className="select-add-trace-customer">
                                    {Intl.get('apply.select.trace.clue', '请选择要跟进的线索')}：
                                    <Select
                                        defaultValue={this.state.clueInfoArr[0].id}
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

    //将线索标为无效
    handleSetClueInvalid = () => {
        var item = {};
        if (this.state.selectedClueId){
            item = _.find(this.state.clueInfoArr, item => item.id === this.state.selectedClueId);
        }
        this.props.handleSetClueInvalid(item,(updateValue) => {
            item.availability = updateValue;
            if (updateValue === AVALIBILITYSTATUS.INAVALIBILITY){
                this.setState({
                    showMarkClueInvalid: false
                });
            }else{
                this.setState({
                    showMarkClueInvalid: true
                });
            }
        });
    };
    //点击添加联系计划
    handleAddPlan = () => {
        this.props.handleAddPlan();
    };
    //挂断电话
    releaseCall = (called) => {
        if (getCallClient()) {
            getCallClient().releaseCall();
        }
    };

    render() {
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
                            this.getSaveTraceClueId() ? this.renderTraceItem(phonemsgObj) : null
                        }
                    </div>
                    {!this.state.isAddingMoreProdctInfo && !this.state.isAddingPlanInfo ?
                        <div className="add-trace-and-plan">
                            <div className="add-more-info-container">
                                <Button size="small"
                                    onClick={this.handleSetClueInvalid}>{this.state.showMarkClueInvalid ? Intl.get('clue.customer.set.invalid', '标为无效') : Intl.get('clue.cancel.set.invalid', '改为有效')}</Button>
                            </div>
                            {this.state.showMarkClueInvalid ? <div className="add-plan-info-container">
                                <Button size="small"
                                    onClick={this.handleAddPlan}>{Intl.get('crm.214', '添加联系计划')}</Button>
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
    handleSetClueInvalid: function() {
    },
    isAddingPlanInfo: false,
    handleAddPlan: function() {

    },
    commonPhoneDesArray: [],
    showMarkClueInvalid: function() {

    }
};
phoneStatusTop.propTypes = {
    addMoreInfoCls: PropTypes.string,
    phoneAlertModalTitleCls: PropTypes.string,
    phonemsgObj: PropTypes.object,
    addTraceItemId: PropTypes.string,
    detailClueId: PropTypes.string,
    isAddingMoreProdctInfo: PropTypes.bool,
    contactNameObj: PropTypes.object,
    handleSetClueInvalid: PropTypes.func,
    isAddingPlanInfo: PropTypes.bool,
    handleAddPlan: PropTypes.bool,
    commonPhoneDesArray: PropTypes.object,
    showMarkClueInvalid: PropTypes.func,
};
export default phoneStatusTop;