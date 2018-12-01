/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/2.
 */
import {Form, Input, DatePicker, Select} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import Trace from 'LIB_DIR/trace';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import CRMAddForm from 'MOD_DIR/crm/public/views/crm-add-form';

import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import dealAction from '../action';

import {num as antUtilsNum} from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
const removeCommaFromNum = antUtilsNum.removeCommaFromNum;

const ADD_TITLE_HEIGHT = 70;

class DealForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    getInitialState(props) {
        return {
            hideCustomerRequiredTip: false,
            appList: [],
            stageList: [],
            search_customer_name: '',
            formData: {
                customer: {id: '', name: ''},
            },
            isSaving: false,
            saveErrorMsg: '',
            isShowAddCustomer: false,
        };
    }

    componentDidMount() {
        this.addLabelRequiredCls();
        //获取应用列表
        this.getAppList();
        //获取订单阶段列表
        this.getDealStageList();
    }

    componentDidUpdate() {
        this.addLabelRequiredCls();
    }
    
    addLabelRequiredCls() {
        if (!$('.deal-form .require-item label').hasClass('ant-form-item-required')) {
            $('.deal-form .require-item label').addClass('ant-form-item-required');
        }
    }

    //获取应用列表（ketao:产品列表+oplate的应用列表， curtao: 产品列表）
    getAppList = () => {
        commonDataUtil.getAllProductList(appList => {
            this.setState({appList: appList});
        });
    };
    //获取订单阶段列表
    getDealStageList = () => {
        commonDataUtil.getDealStageList(stageList => {
            this.setState({stageList: stageList});
        });
    };
    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveErrorMsg: '',
        });
    };
    //保存结果的处理
    setResultData(saveErrorMsg) {
        this.setState({
            isSaving: false,
            saveErrorMsg: saveErrorMsg,
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            //需要将预算去掉千分位逗号，并转换成xxx万
            let budget = values.budget ? _.get(values, 'budget', '').replace(/,/g, '') / 10000 : 0;
            let predictFinishTime = values.predict_finish_time ? moment(values.predict_finish_time).endOf('day').valueOf() : moment().valueOf();
            let submitData = {
                customer_id: _.get(this.state, 'formData.customer.id'),
                //需要将预算去掉千分位逗号，并转换成xxx万
                budget: budget,
                apps: values.apps,
                sale_stages: values.sale_stages,
                predict_finish_time: predictFinishTime,
                remarks: values.remarks
            };
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.button-save'), '保存添加的订单');
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            $.ajax({
                url: '/rest/deal',
                dataType: 'json',
                type: 'post',
                data: submitData,
                success: (data) => {
                    this.setState({
                        isSaving: false,
                        saveErrorMsg: '',
                    });
                    this.closeDealForm();
                    if (_.isObject(data.result)) {
                        dealAction.addOneDeal({...data.result, customer_name: _.get(this.state,'formData.customer.name')});
                    }
                },
                error: (errorMsg) => {
                    this.setResultData(errorMsg || Intl.get('crm.154', '添加失败'), 'error');
                }
            });
        });
    };

    addAssignedCustomer = () => {
        this.setState({
            isShowAddCustomer: true
        });
    };
    //渲染添加客户内容
    renderAddCustomer = () => {
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
            />
        );
    };
    //关闭添加面板
    hideAddForm = () => {
        this.setState({
            isShowAddCustomer: false
        });
    };
    customerChoosen = (selectedCustomer) => {
        var formData = this.state.formData;
        formData.customer.id = selectedCustomer.id;
        formData.customer.name = selectedCustomer.name;
        this.setState({
            formData: formData
        }, () => {
            this.props.form.validateFields(['customer'], {force: true});
        });
    };
    checkCustomerName = (rule, value, callback) => {
        value = $.trim(_.get(this.state, 'formData.customer.id'));
        if (!value && !this.state.hideCustomerRequiredTip) {
            callback(new Error(Intl.get('leave.apply.select.customer', '请先选择客户')));
        } else {
            callback();
        }
    };
    hideCustomerRequiredTip = (flag) => {
        this.setState({
            hideCustomerRequiredTip: flag
        }, () => {
            this.props.form.validateFields(['customer'], {force: true});
        });
    };
    closeDealForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.button-cancel'), '关闭添加订单面板');
        this.props.hideDealForm();
        this.setState(this.getInitialState(this.props));
    }

    renderFormContent() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 19},
            colon: false
        };
        let saveResult = this.state.saveResult;
        const disabledDate = function(current) {
            //不允许选择大于当前的时刻
            return current && current.valueOf() < moment().startOf('day');
        };
        let formHeight = $('body').height() - ADD_TITLE_HEIGHT;
        return (
            <div className="deal-form-wrap" style={{height: formHeight}}>
                <GeminiScrollbar>
                    <Form layout='horizontal' className="deal-form" id="deal-form">
                        <FormItem
                            className="form-item-label require-item"
                            label={Intl.get('call.record.customer', '客户')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('customer', {
                                rules: [{validator: this.checkCustomerName}],
                                initialValue: ''
                            })(
                                <CustomerSuggest
                                    field='customer'
                                    hasEditPrivilege={true}
                                    displayText={''}
                                    displayType={'edit'}
                                    id={''}
                                    show_error={this.state.isShowCustomerError}
                                    noJumpToCrm={true}
                                    customer_name={''}
                                    customer_id={''}
                                    addAssignedCustomer={this.addAssignedCustomer}
                                    noDataTip={Intl.get('clue.has.no.data', '暂无')}
                                    hideButtonBlock={true}
                                    customerChoosen={this.customerChoosen}
                                    required={true}
                                    hideCustomerRequiredTip={this.hideCustomerRequiredTip}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            className="form-item-label"
                            label={Intl.get('leave.apply.buget.count', '预算')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('budget', {
                                rules: [getNumberValidateRule(), {
                                    required: true,
                                    message: Intl.get('crm.order.budget.input', '请输入预算金额')
                                }],
                                getValueFromEvent: (event) => {
                                    // 先remove是处理已经带着逗号的数字，parse后会有多个逗号的问题
                                    return parseAmount(removeCommaFromNum(event.target.value));
                                },
                                initialValue: ''
                            })(
                                <Input
                                    name="budget"
                                    addonAfter={Intl.get('contract.82', '元')}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            className="form-item-label"
                            label={Intl.get('deal.stage', '阶段')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('sale_stages', {
                                rules: [{
                                    required: true,
                                    message: Intl.get('deal.stage.select.tip', '请选择订单阶段')
                                }],
                                initialValue: ''
                            })(
                                <Select size="large" placeholder={Intl.get('deal.stage.select.tip', '请选择订单阶段',)}
                                    style={{width: '100%'}}
                                    name="sale_stages"
                                    getPopupContainer={() => document.getElementById('deal-form')}
                                >
                                    {_.map(this.state.stageList, (stage, index) => {
                                        return (<Option value={stage.name} key={index}>{stage.name}</Option>);
                                    })}
                                </Select>
                            )}
                        </FormItem>

                        <FormItem
                            label={Intl.get('leave.apply.buy.apps', '产品')}
                            id="apps"
                            {...formItemLayout}
                        >
                            {
                                getFieldDecorator('apps', {
                                    rules: [{
                                        required: true,
                                        message: Intl.get('leave.apply.select.atleast.one.app', '请选择至少一个产品')
                                    }],
                                })(
                                    <Select
                                        mode='multiple'
                                        placeholder={Intl.get('leave.apply.select.product', '请选择产品')}
                                        name="apps"
                                        getPopupContainer={() => document.getElementById('deal-form')}

                                    >
                                        {_.map(this.state.appList, (appItem, idx) => {
                                            return (<Option key={idx}
                                                value={appItem.client_id}>{appItem.client_name}</Option>);
                                        })}
                                    </Select>
                                )}
                        </FormItem>
                        <FormItem
                            className="form-item-label require-item add-apply-time"
                            label={Intl.get('crm.order.expected.deal', '预计成交')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('predict_finish_time', {
                                initialValue: moment()
                            })(
                                <DatePicker
                                    disabledDate={disabledDate}
                                    style={{width: '100%'}}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            className="form-item-label"
                            label={Intl.get('common.remark', '备注')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('remarks', {
                                initialValue: ''
                            })(
                                <Input
                                    type="textarea" rows="3"
                                />
                            )}
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 24}}>
                            <SaveCancelButton loading={this.state.isSaving}
                                saveErrorMsg={this.state.saveErrorMsg}
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.closeDealForm}
                            />
                        </FormItem>
                    </Form>
                </GeminiScrollbar>
                {this.state.isShowAddCustomer ? this.renderAddCustomer() : null}
            </div>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="deal-form-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.closeDealForm}
                title={Intl.get('crm.161', '添加订单')}
                content={this.renderFormContent()}
                dataTracename="添加订单"
            />
        );
    }
}

DealForm.propTypes = {
    hideDealForm: PropTypes.func,
    form: PropTypes.object
};

export default Form.create()(DealForm);