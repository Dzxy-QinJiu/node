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
import {checkCustomerName, checkEmail} from '../utils/clue-customer-utils';

class ClueAddForm extends React.Component {
    constructor(props) {
        super(props);
        const today = moment().format('YYYY-MM-DD');
        var defalutData = this.props.defaultClueData ? this.props.defaultClueData : {};
        this.state = {
            status: {
                name: {},//客户名称
                contact_name: {},//联系人
                phone: {},//联系电话
                email: {},//邮箱
                qq: {},//QQ
                weChat: {},//微信
                clue_source: {},//线索来源
                access_channel: {},//接入渠道
                contacts: [{}],
                source: {},//线索描述
                source_time: {}//线索时间
            },
            formData: {
                name: defalutData.name || '',//客户名称
                contact_name: defalutData.name || '',//联系人
                contacts: defalutData.contacts || [{'phone': ''}],
                phone: defalutData.phone || '',//联系电话
                email: defalutData.email || '',//邮箱
                qq: defalutData.qq || '',//QQ
                weChat: defalutData.weChat || '',//微信
                clue_source: defalutData.clue_source || '',//线索来源
                access_channel: defalutData.access_channel || '',//接入渠道
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

    //验证客户名是否重复
    checkOnlyClueCustomerName = () => {
        let customerName = $.trim(this.state.formData.name);
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
    handleSubmit = () => {
        if (this.state.isSaving) {
            return;
        }
        var validation = this.refs.validation;
        validation.validate(valid => {
            //验证电话是否通过验证
            this.phoneInputRef.props.form.validateFields({force: true}, (errors) => {
                if (this.state.clueNameExist || this.state.clueCustomerCheckErrMsg) {
                    valid = false;
                }
                if (!valid || errors) {
                    return;
                } else {
                    let submitObj = this.getSubmitObj();
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
                            clueCustomerAction.afterAddSalesClue(data.result);
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
                            //线索客户添加成功后的回调
                            _.isFunction(this.props.afterAddSalesClue) && this.props.afterAddSalesClue();
                        } else {
                            this.setResultData(Intl.get('crm.154', '添加失败'), 'error');
                        }
                    }, errorMsg => {
                        //添加失败
                        this.setResultData(errorMsg || Intl.get('crm.154', '添加失败'), 'error');
                    });
                }
            });
        });
    };
    //验证客户名是否重复
    checkOnlyClueCustomerName = () => {
        let customerName = $.trim(this.state.formData.name);
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

    renderDiffContacts(item, index, size) {
        var contactWays = {
            'phone': Intl.get('common.phone', '电话'),
            'email': Intl.get('common.email', '邮箱'),
            'qq': 'QQ'
        };
        var desArr = {
            'phone': Intl.get('clue.add.phone.num','电话号码'),
            'email': Intl.get('clue.add.email.addr','邮箱地址'),
            'qq': Intl.get('clue.add.qq.num','QQ号码')
        };
        // var key = _.findKey(this.state.formData.contacts[index]);
        var key = 'phone';
        return (
            <div>
                <Select value={key}>
                    {_.forEach(contactWays, (value, key) => {
                        return <Option value={key} key={key}>{value}</Option>;
                    })
                    }
                </Select>
                <Input placeholder={Intl.get('call.record.contacts', '联系人')}/>
                <Input placeholder={desArr[key]}/>
                {/*{this.renderContactWayBtns(index, size)}*/}
            </div>
        );

    }
    removeContactWay = (index) => {
        this.state.formData.contacts.splice(index,1);
        this.setState({
            formData: this.state.formData
        });
    };
    addContactWay = () => {
        this.state.formData.contacts.push({'phone': ''});
        this.setState({
            formData: this.state.formData
        });
    };
    //添加、删除联系方式的按钮
    renderContactWayBtns = (index, size) => {
        return (<div className="contact-way-buttons">
            {index === 0 && index === size - 1 ? null : <div className="circle-empty-button crm-contact-contactway-minus"
                onClick={this.removeContactWay(index)}>
                <Icon type="minus"/>
            </div>}
            {index === size - 1 ? ( <div className="circle-empty-button" onClick={this.addContactWay()}>
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
                                    // onChange={() =>{this.setField.bind(this, 'source_time')}}
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
                                }, {validator: checkCustomerName}],
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
                            className="form-item-label"
                            label={Intl.get('crm.5', '联系方式')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('contact_way')(
                                <div className="contact-way-container">
                                    {formData.contacts.length ? _.map(formData.contacts, (item, index) => {
                                        return this.renderDiffContacts(item, index, formData.contacts.length);
                                    }) : null}

                                    {/*<Select>*/}

                                    {/*</Select>*/}
                                    {/*<Input placeholder={Intl.get('call.record.contacts', '联系人')}/>*/}

                                    {/*<Input*/}
                                    {/*placeholder={Intl.get('clue.add.customer.need', '请描述一下客户需求')}*/}
                                    {/*name="source"*/}
                                    {/*type="textarea" id="source" rows="3" value={formData.source}*/}
                                    {/*/>*/}
                                </div>
                            )}
                        </FormItem>


                        <FormItem
                            className="form-item-label"
                            label={Intl.get('crm.sales.clue.descr', '线索描述')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('source')(
                                <Input
                                    placeholder={Intl.get('clue.add.customer.need', '请描述一下客户需求')}
                                    name="source"
                                    type="textarea" id="source" rows="3" value={formData.source}
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
                                        value={formData.clue_source}
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
