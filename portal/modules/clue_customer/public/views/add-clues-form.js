import {AntcAreaSelection} from 'antc';

var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/26.
 */
import '../css/add-clues-form.less';
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from './right_panel_top';
import {Form, Input, Select, DatePicker, Button, Icon} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
import ajax from '../../../crm/common/ajax';
const routes = require('../../../crm/common/route');
var clueCustomerAction = require('../action/clue-customer-action');
import {checkClueName, checkClueSourceIP,contactNameRule, sourceClassifyOptions,isCommonSalesOrPersonnalVersion} from '../utils/clue-customer-utils';
import {nameRegex} from 'PUB_DIR/sources/utils/validate-util';
var classNames = require('classnames');
import PropTypes from 'prop-types';
var uuid = require('uuid/v4');
import AlertTimer from 'CMP_DIR/alert-timer';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
require('../css/add-clues-info.less');
import DynamicAddDelContact from 'CMP_DIR/dynamic-add-del-contacts';
import Trace from 'LIB_DIR/trace';
import {renderClueNameMsg} from 'PUB_DIR/sources/utils/common-method-util';
import CrmAction from 'MOD_DIR/crm/public/action/crm-actions';
import userData from 'PUB_DIR/sources/user-data';
const DIFCONTACTWAY = {
    PHONE: 'phone',
    EMAIL: 'email',
    QQ: 'qq',
    WECHAT: 'weChat'
};
var initialContact = {
    'name': '',
    'show_contact_item': [{type: DIFCONTACTWAY.PHONE, value: '', randomValue: uuid()}]
};
const FORMLAYOUT = {
    PADDINGTOTAL: 70
};
class ClueAddForm extends React.Component {
    constructor(props) {
        super(props);
        const today = moment().format('YYYY-MM-DD');
        this.state = {
            formData: {
                name: '',//客户名称
                contact_name: '',//联系人
                contacts: [_.cloneDeep(initialContact)],
                clue_source: '',//线索来源
                access_channel: '',//接入渠道
                source: '',//线索描述
                source_ip: '',//客户来源的ip
                source_time: today,//线索时间，默认：今天,
                source_classify: 'outbound',//集客类型，默认：自拓
                industry: '',//行业
                province: '',
                city: '',
                county: '',
                province_code: '',
                city_code: '',
                county_code: '',
                address: '',//详细地址
            },
            isSaving: false,
            saveMsg: '',
            saveResult: '',
            newAddClue: {},//新增加的线索
            existClueList: [],//相似的线索列表
            checkNameError: false,//线索名称
            phoneDuplicateWarning: [],//联系人电话重复时的提示
            isLoadingIndustry: false,
            industryList: []//获取行业列表
        };
    }

    componentDidMount() {
        this.getIndustry();
        $('.contact-containers .ant-form-item-label label').addClass('ant-form-item-required');
    }

    getPhoneFormValue = (form) => {
        return new Promise(resolve => {
            form.validateFields((errs, fields) => {
                resolve({errs, fields});
            });
        });
    };
    //保存结果的处理
    setResultData(saveMsg, saveResult) {
        this.setState({
            isSaving: false,
            saveMsg: saveMsg,
            saveResult: saveResult
        });
    }

    afterAddClue = (submitObj) => {
        //如果线索来源或者接入渠道,线索类型加入新的类型
        if (submitObj.clue_source && !_.includes(this.props.clueSourceArray, submitObj.clue_source)) {
            _.isFunction(this.props.updateClueSource) && this.props.updateClueSource(submitObj.clue_source);
        }
        if (submitObj.access_channel && !_.includes(this.props.accessChannelArray, submitObj.access_channel)) {
            _.isFunction(this.props.updateClueChannel) && this.props.updateClueChannel(submitObj.access_channel);
        }
        if (submitObj.clue_classify && !_.includes(this.props.clueClassifyArray, submitObj.clue_classify)) {
            _.isFunction(this.props.updateClueClassify) && this.props.updateClueClassify(submitObj.clue_classify);
        }
    };

    hasContactWay(contactWayArray) {
        return _.find(contactWayArray, item => item);
    }

    // 是否有联系方式的验证
    validateContactIsEmpty(contacts) {
        let contactIsEmpty = true;
        _.each(contacts, (contactItem) => {
            if (contactItem) {
                if (this.hasContactWay(contactItem.phone) ||
                    this.hasContactWay(contactItem.qq) ||
                    this.hasContactWay(contactItem.email) ||
                    this.hasContactWay(contactItem.weChat)) {
                    contactIsEmpty = false;
                    return false;
                }
            }
        });
        if (contactIsEmpty) {
            this.setState({
                contactErrMsg: Intl.get('clue.fill.clue.contacts', '请填写线索的联系方式')
            });
        }
        return contactIsEmpty;
    }

    getSubmitObj(values) {
        let submitObj = {};
        //去掉values中的key值
        _.forEach(values, (value, key) => {
            if (value) {
                if (key === 'source_time') {
                    submitObj[key] = moment(value).valueOf();
                } else if (key === 'contacts') {//联系人的处理
                    let contacts = [];
                    _.each(value, contact => {
                        let submitContact = _.cloneDeep(contact);
                        if (submitContact && submitContact.name) {
                            // 过滤掉空的联系方式
                            submitContact.phone = _.filter(submitContact.phone, phone => phone);
                            submitContact.qq = _.filter(submitContact.qq, qq => qq);
                            submitContact.email = _.filter(submitContact.email, email => email);
                            submitContact.weChat = _.filter(submitContact.weChat, weChat => weChat);
                            contacts.push(submitContact);
                        }
                    });
                    submitObj[key] = contacts;
                } else if (key !== 'contact_keys') {//去掉用于动态增删联系方式的属性
                    submitObj[key] = value;
                }
            }
        });
        //生成线索客户的用户的id
        if (this.props.appUserId) {
            submitObj.app_user_ids = [this.props.appUserId];
            submitObj.app_user_info = [{
                id: this.props.appUserId,
                name: this.props.appUserName
            }];
        }
        //把订单的第一个设置为默认联系人
        if (_.get(submitObj,'contacts[0]')) {
            submitObj.contacts[0]['def_contancts'] = 'true';
        }
        return {...this.state.formData,...submitObj};
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            //是否有联系方式的验证
            // || this.state.clueNameExist || this.state.checkNameError
            if (this.validateContactIsEmpty(values.contacts)) {
                return;
            }
            let submitObj = this.getSubmitObj(values);
            let addRoute = _.find(routes, (route) => route.handler === 'addSalesClue');
            this.setState({isSaving: true, saveMsg: '', saveResult: ''});
            //添加线索的时候，如果是管理员添加不需要加字段
            //如果是普通销售添加，字段加上user_id user_name team_id team_name
            //如果是个人版本，字段加上user_id user_name
            if(isCommonSalesOrPersonnalVersion()){
                var userDataInfo = userData.getUserData();
                var user_id = userDataInfo.user_id;
                var user_name = userDataInfo.user_name;
                var team_id = userDataInfo.team_id;
                var team_name = userDataInfo.team_name;
                if(user_id && user_name){
                    submitObj.user_id = user_id;
                    submitObj.user_name = user_name;
                }
                if(team_id && team_name){
                    submitObj.team_id = team_id;
                    submitObj.team_name = team_name;
                }
            }
            ajax({
                url: addRoute.path,
                type: addRoute.method,
                data: submitObj
            }).then(data => {
                if (_.isObject(data) && data.code === 0) {
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    this.setState({
                        newAddClue: data.result
                    });
                    clueCustomerAction.afterAddSalesClue({newCustomer: data.result});
                    this.afterAddClue(submitObj);
                    //在其他模块，线索添加成功后的回调
                    _.isFunction(this.props.afterAddSalesClue) && this.props.afterAddSalesClue();
                } else {
                    var errTip = Intl.get('crm.154', '添加失败');
                    if (_.isString(data.message) && _.isArray(data.result) && data.result.length){
                        var phone = _.get(data, 'result[0].phones',[]);
                        errTip = Intl.get('clue.manage.has.exist.clue','线索名为{name}，联系电话为{phone}的线索已存在！',{name: _.get(data, 'result[0].name',''),phone: phone.join(',')});
                    }
                    this.setResultData(errTip, 'error');
                }
            }, errorMsg => {
                //添加失败
                this.setResultData(errorMsg || Intl.get('crm.154', '添加失败'), 'error');
            });

        });
    };

    renderCheckContactMsg() {
        if (this.state.contactErrMsg) {
            return (
                <div className="clue-contactname-errmsg">
                    {this.state.contactErrMsg}
                </div>
            );
        } else {
            return '';
        }
    }

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveMsg: '',
            saveResult: ''
        });
        setTimeout(() => {
            this.props.hideAddForm();
        }, 1000);

    };
    hideContactRequired = () => {
        this.setState({
            contactErrMsg: ''
        });
    };

    getPhonesArray = () => {
        let contacts = this.props.form.getFieldValue('contacts');
        let phoneArray = [];
        _.each(_.map(contacts,'phone'), phone => {
            phoneArray = phoneArray.concat(_.map(phone,item => _.trim(item.replace('-', ''))));
        });
        return phoneArray;
    };

    isPhoneExisted = (value) => {
        let phone = value.replace('-', '');
        //所有联系人的电话
        let phoneArray = this.getPhonesArray();
        let phoneCount = _.filter(phoneArray, (curPhone) => curPhone === phone);

        //该电话列表已存在该电话
        if (phoneCount.length > 1) {
            return true;
        } else {
            return false;
        }
    };

    //获取联系人电话验证规则
    getPhoneInputValidateRules() {
        return [{
            validator: (rule, value, callback) => {
                value = _.trim(value);
                if (value) {
                    let existed = this.isPhoneExisted(value);
                    if(existed) {
                        callback(Intl.get('crm.83', '该电话已存在'));
                    }
                    callback();
                }
                callback();
            }}];
    }
    //线索名唯一性验证
    checkOnlyClueName = (e) => {
        let clueName = _.trim(this.props.form.getFieldValue('name'));
        //满足验证条件后再进行唯一性验证
        if (clueName && nameRegex.test(clueName)) {
            Trace.traceEvent(e, '添加线索名称');
            //queryBody: 线索名称, is_term: 是否做完全匹配，值为true/false， callback回调函数
            let queryBody = {name: clueName};
            clueCustomerAction.checkOnlyClueNamePhone(queryBody, false, (data) => {
                let list = _.get(data, 'list');
                //客户名是否重复
                let repeatClue = _.some(list, {'name': clueName});
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({clueNameExist: false, checkNameError: true, existClueList: []});
                } else if (_.isObject(data)) {
                    if (!repeatClue) {
                        //不存在
                        this.setState({
                            clueNameExist: false,
                            checkNameError: false,
                            existClueList: _.get(data, 'list', [])
                        });
                    } else {
                        //已存在
                        this.setState({
                            clueNameExist: true,
                            checkNameError: false,
                            existClueList: _.get(data, 'list', [])
                        });
                    }
                }
            });
        } else {
            this.setState({clueNameExist: false, checkNameError: false, existClueList: []});
        }
    };
    getIndustry() {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustry: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.map(list, 'industry');
            }
            this.setState({isLoadingIndustry: false, industryList: list});
        });
    }

    //判断当前电话是否被其他线索使用，报警告
    renderComnnonPhoneMessage = (customerList, showRightPanel) => {
        const list = _.cloneDeep(customerList);
        let showMessage = (clue) => {
            return <span>
                <span>{Intl.get('clue.customer.phone.used.by.clue','该电话已被其他线索使用，')}</span>
                <a href="javascript:void(0)" onClick={showRightPanel.bind(this, clue)} className="handle-btn-item">
                    {_.get(clue, 'name', '')}
                </a>
            </span>;
        };
        if(customerList.length > 0){
            return showMessage(list.shift());
        }
    };

    //电话修改时的回调
    onPhoneChange = (phoneObj) => {
        let {key, value} = phoneObj;
        setTimeout(() => {
            let queryObj = {phone: value};
            clueCustomerAction.checkOnlyClueNamePhone(queryObj, true, data => {
                if (_.isString(data)) {
                    //唯一性验证出错了
                } else {
                    if (_.isObject(data) && data.result === 'true') {
                        //电话没有被线索使用时
                        this.handleDuplicatePhoneMsg(key, false, '');
                    } else {
                        let existed = this.isPhoneExisted(value);
                        //如果有“电话已存在”的验证错误，先展示"电话已存在"
                        if(!existed) {
                            const customer = data.list;
                            const message = this.renderComnnonPhoneMessage(customer, this.props.showRightPanel);
                            this.handleDuplicatePhoneMsg(key, true, message);
                        }
                    }
                }
            });
        }, 500);
    };

    //电话重复时错误信息的处理
    handleDuplicatePhoneMsg = (phoneKey, hasWarning, warningMsg) => {
        let phoneDuplicateWarning = _.cloneDeep(this.state.phoneDuplicateWarning);
        let phoneWarning = _.find(phoneDuplicateWarning, msg => _.isEqual(msg.id, phoneKey));
        //如果没有找到id,并且有警告信息
        if(_.isEmpty(phoneWarning) && hasWarning) {
            phoneDuplicateWarning.push({
                id: phoneKey,
                warning: warningMsg,
            });
            this.setState({
                phoneDuplicateWarning: phoneDuplicateWarning
            });
        } else if(!_.isEmpty(phoneWarning)) { //如果找到了此id，判断此时是否还有警告
            //如果还有警告，更新此电话的警告信息
            if(hasWarning){
                phoneWarning.warning = warningMsg;
            } else {//如果没有警告，说明已经修改为正确的电话
                _.remove(phoneDuplicateWarning, msg => _.isEqual(msg.id, phoneKey));
            }
            this.setState({
                phoneDuplicateWarning
            });
        }
    };

    //当移除电话输入框时的回调
    onRemovePhoneInput = (phoneKey) => {
        //当电话输入框清除时，清除对应的警告信息
        let phoneDuplicateWarning = _.cloneDeep(this.state.phoneDuplicateWarning);
        _.remove(phoneDuplicateWarning, msg => _.isEqual(msg.id, phoneKey));
        this.setState({
            phoneDuplicateWarning
        });
    };
    handleSelect() {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div .ant-form-item label[for=\'industry\']').next('div'), '选择行业');
    }
    //更新地址
    updateLocation = (addressObj) => {
        let formData = this.state.formData;
        formData.province = addressObj.provName || '';
        formData.city = addressObj.cityName || '';
        formData.county = addressObj.countyName || '';
        formData.province_code = addressObj.provCode || '';
        formData.city_code = addressObj.cityCode || '';
        formData.county_code = addressObj.countyCode || '';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div .ant-form-item'), '选择地址');
    };
    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 19},
            },
        };
        let formData = this.state.formData;
        var clsContainer = classNames('form-item-label contact-containers', {
            'contact-err-tip': this.state.contactErrMsg
        });
        this.phoneInputRefs = [];
        let saveResult = this.state.saveResult;
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        // 控制联系方式增减的key
        getFieldDecorator('contact_keys', {
            initialValue: [{
                key: 0,
                phone: [{key: 0}],
                qq: [{key: 0}],
                weChat: [{key: 0}],
                email: [{key: 0}]
            }]
        });
        const contact_keys = getFieldValue('contact_keys');
        let industryList = this.state.industryList || [];
        //行业下拉列表
        let industryOptions = industryList.map(function(industry, index) {
            return (<Option key={index} value={industry}>{industry}</Option>);
        });
        return (
            <RightPanel showFlag={true} data-tracename="添加线索" className="sales-clue-add-container">
                <BasicData
                    clueTypeTitle={Intl.get('crm.sales.add.clue', '添加线索')}
                />
                <div className="add-clue-item" style={{'height': divHeight}}>
                    <GeminiScrollbar>
                        <Form layout='horizontal' className="sales-clue-form" id="sales-clue-form">
                            <FormItem
                                className="form-item-label"
                                label={Intl.get('common.login.time', '时间')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('source_time', {
                                    rules: [{
                                        required: true,
                                    }],
                                    initialValue: moment(),
                                })(
                                    <DatePicker
                                        allowClear={false}
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                className="form-item-label"
                                label={Intl.get('clue.customer.clue.name', '线索名称')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: true,
                                        message: Intl.get('clue.customer.fillin.clue.name', '请填写线索名称')
                                    }, {validator: checkClueName}],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        name="name"
                                        id="name"
                                        onBlur={(e) => {
                                            this.checkOnlyClueName(e);
                                        }}
                                        placeholder={Intl.get('clue.suggest.input.customer.name', '建议输入客户名称')}
                                    />
                                )}
                            </FormItem>
                            {renderClueNameMsg(this.state.existClueList, this.state.checkNameError, _.trim(this.props.form.getFieldValue('name')), this.props.showRightPanel)}
                            <FormItem
                                className={clsContainer}
                                label={Intl.get('crm.5', '联系方式')}
                                {...formItemLayout}
                            >
                                <DynamicAddDelContact
                                    hideContactRequired={this.hideContactRequired}
                                    validateContactName={contactNameRule()}
                                    phoneOnlyOneRules={this.getPhoneInputValidateRules()}
                                    onPhoneChange={this.onPhoneChange}
                                    phoneDuplicateWarning={this.state.phoneDuplicateWarning}
                                    onRemovePhoneInput={this.onRemovePhoneInput}
                                    form={this.props.form} />
                            </FormItem>
                            {this.renderCheckContactMsg()}
                            <FormItem
                                className="form-item-label"
                                label={Intl.get('crm.sales.clue.descr', '线索描述')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('source')(
                                    <Input
                                        placeholder={Intl.get('clue.add.customer.need', '请描述一下客户需求')}
                                        name="source"
                                        type="textarea" id="source" rows="3"
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('crm.clue.client.source', '集客方式')}
                                id="source_classify"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('source_classify', {
                                        initialValue: formData.source_classify
                                    })(
                                        <Select
                                            placeholder={Intl.get('crm.clue.client.source.placeholder', '请选择集客方式')}
                                            name="source_classify"
                                            value={formData.source_classify}
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                        >
                                            {sourceClassifyOptions}
                                        </Select>
                                    )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('clue.analysis.source', '来源')}
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('clue_source')(
                                        <Select
                                            combobox
                                            placeholder={Intl.get('crm.clue.source.placeholder', '请选择或输入线索来源')}
                                            name="clue_source"
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                        >
                                            {
                                                _.isArray(this.props.clueSourceArray) ?
                                                    this.props.clueSourceArray.map((source, idx) => {
                                                        return (<Option key={idx} value={source}>{source}</Option>);
                                                    }) : null
                                            }
                                        </Select>
                                    )}
                            </FormItem>
                            <FormItem
                                className="form-item-label"
                                label={Intl.get('clue.customer.source.ip','来源IP')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('source_ip',{
                                    rules: [{validator: checkClueSourceIP}],
                                })(
                                    <Input
                                        name="source_ip"
                                        id="source_ip"
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('common.industry', '行业')}
                                id="industry"
                            >
                                {this.state.isLoadingIndustry ? (
                                    <div className="industry-list-loading">
                                        <ReactIntl.FormattedMessage
                                            id="crm.88"
                                            defaultMessage="正在获取行业列表"/>
                                        <Icon type="loading"/></div>) : (
                                    getFieldDecorator('industry')(
                                        <Select
                                            showSearch
                                            placeholder={Intl.get('crm.22', '请选择行业')}
                                            searchPlaceholder={Intl.get('crm.89', '输入行业进行搜索')}
                                            optionFilterProp="children"
                                            notFoundContent={!industryList.length ? Intl.get('crm.24', '暂无行业') : Intl.get('crm.23', '无相关行业')}
                                            onSelect={(e) => {
                                                this.handleSelect(e);
                                            }}
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                        >
                                            {industryOptions}
                                        </Select>
                                    )
                                )}
                            </FormItem>
                            <AntcAreaSelection
                                labelCol="5"
                                wrapperCol="19"
                                width="100%"
                                colon={false}
                                label={Intl.get('crm.96', '地域')}
                                placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                                provName={formData.province}
                                cityName={formData.city}
                                countyName={formData.county}
                                updateLocation={this.updateLocation}
                            />
                            <FormItem
                                label={Intl.get('common.address', '地址')}
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('address')(
                                        <Input
                                            placeholder={Intl.get('crm.detail.address.placeholder', '请输入详细地址')}
                                        />
                                    )
                                }
                            </FormItem>
                            <FormItem
                                label={Intl.get('crm.sales.clue.access.channel', '接入渠道')}
                                id="access_channel"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('access_channel')(
                                        <Select
                                            combobox
                                            placeholder={Intl.get('crm.access.channel.placeholder', '请选择或输入接入渠道')}
                                            name="access_channel"
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                            value={formData.access_channel}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                        >
                                            {_.isArray(this.props.accessChannelArray) ?
                                                this.props.accessChannelArray.map((source, idx) => {
                                                    return (<Option key={idx} value={source}>{source}</Option>);
                                                }) : null
                                            }
                                        </Select>
                                    )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('clue.customer.classify', '线索分类')}
                                id="clue_classify"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('clue_classify')(
                                        <Select
                                            combobox
                                            placeholder={Intl.get('crm.clue.classify.placeholder', '请选择或输入线索分类')}
                                            name="clue_classify"
                                            value={formData.clue_classify}
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                        >
                                            {_.isArray(this.props.clueClassifyArray) ?
                                                this.props.clueClassifyArray.map((source, idx) => {
                                                    return (<Option key={idx} value={source}>{source}</Option>);
                                                }) : null
                                            }
                                        </Select>
                                    )}
                            </FormItem>
                            <div className="submit-button-container">
                                <FormItem
                                    wrapperCol={{span: 24}}>
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer time={saveResult === 'error' ? 3000 : 600}
                                                    message={this.state.saveMsg}
                                                    type={saveResult} showIcon
                                                    onHide={saveResult === 'error' ? function(){} : this.hideSaveTooltip}/>
                                            ) : ''
                                        }
                                    </div>
                                    <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                        disabled={this.state.isSaving} data-tracename="点击保存添加
                                            线索按钮">
                                        {Intl.get('common.save', '保存')}
                                        {this.state.isSaving ? <Icon type="loading"/> : null}
                                    </Button>
                                    <Button className="cancel-btn" onClick={this.props.hideAddForm}
                                        data-tracename="点击取消添加线索信息按钮">
                                        {Intl.get('common.cancel', '取消')}
                                    </Button>
                                </FormItem>
                            </div>

                        </Form>
                    </GeminiScrollbar>
                </div>
            </RightPanel>
        );
    }
}
ClueAddForm.defaultProps = {
    defaultClueData: {},
    clueSourceArray: [],
    updateClueSource: function() {

    },
    accessChannelArray: [],
    updateClueChannel: function() {

    },
    clueClassifyArray: [],
    updateClueClassify: function() {

    },
    afterAddSalesClue: function() {

    },
    form: {},
    hideAddForm: function() {

    },
    appUserId: '',
    appUserName: '',
    showRightPanel: function() {

    }
};
ClueAddForm.propTypes = {
    defaultClueData: PropTypes.object,
    clueSourceArray: PropTypes.object,
    updateClueSource: PropTypes.func,
    accessChannelArray: PropTypes.object,
    updateClueChannel: PropTypes.func,
    clueClassifyArray: PropTypes.object,
    updateClueClassify: PropTypes.func,
    afterAddSalesClue: PropTypes.func,
    form: PropTypes.object,
    hideAddForm: PropTypes.func,
    appUserId: PropTypes.string,
    appUserName: PropTypes.string,
    showRightPanel: PropTypes.func
};
export default Form.create()(ClueAddForm);
