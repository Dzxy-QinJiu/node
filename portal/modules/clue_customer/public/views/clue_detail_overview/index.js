import { emailRegex, qqRegex, checkWechat } from 'PUB_DIR/sources/utils/validate-util';

/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
var React = require('react');
require('../../css/clue_detail_overview.less');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import {Button, Form, Icon, message, Input, Popover} from 'antd';
const FormItem = Form.Item;
const {TextArea} = Input;
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import DatePickerField from 'CMP_DIR/basic-edit-field-new/date-picker';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
var clueCustomerAction = require('../../action/clue-customer-action');
var clueCustomerAjax = require('../../ajax/clue-customer-ajax');
import {Select} from 'antd';
const Option = Select.Option;
import Trace from 'LIB_DIR/trace';
var className = require('classnames');
var userData = require('PUB_DIR/sources/user-data');
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import UserDetail from 'MOD_DIR/app_user_manage/public/views/user-detail';
import {
    SELECT_TYPE,
    AVALIBILITYSTATUS,
    getClueSalesList,
    getLocalSalesClickCount,
    SetLocalSalesClickCount,
    handleSubmitClueItemData,
    handleSubmitContactData,
    contactNameRule,
    getClueStatusValue,
    editCluePrivilege,
    assignSalesPrivilege,
    handlePrivilegeType
} from '../../utils/clue-customer-utils';
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const EDIT_FEILD_WIDTH = 300;
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import PhoneCallout from 'CMP_DIR/phone-callout';
import PhoneInput from 'CMP_DIR/phone-input';
var clueFilterStore = require('../../store/clue-filter-store');
var clueCustomerStore = require('../../store/clue-customer-store');
import {subtracteGlobalClue,renderClueStatus} from 'PUB_DIR/sources/utils/common-method-util';
import {TAB_KEYS } from 'MOD_DIR/crm/public/utils/crm-util';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {myWorkEmitter} from 'PUB_DIR/sources/utils/emitters';
import DetailCard from 'CMP_DIR/detail-card';
import ClueTraceList from 'MOD_DIR/clue_customer/public/views/clue_trace_list';
import moment from 'moment';
import ClueTraceAction from '../../action/clue-trace-action';
const HAS_BTN_HEIGHT = 58;//为按钮预留空间
const HAS_INPUT_HEIGHT = 140;//为无效输入框预留空间
import { clueEmitter } from 'PUB_DIR/sources/utils/emitters';
class ClueDetailOverview extends React.Component {
    state = {
        clickAssigenedBtn: false,//是否点击了分配客户的按钮
        isShowAddCustomer: false,//是否展示添加客户内容
        isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
        app_user_id: '',
        curClue: $.extend(true, {}, this.props.curClue),
        divHeight: this.props.divHeight,//没有按钮时高度
        similarClueLoading: false,//正在获取相似线索
        similarClueErrmsg: '',//获取相似线索出错
        similarClueLists: [],//相似线索列表
        similarCustomerLoading: false,//正在获取相似客户
        similarCustomerErrmsg: '',//获取相似客户出错
        similarCustomerLists: [],//相似客户列表
        showLargerCustomerLists: false,//展示大于3个的客户列表
        showLargerClueLists: false,//展示大于3个的线索列表
        submitReason: '',//要提交的无效原因
        submitInvalidateClueMsg: '',//提交标记无效出错的信息
        submitInvalidateLoading: false,//正在提交无效记录
        isShowInvalidateInputPanel: false //正在展示无效信息输入框
    };

    componentDidMount() {
        clueCustomerStore.listen(this.onClueCustomerStoreChange);
        //获取相似线索列表
        this.getSimilarClueLists();
        //获取相似客户列表
        //如果是已转化的客户，不需要展示相似客户
        if (!this.isHasTransferClue()){
            this.getSimilarCustomerLists();
        }
    }
    //线索的状态是已转化的线索
    isHasTransferClue = () => {
        return _.get(this, 'state.curClue.status') === SELECT_TYPE.HAS_TRANSFER;
    }
    componentWillUnmount() {
        clueCustomerStore.unlisten(this.onClueCustomerStoreChange);
    }
    onClueCustomerStoreChange = () => {
        let curClue = _.cloneDeep(this.state.curClue);
        curClue.contacts = clueCustomerStore.getState().curClue.contacts;
        this.setState({curClue});
    };
    getSimilarClueLists = () => {
        this.setState({
            similarClueLoading: true,
            similarClueErrmsg: ''
        });
        var curClue = this.state.curClue;
        var type = 'self';
        if(hasPrivilege('LEAD_QUERY_SIMILARITY_LEAD_ALL')){
            type = 'all';
        }
        $.ajax({
            url: '/rest/get/similar/cluelists/' + type,
            type: 'get',
            dateType: 'json',
            data: {
                lead_id: _.get(curClue, 'id'),
                lead_name: _.get(curClue, 'name'),
                lead_phones: this.getCurCluePhones()
            },
            success: (data) => {
                this.setState({
                    similarClueLists: _.isArray(data.similarity_list) ? data.similarity_list : [],
                    similarClueLoading: false,
                    similarClueErrmsg: ''
                });
            },
            error: (errorMsg) => {
                this.setState({
                    similarClueLists: [],
                    similarClueLoading: false,
                    similarClueErrmsg: errorMsg
                });
            }
        });

    };
    getCurCluePhones = () => {
        var curClue = this.state.curClue;
        var phones = [];
        if (_.get(curClue,'contacts[0]')){
            _.forEach(_.get(curClue,'contacts'), (item) => {
                if (_.isArray(item.phone)){
                    phones = _.concat(phones, item.phone);
                }
            });
        }
        return phones.join(',');
    }
    getSimilarCustomerLists = () => {
        this.setState({
            similarCustomerLoading: true,
            similarCustomerErrmsg: ''
        });
        var curClue = this.state.curClue;
        $.ajax({
            url: '/rest/get/similar/customerlists/all',
            type: 'get',
            dateType: 'json',
            data: {
                name: _.get(curClue, 'name'),
                phones: this.getCurCluePhones()
            },
            success: (data) => {
                this.setState({
                    similarCustomerLists: _.isArray(data.similarity_list) ? data.similarity_list : [],
                    similarCustomerLoading: false,
                    similarCustomerErrmsg: ''
                });
            },
            error: (errorMsg) => {
                this.setState({
                    similarCustomerLists: [],
                    similarCustomerLoading: false,
                    similarCustomerErrmsg: errorMsg
                });
            }
        });
    };


    componentWillReceiveProps(nextProps) {
        //修改某些属性时，线索的id不变，但是需要更新一下curClue所以不加 nextProps.curClue.id !== this.props.curClue.id 这个判断了
        if (_.get(nextProps.curClue,'id')) {
            var diffClueId = _.get(nextProps,'curClue.id') !== _.get(this, 'props.curClue.id');
            this.setState({
                curClue: $.extend(true, {}, nextProps.curClue)
            },() => {
                var curClue = nextProps.curClue;
                if (diffClueId){
                    //获取相似线索列表
                    this.getSimilarClueLists();
                    //获取相似客户列表
                    if (!this.isHasTransferClue()){
                        this.getSimilarCustomerLists();
                    }
                }
            });
        }
        if (nextProps.divHeight !== this.props.divHeight){
            this.setState({
                divHeight: nextProps.divHeight,
            });
        }
    }

    changeClueFieldSuccess = (newCustomerDetail, contact_id) => {
        //如果是修改的线索来源和接入渠道，要看是不是重新添加的
        for (var key in newCustomerDetail) {
            if (key === 'clue_source' && !_.includes(this.props.clueSourceArray, newCustomerDetail[key])) {
                this.props.updateClueSource(newCustomerDetail[key]);
            }
            if (key === 'access_channel' && !_.includes(this.props.accessChannelArray, newCustomerDetail[key])) {
                this.props.updateClueChannel(newCustomerDetail[key]);
            }
            if (key === 'clue_classify' && !_.includes(this.props.clueClassifyArray, newCustomerDetail[key])) {
                this.props.updateClueClassify(newCustomerDetail[key]);
            }
        }
        if (contact_id){
            newCustomerDetail.contact_id = contact_id;
        }
        clueCustomerAction.afterEditCustomerDetail(newCustomerDetail);
    };

    //今天之后的日期不可以选
    disabledDate = (current) => {
        return current > moment().endOf('day');
    };

    getClueSourceOptions = () => {
        return (
            this.props.clueSourceArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    };

    getAccessChannelOptions = () => {
        return (
            this.props.accessChannelArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    };

    getClueClassifyOptions = () => {
        return this.props.clueClassifyArray.map((source, idx) => {
            return (<Option key={idx} value={source}>{source}</Option>);
        });
    };

    getSalesOptions = () => {
        var clueSalesIdList = getClueSalesList();
        _.forEach(this.props.salesManList,(sales) => {
            sales.clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(sales, 'user_info.user_id'));
        });
        //按点击的次数进行排序
        var dataList = _.sortBy(this.props.salesManList,(item) => {return -item.clickCount;});
        return dataList.map((sales, idx) => {
            let teamName = _.get(sales, 'user_groups[0].group_name') ? ` - ${sales.user_groups[0].group_name}` : '';
            let name = _.get(sales, 'user_info.nick_name', '') + teamName;
            return (<Option key={idx}
                value={_.get(sales, 'user_info.user_id')}>{name}</Option>);
        });
    };

    cancelEditClueSource = () => {
        var curClue = this.state.curClue;
        curClue.clue_source = this.props.curClue.clue_source;
        this.setState({
            curClue: curClue
        });
    };

    cancelEditClueChannel = () => {
        var curClue = this.state.curClue;
        curClue.access_channel = this.props.curClue.access_channel;
        this.setState({
            curClue: curClue
        });
    };

    cancelEditClueClassify = () => {
        var curClue = this.state.curClue;
        curClue.clue_classify = this.props.curClue.clue_classify;
        this.setState({
            curClue: curClue
        });
    };

    cancelEditSales = () => {
        var curClue = this.state.curClue;
        curClue.user_name = this.props.curClue.user_name;
        this.setState({
            curClue: curClue,
            clickAssigenedBtn: false
        });
    };

    onSelectCluesource = (updateSource) => {
        var curClue = this.state.curClue;
        curClue.clue_source = updateSource;
        this.setState({
            curClue: curClue
        });
    };

    onSelectAccessChannel = (updateChannel) => {
        var curClue = this.state.curClue;
        curClue.access_channel = updateChannel;
        this.setState({
            curClue: curClue
        });
    };

    onSelectClueClassify = (updateClassify) => {
        var curClue = this.state.curClue;
        curClue.clue_classify = updateClassify;
        this.setState({
            curClue: curClue
        });
    };

    onSelectClueSales = (updateUser) => {
        var curClue = this.state.curClue;
        curClue.user_name = updateUser;
        this.setState({
            curClue: curClue
        });
    };
    //保存修改的基本信息
    saveEditBasicInfo = (type, saveObj, successFunc, errorFunc) => {
        var item = type,contact_id = '';
        if (_.isObject(type)){
            //修改联系人的相关属性
            item = type.editItem;
            contact_id = type.id;
            saveObj.contact_id = contact_id;
            if (item === 'phone'){
                saveObj.clueName = _.get(this, 'state.curClue.name');
            }
            this.changeClueContactInfo(saveObj, successFunc, errorFunc, contact_id);

        }else{
            //修改线索的基本信息
            this.changeClueItemInfo(saveObj, successFunc, errorFunc);

        }
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存线索${item}的修改`);
    };
    //修改联系人的相关信息
    changeClueContactInfo = (saveObj, successFunc, errorFunc, contact_id) => {
        var data = handleSubmitContactData(_.cloneDeep(saveObj));
        clueCustomerAjax.updateClueContactDetail(data).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                //修改联系人的时候，需要把联系人的下标加上
                this.changeClueFieldSuccess(saveObj, contact_id);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };
    //修改线索的相关信息
    changeClueItemInfo = (saveObj, successFunc, errorFunc) => {
        var data = handleSubmitClueItemData(_.cloneDeep(saveObj));
        clueCustomerAjax.updateClueItemDetail(data).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.changeClueFieldSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };

    //保存跟进记录内容
    saveTraceContentInfo = (saveObj, successFunc, errorFunc) => {
        if (!_.get(saveObj,'remark')){
            return;
        }
        var curClue = this.state.curClue;
        subtracteGlobalClue(curClue);
        saveObj.lead_id = saveObj.id;
        saveObj.type = 'other';
        delete saveObj.id;
        clueCustomerAction.addCluecustomerTrace(saveObj, (result) => {
            if (result && result.error) {
                if (_.isFunction(errorFunc)) errorFunc(result.errorMsg);
            } else {
                var userId = userData.getUserData().user_id || '';
                var userName = userData.getUserData().nick_name;
                var addTime = moment().valueOf();
                if (!curClue.customer_traces) {
                    curClue.customer_traces = [
                        {
                            remark: saveObj.remark,
                            user_id: userId,
                            nick_name: userName,
                            add_time: addTime
                        }];
                } else {
                    //原来有customer_traces这个属性时，数组中除了remark还有别的属性
                    curClue.customer_traces[0].remark = saveObj.remark;
                    curClue.customer_traces[0].user_id = userId;
                    curClue.customer_traces[0].nick_name = userName;
                    curClue.customer_traces[0].add_time = addTime;
                }
                this.setState({
                    curClue: curClue
                });

                //如果是待分配或者待跟进状态,需要在列表中删除并且把数字减一
                clueCustomerAction.afterAddClueTrace(curClue);
                this.props.updateCustomerLastContact(saveObj);
                if (_.isFunction(successFunc)) successFunc();
            }
        });
    };

    //分配线索给某个销售 && 这个销售不是当前账号
    handleChangeAssignedSales = (submitObj, successFunc, errorFunc) => {
        var user_id = _.get(this.state.curClue,'user_id');
        var curClue = this.state.curClue;
        var clueCustomerTypeFilter = getClueStatusValue(clueFilterStore.getState().filterClueStatus);
        //如果是待分配状态，分配完之后要在列表中删除一个,在待跟进列表中增加一个
        var isWillDistribute = clueCustomerTypeFilter.status === SELECT_TYPE.WILL_DISTRIBUTE;
        var targetObj = _.find(this.props.salesManList, (item) => {
            var userId = _.get(item, 'user_info.user_id');
            return userId === submitObj.user_id;
        });
        if (targetObj && _.isArray(targetObj.user_groups) && targetObj.user_groups.length) {
            var userName = _.get(targetObj, 'user_info.nick_name');
            var teamId = _.get(targetObj, 'user_groups[0].group_id');
            var teamName = _.get(targetObj, 'user_groups[0].group_name');
            var updateObj = {
                'customer_id': submitObj.id,
                'sale_id': submitObj.user_id,
                'sale_name': userName,
                'team_name': teamName,
                'team_id': teamId,
            };
            clueCustomerAction.distributeCluecustomerToSale(updateObj, (result) => {
                SetLocalSalesClickCount(submitObj.user_id);
                if (result && result.errorMsg) {
                    if (_.isFunction(errorFunc)) errorFunc(result.errorMsg);
                } else {

                    if (_.isFunction(successFunc)) successFunc();
                    if (submitObj.user_id !== userData.getUserData().user_id) {
                        subtracteGlobalClue(curClue, (flag) => {
                            if(flag){
                                clueEmitter.emit(clueEmitter.REMOVE_CLUE_ITEM,curClue);
                            }
                        });
                    }
                    this.setState({
                        clickAssigenedBtn: false
                    });
                    var updateObj = {
                        'user_name': userName,
                        'user_id': submitObj.user_id,
                        'sales_team': teamName,
                        'sales_team_id': teamId
                    };
                    this.props.updateClueProperty(updateObj);
                    if (isWillDistribute) {
                        clueCustomerAction.afterAssignSales(curClue.id);
                        this.props.updateClueProperty({
                            'status': SELECT_TYPE.WILL_TRACE
                        });
                    }
                    //分配完线索后，需要将首页对应的工作设为已完成
                    if (window.location.pathname === '/home') {
                        myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
                    }
                }
            });
        }
    };

    //点击分配客户按钮
    handleClickAssignedBtn = () => {
        this.setState({
            clickAssigenedBtn: true
        });
    };

    //线索关联客户
    handleAssociatedCustomer = (submitObj, successFunc, errorFunc) => {
        var curClueDetail = this.state.curClue;
        clueCustomerAction.setClueAssociatedCustomer(submitObj, (result) => {
            if (_.isString(result)) {
                if (_.isFunction(errorFunc)) errorFunc(result);
            } else {
                if (_.isFunction(successFunc)) successFunc();
                curClueDetail.customer_id = submitObj.customer_id;
                curClueDetail.customer_name = submitObj.customer_name;
                if (submitObj.customer_id){
                    //如果有客户的id，需要把线索的状态改成已跟进
                    this.props.removeUpdateClueItem();
                    if (curClueDetail.status !== SELECT_TYPE.HAS_TRACE){
                        curClueDetail.status = SELECT_TYPE.HAS_TRACE;

                    }
                }else{
                    if (!_.get(curClueDetail,'customer_traces[0].remark')){
                        if (_.get(curClueDetail,'user_name')){
                            curClueDetail.status = SELECT_TYPE.WILL_TRACE;
                        }else{
                            curClueDetail.status = SELECT_TYPE.WILL_DISTRIBUTE;
                        }
                    }
                }
                this.setState({
                    clickAssociatedBtn: false,
                    curClue: curClueDetail
                });
                clueCustomerAction.afterModifiedAssocaitedCustomer(curClueDetail);
            }
        });
    };
    saveSameNoCustomerName = () => {
        this.setState({
            clickAssociatedBtn: false,
        });
    };

    addAssignedCustomer = () => {

        this.setState({
            isShowAddCustomer: true
        });
    };

    //关闭添加面板
    hideAddForm = () => {
        this.setState({
            isShowAddCustomer: false
        });
    };

    //添加完客户后
    addOneCustomer = (newCustomerArr) => {
        this.setState({
            isShowAddCustomer: false
        });
        if (_.isArray(newCustomerArr) && newCustomerArr[0]) {
            var newCustomer = newCustomerArr[0];
            var curClue = this.state.curClue;
            curClue.customer_name = newCustomer.name;
            curClue.customer_id = newCustomer.id;
            curClue.customer_label = newCustomer.customer_label;
            this.setState({
                curClue: curClue,
                clickAssociatedBtn: false
            });
            clueCustomerAction.afterModifiedAssocaitedCustomer(curClue);
        }
    };

    //渲染添加客户内容
    renderAddCustomer = () => {
        var phoneNum = this.state.curClue ? this.state.curClue.contact_way : '';
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
                formData={this.state.curClue}
                isAssociateClue={true}
                phoneNum={phoneNum}
                addOne={this.addOneCustomer}
                isShowMadal={false}
            />
        );
    };

    //标记线索有效
    handleClickValidBtn = (item, callback) => {
        var updateValue = AVALIBILITYSTATUS.AVALIBILITY;
        var submitObj = {
            id: item.id,
            availability: updateValue
        };
        this.setState({
            isInvaliding: true,
        });
        clueCustomerAction.updateCluecustomerDetail(submitObj, (result) => {
            if (_.isString(result)) {
                this.setState({
                    isInvaliding: false,
                    editInvalidClueId: ''
                });
            } else {
                _.isFunction(callback) && callback(updateValue);
                clueCustomerAction.deleteClueById(item);
                clueCustomerAction.updateClueTabNum(item.status);
                this.setState({
                    isInvaliding: false,
                    editInvalidClueId: ''
                });
            }
        });
    };
    cancelInvalidClue = () => {
        this.setState({
            editInvalidClueId: ''
        });
    };
    renderItemSelfSettingContent = (curClue,item) => {
        let hasPrivilege = editCluePrivilege(curClue);
        return <PhoneCallout
            phoneNumber={item}
            showPhoneNum={addHyphenToPhoneNumber(item)}
            showPhoneIcon={true}
            hidePhoneIcon={!hasPrivilege}
        />;
    };
    renderItemSelfSettingForm = (key, index, that) => {
        const fieldKey = `${that.props.field}[${key}]`;
        let initValue = _.get(that.state, `value[${key}]`, '');
        let validateRules = [];
        if (index === 0) {//电话必填的验证
            validateRules = _.concat(validateRules, [{
                required: true,
                message: Intl.get('user.info.input.phone', '请输入电话'),
            }]);
        }
        return (
            <PhoneInput
                initialValue={initValue}
                placeholder={Intl.get('clue.add.phone.num', '电话号码')}
                validateRules={validateRules}
                id={fieldKey}
                labelCol={{span: 4}}
                wrapperCol={{span: 20}}
                colon={false}
                form={that.props.form}
                label={index === 0 ? Intl.get('common.phone', '电话') : ' '}
            />);
    };

    renderAssigendClueText = () => {
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('crm.6', '负责人')}：
                </div>
                <div className="clue-info-detail no-handled">
                    {Intl.get('clue.has.not.distribute', '该线索还没有分配')}
                </div>
                <div className="btn-container">
                    <Button type="primary" data-tracename="点击分配线索按钮"
                        onClick={this.handleClickAssignedBtn}>{Intl.get('clue.customer.distribute', '分配')}</Button>
                </div>
            </div>
        );
    };


    renderAssignedClueEdit = () => {
        let user = userData.getUserData();
        var curClue = this.state.curClue;
        //分配的状态
        var assignedDisplayType = this.state.clickAssigenedBtn ? 'edit' : 'text';
        //分配线索给销售的权限
        var hasAssignedPrivilege = assignSalesPrivilege(curClue);
        //所分配的销售
        var assignedSales = _.get(curClue, 'user_name');
        //所分配的销售所属的团队
        var assignedTeam = _.get(curClue, 'sales_team');
        var displayText = assignedSales;
        if (assignedTeam){
            displayText += ' - ' + assignedTeam;
        }
        return (
            <div className="clue-info-item">
                <div className="clue-info-label handle-clue-person">
                    {Intl.get('crm.6', '负责人')}
                </div>
                <div className="clue-info-detail">
                    <BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        displayType={assignedDisplayType}
                        hasEditPrivilege={hasAssignedPrivilege}
                        id={curClue.id}
                        saveEditSelect={this.handleChangeAssignedSales}
                        cancelEditField={this.cancelEditSales}
                        value={displayText}
                        field="user_id"
                        displayText={displayText}
                        selectOptions={this.getSalesOptions()}
                        onSelectChange={this.onSelectClueSales}
                        noDataTip={Intl.get('clue.handle.no.distribute.clue', '未分配')}
                    />
                </div>
            </div>
        );
    };
    showConfirmInvalid = (item) => {
        let availability = item.availability;
        //如果当前用户状态为有效，点击无效时标记flag
        if(_.isEqual(availability, AVALIBILITYSTATUS.AVALIBILITY)) {
            this.setState({
                isShowInvalidateInputPanel: true,
                editInvalidClueId: item.id
            }, () => {
                if (this['addTextarea']) {
                    this['addTextarea'].focus();
                }
            });
        } else {
            this.setState({
                editInvalidClueId: item.id
            });
        }
    };
    //取消无效处理
    handleInvalidateCancelBtn = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-btn-cancel'), '取消保存跟进内容');
        this.setState({
            submitInvalidateClueMsg: '',
            submitReason: '',
            editInvalidClueId: '',
            isShowInvalidateInputPanel: false,
            invalidateClueStatus: ''
        });
    };
    //输入框改变时数据处理
    handleInvalidateInputChange = (e) => {
        this.setState({
            submitReason: e.target.value
        });
    };
    //确认无效处理
    handleInvalidateBtn = (item, callback) => {
        if (this.state.submitInvalidateLoading) {
            return;
        }
        let invalidReason = _.trim(this.state.submitReason);
        if (!invalidReason) {
            this.setState({
                submitInvalidateClueMsg: Intl.get('clue.invalid.reason.not.empty', '无效原因不能为空'),
                invalidateClueStatus: 'error'
            });
        } else {
            let updateAvailability = AVALIBILITYSTATUS.INAVALIBILITY;
            let updateObj = {
                id: item.id,
                availability: updateAvailability,
                invalid_info: {
                    invalid_reason: invalidReason
                }
            };
            updateObj = JSON.stringify(updateObj);
            let clueState = {
                updateItem: 'availability',
                updateObj: updateObj,
                type: handlePrivilegeType(true)
            };
            this.setState({
                submitInvalidateLoading: true,
            });
            clueCustomerAction.updateClueAvailability(clueState, (result) => {
                if (_.isString(result)) {
                    this.setState({
                        submitInvalidateLoading: false,
                        invalidateClueStatus: 'error',
                        submitInvalidateClueMsg: result
                    });
                } else {
                    _.isFunction(callback) && callback(updateAvailability);
                    clueCustomerAction.deleteClueById(item);
                    clueCustomerAction.updateClueTabNum('invalidClue');
                    //前端更新跟进记录
                    let newTrace = {
                        remark: invalidReason,
                        user_id: userData.getUserData().user_id || '',
                        nick_name: userData.getUserData().nick_name,
                        add_time: moment().valueOf(),
                        time: moment().valueOf(),
                        type: 'other',
                        showAdd: false
                    };
                    subtracteGlobalClue(item);
                    ClueTraceAction.addClueTraceWithoutAjax(newTrace);
                    this.setState({
                        submitInvalidateLoading: false,
                        editInvalidClueId: '',
                        invalidateClueStatus: '',
                        submitReason: '',
                        submitInvalidateClueMsg: '',
                        isShowInvalidateInputPanel: false,
                    });
                }
            });
        }
    };
    //渲染确认无效原因输入框
    renderInvalidatePanel = (salesClueItem) => {
        return (
            <div className="confirm-invalidate-item">
                <div className="confirm-invalidate-panel">
                    <Form className="confirm-invalidate-input">
                        <FormItem
                            validateStatus={_.get(this.state, 'invalidateClueStatus')}
                            help={_.get(this.state, 'submitInvalidateClueMsg')}
                        >
                            <TextArea
                                ref={addTextarea => this['addTextarea'] = addTextarea}
                                placeholder={Intl.get('clue.describe.invalid.reason', '请描述一下无效原因')}
                                value={this.state.submitReason}
                                onChange={this.handleInvalidateInputChange.bind(this)}
                            />
                        </FormItem
                        >
                        <div className="save-cancel-btn">
                            <Button className="ant-btn-cancel"
                                onClick={this.handleInvalidateCancelBtn.bind(this,salesClueItem)}
                            >{Intl.get('common.cancel', '取消')}</Button>
                            <Button type='primary'
                                onClick={this.handleInvalidateBtn.bind(this, salesClueItem)}
                                className="ant-btn-save"
                                disabled={this.state.submitInvalidateLoading} data-tracename="保存无效原因">
                                {Intl.get('clue.confirm.clue.invalid', '确认无效')}
                                {this.state.submitInvalidateLoading ? <Icon type="loading"/> : null}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    };
    //渲染确认有效按钮
    renderValidConfirm = (salesClueItem) => {
        var isEditting = this.state.isInvaliding;
        return (
            <span className="invalid-confirm">
                <Button className='confirm-btn' disabled={isEditting} type='primary' onClick={this.handleClickValidBtn.bind(this, salesClueItem)}>
                    {Intl.get('clue.customer.confirm.valid', '确认有效')}
                    {isEditting ? <Icon type="loading"/> : null}
                </Button>
                <Button onClick={this.cancelInvalidClue}>{Intl.get('common.cancel', '取消')}</Button>
            </span>
        );
    }
    renderInvalidConfirm = (salesClueItem) => {
        let isInvalid = salesClueItem.availability === AVALIBILITYSTATUS.INAVALIBILITY;
        return (
            <div>
                {isInvalid ? this.renderValidConfirm(salesClueItem) : this.renderInvalidatePanel(salesClueItem)}
            </div>

        );
    };
    renderAvailabilityClue = (curClue) => {
        //标记线索无效的权限
        var avalibility = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID')) && editCluePrivilege(curClue);
        if (avalibility){
            return <div>
                {associatedPrivilege ? <Button type="primary"
                    onClick={this.props.onConvertToCustomerBtnClick.bind(this, curClue.id, curClue.name, curClue.phones)}>{Intl.get('common.convert.to.customer', '转为客户')}</Button> : null}
                <Button data-tracename="判定线索无效按钮" className='clue-inability-btn'
                    onClick={this.showConfirmInvalid.bind(this, curClue)}>
                    {editCluePrivilege(curClue) ? <span className="can-edit">{Intl.get('clue.customer.set.invalid','标为无效')}</span> : <span className="can-edit"> {Intl.get('clue.cancel.set.invalid', '改为有效')}</span>}

                </Button>
            </div>;
        }else{
            return null;
        }

    };
    renderAssociatedAndInvalidClueHandle = (curClue) => {
        return (
            <div className="invalid-valid-container">
                <div className="btn-container">
                    {this.state.editInvalidClueId === curClue.id ? this.renderInvalidConfirm(curClue) : this.renderAvailabilityClue(curClue)}
                </div>
            </div>
        );
    };
    //判断是否显示按钮控制tab高度
    hasButtonTabHeight = (curClue, associatedCustomer ) => {
        var avalibility = (hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER'))
                            || (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID')) && editCluePrivilege(curClue);
        var associatedClue = (curClue.clue_type !== 'clue_pool')
                                && ((curClue.status === SELECT_TYPE.WILL_DISTRIBUTE || curClue.status === SELECT_TYPE.HAS_TRACE || curClue.status === SELECT_TYPE.WILL_TRACE) && !associatedCustomer);
        let height = this.state.divHeight;
        if(_.get(this.state, 'isShowInvalidateInputPanel')){
            height = this.props.divHeight - HAS_INPUT_HEIGHT;
        }else if(avalibility && associatedClue){
            height = this.props.divHeight - HAS_BTN_HEIGHT;
        }else{
            height = this.props.divHeight;
        }
        return ({height: height});
    }

    handleCancelCustomerSuggest = () => {
        this.setState({
            clickAssociatedBtn: false,
        });
    };

    renderAssociatedAndInvalidClueText = (associatedCustomer) => {
        var curClue = this.state.curClue;
        //关联客户的按钮状态
        var associatedDisplyType = this.state.clickAssociatedBtn ? 'edit' : 'text';
        //如果关联了客户
        if (this.state.clickAssociatedBtn || associatedCustomer) {
            return (
                <div className="clue-info-item">
                    <div className="clue-info-label">
                        {Intl.get('clue.customer.associate.customer', '关联客户')}：
                    </div>
                    <div className="clue-info-detail">
                        <CustomerSuggest
                            field='customer_id'
                            hasEditPrivilege={false}
                            displayText={associatedCustomer}
                            displayType={associatedDisplyType}
                            id={curClue.id}
                            show_error={this.state.isShowCustomerError}
                            noJumpToCrm={true}
                            saveEditSelectCustomer={this.handleAssociatedCustomer}
                            customer_name={associatedCustomer}
                            customer_id={curClue.customer_id}
                            addAssignedCustomer={this.addAssignedCustomer}
                            noDataTip={Intl.get('clue.has.no.data', '暂无')}
                            handleCancel={this.handleCancelCustomerSuggest}
                            customerLable={curClue.customer_label}
                            saveSameNoCustomerName={this.saveSameNoCustomerName}
                        />
                    </div>
                </div>
            );
        }
    };

    handleShowAppUser = (appUserId) => {
        this.setState({
            curShowUserId: appUserId
        });
    };

    closeRightUserPanel = () => {
        this.setState({
            curShowUserId: ''
        });
    };

    //渲染跟进列表
    renderTraceList = () => {
        let curClue = _.get(this.state, 'curClue');
        return (<ClueTraceList
            curClue={curClue}
            updateCustomerLastContact={this.props.updateCustomerLastContact}
            isOverViewPanel={true}
            changeActiveKey={this.props.changeActiveKey}
        />);
    }

    //渲染跟进内容
    renderTraceContent = () => {
        var curClue = this.state.curClue;
        //是否有添加跟进记录的权限
        var hasPrivilegeAddEditTrace = hasPrivilege('CLUECUSTOMER_ADD_TRACE') && editCluePrivilege(curClue);
        let noTraceData = _.isEmpty(_.get(curClue, 'customer_traces'));
        return (
            <DetailCard
                title={`${Intl.get('sales.frontpage.recent.record', '最新跟进')}:`}
                titleBottomBorderNone={noTraceData}
                content={this.renderTraceList()}
                disableEdit={hasPrivilegeAddEditTrace}
            />);
    };

    //渲染关联账号的详情
    renderAppUserDetail = () => {
        var curClue = this.state.curClue;
        //线索关联的账号
        var appUserInfo = _.isArray(curClue.app_user_info) && curClue.app_user_info.length ? curClue.app_user_info[0] : {};
        if (_.isEmpty(appUserInfo)){
            return null;
        }
        return (
            <div className="associate-user-detail clue-detail-block">
                <div className="clue-info-item">
                    <div className="clue-info-label">
                        {Intl.get('clue.associate.user', '关联账号')}
                    </div>
                    <div className="clue-info-detail ">
                        <span className="associate-user" onClick={this.handleShowAppUser.bind(this,appUserInfo.id)} data-tracename="查看关联账号详情">{appUserInfo.name}</span>
                    </div>
                </div>
            </div>
        );
    };
    renderClueBasicDetailInfo = () => {
        var curClue = this.state.curClue;
        //是否有权限修改线索详情
        var hasPrivilegeEdit = hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER') && editCluePrivilege(curClue);
        return (
            <div className="clue-info-wrap clue-detail-block">
                <div className="clue-basic-info">
                    <div className="clue-info-item">
                        <div className="clue-info-label">
                            {Intl.get('common.login.time', '时间')}
                        </div>
                        <div className="clue-info-detail">
                            <DatePickerField
                                width={EDIT_FEILD_WIDTH}
                                hasEditPrivilege={hasPrivilegeEdit}
                                id={curClue.id}
                                saveEditDateInput={this.saveEditBasicInfo.bind(this, 'source_time')}
                                value={curClue.source_time}
                                field="source_time"
                                disabledDate={this.disabledDate}
                            />
                        </div>
                    </div>
                    <div className="clue-info-item">
                        <div className="clue-info-label">
                            {Intl.get('crm.sales.clue.descr', '线索描述')}
                        </div>
                        <div className="clue-info-detail">
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                hasEditPrivilege={hasPrivilegeEdit }
                                id={curClue.id}
                                saveEditInput={this.saveEditBasicInfo.bind(this, 'source')}
                                value={curClue.source}
                                field='source'
                                type='textarea'
                                row={3}
                                noDataTip={Intl.get('common.unknown', '未知')}
                                addDataTip={Intl.get('clue.add.clue.describe', '添加线索描述')}
                                placeholder={Intl.get('clue.add.clue.placeholder', '请填写线索描述')}
                            />
                        </div>
                    </div>
                    <div className="clue-info-item">
                        <div className="clue-info-label">
                            {Intl.get('call.record.customer.source', '来源')}
                        </div>
                        <div className="clue-info-detail">
                            <BasicEditSelectField
                                width={EDIT_FEILD_WIDTH}
                                combobox={true}
                                hasEditPrivilege={hasPrivilegeEdit}
                                id={curClue.id}
                                saveEditSelect={this.saveEditBasicInfo.bind(this, 'clue_source')}
                                cancelEditField={this.cancelEditClueSource}
                                value={curClue.clue_source}
                                field="clue_source"
                                selectOptions={this.getClueSourceOptions()}
                                displayText={curClue.clue_source}
                                onSelectChange={this.onSelectCluesource}
                                placeholder={Intl.get('crm.clue.source.placeholder', '请选择或输入线索来源')}
                                noDataTip={Intl.get('common.unknown', '未知')}
                                addDataTip={Intl.get('clue.add.clue.source', '添加线索来源')}
                            />
                        </div>
                    </div>
                    <div className="clue-info-item">
                        <div className="clue-info-label">
                            {Intl.get('clue.customer.source.ip','来源IP')}
                        </div>
                        <div className="clue-info-detail">
                            <BasicEditInputField
                                hasEditPrivilege={false}
                                id={curClue.id}
                                saveEditInput={this.saveEditBasicInfo.bind(this, 'source_ip')}
                                value={curClue.source_ip}
                                field='source_ip'
                                noDataTip={Intl.get('common.unknown', '未知')}
                            />
                        </div>
                    </div>
                    {curClue.province || curClue.city ?
                        <div className="clue-info-item">
                            <div className="clue-info-label">
                                {Intl.get('crm.96', '地域')}
                            </div>
                            <div className="clue-info-detail area-item">
                                {curClue.province}
                                {curClue.city}
                            </div>
                        </div>
                        : null}
                    <div className="clue-info-item">
                        <div className="clue-info-label">
                            {Intl.get('crm.sales.clue.access.channel', '接入渠道')}
                        </div>
                        <div className="clue-info-detail">
                            <BasicEditSelectField
                                width={EDIT_FEILD_WIDTH}
                                combobox={true}
                                hasEditPrivilege={hasPrivilegeEdit}
                                id={curClue.id}
                                saveEditSelect={this.saveEditBasicInfo.bind(this, 'access_channel')}
                                cancelEditField={this.cancelEditClueChannel}
                                value={curClue.access_channel}
                                field="access_channel"
                                displayText={curClue.access_channel}
                                selectOptions={this.getAccessChannelOptions()}
                                onSelectChange={this.onSelectAccessChannel}
                                placeholder={Intl.get('crm.access.channel.placeholder', '请选择或输入接入渠道')}
                                noDataTip={Intl.get('common.unknown', '未知')}
                                addDataTip={Intl.get('clue.add.access.channel', '添加接入渠道')}
                            />
                        </div>
                    </div>
                    <div className="clue-info-item">
                        <div className="clue-info-label">
                            {Intl.get('contract.purchase.contract.type', '分类')}
                        </div>
                        <div className="clue-info-detail">
                            <BasicEditSelectField
                                width={EDIT_FEILD_WIDTH}
                                combobox={true}
                                hasEditPrivilege={hasPrivilegeEdit}
                                id={curClue.id}
                                saveEditSelect={this.saveEditBasicInfo.bind(this, 'clue_classify')}
                                cancelEditField={this.cancelEditClueClassify}
                                value={curClue.clue_classify}
                                field="clue_classify"
                                displayText={curClue.clue_classify}
                                selectOptions={this.getClueClassifyOptions()}
                                onSelectChange={this.onSelectClueClassify}
                                placeholder={Intl.get('crm.clue.classify.placeholder', '请选择或输入线索分类')}
                                noDataTip={Intl.get('common.unknown', '未知')}
                                addDataTip={Intl.get('clue.add.clue.classfify', '添加线索分类')}
                            />
                        </div>
                    </div>
                    <div className="clue-info-item">
                        <div className="clue-contact-container">
                            {_.map(curClue.contacts, (contactItem) => {
                                return (
                                    <div className="contact-item">
                                        <div className="contact-item-content contact-name">
                                            <span className="clue-info-label">{Intl.get('call.record.contacts', '联系人')}</span>
                                            <div className="clue-info-detail">
                                                <BasicEditInputField
                                                    width={EDIT_FEILD_WIDTH}
                                                    hasEditPrivilege={hasPrivilegeEdit}
                                                    id={curClue.id}
                                                    saveEditInput={this.saveEditBasicInfo.bind(this, {editItem: 'contact_name',id: contactItem.id})}
                                                    value={contactItem.name}
                                                    field='contact_name'
                                                    noDataTip={Intl.get('common.unknown', '未知')}
                                                    addDataTip={Intl.get('clue.customer.edit.contact','请填写联系人名称')}
                                                    placeholder={Intl.get('clue.customer.edit.contact','请填写联系人名称')}
                                                    validators={contactNameRule()}
                                                />
                                            </div>
                                        </div>
                                        <div className="contact-item-content">
                                            <DynamicAddDelField
                                                id={curClue.id}
                                                field='phone'
                                                value={contactItem.phone}
                                                type='phone'
                                                label={Intl.get('common.phone', '电话')}
                                                hasEditPrivilege={hasPrivilegeEdit}
                                                placeholder={Intl.get('crm.95', '请输入联系人电话')}
                                                saveEditData={this.saveEditBasicInfo.bind(this, {editItem: 'phone',id: contactItem.id})}
                                                noDataTip={Intl.get('crm.contact.phone.none', '暂无电话')}
                                                addDataTip={Intl.get('crm.contact.phone.add', '添加电话')}
                                                contactName={contactItem.name}
                                                renderItemSelfSettingContent={this.renderItemSelfSettingContent.bind(this, curClue)}
                                                renderItemSelfSettingForm={this.renderItemSelfSettingForm}

                                            />
                                        </div>
                                        <div className="contact-item-content">
                                            <DynamicAddDelField
                                                id={curClue.id}
                                                field='qq'
                                                value={contactItem.qq}
                                                type='input'
                                                label={'QQ'}
                                                hasEditPrivilege={hasPrivilegeEdit}
                                                validateRules={[{
                                                    message: Intl.get('common.correct.qq', '请输入正确的QQ号'),
                                                    pattern: qqRegex,
                                                }]}
                                                placeholder={Intl.get('member.input.qq', '请输入QQ号')}
                                                saveEditData={this.saveEditBasicInfo.bind(this, {editItem: 'qq',id: contactItem.id})}
                                                noDataTip={Intl.get('crm.contact.qq.none', '暂无QQ')}
                                                addDataTip={Intl.get('crm.contact.qq.add', '添加QQ')}
                                            />
                                        </div>
                                        <div className="contact-item-content">
                                            <DynamicAddDelField
                                                id={curClue.id}
                                                field='weChat'
                                                value={contactItem.weChat}
                                                type='input'
                                                label={Intl.get('crm.58', '微信')}
                                                hasEditPrivilege={hasPrivilegeEdit}
                                                validateRules={[{validator: checkWechat}]}
                                                placeholder={Intl.get('member.input.wechat', '请输入微信号')}
                                                saveEditData={this.saveEditBasicInfo.bind(this, {editItem: 'weChat',id: contactItem.id})}
                                                noDataTip={Intl.get('crm.contact.wechat.none', '暂无微信')}
                                                addDataTip={Intl.get('crm.contact.wechat.add', '添加微信')}
                                            />
                                        </div>
                                        <div className="contact-item-content">
                                            <DynamicAddDelField
                                                id={curClue.id}
                                                field='email'
                                                value={contactItem.email}
                                                type='input'
                                                label={Intl.get('common.email', '邮箱')}
                                                hasEditPrivilege={hasPrivilegeEdit}
                                                validateRules={[{
                                                    message: Intl.get('user.email.validate.tip','请输入正确格式的邮箱'),
                                                    pattern: emailRegex
                                                }]}
                                                placeholder={Intl.get('member.input.email', '请输入邮箱')}
                                                saveEditData={this.saveEditBasicInfo.bind(this, {editItem: 'email',id: contactItem.id})}
                                                noDataTip={Intl.get('crm.contact.email.none', '暂无邮箱')}
                                                addDataTip={Intl.get('crm.contact.email.add', '添加邮箱')}
                                            />
                                        </div>
                                    </div>
                                );

                            })}
                        </div>
                    </div>
                </div>
                <div className="add-person-info">
                    <div className="add-clue-info">
                        <span className="source-name">{curClue.source_user_name}</span>
                        {Intl.get('clue.add.clue.time', '添加于')}
                        {moment(curClue.start_time).format(oplateConsts.DATE_FORMAT)}
                    </div>
                </div>
            </div>
        );
    };
    renderSimilarLists = (listType) => {
        var isSimilarClue = listType === 'clue';
        var moreListShowFlag = this.state.showLargerClueLists;
        var similarLists = this.state.similarClueLists;
        if (!isSimilarClue){
            similarLists = this.state.similarCustomerLists;
            moreListShowFlag = this.state.showLargerCustomerLists;
        }
        var listMoreThanThree = _.get(similarLists,'length') > 3;
        if (!moreListShowFlag && listMoreThanThree){
            similarLists = _.cloneDeep(similarLists).splice(0,3);
        }
        let warningContent = (
            <span className="client-error-tip">
                <span className="iconfont icon-warn-icon"></span>
                <span className="client-error-text">
                    {Intl.get('common.check.customer.detail.warning', '此客户已在其他销售名下')}
                </span>
            </span>);
        return (
            <div className="similar-content similar-customer-list">
                <div className="similar-tip">
                    <i className="iconfont icon-phone-call-out-tip"></i>
                    {isSimilarClue ? Intl.get('clue.has.similar.lists', '相似线索') : Intl.get('customer.has.similar.lists', '相似客户')}
                </div>
                {_.map(similarLists,(listItem) => {
                    var sameContact = this.getSamePhoneContact(_.get(listItem,'contacts',[]));
                    var traceAddTime = _.get(listItem, 'customer_traces[0].call_date') || _.get(listItem, 'customer_traces[0].add_time');//跟进时间
                    //查看当前客户是否属于此销售，如果不属于，用popover提示
                    let user_id = userData.getUserData().user_id;
                    let isMyClients = _.isEqual(_.get(listItem, 'user_id'), user_id);
                    //当展示的是相似线索的时候按照正常逻辑展示，展示相似客户的时候判断当前客户是否属于此销售，管理员也有权限查看
                    let hasPrivilege = ((userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || isMyClients) && !isSimilarClue) || isSimilarClue;
                    return <div className="similar-block">
                        <div className="similar-title">
                            {isSimilarClue ? renderClueStatus(listItem) : null}
                            {hasPrivilege ? (
                                <div className="similar-title-name">
                                    <span onClick={isSimilarClue ? this.showClueDetail.bind(this, listItem) : this.showCustomerDetail.bind(this, listItem)}>{listItem.name}</span>
                                    {!isSimilarClue && editCluePrivilege(this.state.curClue) ? <Button onClick={this.props.showClueToCustomerPanel.bind(this, listItem)}>{Intl.get('common.merge.to.customer', '合并到此客户')}</Button> : null}
                                </div>) :
                                <Popover
                                    placement="topLeft"
                                    overlayClassName="client-invalid-popover"
                                    content={warningContent}
                                    trigger="click">
                                    <span>{listItem.name}</span> :
                                </Popover>
                            }
                        </div>
                        {_.isArray(sameContact) ? _.map(sameContact,(contactsItem) => {
                            return (
                                <div className="similar-name-phone">
                                    <span className="contact-name" title={contactsItem.name}>
                                        {contactsItem.name }
                                    </span>
                                    {contactsItem.name && !_.isEmpty(contactsItem.phone) ? '：' : ''}
                                    {_.isArray(contactsItem.phone) ? contactsItem.phone.join(',') : null}

                                </div>
                            );
                        }) : null}
                        {traceAddTime && isSimilarClue ? <span className="trace-time">{Intl.get('clue.detail.last.contact.time', '最后跟进时间') + '：' + moment(traceAddTime).format(oplateConsts.DATE_MONTH_DAY_HOUR_MIN_FORMAT)}</span> : null}
                    </div>;
                })}
                {listMoreThanThree ? <div className="show-hide-tip" onClick={isSimilarClue ? this.handleToggleClueTip : this.handleToggleCustomerTip}>
                    {moreListShowFlag ? Intl.get('crm.contact.way.hide', '收起') : Intl.get('notification.system.more', '展开全部')}</div> : null}
            </div>
        );
    };
    handleToggleCustomerTip = () => {
        this.setState({
            showLargerCustomerLists: !this.state.showLargerCustomerLists
        });
    };
    showCustomerDetail = (customer) => {
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer.id,
                curCustomer: customer,
            }
        });
    };
    showClueDetail = (item) => {
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
            clue_params: {
                currentId: item.id,
                curClue: item,
            }
        });
    };
    //获取该线索和查询到的相似线索或者相似客户电话一样的联系人
    getSamePhoneContact = (contacts) => {
        contacts = _.cloneDeep(contacts);
        var cluePhone = this.getCurCluePhones();
        var cluePhoneArr = cluePhone.split(',');
        contacts = _.filter(contacts, (contactItem) => {
            //获取相同电话
            var interSectArr = _.intersection(_.get(contactItem,'phone',[]),cluePhoneArr);
            if (_.isEmpty(interSectArr)){
                return false;
            }else{
                contactItem.phone = interSectArr;
                return true;
            }
        });
        return contacts;
    };

    handleToggleClueTip = () => {
        this.setState({
            showLargerClueLists: !this.state.showLargerClueLists
        });
    }
    renderSimilarClueCustomerLists = () => {
        if (_.get(this,'state.similarClueLists[0]') || _.get(this, 'state.similarCustomerLists[0]')){
            return (
                <div className="similar-wrap">
                    {_.get(this, 'state.similarCustomerLists[0]') && !this.isHasTransferClue() ? this.renderSimilarLists() : null}
                    {_.get(this,'state.similarClueLists[0]') ? this.renderSimilarLists('clue') : null}
                </div>
            );
        }else{
            return null;
        }
    };
    // 渲染相似客户
    renderClueCustomerLists = (curClue) => {
        if (curClue.clue_type === 'clue_pool') { // 线索池详情，不显示相似客户
            return null;
        } else {
            return this.renderSimilarClueCustomerLists();
        }
    };

    // 渲染提取线索按钮
    renderExtractClueBtn = (curClue) => {
        const user = userData.getUserData();
        const hasAssignedPrivilege = !user.isCommonSales;
        const assigenCls = 'detail-extract-clue-btn ant-btn';
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('clue.handle.clue', '线索处理')}
                </div>
                <div className="btn-container">
                    {this.props.extractClueOperator(hasAssignedPrivilege, curClue, assigenCls, true)}
                </div>
            </div>
        );
    };
    // 渲染关联线索
    renderAssociatedClue = (curClue, associatedCustomer ) => {
        if (curClue.clue_type === 'clue_pool') { // 线索池中详情，处理线索
            if ( hasPrivilege('LEAD_EXTRACT_ALL') || hasPrivilege('LEAD_EXTRACT_SELF')) {
                return this.renderExtractClueBtn(curClue);
            } else {
                return null;
            }
        } else {  
            if ((curClue.status === SELECT_TYPE.WILL_DISTRIBUTE || curClue.status === SELECT_TYPE.HAS_TRACE ||
                curClue.status === SELECT_TYPE.WILL_TRACE) &&
                !associatedCustomer) { // 待跟进或是已跟进，并且没有关联客户时，处理线索
                return this.renderAssociatedAndInvalidClueHandle(curClue);
            } else { // 显示处理线索的结果
                return this.renderAssociatedAndInvalidClueText(associatedCustomer);
            }
        }
    };

    render() {
        var curClue = this.state.curClue;
        //所分配的销售
        var assignedSales = _.get(curClue, 'user_name');
        //关联客户
        var associatedCustomer = curClue.customer_name;
        //分配线索给销售的权限
        var hasAssignedPrivilege = assignSalesPrivilege(curClue);
        return (
            <div className="clue-detail-container" data-tracename="线索基本信息" style={this.hasButtonTabHeight(curClue, associatedCustomer)}>
                <GeminiScrollbar>
                    {this.renderClueBasicDetailInfo()}
                    {this.renderClueCustomerLists(curClue)}
                    {/*分配线索给某个销售*/}
                    {/*有分配的权限，但是该线索没有分配给某个销售的时候，展示分配按钮，其他情况都展示分配详情就可以*/}
                    <div className="assign-sales-warp clue-detail-block">
                        {hasAssignedPrivilege && !assignedSales && !this.state.clickAssigenedBtn ?
                            this.renderAssigendClueText() : this.renderAssignedClueEdit()
                        }
                    </div>
                    <div className="associate-customer-detail clue-detail-block">
                        {/*线索处理，已跟进或待跟进的线索并且没有关联客户*/}
                        {this.renderAssociatedClue(curClue,associatedCustomer)}
                    </div>
                    {this.renderAppUserDetail()}
                    {
                        this.state.curShowUserId ?
                            <RightPanel className="app_user_manage_rightpanel right-pannel-default white-space-nowrap right-panel detail-v3-panel"
                                showFlag={this.state.curShowUserId}>
                                <UserDetail userId={this.state.curShowUserId}
                                    closeRightPanel={this.closeRightUserPanel}/>
                            </RightPanel>
                            : null
                    }
                    {this.state.isShowAddCustomer ? this.renderAddCustomer() : null}
                    {this.renderTraceContent()}
                </GeminiScrollbar>
            </div>
        );
    }
}
ClueDetailOverview.defaultProps = {
    curClue: {},
    divHeight: '',
    clueSourceArray: [],
    accessChannelArray: [],
    clueClassifyArray: [],
    updateClueSource: function() {},
    updateClueChannel: function() {},
    updateClueClassify: function() {},
    salesManList: [],
    removeUpdateClueItem: function() {

    },
    hideRightPanel: function() {

    },
    updateClueProperty: function() {

    },
    afterTransferClueSuccess: function() {

    },
    onConvertToCustomerBtnClick: function() {

    },
    updateCustomerLastContact: function() {

    },
    showClueToCustomerPanel: function() {

    },


};
ClueDetailOverview.propTypes = {
    curClue: PropTypes.object,
    divHeight: PropTypes.string,
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    clueClassifyArray: PropTypes.object,
    updateClueSource: PropTypes.func,
    updateClueChannel: PropTypes.func,
    updateClueClassify: PropTypes.func,
    salesManList: PropTypes.object,
    removeUpdateClueItem: PropTypes.func,
    hideRightPanel: PropTypes.func,
    updateClueProperty: PropTypes.func,
    afterTransferClueSuccess: PropTypes.func,
    onConvertToCustomerBtnClick: PropTypes.func,
    updateCustomerLastContact: PropTypes.func,
    extractClueOperator: PropTypes.func,
    showClueToCustomerPanel: PropTypes.func,
    changeActiveKey: PropTypes.func
};

module.exports = ClueDetailOverview;


