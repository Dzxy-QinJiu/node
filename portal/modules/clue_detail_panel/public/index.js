/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/6/14.
 */
var React = require('react');
require('./css/index.less');
require('./css/phone-status.less');
var phoneAlertAction = require('./action/phone-alert-action');
var phoneAlertStore = require('./store/phone-alert-store');
const PropTypes = require('prop-types');
var userData = require('PUB_DIR/sources/user-data');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import AddScheduleForm from 'MOD_DIR/clue_customer/public/views/schedule/form';
import {Button} from 'antd';
import {RightPanel} from 'CMP_DIR/rightPanel';
import ClueDetail from 'MOD_DIR/clue_customer/public/views/clue-right-detail';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';
import PhoneStatusTop from './view/phone-status-top';
var phoneMsgEmitter = require('../../../public/sources/utils/emitters').phoneMsgEmitter;
import {PHONERINGSTATUS,cluePhoneDesArray} from 'MOD_DIR/phone_panel/public/consts';
import {getCallClient} from 'PUB_DIR/sources/utils/phone-util';
import {AVALIBILITYSTATUS} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {clueEmitter} from 'PUB_DIR/sources/utils/emitters';
const DIVLAYOUT = {
    CUSTOMER_COUNT_TIP_H: 26 + 80,//对应几个线索提示和写联系计划提示的高度
    PHONE_STATUS_TIP_H: 50,//只展示通话状态时的高度
    PHONE_STATUS_INPUT_H: 180//通话结束后，带跟进记录输入框的通话状态展示区域的高度
};
const Add_CUSTOMER_LAYOUT_CONSTANTS = {
    TOP_DELTA: 62,//顶部提示框的高度
    BOTTOM_DELTA: 10//底部的padding
};
//默认申请类型
const DEFAULT_APPLY_TYPE = 2;//2：申请新增试用用户，3，申请新增正式用户
//最新通话的相关数据
var phoneRecordObj = {
    callid: '',//通话的id
    received_time: ''//通话时间
};

//当前面板z-index
let thisPanelZIndex;

class ClueDetailPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyUserShowFlag: false,//是否展示申请用户的面板
            applyType: DEFAULT_APPLY_TYPE,
            paramObj: $.extend(true, {}, this.props.paramObj),
            clueInfoArr: phoneAlertStore.getState().clueInfoArr,//通过电话号码来获取到线索的基本信息
            isEdittingTrace: phoneAlertStore.getState().isEdittingTrace,//正在编辑跟进记录
            phoneNum: '',//话机打电话时的电话号码
            isAddFlag: false,//是否展示添加线索的右侧面板
            rightPanelIsShow: false,//是否展示右侧线索详情面板
            customerLayoutHeight: 0,//跟进记录内容确定后，下面线索详情所占的大小
            isInitialHeight: true, //恢复到初始的高度
            openAppShowFlag: false,//是否展示开通应用面板
            isAddingPlanInfo: false,//是否展示添加联系计划面板
            isAddingScheduleSuccess: false, //添加自定义计划是否成功
            isAddToCustomerFlag: false,//是否展示添加到已有线索面板
            hasPhonePanel: false,//是否有电话面板，用于线索面板计算高度
            phonePanelHasCustomerSchedule: false,//是否正在编辑自定义事件，用于线索面板计算高度
            phonePanelFinishTrace: false,//电话面板是否完成跟进,用于线索面板计算高度
        };
    }

    onStoreChange = () => {
        this.setState(phoneAlertStore.getState());
    };

    getPhonemsgObj(paramObj) {
        return paramObj.call_params && paramObj.call_params.phonemsgObj || null;
    }

    getPhoneStatusClueIds(phonemsgObj) {
        if (phonemsgObj) {
            if(phonemsgObj.lead_id){
                return [phonemsgObj.lead_id];
            }else if(_.isArray(phonemsgObj.leads) && phonemsgObj.leads.length){
                return _.map(phonemsgObj.leads, 'id');
            }else{
                return [];
            }
        }
        return [];
    }

    componentDidMount() {
        this._isMounted = true;

        phoneAlertStore.listen(this.onStoreChange);
        let phonemsgObj = this.getPhonemsgObj(this.props.paramObj);
        //通话状态下的处理
        if (!_.isEmpty(phonemsgObj)) {
            //phonemsgObj不为空,说明是有电话面板，比如直接在导航左侧的面板上拨打电话，不会走到willReceive中，此时如果不设置hasPhonePanel为true会影响线索详情高度的计算
            this.setState({
                hasPhonePanel: true
            });
            //如果是从线索详情中打的电话，则不需要再获取线索详情
            if (!this.isClueDetailCall(this.props.paramObj)) {
                //根据线索的id获取线索的详情
                this.getClueInfoByClueId(phonemsgObj);
            }
            //如果是打入的电话，要查来电的号码，如果是拨出的电话，要查所拨打的电话
            var phoneNum = '';
            if (phonemsgObj.call_type === 'IN') {
                phoneNum = phonemsgObj.extId;
            } else {
                phoneNum = phonemsgObj.to || phonemsgObj.dst;
            }
            this.setStatePhoneNumb(phoneNum);
            //记录一下拨打电话的时间及通话的id
            phoneRecordObj.callid = phonemsgObj.callid;
            phoneRecordObj.received_time = phonemsgObj.recevied_time;
        }

        //增加打开客户详情面板的事件监听
        //打开客户详情面板时，当前面板的z-index减1
        //以使当前面板显示在后面
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.adjustThisPanelZIndex.bind(this, -1));

        //增加关闭客户详情面板的事件监听
        //关闭客户详情面板时，恢复当前面板的原始z-index
        phoneMsgEmitter.on(phoneMsgEmitter.CLOSE_PHONE_PANEL, this.adjustThisPanelZIndex);

        //增加打开线索详情面板的事件监听
        //从客户详情面板打开当前面板时，恢复当前面板的原始z-index
        //以使当前面板显示在前面
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_CLUE_PANEL, this.adjustThisPanelZIndex);

        //获取当前面板原始的z-index
        thisPanelZIndex = $(ReactDOM.findDOMNode(this)).css('zIndex');

        //转为数字，以便进行加减计算
        thisPanelZIndex = _.toInteger(thisPanelZIndex);
    }

    setStatePhoneNumb(phoneNum) {
        this.setState({
            phoneNum: phoneNum
        });
    }

    componentWillReceiveProps(nextProps) {
        let paramObj = _.cloneDeep(this.state.paramObj);
        paramObj.clue_params = _.cloneDeep(_.get(nextProps, 'paramObj.clue_params', null));
        //如果切换了线索，那么重置状态
        let nextId = _.get(nextProps, 'paramObj.clue_params.currentId', '');
        let currentId = _.get(this.state, 'paramObj.clue_params.currentId');
        if(!_.isEqual(nextId, currentId) && !_.isEmpty(nextProps.paramObj.clue_params)) {
            paramObj.call_params = null;
            phoneAlertAction.setInitialState();
            this.setState({
                paramObj: paramObj,
                hasPhonePanel: false
            });
        } else {
            //如果未切换线索，只把线索详情赋值
            // let paramObj = this.state.paramObj;
            // paramObj.clue_params = _.cloneDeep(_.get(nextProps, 'paramObj.clue_params', null));
            if (nextProps.paramObj.call_params) {
                var phonemsgObj = this.getPhonemsgObj(nextProps.paramObj);
                if (phonemsgObj.recevied_time > phoneRecordObj.received_time) {
                    //最新的通话状态
                    if (phonemsgObj.callid === phoneRecordObj.callid) {
                        phoneRecordObj.received_time = phonemsgObj.recevied_time;
                        if(!_.get(this,'state.clueInfoArr[0]')){
                            this.getClueInfoByClueId(phonemsgObj);
                        }
                    } else {
                        phoneRecordObj.received_time = phonemsgObj.recevied_time;
                        phoneRecordObj.callid = phonemsgObj.callid;
                        //如果是从线索详情中打的电话，则不需要再获取线索详情
                        if (!this.isClueDetailCall(nextProps.paramObj)) {
                            //根据线索的id获取线索的详情
                            this.getClueInfoByClueId(phonemsgObj);
                        }
                    }
                    //页面上如果存在上次打电话的模态框，再次拨打电话的时候
                    var $modal = $('#clue-phone-status-content');
                    // 去掉了&&this.state.paramObj.callParams.phonemsgObj.type==PHONERINGSTATUS.phone的判断（之前的逻辑时上次通话结束后，来新的电话时会清空数据）
                    // 我认为：上次通话不管是否结束，只要来了新的电话，都需要清空数据，所以去掉了，需测试后再确定
                    if ($modal && $modal.length > 0 && phonemsgObj.type === PHONERINGSTATUS.ALERT) {
                        this.setInitialData(phonemsgObj);
                    }
                    paramObj.call_params = _.cloneDeep(_.get(nextProps, 'paramObj.call_params', null));
                }
                //如果打电话的模态框展示，将flag值变为true
                this.setState({
                    hasPhonePanel: true
                });
            }
            this.setState({
                paramObj: paramObj
            });
        }
    }

    setInitialData(phonemsgObj) {
        var phoneNum = '';
        if (phonemsgObj.call_type === 'IN') {
            phoneNum = phonemsgObj.extId;
        } else {
            phoneNum = phonemsgObj.to || phonemsgObj.dst;
        }
        this.setState({
            phoneNum: phoneNum,
            isAddFlag: false,
            isAddToCustomerFlag: false,
            openAppShowFlag: false
        });
        //恢复初始数据
        phoneAlertAction.setInitialState();
        sendMessage && sendMessage('座机拨打电话，之前弹屏已打开' + phoneNum);
    }

    componentWillUnmount() {
        this._isMounted = false;

        //卸载前，重置数据
        phoneRecordObj.callid = '';
        phoneRecordObj.received_time = '';//通话时间
        phoneAlertAction.setInitialState();
        phoneAlertStore.unlisten(this.onStoreChange);

        //移除打开客户详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.adjustThisPanelZIndex);

        //移除关闭客户详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CLOSE_PHONE_PANEL, this.adjustThisPanelZIndex);

        //移除打开线索详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_CLUE_PANEL, this.adjustThisPanelZIndex);
    }

    //调整当前面板的z-index
    //参数addend: 被加数
    adjustThisPanelZIndex = (addend) => {
        let zIndex = thisPanelZIndex;

        if (_.isNumber(addend)) {
            zIndex += addend;
        }

        if (this._isMounted) {
            $(ReactDOM.findDOMNode(this)).css('zIndex', zIndex);
        }
    }

    //根据线索的id获取线索详情
    getClueInfoByClueId(phonemsgObj) {
        //通过后端传过来的线索id，查询线索详情
        //优先通过线索id查询线索详情lead_id,如果没有lead_id，那么要通过leads查询
        if(phonemsgObj){
            if(phonemsgObj.lead_id){
                phoneAlertAction.setInitialClueArr();
                phoneAlertAction.getClueById(phonemsgObj.lead_id);
            }else if(_.isArray(phonemsgObj.leads) && phonemsgObj.leads.length){
                phoneAlertAction.setInitialClueArr();
                _.each(phonemsgObj.leads, (item) => {
                    phoneAlertAction.getClueById(item.id);
                });
            }
        }

    }
    retryGetCustomer = () => {
        let phonemsgObj = this.getPhonemsgObj(this.state.paramObj);
        //根据线索的id获取线索详情
        this.getClueInfoByClueId(phonemsgObj);
    };
    toggleClueDetail = (id) => {
        // 舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        phoneAlertAction.toggleClueDetail(id);
        setTimeout(() => {
            this.refs.customerCardsScrollbar && this.refs.customerCardsScrollbar.update();
        });
    };


    //渲染线索名及所属销售卡片
    renderClueCard(clue, myCustomer) {
        return (
            <div className="customer-name">
                <h3>
                    <i className="iconfont icon-interested"/>
                    <span title={clue.name}>{clue.name}</span>
                </h3>
                <dl className="customer-info">
                    <dt>
                        {Intl.get('common.belong.sales', '所属销售')}:
                    </dt>
                    <dd>
                        {clue.user_name}
                    </dd>
                </dl>
                { myCustomer ? (//我的线索可以查看线索详情
                    <p className="show-customer-detail">
                        <Button type="primary" onClick={this.toggleClueDetail.bind(this, clue.id)}
                            data-tracename={myCustomer.isShowDetail ? '收起线索详情' : '查看线索详情'}>
                            {myCustomer.isShowDetail ? Intl.get('crm.basic.detail.hide', '收起详情') : Intl.get('call.record.show.customer.detail', '查看详情')}
                        </Button>
                    </p>) : null
                }
            </div>
        );
    }

    //渲染线索的基本信息
    renderCustomerInfor(phonemsgObj) {
        let clueInfoArr = this.state.clueInfoArr;
        //线索是否存在，情况未知
        if (this.state.getCustomerErrMsg) {
            //根据线索id获取线索详情失败
            return (
                <span className="failed-to-get-customer">
                    {Intl.get('crm.phone.failed.get.clue', '查询此号码对应的线索信息失败')}
                    <a onClick={this.retryGetCustomer} data-tracename="点击重试按钮">
                        {Intl.get('user.info.retry', '请重试')}
                    </a>
                </span>
            );
        } else if (_.isArray(phonemsgObj.leads) && phonemsgObj.leads.length) {//线索存在时，展示线索的信息
            if (phonemsgObj.leads.length === 1) {//该电话只对应一个线索时的处理
                if (_.isArray(clueInfoArr) && clueInfoArr[0]) {//该电话是自己线索的，展示线索详情
                    return this.renderClueDetail(clueInfoArr[0]);
                } else {//该电话不是自己线索的
                    return this.renderClueCard(phonemsgObj.leads[0]);
                }
            } else {//该电话对应多个线索时的处理
                let showDetailCustomer = _.find(clueInfoArr, clue => clue.isShowDetail);
                // 即使有多个线索但是推送过来的消息有lead_id的时候
                if(this.isPhoneMsgWithLeadId(phonemsgObj) && _.get(clueInfoArr,'[0]') ){
                    return this.renderClueDetail(clueInfoArr[0]);
                }else if (showDetailCustomer) {//有展示的线索详情时
                    return (
                        <div className="show-customer-detail">
                            <a className="return-customer-cards"
                                onClick={this.toggleClueDetail.bind(this, showDetailCustomer.id)}>
                                <span className="iconfont icon-return-btn"/> {Intl.get('crm.52', '返回')}
                            </a>
                            {this.renderClueDetail(showDetailCustomer)}
                        </div>);
                } else {
                    let height = $('body').height() - DIVLAYOUT.CUSTOMER_COUNT_TIP_H;//去掉有几个线索的提示的高度
                    //通话结束后，需要减去带跟进记录输入框的通话状态高度
                    if (phonemsgObj.type === PHONERINGSTATUS.phone || phonemsgObj.type === PHONERINGSTATUS.curtao_phone || phonemsgObj.type === PHONERINGSTATUS.call_back) {
                        height -= DIVLAYOUT.PHONE_STATUS_INPUT_H;
                    } else {
                        height -= DIVLAYOUT.PHONE_STATUS_TIP_H;
                    }
                    var leadsLists = phonemsgObj.leads;
                    //把属于自己的线索放在最前面
                    leadsLists = _.sortBy(leadsLists, (item) => _.find(clueInfoArr, clue => clue.id === item.id));
                    return (<div className="customer-card-list" style={{height: height}}>
                        <GeminiScrollbar ref="customerCardsScrollbar">
                            {
                                _.map(leadsLists, (item) => {
                                    //我的线索，可以查看线索详情
                                    let myClue = _.find(clueInfoArr, clue => clue.id === item.id);
                                    return this.renderClueCard(item, myClue);
                                })
                            }
                        </GeminiScrollbar>
                    </div>);
                }
            }
        } else if (_.isArray(clueInfoArr) && clueInfoArr[0]) {//原来无线索，添加完线索时，展示添加的线索详情
            return this.renderClueDetail(clueInfoArr[0]);
        }
    }

    renderClueDetail(customer) {
        return (
            <ClueDetail
                ref={cluePanel => this.cluePanel = cluePanel}
                currentId={customer.id}
                curClue={customer}
                hideRightPanel={this.hideClueDetailPanel}
                hasPhonePanel={this.state.hasPhonePanel}
                phonePanelHasCustomerSchedule={this.state.phonePanelHasCustomerSchedule}
                phonePanelFinishTrace={this.state.phonePanelFinishTrace}
            />);
    }

    //修改线索的基本信息
    editCustomerBasic = (newBasic) => {
        if (newBasic && newBasic.id) {
            let updateCustomer = _.find(this.state.clueInfoArr, customer => customer.id === newBasic.id);
            for (var key in newBasic) {
                if (newBasic[key] || newBasic[key] === '') {
                    updateCustomer[key] = newBasic[key];
                }
            }
        }
    };
    //添加联系计划
    handleAddPlan = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-plan-info-container'), '点击添加联系计划按钮');
        this.setState({
            isAddingPlanInfo: true,
            phonePanelHasCustomerSchedule: true
        });
    };
    //关闭联系计划面板
    closeAddPlan = () => {
        if(this.state.isAddingPlanInfo) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-plan-info-container'), '关闭联系计划');
            this.setState({
                isAddingPlanInfo: false,
                phonePanelHasCustomerSchedule: false
            });
        }
    };

    //取消保存联系计划
    handleScheduleCancel = (resData) => {
        //如果有返回值的回调此函数，说明为保存成功后面板自动关闭
        if(!_.isEmpty(resData)) {
            this.setState({
                isAddingScheduleSuccess: true
            });
        }
        this.setState({
            isAddingPlanInfo: false,
            phonePanelHasCustomerSchedule: false
        });
    };

    renderMainContent() {
        let defalutClueInfoArr = _.get(this.state, 'clueInfoArr[0]', {});
        var phonemsgObj = this.getPhonemsgObj(this.state.paramObj);
        const newSchedule = {
            lead_id: defalutClueInfoArr.id || _.get(this, 'state.paramObj.clue_params.curClue.id'),
            lead_name: defalutClueInfoArr.name || _.get(this, 'state.paramObj.clue_params.curClue.name'),
            start_time: '',
            end_time: '',
            alert_time: '',
            topic: '',
            edit: true
        };
        var cls = 'phone-alert-inner-content';
        if (this.state.isAddingPlanInfo) {
            var clueArr = _.get(this,'state.clueInfoArr.length') ? this.state.clueInfoArr : [_.get(this, 'state.paramObj.clue_params.curClue')];
            return (
                <div className={`add-plan ${cls}`}>
                    <AddScheduleForm
                        handleScheduleCancel={this.handleScheduleCancel}
                        currentSchedule={newSchedule}
                        clueArr={clueArr}
                    />
                </div>
            );
        }
    }
    renderCustomerSizeTip(phonemsgObj) {
        let tipContent = '';
        if (_.isArray(phonemsgObj.leads) && phonemsgObj.leads.length) {
            //只对应一个线索时不用提示 或者推送的消失有lead_id的时候不用提示
            if (phonemsgObj.leads.length !== 1 && !this.isPhoneMsgWithLeadId(phonemsgObj)) {
                tipContent = Intl.get('call.record.some.customer', '此号码对应{num}个{type}', {num: phonemsgObj.leads.length,type: Intl.get('crm.sales.clue', '线索')});
            }
        } else if (!(_.isArray(this.state.clueInfoArr) && this.state.clueInfoArr.length)) {//添加完线索后，此提示不用展示
            tipContent = Intl.get('call.record.no.response.customer', '此号码无对应{type}',{type: Intl.get('crm.sales.clue', '线索')});
        }

        if (tipContent) {
            return (<div className="customer-count-tip">{tipContent}</div>);
        } else {
            return null;
        }
    }


    hideClueDetailPanel = (e) => {
        Trace.traceEvent(e, this.state.paramObj.call_params ? '关闭拨打电话的面板' : '关闭线索详情');
        let paramObj = this.state.paramObj;
        if (paramObj.clue_params && _.isFunction(paramObj.clue_params.hideRightPanel)) {
            paramObj.clue_params.hideRightPanel();
        }
        if (_.isFunction(this.props.closeClueDetailPanel)) {
            this.props.closeClueDetailPanel();
        }
        //清空存储的通话id和时间
        phoneRecordObj.callid = '';
        phoneRecordObj.received_time = '';//通话时间
        phoneAlertAction.setInitialState();

    }

    //获取详情中打电话时的线索id
    getDetailClueId() {
        let paramObj = this.state.paramObj;
        let clueId = '';
        //线索详情的相关参数（线索id）存在,说明有打开的线索详情
        if (paramObj.clue_params && paramObj.clue_params.currentId) {
            let phonemsgObj = this.getPhonemsgObj(paramObj);
            let phoneStatusCustomerIds = phonemsgObj ? this.getPhoneStatusClueIds(phonemsgObj) : [];
            //当前展示的线索详情中的线索id是通话中传过来的线索ids之一(说明是从当前打开的线索详情中打的电话)
            if (_.isArray(phoneStatusCustomerIds) && phoneStatusCustomerIds.indexOf(paramObj.clue_params.currentId) !== -1) {
                clueId = paramObj.clue_params.currentId;
            }
        }
        return clueId;
    }
    getCurClueObj = () => {
        return _.get(this,'props.paramObj.clue_params.curClue') || _.get(this,'state.clueInfoArr[0]');
    }

    //根据回调函数返回跟进的编辑状态来标记flag
    setTraceEditStatus = (type) => {
        if(_.isEqual(type, 'edit')) {
            this.setState({
                phonePanelFinishTrace: false,
            });
        } else {
            this.setState({
                phonePanelFinishTrace: true,
            });
        }
    }

    renderPhoneStatus() {
        var phonemsgObj = this.getPhonemsgObj(this.state.paramObj);
        //有监听到推送消息时再渲染出页面
        if (_.isEmpty(phonemsgObj)) {
            return null;
        }
        var AddMoreInfoCls = classNames({
            'phone-alert-modal-inner': true,
            'add-more-info': this.state.isAddingMoreProdctInfo
        });
        var PhoneAlertModalTitleCls = classNames({
            'phone-alert-modal-title': true,
            'initial-height': this.state.isInitialHeight
        });
        let customerOfCurUser = this.state.customerOfCurUser;
        var item = this.getCurClueObj();
        var showMarkClueInvalid = item ? item.availability === AVALIBILITYSTATUS.AVALIBILITY : true;
        var curClue = _.get(this.state, 'clueInfoArr[0]') || _.get(this.state, 'paramObj.clue_params.curClue',{});
        return (
            <div data-tracename="电话弹屏" id="clue-phone-status-content">
                <div className={AddMoreInfoCls}>
                    <PhoneStatusTop
                        phoneAlertModalTitleCls={PhoneAlertModalTitleCls}
                        phonemsgObj={phonemsgObj}
                        isModalShown={this.state.isModalShown}
                        contactNameObj={this.state.paramObj.call_params.contactNameObj}
                        detailClueId={this.getDetailClueId()}//线索详情中打电话时，线索的id
                        isAddingMoreProdctInfo={this.state.isAddingMoreProdctInfo}
                        handleAddPlan={this.handleAddPlan}
                        closeAddPlan={this.closeAddPlan} //手动控制关闭面板
                        isAddingScheduleSuccess={this.state.isAddingScheduleSuccess}//检查自定义是否添加成功
                        setTraceEditStatus={this.setTraceEditStatus} //添加跟进内容回调，获取编辑状态 'edit' 'text'
                        isAddingPlanInfo={this.state.isAddingPlanInfo}
                        commonPhoneDesArray={cluePhoneDesArray}
                        showMarkClueInvalid={showMarkClueInvalid}
                        curClue={curClue}
                        ref={dom => {this.phoneStatusTop = dom;}}
                        isClueDetailCall={this.isClueDetailCall(this.state.paramObj) || this.isPhoneMsgWithLeadId(phonemsgObj) || this.isOnlyOpenClueDetail(this.state.paramObj)}
                    />
                    {this.renderMainContent()}
                    {!this.isClueDetailCall(this.state.paramObj) ? //不是从线索详情中拨打的电话并且推送来的消息中有lead_id时
                        //线索信息展示或者添加线索按钮
                        <div className="customer-info-container">
                            <div>
                                {this.renderCustomerSizeTip(phonemsgObj)}
                                <div className="customer-detail">{this.renderCustomerInfor(phonemsgObj)}</div>
                            </div>
                        </div>
                        : null}
                </div>

            </div>
        );
    }
    //获取是否是从线索详情中拨打的电话
    isClueDetailCall(paramObj) {
        let flag = false;
        //线索详情的相关参数（线索id）存在,说明有打开的线索详情
        if (paramObj.clue_params && paramObj.clue_params.currentId) {
            let phonemsgObj = this.getPhonemsgObj(paramObj);
            let phoneStatusClueIds = this.getPhoneStatusClueIds(phonemsgObj);
            //当前展示的线索详情中的线索id是通话中传过来的线索ids之一(说明是从当前打开的线索详情中打的电话)
            if (_.isArray(phoneStatusClueIds) && phoneStatusClueIds.indexOf(paramObj.clue_params.currentId) !== -1) {
                flag = true;
            }
        }

        return flag;
    }
    //后端推送的消息是否有lead_id
    isPhoneMsgWithLeadId(phoneMsg) {
        return phoneMsg && phoneMsg.lead_id;
    }

    //只打开了线索详情
    isOnlyOpenClueDetail(paramObj) {
        return paramObj.clue_params && !paramObj.call_params;
    }
    //是否隐藏关闭按钮
    isHideCloseBtn(){
        let phonemsgObj = this.getPhonemsgObj(this.state.paramObj);
        if(phonemsgObj){
            //拨打电话时，已振铃，等待对方接听
            let isCallOutAlert = phonemsgObj.type === PHONERINGSTATUS.ALERT && phonemsgObj.call_type !== 'IN';
            //通话中
            let isAnswered = phonemsgObj.type === PHONERINGSTATUS.ANSWERED;
            let callClient = getCallClient();
            //容联的电话系统，正在拨打电话(振铃、通话中)时，不可以关闭（关了就无法挂断了）
            return callClient && callClient.needShowAnswerView() && ( isCallOutAlert || isAnswered);
        }
        return false;
    }
    render() {
        let paramObj = this.state.paramObj;
        let className = classNames('right-panel-content', {'clue-right-panel-content-slide': this.state.applyUserShowFlag});
        let rightPanelClassName = 'clue-right-panel  white-space-nowrap table-btn-fix';
        return (
            <RightPanel showFlag={this.props.showFlag}
                className={rightPanelClassName}
                data-tracename={paramObj.call_params ? '线索电话弹屏' : '线索详情'}
                id="clue_phone_panel_wrap">
                {this.isHideCloseBtn() ? <span className="close-placeholder"/> : (
                    <span className="iconfont icon-close" onClick={(e) => {
                        this.hideClueDetailPanel(e);
                    }}/>)}
                <div className={className}>
                    {paramObj.call_params ? this.renderPhoneStatus() : null}
                    {/*{只打开线索详情或从当前展示的线索详情中打电话时}*/}
                    {this.isOnlyOpenClueDetail(paramObj) || this.isClueDetailCall(paramObj) ? (
                        <ClueDetail ref={cluePanel => this.cluePanel = cluePanel}
                            {...paramObj.clue_params}
                            hideRightPanel={this.hideClueDetailPanel}
                            hasPhonePanel={this.state.hasPhonePanel}
                            phonePanelHasCustomerSchedule={this.state.phonePanelHasCustomerSchedule}
                            phonePanelFinishTrace={this.state.phonePanelFinishTrace}
                        />) : null
                    }
                </div>
            </RightPanel>
        );
    }
}

ClueDetailPanel.defaultProps = {
    showFlag: false,
    paramObj: {
        call_params: null,//后端推送过来的电话状态相关的参数
        clue_params: null//线索详情相关的参数
    },
    setInitialPhoneObj: function() {

    },
    closeClueDetailPanel: function() {

    },
};

ClueDetailPanel.propTypes = {
    showFlag: PropTypes.bool,
    paramObj: PropTypes.object,
    setInitialPhoneObj: PropTypes.func,
    closeClueDetailPanel: PropTypes.func,
};
export default ClueDetailPanel;
