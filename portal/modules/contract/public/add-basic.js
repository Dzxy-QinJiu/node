var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 销售合同基本信息添加表单
 */

import { Form, Input, Select, DatePicker, Radio, Checkbox, Row, Col } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const CheckboxGroup = Checkbox.Group;
import ValidateMixin from '../../../mixins/ValidateMixin';
import BasicMixin from './mixin-basic';
import { COST_STRUCTURE } from '../consts';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';

const AddBasic = createReactClass({
    displayName: 'AddBasic',
    mixins: [ValidateMixin, BasicMixin],

    propTypes: {
        isEdit: PropTypes.bool
    },

    handleCostStructureChange: function(value) {
        let {formData} = this.state;
        formData.cost_structure = value.join();
        this.setState({formData});
    },

    handleCopyNumberSelect: function(value) {
        let {formData} = this.state;
        formData.copy_number = value;
        this.setState({formData});
    },

    render: function() {
        const formData = this.state.formData;

        let copyNumArray = [];
        for (let i = 1; i < 11; i++) {
            copyNumArray.push(i);
        }

        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 18 },
        };

        const formItemLayout2 = {
            labelCol: { span: 5 },
            wrapperCol: { span: 18 },
        };

        //成本额默认为0
        if (isNaN(formData.cost_price)) formData.cost_price = 0;

        //根据合同额和成本额计算毛利
        let calProfit = formData.contract_amount - formData.cost_price;
        if (isNaN(calProfit) || calProfit < 0) calProfit = '0';
        formData.gross_profit = parseFloat(calProfit).toFixed(2);

        if (!formData.need_invoice) formData.need_invoice = 'true';
        if(!formData.copy_number) formData.copy_number = copyNumArray[0];
        if(!formData.start_time) formData.start_time = moment().valueOf();
        if(!formData.end_time) formData.end_time = moment().valueOf();

        return (
            <Form layout='horizontal' className="add-basic" data-tracename="添加合同>基本信息">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    {this.renderNumField()}
                    {this.renderDateField()}
                    {this.renderCustomerField()}
                    {this.renderBuyerField()}
                    {this.renderUserField()}
                    {/*{this.renderTeamField()}*/}
                    {this.props.isEdit ? null : (
                        <FormItem
                            {...formItemLayout2}
                            label={Intl.get('common.belong.customer', '所属客户')}
                            className="form-item-append-icon-container"
                            required
                        >
                            {this.renderBelongCustomerField()}
                        </FormItem>
                    )}
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('contract.valid.term', '有效期限')}
                        required
                    >
                        <Row>
                            <Col span={11}>
                                <FormItem
                                    // label={Intl.get('contract.35', '起始时间')}
                                    validateStatus={this.getValidateStatus('start_time')}
                                    help={this.getHelpMessage('start_time')}
                                >
                                    <Validator rules={[this.validateStartAndEndTime('start_time')]}>
                                        <DatePicker
                                            name='start_time'
                                            value={formData.start_time ? moment(formData.start_time) : moment(moment().valueOf())}
                                            onChange={this.setField.bind(this, 'start_time')}
                                        />
                                    </Validator>
                                </FormItem>
                            </Col>
                            <Col span={2} style={{textAlign: 'center'}}>{Intl.get('common.time.connector', '至')}</Col>
                            <Col span={11}>
                                <FormItem
                                    // label={Intl.get('contract.105', '结束时间')}
                                    validateStatus={this.getValidateStatus('end_time')}
                                    help={this.getHelpMessage('end_time')}
                                >
                                    <Validator rules={[this.validateStartAndEndTime('end_time')]}>
                                        <DatePicker
                                            name='end_time'
                                            value={formData.end_time ? moment(formData.end_time) : moment(moment().valueOf())}
                                            onChange={this.setField.bind(this, 'end_time')}
                                        />
                                    </Validator>
                                </FormItem>
                            </Col>
                        </Row>
                    </FormItem>
                    {/* <FormItem
                        {...formItemLayout}
                        label={Intl.get('contract.35', '起始时间')}
                        validateStatus={this.getValidateStatus('start_time')}
                        help={this.getHelpMessage('start_time')}
                    >
                        <Validator rules={[this.validateStartAndEndTime('start_time')]}>
                            <DatePicker
                                name='start_time'
                                value={formData.start_time ? moment(formData.start_time) : ''}
                                onChange={this.setField.bind(this, 'start_time')}
                            />
                        </Validator>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('contract.105', '结束时间')}
                        validateStatus={this.getValidateStatus('end_time')}
                        help={this.getHelpMessage('end_time')}
                    >
                        <Validator rules={[this.validateStartAndEndTime('end_time')]}>
                            <DatePicker
                                name='end_time'
                                value={formData.end_time ? moment(formData.end_time) : ''}
                                onChange={this.setField.bind(this, 'end_time')}
                            />
                        </Validator>
                    </FormItem>*/}
                    <FormItem
                        {...formItemLayout2}
                        label={Intl.get('contract.32', '合同份数')}
                        required
                    >
                        <Select
                            placeholder="1--10"
                            value={formData.copy_number || copyNumArray[0]}
                            onSelect={this.handleCopyNumberSelect}
                        >
                            {copyNumArray.map(copyNum => {
                                return (
                                    <Option key={copyNum} value={copyNum}>{copyNum}</Option>
                                );
                            })}
                        </Select>
                    </FormItem>
                    <hr className="contract-divide-line" />

                    {this.renderAmountField()}
                    <FormItem
                        {...formItemLayout2}
                        label={Intl.get('contract.153', '成本额')}
                        validateStatus={this.getValidateStatus('cost_price')}
                        help={this.getHelpMessage('cost_price')}
                        className="form-item-append-icon-container"
                        required
                    >
                        <Validator rules={[getNumberValidateRule()]}>
                            <Input
                                name="cost_price"
                                value={this.parseAmount(formData.cost_price)}
                                onChange={this.setField.bind(this, 'cost_price')}
                            />
                        </Validator>
                        <span className="ant-form-text">{Intl.get('contract.155', '元')}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout2}
                        label={Intl.get('contract.165', '成本构成')}
                        required
                    >
                        <CheckboxGroup
                            name="cost_structure"
                            options={COST_STRUCTURE}
                            value={formData.cost_structure ? formData.cost_structure.split(',') : []}
                            onChange={this.handleCostStructureChange}
                        />
                    </FormItem>
                    <FormItem
                        {...formItemLayout2}
                        label={Intl.get('contract.154', '合同毛利')}
                        validateStatus={this.getValidateStatus('gross_profit')}
                        help={this.getHelpMessage('gross_profit')}
                        className="form-item-append-icon-container"
                        required
                    >
                        <Validator rules={[getNumberValidateRule()]}>
                            <Input
                                name="gross_profit"
                                disabled
                                value={formData.gross_profit}
                            />
                        </Validator>
                        <span className="ant-form-text">{Intl.get('contract.155', '元')}</span>
                    </FormItem>
                    <hr className="contract-divide-line" />            
                    <FormItem
                        {...formItemLayout2}
                        label={Intl.get('contract.107', '开发票')}
                        required
                    >
                        <RadioGroup
                            size='small'
                            value={formData.need_invoice}
                            onChange={this.setField.bind(this, 'need_invoice')}
                        >
                            <RadioButton key="1" value="true"><ReactIntl.FormattedMessage id="user.yes" defaultMessage="是" /></RadioButton>
                            <RadioButton key="2" value="false"><ReactIntl.FormattedMessage id="user.no" defaultMessage="否" /></RadioButton>
                        </RadioGroup>
                    </FormItem>
                    {this.renderStageField()}
                    {this.renderLabelField()}
                    {formData.category ? this.renderCategoryField() : null}
                    <hr className="contract-divide-line" />
                    {this.renderSalesRepField()}
                    {/*{this.renderSalesRepTeamField()}*/}
                    {this.renderRemarksField()}

                </Validation>
            </Form>
        );
    },
});

module.exports = AddBasic;


