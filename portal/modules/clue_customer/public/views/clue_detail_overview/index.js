/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
require('../../css/clue_detail_overview.less');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import {Button, Icon} from 'antd';
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
const RELATEAUTHS = {
    'RELATEALL': 'CRM_MANAGER_CUSTOMER_CLUE_ID',//管理员通过线索id查询客户的权限
    'RELATESELF': 'CRM_USER_CUSTOMER_CLUE_ID'//普通销售通过线索id查询客户的权限
};
import {SELECT_TYPE, AVALIBILITYSTATUS} from '../../utils/clue-customer-utils';
import {RightPanel} from 'CMP_DIR/rightPanel';
var ClueDetailOverview = React.createClass({
    getInitialState() {
        return {
            clickAssigenedBtn: false,//是否点击了分配客户的按钮
            isShowAddCustomer: false,//是否展示添加客户内容
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            app_user_id: '',
            curClue: $.extend(true, {}, this.props.curClue),
        };
    },
    componentWillReceiveProps(nextProps) {
        //todo 修改某些 && nextProps.curClue.id !== this.props.curClue.id

        if (nextProps.curClue && nextProps.curClue.id !== this.props.curClue.id) {
            this.setState({
                curClue: $.extend(true, {}, nextProps.curClue)
            });
        }
        if (nextProps.curClue.id === this.props.curClue.id && nextProps.curClue.status !== this.props.curClue.status){
            this.setState({
                curClue: $.extend(true, {}, nextProps.curClue)
            });
        }
    },
    changeClueFieldSuccess: function(newCustomerDetail) {
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
        clueCustomerAction.afterEditCustomerDetail(newCustomerDetail);
    },
    //今天之后的日期不可以选
    disabledDate: function(current) {
        return current > moment().endOf('day');
    },
    getClueSourceOptions: function() {
        return (
            this.props.clueSourceArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    },
    getAccessChannelOptions: function() {
        return (
            this.props.accessChannelArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    },
    getClueClassifyOptions: function() {
        return this.props.clueClassifyArray.map((source, idx) => {
            return (<Option key={idx} value={source}>{source}</Option>);
        });
    },
    getSalesOptions: function() {
        return this.props.salesManList.map((sales, idx) => {
            return (<Option key={idx} value={_.get(sales,'user_info.user_id')}>{_.get(sales,'user_info.nick_name')}</Option>);
        });
    },
    cancelEditClueSource: function() {
        var curClue = this.state.curClue;
        curClue.clue_source = this.props.curClue.clue_source;
        this.setState({
            curClue: curClue
        });
    },
    cancelEditClueChannel: function() {
        var curClue = this.state.curClue;
        curClue.access_channel = this.props.curClue.access_channel;
        this.setState({
            curCustomer: curClue
        });
    },
    cancelEditClueClassify: function() {
        var curClue = this.state.curClue;
        curClue.clue_classify = this.props.curClue.clue_classify;
        this.setState({
            curClue: curClue
        });
    },
    cancelEditSales: function() {
        var curClue = this.state.curClue;
        curClue.user_name = this.props.curClue.user_name;
        this.setState({
            curClue: curClue,
            clickAssigenedBtn: false
        });
    },

    onSelectCluesource: function(updateSource) {
        var curClue = this.state.curClue;
        curClue.clue_source = updateSource;
        this.setState({
            curClue: curClue
        });
    },
    onSelectAccessChannel: function(updateChannel) {
        var curClue = this.state.curClue;
        curClue.access_channel = updateChannel;
        this.setState({
            curClue: curClue
        });
    },
    onSelectClueClassify: function(updateClassify) {
        var curClue = this.state.curClue;
        curClue.clue_classify = updateClassify;
        this.setState({
            curClue: curClue
        });
    },
    onSelectClueSales: function(updateUser) {
        var curClue = this.state.curClue;
        curClue.user_name = updateUser;
        this.setState({
            curClue: curClue
        });
    },
    //保存修改的基本信息
    saveEditBasicInfo: function(type, saveObj, successFunc, errorFunc) {
        Trace.traceEvent(this.getDOMNode(), `保存线索${type}的修改`);
        clueCustomerAjax.updateCluecustomerDetail(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.changeClueFieldSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    },
    //保存跟进记录内容
    saveTraceContentInfo: function(saveObj, successFunc, errorFunc) {
        saveObj.customer_id = saveObj.id;
        delete saveObj.id;
        clueCustomerAction.addCluecustomerTrace(saveObj, (result) => {
            if (result && result.error) {
                if (_.isFunction(errorFunc)) errorFunc(result.errorMsg);
            } else {
                if (_.isFunction(successFunc)) successFunc();
            }
        });
    },
    //分配线索给某个销售
    handleChangeAssignedSales: function(submitObj, successFunc, errorFunc) {
        var targetObj = _.find(this.props.salesManList, (item) => {
            var userId = _.get(item, 'user_info.user_id');
            return userId === submitObj.user_id;
        });
        if (targetObj && _.isArray(targetObj.user_groups) && targetObj.user_groups.length){
            var userName = _.get(targetObj, 'user_info.nick_name');
            var teamId = _.get(targetObj,'user_groups[0].group_id');
            var teamName = _.get(targetObj,'user_groups[0].group_name');
            var updateObj = {
                'customer_id': submitObj.id,
                'sale_id': submitObj.user_id,
                'sale_name': userName,
                'team_name': teamName,
                'team_id': teamId,
            };
            clueCustomerAction.distributeCluecustomerToSale(updateObj, (result) => {
                if (result && result.errorMsg) {
                    if (_.isFunction(errorFunc)) errorFunc(result.errorMsg);
                } else {
                    if (_.isFunction(successFunc)) successFunc();
                    this.setState({
                        clickAssigenedBtn: false
                    });
                    clueCustomerAction.afterEditCustomerDetail({
                        'user_name': userName,
                        'user_id': submitObj.user_id,
                        'sales_team': teamName,
                        'sales_team_id': teamId
                    });
                }
            });
        }
    },
    //点击分配客户按钮
    handleClickAssignedBtn: function() {
        this.setState({
            clickAssigenedBtn: true
        });
    },
    //点击关联客户按钮
    handleClickAssociatedBtn: function() {
        this.setState({
            clickAssociatedBtn: true
        });
    },
    //线索关联客户
    handleAssociatedCustomer: function(submitObj, successFunc, errorFunc) {
        var curClueDetail = this.state.curClue;
        clueCustomerAction.setClueAssociatedCustomer(submitObj, (result) => {
            if (result && result.errorMsg) {
                if (_.isFunction(errorFunc)) errorFunc(result.errorMsg);
            } else {
                if (_.isFunction(successFunc)) successFunc();
                curClueDetail.customer_id = submitObj.customer_id;
                curClueDetail.customer_name = submitObj.customer_name;
                this.setState({
                    clickAssociatedBtn: false,
                    curClue: curClueDetail
                });
                clueCustomerAction.afterModifiedAssocaitedCustomer(curClueDetail);
            }
        });
    },
    addAssignedCustomer: function() {

        this.setState({
            isShowAddCustomer: true
        });
    },
    //关闭添加面板
    hideAddForm: function() {
        this.setState({
            isShowAddCustomer: false
        });
    },
    //添加完客户后
    addOneCustomer: function(newCustomerArr) {
        this.setState({
            isShowAddCustomer: false
        });
        //todo 待修改
        if (_.isArray(newCustomerArr) && newCustomerArr[0]) {
            var newCustomer = newCustomerArr[0];
            this.setState({
                displayType: 'text',
                selectShowAddCustomer: false,
                relatedCustomerId: newCustomer.id,
                relatedCustomerName: newCustomer.name,
            });
        }
    },
    //渲染添加客户内容
    renderAddCustomer: function(){
        var phoneNum = this.state.curClue ? this.state.curClue.contact_way : '';
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
                formData ={this.state.curClue}
                isAssociateClue={true}
                phoneNum= {phoneNum}
                addOne={this.addOneCustomer}
            />
        );
    },
    //标记线索无效或者有效
    handleClickInvalidBtn: function(item){
        var updateValue = AVALIBILITYSTATUS.INAVALIBILITY;
        if (item.availability === AVALIBILITYSTATUS.INAVALIBILITY){
            updateValue = AVALIBILITYSTATUS.AVALIBILITY;
        }
        var submitObj = {
            id: item.id,
            availability: updateValue
        };
        this.setState({
            isInvalidClue: true,
        });
        clueCustomerAction.updateCluecustomerDetail(submitObj,(result) => {
            if (_.isString(result)){
                this.setState({
                    isInvalidClue: false,
                });
            }else{
                var curClue = this.state.curClue;
                curClue.invalid_info = {
                    user_name: userData.getUserData().nick_name,
                    time: moment().valueOf()
                };
                curClue.availability = updateValue;
                //点击无效后状态应该改成已跟进的状态
                if (updateValue === AVALIBILITYSTATUS.INAVALIBILITY){
                    curClue.status = SELECT_TYPE.HAS_TRACE;
                }

                clueCustomerAction.updateClueProperty({id: item.id,availability: updateValue, status: SELECT_TYPE.HAS_TRACE});
                this.setState({
                    isInvalidClue: false,
                    curClue: curClue
                });
            }
        });
    },
    renderAssigendClueText: function() {
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('clue.handle.clue', '线索处理')}：
                </div>
                <div className="clue-info-detail">
                    {Intl.get('clue.has.no.handle','暂未处理')}
                </div>
                <div className="btn-container">
                    <Button type="primary" data-tracename="点击分配线索客户按钮" onClick={this.handleClickAssignedBtn}>{Intl.get('clue.customer.distribute','分配')}</Button>
                </div>
            </div>
        );
    },
    renderAssignedClueEdit: function() {
        let user = userData.getUserData();
        var curClue = this.state.curClue;
        //分配的状态
        var assignedDisplayType = this.state.clickAssigenedBtn ? 'edit' : 'text';
        //分配线索给销售的权限
        var hasAssignedPrivilege = hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales);
        //所分配的销售
        var assignedSales = _.get(curClue, 'user_name');
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('clue.handle.clue.person','处理人')}：
                </div>
                <div className="clue-info-detail">
                    <BasicEditSelectField
                        displayType={assignedDisplayType}
                        hasEditPrivilege={hasAssignedPrivilege}
                        id={curClue.id}
                        saveEditSelect={this.handleChangeAssignedSales}
                        cancelEditField={this.cancelEditSales}
                        value={assignedSales}
                        field="user_id"
                        displayText={assignedSales}
                        selectOptions={this.getSalesOptions()}
                        onSelectChange={this.onSelectClueSales}
                        noDataTip={Intl.get('clue.handle.no.distribute.clue','未分配')}
                    />
                </div>
            </div>
        );
    },
    renderAssociatedAndInvalidClueHandle: function(curClue) {
        //该线索无效
        var isInvalidClue = curClue.availability === '1';
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID')) && !isInvalidClue;
        //标记线索无效的权限
        var avalibility = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('clue.handle.clue', '线索处理')}：
                </div>
                <div className="clue-info-detail">
                    {Intl.get('clue.has.no.handle','暂未处理')}
                </div>
                <div className="btn-container">
                    {associatedPrivilege ? <Button type="primary" data-tracename="点击关联客户按钮" onClick={this.handleClickAssociatedBtn.bind(this, curClue)}>{Intl.get('clue.customer.associate.customer', '关联客户')}</Button> : null}

                    {avalibility ? <Button data-tracename="点击线索无效按钮" disabled={this.state.isInvalidClue} onClick={this.handleClickInvalidBtn.bind(this, curClue)}>{Intl.get('sales.clue.is.enable', '无效')}
                        {this.state.isInvalidClue ? <Icon type="loading"/> : null}</Button> : null}

                </div>
            </div>
        );
    },
    handleCancelCustomerSuggest: function() {
        this.setState({
            clickAssociatedBtn: false,
        });
    },
    renderAssociatedAndInvalidClueText: function(associatedCustomer, isInvalidClue) {
        var curClue = this.state.curClue;
        var invalid_info = curClue.invalid_info;
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID')) && !isInvalidClue;
        //标记线索无效的权限
        var avalibility = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        //关联客户的按钮状态
        var associatedDisplyType = this.state.clickAssociatedBtn ? 'edit' : 'text';
        //如果关联了客户
        if (this.state.clickAssociatedBtn || associatedCustomer){
            return (
                <div className="clue-info-item">
                    <div className="clue-info-label">
                        {Intl.get('clue.customer.associate.customer', '关联客户')}：
                    </div>
                    <div className="clue-info-detail">
                        <CustomerSuggest
                            hasEditPrivilege={associatedPrivilege}
                            displayText={associatedCustomer}
                            displayType={associatedDisplyType}
                            id={curClue.id}
                            show_error={this.state.isShowCustomerError}
                            isShowUpdateOrClose={this.isShowUpdateOrClose}
                            noJumpToCrm={true}
                            saveEditSelectCustomer={this.handleAssociatedCustomer}
                            customer_name={associatedCustomer}
                            customer_id={curClue.customer_id}
                            addAssignedCustomer={this.addAssignedCustomer}
                            noDataTip={Intl.get('clue.has.no.data','暂无')}
                            handleCancel={this.handleCancelCustomerSuggest}
                            customerLable={curClue.customer_label}
                        />
                    </div>
                </div>
            );
        }else if (isInvalidClue && invalid_info){
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
                        {Intl.get('clue.set.invalid','判定无效')}
                    </span>
                    {avalibility ? <span className="cancel-invalid" onClick={this.handleClickInvalidBtn.bind(this,curClue)}>
                        {Intl.get('clue.cancel.set.invalid','取消无效')}
                    </span> : null}

                </div>
            );
        }
    },
    handleShowAppUser: function(appUserId) {
        this.setState({
            curShowUserId: appUserId
        });
    },
    closeRightUserPanel: function() {
        this.setState({
            curShowUserId: ''
        });
    },
    render: function() {
        let user = userData.getUserData();
        //是否没有权限修改线索详情
        var hasPrivilegeEdit = hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER');
        //是否有添加跟进记录的权限
        var hasPrivilegeAddEditTrace = hasPrivilege('CLUECUSTOMER_ADD_TRACE');
        var curClue = this.state.curClue;
        var remarkContent = _.get(curClue, 'customer_traces[0].remark');
        var remarkAddName = _.get(curClue, 'customer_traces[0].nick_name');
        var remarkAddTime = _.get(curClue, 'customer_traces[0].add_time');
        var cls = className('clue-info-item', {
            'no-margin-bottom': !remarkContent
        });
        //所分配的销售
        var assignedSales = _.get(curClue, 'user_name');
        //关联客户
        var associatedCustomer = curClue.customer_name;
        //分配线索给销售的权限
        var hasAssignedPrivilege = hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales);
        //分配的状态
        var assignedDisplayType = this.state.clickAssigenedBtn ? 'edit' : 'text';
        //关联客户的按钮状态
        var associatedDisplyType = this.state.clickAssociatedBtn ? 'edit' : 'text';
        //该线索无效
        var isInvalidClue = curClue.availability === '1';
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID')) && !isInvalidClue;
        //线索关联的账号
        var appUserInfo = _.isArray(curClue.app_user_info) && curClue.app_user_info.length ? curClue.app_user_info[0] : {};

        return (
            <div className="clue-detail-container">
                <div className="clue-info-wrap clue-detail-block">
                    <div className="clue-basic-info">
                        <div className="clue-info-item">
                            <div className="clue-info-label">
                                {Intl.get('clue.analysis.consult.time', '咨询时间')}：
                            </div>
                            <div className="clue-info-detail">
                                <DatePickerField
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
                                {Intl.get('crm.sales.clue.descr', '线索描述')}：
                            </div>
                            <div className="clue-info-detail">
                                <BasicEditInputField
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
                                {Intl.get('call.record.customer.source', '来源')}：
                            </div>
                            <div className="clue-info-detail">
                                <BasicEditSelectField
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
                                {Intl.get('crm.sales.clue.access.channel', '接入渠道')}：
                            </div>
                            <div className="clue-info-detail">
                                <BasicEditSelectField
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
                                {Intl.get('contract.purchase.contract.type', '分类')}：
                            </div>
                            <div className="clue-info-detail">
                                <BasicEditSelectField
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
                            <div className="clue-info-label">
                                {Intl.get('crm.5', '联系方式')}
                            </div>
                            <div className="clue-info-detail">
                                {_.map(curClue.contacts,(contactItem) => {
                                    return (
                                        <div className="contact-item">
                                            <div className="contact-name">{contactItem.name}</div>
                                            {contactItem.phone ? _.map( contactItem.phone,(phone) => {
                                                return (
                                                    <span className="phone-item contact-way">
                                                        <i className="iconfont icon-phone-call-out"></i>
                                                        {phone}
                                                    </span>
                                                );
                                            }) : null}
                                            {contactItem.qq ? _.map( contactItem.qq,(qq) => {
                                                return (
                                                    <span className="phone-item contact-way">
                                                        <i className="iconfont icon-qq"></i>
                                                        {qq}
                                                    </span>
                                                );
                                            }) : null}
                                            {contactItem.email ? _.map( contactItem.email,(email) => {
                                                return (
                                                    <span className="phone-item contact-way">
                                                        <i className="iconfont icon-email"></i>
                                                        {email}
                                                    </span>
                                                );
                                            }) : null}
                                            {contactItem.wechat ? _.map( contactItem.wechat,(wechat) => {
                                                return (
                                                    <span className="phone-item contact-way">
                                                        <i className="iconfont icon-wechat"></i>
                                                        {wechat}
                                                    </span>
                                                );
                                            }) : null}
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
                {/*分配线索给某个销售*/}
                {/*有分配的权限，但是该线索没有分配给某个销售的时候，展示分配按钮，其他情况都展示分配详情就可以*/}
                <div className="assign-sales-warp clue-detail-block">
                    {hasAssignedPrivilege && !assignedSales && !this.state.clickAssigenedBtn ?
                        this.renderAssigendClueText() : this.renderAssignedClueEdit()
                    }
                </div>
                <div className="clue-trace-content clue-detail-block">
                    <div className={cls}>
                        <div className="clue-info-label">
                            {Intl.get('call.record.follow.content', '跟进内容')}：
                        </div>
                        <div className="clue-info-detail">
                            <BasicEditInputField
                                hasEditPrivilege={hasPrivilegeAddEditTrace}
                                id={curClue.id}
                                saveEditInput={this.saveTraceContentInfo}
                                value={remarkContent}
                                field='remark'
                                type='textarea'
                                row={3}
                                noDataTip={Intl.get('clue.no.trace.content', '暂无跟进')}
                                addDataTip={Intl.get('clue.add.trace.content', '添加跟进内容')}
                                placeholder={Intl.get('sales.home.fill.in.trace.content', '请输入跟进内容')}
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
                <div className="associate-customer-detail clue-detail-block">
                    {/*线索处理，没有关联到客户并且线索不是无效的*/}
                    {
                        !associatedCustomer && !isInvalidClue && !this.state.clickAssociatedBtn ?
                            this.renderAssociatedAndInvalidClueHandle(curClue)
                            : this.renderAssociatedAndInvalidClueText(associatedCustomer, isInvalidClue)
                    }
                </div>
                {!_.isEmpty(appUserInfo) ?
                    <div className="associate-user-detail clue-detail-block">
                        <div className="clue-info-item">
                            <div className="clue-info-label">
                                {Intl.get('clue.associate.user', '关联账号')}
                            </div>
                            <div className="clue-info-detail ">
                                <span className="associate-user" onClick={this.handleShowAppUser.bind(this,appUserInfo.id)}>{appUserInfo.name}</span>
                            </div>
                        </div>
                    </div> : null}
                {
                    this.state.curShowUserId ?
                        <RightPanel className="app_user_manage_rightpanel white-space-nowrap right-pannel-default"
                            showFlag={this.state.curShowUserId}>
                            <UserDetail userId={this.state.curShowUserId}
                                closeRightPanel={this.closeRightUserPanel}/>
                        </RightPanel>
                        : null
                }
                {this.state.isShowAddCustomer ? this.renderAddCustomer() : null}
            </div>
        );
    }
});
module.exports = ClueDetailOverview;


