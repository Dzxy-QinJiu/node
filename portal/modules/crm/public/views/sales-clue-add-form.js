/**
 * Created by wangliping on 2017/8/23.
 * 添加销售线索面板
 */
import {Icon,Form,Input,Select,message,Validation,DatePicker}from "antd";
import {RightPanel, RightPanelSubmit, RightPanelCancel, RightPanelClose} from "CMP_DIR/rightPanel";
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
import PhoneInput from "CMP_DIR/phone-input";
import FieldMixin  from 'CMP_DIR/antd-form-fieldmixin';
import AlertTimer from "CMP_DIR/alert-timer";
import Spinner from "CMP_DIR/spinner";
import Trace from "LIB_DIR/trace";
import userData from "PUB_DIR/sources/user-data";
import ValidateUtil from "../utils/validate-util";
import ajax from "../../common/ajax";
const routes = require("../../common/route");
var CrmAction = require("../action/crm-actions");
const FormItem = Form.Item, Option = Select.Option, Validator = Validation.Validator;
const clueSourceArray = [Intl.get("crm.sales.clue.baidu", "百度搜索"), Intl.get("crm.sales.clue.weibo", "微博推广"), Intl.get("crm.sales.clue.customer.recommend", "客户推荐")];//线索来源
const accessChannelArray = [Intl.get("crm.sales.clue.phone", "400电话"), Intl.get("crm.sales.clue.qq", "营销QQ")];//接入渠道
const SalesClueAddForm = React.createClass({
    mixins: [FieldMixin],
    getInitialState: function () {
        const today = moment().format("YYYY-MM-DD");
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
                name: "",//客户名称
                contact_name: "",//联系人
                phone: "",//联系电话
                email: "",//邮箱
                qq: "",//QQ
                clue_source: "",//线索来源
                access_channel: "",//接入渠道
                source: "",//线索描述
                source_time: today//线索时间，默认：今天
            },
            isSaving: false,
            saveMsg: "",
            saveResult: ""
        };
    },
    //客户名格式验证
    checkCustomerName(rule, value, callback) {
        value = $.trim(value);
        if (value) {
            if (ValidateUtil.nameRegex.test(value)) {
                callback();
            } else {
                callback(new Error(Intl.get("crm.197", "客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间")));
            }
        } else {
            callback(new Error(Intl.get("crm.81", "请填写客户名称")));
        }
    },
    getSubmitObj(){
        let formData = this.state.formData;
        let user = userData.getUserData();
        let submitObj = {
            //user_id: user ? user.user_id : "",
            name: formData.name,
            clue_source: formData.clue_source,
            access_channel: formData.access_channel,
            source: formData.source,
            source_time: new Date(formData.source_time).getTime()
        };
        //联系人及联系方式的处理
        let contact = {def_contancts: "true"};
        if (formData.contact_name) {
            contact.name = formData.contact_name;
        }
        if (formData.phone) {
            contact.phone = [formData.phone];
        }
        if (formData.email) {
            contact.email = [formData.email];
        }
        if (formData.qq) {
            contact.qq = [formData.qq];
        }
        submitObj.contacts = [contact];
        return submitObj;
    },
    handleSubmit () {
        if (this.state.isSaving) {
            return
        }
        var validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                let submitObj = this.getSubmitObj();
                let addRoute = _.find(routes, (route)=> route.handler == "addSalesClue");
                this.setState({
                    isSaving: true,
                    saveMsg: "",
                    saveResult: ""
                });
                ajax({
                    url: addRoute.path,
                    type: addRoute.method,
                    data: submitObj
                }).then(data=> {
                    if (_.isObject(data) && data.code == 0) {
                        //添加成功
                        this.setState({
                            isSaving: false,
                            saveMsg: Intl.get("user.user.add.success", "添加成功"),
                            saveResult: "success"
                        });
                        CrmAction.afterAddSalesClue(data.result);
                    } else {
                        this.setState({
                            isSaving: false,
                            saveMsg: Intl.get("crm.154", "添加失败"),
                            saveResult: "error"
                        });
                    }
                }, errorMsg=> {
                    //添加失败
                    this.setState({
                        isSaving: false,
                        saveMsg: errorMsg || Intl.get("crm.154", "添加失败"),
                        saveResult: "error"
                    });
                });

            }
        });
    },
    //去掉保存后提示信息
    hideSaveTooltip: function () {
        if (this.state.saveResult == "success") {
            this.closeAddPanel();
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
    checkPhone: function (rule, value, callback) {
        value = $.trim(value);
        if (value) {
            if ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(value)) ||
                (/^\d{3,4}\-\d{7,8}$/.test(value)) ||
                (/^400\-?\d{3}\-?\d{4}$/.test(value))) {
                callback();
            } else {
                callback(new Error(Intl.get("common.input.correct.phone", "请输入正确的电话号码")));
            }
        } else {
            callback();
        }
    },
    checkEmail: function (rule, value, callback) {
        value = $.trim(value);
        if (value) {
            if (!/^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
                    .test(value)) {
                callback(new Error(Intl.get("common.correct.email", "请输入正确的邮箱")));
            } else {
                callback();
            }
        } else {
            callback();
        }
    },
    render() {
        let formData = this.state.formData;
        let status = this.state.status;
        let saveResult = this.state.saveResult;
        return (
            <RightPanel showFlag={true} data-tracename="添加客户">
                <RightPanelClose onClick={this.closeAddPanel} data-tracename="点击关闭添加销售线索面板"/>
                <GeminiScrollbar>
                    <Form horizontal className="crm-add-form sales-clue-form">
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                className="form-item-label"
                                label={Intl.get("crm.4", "客户名称")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('name')}
                                help={status.name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.name.errors && status.name.errors.join(','))}
                            >
                                <Validator rules={[{validator: this.checkCustomerName}]}>
                                    <Input name="name"
                                           placeholder={Intl.get("crm.81", "请填写客户名称")}
                                           value={formData.name}
                                           onChange={this.setField.bind(this, 'name')}
                                    />
                                </Validator>
                            </FormItem>

                            <FormItem
                                label={Intl.get("call.record.contacts", "联系人")}
                                labelCol={{span:6}}
                                wrapperCol={{span:18}}
                            >
                                <Input name="contact_name" placeholder={Intl.get("crm.90", "请输入姓名")}
                                       value={formData.contact_name}
                                       onChange={this.setField.bind(this, 'contact_name')}
                                />
                            </FormItem>

                            <FormItem
                                label={Intl.get("common.phone", "电话")}
                                id="phone"
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('phone')}
                                help={status.phone.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.phone.errors && status.phone.errors.join(','))}
                            >
                                <Validator rules={[{validator:this.checkPhone}]}>
                                    <Input name="phone" value={formData.phone}
                                           placeholder={Intl.get("crm.95", "请输入联系人电话")}
                                           onChange={this.setField.bind(this, 'phone')}
                                    />
                                </Validator>
                            </FormItem>
                            <FormItem
                                label={Intl.get("common.email", "邮箱")}
                                id="email"
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('email')}
                                help={status.email.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.email.errors && status.email.errors.join(','))}
                            >
                                <Validator rules={[{validator:this.checkEmail}]}>
                                    <Input name="email" value={formData.email}
                                           placeholder={Intl.get("member.input.email", "请输入邮箱")}
                                           onChange={this.setField.bind(this, 'email')}
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
                                       onChange={this.setField.bind(this, 'qq')}
                                />
                            </FormItem>

                            <FormItem
                                className="form-item-label"
                                label={Intl.get("crm.sales.clue.source", "线索来源")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Select placeholder={Intl.get("crm.clue.source.placeholder", "请选择线索来源")}
                                        name="clue_source"
                                        onChange={this.setField.bind(this, 'clue_source')}
                                        value={formData.clue_source||clueSourceArray[0]}
                                >
                                    {
                                        clueSourceArray.map((source, idx)=> {
                                            return (<Option key={idx} value={source}>{source}</Option>)
                                        })
                                    }
                                </Select>
                            </FormItem>

                            <FormItem
                                className="form-item-label"
                                label={Intl.get("crm.sales.clue.access.channel", "接入渠道")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 18}}
                            >
                                <Select placeholder={Intl.get("crm.access.channel.placeholder", "请选择接入渠道")}
                                        name="access_channel"
                                        onChange={this.setField.bind(this, 'access_channel')}
                                        value={formData.access_channel||accessChannelArray[0]}
                                >
                                    {
                                        accessChannelArray.map((source, idx)=> {
                                            return (<Option key={idx} value={source}>{source}</Option>)
                                        })
                                    }
                                </Select>
                            </FormItem>
                            <FormItem
                                className="form-item-label"
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
                                <DatePicker value={formData.source_time}
                                            onChange={this.setField.bind(this, 'source_time')}/>
                            </FormItem>
                            <FormItem wrapperCol={{span: 24}}>
                                <div className="indicator">
                                    {saveResult ?
                                        (
                                            <AlertTimer time={saveResult=="error"?3000:600}
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
                                                  data-tracename="点击保存添加销售显示按钮">
                                    {Intl.get("common.save", "保存")}
                                </RightPanelSubmit>
                            </FormItem>
                        </Validation>
                    </Form>
                </GeminiScrollbar>
                {this.state.isSaving ? (<div className="right-pannel-block">
                    <Spinner className="right-panel-saving"/>
                </div>) : ""}
            </RightPanel>
        );
    }
});
export default SalesClueAddForm;