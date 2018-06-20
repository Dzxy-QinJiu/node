/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/11/1.
 */
import {RightPanel, RightPanelClose} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import UserDetailEditField from 'CMP_DIR/basic-edit-field/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field/select';
import {checkEmail} from '../utils/clue-customer-utils';
var clueCustomerAction = require('../action/clue-customer-action');
var clueCustomerAjax = require('../ajax/clue-customer-ajax');
import AssignClueAndSelectCustomer from './assign-clue-and-select-customer';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {nameRegex} from 'PUB_DIR/sources/utils/consts';
import {DatePicker, Icon} from 'antd';
const noop = function() {
};
class ClueRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curCustomer: $.extend(true, {}, this.props.curCustomer),
            isEdittingTime: false,//是否正在修改线索咨询时间
            relatedCustomer: {},//与线索相关联的客户
            loading: false,//正在修改线索时间
            submitErrorMsg: '',//修改线索时间出错的提示
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.curCustomer && nextProps.curCustomer.id !== this.props.curCustomer.id) {
            this.setState({
                curCustomer: $.extend(true, {}, nextProps.curCustomer)
            });
        }
    }

    //电话格式，必填一项，唯一性的验证
    getPhoneInputValidateRules = (rule, value, callback) => {
        value = $.trim(value);
        if (value) {
            if (/^1[34578]\d{9}$/.test(value) || /^(\d{3,4}-?)?\d{7,8}$/.test(value) || /^400-?\d{3}-?\d{4}$/.test(value)) {
                clueCustomerAction.checkOnlyContactPhone(value, data => {
                    if (_.isString(data)) {
                        //唯一性验证出错了
                        callback(Intl.get('crm.82', '电话唯一性验证出错了'));
                    } else {
                        if (_.isObject(data) && data.result === 'true') {
                            callback();
                        } else {
                            //已存在
                            callback(Intl.get('crm.83', '该电话已存在'));
                        }
                    }
                });
            } else {
                callback(Intl.get('crm.196', '请输入正确的电话号码，格式例如：13877775555，010-77775555 或 400-777-5555'));
            }
        } else {
            var curCustomer = this.state.curCustomer || {};
            if (_.isArray(curCustomer.contacts) && curCustomer.contacts.length) {
                if (!curCustomer.contacts[0].qq && !curCustomer.contacts[0].email && !curCustomer.contacts[0].weChat) {
                    callback(new Error(Intl.get('crm.clue.require.one', '电话、邮箱、QQ、微信必填一项')));
                } else {
                    callback();
                }
            }
        }
    };

    getClueSourceOptions() {
        return (
            this.props.clueSourceArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    }

    getAccessChannelOptions() {
        return (
            this.props.accessChannelArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    }

    getClueClassifyOptions() {
        return this.props.clueClassifyArray.map((source, idx) => {
            return (<Option key={idx} value={source}>{source}</Option>);
        });
    }

    onSelectCluesource = (updateSource) => {
        var curCustomer = this.state.curCustomer;
        curCustomer.clue_source = updateSource;
        this.setState({
            curCustomer: curCustomer
        });
    };
    onSelectAccessChannel = (updateChannel) => {
        var curCustomer = this.state.curCustomer;
        curCustomer.access_channel = updateChannel;
        this.setState({
            curCustomer: curCustomer
        });
    };
    onSelectClueClassify = (updateClassify) => {
        var curCustomer = this.state.curCustomer;
        curCustomer.clue_classify = updateClassify;
        this.setState({
            curCustomer: curCustomer
        });
    };
    cancelEditClueChannel = () => {
        var curCustomer = this.state.curCustomer;
        curCustomer.access_channel = this.props.curCustomer.access_channel;
        this.setState({
            curCustomer: curCustomer
        });
    };
    cancelEditClueSource = () => {
        var curCustomer = this.state.curCustomer;
        curCustomer.clue_source = this.props.curCustomer.clue_source;
        this.setState({
            curCustomer: curCustomer
        });
    };
    cancelEditClueClassify = () => {
        var curCustomer = this.state.curCustomer;
        curCustomer.clue_classify = this.props.curCustomer.clue_classify;
        this.setState({
            curCustomer: curCustomer
        });
    };
    changeUserFieldSuccess = (newCustomerDetail) => {
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
    };
    hideRightPanel = () => {
        this.setState({
            relatedCustomer: {}
        });
        this.props.hideRightPanel();
    };
    validatorClueNameBeforSubmit = (rule, value, callback) => {
        //先验证该线索名称是否存在
        if (value && nameRegex.test(value)) {
            clueCustomerAction.checkOnlyClueName(value, (data) => {
                if (_.isString(data)) {
                    //唯一性验证出错了
                    callback(Intl.get('clue.customer.check.only.exist', '线索名称唯一性校验失败'));
                } else {
                    if (_.isObject(data) && data.result === 'true') {
                        callback();
                    } else {
                        callback(Intl.get('clue.customer.check.repeat', '该线索名称已存在'));
                    }
                }
            }, this.state.curCustomer && this.state.curCustomer.id);
        } else {
            callback(Intl.get('clue.customer.fillin.clue.name', '请填写线索名称'));
        }
    };
    handleEditSourceTime = () => {
        this.setState({
            isEdittingTime: true
        });
    };
    changeSourceTime = (value) => {
        let timestamp = value && value.valueOf() || '';
        let curCustomer = this.state.curCustomer;
        curCustomer.source_time = timestamp;
        this.setState({
            curCustomer: curCustomer
        });
    };
    handleCancel = () => {
        let curCustomer = this.state.curCustomer;
        curCustomer.source_time = this.props.curCustomer.source_time;
        this.setState({
            isEdittingTime: false,
            loading: false,
            submitErrorMsg: '',
            curCustomer: curCustomer
        });
    };
    //今天之后的日期不可以选
    disabledDate(current){
        return current > moment().endOf('day');
    }
    handleSourceTimeSubmit = () => {
        var curCustomer = this.state.curCustomer;
        if (curCustomer.source_time === this.props.curCustomer.source_time){
            this.setState({
                isEdittingTime: false,
            });
            return;
        }
        var submitObj = {id: curCustomer.id, source_time: moment(curCustomer.source_time).valueOf()};
        clueCustomerAjax.updateCluecustomerDetail(submitObj,(submitStatus) => {
            if (submitStatus.submitType === 'loading'){
                this.setState({
                    loading: true,
                    submitErrorMsg: '',
                });
            }else if (submitStatus.submitType === 'success'){
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    isEdittingTime: false,
                },() => {
                    this.changeUserFieldSuccess(submitObj);
                });
            }else{
                this.setState({
                    loading: false,
                    submitErrorMsg: Intl.get('failed.change.source.time', '修改线索咨询时间失败'),
                });
            }
        });
    };

    render() {
        var curCustomer = this.state.curCustomer || {};
        console.log(curCustomer);
        var phone = '', qq = '', email = '', id = '', weChat = '';
        if (_.isArray(curCustomer.contacts) && curCustomer.contacts.length) {
            phone = _.isArray(curCustomer.contacts[0].phone) && curCustomer.contacts[0].phone.length ? curCustomer.contacts[0].phone[0] : '';
            qq = _.isArray(curCustomer.contacts[0].qq) && curCustomer.contacts[0].qq.length ? curCustomer.contacts[0].qq[0] : '';
            weChat = _.isArray(curCustomer.contacts[0].weChat) && curCustomer.contacts[0].weChat.length ? curCustomer.contacts[0].weChat[0] : '';
            email = _.isArray(curCustomer.contacts[0].email) && curCustomer.contacts[0].email.length ? curCustomer.contacts[0].email[0] : '';
            id = curCustomer.contacts[0].id ? curCustomer.contacts[0].id : '';
        }
        var extraParameter = {'contact_id': id};
        //是否没有权限修改线索详情
        var hasNoPrivilegeEdit = hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER') ? false : true;
        var divHeight = $(window).height() - 60;
        return (
            <RightPanel
                className="clue_customer_rightpanel white-space-nowrap"
                showFlag={this.props.showFlag} data-tracename="展示销售线索客户">
                <RightPanelClose onClick={this.hideRightPanel} data-tracename="点击关闭展示销售线索客户面板"/>
                <div style={{height: divHeight}}>
                    <GeminiScrollbar>
                        <div className="clue_customer_content_wrap">
                            <h5>
                                <UserDetailEditField
                                    user_id={curCustomer.id}
                                    field="name"
                                    value={curCustomer.name}
                                    modifySuccess={this.changeUserFieldSuccess}
                                    saveEditInput={clueCustomerAjax.updateCluecustomerDetail}
                                    validators={[{validator: this.validatorClueNameBeforSubmit}]}
                                />
                            </h5>
                            <div className="clue_detail_content">
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('call.record.contacts', '联系人')}：
                                    </dt>
                                    <dd>
                                        <UserDetailEditField
                                            extraParameter={extraParameter}
                                            user_id={curCustomer.id}
                                            value={curCustomer.contact}
                                            disabled={hasNoPrivilegeEdit}
                                            placeholder={Intl.get('crm.90', '请输入姓名')}
                                            field="contact_name"
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditInput={clueCustomerAjax.updateCluecustomerDetail}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('common.phone', '电话')}：
                                    </dt>
                                    <dd>
                                        <UserDetailEditField
                                            disabled={hasNoPrivilegeEdit}
                                            extraParameter={extraParameter}
                                            user_id={curCustomer.id}
                                            value={phone}
                                            placeholder={Intl.get('crm.95', '请输入联系人电话')}
                                            field="phone"
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditInput={clueCustomerAjax.updateCluecustomerDetail}
                                            validators={[{validator: this.getPhoneInputValidateRules}]}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('common.email', '邮箱')}：
                                    </dt>
                                    <dd>
                                        <UserDetailEditField
                                            disabled={hasNoPrivilegeEdit}
                                            extraParameter={extraParameter}
                                            user_id={curCustomer.id}
                                            value={email}
                                            field="email"
                                            placeholder={Intl.get('member.input.email', '请输入邮箱')}
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditInput={clueCustomerAjax.updateCluecustomerDetail}
                                            validators={[{validator: checkEmail}]}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        QQ：
                                    </dt>
                                    <dd>
                                        <UserDetailEditField
                                            disabled={hasNoPrivilegeEdit}
                                            extraParameter={extraParameter}
                                            user_id={curCustomer.id}
                                            value={qq}
                                            field="qq"
                                            placeholder={Intl.get('member.input.qq', '请输入QQ号')}
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditInput={clueCustomerAjax.updateCluecustomerDetail}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('crm.58', '微信')}：
                                    </dt>
                                    <dd>
                                        <UserDetailEditField
                                            disabled={hasNoPrivilegeEdit}
                                            extraParameter={extraParameter}
                                            user_id={curCustomer.id}
                                            value={weChat}
                                            field="weChat"
                                            placeholder={Intl.get('member.input.wechat', '请输入微信号')}
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditInput={clueCustomerAjax.updateCluecustomerDetail}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('crm.sales.clue.source', '线索来源')}：
                                    </dt>
                                    <dd>
                                        <BasicEditSelectField
                                            combobox={true}
                                            disabled={hasNoPrivilegeEdit}
                                            id={curCustomer.id}
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditSelect={clueCustomerAjax.updateCluecustomerDetail}
                                            cancelEditField={this.cancelEditClueSource}
                                            value={curCustomer.clue_source}
                                            field="clue_source"
                                            selectOptions={this.getClueSourceOptions()}
                                            displayText={curCustomer.clue_source || ''}
                                            onSelectChange={this.onSelectCluesource}
                                            placeholder={Intl.get('crm.clue.source.placeholder', '请选择或输入线索来源')}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('crm.sales.clue.access.channel', '接入渠道')}：
                                    </dt>
                                    <dd>
                                        <BasicEditSelectField
                                            combobox={true}
                                            disabled={hasNoPrivilegeEdit}
                                            id={curCustomer.id}
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditSelect={clueCustomerAjax.updateCluecustomerDetail}
                                            cancelEditField={this.cancelEditClueChannel}
                                            value={curCustomer.access_channel}
                                            field="access_channel"
                                            displayText={curCustomer.access_channel || ''}
                                            selectOptions={this.getAccessChannelOptions()}
                                            onSelectChange={this.onSelectAccessChannel}
                                            placeholder={Intl.get('crm.access.channel.placeholder', '请选择或输入接入渠道')}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('clue.customer.classify', '线索分类')}：
                                    </dt>
                                    <dd>
                                        <BasicEditSelectField
                                            combobox={true}
                                            disabled={hasNoPrivilegeEdit}
                                            id={curCustomer.id}
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditSelect={clueCustomerAjax.updateCluecustomerDetail}
                                            cancelEditField={this.cancelEditClueClassify}
                                            value={curCustomer.clue_classify}
                                            field="clue_classify"
                                            displayText={curCustomer.clue_classify || ''}
                                            selectOptions={this.getClueClassifyOptions()}
                                            onSelectChange={this.onSelectClueClassify}
                                            placeholder={Intl.get('crm.clue.classify.placeholder', '请选择或输入线索分类')}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_username">
                                    <dt>
                                        {Intl.get('crm.sales.clue.descr', '线索描述')}：
                                    </dt>
                                    <dd>
                                        <UserDetailEditField
                                            disabled={hasNoPrivilegeEdit}
                                            user_id={curCustomer.id}
                                            modifySuccess={this.changeUserFieldSuccess}
                                            saveEditInput={clueCustomerAjax.updateCluecustomerDetail}
                                            value={curCustomer.source}
                                            field="source"
                                            type="textarea"
                                            row={3}
                                        />
                                    </dd>
                                </dl>
                                <dl className="dl-horizontal user_detail_item detail_item user_detail_item_sourcetime">
                                    <dt>
                                        {Intl.get('crm.sales.clue.time', '线索时间')}：
                                    </dt>
                                    <dd>
                                        {this.state.isEdittingTime ?
                                            <div className="sourcetime_container">
                                                <DatePicker
                                                    disabledDate={this.disabledDate}
                                                    defaultValue={moment(curCustomer.source_time)}
                                                    onChange={this.changeSourceTime.bind(this)}
                                                    allowClear={false}/>
                                                <div className="tip-container">
                                                    {this.state.loading ? <Icon type="loading"/> :
                                                        <div>
                                                            {this.state.submitErrorMsg ? <span className="ant-form-explain">{this.state.submitErrorMsg}</span> : null}
                                                            <i title={Intl.get('common.update', '修改')} className="inline-block iconfont icon-choose"
                                                                onClick={(e) => {this.handleSourceTimeSubmit(e);}}></i>
                                                            <i title={Intl.get('common.cancel', '取消')} className="inline-block iconfont icon-close"
                                                                onClick={(e) => {this.handleCancel(e);}}></i>
                                                        </div>}

                                                </div>
                                            </div>
                                            : <div>
                                                {moment(curCustomer.source_time).format(oplateConsts.DATE_FORMAT)}
                                                <i className="iconfont icon-update" title={Intl.get('common.update', '修改')}
                                                    onClick={this.handleEditSourceTime}></i>
                                            </div>}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                        <AssignClueAndSelectCustomer
                            curClueDetail={curCustomer}
                        />
                    </GeminiScrollbar>
                </div>
            </RightPanel>
        );
    }
}

ClueRightPanel.defaultProps = {
    curCustomer: {},
    clueSourceArray: [],
    accessChannelArray: [],
    clueClassifyArray: [],
    showFlag: noop,
    hideRightPanel: noop,
    updateClueSource: noop,
    updateClueChannel: noop,
    updateClueClassify: noop,
};
ClueRightPanel.propTypes = {
    curCustomer: React.PropTypes.object,
    clueSourceArray: React.PropTypes.object,
    accessChannelArray: React.PropTypes.object,
    clueClassifyArray: React.PropTypes.object,
    showFlag: React.PropTypes.func,
    hideRightPanel: React.PropTypes.func,
    updateClueSource: React.PropTypes.func,
    updateClueChannel: React.PropTypes.func,
    updateClueClassify: React.PropTypes.func,

};
export default ClueRightPanel;