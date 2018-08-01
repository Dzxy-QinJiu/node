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
var uuid = require('uuid/v4');

class ClueAddForm extends React.Component {
    constructor(props) {
        super(props);
        const today = moment().format('YYYY-MM-DD');
        var defalutData = this.props.defaultClueData ? this.props.defaultClueData : {};
        this.state = {
            formData: {
                name: '',//客户名称
                contact_name: '',//联系人
                contacts: [{
                    'def_contancts': 'true',
                    'name': '',
                    'phone': [],
                    'qq': [],
                    'email': [],
                    'weChat': [],
                    'show_contact_item': [{type: 'phone', value: '', randomValue: uuid()}]
                }],
                phone: '',//联系电话
                email: '',//邮箱
                qq: '',//QQ
                weChat: '',//微信
                clue_source: '',//线索来源
                access_channel: '',//接入渠道
                source: '',//线索描述
                source_time: today,//线索时间，默认：今天
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

    componentDidMount() {
        //todo
        $('.contact-containers .ant-form-item-label label').addClass('ant-form-item-required');
    }

    getPhoneFormValue = (form) => {
        return new Promise(resolve => {
            form.validateFields((errs, fields) => {
                resolve({errs, fields});
            });
        });
    };
    addClue = () => {
        var formData = this.state.formData;


        console.log('提交睡觉');
    };
    handleSubmit = (e) => {
        e.preventDefault();


        this.props.form.validateFieldsAndScroll((err, values) => {
            //如果每个联系方式的联系人和联系方式都没有
            var contacts = this.state.formData.contacts;
            var contactErr = true;
            _.forEach(contacts, (contactItem) => {
                _.forEach(contactItem.show_contact_item, (item) => {
                    if (item.value) {
                        contactErr = false;
                    }
                });
            });

            if (contactErr) {
                this.setState({
                    contactErrMsg: Intl.get('clue.fill.clue.contacts', '请填写线索的联系方式')
                });
                return;
            } else {
                values.contacts = contacts;
            }


            // for (var key in this.state.formData) {
            //     if (!values[key]) {
            //         values[key] = this.state.formData[key];
            //     }
            // }
            //去除表单数据中值为空的项
            // commonMethodUtil.removeEmptyItem(values);
            //验证电话是否通过验证
            if (this.phoneInputRefs.length) {
                //存在电话输入框时，验证一下填写的电话是否符合要求
                let phoneFormValArray = [];
                _.each(this.phoneInputRefs, item => {
                    phoneFormValArray.push(::this.getPhoneFormValue(item.props.form));
                });
                Promise.all(phoneFormValArray).then(result => {
                    let firstErrorItem = _.find(result, item => item.errs);
                    if (firstErrorItem || err) {
                        console.log('weitijiao');
                        return;
                    } else {
                        this.addClue();
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

    handleContactTypeChange = (index, itemIndex, value) => {
        var contacts = this.state.formData.contacts;
        contacts[index]['show_contact_item'][itemIndex]['type'] = value;
        this.setState({
            formData: this.state.formData
        });
    };
    handleChangeContactName = (index, e) => {
        var contacts = this.state.formData.contacts;
        contacts[index]['name'] = e.target.value;
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

    setContactPhoneValue = () => {

    };
    handleDelContact = (index, size) => {
        if (index === 0 && size === 1) {
            return;
        }
        var contacts = this.state.formData.contacts;
        contacts.splice(index, 1);
        this.setState({
            formData: this.state.formData
        });
    };

    renderDiffContacts(item, index, size) {

        const DIFCONTACTWAY = {
            PHONE: 'phone',
            EMAIL: 'email',
            QQ: 'qq',
            WECHAT: 'weChat'
        };
        var contactWays = [
            {name: DIFCONTACTWAY.PHONE, value: Intl.get('common.phone', '电话')},
            {name: DIFCONTACTWAY.EMAIL, value: Intl.get('common.email', '邮箱')},
            {name: DIFCONTACTWAY.QQ, value: 'QQ'},
            {name: DIFCONTACTWAY.WECHAT, value: Intl.get('crm.58', '微信')}];
        var desArr = {
            'phone': Intl.get('clue.add.phone.num', '电话号码'),
            'email': Intl.get('clue.add.email.addr', '邮箱地址'),
            'qq': Intl.get('clue.add.qq.num', 'QQ号码'),
            'weChat': Intl.get('clue.add.wechat.num', '微信号码')
        };

        function getDiffCls(type) {
            var cls = classNames('iconfont', {
                'icon-qq': type === 'qq',
                'icon-email': type === 'email',
                'icon-phone-call-out': type === 'phone',
                'icon-weChat': type === 'weChat'
            });
            return cls;
        }

        var iconCls = classNames('iconfont icon-delete', {
            'disabled': index === 0 && size === 1
        });
        var contacts = this.state.formData.contacts;
        var show_contact_item = contacts[index]['show_contact_item'];
        const {getFieldDecorator, getFieldValue, setFieldsValue} = this.props.form;
        var filterObj = {};
        return (
            <div className="contact-wrap">
                <div className="contact-name-item">
                    <Input value={item.name} onChange={this.handleChangeContactName.bind(this, index)}
                        className='contact-name' placeholder={Intl.get('call.record.contacts', '联系人')}/>
                    <i className={iconCls} onClick={this.handleDelContact.bind(this, index, size)}></i>

                </div>
                <div className="contact-way-item">
                    {_.map(show_contact_item, (contactItem, itemIndex) => {
                        var contactWay = contactItem.type;
                        var contactValue = contactItem.value;
                        var randomValue = contactItem.randomValue;
                        //取每个联系人的联系方式
                        var itemSize = show_contact_item.length;
                        return (
                            <div className="contact-item">
                                <Select value={contactWay}
                                    onChange={this.handleContactTypeChange.bind(this, index, itemIndex)}>
                                    {contactWays.map((item) => {
                                        return <Option value={item.name} key={item.name} title={item.value}>
                                            <i className={getDiffCls(item.name)}></i>
                                            {item.value}</Option>;
                                    })}
                                </Select>
                                {/*不同的联系方式用不同的规则来校验*/}
                                {
                                    contactWay === 'phone' ? <PhoneInput
                                        wrappedComponentRef={(inst) => this.phoneInputRefs.push(inst) }
                                        placeholder={desArr[contactWay]}
                                        validateRules={this.getPhoneInputValidateRules()}
                                        initialValue={contactValue}
                                        hideLable={true}
                                        onChange={this.setContactValue.bind(this, index, itemIndex)}
                                        id={PHONE_INPUT_ID + uuid()}
                                    /> : null
                                }
                                {
                                    contactWay === 'email' ?
                                        <FormItem>
                                            {getFieldDecorator(randomValue, {
                                                rules: [{required: false},
                                                    {validator: checkEmail}
                                                ],
                                                initialValue: contactValue
                                            },
                                            )(
                                                <Input
                                                    onChange={this.setContactValue.bind(this, index, itemIndex, randomValue)}
                                                    className='contact-type-tip' placeholder={desArr[contactWay]}
                                                />
                                            ) }
                                        </FormItem>
                                        : null
                                }
                                {
                                    contactWay === 'qq' ?
                                        <FormItem>
                                            { getFieldDecorator(randomValue, {
                                                rules: [{required: false},
                                                    {validator: checkQQ}
                                                ], initialValue: contactValue
                                            })(
                                                <Input className='contact-type-tip' placeholder={desArr[contactWay]}
                                                    onChange={this.setContactValue.bind(this, index, itemIndex, randomValue)}
                                                />
                                            )}
                                        </FormItem>
                                        : null
                                }
                                {
                                    contactWay === 'weChat' ?
                                        <FormItem>
                                            {getFieldDecorator(randomValue, {
                                                rules: [{required: false}],
                                                initialValue: contactValue
                                            })(
                                                <Input
                                                    onChange={this.setContactValue.bind(this, index, itemIndex, randomValue)}
                                                    className='contact-type-tip' placeholder={desArr[contactWay]}
                                                />
                                            ) }
                                        </FormItem>
                                        : null
                                }
                                {this.renderContactWayBtns(index, itemIndex, itemSize, randomValue)}
                            </div>
                        );
                    })}


                </div>
            </div>
        );

    }

    setContactValue = (index, itemIndex, randomValue, e) => {
        var formData = this.state.formData;
        formData.contacts[index]['show_contact_item'][itemIndex]['value'] = e.target.value;
        this.setState({
            formData: this.state.formData
        });
        var a = {};
        a[randomValue] = e.target.value;
        this.props.form.setFieldsValue(a);
    };

    removeContactWay = (index, itemIndex, key) => {
        this.state.formData.contacts[index]['show_contact_item'].splice(itemIndex, 1);
        this.setState({
            formData: this.state.formData
        });
        const {form} = this.props;
        form.resetFields();
        //    [names: string[]]
    };
    addContactWay = (index) => {
        const {form} = this.props;
        var contacts = this.state.formData.contacts;
        let addItem = {type: 'phone', value: '', randomValue: uuid()};
        contacts[index]['show_contact_item'].push(addItem);
        this.setState({
            formData: this.state.formData
        });
    };
    //添加、删除联系方式的按钮
    renderContactWayBtns = (index, itemIndex, itemSize, key) => {
        return (<div className="contact-way-buttons">
            {itemIndex === 0 && itemSize === 1 ? null : <div className="clue-minus-button"
                onClick={this.removeContactWay.bind(this, index, itemIndex, key)}>
                <Icon type="minus"/>
            </div>}
            {itemIndex === itemSize - 1 ? (
                <div className="clue-plus-button" onClick={this.addContactWay.bind(this, index)}>
                    <Icon type="plus"/>
                </div>) : null}
        </div>);
    };
    handleAddContact = () => {
        this.state.formData.contacts.push({
            'name': '',
            'phone': [],
            'qq': [],
            'weChat': [],
            'email': [],
            'show_contact_item': [{type: 'phone', value: '',randomValue: uuid()}]
        });
        this.setState({
            formData: this.state.formData
        });
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
        var clsContainer = classNames('form-item-label contact-containers', {
            'contact-err-tip': this.state.contactErrMsg
        });
        this.phoneInputRefs = [];
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
                                {_.map(formData.contacts, (item, index) => {
                                    return this.renderDiffContacts(item, index, formData.contacts.length);
                                })}
                                <div className="add-contact"
                                    onClick={this.handleAddContact}>{Intl.get('crm.detail.contact.add', '添加联系人')}</div>
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
