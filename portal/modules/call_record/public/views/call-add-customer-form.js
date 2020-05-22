var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
import {Icon,Form,Input,message}from 'antd';
var rightPanelUtil = require('../../../../components/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var FormItem = Form.Item;
var CrmAction = require('../../../crm/public/action/crm-actions');
import {customerNameRegex} from 'PUB_DIR/sources/utils/validate-util';
var ContactUtil = require('../../../crm/public/utils/contact-util');
var Spinner = require('../../../../components/spinner');
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import routeList from '../../../common/route';
import ajax from '../../../common/ajax';
var CallRecordAction = require('../action/call-record-actions');
var classNames = require('classnames');
import Trace from 'LIB_DIR/trace';
import { AntcAreaSelection, AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
import {renderCustomerNameMsg} from 'PUB_DIR/sources/utils/common-method-util';

var CallAddCustomerForm = createReactClass({
    displayName: 'CallAddCustomerForm',
    mixins: [Validation.FieldMixin],

    getInitialState: function() {
        var formData = {
            name: '',//客户名称
            industry: [],//行业
            province: '',
            city: '',
            county: '',
            province_code: '',
            city_code: '',
            county_code: '',
            remarks: '',//备注
            contacts0_name: '',//联系人名称
            contacts0_position: '',//联系人职位
            contacts0_role: Intl.get('crm.115', '经办人'),//联系人角色
            contacts0_phone: this.transPhoneNumber(this.props.phoneNumber)//联系人电话
        };
        return {
            status: {
                name: {},//客户名称
                industry: {},//行业
                remarks: {},//备注
                contacts0_name: {},//联系人名称
                contacts0_position: {},//联系人职位
                contacts0_role: {},//联系人角色
            },
            isLoading: false,
            formData: formData,
            customerNameExist: false,//客户名是否已存在
            existCustomerList: [],//已存在的客户列表
            checkNameError: false,//客户名唯一性验证出错
            isLoadingIndustry: false//是否正在加载行业列表
        };
    },

    componentDidMount: function() {
        this.getIndustryList();
    },

    getIndustryList: function(){
        //获取后台管理中设置的行业列表
        this.gr();
    },

    gr: function() {
        //获取后台管理中设置的行业列表

        this.setState({isLoadingIndustry: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.map(list, 'industry');
            }
            this.setState({isLoadingIndustry: false, industryList: list});
        });
    },

    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;
        var arr = item.split('.');
        if (arr[1]) {
            status = _.get(status, 'contacts[0]', {});
            item = arr[1];
        }

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    //更新地址
    updateLocation: function(addressObj) {
        this.state.formData.province = addressObj.provName || '';
        this.state.formData.city = addressObj.cityName || '';
        this.state.formData.county = addressObj.countyName || '';
        this.state.formData.province_code = addressObj.provCode || '';
        this.state.formData.city_code = addressObj.cityCode || '';
        this.state.formData.county_code = addressObj.countyCode || '';
    },

    //提交修改
    handleSubmit: function(e) {
        e.preventDefault();
        Trace.traceEvent(e, '点击保存按钮');
        var validation = this.refs.validation;
        var _this = this;
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else {
                validation.reset();
                let formData = _this.state.formData;
                //去除表单数据中值为空的项
                commonMethodUtil.removeEmptyItem(formData);
                CrmAction.addCustomer(formData, function(data) {
                    _this.state.isLoading = false;
                    if (data.code === 0) {
                        formData.contacts0_phone = _this.props.phoneNumber;
                        CallRecordAction.updateCallRecord({...formData, id: _.get(data,'result[0].id','')});
                        message.success( Intl.get('user.user.add.success', '添加成功'));
                        _this.props.addOne();
                        _this.setState(_this.getInitialState());
                    } else {
                        message.error(data);
                        _this.setState(_this.state);
                    }
                });
            }
        });
    },

    closeAddPanel: function() {
        this.setState(this.getInitialState());
        this.props.hideAddForm();
    },

    //根据客户名在地理信息接口获取该客户的信息并填充到对应字段
    autofillGeoInfo: function(customerName) {
        const route = _.find(routeList, route => route.handler === 'getGeoInfo');

        const arg = {
            url: route.path,
            query: {keywords: customerName}
        };

        ajax(arg).then(result => {
            if (_.isEmpty(result)) return;

            this.state.formData.address = result.address;
            this.state.formData.location = result.location;
            this.state.formData.province = result.pname;
            this.state.formData.city = result.cityname;
            this.state.formData.county = result.adname;
            this.state.formData.province_code = result.pcode;
            this.state.formData.city_code = result.citycode;
            this.state.formData.county_code = result.adcode;
            this.state.formData.contacts0_phone = this.transPhoneNumber(this.props.phoneNumber);
            this.setState(this.state);
        });
    },

    //客户名唯一性验证
    checkOnlyCustomerName: function() {
        var customerName = _.trim(this.state.formData.name);
        //满足验证条件后再进行唯一性验证
        if (customerName && customerNameRegex.test(customerName)) {
            CrmAction.checkOnlyCustomerName(customerName, (data) => {
                let list = _.get(data,'list');
                //客户名是否重复
                let repeatCustomer = _.some(list,{'name': customerName});
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({customerNameExist: false, checkNameError: true});
                } else if (_.isObject(data)) {
                    if (!repeatCustomer) {
                        //不存在
                        this.setState({customerNameExist: false, checkNameError: false,existCustomerList: _.get(data, 'list',[])});
                    } else {
                        //已存在
                        this.setState({customerNameExist: true, checkNameError: false, existCustomerList: _.get(data, 'list',[])});
                    }
                }
            });

            //根据客户名查询地域、行业等信息并自动填充到相关字段
            this.autofillGeoInfo(customerName);
        } else {
            this.setState({customerNameExist: false, checkNameError: false});
        }
    },

    //客户名格式验证
    checkCustomerName: function(rule, value, callback) {
        value = _.trim(value);
        if (value) {
            if (customerNameRegex.test(value)) {
                callback();
            } else {
                this.setState({customerNameExist: false, checkNameError: false});
                callback(new Error(Intl.get('crm.197', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到25（包括25）之间')));
            }
        } else {
            this.setState({customerNameExist: false, checkNameError: false});
            callback(new Error( Intl.get('crm.81', '请填写客户名称')));
        }
    },

    transPhoneNumber(phoneNumber){
        let transNumber = '';
        let phoneRegex = /^1[3|4|5|7|8][0-9]\d{8}$/;
        // 电话号码转换
        if (phoneNumber.length === 12 && phoneNumber[1] === 1) {
            transNumber = phoneNumber.slice(1);
            if (phoneRegex.test(transNumber)) {
                return transNumber;
            }
        } else if (phoneNumber.length === 11 && phoneRegex.test(transNumber)) { // 11位的电话号码
            return transNumber;
        }

        let threeAreaRegex = /^0[1|2]\d{8,9}$/; // 3位区号
        if (threeAreaRegex.test(phoneNumber)) {
            transNumber = phoneNumber.substring(0,3) + '-' + phoneNumber.substring(3);
            return transNumber;
        }
        let fourAreaRegex = /^0[3|4|5|6|7|8|9]\d{9,10}$/; // 4位区号
        if (fourAreaRegex.test(phoneNumber)) {
            transNumber = phoneNumber.substring(0,4) + '-' + phoneNumber.substring(4);
            return transNumber;
        }
        transNumber = phoneNumber;
        return transNumber;
    },

    handleSelect(value){
        if (value === 'industry') {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '选择行业');
        } else if(value === 'contacts0_role') {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '选择角色');
        }
    },

    render: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        //角色下拉列表
        var roleOptions = ContactUtil.roleArray.map(function(role, index) {
            return (<Option value={role} key={index}>{role}</Option>);
        });
        let industryList = this.state.industryList || [];
        //行业下拉列表
        var industryOptions = industryList.map(function(industry, index) {
            return (<Option key={index} value={industry}>{industry}</Option>);
        });
        return (
            <RightPanel showFlag={this.props.showFlag}>
                <RightPanelClose onClick={this.closeAddPanel}/>
                <Form layout='horizontal' className="crm-add-form">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label={Intl.get('crm.4', '客户名称')}
                            id="crm-name"
                            labelCol={{span: 6}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('name')}
                            help={status.name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.name.errors && status.name.errors.join(','))}
                        >
                            <Validator
                                rules={[{validator: this.checkCustomerName}]}>
                                <Input name="name" id="name"
                                    value={formData.name}
                                    onBlur={this.checkOnlyCustomerName}
                                    onChange={this.setField.bind(this, 'name')}
                                />
                            </Validator>
                        </FormItem>
                        {renderCustomerNameMsg( this.state.existCustomerList, this.state.checkNameError, _.get(formData, 'name', ''), this.props.showRightPanel)}
                        <FormItem
                            label={Intl.get('common.industry', '行业')}
                            id="industry"
                            labelCol={{span: 6}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('industry')}
                            help={status.industry.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.industry.errors && status.industry.errors.join(','))}
                        >
                            {this.state.isLoadingIndustry ? (
                                <div className="industry-list-loading"><ReactIntl.FormattedMessage id="crm.88" defaultMessage="正在获取行业列表" /><Icon type="loading"/></div>) : (
                                <Validator
                                    rules={[{required: true, message: Intl.get('crm.22', '请选择行业')}]}>
                                    <AntcSelect showSearch placeholder={Intl.get('crm.22', '请选择行业')} name="industry"
                                        searchPlaceholder={Intl.get('crm.89', '输入行业进行搜索')}
                                        optionFilterProp="children"
                                        notFoundContent={!industryList.length ? Intl.get('crm.24', '暂无行业') : Intl.get('crm.23', '无相关行业')}
                                        onChange={this.setField.bind(this, 'industry')}
                                        value={formData.industry}
                                        onSelect={this.handleSelect.bind(this, 'industry')}
                                        filterOption={(input, option) => ignoreCase(input, option)}
                                    >
                                        {industryOptions}
                                    </AntcSelect>
                                </Validator>)}
                        </FormItem >
                        <AntcAreaSelection labelCol="6" wrapperCol="18" width="420"
                            provName={formData.province} cityName={formData.city}
                            countyName={formData.county}
                            updateLocation={this.updateLocation}/>
                        < FormItem
                            label={Intl.get('common.remark', '备注')}
                            id="remarks"
                            labelCol={{span: 6}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('remarks')}
                        >
                            <Input type="textarea" id="remarks" rows="3" value={formData.remarks}
                                onChange={this.setField.bind(this, 'remarks')}
                            />
                        </FormItem>
                        <div className="crm-contact-title"
                            style={{fontSize: '14px', textAlign: 'center', marginTop: '20px',marginBottom: '10px'}}>
                            <ReactIntl.FormattedMessage id="call.record.contacts" defaultMessage="联系人" />
                        </div>
                        <FormItem
                            label={Intl.get('common.name', '姓名')}
                            labelCol={{span: 6}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('contacts0_name')}
                            help={status.contacts0_name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.contacts0_name.errors && status.contacts0_name.errors.join(','))}
                        >
                            <Validator rules={[{required: false,min: 1,max: 50, message: Intl.get('crm.contact.name.length', '请输入最多50个字符')}]}>
                                <Input name="contacts0_name" placeholder={Intl.get('crm.90', '请输入姓名')} value={formData.contacts0_name}
                                    onChange={this.setField.bind(this, 'contacts0_name')}/>
                            </Validator>
                        </FormItem>
                        <FormItem
                            label={Intl.get('crm.91', '职位')}
                            labelCol={{span: 6}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('contacts0_position')}
                            help={status.contacts0_position.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.contacts0_position.errors && status.contacts0_position.errors.join(','))}
                        >
                            <Validator rules={[{required: false,min: 1, message: Intl.get('crm.92', '请输入联系人职位')}]}>
                                <Input name="contacts0_position" placeholder={Intl.get('crm.92', '请输入联系人职位')}
                                    value={formData.contacts0_position}
                                    onChange={this.setField.bind(this, 'contacts0_position')}/>
                            </Validator>
                        </FormItem>
                        <FormItem
                            label={Intl.get('user.apply.detail.table.role', '角色')}
                            labelCol={{span: 6}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('contacts0_role')}
                            help={status.contacts0_role.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.contacts0_role.errors && status.contacts0_role.errors.join(','))}
                        >
                            <Validator rules={[{required: true,min: 1, message: Intl.get('crm.93', '请输入联系人角色')}]}>
                                <AntcSelect name="contacts0_role" placeholder={Intl.get('crm.94', '请输入角色')}
                                    value={this.state.formData.contacts0_role}
                                    onChange={this.setField.bind(this, 'contacts0_role')}
                                    onSelect={this.handleSelect.bind(this, 'contacts0_role')}
                                >
                                    {roleOptions}
                                </AntcSelect>
                            </Validator>
                        </FormItem>
                        <div className="show-call-phone">
                            {Intl.get('common.phone', '电话')} <span className="call-phone">{this.transPhoneNumber(this.props.phoneNumber)}</span>
                        </div>
                        <FormItem
                            wrapperCol={{span: 24}}>
                            <RightPanelCancel onClick={this.closeAddPanel}>
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                            </RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit} disabled={this.state.isLoading}>
                                <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                            </RightPanelSubmit>
                        </FormItem>
                    </Validation>
                </Form>
                {
                    this.state.isLoading ?
                        (<Spinner className="isloading"/>) :
                        (null)
                }
            </RightPanel>
        );
    },
});
module.exports = CallAddCustomerForm;

