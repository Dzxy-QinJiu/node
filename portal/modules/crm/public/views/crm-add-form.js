const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
import {Icon, Form, Input, Select, message}from "antd";
import { AntcAreaSelection } from "antc";
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var FormItem = Form.Item;
var Option = Select.Option;
var CrmAction = require("../action/crm-actions");
var ContactUtil = require("../utils/contact-util");
import {nameRegex} from "PUB_DIR/sources/utils/consts";
var Spinner = require('../../../../components/spinner');
const GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var crmUtil = require("../utils/crm-util");
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import FilterStore from "../store/filter-store";
import routeList from "../../../common/route";
import ajax from "../../../common/ajax";
import crmAjax from "../ajax/index";
const userData = require("../../../../public/sources/user-data");
import PhoneInput from "CMP_DIR/phone-input";
import Trace from "LIB_DIR/trace";
const PHONE_INPUT_ID = "phoneInput";

function cx(classNames) {
    if (typeof classNames === 'object') {
        return Object.keys(classNames).filter(function(className) {
            return classNames[className];
        }).join(' ');
    } else {
        return Array.prototype.join.call(arguments, ' ');
    }
}
var CRMAddForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getInitialState: function() {
        var formData = {
            name: "",//客户名称
            industry: [],//行业
            province: "",
            city: "",
            county: "",
            address: "",//详细地址
            administrative_level: "",//行政区划
            remarks: "",//备注
            contacts0_name: "",//联系人名称
            contacts0_position: "",//联系人职位
            contacts0_role: Intl.get("crm.115", "经办人"),//联系人角色
            contacts0_phone: ""//联系人电话
        };
        return {
            status: {
                name: {},//客户名称
                industry: {},//行业
                remarks: {},//备注
                contacts0_name: {},//联系人名称
                contacts0_position: {},//联系人职位
                contacts0_role: {},//联系人角色
                contacts0_phone: {}//联系人电话
            },
            isLoading: false,
            formData: formData,
            customerNameExist: false,//客户名是否已存在
            existCustomerList: [],//已存在的客户列表
            checkNameError: false,//客户名唯一性验证出错
            checkPhoneErrorMsg: "",//联系人电话验证提示信息
            isLoadingIndustry: false//是否正在加载行业列表
        };
    },
    componentDidMount: function() {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustry: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.pluck(list, "industry");
            }
            this.setState({isLoadingIndustry: false, industryList: list});
        });
    },
    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;
        var arr = item.split(".");
        if (arr[1]) {
            status = status.contacts[0];
            item = arr[1];
        }

        var classes = cx({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    //更新地址
    updateLocation: function(address) {
        var location = address.split('/');
        this.state.formData.province = location[0] || "";
        this.state.formData.city = location[1] || "";
        this.state.formData.county = location[2] || "";
        Trace.traceEvent($(this.getDOMNode()).find("form div .ant-form-item"), "选择地址");
    },

    //提交修改
    handleSubmit: function(e) {
        e.preventDefault();
        var validation = this.refs.validation;
        validation.validate(valid => {
            //验证电话是否通过验证
            this.phoneInputRef.props.form.validateFields([PHONE_INPUT_ID], {}, (errors, values) => {
                if (!valid || errors) {
                    return;
                } else {
                    //先填写电话后编辑客户名或行业等带验证的字段时，电话内容会丢失，这里再加一下
                    this.state.formData.contacts0_phone = values[PHONE_INPUT_ID].replace(/-/g, "");
                    //导入客户前先校验，是不是超过了本人的客户上限
                    let member_id = userData.getUserData().user_id;
                    CrmAction.getCustomerLimit({member_id: member_id,num: 1}, (result) => {
                        if (_.isNumber(result)){
                            if (result == 0){
                                //可以添加
                                this.addCustomer();
                            }else if(result > 0){
                                //不可以添加
                                message.warn(Intl.get("crm.should.add.customer", "您拥有的客户已达到上限，请不要再添加客户了"));
                            }
                        }
                    });
                }
            });
        });
    },

    //添加客户
    addCustomer: function() {
        this.state.isLoading = true;
        this.setState(this.state);
        var formData = JSON.parse(JSON.stringify(this.state.formData));
        formData.name = $.trim(formData.name);
        formData.contacts0_phone = $.trim(formData.contacts0_phone);
        //去除表单数据中值为空的项
        commonMethodUtil.removeEmptyItem(formData);
        CrmAction.addCustomer(formData, result => {
            this.state.isLoading = false;
            if (result.code == 0) {
                message.success(Intl.get("user.user.add.success", "添加成功"));
                if (_.isFunction(this.props.addOne)) {
                    this.props.addOne();
                }
                this.setState(this.getInitialState());
                //拨打电话时，若客户列表中没有此号码，需添加客户
                if (_.isFunction(this.props.updateCustomer)) {
                    this.props.updateCustomer(result.result);
                }
            } else {
                message.error(result);
                this.setState(this.state);
            }
        });
    },

    closeAddPanel: function() {
        this.setState(this.getInitialState());
        this.props.hideAddForm();
    },

    //根据客户名在地理信息接口获取该客户的信息并填充到对应字段
    autofillGeoInfo: function(customerName) {
        const route = _.find(routeList, route => route.handler === "getGeoInfo");

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
            this.state.formData.contacts0_phone = result.tel;

            this.setState(this.state);
        });
    },
    //根据客户名获取客户的行政级别并填充到对应字段上
    getAdministrativeLevelByName: function(customerName) {
        crmAjax.getAdministrativeLevel({name: customerName}).then(result => {
            if (_.isEmpty(result)) return;
            this.state.formData.administrative_level = crmUtil.filterAdministrativeLevel(result.level);
            this.setState({formData: this.state.formData});
        });
    },
    //客户名唯一性验证
    checkOnlyCustomerName: function(e) {
        var customerName = $.trim(this.state.formData.name);
        //满足验证条件后再进行唯一性验证
        if (customerName && nameRegex.test(customerName)) {
            Trace.traceEvent(e, "添加客户名称");
            CrmAction.checkOnlyCustomerName(customerName, (data) => {
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({customerNameExist: false, checkNameError: true});
                } else if (_.isObject(data)) {
                    if (data.result == "true") {
                        //不存在
                        this.setState({customerNameExist: false, checkNameError: false});
                    } else {
                        //已存在
                        this.setState({customerNameExist: true, checkNameError: false, existCustomerList: data.list});
                    }
                }
            });

            this.getAdministrativeLevelByName(customerName);
            //根据客户名查询地域、行业等信息并自动填充到相关字段
            this.autofillGeoInfo(customerName);
        } else {
            this.setState({customerNameExist: false, checkNameError: false});
        }
    },
    //客户名唯一性验证的提示信息
    renderCustomerNameMsg: function() {
        if (this.state.customerNameExist) {
            let name = this.state.formData.name;
            const list = _.clone(this.state.existCustomerList);
            const index = _.findIndex(list, item => item.name === name);
            const existSame = index > -1;
            let customer;
            if (existSame) customer = list.splice(index, 1)[0];
            else customer = list.shift();

            const curUserId = userData.getUserData().user_id;

            return (
                <div className="tip-customer-exist">
                    {Intl.get("call.record.customer", "客户")} {existSame ? Intl.get("crm.66", "已存在") : Intl.get("crm.67", "可能重复了")}，

                    {customer.user_id === curUserId ? (
                        <a href="javascript:void(0)"
                            onClick={this.props.showRightPanel.bind(this, customer.id)}>{customer.name}</a>
                    ) : (
                        <span>{customer.name} ({customer.user_name})</span>
                    )}

                    {list.length ? (
                        <div>
                            {Intl.get("crm.68", "相似的客户还有")}:
                            {list.map(customer => {
                                return (
                                    <div>
                                        {customer.user_id === curUserId ? (
                                            <div><a href="javascript:void(0)"
                                                onClick={this.props.showRightPanel.bind(this, customer.id)}>{customer.name}</a>
                                            </div>
                                        ) : (
                                            <div>{customer.name} ({customer.user_name})</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            );
        } else if (this.state.checkNameError) {
            return (
                <div className="check-only-error"><ReactIntl.FormattedMessage id="crm.69" defaultMessage="客户名唯一性校验出错"/>！
                </div>);
        } else {
            return "";
        }
    },
    //客户名格式验证
    checkCustomerName: function(rule, value, callback) {
        value = $.trim(value);
        if (value) {
            if (nameRegex.test(value)) {
                callback();
            } else {
                this.setState({customerNameExist: false, checkNameError: false});
                callback(new Error(Intl.get("crm.197", "客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间")));
            }
        } else {
            this.setState({customerNameExist: false, checkNameError: false});
            callback(new Error(Intl.get("crm.81", "请填写客户名称")));
        }
    },

    //获取联系人电话验证规则
    getPhoneInputValidateRules() {
        return [{
            validator: (rule, value, callback) => {
                value = $.trim(value);
                if (value) {
                    CrmAction.checkOnlyContactPhone(value, data => {
                        if (_.isString(data)) {
                            //唯一性验证出错了
                            callback(Intl.get("crm.82", "电话唯一性验证出错了"));
                        } else {
                            if (_.isObject(data) && data.result === "true") {
                                callback();
                            } else {
                                //已存在
                                callback(Intl.get("crm.83", "该电话已存在"));
                            }
                        }
                    });
                } else {
                    callback(Intl.get("crm.95", "请输入联系人电话"));
                }
            }
        }];
    },
    handleRemarkInput: function(e) {
        Trace.traceEvent(e, "添加备注");
    },
    handleSelect: function() {
        Trace.traceEvent($(this.getDOMNode()).find("form div .ant-form-item label[for='industry']").next("div"), "选择行业");
    },
    handleRoleSelect: function() {
        Trace.traceEvent($(this.getDOMNode()).find("form div .ant-form-item label[for='role']").next("div"), "选择角色");
    },
    getAdministrativeLevelOptions: function() {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>);
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
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
        //拨打电话弹屏后，再点击添加客户，自动将电话号码放入到添加客户的右侧面板内
        var initialValue = this.props.phoneNum || "";
        return (
            <RightPanel showFlag={true} data-tracename="添加客户">
                <RightPanelClose onClick={this.closeAddPanel} data-tracename="点击关闭添加客户面板"/>
                <div className="add-form-wrap">
                    <GeminiScrollbar>
                        <Form horizontal className="crm-add-form">
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                <FormItem
                                    label={Intl.get("crm.4", "客户名称")}
                                    id="crm-name"
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('name')}
                                    help={status.name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.name.errors && status.name.errors.join(','))}
                                >
                                    <Validator
                                        rules={[{validator: this.checkCustomerName}]}>
                                        <Input name="name" id="name"
                                            value={formData.name}
                                            onBlur={(e) => {
                                                this.checkOnlyCustomerName(e);
                                            }}
                                            onChange={this.setField.bind(this, 'name')}
                                        />
                                    </Validator>
                                </FormItem>
                                {this.renderCustomerNameMsg()}
                                <FormItem
                                    label={Intl.get("realm.industry", "行业")}
                                    id="industry"
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('industry')}
                                    help={status.industry.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.industry.errors && status.industry.errors.join(','))}
                                >
                                    {this.state.isLoadingIndustry ? (
                                        <div className="industry-list-loading"><ReactIntl.FormattedMessage id="crm.88"
                                            defaultMessage="正在获取行业列表"/><Icon
                                            type="loading"/></div>) : (
                                        <Validator
                                            rules={[{required: true, message: Intl.get("crm.22", "请选择行业")}]}>
                                            <Select showSearch placeholder={Intl.get("crm.22", "请选择行业")} name="industry"
                                                searchPlaceholder={Intl.get("crm.89", "输入行业进行搜索")}
                                                optionFilterProp="children"
                                                notFoundContent={!industryList.length ? Intl.get("crm.24", "暂无行业") : Intl.get("crm.23", "无相关行业")}
                                                onChange={this.setField.bind(this, 'industry')}
                                                value={formData.industry}
                                                onSelect={(e) => {
                                                    this.handleSelect(e);
                                                }}
                                            >
                                                {industryOptions}
                                            </Select>
                                        </Validator>)}
                                </FormItem >
                                <FormItem
                                    label={Intl.get("crm.administrative.level", "行政级别")}
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 18}}
                                >
                                    <Select placeholder={Intl.get("crm.administrative.level.placeholder", "请选择行政级别")}
                                        name="administrative_level"
                                        onChange={this.setField.bind(this, 'administrative_level')}
                                        value={formData.administrative_level}
                                    >
                                        {this.getAdministrativeLevelOptions()}
                                    </Select>
                                </FormItem >
                                <AntcAreaSelection labelCol="6" wrapperCol="18" width="420" label={Intl.get("crm.96", "地域")}
                                    placeholder={Intl.get("crm.address.placeholder", "请选择地域")}
                                    prov={formData.province} city={formData.city}
                                    county={formData.county} updateLocation={this.updateLocation}/>
                                <FormItem
                                    label={Intl.get("realm.address", "地址")}
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 18}}
                                >
                                    <Input name="address" value={formData.address}
                                        placeholder={Intl.get("crm.detail.address.placeholder", "请输入详细地址")}
                                        onChange={this.setField.bind(this, 'address')}
                                    />
                                </FormItem>
                                < FormItem
                                    label={Intl.get("common.remark", "备注")}
                                    id="remarks"
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('remarks')}
                                >
                                    <Input type="textarea" id="remarks" rows="3" value={formData.remarks}
                                        onChange={this.setField.bind(this, 'remarks')}
                                        onBlur={(e) => {
                                            this.handleRemarkInput(e);
                                        }}
                                    />
                                </FormItem>
                                <div className="crm-contact-title"
                                    style={{
                                        fontSize: '14px',
                                        textAlign: 'center',
                                        marginTop: '20px',
                                        marginBottom: '10px'
                                    }}>
                                    <ReactIntl.FormattedMessage id="call.record.contacts" defaultMessage="联系人"/>
                                </div>
                                <FormItem
                                    label={Intl.get("realm.change.owner.name", "姓名")}
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('contacts0_name')}
                                    help={status.contacts0_name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.contacts0_name.errors && status.contacts0_name.errors.join(','))}
                                >
                                    <Validator rules={[{
                                        required: false,
                                        min: 1,
                                        max: 50,
                                        message: Intl.get("crm.contact.name.length", "请输入最多50个字符的姓名")
                                    }]}>
                                        <Input name="contacts0_name" placeholder={Intl.get("crm.90", "请输入姓名")}
                                            value={formData.contacts0_name}
                                            onChange={this.setField.bind(this, 'contacts0_name')}
                                            data-tracename="填写联系人姓名"
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("crm.91", "职位")}
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('contacts0_position')}
                                    help={status.contacts0_position.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.contacts0_position.errors && status.contacts0_position.errors.join(','))}
                                >
                                    <Validator rules={[{required: false, min: 1, message: Intl.get("crm.92", "请输入联系人职位")}]}>
                                        <Input name="contacts0_position" placeholder={Intl.get("crm.92", "请输入联系人职位")}
                                            value={formData.contacts0_position}
                                            onChange={this.setField.bind(this, 'contacts0_position')}
                                            data-tracename="填写联系人职位"
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("user.apply.detail.table.role", "角色")}
                                    labelCol={{span: 6}}
                                    id="role"
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('contacts0_role')}
                                    help={status.contacts0_role.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.contacts0_role.errors && status.contacts0_role.errors.join(','))}
                                >
                                    <Validator rules={[{required: true, min: 1, message: Intl.get("crm.93", "请输入联系人角色")}]}>
                                        <Select name="contacts0_role" placeholder={Intl.get("crm.94", "请输入角色")}
                                            value={this.state.formData.contacts0_role}
                                            onChange={this.setField.bind(this, 'contacts0_role')}
                                            onSelect={this.handleRoleSelect}
                                        >
                                            {roleOptions}
                                        </Select>
                                    </Validator>
                                </FormItem>
                                <PhoneInput
                                    wrappedComponentRef={(inst) => this.phoneInputRef = inst}
                                    placeholder={Intl.get("crm.95", "请输入联系人电话")}
                                    validateRules={this.getPhoneInputValidateRules()}
                                    onChange={this.setField.bind(this, 'contacts0_phone')}
                                    initialValue={initialValue}
                                    id={PHONE_INPUT_ID}
                                />

                                <FormItem
                                    wrapperCol={{span: 24}}>
                                    <RightPanelCancel onClick={this.closeAddPanel} data-tracename="点击取消添加客户信息按钮">
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit} disabled={this.state.isLoading}
                                        data-tracename="点击保存添加客户信息按钮">
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                    </RightPanelSubmit>
                                </FormItem>
                            </Validation>
                        </Form>
                        {
                            this.state.isLoading ?
                                (<Spinner className="isloading crm-add-form-loading"/>) :
                                (null)
                        }
                    </GeminiScrollbar>
                </div>
            </RightPanel>

        );
    }
});
module.exports = CRMAddForm;
