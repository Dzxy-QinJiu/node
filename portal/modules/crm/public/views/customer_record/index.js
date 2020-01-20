/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
const SalesHomeAction = require('MOD_DIR/common_sales_home_page/public/action/sales-home-actions');
var React = require('react');
var language = require('../../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../../css/customer-trace-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../../css/customer-trace-zh_CN.less');
}
import {Icon, message, Radio, Input, Menu, Dropdown, Button, Form, Tooltip, Col, Row} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
import CustomerRecordActions from '../../action/customer-record-action';
import CustomerRecordStore from '../../store/customer-record-store';
import recordAjax from '../../ajax/customer-record-ajax';
var GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
var Spinner = require('../../../../../components/spinner');
import ModalDialog from 'CMP_DIR/ModalDialog';
import Trace from 'LIB_DIR/trace';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import ajax from '../../ajax/contact-ajax';
//获取无效电话的列表  设置某个电话为无效电话
import {getInvalidPhone, addInvalidPhone} from 'LIB_DIR/utils/invalidPhone';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import TimeLine from 'CMP_DIR/time-line-new';
import ErrorDataTip from '../components/error-data-tip';
import appAjaxTrans from 'MOD_DIR/common/public/ajax/app';
import {decodeHTML, isOpenCaller} from 'PUB_DIR/sources/utils/common-method-util';
import {REPORT_TYPE} from 'PUB_DIR/sources/utils/consts';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import ShearContent from 'CMP_DIR/shear-content-new';
import PhoneCallout from 'CMP_DIR/phone-callout';
var classNames = require('classnames');
import {AntcDatePicker as DatePicker} from 'antc';
import {CALL_RECORD_TYPE, processForTrace, LAYOUT_CONSTANTS} from './../../utils/crm-util';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
//电话类型（eefung电话类型，客套容联电话类型,客套APP电话类型）
const PHONE_TYPES = [CALL_RECORD_TYPE.PHONE, CALL_RECORD_TYPE.CURTAO_PHONE, CALL_RECORD_TYPE.APP];
import {CALL_STATUS_MAP, AUTO_SIZE_MAP, CALL_TYPE_MAP, TRACE_NULL_TIP} from 'PUB_DIR/sources/utils/consts';
const OVERVIEW_SHOW_COUNT = 5;//概览页展示跟进记录的条数
import {audioMsgEmitter, myWorkEmitter, phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {isOrganizationEefung} from 'PUB_DIR/sources/utils/common-method-util'; //判断是否在蚁坊域
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {getDetailLayoutHeight} from '../../utils/crm-util';
//除去固定的电话、拜访、其他以外的类型的缓存数据，获取后存起来，不用每次都取
let extraTraceTypeList = [];
class CustomerRecord extends React.Component {
    state = {
        playingItemAddr: '',//正在播放的那条记录的地址
        customerId: this.props.curCustomer.id,
        invalidPhoneLists: [],//无效电话列表
        getInvalidPhoneErrMsg: '',//获取无效电话失败后的信息
        playingItemPhone: '',//正在听的录音所属的电话号码
        isAddingInvalidPhone: false,//正在添加无效电话
        addingInvalidPhoneErrMsg: '',//添加无效电话出错的情况
        addRecordPanelShow: false,//是否展示添加跟进记录面板
        filterType: '',//跟进类型的过滤
        filterStatus: '',//通话状态的过滤
        appList: [],//应用列表，用来展示舆情上报的应用名称
        addRecordNullTip: '',//添加跟进记录内容为空的提示
        editRecordNullTip: '', //编辑跟进内容为空的提示
        extraTraceTypeList: [], //除去固定的电话、拜访、其他以外的类型
        layoutHeight: getDetailLayoutHeight(),//根据记录展示区高度
        ...CustomerRecordStore.getState()
    };

    onStoreChange = () => {
        var state = CustomerRecordStore.getState();
        this.setState(state);
    };

    componentDidMount() {
        CustomerRecordStore.listen(this.onStoreChange);
        this.getExtraTraceType();
        //获取所有联系人的联系电话，通过电话和客户id获取跟进记录
        var customer_id = this.props.curCustomer.customer_id || this.props.curCustomer.id;
        if (!customer_id) return;
        setTimeout(() => {//此处不加setTimeout，下面获取联系电话方法中调用action中setLoading方法时会报Dispatch错误
            //获取跟进记录的分类统计
            this.getCustomerTraceStatistic();
            //获取客户跟踪记录列表
            this.getCustomerTraceList();
        });
        //获取无效电话号码列表
        getInvalidPhone((data) => {
            this.setState({
                invalidPhoneLists: data.result,
                getInvalidPhoneErrMsg: ''
            });
        }, (errMsg) => {
            this.setState({
                invalidPhoneLists: [],
                getInvalidPhoneErrMsg: errMsg || Intl.get('call.record.get.invalid.phone.lists', '获取无效电话列表失败')
            });
        });
        this.getAppList();
        $(window).on('resize', this.resizeLayoutHeight);
        // 监听到拨打电话状态展示区高度改变后，重新计算高度
        phoneMsgEmitter.on(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT, this.resizeLayoutHeight);
    }
    
    componentWillUnmount() {
        CustomerRecordStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.resizeLayoutHeight);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT, this.resizeLayoutHeight);
        setTimeout(() => {
            CustomerRecordActions.dismiss();
        });
    }

    resizeLayoutHeight = () => {
        this.setState({ layoutHeight: getDetailLayoutHeight() });
    }
    //获取某组织内跟进记录的类型（除去固定的电话、拜访、其他以外的类型）
    getExtraTraceType() {
        //未获取过额外跟进类型，需要获取一遍存起来，下次不用再取
        if (_.isEmpty(extraTraceTypeList)) {
            recordAjax.getExtraTraceType().then((data) => {
                extraTraceTypeList = _.get(data, 'result', []);
                this.setState({extraTraceTypeList});
            }, (errorMsg) => {
                extraTraceTypeList = [];
                this.setState({extraTraceTypeList});
            });
        } else {//已获取过可以直接用
            this.setState({extraTraceTypeList});
        }
    }

    //获取跟进记录的分类统计
    getCustomerTraceStatistic() {
        let queryParams = {
            customer_id: this.state.customerId || ''
        };
        if (this.state.start_time) {
            queryParams.start_time = this.state.start_time;
        }
        if (this.state.end_time) {
            queryParams.end_time = this.state.end_time;
        }
        CustomerRecordActions.getCustomerTraceStatistic(queryParams);
    }

    getAppList = () => {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(list => {
            let appList = _.isArray(list) ? list : [];
            this.setState({appList: appList});
        });
    };

    //获取客户跟踪列表
    getCustomerTraceList = (lastId) => {
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
        //概览页只获取最近五条的跟进记录
        if (this.props.isOverViewPanel) {
            queryObj.page_size = OVERVIEW_SHOW_COUNT;
        }
        let bodyData = {
            customer_id: this.state.customerId || '',
        };
        //客户池中的客户详情中不展示联系方式
        if (this.props.hideContactWay) {
            bodyData.hideContactWay = this.props.hideContactWay;
        }
        //跟进类型的过滤
        if (this.state.filterType === CALL_RECORD_TYPE.PHONE){
            //电话类型：eefung电话+容联电话+客套APP电话
            bodyData.type = PHONE_TYPES.join(',');
        } else if (this.state.filterType && this.state.filterType !== 'all' && this.state.filterType !== 'public_opinion_report') {
            bodyData.type = this.state.filterType;
        } else {//全部及概览页的跟进记录，都过滤掉"舆情上报"和“舆情报告”的跟进记录（可以通过筛选“舆情上报”和“舆情报告”的类型来查看此类的跟进）
            let types = _.keys(CALL_TYPE_MAP);
            // 过滤掉“舆情上报”和“舆情报告”的跟进记录
            let typeArray = _.filter(types, type => type !== 'all' && type !== 'data_report' && type !== 'public_opinion_report');
            if (_.get(typeArray, '[0]')) {
                bodyData.type = typeArray.join(',');
            }
        }
        //通话状态的过滤
        if (this.state.filterStatus && this.state.filterStatus !== 'ALL') {
            bodyData.disposition = this.state.filterStatus;
        }
        //舆情报告的信息用另外的接口获取
        if(_.isEqual(this.state.filterType, 'public_opinion_report')) {
            //获取已通过的舆情报告
            let queryParam = {
                sort_field: 'create_time',
                order: 'descend',
                page_size: 10,
                type: APPLY_APPROVE_TYPES.OPINION_REPORT,
                comment_unread: false,
                status: 'pass',
                customer_id: bodyData.customer_id
            };
            if(lastId) {
                queryParam.id = lastId;
            }
            CustomerRecordActions.getPublicOpinionReports(queryParam, () => {
                if (_.isFunction(this.props.refreshSrollbar)) {
                    setTimeout(() => {
                        this.props.refreshSrollbar();
                    });
                }
            });
        } else {
            CustomerRecordActions.getCustomerTraceList(queryObj, bodyData, () => {
                if (_.isFunction(this.props.refreshSrollbar)) {
                    setTimeout(() => {
                        this.props.refreshSrollbar();
                    });
                }
            });
        }
    };

    componentWillReceiveProps(nextProps) {
        var nextCustomerId = nextProps.curCustomer.customer_id || nextProps.curCustomer.id || '';
        var oldCustomerId = this.props.curCustomer.customer_id || this.props.curCustomer.id || '';
        if (nextCustomerId !== oldCustomerId && nextCustomerId) {
            this.setState({
                playingItemAddr: '',
                playingItemPhone: '',
                customerId: nextCustomerId
            });
            setTimeout(() => {//此处不加setTimeout，下面调用action中dismiss方法时会报Dispatch错误
                CustomerRecordActions.dismiss();
                //获取客户跟踪记录列表
                this.getCustomerTraceList();
                //获取分类统计
                this.getCustomerTraceStatistic();
            });
        }
    }

    handleChange = (event) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('#add-container .ant-select-selection'), '选择跟进记录的类型');
        CustomerRecordActions.setType(event.target.value);
    };

    //获取列表失败后重试
    retryChangeRecord = () => {
        CustomerRecordActions.setLoading();
        this.getCustomerTraceList();
    };

    saveAddTraceContent = (type) => {
        //顶部增加跟进记录的内容
        var customerId = this.state.customerId || '';
        if (type === 'add') {
            //输入框中的内容
            var addcontent = _.trim(_.get(this.state, 'inputContent.value'));
            var queryObj = {
                customer_id: customerId,
                type: this.state.selectedtracetype,
                remark: addcontent,
            };
            CustomerRecordActions.addCustomerTrace(queryObj, (customer_trace) => {
                //更新列表中的最后联系
                _.isFunction(this.props.updateCustomerLastContact) && this.props.updateCustomerLastContact(customer_trace);
                //首页我的工作中，添加跟进后，需要记录完成工做的状态，关闭详情时将首页的相关工作设为已完成
                if (window.location.pathname === '/home') {
                    myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
                }
                this.toggleAddRecordPanel();
                //处理旧版首页中对新增但未分配的客户的跟进操作，页面中删除掉此次操作跟进的用户
                SalesHomeAction.updatePageNewDistributeCustomer(queryObj.customer_id);
            });
            // $('.add-content-input').focus();
        } else {
            //补充跟进记录的内容
            var detail = _.trim(_.get(this.state, 'detailContent.value'));
            var item = this.state.edittingItem;
            var queryObj = {
                id: item.id,
                customer_id: item.customer_id || customerId,
                type: item.type,
                remark: detail
            };
            //把跟进记录中的最后一条电话数据进行标识
            if (item.id === this.state.lastPhoneTraceItemId) {
                queryObj.last_callrecord = 'true';
            }
            CustomerRecordActions.setUpdateId(item.id);
            CustomerRecordActions.updateCustomerTrace(queryObj, () => {
                //如果补充的是最后一条跟进记录（如果是电话类型的需要是打通的电话类型），更新列表中的最后联系
                if (_.get(this.state, 'customerRecord[0].id') === item.id) {
                    //打通电话的才会更新最后联系
                    if (item.billsec === 0) return;
                    _.isFunction(this.props.updateCustomerLastContact) && this.props.updateCustomerLastContact(item);
                    //首页我的工作中，补充最后一条跟进记录后，需要将首页的相关工作设为已完成
                    if (window.location.pathname === '/home') {
                        myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
                    }
                }
            });
        }
    };

    //点击顶部取消按钮后
    handleCancel = (e) => {
        Trace.traceEvent(e, '关闭添加跟进内容输入区');
        //下拉框的默认选项为拜访
        CustomerRecordActions.setType(this.state.initialType);
        CustomerRecordActions.setContent({value: ''});
        this.toggleAddRecordPanel();
        this.setState({addRecordNullTip: ''});
        // $('.add-content-input').animate({height: '36px'});
    };

    //顶部增加客户跟进记录输入时的处理
    handleInputChange = (e) => {
        let value = e.target.value;
        //有输入的内容，则清空必填项验证的提示
        if (value) {
            CustomerRecordActions.setContent({value: value, validateStatus: 'success', errorMsg: null});
        } else {
            CustomerRecordActions.setContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
        }
    };

    //点击保存按钮
    handleSubmitRecord = (item, e) => {
        if (item.id) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '添加补充的跟进内容');
            //点击补充客户跟踪记录编辑状态下的保存按钮
            var detail = _.trim(_.get(this.state, 'detailContent.value'));
            if (detail) {
                CustomerRecordActions.updateItem(item);
                setTimeout(() => {
                    this.saveAddTraceContent('update');
                });
            } else {
                CustomerRecordActions.setDetailContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
            }
        } else {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '保存添加跟进内容');
            //点击顶部输入框下的保存按钮
            var addcontent = _.trim(_.get(this.state, 'inputContent.value'));
            if (addcontent) {
                this.saveAddTraceContent('add');
            } else {
                CustomerRecordActions.setContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
            }
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
                    className='add-trace-label visit-label'
                    label={Intl.get('sales.frontpage.trace.type', '跟进类型')}
                    {...formItemLayout}
                >
                    <RadioGroup onChange={this.handleChange} value={this.state.selectedtracetype}>
                        <Radio value="visit">
                            <span className="iconfont icon-visit-briefcase"/>{Intl.get('common.visit', '拜访')}
                        </Radio>
                        <Radio value="other">
                            <span className="iconfont icon-trace-other"/>{Intl.get('common.others', '其他')}
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('call.record.follow.content', '跟进内容')}
                    validateStatus={_.get(this.state, 'inputContent.validateStatus')}
                    help={_.get(this.state, 'inputContent.errorMsg')}
                >
                    <TextArea placeholder={Intl.get('customer.input.customer.trace.content', '请填写跟进内容')}
                        value={_.get(this.state, 'inputContent.value') || ''}
                        onChange={this.handleInputChange.bind(this)}
                        autosize={AUTO_SIZE_MAP}
                        autoFocus={true}
                    />
                </FormItem>
                <SaveCancelButton loading={this.state.addCustomerLoading}
                    saveErrorMsg={this.state.addCustomerErrMsg}
                    handleSubmit={this.handleSubmitRecord}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
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
        CustomerRecordActions.setDetailContent({value: remark});
    };

    handleCancelDetail = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.show-customer-trace .add-detail-container .cancel-btn'), '关闭补充跟进内容输入区');
        //点击补充客户跟进记录编辑状态下的取消按钮
        item.showAdd = false;
        CustomerRecordActions.setDetailContent({value: '', cancelEdit: true});
    };

    handleAddDetailChange = (e) => {
        //补充客户跟进记录
        let value = e.target.value;
        if (value) {
            CustomerRecordActions.setDetailContent({value: value, validateStatus: 'success', errorMsg: null});
        } else {
            CustomerRecordActions.setDetailContent({value: '', validateStatus: 'error', errorMsg: TRACE_NULL_TIP});
        }
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
                    <TextArea placeholder={Intl.get('customer.add.customer.trace.detail', '请补充跟进记录详情')}
                        value={_.get(this.state, 'detailContent.value') || ''}
                        onChange={this.handleAddDetailChange.bind(this)}
                        autosize={AUTO_SIZE_MAP}
                    />
                </FormItem>
                {this.state.editRecordNullTip ? (
                    <div className="record-null-tip">{this.state.editRecordNullTip}</div>) : null}
                <SaveCancelButton loading={this.state.addCustomerLoading}
                    saveErrorMsg={this.state.addCustomerErrMsg}
                    handleSubmit={this.handleSubmitRecord.bind(this, item)}
                    handleCancel={this.handleCancelDetail.bind(this, item)}
                />
            </Form>);
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
        var isShowReportButton = _.indexOf(this.state.invalidPhoneLists, item.dst) === -1;
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

    //获取应用名
    getAppNameById = (appId) => {
        if (appId) {
            let app = _.find(this.state.appList, item => item.app_id === appId);
            return app ? app.app_name : '';
        }
        return '';
    };

    //在新标签页中打开原文的链接
    openSourceUrl = (url) => {
        window.open(url);
    };

    renderReportContent = (item) => {
        let reportObj = item.remark ? JSON.parse(item.remark) : {};
        if (!_.isObject(reportObj)) return null;
        //应用名称的获取
        let appName = this.getAppNameById(reportObj.app_id || '');
        let reportDoc = reportObj.doc || {};
        const platformName = reportDoc.author ? reportDoc.author.platformName : '';//报告来源的平台（例：新浪微博）
        let reportContent = reportDoc.content || '';//报告的内容
        //报告内容中的url链接的处理
        let splitArray = reportContent.split(' ');
        let reportUrl = _.isArray(splitArray) && splitArray.length ? splitArray[0] : '';
        if (reportUrl && reportUrl.indexOf('http') === -1) {//报告内容前面没有链接的网址
            reportUrl = '';
        } else {//有网址时,报告内容去掉url
            reportContent = reportContent.replace(reportUrl, '');
        }
        return (
            <div className="report-detail-content">
                <div className="item-detail-content" id={item.id}>
                    <div className="report-content-descr">
                        <div className="report-content-start">
                            {platformName ? `[${platformName}] ` : ''}
                            <a href={reportUrl}>{reportUrl}</a>
                        </div>
                        <div className="content-overflow-ellipsis">
                            <ShearContent>
                                {decodeHTML(reportContent)}
                            </ShearContent>
                        </div>
                    </div>
                    <div>
                        <a onClick={this.openSourceUrl.bind(this, reportDoc.url)}>{Intl.get('crm.trace.report.source', '原文')}</a>
                        {reportDoc.dataTime ? <span className="trace-record-time">
                            {moment(reportDoc.dataTime).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}
                        </span> : null}
                    </div>
                </div>
                <div className="item-bottom-content">
                    {appName ? (<span className="report-app-name">{appName}</span>) : null}
                    <span className="item-bottom-right">
                        <span className="sale-name">{reportObj.submitter_name || ''}</span>
                        <span className="trace-record-time">
                            {moment(item.time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                        </span>
                    </span>
                </div>
            </div>
        );
    };

    //渲染补充跟进记录的提示
    renderSupplementTip(item) {
        return this.props.disableEdit ? null : (
            <span className="add-detail-tip" onClick={this.editDetailContent.bind(this, item)}>
                {Intl.get('click.to.add.trace.detail', '请点击此处补充跟进内容')}
            </span>);
    }

    //渲染跟进记录的展示内容
    renderRecordShowContent = (item) => {
        //是否是编辑跟进记录，有跟进内容并且能编辑(没有跟进内容时是补充跟进记录)
        let isEditRecord = item.remark && !this.props.disableEdit;
        //是否展示编辑按钮,有跟进内容(没有跟进内容时是补充跟进记录)，能编辑，并且没有正在编辑的跟进记录，并且没有正在添加跟进记录
        let showEidtBtn = item.remark && !this.props.disableEdit && !this.state.isEdit && !this.state.addRecordPanelShow;
        return (
            <div className="record-content-show">
                {item.remark ? (<ShearContent key={item.id} >{item.remark}</ShearContent>) : this.renderSupplementTip(item)}
                {showEidtBtn ? <DetailEditBtn
                    title={Intl.get('common.edit', '编辑')}
                    onClick={this.editDetailContent.bind(this, item)}
                /> : null}
            </div>);
    };

    //渲染舆情报告内容
    renderPublicOpinionReportContent = (item) => {
        let reportType = _.find(REPORT_TYPE, type => type.value === item.topic).name;
        return (
            <div className='public-opinion-report-content'>
                <div className='report-type-container'>
                    <div className='report-label'>{Intl.get('common.type', '类型')}:</div>
                    <div className='report-content'>{reportType}</div>
                </div>
                <div className='report-remark-container'>
                    <div className='report-label'>{Intl.get('common.remark', '备注')}:</div>
                    <div className='report-content'>{item.remark}</div>
                </div>
                <div className='report-time'>
                    <div className='report-applicant'>{item.nick_name}</div>
                    <div className='apply-time'>{moment(item.time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}</div>
                </div>
            </div>
        );
    };

    //渲染时间线的内容展示
    renderTimeLineContentItem = (item, is_record_upload) => {
        let content = null;
        if(_.isEqual(item.type, 'data_report')) {
            content = this.renderReportContent(item);
        } else if(_.isEqual(item.type, 'public_opinion_report')) {
            content = this.renderPublicOpinionReportContent(item);
        } else {
            //playSelected表示当前正在播放的那条录音，图标显示红色
            var cls = classNames('iconfont', 'icon-play', {
                'icon-selected': item.playSelected,
                'icon-play-disable': !is_record_upload
            });
            content = (<div className="trace-content">
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
                    {_.includes(PHONE_TYPES, item.type) && !this.props.disableEdit ?
                        (<span className="phone-call-out-btn handle-btn-item" title={Intl.get('crm.click.call.phone', '点击拨打电话')}>
                            <PhoneCallout
                                phoneNumber={item.dst}
                                hidePhoneNumber={true}
                                type='customer'
                                id={item.customer_id}
                            />
                        </span>) : null}
                    <span className="item-bottom-right">
                        <span className="sale-name">{item.nick_name}</span>
                        <span className="trace-record-time">
                            {moment(item.time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                        </span>
                    </span>
                </div>
            </div>);
        }
        return content;
    }

    renderTimeLineItem = (item, hasSplitLine) => {
        var traceObj = processForTrace(item);
        //渲染时间线
        var iconClass = traceObj.iconClass, title = traceObj.title, traceDsc = traceObj.traceDsc;
        //是否上传了录音文件
        let is_record_upload = item.is_record_upload === '1';
        return (
            <div className={classNames('trace-item-content', {'day-split-line': hasSplitLine})}>
                <p className="item-detail-tip">
                    <span className="icon-container" title={title}><i className={iconClass}></i></span>
                    {traceDsc ? (<span className="trace-title-name" title={traceDsc}>{traceDsc}</span>) : null}
                    {_.includes(PHONE_TYPES, item.type) ? (<span className="trace-title-phone">{item.dst}</span>) : null}
                </p>
                {this.renderTimeLineContentItem(item, is_record_upload)}
            </div>
        );
    };

    //监听下拉加载
    handleScrollBarBottom = () => {
        var length = this.state.customerRecord.length;
        if (length < this.state.total) {
            var lastId = this.state.customerRecord[length - 1].id;
            this.getCustomerTraceList(lastId);
        } else if (length === this.state.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
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

    //提示框隐藏后的处理
    hideErrTooltip = () => {
        this.setState({
            addingInvalidPhoneErrMsg: ''
        });
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

    getRecordListShowHeight = () => {
        let divHeight = this.state.layoutHeight - LAYOUT_CONSTANTS.TIME_ADD_BTN_HEIGHT - LAYOUT_CONSTANTS.STATISTIC_TYPE_HEIGHT;
        //减添加跟进记录面版的高度
        if (this.state.addRecordPanelShow) {
            divHeight -= LAYOUT_CONSTANTS.ADD_TRACE_HEIGHHT;
        }
        //减通话状态的高度
        if (_.includes([CALL_RECORD_TYPE.PHONE, 'all'], this.state.filterType)
            && _.get(this.state, 'customerRecord.length') > 0) {
            divHeight -= LAYOUT_CONSTANTS.PHONE_STATUS_HEIGHT;
        }
        return divHeight;
    };

    renderCustomerRecordLists = () => {
        var recordLength = this.state.customerRecord.length;
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
                    {this.props.isOverViewPanel ? this.renderTimeLine() : (
                        <div className="show-content" style={{'height': this.getRecordListShowHeight()}}>
                            <GeminiScrollbar className="srollbar-out-card-style"
                                handleScrollBottom={this.handleScrollBarBottom}
                                listenScrollBottom={this.state.listenScrollBottom}
                            >
                                {this.renderTimeLine()}
                            </GeminiScrollbar>
                        </div>)
                    }
                </div>
            );
        }
    };

    hideModalDialog = () => {
        CustomerRecordActions.setModalDialogFlag(false);
    };

    //添加跟进记录面板的展示与隐藏
    toggleAddRecordPanel = () => {
        this.setState({addRecordPanelShow: !this.state.addRecordPanelShow});
    };

    onSelectFilterType = ({item, key, selectedKeys}) => {
        this.setState({filterType: key});
        CustomerRecordActions.dismiss();
        CustomerRecordActions.setLoading();
        setTimeout(() => {
            this.getCustomerTraceList();
        });
    };

    onSelectFilterStatus = ({item, key, selectedKeys}) => {
        this.setState({filterStatus: key});
        CustomerRecordActions.dismiss();
        CustomerRecordActions.setLoading();
        setTimeout(() => {
            this.getCustomerTraceList();
        });
    };

    getTypeMenu = () => {
        return (
            <Menu selectedKeys={[this.state.filterType]} onClick={this.onSelectFilterType}>
                {_.map(CALL_TYPE_MAP, (value, key) => {
                    return (<Menu.Item key={key}>
                        {value}
                    </Menu.Item>);
                })}
            </Menu>
        );
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
        if (_.isFunction(this.props.changeActiveKey)) this.props.changeActiveKey('3');
    };

    renderTraceRecordBottom = () => {
        //概览页只展示最近的五条跟进记录，如果总数大于5条时，可以点击更多转到跟进记录列表进行查看
        if (this.props.isOverViewPanel && this.state.total > OVERVIEW_SHOW_COUNT) {
            return (
                <div className="trace-record-bottom">
                    <span className="more-customer-record"
                        onClick={this.turnToTraceRecordList}>
                        {Intl.get('crm.basic.more', '更多')}
                    </span>
                </div>);
        }

    };
    //是否展示通话状态的过滤框
    isStatusFilterShow() {
        //不是概览页，有跟进记录或有通话状态筛选条件（有数据时才展示状态筛选框，但通过状态筛选后无数据也需要展示），并且不是拜访、舆情报上、舆情报告和其他类型时，展示通话状态筛选框
        return !this.props.isOverViewPanel && (_.get(this.state, 'customerRecord[0]') || this.state.filterStatus) &&
            _.indexOf(['visit', 'data_report', 'public_opinion_report', 'other'], this.state.filterType) === -1;
    }

    //渲染添加跟进记录的按钮
    renderAddRecordButton() {
        //概览页添加跟进记录的按钮
        if (this.props.isOverViewPanel) {
            return (
                <span className="iconfont icon-add handle-btn-item" onClick={this.toggleAddRecordPanel.bind(this)}
                    title={Intl.get('sales.frontpage.add.customer', '添加跟进记录')}/>);
        } else {//跟进记录页，添加跟进记录的按钮
            return (<Button className='crm-detail-add-btn'
                onClick={this.toggleAddRecordPanel.bind(this, '')} data-tracename="添加跟进记录">
                {Intl.get('sales.frontpage.add.customer', '添加跟进记录')}
            </Button>);
        }
    }

    //跟进类型的描述
    getTraceTypeDescr(type) {
        switch (type) {
            case CALL_RECORD_TYPE.PHONE:
                return Intl.get('common.phone', '电话');
            // case CALL_RECORD_TYPE.APP:
            //     return Intl.get('menu.download.app', '客套APP');
            case CALL_RECORD_TYPE.VISIT:
                return Intl.get('customer.visit', '拜访');
            // case CALL_RECORD_TYPE.CALL_BACK:
            //     return Intl.get('common.callback', '回访');
            case CALL_RECORD_TYPE.DATA_REPORT:
                return Intl.get('crm.trace.delivery.report', '舆情报送');
            case CALL_RECORD_TYPE.PUBLIC_OPINION_REPORT:
                return Intl.get('apply.approve.lyrical.report', '舆情报告');
            case CALL_RECORD_TYPE.OTHER:
                return Intl.get('customer.other', '其他');
        }
    }

    onSelectDate = (start_time, end_time) => {
        CustomerRecordActions.dismiss();
        CustomerRecordActions.changeTimeRange({start_time, end_time});
        CustomerRecordActions.setLoading();
        setTimeout(() => {
            this.getCustomerTraceStatistic();
            this.getCustomerTraceList();
        });
    };

    onTraceTypeChange = (type) => {
        //切换类型后，将通话状态的筛选清空
        this.setState({filterStatus: ''});
        CustomerRecordActions.dismiss();
        CustomerRecordActions.setFilterType(type === this.state.filterType ? 'all' : type);
        CustomerRecordActions.setLoading();
        setTimeout(() => {
            this.getCustomerTraceList();
        });

    }
    //获取类型统计数据（根据固定类型+后端获取的额外类型和后端获取的统计数据的组合）
    getTypeStatisticData(){
        let statisticData = {};
        //从后端获取的类型统计数据
        let traceStatisticObj = this.state.customerTraceStatisticObj || {};
        // 开通呼叫中心时，增加电话次数统计
        if(isOpenCaller()) {
            statisticData.phone = 0;//eefung+客套容联+客套APP+回访的电话次
            // 电话次数(eefung电话+客套容联+客套app+回访)
            _.each(PHONE_TYPES, type => {
                statisticData.phone += _.get(traceStatisticObj, type, 0);
            });
        }
        //固定的跟进类型统计
        statisticData.visit = 0;//拜访
        //将从后端获取的额外的跟进类型，加入到跟进类型统计对象中
        _.each(this.state.extraTraceTypeList, type => {
            statisticData[type] = 0;
        });
        //只有在蚁坊域才展示
        if(isOrganizationEefung()) {
            //舆情报告
            statisticData.public_opinion_report = 0;
        }
        //其他跟进
        statisticData.other = 0;
        //非电话类型的次数统计
        _.each(statisticData, (value, key) => {
            //不是电话类型时的次数
            if (key !== CALL_RECORD_TYPE.PHONE) {
                statisticData[key] = _.get(traceStatisticObj, key, 0);
            }
        });
        return statisticData;
    }
    //渲染跟进统计
    renderStatisticTabs() {
        let statisticData = this.getTypeStatisticData();
        //获取跟进类型的个数，最少有2个固定的类型，所以默认值为：2
        let typeSize = _.get(_.keys(statisticData), 'length', 2);
        let typeItemWidth = (100 / typeSize) + '%';
        return (
            <div className="statistic-container">
                {_.map(statisticData, (value, key) => {
                    let itemCls = classNames('statistic-item', {'active': key === this.state.filterType});
                    return (
                        <div className={itemCls} onClick={this.onTraceTypeChange.bind(this, key)}
                            style={{width: typeItemWidth}}>
                            <div className="statistic-label">{this.getTraceTypeDescr(key)}</div>
                            <div className="statistic-value">
                                {Intl.get('crm.trace.statistic.unit', '{count}次', {count: value})}
                            </div>
                        </div>);
                })}
            </div>);
    }

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

    render() {
        //addTrace 顶部增加记录的teaxare框
        //能否添加跟进记录， 可编辑并且没有正在编辑的跟进记录时，可添加
        let hasAddRecordPrivilege = !this.props.disableEdit && !this.state.isEdit;
        return (
            <div className="customer-container" data-tracename="跟进记录页面" id="customer-container">
                <div className="top-hander-wrap">
                    {this.props.isOverViewPanel ? null : this.renderDatePicker()}
                    {hasAddRecordPrivilege ? this.renderAddRecordButton() : null}
                </div>
                {this.state.addRecordPanelShow ? this.renderAddRecordPanel() : null}
                <div className="show-container" id="show-container">
                    {this.props.isOverViewPanel ? null : this.renderStatisticTabs()}
                    {this.isStatusFilterShow() ? (
                        <Dropdown overlay={this.getStatusMenu()} trigger={['click']}>
                            <a className="ant-dropdown-link trace-filter-item">
                                {this.state.filterStatus ? CALL_STATUS_MAP[this.state.filterStatus] : Intl.get('call.record.call.state', '通话状态')}
                                <Icon type="down"/>
                            </a>
                        </Dropdown>) : null}
                    {this.renderCustomerRecordLists()}
                    {this.renderTraceRecordBottom()}
                </div>
            </div>
        );
    }
}

CustomerRecord.propTypes = {
    curCustomer: PropTypes.object,
    isOverViewPanel: PropTypes.bool,
    refreshSrollbar: PropTypes.func,
    updateCustomerLastContact: PropTypes.func,
    changeActiveKey: PropTypes.func,
    disableEdit: PropTypes.bool,
    hideContactWay: PropTypes.bool,
};
module.exports = CustomerRecord;

