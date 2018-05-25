/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/9/8.
 */
import {Icon, Form, Input, Select, message, Button, Tag} from "antd";
const CheckableTag = Tag.CheckableTag;
const GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var crmAjax = require("MOD_DIR/crm/public/ajax/index");
var CrmAction = require("MOD_DIR/crm/public/action/crm-actions");
var ContactUtil = require("MOD_DIR/crm/public/utils/contact-util");
import {nameRegex} from "PUB_DIR/sources/utils/consts";
var crmUtil = require("MOD_DIR/crm/public/utils/crm-util");
import {isClueTag, isTurnOutTag} from "MOD_DIR/crm/public/utils/crm-util";
var FormItem = Form.Item;
var Option = Select.Option;
var batchChangeAction = require("MOD_DIR/crm/public/action/batch-change-actions");
require("./index.less");
import PhoneInput from "CMP_DIR/phone-input";
import {AntcAreaSelection} from "antc";
const userData = require("PUB_DIR/sources/user-data");
const noop = function () {
};
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import routeList from "../../modules/common/route";
import ajax from "../../modules/common/ajax";
const PHONE_INPUT_ID = "phoneInput";
class AddCustomerForm extends React.Component {
    constructor(props) {
        super(props);
        var formData = {
            name: "",//客户名称
            industry: [],//行业
            province: "",
            city: "",
            county: "",
            address: "",//详细地址
            location: "",//经纬度
            administrative_level: "",//行政区划 默认是企业，是4
            remarks: "",//备注
            contacts0_name: "",//联系人名称
            contacts0_position: "",//联系人职位
            contacts0_department: "",//联系人部门
            contacts0_role: Intl.get("crm.115", "经办人"),//联系人角色
            contacts0_phone: "",//联系人电话
            labels: []//选中的标签
        };
        this.state = {
            isLoading: false,//正在提交
            formData: formData,
            customerNameExist: false,//客户名是否已存在
            existCustomerList: [],//已存在的客户列表
            checkNameError: false,//客户名唯一性验证出错
            checkPhoneErrorMsg: "",//联系人电话验证提示信息
            isLoadingIndustry: false,//是否正在加载行业列表
            isLoadingTagLists: false,//是否正在加载
            formLayout: 'horizontal',//表单的布局方式
        };
    }

    componentDidMount = () => {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustry: true, isLoadingTagLists: true});
        this.getIndustries();
        this.getRecommendTags();
        $(window).on('resize', this.onWindowResize);

    };
    onWindowResize = () => {
        this.setState(this.state);
    };
    componentWillUnmount = () => {
        $('body').css({
            'overflow-x': 'visible',
            'overflow-y': 'visible'
        });
        $(window).off('resize', this.onWindowResize);
    };
    //获取行业
    getIndustries = () => {
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.pluck(list, "industry");
            }
            this.setState({isLoadingIndustry: false, industryList: list});
        });
    };
    //获取推荐的标签
    getRecommendTags = () => {
        //获取推荐的标签列表
        batchChangeAction.getRecommendTags(result => {
            let list = _.isArray(result) ? result : [];
            list = _.filter(list, (item) => {
                return item !== Intl.get("crm.sales.clue", "线索") && item != Intl.get("crm.qualified.roll.out", "转出");
            });
            this.setState({isLoadingTagLists: false, tagList: list});
        });
    };

    //客户名格式验证
    checkCustomerName = (rule, value, callback) => {
        value = $.trim(value);
        if (value) {
            if (nameRegex.test(value)) {
                callback();
            } else {
                this.setState({customerNameExist: false, checkNameError: false});
                callback(Intl.get("crm.197", "客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间"));
            }
        } else {
            this.setState({customerNameExist: false, checkNameError: false});
            callback();
        }
    };
    //根据客户名获取客户的行政级别并填充到对应字段上
    getAdministrativeLevelByName = (customerName) => {
        crmAjax.getAdministrativeLevel({name: customerName}).then(result => {
            if (_.isEmpty(result)) return;
            this.state.formData.administrative_level = result.level > 0 ? result.level + '' : "";
            this.setState({formData: this.state.formData});
        });
    };
    //客户名唯一性验证
    checkOnlyCustomerName = () => {
        var customerName = this.props.form.getFieldValue('name');
        //满足验证条件后再进行唯一性验证
        if (customerName && nameRegex.test(customerName)) {
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
    };
    //根据客户名在地理信息接口获取该客户的信息并填充到对应字段
    autofillGeoInfo = (customerName) => {
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
            this.setState({formData: this.state.formData});
        });
    };
    closeAddPanel = (e) => {
        this.props.hideAddForm();
        this.constructor();
    };
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                for (var key in this.state.formData) {
                    if (!values[key]) {
                        values[key] = this.state.formData[key];
                    }
                }
                values.name = $.trim(values.name);
                //去除表单数据中值为空的项
                commonMethodUtil.removeEmptyItem(values);
                //默认值是一个数组
                if (_.isArray(values.contacts0_role) && values.contacts0_role.length) {
                    values.contacts0_role = values.contacts0_role[0];
                }
                //验证电话是否通过验证
                this.phoneInputRef.props.form.validateFields([PHONE_INPUT_ID], {}, (errors, phoneVal) => {
                    if (errors) {
                        return;
                    } else {
                        //验证电话通过后，再把电话的值放在values中
                        values.contacts0_phone = $.trim(phoneVal[PHONE_INPUT_ID].replace(/-/g, ""));
                        this.addCustomer(values);
                    }
                });
            }
        });
    };
    //添加客户
    addCustomer = (values) => {
        this.setState({
            isLoading: true
        });
        CrmAction.addCustomer(values, result => {
            this.setState({
                isLoading: false
            });
            if (result.code == 0) {
                message.success(Intl.get("user.user.add.success", "添加成功"));
                if (_.isFunction(this.props.addOne)) {
                    this.props.addOne();
                }
                //拨打电话时，若客户列表中没有此号码，需添加客户
                if (_.isFunction(this.props.updateCustomer)) {
                    this.props.updateCustomer(result.result);
                }
                this.constructor();
            } else {
                message.error(result);
            }
        });
    };
    //客户名唯一性验证的提示信息
    renderCustomerNameMsg = () => {
        if (this.state.customerNameExist) {
            const form = this.props.form;
            let name = form.getFieldValue('name');
            const list = _.clone(this.state.existCustomerList);
            const index = _.findIndex(list, item => item.name === name);
            const existSame = index > -1;
            let customer;
            if (existSame) customer = list.splice(index, 1)[0];
            else customer = list.shift();
            var curUserId = "";
            if (userData.getUserData()) {
                curUserId = userData.getUserData().user_id;
            }
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
                                            <div>
                                                <a href="javascript:void(0)"
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
    };
    checkOnlyContactPhone = (rule, value, callback) => {
        CrmAction.checkOnlyContactPhone(value, data => {
            if (_.isString(data)) {
                //唯一性验证出错了
                callback(Intl.get("crm.82", "电话唯一性验证出错了"));
            } else {
                if (_.isObject(data) && data.result == "true") {
                    callback();
                } else {
                    //已存在
                    callback(Intl.get("crm.83", "该电话已存在"));
                }
            }
        });
    };
    getPhoneInputValidateRules = () => {
        return [{
            validator: (rule, value, callback) => {
                this.checkOnlyContactPhone(rule, value, callback);
            }
        }];
    };
    //更新地址
    updateLocation = (address) => {
        var location = address.split('/');
        this.state.formData.province = location[0] || "";
        this.state.formData.city = location[1] || "";
        this.state.formData.county = location[2] || "";
    };
    //选择不同的级别
    handleChangeAdminLevel = (index) => {
        //如果点击原来选中的级别，会取消选中
        if (index == this.state.formData.administrative_level) {
            this.state.formData.administrative_level = "";
        } else {
            this.state.formData.administrative_level = index;
        }
        this.setState({formData: this.state.formData});
    };
    setPhoneValue = (obj) => {
        this.state.formData.contacts0_phone = obj.target.value;
        this.setState({
            formData: this.state.formData
        });
    };
    handleChangeSeletedTag = (tag, isAdd) => {
        //不可以操作'线索'、'转出'标签
        if (isClueTag(tag) || isTurnOutTag(tag)) {
            return;
        }
        var tagIndex = _.indexOf(this.state.formData.labels, tag);
        if (tagIndex > -1) {
            if (isAdd) return;
            this.state.formData.labels.splice(tagIndex, 1);
        } else {
            this.state.formData.labels.push(tag);
            if (this.state.tagList.indexOf(tag) === -1) {
                this.state.tagList.push(tag);
            }
        }
        this.setState({
            formData: this.state.formData,
            tagList: this.state.tagList
        });
    };
    //按enter键添加标签
    addTag = (e) => {
        e.preventDefault();
        if (e.keyCode !== 13) return;
        const tag = e.target.value.trim();
        if (!tag) return;
        //”线索“、”转出“标签”不可以添加
        if (isClueTag(tag) || isTurnOutTag(tag)) {
            message.error(Intl.get("crm.sales.clue.add.disable", "不能手动添加'{label}'标签", {label: tag}));
            return;
        }
        this.handleChangeSeletedTag(tag, true);
        //清空输入框
        this.refs.newTag.refs.input.value = "";
    };
    renderAdminLevel = () => {
        return (
            <div>
                {
                    crmUtil.administrativeLevels.map((obj) => {
                        if (obj.id == this.state.formData.administrative_level) {
                            return (
                                <button className="selected-adm" key={obj.id} value={obj.id}
                                        onClick={this.handleChangeAdminLevel.bind(this, obj.id)}>{obj.level}</button>);
                        } else {
                            return (
                                <button key={obj.id} value={obj.id}
                                        onClick={this.handleChangeAdminLevel.bind(this, obj.id)}>{obj.level}</button>);
                        }

                    })
                }
            </div>
        );

    };
    render = () => {
        const {getFieldDecorator} = this.props.form;
        const formLayout = this.state.formLayout;
        var formData = this.state.formData;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const formItemXsLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
        };
        let industryList = this.state.industryList || [];
        //行业下拉列表
        var industryOptions = industryList.map(function (industry, index) {
            return (<Option key={index} value={industry}>{industry}</Option>);
        });
        //角色下拉列表
        var roleOptions = ContactUtil.roleArray.map(function (role, index) {
            return (<Option value={role} key={index}>{role}</Option>);
        });
        //拨打电话弹屏后，再点击添加客户，自动将电话号码放入到添加客户的右侧面板内
        var initialValue = this.props.phoneNum || "";
        var fixedHeight = $(window).height() - this.props.scrollLayOut;
        return (
            <div id="add-customer-form-container" style={{height: fixedHeight}} data-tracename="增加客户页面">
                <GeminiScrollbar>
                    <div className="scroll-bar-inner">
                        <h4>+{Intl.get("sales.home.customer", "客户")}</h4>
                        <div className="add-customer-info-container">
                            <Form layout="horizontal" className="add-customer-form">
                                <div className="add-customer-info">
                                    <h5>{Intl.get("user.basic.info", "基本资料")}</h5>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get("crm.41", "客户名")}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('name', {
                                            rules: [{
                                                required: true,
                                                message: Intl.get("crm.81", "请填写客户名称")
                                            }, {validator: this.checkCustomerName,}],
                                            initialValue: formData.name
                                        })(
                                            <Input
                                                name="name"
                                                id="name"
                                                onBlur={() => {
                                                    this.checkOnlyCustomerName();
                                                }}
                                            />
                                        )}
                                    </FormItem>
                                    {this.renderCustomerNameMsg()}
                                    <FormItem
                                        label={Intl.get("realm.industry", "行业")}
                                        id="industry"
                                        {...formItemLayout}
                                    >
                                        {this.state.isLoadingIndustry ? (
                                            <div className="industry-list-loading">
                                                <ReactIntl.FormattedMessage id="crm.88" defaultMessage="正在获取行业列表"/>
                                                <Icon type="loading"/>
                                            </div>) : (
                                            getFieldDecorator('industry', {
                                                rules: [{required: true, message: Intl.get("crm.22", "请选择行业")}],
                                            })(
                                                <Select
                                                    showSearch
                                                    placeholder={Intl.get("crm.22", "请选择行业")}
                                                    name="industry"
                                                    searchPlaceholder={Intl.get("crm.89", "输入行业进行搜索")}
                                                    optionFilterProp="children"
                                                    notFoundContent={!industryList.length ? Intl.get("crm.24", "暂无行业") : Intl.get("crm.23", "无相关行业")}
                                                >
                                                    {industryOptions}
                                                </Select>
                                            ))}
                                    </FormItem>
                                    <div id="area-container">
                                        <AntcAreaSelection
                                            labelCol="7"
                                            wrapperCol="17"
                                            label={Intl.get("realm.address", "地址")}
                                            placeholder={Intl.get("crm.address.placeholder", "请选择地域")}
                                            prov={formData.province}
                                            city={formData.city}
                                            county={formData.county}
                                            updateLocation={this.updateLocation}
                                        />
                                    </div>
                                    <FormItem
                                        wrapperCol={{span: 24}}
                                        id="detail_address"
                                    >
                                        {getFieldDecorator('address', {
                                            initialValue: formData.address
                                        })(
                                            <Input name="address"
                                                   placeholder={Intl.get("crm.detail.address.placeholder", "请输入详细地址")}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        id="tag"
                                        label={Intl.get("common.tag", "标签")}
                                        {...formItemLayout}
                                    >
                                        <Input
                                            name="tag"
                                            placeholder={Intl.get("crm.28", "按Enter键添加新标签")}
                                            ref="newTag"
                                            onKeyUp={this.addTag}
                                        />
                                    </FormItem>
                                    {this.state.isLoadingTagLists ? (
                                        <div className="industry-list-loading">
                                            <ReactIntl.FormattedMessage id="call.record.getting.tag.lists"
                                                                        defaultMessage="正在获取标签列表"/>
                                            <Icon type="loading"/>
                                        </div>) : (<div id="taglists-container">
                                        <div className="tag-list">
                                            {_.map(this.state.tagList, (tag) => {
                                                return (
                                                    <CheckableTag
                                                        key={tag}
                                                        checked={this.state.formData.labels.indexOf(tag) > -1}
                                                        onChange={() => this.handleChangeSeletedTag(tag)}
                                                    >
                                                        {tag}
                                                    </CheckableTag>
                                                );
                                            })}
                                        </div>
                                    </div>)}
                                    <FormItem
                                        label={Intl.get("common.remark", "备注")}
                                        id="remarks"
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('remarks')(
                                            <Input
                                                type="textarea" id="remarks" rows="3"
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get("crm.administrative.level", "行政级别")}
                                        {...formItemLayout}
                                        id="crm-admin-level"
                                    >
                                        {this.renderAdminLevel()}
                                    </FormItem >
                                </div>
                                <div className="add-customer-contact">
                                    <h5>
                                        {Intl.get("call.record.contacts", "联系人")}
                                    </h5>
                                    <FormItem
                                        label={Intl.get("call.record.contacts", "联系人")}
                                        labelCol={{span: 8}}
                                        wrapperCol={{span: 16}}
                                    >
                                        {getFieldDecorator('contacts0_name', {rules: [{required: false}]})(
                                            <Input
                                                name="contacts0_name"
                                                placeholder={Intl.get("realm.change.owner.name", "姓名")}
                                                data-tracename="填写联系人姓名"
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        wrapperCol={{span: 24}}
                                        id="contacts0_department"
                                    >
                                        {getFieldDecorator('contacts0_department', {rules: [{required: false}]})(
                                            <Input name="contacts0_department"
                                                   placeholder={Intl.get("operation.report.department", "部门",)}
                                                   data-tracename="填写联系人部门"/>)}
                                    </FormItem>
                                    <FormItem
                                        wrapperCol={{span: 24}}
                                        id="contacts0_position"
                                    >
                                        {getFieldDecorator('contacts0_position', {rules: [{required: false}]})(
                                            <Input name="contacts0_position"
                                                   placeholder={Intl.get("crm.91", "职位")}
                                                   data-tracename="填写联系人职位"/>)}
                                    </FormItem>
                                    <FormItem
                                        id="role"
                                        wrapperCol={{span: 24}}
                                    >
                                        {getFieldDecorator('contacts0_role',
                                            {
                                                rules: [{required: true, message: Intl.get("crm.93", "请输入联系人角色")}],
                                                initialValue: [ContactUtil.roleArray.length ? ContactUtil.roleArray[0] : ""]
                                            })(
                                            <Select
                                                name="contacts0_role"
                                            >
                                                {roleOptions}
                                            </Select>)}
                                    </FormItem>
                                    <FormItem
                                        wrapperCol={{span: 24}}
                                    >
                                        <PhoneInput
                                            wrappedComponentRef={(inst) => this.phoneInputRef = inst}
                                            placeholder={Intl.get("crm.95", "请输入联系人电话")}
                                            validateRules={this.getPhoneInputValidateRules()}
                                            initialValue={initialValue}
                                            onChange={this.setPhoneValue}
                                            id={PHONE_INPUT_ID}
                                        />

                                    </FormItem>
                                </div>
                                <div className="submit-button-container">
                                    <FormItem
                                        wrapperCol={{span: 24}}>
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                                disabled={this.state.isLoading} data-tracename="点击保存添加客户信息按钮">
                                            <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                            {this.state.isLoading ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.closeAddPanel}
                                                data-tracename="点击取消添加客户信息按钮">
                                            <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                        </Button>
                                    </FormItem>
                                </div>
                            </Form>
                        </div>
                    </div>
                </GeminiScrollbar>
            </div>
        );
    }
}
AddCustomerForm.defaultProps = {
    phoneNum: "",
    hideAddForm: noop,
    updateCustomer: noop,
    showRightPanel: noop,
    scrollLayOut: ""
};
export default Form.create()(AddCustomerForm);
