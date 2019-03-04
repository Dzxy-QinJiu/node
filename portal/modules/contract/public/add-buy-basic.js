var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 采购合同基本信息添加表单
 */

import { Form } from 'antd';
import ValidateMixin from '../../../mixins/ValidateMixin';
import BasicMixin from './mixin-basic';
import { VIEW_TYPE } from '../consts';

const AddBuyBasic = createReactClass({
    displayName: 'AddBuyBasic',
    mixins: [ValidateMixin, BasicMixin],

    render: function() {
        const formData = this.state.formData;

        return (
            <Form layout='horizontal' className="add-basic" data-tracename='添加采购合同>基本信息'>
                <Validation ref="validation" onValidate={this.handleValidate}>
                    {this.renderNumField()}
                    {this.renderUserField()}
                    {this.renderPurchaseTypeField()}
                    {this.renderDateField()}
                    {this.renderAmountField()}
                    {this.renderStageField()}
                    {formData.category ? this.renderCategoryField() : null}
                    {this.renderRemarksField()}
                </Validation>
            </Form>
        );
    },
});

module.exports = AddBuyBasic;


