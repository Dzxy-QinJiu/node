const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * 采购合同基本信息添加表单
 */

import { Form } from 'antd';
import ValidateMixin from '../../../mixins/ValidateMixin';
import BasicMixin from './mixin-basic';
import { VIEW_TYPE } from '../consts';

const AddBuyBasic = React.createClass({
    mixins: [ValidateMixin, BasicMixin],
    render: function() {
        const formData = this.state.formData;

        return (
            <Form horizontal className="add-basic">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    {this.renderNumField()}
                    {this.renderUserField(VIEW_TYPE.BUY)}
                    {this.renderTeamField(VIEW_TYPE.BUY)}
                    {this.renderPurchaseTypeField()}
                    {this.renderDateField()}
                    {this.renderAmountField()}
                    {this.renderStageField()}
                    {formData.category ? this.renderCategoryField() : null}
                    {this.renderRemarksField()}
                </Validation>
            </Form>
        );
    }
});

module.exports = AddBuyBasic;

