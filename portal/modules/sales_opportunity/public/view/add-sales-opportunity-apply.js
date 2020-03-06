/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-sales-opportunity-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker, Select} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
var user = require('PUB_DIR/sources/user-data').getUserData();
const DEFAULTTIMETYPE = 'day';
var DateSelectorUtils = require('CMP_DIR/datepicker/utils');
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
var SalesOpportunityApplyAction = require('../action/sales-opportunity-apply-action');
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {DELAY_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import { num as antUtilsNum } from 'ant-utils';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
const parseAmount = antUtilsNum.parseAmount;
const removeCommaFromNum = antUtilsNum.removeCommaFromNum;
class AddSalesOpportunityApply extends React.Component {
    constructor(props) {
        super(props);
        var timeRange = getStartEndTimeOfDiffRange(DEFAULTTIMETYPE, true);
        this.state = {
            hideCustomerRequiredTip: false,
            appList: [],
            search_customer_name: '',
            formData: {
                customer: {id: '', name: ''},
            },
        };
    }

    componentDidMount() {
        this.addLabelRequiredCls();
        //获取应用列表
        this.getAppList();
    }
    componentDidUpdate() {
        this.addLabelRequiredCls();
    }

    addLabelRequiredCls() {
        if (!$('.add-leave-apply-form-wrap form .require-item label').hasClass('ant-form-item-required')) {
            $('.add-leave-apply-form-wrap form .require-item label').addClass('ant-form-item-required');
        }
    }
    hideSalesOpportunityApplyAddForm = (data) => {
        this.props.hideSalesOpportunityApplyAddForm(data);
    };
    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveMsg: '',
            saveResult: ''
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

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            values['expectdeal_time'] = moment(values['expectdeal_time']).endOf('day').valueOf();
            values['customer'] = _.get(this.state, 'formData.customer');
            if (!_.get(values, 'customer.id')){
                return;
            }
            //销售机会的预算取到的值是带千分位的逗号的，往后端传的时候不能传带逗号的
            var budget = values.budget;
            values.budget = budget.replace(/,/g,'');
            var apps = _.cloneDeep(values.apps);
            values.apps = [];
            _.forEach(apps,(appId) => {
                var targetObj = _.find(this.state.appList, clientItem => clientItem.client_id === appId);
                if (targetObj){
                    values.apps.push({client_id: targetObj.client_id, client_name: targetObj.client_name});
                }
            });
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            var errTip = Intl.get('crm.154', '添加失败');
            $.ajax({
                url: '/rest/add/sales_opportunity_apply/list',
                dataType: 'json',
                type: 'post',
                data: values,
                success: (data) => {
                    if (data){
                        //添加成功
                        this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                        //添加完后的处理
                        data.afterAddReplySuccess = true;
                        data.showCancelBtn = true;
                        this.hideSalesOpportunityApplyAddForm(data);
                    }else{
                        this.setResultData(errTip, 'error');
                    }
                },
                error: (xhr) => {
                    if (xhr.responseJSON && _.isString(xhr.responseJSON)){
                        errTip = xhr.responseJSON;
                    }
                    this.setResultData(errTip, 'error');
                }
            });
        });
    };
    getAppList = () => {
        commonDataUtil.getAllProductList(appList => {
            this.setState({appList: appList});
        });
    };
    addAssignedCustomer = () => {
        this.setState({
            isShowAddCustomer: true
        });
    };
    //关闭添加面板
    hideAddForm = () => {
        this.setState({
            isShowAddCustomer: false
        });
    };
    //添加客户成功回调
    afterAddCustomer = (result) => {
        let customerSuggestRef = this.customerSuggestRef;
        if(customerSuggestRef) {
            _.each(result, item => {
                item.customer_name = item.name;
                item.customer_id = item.id;
            });
            customerSuggestRef.setCustomer(result, _.get(result,'[0].id',''));
        }
    };
    //渲染添加客户内容
    renderAddCustomer = () => {
        let customerName = _.get(this.state.formData,'customer.name');
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
                formData={{
                    name: customerName
                }}
                afterAddCustomer={this.afterAddCustomer}
            />
        );
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
        value = _.trim(_.get(this.state, 'formData.customer.id'));
        if (!value && !this.state.hideCustomerRequiredTip) {
            callback(new Error(Intl.get('leave.apply.select.customer', '请先选择客户')));
        } else {
            callback();
        }
    };
    hideCustomerRequiredTip = (flag) => {
        this.setState({
            hideCustomerRequiredTip: flag
        },() => {
            this.props.form.validateFields(['customer'], {force: true});
        });
    };

    render() {
        var _this = this;
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        let saveResult = this.state.saveResult;
        const disabledDate = function(current) {
            //不允许选择大于当前的时刻
            return current && current.valueOf() < moment().startOf('day');
        };
        return (
            <RightPanel showFlag={true} data-tracename="添加销售机会申请" className="add-sales-opportunity-container">
                <span className="iconfont icon-close add-sales-opportunity-apply-close-btn"
                    onClick={this.hideSalesOpportunityApplyAddForm}
                    data-tracename="关闭添加销售机会申请面板"></span>

                <div className="add-sales-opportunity-apply-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('leave.apply.sales.opportunity.application', '销售机会申请')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' className="sales-clue-form" id="add-sales-opportunity-apply-form">
                                    <FormItem
                                        className="form-item-label require-item"
                                        label={Intl.get('call.record.customer', '客户')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('customer', {
                                            rules: [{validator: _this.checkCustomerName}],
                                            initialValue: '',
                                            validateTrigger: 'onBlur'
                                        })(
                                            <CustomerSuggest
                                                ref={ref => this.customerSuggestRef = ref}
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
                                        label={Intl.get('leave.apply.buget.count','预算')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('budget', {
                                            rules: [getNumberValidateRule(),{required: true,message: Intl.get('crm.order.budget.input', '请输入预算金额')}],
                                            getValueFromEvent: (event) => {
                                                // 先remove是处理已经带着逗号的数字，parse后会有多个逗号的问题
                                                return parseAmount(removeCommaFromNum(event.target.value));
                                            },
                                            initialValue: '',
                                            validateTrigger: 'onBlur'
                                        })(
                                            <Input
                                                name="budget"
                                                addonAfter={Intl.get('contract.82', '元')}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get('common.product','产品')}
                                        id="apps"
                                        {...formItemLayout}
                                    >
                                        {
                                            getFieldDecorator('apps',{
                                                rules: [{required: true, message: Intl.get('leave.apply.select.atleast.one.app','请选择至少一个产品')}],
                                                validateTrigger: 'onBlur'
                                            })(
                                                <Select
                                                    mode='multiple'
                                                    placeholder={Intl.get('leave.apply.select.product','请选择产品')}
                                                    name="apps"
                                                    getPopupContainer={() => document.getElementById('add-sales-opportunity-apply-form')}
                                                    filterOption={(input, option) => ignoreCase(input, option)}
                                                >
                                                    {_.isArray(this.state.appList) && this.state.appList.length ?
                                                        this.state.appList.map((appItem, idx) => {
                                                            return (<Option key={idx} value={appItem.client_id}>{appItem.client_name}</Option>);
                                                        }) : null
                                                    }
                                                </Select>
                                            )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label require-item add-apply-time"
                                        label={Intl.get('leave.apply.inspect.success.time', '预计成交时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('expectdeal_time', {
                                            initialValue: moment()
                                        })(
                                            <DatePicker
                                                disabledDate={disabledDate}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('common.remark', '备注')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('remark', {
                                            initialValue: '',
                                            validateTrigger: 'onBlur'
                                        })(
                                            <Input
                                                type="textarea" id="remark" rows="3"
                                                placeholder={Intl.get('leave.apply.fill.in.remarks','请填写销售机会备注')}
                                            />
                                        )}
                                    </FormItem>
                                    <div className="submit-button-container">
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                            disabled={this.state.isSaving} data-tracename="点击保存添加
                                            销售机会申请">
                                            {Intl.get('common.save', '保存')}
                                            {this.state.isSaving ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.hideSalesOpportunityApplyAddForm}
                                            data-tracename="点击取消添加出差申请按钮">
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                        <div className="indicator">
                                            {saveResult ?
                                                (
                                                    <AlertTimer
                                                        time={saveResult === 'error' ? DELAY_TIME_RANGE.ERROR_RANGE : DELAY_TIME_RANGE.SUCCESS_RANGE}
                                                        message={this.state.saveMsg}
                                                        type={saveResult} showIcon
                                                        onHide={this.hideSaveTooltip}/>
                                                ) : ''
                                            }
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </GeminiScrollbar>
                        {this.state.isShowAddCustomer ? this.renderAddCustomer() : null}
                    </div>
                </div>
            </RightPanel>

        );
    }
}
AddSalesOpportunityApply.defaultProps = {
    hideSalesOpportunityApplyAddForm: function() {
    },
    form: {}
};
AddSalesOpportunityApply.propTypes = {
    hideSalesOpportunityApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddSalesOpportunityApply);