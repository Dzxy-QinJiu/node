/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/26.
 */
import {RightPanel, RightPanelSubmit, RightPanelCancel, RightPanelClose} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from './basic_info';
import {Form, Input, Select, DatePicker, Button, Icon} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
import ajax from '../../../crm/common/ajax';
const routes = require('../../../crm/common/route');
var clueCustomerAction = require('../action/clue-customer-action');
import {checkClueName, checkEmail, checkQQ} from '../utils/clue-customer-utils';
var classNames = require('classnames');
import {nameRegex} from 'PUB_DIR/sources/utils/consts';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
const PHONE_INPUT_ID = 'phoneInput';
var CrmAction = require('MOD_DIR/crm/public/action/crm-actions');
import PhoneInput from 'CMP_DIR/phone-input';

class ClueAddForm extends React.Component {
    constructor(props) {
        super(props);
        const today = moment().format('YYYY-MM-DD');
        var defalutData = this.props.defaultClueData ? this.props.defaultClueData : {};
        this.state = {
            formData: {
                name: '',//客户名称
                contact_name: '',//联系人
                contacts: [{'contactWay': 'phone', 'contactName': '', 'contactValue': ''}],
                phone: '',//联系电话
                email: '',//邮箱
                qq: '',//QQ
                weChat: '',//微信
                clue_source: '',//线索来源
                access_channel: '',//接入渠道
                source: '',//线索描述
                source_time: today,//线索时间，默认：今天
                province: '',
                city: '',
                county: '',
                location: '',
                address: '',//详细地址
                administrative_level: ''//行政区划
            },
            isSaving: false,
            saveMsg: '',
            saveResult: '',
            isShowAssignAndRelate: false,//是否展示分配给某个销售或者关联客户的面板
            newAddClue: {},//新增加的线索
            clueNameExist: false,//线索名称是否存在
            clueCustomerCheckErrMsg: ''//线索名称校验失败
        };
    }
    componentDidMount(){
        //todo
        $('.contact-containers .ant-form-item-label label').addClass('ant-form-item-required');
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            //如果每个联系方式的联系人和联系方式都没有
            var contacts = this.state.formData.contacts;
            var contactErr = true;
            _.forEach(contacts, (item) => {
                if (item.contactName && item.contactValue){
                    contactErr = false;
                }
            });
            if (contactErr){
                this.setState({
                    contactErrMsg: Intl.get('clue.fill.clue.contacts', '请填写线索的联系方式')
                });
                return;
            }else {
                values.contacts = contacts;
            }

            if (!err) {

                // for (var key in this.state.formData) {
                //     if (!values[key]) {
                //         values[key] = this.state.formData[key];
                //     }
                // }
                //去除表单数据中值为空的项
                // commonMethodUtil.removeEmptyItem(values);
                //验证电话是否通过验证
                this.phoneInputRef.props.form.validateFields({}, (errors, phoneVal) => {
                    if (errors) {
                        return;
                    } else {
                        //验证电话通过后，再把电话的值放在values中
                        // values.contacts0_phone = $.trim(phoneVal[PHONE_INPUT_ID].replace(/-/g, ''));
                        this.addCustomer(values);
                    }
                });
            }
        });


        // if (this.state.isSaving) {
        //     return;
        // }
        // var validation = this.refs.validation;
        // validation.validate(valid => {
        //     //验证电话是否通过验证
        //     this.phoneInputRef.props.form.validateFields({force: true}, (errors) => {
        //         if (this.state.clueNameExist || this.state.clueCustomerCheckErrMsg) {
        //             valid = false;
        //         }
        //         if (!valid || errors) {
        //             return;
        //         } else {
        //             let submitObj = this.getSubmitObj();
        //             let addRoute = _.find(routes, (route) => route.handler === 'addSalesClue');
        //             this.setState({isSaving: true, saveMsg: '', saveResult: ''});
        //             ajax({
        //                 url: addRoute.path,
        //                 type: addRoute.method,
        //                 data: submitObj
        //             }).then(data => {
        //                 if (_.isObject(data) && data.code === 0) {
        //                     //添加成功
        //                     this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
        //                     this.setState({
        //                         newAddClue: data.result
        //                     });
        //                     clueCustomerAction.afterAddSalesClue(data.result);
        //                     //如果线索来源或者接入渠道,线索类型加入新的类型
        //                     if (submitObj.clue_source && !_.includes(this.props.clueSourceArray, submitObj.clue_source)) {
        //                         _.isFunction(this.props.updateClueSource) && this.props.updateClueSource(submitObj.clue_source);
        //                     }
        //                     if (submitObj.access_channel && !_.includes(this.props.accessChannelArray, submitObj.access_channel)) {
        //                         _.isFunction(this.props.updateClueChannel) && this.props.updateClueChannel(submitObj.access_channel);
        //                     }
        //                     if (submitObj.clue_classify && !_.includes(this.props.clueClassifyArray, submitObj.clue_classify)) {
        //                         _.isFunction(this.props.updateClueClassify) && this.props.updateClueClassify(submitObj.clue_classify);
        //                     }
        //                     //线索客户添加成功后的回调
        //                     _.isFunction(this.props.afterAddSalesClue) && this.props.afterAddSalesClue();
        //                 } else {
        //                     this.setResultData(Intl.get('crm.154', '添加失败'), 'error');
        //                 }
        //             }, errorMsg => {
        //                 //添加失败
        //                 this.setResultData(errorMsg || Intl.get('crm.154', '添加失败'), 'error');
        //             });
        //         }
        //     });
        // });
    };
    //线索名格式验证
    // checkClueName = (rule, value, callback) => {
    //     value = $.trim(value);
    //     if (value) {
    //         if (nameRegex.test(value)) {
    //             callback();
    //         } else {
    //             // this.setState({clueNameExist: false, checkNameError: true});
    //             callback(Intl.get('clue.name.rule', '线索名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间'));
    //         }
    //     } else {
    //         // this.setState({clueNameExist: false, checkNameError: true});
    //         callback(new Error(Intl.get('clue.customer.fillin.clue.name', '请填写线索名称')));
    //     }
    // };
    //验证客户名是否重复
    checkOnlyClueCustomerName = () => {
        // let customerName = $.trim(this.state.formData.name);
        let customerName = $.trim(this.props.form.getFieldValue('name'));
        //满足验证条件后再进行唯一性验证
        if (customerName && nameRegex.test(customerName)) {
            clueCustomerAction.checkOnlyClueName(customerName, (data) => {
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({
                        clueNameExist: false,
                        clueCustomerCheckErrMsg: data
                    });
                } else {
                    if (_.isObject(data) && data.result === 'true') {
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
    };

    renderCheckClueNameMsg() {
        if (this.state.clueNameExist) {
            return (<div className="clue-name-repeat">{Intl.get('clue.customer.check.repeat', '该线索名称已存在')}</div>);
        } else if (this.state.clueCustomerCheckErrMsg) {
            return (
                <div className="clue-name-errmsg">{Intl.get('clue.customer.check.only.exist', '线索名称唯一性校验失败')}</div>);
        } else {
            return '';
        }
    }
    renderCheckContactMsg(){
        if (this.state.contactErrMsg){
            return (
                <div className="clue-contactname-errmsg">
                    {this.state.contactErrMsg}
                </div>
            );
        }else{
            return '';
        }
    }

    handleContactTypeChange = (index, value) => {
        var contacts = this.state.formData.contacts;
        contacts[index]['contactWay'] = value;
        this.setState({
            formData: this.state.formData
        });
    };
    handleChangeContactName = (index, e) => {
        var contacts = this.state.formData.contacts;
        contacts[index]['contactName'] = e.target.value;
        this.setState({
            formData: this.state.formData,
            contactErrMsg: ''
        });
    };
    handleChangeContactValue = (index, e) => {
        var contacts = this.state.formData.contacts;
        contacts[index]['contactValue'] = e.target.value;
        this.setState({
            formData: this.state.formData,
            contactErrMsg: ''
        });
    };
    checkOnlyContactPhone = (rule, value, callback) => {
        CrmAction.checkOnlyContactPhone(value, data => {
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
    };
    getPhoneInputValidateRules = () => {
        return [{
            validator: (rule, value, callback) => {
                this.checkOnlyContactPhone(rule, value, callback);
            }
        }];
    };
    setContactValue = (index, e) => {
        var formData = this.state.formData;
        formData.contacts[index].contactValue = e.target.value;
        this.setState({
            formData: this.state.formData
        });
    };
    renderDiffContacts(item, index, size) {
        var DIFCONTACTWAY = {
            PHONE: 'phone',
            EMAIL: 'email',
            QQ: 'qq'
        };
        var contactWays = [
            {name: DIFCONTACTWAY.PHONE, value: Intl.get('common.phone', '电话')},
            {name: DIFCONTACTWAY.EMAIL, value: Intl.get('common.email', '邮箱')},
            {name: DIFCONTACTWAY.QQ, value: 'QQ'}];
        var desArr = {
            'phone': Intl.get('clue.add.phone.num', '电话号码'),
            'email': Intl.get('clue.add.email.addr', '邮箱地址'),
            'qq': Intl.get('clue.add.qq.num', 'QQ号码')
        };

        function getDiffCls(type) {
            var cls = classNames('iconfont', {
                'icon-qq': type === 'qq',
                'icon-email': type === 'email',
                'icon-phone-call-out': type === 'phone'
            });
            return cls;
        }

        var contacts = this.state.formData.contacts;
        var contactWay = contacts[index]['contactWay'];
        var contactName = contacts[index]['contactName'];
        var contactValue = contacts[index]['contactValue'];
        const {getFieldDecorator} = this.props.form;
        return (
            <div className="contact-wrap">
                <Select value={contactWay} onChange={this.handleContactTypeChange.bind(this, index)}>
                    {contactWays.map((item) => {
                        return <Option value={item.name} key={item.name} title={item.value}>
                            <i className={getDiffCls(item.name)}></i>
                            {item.value}</Option>;
                    })}
                </Select>
                <Input value={contactName} onChange={this.handleChangeContactName.bind(this, index)}
                    className='contact-name' placeholder={Intl.get('call.record.contacts', '联系人')}/>
                {/*不同的联系方式用不同的规则来校验*/}
                {
                    contactWay === 'phone' ? <PhoneInput
                        wrappedComponentRef={(inst) => this.phoneInputRef = inst}
                        placeholder={desArr[contactWay]}
                        validateRules={this.getPhoneInputValidateRules()}
                        initialValue={''}
                        hideLable={true}
                        onChange={this.setContactValue.bind(this, index)}
                        id={PHONE_INPUT_ID + index}
                    /> : null
                }
                {
                    contactWay === 'email' ?
                        <FormItem>
                            {getFieldDecorator(`email-${index}`, {rules: [{required: false}, {validator: checkEmail}]})(
                                <Input value={contactValue} name={`email-${index}`} onChange={this.setContactValue.bind(this, index)}
                                    className='contact-type-tip' placeholder={desArr[contactWay]}
                                />) }
                        </FormItem>
                        : null
                }
                {
                    contactWay === 'qq' ?
                        <FormItem>
                            { getFieldDecorator(`qq-${index}`, {rules: [{required: false}, {validator: checkQQ}]})(
                                <Input value={contactValue} name={`qq-${index}`}
                                    className='contact-type-tip' placeholder={desArr[contactWay]}
                                    onChange={this.setContactValue.bind(this, index)}
                                />)}
                        </FormItem>
                        : null
                }
                {/*{getFieldDecorator(`${contact_way}-${index}`, {rules: [{required: false}]})(*/}
                {/*<Input value={contactValue} name={`${contact_way}-${index}`} */}
                {/*className='contact-type-tip' placeholder={desArr[contactWay]}*/}
                {/*/>)}*/}
                {/*<Input value={contactValue} onChange={this.handleChangeContactValue.bind(this, index)} className='contact-type-tip' placeholder={desArr[contactWay]}/>*/}

                {this.renderContactWayBtns(index, size)}
            </div>
        );

    }

    removeContactWay = (index) => {
        this.state.formData.contacts.splice(index, 1);
        this.setState({
            formData: this.state.formData
        });
    };
    addContactWay = () => {
        this.state.formData.contacts.push({'contactWay': 'phone', 'contactName': '', 'contactValue': ''});
        this.setState({
            formData: this.state.formData
        });
    };
    //添加、删除联系方式的按钮
    renderContactWayBtns = (index, size) => {
        return (<div className="contact-way-buttons">
            {index === 0 && index === size - 1 ? null : <div className="clue-minus-button"
                onClick={this.removeContactWay.bind(this, index)}>
                <Icon type="minus"/>
            </div>}
            {index === size - 1 ? ( <div className="clue-plus-button" onClick={this.addContactWay}>
                <Icon type="plus"/>
            </div>) : null}
        </div>);
    };


    render = () => {
        const {getFieldDecorator} = this.props.form;
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
        var clsContainer = classNames('form-item-label contact-containers',{
            'contact-err-tip': this.state.contactErrMsg
        });
        return (
            <RightPanel showFlag={true} data-tracename="添加线索" className="sales-clue-add-container">
                <BasicData
                    closeRightPanel={this.closeAddPanel}
                    clueTypeTitle={Intl.get('crm.sales.add.clue', '添加线索')}
                    showCloseIcon={false}
                />
                <div className="add-clue-item">
                    {/*<GeminiScrollbar>*/}
                    <Form horizontal className="crm-add-form sales-clue-form" id="sales-clue-form">
                        <FormItem
                            className="form-item-label"
                            label={Intl.get('clue.analysis.consult.time', '咨询时间')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('source_time', {
                                rules: [{
                                    required: true,
                                }],
                                initialValue: moment()
                            })(
                                <DatePicker
                                    value={moment(formData.source_time)}
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
                                initialValue: formData.name
                            })(
                                <Input
                                    name="name"
                                    id="name"
                                    placeholder={Intl.get('clue.suggest.input.customer.name', '建议输入客户名称')}
                                    onBlur={() => {
                                        this.checkOnlyClueCustomerName();
                                    }}
                                />
                            )}
                        </FormItem>
                        {this.renderCheckClueNameMsg()}
                        <FormItem
                            className={clsContainer}
                            label={Intl.get('crm.5', '联系方式')}
                            {...formItemLayout}
                        >
                            <div className="contact-way-container">
                                {formData.contacts.length ? _.map(formData.contacts, (item, index) => {
                                    return this.renderDiffContacts(item, index, formData.contacts.length);
                                }) : this.renderDiffContacts({'phone': 'rty'}, 0, 1)}

                            </div>
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
                            label={Intl.get('crm.sales.clue.source', '线索来源')}
                            id="clue_source"
                            {...formItemLayout}
                        >
                            {
                                getFieldDecorator('clue_source')(
                                    <Select
                                        combobox
                                        placeholder={Intl.get('crm.clue.source.placeholder', '请选择或输入线索来源')}
                                        name="clue_source"
                                        getPopupContainer={() => document.getElementById('sales-clue-form')}
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
                                <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                    disabled={this.state.isLoading} data-tracename="点击保存添加
                                            线索按钮">
                                    {Intl.get('common.save', '保存')}
                                    {this.state.isLoading ? <Icon type="loading"/> : null}
                                </Button>
                                <Button className="cancel-btn" onClick={this.props.hideAddForm}
                                    data-tracename="点击取消添加客户信息按钮">
                                    {Intl.get('common.cancel', '取消')}
                                </Button>
                            </FormItem>
                        </div>

                    </Form>
                    {/*</GeminiScrollbar>*/}
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

    }

};
ClueAddForm.propTypes = {
    defaultClueData: React.PropTypes.object,
    clueSourceArray: React.PropTypes.object,
    updateClueSource: React.PropTypes.func,
    accessChannelArray: React.PropTypes.object,
    updateClueChannel: React.PropTypes.func,
    clueClassifyArray: React.PropTypes.object,
    updateClueClassify: React.PropTypes.func,
    afterAddSalesClue: React.PropTypes.func,
    form: React.PropTypes.object,
    hideAddForm: React.PropTypes.func

};
export default Form.create()(ClueAddForm);
