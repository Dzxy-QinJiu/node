const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * Created by wangliping on 2017/8/23.
 * 添加销售线索面板
 */
import { Form, Input, Select, message, DatePicker} from "antd";
const FormItem = Form.Item;
import {RightPanel, RightPanelSubmit, RightPanelCancel, RightPanelClose} from "CMP_DIR/rightPanel";
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
import FieldMixin  from 'CMP_DIR/antd-form-fieldmixin';
import AlertTimer from "CMP_DIR/alert-timer";
import Spinner from "CMP_DIR/spinner";
import PhoneInput from "CMP_DIR/phone-input";
import {nameRegex} from "PUB_DIR/sources/utils/consts";
import ajax from "../../../crm/common/ajax";
const routes = require("../../../crm/common/route");
import {checkCustomerName,checkEmail} from "../utils/clue-customer-utils";
import AssignClueAndSelectCustomer from "./assign-clue-and-select-customer";
var clueCustomerAction = require("../action/clue-customer-action");
const PHONE_INPUT_ID = "phoneInput";
const SalesClueAddForm = React.createClass({
    mixins: [FieldMixin],
    getInitialState: function () {
        const today = moment().format("YYYY-MM-DD");
        var defalutData = this.props.defaultClueData ? this.props.defaultClueData : {};
        return {
            status: {
                name: {},//客户名称
                contact_name: {},//联系人
                phone: {},//联系电话
                email: {},//邮箱
                qq: {},//QQ
                clue_source: {},//线索来源
                access_channel: {},//接入渠道
                source: {},//线索描述
                source_time: {}//线索时间
            },
            formData: {
                name: defalutData.name ||  "",//客户名称
                contact_name: defalutData.name ||  "",//联系人
                phone: defalutData.phone || "",//联系电话
                email: defalutData.email || "",//邮箱
                qq: defalutData.qq || "",//QQ
                clue_source: defalutData.clue_source || "",//线索来源
                access_channel: defalutData.access_channel || "",//接入渠道
                source: "",//线索描述
                source_time: today,//线索时间，默认：今天
                province: "",
                city: "",
                county: "",
                location: "",
                address: "",//详细地址
                administrative_level: ""//行政区划
            },
            isSaving: false,
            saveMsg: "",
            saveResult: "",
            isShowAssignAndRelate: false,//是否展示分配给某个销售或者关联客户的面板
            newAddClue: {},//新增加的线索
            clueNameExist: false,//线索名称是否存在
            clueCustomerCheckErrMsg:""//线索名称校验失败
        };
    },
    //验证客户名是否重复
    checkOnlyClueCustomerName(){
        let customerName = $.trim(this.state.formData.name);
        //满足验证条件后再进行唯一性验证
        if (customerName && nameRegex.test(customerName)) {
            clueCustomerAction.checkOnlyClueName(customerName, (data)=>{
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({
                        clueNameExist: false,
                        clueCustomerCheckErrMsg: data
                    });
                } else {
                    if (_.isObject(data) && data.result == "true") {
                        this.setState({
                            clueNameExist: false,
                            clueCustomerCheckErrMsg: ''
                        });
                    } else {
                        //已存在
                        this.setState({
                            clueNameExist: true,
                            clueCustomerCheckErrMsg: ''
                        });
                    }
                }

            });
        }
    },
    renderCheckClueNameMsg: function () {
        if (this.state.clueNameExist) {
            return (<div className="clue-name-repeat">{Intl.get("clue.customer.check.repeat", "该线索名称已存在")}</div>);
        } else if (this.state.clueCustomerCheckErrMsg) {
            return (<div className="clue-name-errmsg">{Intl.get("clue.customer.check.only.exist", "线索名称唯一性校验失败")}</div>);
        } else {
            return "";
        }
    },
    getSubmitObj(){
        let formData = this.state.formData;
        let submitObj = {
            name: formData.name,
            clue_source: formData.clue_source,
            access_channel: formData.access_channel,
            source: formData.source,
            source_time: new Date(formData.source_time).getTime(),
            province: formData.province,
            city: formData.city,
            county: formData.county,
            location: formData.location,
            address: formData.address,
            administrative_level: formData.administrative_level
        };
        //生成线索客户的用户的id
        if (this.props.appUserId){
            submitObj.app_user_id = this.props.appUserId;
        }
        //联系人及联系方式的处理
        let contact = {def_contancts: "true"};
        if (formData.contact_name) {
            contact.name = formData.contact_name;
        }
        if (formData.phone) {
            contact.phone = [$.trim(formData.phone)];
        }
        if (formData.email) {
            contact.email = [$.trim(formData.email)];
        }
        if (formData.qq) {
            contact.qq = [$.trim(formData.qq)];
        }
        submitObj.contacts = [contact];
        return submitObj;
    },
    handleSubmit () {
        if (this.state.isSaving) {
            return;
        }
        var validation = this.refs.validation;
        validation.validate(valid => {
            //验证电话是否通过验证
            this.phoneInputRef.props.form.validateFields({force: true}, (errors, values) => {
                if (this.state.clueNameExist || this.state.clueCustomerCheckErrMsg) {
                    valid = false;
                }
                if (!valid || errors) {
                    return;
                } else {
                    let submitObj = this.getSubmitObj();
                    let addRoute = _.find(routes, (route) => route.handler == "addSalesClue");
                    this.setState({isSaving: true, saveMsg: "", saveResult: ""});
                    ajax({
                        url: addRoute.path,
                        type: addRoute.method,
                        data: submitObj
                    }).then(data => {
                        if (_.isObject(data) && data.code == 0) {
                            //添加成功
                            this.setResultData(Intl.get("user.user.add.success", "添加成功"), "success");
                            this.setState({
                                newAddClue: data.result
                            });
                            clueCustomerAction.afterAddSalesClue(data.result);
                            //如果线索来源或者接入渠道,线索类型加入新的类型
                            if (submitObj.clue_source && !_.contains(this.props.clueSourceArray,submitObj.clue_source)){
                                _.isFunction(this.props.updateClueSource) && this.props.updateClueSource(submitObj.clue_source);
                            }
                            if (submitObj.access_channel && !_.contains(this.props.accessChannelArray,submitObj.access_channel)){
                                _.isFunction(this.props.updateClueChannel) && this.props.updateClueChannel(submitObj.access_channel);
                            }
                            if (submitObj.clue_classify && !_.contains(this.props.clueClassifyArray,submitObj.clue_classify)){
                                _.isFunction(this.props.updateClueClassify) && this.props.updateClueClassify(submitObj.clue_classify);
                            }
                            //线索客户添加成功后的回调
                            _.isFunction(this.props.afterAddSalesClue) && this.props.afterAddSalesClue();
                        } else {
                            this.setResultData(Intl.get("crm.154", "添加失败"), "error");
                        }
                    }, errorMsg => {
                        //添加失败
                        this.setResultData(errorMsg || Intl.get("crm.154", "添加失败"), "error");
                    });
                }
            });
        });
    },
    //保存结果的处理
    setResultData(saveMsg, saveResult){
        this.setState({
            isSaving: false,
            saveMsg: saveMsg,
            saveResult: saveResult
        });
    },
    //去掉保存后提示信息
    hideSaveTooltip: function () {
        if (this.state.saveResult == "success") {
            this.setState({
                isShowAssignAndRelate: true
            });
        } else {
            this.setState({
                saveMsg: "",
                saveResult: ""
            });
        }
    },
    //关闭添加销售线索面板
    closeAddPanel () {
        this.setState(this.getInitialState());
        this.props.hideAddForm();
    },
    //电话必填一项及唯一性的验证
    getPhoneInputValidateRules: function () {
        return [{
            validator: (rule, value, callback) => {
                value = $.trim(value);
                if (value) {
                    clueCustomerAction.checkOnlyContactPhone(value, data => {
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
                } else {
                    if (!this.state.formData.qq && !this.state.formData.email) {
                        callback(new Error(Intl.get("crm.clue.require.one", "电话、邮箱、QQ必填一项")));
                    } else {
                        callback();
                    }
                }
            }
        }];
    },
    // 设置传入的值并触发手机验证
    setNeedPhoneValidateValue (field, e) {
        const newFormData = _.clone(this.state.formData);
        newFormData[field] = $.trim(e.target.value);
        this.setState({
            formData: newFormData
        }, () => {
            this.phoneInputRef.props.form.validateFields({force: true});
        });
    },
    renderAssignAndRelate(){
        return (
            <div className="assign-and-relate-wrap">
                <AssignClueAndSelectCustomer
                    curClueDetail={this.state.newAddClue}
                />
            </div>
        );
    },
    renderAddForm(){
        let formData = this.state.formData;
        let status = this.state.status;
        let saveResult = this.state.saveResult;
        return (
            <div className="add-form-wrap">
                <GeminiScrollbar>
                    <Form horizontal className="crm-add-form sales-clue-form">
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                label={Intl.get("clue.customer.clue.name", "线索名称")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('name')}
                                help={status.name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.name.errors && status.name.errors.join(','))}
                            >
                                <Validator rules={[{validator: checkCustomerName}]}>
                                    <Input name="name"
                                           className={this.state.clueNameExist||this.state.clueCustomerCheckErrMsg?"input-red-border":""}
                                           placeholder={Intl.get("clue.customer.fillin.clue.name", "请填写线索名称")}
                                           value={formData.name}
                                           onBlur={this.checkOnlyClueCustomerName}
                                           onChange={this.setField.bind(this, 'name')}
                                    />
                                </Validator>
                            </FormItem>
                            {this.renderCheckClueNameMsg()}
                            <FormItem
                                label={Intl.get("call.record.contacts", "联系人")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Input name="contact_name" placeholder={Intl.get("crm.90", "请输入姓名")}
                                       value={formData.contact_name}
                                       onChange={this.setField.bind(this, 'contact_name')}
                                />
                            </FormItem>

                            <PhoneInput
                                wrappedComponentRef={(inst) => this.phoneInputRef = inst}
                                placeholder={Intl.get("crm.95", "请输入联系人电话")}
                                validateRules={this.getPhoneInputValidateRules()}
                                onChange={this.setField.bind(this, 'phone')}
                                initialValue={formData.phone}
                                id={PHONE_INPUT_ID}
                            />

                            <FormItem
                                label={Intl.get("common.email", "邮箱")}
                                id="email"
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('email')}
                                help={status.email.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.email.errors && status.email.errors.join(','))}
                            >
                                <Validator rules={[{validator: checkEmail}]}>
                                    <Input name="email" value={formData.email}
                                           placeholder={Intl.get("member.input.email", "请输入邮箱")}
                                           onChange={this.setNeedPhoneValidateValue.bind(this, 'email')}
                                    />
                                </Validator>
                            </FormItem>
                            <FormItem
                                label="QQ"
                                id="qq"
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Input name="qq" id="qq" type="text" value={formData.qq}
                                       placeholder={Intl.get("member.input.qq", "请输入QQ号")}
                                       onChange={this.setNeedPhoneValidateValue.bind(this, 'qq')}
                                />
                            </FormItem>

                            <FormItem
                                className="form-item-label"
                                label={Intl.get("crm.sales.clue.source", "线索来源")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Select combobox
                                        filterOption={false}
                                        searchPlaceholder={Intl.get("crm.clue.source.placeholder", "请选择或输入线索来源")}
                                        name="clue_source"
                                        onChange={this.setField.bind(this, 'clue_source')}
                                        value={formData.clue_source}
                                >
                                    {
                                        _.isArray(this.props.clueSourceArray) ?
                                            this.props.clueSourceArray.map((source, idx) => {
                                                return (<Option key={idx} value={source}>{source}</Option>);
                                            }) : null
                                    }
                                </Select>
                            </FormItem>

                            <FormItem
                                className="form-item-label"
                                label={Intl.get("crm.sales.clue.access.channel", "接入渠道")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Select combobox
                                        filterOption={false}
                                        searchPlaceholder={Intl.get("crm.access.channel.placeholder", "请选择或输入接入渠道")}
                                        name="access_channel"
                                        onChange={this.setField.bind(this, 'access_channel')}
                                        value={formData.access_channel}
                                >
                                    {_.isArray(this.props.accessChannelArray) ?
                                        this.props.accessChannelArray.map((source, idx) => {
                                            return (<Option key={idx} value={source}>{source}</Option>);
                                        }) : null
                                    }
                                </Select>
                            </FormItem>
                            <FormItem
                                className="form-item-label"
                                label={Intl.get("clue.customer.classify","线索分类")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Select combobox
                                        filterOption={false}
                                        searchPlaceholder={Intl.get("crm.clue.classify.placeholder", "请选择或输入线索分类")}
                                        name="access_channel"
                                        onChange={this.setField.bind(this, 'clue_classify')}
                                        value={formData.clue_classify}
                                >
                                    {_.isArray(this.props.clueClassifyArray) ?
                                        this.props.clueClassifyArray.map((source, idx) => {
                                            return (<Option key={idx} value={source}>{source}</Option>);
                                        }) : null
                                    }
                                </Select>
                            </FormItem>
                            <FormItem
                                label={Intl.get("crm.sales.clue.descr", "线索描述")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Input type="textarea" id="source" rows="3" value={formData.source}
                                       onChange={this.setField.bind(this, 'source')}
                                />

                            </FormItem>
                            <FormItem
                                className="form-item-label"
                                label={Intl.get("crm.sales.clue.time", "线索时间")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 10}}
                            >
                                <DatePicker value={moment(formData.source_time)}
                                            onChange={this.setField.bind(this, 'source_time')}
                                            allowClear={false}
                                />
                            </FormItem>
                            <FormItem wrapperCol={{span: 24}}>
                                <div className="indicator">
                                    {saveResult ?
                                        (
                                            <AlertTimer time={saveResult == "error" ? 3000 : 600}
                                                        message={this.state.saveMsg}
                                                        type={saveResult} showIcon
                                                        onHide={this.hideSaveTooltip}/>
                                        ) : ""
                                    }
                                </div>
                                <RightPanelCancel onClick={this.closeAddPanel} data-tracename="点击取消添加销售线索按钮">
                                    {Intl.get("common.cancel", "取消")}
                                </RightPanelCancel>
                                <RightPanelSubmit onClick={this.handleSubmit} disabled={this.state.isLoading}
                                                  data-tracename="点击保存添加销售线索按钮">
                                    {Intl.get("common.save", "保存")}
                                </RightPanelSubmit>
                            </FormItem>
                        </Validation>
                    </Form>
                </GeminiScrollbar>
                {this.state.isSaving ? (<div className="right-pannel-block">
                    <Spinner className="right-panel-saving"/>
                </div>) : ""}
            </div>
        );
    },

    render() {
        return (
            <RightPanel showFlag={true} data-tracename="添加线索客户" className="sales-clue-add-container">
                <RightPanelClose onClick={this.closeAddPanel} data-tracename="点击关闭添加销售线索面板"/>
                {this.state.isShowAssignAndRelate ? this.renderAssignAndRelate() : this.renderAddForm()}
            </RightPanel>
        );
    }
});
export default SalesClueAddForm;