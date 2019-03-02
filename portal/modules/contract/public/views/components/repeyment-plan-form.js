/** Created by 2019-03-02 15:42 */
import { Form, Input, Select } from 'antd';
import { getNumberValidateRule, numberAddNoMoreThan } from 'PUB_DIR/sources/utils/validate-util';
const FormItem = Form.Item;

class RepeymentPlanForm extends React.Component{
    constructor(props){
        super(props);
        let formData = this.getInitialFormData();
        formData = {...formData,...props.formData};
        this.state = {
            formData
        };
    }
    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(this.props.formData, nextProps.formData)){
            this.setState({
                formData: nextProps.formData
            });
        }
    }
    getInitialFormData() {
        return {
            type: 'repay_plan',
            unit: 'days',
        };
    }
    // 日期类型变化事件
    onUnitChange(value) {
        const {formData} = this.state;
        formData.unit = value;

        const num = formData.num;

        if (!isNaN(num)) {
            const signDate = this.props.signDate;
            const count = parseInt(num);
            formData.date = moment(signDate).add(count, value).valueOf();
        }

        this.setState({formData});
    }
    // 时间处理函数
    onNumChange(e) {
        const num = e.target.value;
        const {formData} = this.state;
        formData.num = num;

        if (!isNaN(num)) {
            const count = parseInt(num);
            const signDate = this.props.signDate;
            formData.date = moment(signDate).add(count, formData.unit).valueOf();
        }

        this.setState({formData});
    }
    // 验证
    getValidatedValue(cb) {
        let flag = true, saveObj = {};
        this.props.form.validateFields((err,value) => {
            if(err) { flag = true; _.isFunction(cb) && cb(flag); return false; }
            flag = false;
            let { formData } = this.state;
            formData = _.cloneDeep(formData);

            saveObj = {...formData,...value};
            delete saveObj.unit;
            delete saveObj.num;
            _.isFunction(cb) && cb(flag, saveObj);
        });
        return {valid: flag, data: saveObj};
    }
    render() {
        let {getFieldDecorator} = this.props.form;
        return (
            <Form layout='inline' className='repayment-edit-form detailcard-form-container new-add-repayment-container'>
                <ReactIntl.FormattedMessage id="contract.78" defaultMessage="从签订日起" />
                <FormItem>
                    {
                        getFieldDecorator('num', {
                            initialValue: this.state.formData.num,
                            rules: [{required: true, message: Intl.get('contract.44', '不能为空')}, getNumberValidateRule()]
                        })(
                            <Input
                                onChange={this.onNumChange.bind(this)}
                            />
                        )
                    }
                </FormItem>
                <Select
                    value={this.state.formData.unit}
                    onChange={this.onUnitChange.bind(this)}
                >
                    <Option key="days" value="days"><ReactIntl.FormattedMessage id="contract.79" defaultMessage="日" /></Option>
                    <Option key="weeks" value="weeks"><ReactIntl.FormattedMessage id="common.time.unit.week" defaultMessage="周" /></Option>
                    <Option key="months" value="months"><ReactIntl.FormattedMessage id="common.time.unit.month" defaultMessage="月" /></Option>
                </Select>
                {Intl.get('contract.80', '内')}，
                {Intl.get('contract.93', '应收回款')}
                <FormItem>
                    {
                        getFieldDecorator('amount', {
                            initialValue: this.state.formData.amount,
                            rules: [{required: true, message: Intl.get('contract.44', '不能为空')}, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.contractAmount, this.props.repaymentsAmount, Intl.get('contract.161', '已超合同额'))]
                        })(
                            <Input/>
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元" />
            </Form>
        );
    }
}

RepeymentPlanForm.propTypes = {
    signDate: PropTypes.number,
    contractAmount: PropTypes.number,
    repaymentsAmount: PropTypes.number,
    formData: PropTypes.object,
    form: PropTypes.object
};

module.exports = Form.create()(RepeymentPlanForm);
