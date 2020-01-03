/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/6/10.
 */
var React = require('react');
require('../../css/clue_trace_list.less');
var ClueTraceStore = require('../../store/clue-trace-store');
var ClueTraceAction = require('../../action/clue-trace-action');
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import ShearContent from '../../../../../components/shear-content';
import {Dropdown, Icon, Button, Form, Input, Menu, message} from 'antd';
const FormItem = Form.Item;
const {TextArea} = Input;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {CALL_STATUS_MAP, AUTO_SIZE_MAP, CALL_TYPE_MAP, TRACE_NULL_TIP} from 'PUB_DIR/sources/utils/consts';
import {AntcDatePicker as DatePicker} from 'antc';
import ErrorDataTip from 'MOD_DIR/crm/public/views/components/error-data-tip';
import {processForTrace, CALL_RECORD_TYPE, LAYOUT_CONSTANTS} from 'MOD_DIR/crm/public/utils/crm-util';
import TimeLine from 'CMP_DIR/time-line-new';
import PhoneCallout from 'CMP_DIR/phone-callout';
var classNames = require('classnames');
import Trace from 'LIB_DIR/trace';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
//获取无效电话的列表  设置某个电话为无效电话
import {getInvalidPhone, addInvalidPhone} from 'LIB_DIR/utils/invalidPhone';
//电话类型（eefung电话类型，客套容联电话类型,客套APP电话类型）
const PHONE_TYPES = [CALL_RECORD_TYPE.PHONE, CALL_RECORD_TYPE.CURTAO_PHONE, CALL_RECORD_TYPE.APP];
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
var userData = require('PUB_DIR/sources/user-data');
var clueCustomerAction = require('../../action/clue-customer-action');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import {SELECT_TYPE, AVALIBILITYSTATUS, editCluePrivilege} from '../../utils/clue-customer-utils';
import {audioMsgEmitter, myWorkEmitter} from 'PUB_DIR/sources/utils/emitters';
const OVERVIEW_SHOW_COUNT = 3; //在概览中显示最近三条跟进
class ClueTraceList extends React.Component {
    state = {
        playingItemAddr: '',//正在播放的那条记录的地址
        leadId: this.props.curClue.id,
        addRecordPanelShow: false,//是否展示添加跟进记录面板
        invalidPhoneLists: [],//无效电话列表
        getInvalidPhoneErrMsg: '',//获取无效电话失败后的信息
        playingItemPhone: '',//正在听的录音所属的电话号码
        isAddingInvalidPhone: false,//正在添加无效电话
        addingInvalidPhoneErrMsg: '',//添加无效电话出错的情况
        // filterType: '',//跟进类型的过滤
        filterStatus: '',//通话状态的过滤
        addRecordNullTip: '',//添加跟进记录内容为空的提示
        editRecordNullTip: '', //编辑跟进内容为空的提示
        ...ClueTraceStore.getState(),
    };

    onStoreChange = () => {
        this.setState({...ClueTraceStore.getState()});
    };

    componentDidMount() {
        ClueTraceStore.listen(this.onStoreChange);
        setTimeout(() => {//此处不加setTimeout，调用action方法时会报Dispatch错误
            //获取线索的跟进记录
            this.getClueTraceList();
        });
        $(window).on('resize', this.onStoreChange);
    }

    componentWillReceiveProps(nextProps) {
        var nextLeadId = nextProps.curClue.id || '';
        var oldLeadId = this.props.curClue.id || '';
        if (nextLeadId !== oldLeadId && nextLeadId) {
            this.setState({
                playingItemAddr: '',
                playingItemPhone: '',
                leadId: nextLeadId
            });
            setTimeout(() => {//此处不加setTimeout，下面调用action中dismiss方法时会报Dispatch错误
                ClueTraceAction.dismiss();
                //获取客户跟踪记录列表
                this.getClueTraceList();
            });
        }
    }
    //获取列表失败后重试
    retryChangeRecord = () => {
        this.getClueTraceList();
    };
    //获取线索跟踪列表
    getClueTraceList = (lastId) => {
        let queryObj = {
            page_size: 10
        };
        if (this.state.start_time) {
            queryObj.start_time = this.state.start_time;
        }
        if (this.state.end_time) {
            queryObj.end_time = this.state.end_time;
        }
        if (lastId) {
            queryObj.id = lastId;
        }
        //概览页只获取最近三条的跟进记录
        if (this.props.isOverViewPanel) {
            queryObj.page_size = OVERVIEW_SHOW_COUNT;
        }

        let bodyData = {
            lead_id: this.state.leadId || ''
        };
        //线索池中的线索详情中不展示联系方式
        if (this.props.hideContactWay) {
            bodyData.hideContactWay = this.props.hideContactWay;
        }
        // //跟进类型的过滤
        // if (this.state.filterType === CALL_RECORD_TYPE.PHONE) {
        //     //电话类型：eefung电话+容联电话+客套APP电话
        //     bodyData.type = PHONE_TYPES.join(',');
        // } else if (this.state.filterType && this.state.filterType !== 'all') {
        //     bodyData.type = this.state.filterType;
        // } else {//全部及概览页的跟进记录，都过滤掉舆情上报的跟进记录（可以通过筛选舆情上报的类型来查看此类的跟进）
        let types = _.keys(CALL_TYPE_MAP);
        // 过滤掉舆情上报的跟进记录
        let typeArray = _.filter(types, type => type !== 'all' && type !== 'data_report');
        if (_.get(typeArray, '[0]')) {
            bodyData.type = typeArray.join(',');
        }
        // }
        //通话状态的过滤
        if (this.state.filterStatus && this.state.filterStatus !== 'ALL') {
            bodyData.disposition = this.state.filterStatus;
        }
        ClueTraceAction.getClueTraceList(queryObj, bodyData, () => {
            // if (_.isFunction(this.props.refreshSrollbar)) {
            //     setTimeout(() => {
            //         this.props.refreshSrollbar();
            //     });
            // }
        });
    };
    //上报客服电话
    handleAddInvalidPhone = () => {
        var curPhone = this.state.playingItemPhone;
        if (!curPhone) {
            return;
        }
        this.setState({
            isAddingInvalidPhone: true
        });
        addInvalidPhone({'number': curPhone}, () => {
            this.state.invalidPhoneLists.push(curPhone);
            this.setState({
                isAddingInvalidPhone: false,
                invalidPhoneLists: this.state.invalidPhoneLists,
                addingInvalidPhoneErrMsg: ''
            });
            //上报成功后，不展示上报按钮
            audioMsgEmitter.emit(audioMsgEmitter.HIDE_REPORT_BTN, {
                isShowReportButton: false
            });
        }, (errMsg) => {
            this.setState({
                isAddingInvalidPhone: false,
                addingInvalidPhoneErrMsg: errMsg || Intl.get('fail.report.phone.err.tip', '上报无效电话失败！')
            });
        });
    };

    componentWillUnmount() {
        ClueTraceStore.unlisten(this.onStoreChange);
        setTimeout(() => {
            ClueTraceAction.dismiss();
        });
    }

    //添加跟进记录面板的展示与隐藏
    toggleAddRecordPanel = () => {
        this.setState({addRecordPanelShow: !this.state.addRecordPanelShow});
    };

    onSelectDate = (start_time, end_time) => {
        ClueTraceAction.dismiss();
        ClueTraceAction.changeTimeRange({start_time, end_time});
        ClueTraceAction.setLoading();
        setTimeout(() => {
            this.getClueTraceList();
        });
    };

    renderDatePicker() {
        return (
            <DatePicker
                disableDateAfterToday={true}
                range="all"
                onSelect={this.onSelectDate}>
                <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                <DatePicker.Option value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                <DatePicker.Option
                    value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
            </DatePicker>
        );
    }
    //顶部增加客户跟进记录输入时的处理
    handleInputChange = (e) => {
        let value = e.target.value;
        //有输入的内容，则清空必填项验证的提示
        if (value) {
            ClueTraceAction.setContent({value: value, validateStatus: 'success', errorMsg: null});
        } else {
            ClueTraceAction.setContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
        }
    };
    handleAddDetailChange = (e) => {
        //补充客户跟进记录
        let value = e.target.value;
        if (value) {
            ClueTraceAction.setDetailContent({value: value, validateStatus: 'success', errorMsg: null});
        } else {
            ClueTraceAction.setDetailContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
        }
    };
    //渲染顶部增加记录的teaxare框
    renderAddRecordPanel = () => {
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
            colon: false
        };
        return (
            <Form className="add-customer-trace">
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('call.record.follow.content', '跟进内容')}
                    validateStatus={_.get(this.state, 'inputContent.validateStatus')}
                    help={_.get(this.state, 'inputContent.errorMsg')}
                >
                    <TextArea ref={addTextare => this['addTextare'] = addTextare} placeholder={Intl.get('customer.input.customer.trace.content', '请填写跟进内容')}
                        value={_.get(this.state, 'inputContent.value') || ''}
                        onChange={this.handleInputChange.bind(this)}
                        autosize={AUTO_SIZE_MAP}
                        autoFocus={true}
                    />
                </FormItem>
                <SaveCancelButton loading={this.state.addCustomerLoading}
                    saveErrorMsg={this.state.addCustomerErrMsg}
                    handleSubmit={this.saveAddTraceContent }
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    };
    //点击顶部取消按钮后
    handleCancel = (e) => {
        Trace.traceEvent(e, '关闭添加跟进内容输入区');
        ClueTraceAction.setContent({value: ''});
        this.toggleAddRecordPanel();
        this.setState({addRecordNullTip: ''});
    };
    saveAddTraceContent = (item) => {
        //顶部增加跟进记录的内容
        var leadId = this.state.leadId || '';
        if (!item.id) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '保存添加跟进内容');
            //点击顶部输入框下的保存按钮
            var addcontent = _.trim(_.get(this.state, 'inputContent.value'));
            if (addcontent) {
                var queryObj = {
                    lead_id: leadId,
                    type: 'other',//界面上没有选项，默认传other类型，必传
                    remark: addcontent,
                };
                ClueTraceAction.addClueTrace(queryObj, (customer_trace) => {
                    //更新列表中的最后联系
                    _.isFunction(this.props.updateCustomerLastContact) && this.props.updateCustomerLastContact(customer_trace);
                    //首页我的工作中，添加跟进后，需要将首页的相关工作去掉
                    if (window.location.pathname === '/home') {
                        myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
                    }
                    this.props.updateCustomerLastContact(queryObj);
                    this.toggleAddRecordPanel();
                });
            } else {
                ClueTraceAction.setContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
            }

        } else {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '添加补充的跟进内容');
            //点击补充客户跟踪记录编辑状态下的保存按钮
            var detail = _.trim(_.get(this.state, 'detailContent.value'));
            if (detail) {
                var queryObj = {
                    id: item.id,
                    lead_id: item.lead_id || leadId,
                    type: item.type,
                    remark: detail
                };
                ClueTraceAction.setUpdateId(item.id);
                ClueTraceAction.updateClueTrace(queryObj, () => {
                    //如果补充的是最后一条跟进记录（如果是电话类型的需要是打通的电话类型），更新列表中的最后联系
                    if (_.get(this.state, 'customerRecord[0].id') === item.id) {
                        this.props.updateCustomerLastContact(queryObj);
                        //首页我的工作中，打通电话后，需要将首页的相关工作去掉
                        if (window.location.pathname === '/home') {
                            myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
                        }
                    }
                });
            } else {
                ClueTraceAction.setDetailContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
            }
        }
    };

    handleCancelDetail = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.show-customer-trace .add-detail-container .cancel-btn'), '关闭补充跟进内容输入区');
        //点击补充客户跟进记录编辑状态下的取消按钮
        item.showAdd = false;
        ClueTraceAction.setDetailContent({value: '', cancelEdit: true});
    };
    onSelectFilterStatus = ({item, key, selectedKeys}) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.show-container'), `筛选跟进记录的类型为${key}`);
        this.setState({filterStatus: key});
        ClueTraceAction.dismiss();
        ClueTraceAction.setLoading();
        setTimeout(() => {
            this.getClueTraceList();
        });
    };
    getStatusMenu = () => {
        return (
            <Menu selectedKeys={[this.state.filterStatus]} onClick={this.onSelectFilterStatus}>
                {_.map(CALL_STATUS_MAP, (value, key) => {
                    return (<Menu.Item key={key}>
                        {value}
                    </Menu.Item>);
                })}
            </Menu>
        );
    };
    turnToTraceRecordList = () => {
        if (_.isFunction(this.props.changeActiveKey)) this.props.changeActiveKey('2');
    };

    renderTraceRecordBottom = () => {
        //概览页只展示最近的三条跟进记录，如果总数大于3条时，可以点击更多转到跟进记录列表进行查看
        if (this.props.isOverViewPanel && this.state.total > OVERVIEW_SHOW_COUNT) {
            return (
                <div className="trace-record-bottom">
                    <span className="more-customer-record"
                        data-tracename='点击更多按钮'
                        onClick={this.turnToTraceRecordList}>
                        {Intl.get('crm.basic.more', '更多')}
                    </span>
                </div>);
        }
    };
    //是否展示通话状态的过滤框
    isStatusFilterShow() {
        //不是概览页，有跟进记录或有通话状态筛选条件（有数据时才展示状态筛选框，但通过状态筛选后无数据也需要展示），并且不是拜访、舆情报上和其他类型时，展示通话状态筛选框
        return !this.props.isOverViewPanel && (_.get(this.state, 'customerRecord[0]') || this.state.filterStatus);
    }
    getRecordListShowHeight = () => {
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT -
            LAYOUT_CONSTANTS.TIME_ADD_BTN_HEIGHT - LAYOUT_CONSTANTS.STATISTIC_TYPE_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        let basicInfoHeight = parseInt($('.clue-basic-info-container').outerHeight(true));
        //减头部的客户基本信息高度
        divHeight -= basicInfoHeight;
        if ($('.phone-alert-modal-title').size()) {
            divHeight -= $('.phone-alert-modal-title').outerHeight(true);
        }
        //减添加跟进记录面版的高度
        if (this.state.addRecordPanelShow) {
            divHeight -= LAYOUT_CONSTANTS.ADD_TRACE_HEIGHHT;
        }
        return divHeight;
    };
    renderAddDetail = (item) => {
        //补充跟进记录
        return (
            <Form className="add-customer-trace">
                <FormItem
                    colon={false}
                    wrapperCol={{span: 24}}
                    validateStatus={_.get(this.state, 'detailContent.validateStatus')}
                    help={_.get(this.state, 'detailContent.errorMsg')}
                >
                    <TextArea ref={updateTextare => this['updateTextare' + item.id] = updateTextare} placeholder={Intl.get('customer.add.customer.trace.detail', '请补充跟进记录详情')}
                        value={_.get(this.state, 'detailContent.value') || ''}
                        onChange={this.handleAddDetailChange.bind(this)}
                        autosize={AUTO_SIZE_MAP}
                    />
                </FormItem>
                {this.state.editRecordNullTip ? (
                    <div className="record-null-tip">{this.state.editRecordNullTip}</div>) : null}
                <SaveCancelButton loading={this.state.addCustomerLoading}
                    saveErrorMsg={this.state.addCustomerErrMsg}
                    handleSubmit={this.saveAddTraceContent .bind(this, item)}
                    handleCancel={this.handleCancelDetail.bind(this, item)}
                />
            </Form>);
    };
    editDetailContent = (item, e) => {
        e.stopPropagation();
        //不能编辑时
        if (this.props.disableEdit) return;
        //如果有一个在编辑，或正在添加跟进时，再点击修改时
        if (this.state.isEdit || this.state.addRecordPanelShow) {
            message.error(Intl.get('crm.save.customertrace.first', '请先保存或取消正在编辑的跟进记录内容'));
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.show-container .item-detail-content .add-detail-tip'), '点击补充跟进内容区域');
        item.showAdd = true;
        let remark = _.get(item, 'remark', '');
        ClueTraceAction.setDetailContent({value: remark});
    };
    //渲染补充跟进记录的提示
    renderSupplementTip(item) {
        return this.props.disableEdit ? null : (
            <span className="add-detail-tip" onClick={this.editDetailContent.bind(this, item)} data-tracename='点击补充跟进内容按钮'>
                {Intl.get('click.to.add.trace.detail', '请点击此处补充跟进内容')}
            </span>);
    }
    //渲染跟进记录的展示内容
    renderRecordShowContent = (item) => {
        //是否是编辑跟进记录，有跟进内容并且能编辑(没有跟进内容时是补充跟进记录)
        let isEditRecord = item.remark && !this.props.disableEdit;
        //是否展示编辑按钮,有跟进内容(没有跟进内容时是补充跟进记录)，能编辑，并且没有正在编辑的跟进记录，并且没有正在添加跟进记录
        let showEidtBtn = item.remark && !this.props.disableEdit && !this.state.isEdit && !this.state.addRecordPanelShow && editCluePrivilege(this.props.curClue);
        return (
            <div className="record-content-show">
                {item.remark ? (<ShearContent key={item.id}>{item.remark}</ShearContent>) : this.renderSupplementTip(item)}
                {showEidtBtn ? <DetailEditBtn
                    title={Intl.get('common.edit', '编辑')}
                    onClick={this.editDetailContent.bind(this, item)}
                /> : null}
            </div>);
    };

    //点击播放录音
    handleAudioPlay = (item) => {
        //未上传录音文件时，不播放
        if (item.is_record_upload !== '1') return;
        //如果是点击切换不同的录音，找到上次点击播放的那一条记录，把他的playSelected属性去掉
        var oldItemId = '';
        var oldSelected = _.find(this.state.customerRecord, function(record) {
            return record.playSelected;
        });
        if (oldSelected) {
            delete oldSelected.playSelected;
            oldItemId = oldSelected.id;
        }
        //给本条记录加上标识
        item.playSelected = true;
        var playItemAddr = commonMethodUtil.getAudioRecordUrl(item.local, item.recording, item.type);
        var isShowReportButton = true;//_.indexOf(this.state.invalidPhoneLists, item.dst) === -1;
        audioMsgEmitter.emit(audioMsgEmitter.OPEN_AUDIO_PANEL, {
            playingItemAddr: playItemAddr,
            getInvalidPhoneErrMsg: this.state.getInvalidPhoneErrMsg,
            addingInvalidPhoneErrMsg: this.state.addingInvalidPhoneErrMsg,
            isAddingInvalidPhone: this.state.isAddingInvalidPhone,
            isShowReportButton: isShowReportButton,
            closeAudioPlayContainer: this.closeAudioPlayContainer,
            handleAddInvalidPhone: this.handleAddInvalidPhone,
            hideErrTooltip: this.hideErrTooltip,
        });

        this.setState({
            customerRecord: this.state.customerRecord,
            playingItemAddr: playItemAddr,
            playingItemPhone: item.dst //正在播放的录音所属的电话号码
        }, () => {
            var audio = $('#audio')[0];
            if (audio) {
                if (oldItemId && oldItemId === item.id) {
                    //点击当前正在播放的那条记录，重新播放
                    audio.currentTime = 0;
                } else {
                    //播放某条新记录
                    audio.play();
                }
            }
        });
    };
    //提示框隐藏后的处理
    hideErrTooltip = () => {
        this.setState({
            addingInvalidPhoneErrMsg: ''
        });
    };

    //关闭音频播放按钮
    closeAudioPlayContainer = (e) => {
        Trace.traceEvent(e, '关闭播放器按钮');
        //找到当前正在播放的那条记录
        var oldSelected = _.find(this.state.customerRecord, function(item) {
            return item.playSelected;
        });
        if (oldSelected) {
            delete oldSelected.playSelected;
        }
        this.setState({
            customerRecord: this.state.customerRecord,
            playingItemAddr: '',
            playingItemPhone: ''
        });
    };
    //标记线索无效或者有效
    handleClickInvalidBtn = (item, callback) => {
        var updateValue = AVALIBILITYSTATUS.INAVALIBILITY;
        if (item.availability === AVALIBILITYSTATUS.INAVALIBILITY) {
            updateValue = AVALIBILITYSTATUS.AVALIBILITY;
        }
        var submitObj = {
            id: item.id,
            availability: updateValue
        };
        this.setState({
            isInvalidClue: true,
        });
        clueCustomerAction.updateCluecustomerDetail(submitObj, (result) => {
            if (_.isString(result)) {
                this.setState({
                    isInvalidClue: false,
                });
            } else {
                _.isFunction(callback) && callback(updateValue);
                var curClue = this.state.curClue;
                curClue.invalid_info = {
                    user_name: userData.getUserData().nick_name,
                    time: moment().valueOf()
                };
                curClue.availability = updateValue;
                clueCustomerAction.updateClueProperty({
                    id: item.id,
                    availability: updateValue,
                    status: SELECT_TYPE.HAS_TRACE
                });
                this.setState({
                    isInvalidClue: false,
                    curClue: curClue
                });
            }
        });
    };
    renderTimeLineItem = (item, hasSplitLine) => {
        var traceObj = processForTrace(item);
        //如果是其他类型的，需要把描述修改一下
        if (item.type === CALL_RECORD_TYPE.OTHER){
            traceObj.traceDsc = Intl.get('clue.customer.trace.clues', '跟进线索');
        }
        //渲染时间线
        var iconClass = traceObj.iconClass, title = traceObj.title, traceDsc = traceObj.traceDsc;
        //是否上传了录音文件
        let is_record_upload = item.is_record_upload === '1';
        //playSelected表示当前正在播放的那条录音，图标显示红色
        var cls = classNames('iconfont', 'icon-play', {
            'icon-selected': item.playSelected,
            'icon-play-disable': !is_record_upload
        });
        return (
            <div className={classNames('trace-item-content', {'day-split-line': hasSplitLine})}>
                <p className="item-detail-tip">
                    <span className="icon-container" title={title}><i className={iconClass}></i></span>
                    {traceDsc ? (<span className="trace-title-name" title={traceDsc}>{traceDsc}</span>) : null}
                    {_.includes(PHONE_TYPES, item.type) ? (<span className="trace-title-phone">{item.dst}</span>) : null}
                </p>
                <div className="trace-content">
                    <div className="item-detail-content" id={item.id}>
                        {item.showAdd ? this.renderAddDetail(item) : this.renderRecordShowContent(item)}
                    </div>
                    <div className="item-bottom-content">
                        {item.billsec === 0 ? (/*未接听*/
                            <span className="call-un-answer">
                                {Intl.get('call.record.state.no.answer', '未接听')}
                            </span>
                        ) : /* 电话已接通并且有recording这个字段展示播放图标*/
                            item.recording ? (
                                <span className="audio-container"
                                    title={is_record_upload ? Intl.get('call.record.play', '播放录音') : Intl.get('crm.record.unupload.phone', '未上传通话录音，无法播放')}>
                                    <span className={cls} onClick={this.handleAudioPlay.bind(this, item)}
                                        data-tracename="点击播放录音按钮">
                                        <span className="call-time-descr">
                                            {TimeUtil.getFormatMinuteTime(item.billsec)}
                                        </span>
                                    </span>
                                </span>
                            ) : null
                        }
                        {_.includes(PHONE_TYPES, item.type) && editCluePrivilege(this.props.curClue) ?
                            (<span className="phone-call-out-btn handle-btn-item" title={Intl.get('crm.click.call.phone', '点击拨打电话')}>
                                <PhoneCallout
                                    phoneNumber={item.dst}
                                    hidePhoneNumber={true}
                                    type="lead"
                                    id={item.lead_id}
                                />
                            </span>) : null}
                        <span className="item-bottom-right">
                            <span className="sale-name">{item.nick_name}</span>
                            <span className="trace-record-time">
                                {moment(item.time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        );
    };
    renderTimeLine = () => {
        return (
            <TimeLine
                list={this.state.customerRecord}
                groupByDay={true}
                groupByYear={true}
                timeField="time"
                renderTimeLineItem={this.renderTimeLineItem}
                relativeDate={false}
            />);
    };
    //添加跟进按钮
    tipRecordButton = () => {
        //详情还是概览；是不是已有记录
        if(this.props.isOverViewPanel){
            if(this.state.customerRecord.length){
                return (<span className="iconfont icon-add handle-btn-item" onClick={this.toggleAddRecordPanel.bind(this)}
                    title={Intl.get('sales.frontpage.add.customer', '添加跟进记录')} data-tracename="点击添加跟进记录按钮"/>);
            }else{
                return(
                    <a className="handle-btn-item no-data-device" onClick={this.toggleAddRecordPanel.bind(this)} data-tracename="点击添加跟进内容按钮">{Intl.get('clue.add.trace.content', '添加跟进内容')}</a>
                );
            }
        }else{
            return (
                <Button className='crm-detail-add-btn'
                    onClick={this.toggleAddRecordPanel.bind(this, '')} data-tracename="添加跟进记录">
                    {Intl.get('sales.frontpage.add.customer', '添加跟进记录')}
                </Button>
            );
        }
    }

    renderClueTraceLists = () => {
        var recordLength = _.get(this, 'state.customerRecord.length');
        //加载状态或加载数据错误时，容器高度的设置
        let loadingErrorHeight = this.props.isOverViewPanel ? LAYOUT_CONSTANTS.OVER_VIEW_LOADING_HEIGHT : this.getRecordListShowHeight();
        if (this.state.customerRecordLoading && this.state.curPage === 1) {
            //加载中的情况
            return (
                <div className="customer-trace-loading" style={{'height': loadingErrorHeight }}>
                    <Spinner/>
                </div>
            );
        } else if (this.state.customerRecordErrMsg && !this.state.customerRecordLoading) {
            //加载完成，出错的情况
            return (
                <div className="no-record-container" style={{'height': loadingErrorHeight}}>
                    <ErrorDataTip errorMsg={this.state.customerRecordErrMsg} isRetry={true}
                        retryFunc={this.retryChangeRecord}/>
                </div>
            );
        } else if (recordLength === 0 && !this.state.customerRecordLoading && !this.props.isOverViewPanel) {
            //加载完成，没有数据的情况（概览页的跟进记录是在标题上展示）
            return (
                <div className="no-record-container" style={{'height': this.getRecordListShowHeight()}}>
                    <NoDataIconTip tipContent={Intl.get('common.no.more.trace.record', '暂无跟进记录')}/>
                </div>);
        } else {
            //加载完成，有数据的情况
            return (
                <div className="show-customer-trace">
                    {this.props.isOverViewPanel ? this.renderTimeLine() :
                        (<div className="show-content" style={{'height': this.getRecordListShowHeight()}}>
                            <GeminiScrollbar className="srollbar-out-card-style"
                                handleScrollBottom={this.handleScrollBarBottom}
                                listenScrollBottom={this.state.listenScrollBottom}
                            >
                                {this.renderTimeLine()}
                            </GeminiScrollbar>
                        </div>)}
                </div>
            );
        }
    };
    //监听下拉加载
    handleScrollBarBottom = () => {

        var length = this.state.customerRecord.length;
        if (length < this.state.total) {
            var lastId = this.state.customerRecord[length - 1].id;
            this.getClueTraceList(lastId);
        } else if (length === this.state.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    };
    render() {
        //是不是可以添加跟进
        let hasAddRecordPrivilege = !this.props.disableEdit && !this.state.isEdit && editCluePrivilege(this.props.curClue);
        return (
            <div className="clue-trace-container" data-tracename="线索跟进记录页面" id="clue-trace-container">
                <div className="top-hander-wrap">
                    {this.props.isOverViewPanel ? null : this.renderDatePicker()}
                    {hasAddRecordPrivilege ? this.tipRecordButton() : null}
                </div>
                {this.state.addRecordPanelShow ? this.renderAddRecordPanel() : null}
                <div className="show-container" id="show-container">
                    {this.isStatusFilterShow() ? <Dropdown overlay={this.getStatusMenu()} trigger={['click']}>
                        <a className="ant-dropdown-link trace-filter-item">
                            {this.state.filterStatus ? CALL_STATUS_MAP[this.state.filterStatus] : Intl.get('call.record.call.state', '通话状态')}
                            <Icon type="down"/>
                        </a>
                    </Dropdown> : null}
                    {this.renderClueTraceLists()}
                    {this.renderTraceRecordBottom()}
                </div>
            </div>
        );
    }
}
function noop(){}
ClueTraceList.defaultProps = {
    disableEdit: false,
    currentId: '',
    ShowCustomerUserListPanel: noop,
    updateCustomerLastContact: noop,
    curClue: {},
    isOverViewPanel: false,
    changeActiveKey: noop,
    hideContactWay: false,
};
ClueTraceList.propTypes = {
    disableEdit: PropTypes.bool,
    currentId: PropTypes.string,
    ShowCustomerUserListPanel: PropTypes.func,
    updateCustomerLastContact: PropTypes.func,
    curClue: PropTypes.object,
    isOverViewPanel: PropTypes.bool,
    changeActiveKey: PropTypes.func,
    hideContactWay: PropTypes.bool,
};
module.exports = ClueTraceList;


