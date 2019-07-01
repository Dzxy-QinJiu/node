import { emailRegex } from 'PUB_DIR/sources/utils/validate-util';

/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
var React = require('react');
require('../../css/clue_detail_overview.less');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import {Button, Icon} from 'antd';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import DatePickerField from 'CMP_DIR/basic-edit-field-new/date-picker';
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
import {SELECT_TYPE, AVALIBILITYSTATUS,getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount,handleSubmitClueItemData,handleSubmitContactData,contactNameRule,getClueStatusValue} from '../../utils/clue-customer-utils';
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
const EDIT_FEILD_WIDTH = 300;
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import PhoneCallout from 'CMP_DIR/phone-callout';
import PhoneInput from 'CMP_DIR/phone-input';
var clueFilterStore = require('../../store/clue-filter-store');
import {subtracteGlobalClue} from 'PUB_DIR/sources/utils/common-method-util';
class ClueDetailOverview extends React.Component {
    state = {
        clickAssigenedBtn: false,//是否点击了分配客户的按钮
        isShowAddCustomer: false,//是否展示添加客户内容
        isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
        app_user_id: '',
        curClue: $.extend(true, {}, this.props.curClue),
        divHeight: this.props.divHeight
    };

    componentWillReceiveProps(nextProps) {
        //修改某些属性时，线索的id不变，但是需要更新一下curClue所以不加 nextProps.curClue.id !== this.props.curClue.id 这个判断了
        if (_.get(nextProps.curClue,'id')) {
            this.setState({
                curClue: $.extend(true, {}, nextProps.curClue)
            });
        }
        if (nextProps.divHeight !== this.props.divHeight){
            this.setState({
                divHeight: nextProps.divHeight
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
            return (<Option key={idx}
                value={_.get(sales, 'user_info.user_id')}>
                {_.get(sales, 'user_info.nick_name')} - {_.get(sales, 'user_groups[0].group_name')}</Option>);
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
        if (Oplate && Oplate.unread && curClue.status === SELECT_TYPE.WILL_TRACE) {
            subtracteGlobalClue(curClue);
        }
        saveObj.lead_id = saveObj.id;
        saveObj.type = 'other';
        delete saveObj.id;
        clueCustomerAction.addCluecustomerTrace(saveObj, (result) => {
            if (result && result.error) {
                if (_.isFunction(errorFunc)) errorFunc(result.errorMsg);
            } else {
                curClue.status = SELECT_TYPE.HAS_TRACE;
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
                this.props.updateRemarks(curClue.customer_traces);
                clueCustomerAction.updateClueProperty({id: saveObj.customer_id,status: SELECT_TYPE.HAS_TRACE,customer_traces: curClue.customer_traces});
                this.setState({
                    curClue: curClue
                });
                if (_.isFunction(successFunc)) successFunc();
            }
        });
    };

    //分配线索给某个销售
    handleChangeAssignedSales = (submitObj, successFunc, errorFunc) => {
        var user_id = _.get(this.state.curClue,'user_id');
        var curClue = this.state.curClue;
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
                    if (Oplate && Oplate.unread && curClue.status === SELECT_TYPE.WILL_TRACE) {
                        subtracteGlobalClue(curClue);
                    }
                    this.setState({
                        clickAssigenedBtn: false
                    });
                    clueCustomerAction.afterEditCustomerDetail({
                        'user_name': userName,
                        'user_id': submitObj.user_id,
                        'sales_team': teamName,
                        'sales_team_id': teamId,
                        'status': SELECT_TYPE.WILL_TRACE
                    });
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
    renderItemSelfSettingContent = (curClue,item) => {
        return <PhoneCallout phoneNumber={item} showPhoneNum={addHyphenToPhoneNumber(item)} showPhoneIcon={true} showClueDetailPanel={this.props.showClueDetailPanel.bind(this, curClue)}
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
        var hasAssignedPrivilege = hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales);
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
                    {Intl.get('crm.6', '负责人')}：
                </div>
                <div className="clue-info-detail">
                    <BasicEditSelectField
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

    renderAssociatedAndInvalidClueHandle = (curClue) => {
        //该线索无效
        var isInvalidClue = curClue.availability === '1';
        //标记线索无效的权限
        var avalibility = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('clue.handle.clue', '线索处理')}：
                </div>
                <div className="clue-info-detail no-handled">
                    {Intl.get('clue.has.no.handle', '暂未处理')}
                </div>
                <div className="btn-container">
                    {avalibility ? <Button data-tracename="判定线索无效按钮" className='clue-inability-btn' disabled={this.state.isInvalidClue}
                        onClick={this.handleClickInvalidBtn.bind(this, curClue)}>{Intl.get('sales.clue.is.enable', '无效')}
                        {this.state.isInvalidClue ? <Icon type="loading"/> : null}</Button> : null}

                </div>
            </div>
        );
    };

    handleCancelCustomerSuggest = () => {
        this.setState({
            clickAssociatedBtn: false,
        });
    };

    renderAssociatedAndInvalidClueText = (isInvalidClue) => {
        var curClue = this.state.curClue;
        var invalid_info = curClue.invalid_info;
        //标记线索无效的权限
        var avalibility = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        if (isInvalidClue && invalid_info) {
            //如果该线索是无效的
            return (
                <div className="clue-info-item">
                    <span className="invalid-time">
                        {moment(invalid_info.time).format(oplateConsts.DATE_FORMAT)}
                    </span>
                    <span className="invalid-person">
                        {invalid_info.user_name}
                    </span>
                    <span className="invalid-des">
                        {Intl.get('clue.set.invalid', '判定无效')}
                    </span>
                    {avalibility ?
                        <span className="cancel-invalid" onClick={this.handleClickInvalidBtn.bind(this, curClue)}
                            data-tracename="取消判定线索无效">
                            {Intl.get('clue.cancel.set.invalid', '改为有效')}
                        </span> : null}

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

    //渲染跟进内容
    renderTraceContent = () => {
        //是否有添加跟进记录的权限
        var hasPrivilegeAddEditTrace = hasPrivilege('CLUECUSTOMER_ADD_TRACE');
        var curClue = this.state.curClue;
        var remarkContent = _.get(curClue, 'customer_traces[0].remark');
        var remarkAddName = _.get(curClue, 'customer_traces[0].nick_name');
        var remarkAddTime = _.get(curClue, 'customer_traces[0].add_time');
        var cls = className('clue-info-item', {
            'no-margin-bottom': !remarkContent
        });
        return (
            <div className="clue-trace-content clue-detail-block">
                <div className={cls}>
                    <div className="clue-info-label">
                        {Intl.get('call.record.follow.content', '跟进内容')}：
                    </div>
                    <div className="clue-info-detail">
                        <BasicEditInputField
                            width={EDIT_FEILD_WIDTH}
                            hasEditPrivilege={hasPrivilegeAddEditTrace}
                            id={curClue.id}
                            saveEditInput={this.saveTraceContentInfo}
                            value={remarkContent}
                            field='remark'
                            type='textarea'
                            row={3}
                            validators={[{
                                required: true,
                                message: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
                            }]}
                            noDataTip={Intl.get('clue.no.trace.content', '暂无跟进')}
                            addDataTip={Intl.get('clue.add.trace.content', '添加跟进内容')}
                            placeholder={Intl.get('sales.home.fill.in.trace.content', '请输入跟进内容')}
                            hasMoreRow={true}
                        />
                    </div>
                </div>
                {remarkContent ?
                    <div className="add-person-info ">
                        <div className="add-clue-info">
                            <span className="source-name">{remarkAddName}</span>
                            {Intl.get('clue.add.clue.time', '添加于')}
                            {moment(remarkAddTime).format(oplateConsts.DATE_FORMAT)}
                        </div>
                    </div> : null}
            </div>
        );
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
        var hasPrivilegeEdit = hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER');
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
                                hasEditPrivilege={hasPrivilegeEdit}
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

    render() {
        let user = userData.getUserData();
        var curClue = this.state.curClue;
        //所分配的销售
        var assignedSales = _.get(curClue, 'user_name');
        //分配线索给销售的权限
        var hasAssignedPrivilege = hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales);
        var filterClueStatus = clueFilterStore.getState().filterClueStatus;
        var typeFilter = getClueStatusValue(filterClueStatus);//线索类型
        return (
            <div className="clue-detail-container" data-tracename="线索基本信息" style={{height: this.state.divHeight}}>
                <GeminiScrollbar>
                    {this.renderClueBasicDetailInfo()}
                    {/*分配线索给某个销售*/}
                    {/*有分配的权限，但是该线索没有分配给某个销售的时候，展示分配按钮，其他情况都展示分配详情就可以*/}
                    <div className="assign-sales-warp clue-detail-block">
                        {hasAssignedPrivilege && !assignedSales && !this.state.clickAssigenedBtn ?
                            this.renderAssigendClueText() : this.renderAssignedClueEdit()
                        }
                    </div>
                    {this.renderTraceContent()}
                    <div className="associate-customer-detail clue-detail-block">
                        {/*线索处理，如果索不是无效的*/}
                        {
                            curClue.status === SELECT_TYPE.HAS_TRACE ?
                                this.renderAssociatedAndInvalidClueHandle(curClue)
                                : null 
                        }
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
    updateRemarks: function() {

    },
    showClueDetailPanel: function() {

    }

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
    updateRemarks: PropTypes.func,
    showClueDetailPanel: PropTypes.func
};

module.exports = ClueDetailOverview;


