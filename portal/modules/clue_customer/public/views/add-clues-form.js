var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/26.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from './right_panel_top';
import {Form, Input, Select, DatePicker, Button, Icon} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
import ajax from '../../../crm/common/ajax';
const routes = require('../../../crm/common/route');
var clueCustomerAction = require('../action/clue-customer-action');
import {checkClueName, checkClueSourceIP,contactNameRule} from '../utils/clue-customer-utils';
var classNames = require('classnames');
import PropTypes from 'prop-types';
var uuid = require('uuid/v4');
import AlertTimer from 'CMP_DIR/alert-timer';
require('../css/add-clues-info.less');
import DynamicAddDelContact from 'CMP_DIR/dynamic-add-del-contacts';
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
                source_time: today,//线索时间，默认：今天
            },
            isSaving: false,
            saveMsg: '',
            saveResult: '',
            newAddClue: {},//新增加的线索
        };
    }

    componentDidMount() {
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
        return submitObj;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            //是否有联系方式的验证
            if (this.validateContactIsEmpty(values.contacts)) {
                return;
            }
            let submitObj = this.getSubmitObj(values);
            let addRoute = _.find(routes, (route) => route.handler === 'addSalesClue');
            this.setState({isSaving: true, saveMsg: '', saveResult: ''});
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
                    //线索客户添加成功后的回调
                    _.isFunction(this.props.afterAddSalesClue) && this.props.afterAddSalesClue();
                } else {
                    var errTip = Intl.get('crm.154', '添加失败');
                    if (_.isString(data.msg) && _.isArray(data.result) && data.result.length){
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
                                    initialValue: moment()
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
                                    }, {validator: checkClueName}]
                                })(
                                    <Input
                                        name="name"
                                        id="name"
                                        placeholder={Intl.get('clue.suggest.input.customer.name', '建议输入客户名称')}
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                className={clsContainer}
                                label={Intl.get('crm.5', '联系方式')}
                                {...formItemLayout}
                            >
                                <DynamicAddDelContact
                                    hideContactRequired={this.hideContactRequired}
                                    validateContactName={contactNameRule()}
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
                                    rules: [{validator: checkClueSourceIP}]
                                })(
                                    <Input
                                        name="source_ip"
                                        id="source_ip"
                                    />
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
    appUserName: ''

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
    appUserName: PropTypes.string
};
export default Form.create()(ClueAddForm);
