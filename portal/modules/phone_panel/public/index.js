/**
 * 电话状态及客户详情展示面板
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/17.
 */
require('./css/index.less');
require('./css/phone-status.less');
var phoneAlertAction = require('./action/phone-alert-action');
var phoneAlertStore = require('./store/phone-alert-store');
var addMoreInfoAction = require('./action/add-more-info-action');
const PropTypes = require('prop-types');
var userData = require('PUB_DIR/sources/user-data');
import AddCustomerForm from 'CMP_DIR/add-customer-form';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import AddMoreInfo from './view/add-more-info';
import AddScheduleForm from 'MOD_DIR/crm/public/views/schedule/form';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {Button} from 'antd';
import {RightPanel, RightPanelClose, RightPanelReturn} from 'CMP_DIR/rightPanel';
import CustomerDetail from 'MOD_DIR/crm/public/views/customer-detail';
import ApplyUserForm from 'MOD_DIR/crm/public/views/apply-user-form';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';
import PhoneStatusTop from './view/phone-status-top';
import PhoneAddToCustomerForm from 'CMP_DIR/phone-add-to-customer-form';
import {PHONERINGSTATUS} from './consts';
import {getCallClient} from 'PUB_DIR/sources/utils/phone-util';
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import customFieldAjax from '../../custom_field_manage/public/ajax';

const DIVLAYOUT = {
    CUSTOMER_COUNT_TIP_H: 26,//对应几个客户提示的高度
    PHONE_STATUS_TIP_H: 50,//只展示通话状态时的高度
    PHONE_STATUS_INPUT_H: 148//通话结束后，带跟进记录输入框的通话状态展示区域的高度
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

let newLabels = '';
//当前面板z-index
let thisPanelZIndex;

class PhonePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyUserShowFlag: false,//是否展示申请用户的面板
            applyType: DEFAULT_APPLY_TYPE,
            apps: [],
            curOrder: {},
            paramObj: $.extend(true, {}, this.props.paramObj),
            customerInfoArr: phoneAlertStore.getState().customerInfoArr,//通过电话号码来获取到客户的基本信息
            isEdittingTrace: phoneAlertStore.getState().isEdittingTrace,//正在编辑跟进记录
            phoneNum: '',//话机打电话时的电话号码
            isAddFlag: false,//是否展示添加客户的右侧面板
            rightPanelIsShow: false,//是否展示右侧客户详情面板
            curCustomerId: '',//已存在客户的id
            isAddingMoreProdctInfo: false,//是否添加产品反馈，待办事项，和竞品信息
            isAddingAppFeedback: '',//添加客户反馈的状态,共三种状态，loading success error
            addAppFeedbackErrMsg: '',//添加客户反馈失败后的提示
            customerLayoutHeight: 0,//跟进记录内容确定后，下面客户详情所占的大小
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            isInitialHeight: true, //恢复到初始的高度
            addCustomer: false,//是否需要添加客户 true代码需要添加客户，false代表不需要添加客户
            applyFormCustomerName: '',//申请用户面板用到的客户名
            openAppShowFlag: false,//是否展示开通应用面板
            isAddingPlanInfo: false,//是否展示添加联系计划面板
            isAddingScheduleSuccess: false, //添加自定义计划是否成功
            isAddToCustomerFlag: false,//是否展示添加到已有客户面板
            customerCustomFieldData: {}, // 客户自定义字段的值，默认空
        };
    }

    onStoreChange = () => {
        this.setState(phoneAlertStore.getState());
    };

    getPhonemsgObj(paramObj) {
        return paramObj.call_params && paramObj.call_params.phonemsgObj || null;
    }

    getPhoneStatusCustomerIds(phonemsgObj) {
        if (phonemsgObj) {
            if(phonemsgObj.customer_id){
                return [phonemsgObj.customer_id];
            }else if(_.get(phonemsgObj,'customers[0]')){
                return _.map(phonemsgObj.customers, 'id');
            }else{
                return [];
            }
        }
        return [];
    }

    // 获取客户自定义字段信息
    getCustomFieldConfig() {
        const queryObj = {
            customized_type: 'customer'
        };
        customFieldAjax.getCustomFieldConfig(queryObj).then( (result) => {
            this.setState({
                customerCustomFieldData: result
            });
        } );
    }

    componentDidMount() {
        this._isMounted = true;

        phoneAlertStore.listen(this.onStoreChange);
        // 获取客户自定义字段信息
        this.getCustomFieldConfig();
        let phonemsgObj = this.getPhonemsgObj(this.props.paramObj);
        //通话状态下的处理
        if (!_.isEmpty(phonemsgObj)) {
            //如果是从客户详情中打的电话，则不需要再获取客户详情
            if (!this.isCustomerDetailCall(this.props.paramObj)) {
                //根据客户的id获取客户的详情
                this.getCustomerInfoByCustomerId(phonemsgObj);
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

        //增加打开用户详情面板的事件监听
        //打开用户详情面板时，当前面板的z-index减1
        //以使当前面板显示在后面
        userDetailEmitter.on(userDetailEmitter.OPEN_USER_DETAIL, this.adjustThisPanelZIndex.bind(this, -1));

        //增加关闭用户详情面板的事件监听
        //关闭用户详情面板时，恢复当前面板的原始z-index
        userDetailEmitter.on(userDetailEmitter.CLOSE_USER_DETAIL, this.adjustThisPanelZIndex);

        //增加打开线索详情面板的事件监听
        //打开线索详情面板时，当前面板的z-index减1
        //以使当前面板显示在后面
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_CLUE_PANEL, this.adjustThisPanelZIndex.bind(this, -1));

        //增加关闭线索详情面板的事件监听
        //关闭线索详情面板时，恢复当前面板的原始z-index
        phoneMsgEmitter.on(phoneMsgEmitter.CLOSE_CLUE_PANEL, this.adjustThisPanelZIndex);

        //增加打开客户详情面板的事件监听
        //从线索详情面板打开当前面板时，恢复当前面板的原始z-index
        //以使当前面板显示在前面
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.adjustThisPanelZIndex);

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
        //获取客户详情
        let paramObj = _.cloneDeep(this.state.paramObj);
        paramObj.customer_params = _.cloneDeep(_.get(nextProps, 'paramObj.customer_params', null));
        //如果切换了客户，那么重置状态
        let nextId = _.get(nextProps, 'paramObj.customer_params.currentId', '');
        let currentId = _.get(this.state, 'paramObj.customer_params.currentId', '');
        if(!_.isEqual(nextId, currentId) && !_.isEmpty(nextProps.paramObj.customer_params)){
            paramObj.call_params = null;
            phoneAlertAction.setInitialState();
            this.setState({
                paramObj: paramObj
            });
        } else {//如果未切换客户，只把客户详情赋值
            if (nextProps.paramObj.call_params) {
                var phonemsgObj = this.getPhonemsgObj(nextProps.paramObj);
                if (phonemsgObj.recevied_time > phoneRecordObj.received_time) {
                    //最新的通话状态
                    if (phonemsgObj.callid === phoneRecordObj.callid) {
                        phoneRecordObj.received_time = phonemsgObj.recevied_time;
                        if(!_.get(this,'state.customerInfoArr[0]')){
                            this.getCustomerInfoByCustomerId(phonemsgObj);
                        }
                    } else {
                        phoneRecordObj.received_time = phonemsgObj.recevied_time;
                        phoneRecordObj.callid = phonemsgObj.callid;
                        //如果是从客户详情中打的电话，则不需要再获取客户详情
                        if (!this.isCustomerDetailCall(nextProps.paramObj)) {
                            this.getCustomerInfoByCustomerId(phonemsgObj);
                        }
                    }
                    //页面上如果存在上次打电话的模态框，再次拨打电话的时候
                    var $modal = $('#phone-status-content');
                    // 去掉了&&this.state.paramObj.callParams.phonemsgObj.type==PHONERINGSTATUS.phone的判断（之前的逻辑时上次通话结束后，来新的电话时会清空数据）
                    // 我认为：上次通话不管是否结束，只要来了新的电话，都需要清空数据，所以去掉了，需测试后再确定
                    if ($modal && $modal.length > 0 && phonemsgObj.type === PHONERINGSTATUS.ALERT) {
                        this.setInitialData(phonemsgObj);
                    }
                    paramObj.call_params = _.cloneDeep(_.get(nextProps, 'paramObj.call_params', null));
                }
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
            applyUserShowFlag: false,
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

        //移除打开用户详情面板的事件监听
        userDetailEmitter.removeListener(userDetailEmitter.OPEN_USER_DETAIL, this.adjustThisPanelZIndex);

        //移除关闭用户详情面板的事件监听
        userDetailEmitter.removeListener(userDetailEmitter.CLOSE_USER_DETAIL, this.adjustThisPanelZIndex);

        //移除打开线索详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_CLUE_PANEL, this.adjustThisPanelZIndex);

        //移除关闭线索详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CLOSE_CLUE_PANEL, this.adjustThisPanelZIndex);

        //移除打开客户详情面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.adjustThisPanelZIndex);
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

    showAddCustomerForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.handle-btn-container .add-customer'), '点击添加客户按钮');
        this.setState({
            isAddFlag: true
        });
    };

    showAddToCustomerForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.handle-btn-container .add-to-customer'), '点击添加到已有客户按钮');
        this.setState({
            isAddToCustomerFlag: true
        });
    };

    cancelAddToCustomer = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.phone-alert-inner-content'), '关闭添加到已有客户的面板');
        this.setState({
            isAddToCustomerFlag: false
        });
    };

    hideAddForm = () => {
        this.setState({
            isAddFlag: false
        });
    };
    updateCustomer = (addCustomerInfo) => {
        this.setState({
            isAddFlag: false,
            addCustomer: false
        });
        phoneAlertAction.setAddCustomerInfo(addCustomerInfo);
    };
    //根据客户的id获取客户详情
    getCustomerInfoByCustomerId(phonemsgObj) {
        //优先通过客户id查询客户详情customer_id,如果没有customer_id，那么要通过customers查询
        if(phonemsgObj){
            if(phonemsgObj.customer_id){
                phoneAlertAction.setInitialCustomerArr();
                phoneAlertAction.getCustomerById(phonemsgObj.customer_id);
            }else if(_.get(phonemsgObj,'customers[0]')){
                phoneAlertAction.setInitialCustomerArr();
                _.each(phonemsgObj.customers, (item) => {
                    phoneAlertAction.getCustomerById(item.id);
                });
            }
        }
    }

    retryGetCustomer = () => {
        let phonemsgObj = this.getPhonemsgObj(this.state.paramObj);
        //根据客户的id获取客户详情
        this.getCustomerInfoByCustomerId(phonemsgObj);
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
    toggleCustomerDetail = (id) => {
        // 舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        phoneAlertAction.toggleCustomerDetail(id);
        setTimeout(() => {
            this.refs.customerCardsScrollbar && this.refs.customerCardsScrollbar.update();
        });
    };
    //关闭已有客户的右侧面板
    hideRightPanel = () => {
        this.setState({
            rightPanelIsShow: false
        });
    };

    //渲染客户名及所属销售卡片
    renderCustomerCard(customer, myCustomer) {
        return (
            <div className="customer-name">
                <h3>
                    <i className="iconfont icon-interested"/>
                    <span title={customer.name}>{customer.name}</span>
                </h3>
                <dl className="customer-info">
                    <dt>
                        {Intl.get('common.belong.sales', '所属销售')}:
                    </dt>
                    <dd>
                        {customer.user_name}
                    </dd>
                </dl>
                { myCustomer ? (//我的客户可以查看客户详情
                    <p className="show-customer-detail">
                        <Button type="primary" onClick={this.toggleCustomerDetail.bind(this, customer.id)}
                            data-tracename={myCustomer.isShowDetail ? '收起客户详情' : '查看客户详情'}>
                            {myCustomer.isShowDetail ? Intl.get('crm.basic.detail.hide', '收起详情') : Intl.get('call.record.show.customer.detail', '查看详情')}
                        </Button>
                    </p>) : null
                }
            </div>
        );
    }

    //渲染客户的基本信息
    renderCustomerInfor(phonemsgObj) {
        let customerInfoArr = this.state.customerInfoArr;
        //客户是否存在，情况未知
        if (this.state.getCustomerErrMsg) {
            //根据客户id获取客户详情失败
            return (
                <span className="failed-to-get-customer">
                    {Intl.get('crm.phone.failed.get.customer', '查询此号码对应的客户信息失败')}
                    <a onClick={this.retryGetCustomer} data-tracename="点击重试按钮">
                        {Intl.get('user.info.retry', '请重试')}
                    </a>
                </span>
            );
        } else if (_.isArray(phonemsgObj.customers) && phonemsgObj.customers.length) {//客户存在时，展示客户的信息
            if (phonemsgObj.customers.length === 1) {//该电话只对应一个客户时的处理
                if (_.isArray(customerInfoArr) && customerInfoArr[0]) {//该电话是自己客户的，展示客户详情
                    return this.renderCustomerDetail(customerInfoArr[0]);
                } else {//该电话不是自己客户的
                    return this.renderCustomerCard(phonemsgObj.customers[0]);
                }
            } else {//该电话对应多个客户时的处理
                let showDetailCustomer = _.find(customerInfoArr, customer => customer.isShowDetail);
                if(this.isPhoneMsgWithCustomerId(phonemsgObj) && _.get(customerInfoArr,'[0]') ){
                    return this.renderCustomerDetail(customerInfoArr[0]);
                }else if (showDetailCustomer) {//有展示的客户详情时
                    return (
                        <div className="show-customer-detail">
                            <a className="return-customer-cards"
                                onClick={this.toggleCustomerDetail.bind(this, showDetailCustomer.id)}>
                                <span className="iconfont icon-return-btn"/> {Intl.get('crm.52', '返回')}
                            </a>
                            {this.renderCustomerDetail(showDetailCustomer)}
                        </div>);
                } else {
                    let height = $('body').height() - DIVLAYOUT.CUSTOMER_COUNT_TIP_H;//去掉有几个客户的提示的高度
                    //通话结束后，需要减去带跟进记录输入框的通话状态高度
                    if (phonemsgObj.type === PHONERINGSTATUS.phone || phonemsgObj.type === PHONERINGSTATUS.curtao_phone || phonemsgObj.type === PHONERINGSTATUS.call_back) {
                        height -= DIVLAYOUT.PHONE_STATUS_INPUT_H;
                    } else {
                        height -= DIVLAYOUT.PHONE_STATUS_TIP_H;
                    }
                    return (<div className="customer-card-list" style={{height: height}}>
                        <GeminiScrollbar ref="customerCardsScrollbar">
                            {
                                _.map(phonemsgObj.customers, (item) => {
                                    //我的客户，可以查看客户详情
                                    let myCustomer = _.find(customerInfoArr, customer => customer.id === item.id);
                                    return this.renderCustomerCard(item, myCustomer);
                                })
                            }
                        </GeminiScrollbar>
                    </div>);
                }
            }
        } else if (_.isArray(customerInfoArr) && customerInfoArr[0]) {//原来无客户，添加完客户时，展示添加的客户详情
            newLabels ? customerInfoArr[0].labels = newLabels : null;
            return this.renderCustomerDetail(customerInfoArr[0]);
        } else if (!this.state.isAddToCustomerFlag && !this.state.isAddFlag) {
            //客户不存在时，展示添加到已有客户、添加客户的按钮(添加到已有客户/添加完客户后，此提示不再提示添加客户)
            return (
                <span>
                    <span className="handle-btn-container add-to-customer"
                        onClick={this.showAddToCustomerForm}>
                        {Intl.get('crm.add.to.exist.customer', '添加到已有客户')}
                    </span>
                    <span className="handle-btn-container add-customer" onClick={this.showAddCustomerForm}>
                        {Intl.get('crm.3', '添加客户')}
                    </span>
                </span>);
        }
    }
    //后端推送的消息是否有customer_id
    isPhoneMsgWithCustomerId(phoneMsg) {
        return phoneMsg && phoneMsg.customer_id;
    }
    renderCustomerDetail(customer) {
        return (
            <CustomerDetail
                currentId={customer.id}
                curCustomer={customer}
                editCustomerBasic={this.editCustomerBasic.bind(this, customer)}
                hideRightPanel={this.hidePhonePanel.bind(this)}
                ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                showApplyUserForm={this.showApplyUserForm.bind(this)}
                showOpenAppForm={this.showOpenAppForm.bind(this)}
                returnInfoPanel={this.returnInfoPanel.bind(this)}
                customerCustomFieldData={this.state.customerCustomFieldData}
            />);
    }

    //修改客户的基本信息
    editCustomerBasic = (updateCustomer, newBasic) => {
        if (newBasic && newBasic.id) {
            if (updateCustomer && updateCustomer.id === newBasic.id) {
                for (var key in newBasic) {
                    if (newBasic[key] || newBasic[key] === '') {
                        updateCustomer[key] = newBasic[key];
                    }
                }
            }
        }
    };
    //点击添加产品反馈
    handleAddProductFeedback = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-more-info-container'), '点击添加反馈按钮');
        this.setState({
            isAddingMoreProdctInfo: true,
        }, () => {
            //展开添加产品反馈面板后，重新计算详情中的高度
            phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
        });
    };
    //添加联系计划
    handleAddPlan = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-plan-info-container'), '点击添加联系计划按钮');
        this.setState({
            isAddingPlanInfo: true,
        }, () => {
            //展开添加联系计划面板后，重新计算详情中的高度
            phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
        });
    };
    //关闭联系计划面板
    closeAddPlan = () => {
        if(this.state.isAddingPlanInfo) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-plan-info-container'), '关闭联系计划');
            this.setState({
                isAddingPlanInfo: false,
            });
        }
    };
    //点击取消按钮
    handleCancel = () => {
        this.setState({
            isAddingMoreProdctInfo: false,
            isAddingAppFeedback: '',
            addAppFeedbackErrMsg: ''
        }, () => {
            //取消添加产品反馈后，重新计算详情中的高度
            phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
        });
    };
    //点击提交按钮
    handleSubmit = (submitObj) => {
        this.addAppFeedback(submitObj);
    };
    //提交应用反馈
    addAppFeedback(submitObj) {
        this.setState({
            isAddingAppFeedback: 'loading',
            addAppFeedbackErrMsg: '',
        });
        addMoreInfoAction.addAppFeedback(submitObj, (result) => {
            if (_.isArray(result)) {
                //保存成功
                this.setState({
                    isAddingAppFeedback: 'success',
                    addAppFeedbackErrMsg: ''
                }, () => {
                    //展开添加产品反馈面板后，重新计算详情中的高度
                    phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
                });
            } else if (_.isString(result)) {
                // 保存失败
                this.setState({
                    isAddingAppFeedback: 'error',
                    addAppFeedbackErrMsg: result
                });
            }
        });
    }

    //取消保存联系计划
    handleScheduleCancel = (resData) => {
        //如果有返回值的回调此函数，说明为保存成功后面板自动关闭
        if(!_.isEmpty(resData)) {
            this.setState({
                isAddingScheduleSuccess: true
            });
        }
        this.setState({
            isAddingPlanInfo: false
        }, () => {
            //取消添加联系计划后，重新计算详情中的高度
            phoneMsgEmitter.emit(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT);
        });
    };

    handleSubmitBack = (data) => {
        newLabels = data.labels;
    }

    renderMainContent() {
        let defalutCustomerInfoArr = _.get(this.state, 'customerInfoArr[0]', {});
        var phonemsgObj = this.getPhonemsgObj(this.state.paramObj);
        const newSchedule = {
            customer_id: defalutCustomerInfoArr.id || _.get(this, 'state.paramObj.customer_params.curCustomer.id'),
            customer_name: defalutCustomerInfoArr.name || _.get(this, 'state.paramObj.customer_params.curCustomer.name'),
            start_time: '',
            end_time: '',
            alert_time: '',
            topic: '',
            edit: true
        };
        var cls = 'phone-alert-inner-content';
        if (this.state.isAddingMoreProdctInfo) {
            //添加产品反馈，竞品信息
            return (
                <div className={cls}>
                    <AddMoreInfo
                        handleCancel={this.handleCancel}
                        handleSubmit={this.handleSubmit}
                        isAddingAppFeedback={this.state.isAddingAppFeedback}
                        addAppFeedbackErrMsg={this.state.addAppFeedbackErrMsg}
                    />
                </div>
            );
        } else if (this.state.isAddingPlanInfo) {
            var clueArr = _.get(this,'state.customerInfoArr.length') ? this.state.customerInfoArr : [_.get(this, 'state.paramObj.customer_params.curCustomer')];
            return (
                <div className={`add-plan ${cls}`}>
                    <AddScheduleForm
                        handleScheduleCancel={this.handleScheduleCancel}
                        currentSchedule={newSchedule}
                        customerArr={clueArr}
                    />
                </div>
            );
        } else if (this.state.isAddFlag) {
            let phoneNum = this.state.phoneNum || phonemsgObj.to;
            //添加客户表单
            return (
                <div className={cls}>
                    <AddCustomerForm
                        phoneNum={phoneNum}
                        hideAddForm={this.hideAddForm}
                        updateCustomer={this.updateCustomer}
                        showRightPanel={this.showRightPanel}
                        handleSubmitBack={this.handleSubmitBack}
                    />
                </div>

            );
        } else if (this.state.isAddToCustomerFlag) {
            let phoneNum = this.state.phoneNum || phonemsgObj.to;
            return (
                <div className={cls}>
                    <PhoneAddToCustomerForm phoneNum={phoneNum}
                        cancelAddToCustomer={this.cancelAddToCustomer}
                        afterAddToCustomerSuccess={this.afterAddToCustomerSuccess}/>
                </div>);
        }
    }

    afterAddToCustomerSuccess = (customer) => {
        this.getCustomerInfoByCustomerId({customers: [customer]});
        this.cancelAddToCustomer();
    }

    renderCustomerSizeTip(phonemsgObj) {
        let tipContent = '';
        //未点击添加和添加到已有客户按钮时，展示该电话对应客户数的提示
        if (!this.state.isAddFlag && !this.state.isAddToCustomerFlag) {
            if (_.isArray(phonemsgObj.customers) && phonemsgObj.customers.length) {
                //只对应一个客户时不用提示
                if (phonemsgObj.customers.length !== 1 && !this.isPhoneMsgWithCustomerId(phonemsgObj)) {
                    tipContent = Intl.get('call.record.some.customer', '此号码对应{num}个{type}', {num: phonemsgObj.customers.length, type: Intl.get('call.record.customer', '客户')});
                }
            } else if (!(_.isArray(this.state.customerInfoArr) && this.state.customerInfoArr.length)) {//添加完客户后，此提示不用展示
                tipContent = Intl.get('call.record.no.response.customer', '此号码无对应{type}',{type: Intl.get('call.record.customer', '客户')});
            }
        }
        if (tipContent) {
            return (<div className="customer-count-tip">{tipContent}</div>);
        } else {
            return null;
        }
    }

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    };

    //展示申请用户界面
    showApplyUserForm(type, curOrder, apps, customerName) {
        this.setState({
            applyType: type,
            apps: apps,
            curOrder: curOrder,
            applyFormCustomerName: customerName
        }, () => {
            this.setState({applyUserShowFlag: true});
        });
    }

    //申请、开通应用后返回
    returnInfoPanel() {
        this.setState({
            applyUserShowFlag: false,
            openAppShowFlag: false
        });
    }

    showOpenAppForm() {
        this.setState({openAppShowFlag: true});
    }

    hidePhonePanel(e) {
        Trace.traceEvent(e, this.state.paramObj.call_params ? '关闭拨打电话的面板' : '关闭客户详情');
        this.returnInfoPanel();
        let paramObj = this.state.paramObj;
        if (paramObj.customer_params && _.isFunction(paramObj.customer_params.hideRightPanel)) {
            paramObj.customer_params.hideRightPanel();
        }
        if (_.isFunction(this.props.closePhonePanel)) {
            this.props.closePhonePanel();
        }
        //清空存储的通话id和时间
        phoneRecordObj.callid = '';
        phoneRecordObj.received_time = '';//通话时间
        phoneAlertAction.setInitialState();
    }

    //获取详情中打电话时的客户id
    getDetailCustomerId() {
        let paramObj = this.state.paramObj;
        let customerId = '';
        //客户详情的相关参数（客户id）存在,说明有打开的客户详情
        if (paramObj.customer_params && paramObj.customer_params.currentId) {
            let phonemsgObj = this.getPhonemsgObj(paramObj);
            let phoneStatusCustomerIds = phonemsgObj ? this.getPhoneStatusCustomerIds(phonemsgObj) : [];
            //当前展示的客户详情中的客户id是通话中传过来的客户ids之一(说明是从当前打开的客户详情中打的电话)
            if (_.isArray(phoneStatusCustomerIds) && phoneStatusCustomerIds.indexOf(paramObj.customer_params.currentId) !== -1) {
                customerId = paramObj.customer_params.currentId;
            }
        }
        return customerId;
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
        return (
            <div data-tracename="电话弹屏" id="phone-status-content">
                <div className={AddMoreInfoCls} id="phone-alert-modal-inner">
                    <div className='phone-status-handle-wrap'>
                        <PhoneStatusTop
                            phoneAlertModalTitleCls={PhoneAlertModalTitleCls}
                            phonemsgObj={phonemsgObj}
                            handleAddProductFeedback={this.handleAddProductFeedback}
                            isModalShown={this.state.isModalShown}
                            contactNameObj={this.state.paramObj.call_params.contactNameObj}
                            detailCustomerId={this.getDetailCustomerId()}//客户详情中打电话时，客户的id
                            isAddingMoreProdctInfo={this.state.isAddingMoreProdctInfo}
                            handleAddPlan={this.handleAddPlan}
                            closeAddPlan={this.closeAddPlan} //手动控制关闭面板
                            isAddingScheduleSuccess={this.state.isAddingScheduleSuccess}//检查自定义是否添加成功
                            isAddingPlanInfo={this.state.isAddingPlanInfo}
                            isCustomerDetailCall={this.isCustomerDetailCall(this.state.paramObj) || this.isPhoneMsgWithCustomerId(phonemsgObj)}
                        />
                        {this.renderMainContent()}
                    </div>
                    {!this.isCustomerDetailCall(this.state.paramObj) ? //不是从客户详情中拨打的电话并且推送来的消息中有customer_id
                        //客户信息展示或者添加客户按钮

                        <div className="customer-info-container">
                            <div>
                                {this.renderCustomerSizeTip(phonemsgObj)}
                                <div className="customer-detail">{this.renderCustomerInfor(phonemsgObj)}</div>
                            </div>
                        </div>
                        : null}
                </div>
                {/*该客户下的用户列表*/}
                {this.state.isShowCustomerUserListPanel ? <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    { this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel> : null}

            </div>
        );
    }

    //获取是否是从客户详情中拨打的电话
    isCustomerDetailCall(paramObj) {
        let flag = false;
        //客户详情的相关参数（客户id）存在,说明有打开的客户详情
        if (paramObj.customer_params && paramObj.customer_params.currentId) {
            let phonemsgObj = this.getPhonemsgObj(paramObj);
            let phoneStatusCustomerIds = this.getPhoneStatusCustomerIds(phonemsgObj);
            //当前展示的客户详情中的客户id是通话中传过来的客户ids之一(说明是从当前打开的客户详情中打的电话)
            if (_.isArray(phoneStatusCustomerIds) && phoneStatusCustomerIds.indexOf(paramObj.customer_params.currentId) !== -1) {
                flag = true;
            }
        }

        return flag;
    }

    //只打开了客户详情
    isOnlyOpenCustomerDetail(paramObj) {
        return paramObj.customer_params && !paramObj.call_params;
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
        let className = classNames('right-panel-content', {'crm-right-panel-content-slide': this.state.applyUserShowFlag});
        let rightPanelClassName = 'crm-right-panel  white-space-nowrap table-btn-fix';
        if (this.state.applyUserShowFlag || this.state.openAppShowFlag) {
            rightPanelClassName = 'apply-user-form-panel  white-space-nowrap table-btn-fix';
        }
        if (this.props.notificationCustomer) {
            rightPanelClassName += ' notification-system-customer';
        }
        return (
            <RightPanel showFlag={this.props.showFlag} id="customer-phone-status-content"
                className={rightPanelClassName}
                data-tracename={paramObj.call_params ? '电话弹屏' : '客户详情'}>
                {this.isHideCloseBtn() ? <span className="close-placeholder"/> : (
                    <span className="iconfont icon-close" onClick={(e) => {
                        this.hidePhonePanel(e);
                    }}/>)}
                <div className={className}>
                    {paramObj.call_params ? this.renderPhoneStatus() : null}
                    {/*{只打开客户详情或从当前展示的客户详情中打电话时}*/}
                    {this.isOnlyOpenCustomerDetail(paramObj) || this.isCustomerDetailCall(paramObj) ? (
                        <CustomerDetail
                            {...paramObj.customer_params}
                            hideRightPanel={this.hidePhonePanel.bind(this)}
                            showApplyUserForm={this.showApplyUserForm.bind(this)}
                            showOpenAppForm={this.showOpenAppForm.bind(this)}
                            returnInfoPanel={this.returnInfoPanel.bind(this)}
                            editCustomerBasic={this.editCustomerBasic.bind(this,_.get(paramObj,'customer_params.curCustomer'))}
                            customerCustomFieldData={this.state.customerCustomFieldData}
                        />) : null
                    }
                </div>
                {this.state.curOrder.id ? (
                    <div className={className}>
                        <RightPanelReturn onClick={this.returnInfoPanel.bind(this)}/>
                        <RightPanelClose onClick={this.returnInfoPanel.bind(this)}/>
                        <div className="crm-right-panel-content">
                            <ApplyUserForm
                                applyType={this.state.applyType}
                                apps={this.state.apps}
                                order={this.state.curOrder}
                                customerName={this.state.applyFormCustomerName}
                                cancelApply={this.returnInfoPanel.bind(this)}
                            />
                        </div>
                    </div>
                ) : null}
            </RightPanel>
        );
    }
}

PhonePanel.defaultProps = {
    showFlag: false,
    paramObj: {
        call_params: null,//后端推送过来的电话状态相关的参数
        customer_params: null//客户详情相关的参数
    }
};

PhonePanel.propTypes = {
    showFlag: PropTypes.bool,
    paramObj: PropTypes.object,
    setInitialPhoneObj: PropTypes.func,
    closePhonePanel: PropTypes.func,
    notificationCustomer: PropTypes.bool
};
export default PhonePanel;
