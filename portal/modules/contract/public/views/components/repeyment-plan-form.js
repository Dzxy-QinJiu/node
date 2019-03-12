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
    // 获取日期
    getDynamicDate(num, value) {
        if (!isNaN(num)) {
            const signDate = this.props.signDate;
            const count = parseInt(num);
            return moment(signDate).add(count, value).valueOf();
        }else {
            return '';
        }
    }
    // 日期类型变化事件
    onUnitChange(value) {
        const {formData} = this.state;
        formData.unit = value;

        const num = formData.num;

        formData.date = this.getDynamicDate(num, value);
        this.setState({formData});
    }
    // 日期处理函数，根据数字动态的计算输入的日期与签订时间的间隔
    onNumChange(e) {
        const num = e.target.value;
        const {formData} = this.state;
        formData.num = num;

        formData.date = this.getDynamicDate(num, formData.unit);
        this.setState({formData});
    }
    // 验证
    getValidatedValue(cb) {
        // flag: 验证未通过状态
        let flag = true, saveObj = {};
        this.props.form.validateFields((err,value) => {
            if(err) {
                flag = true; // 验证未通过
                _.isFunction(cb) && cb(flag);
                return false;
            }
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
            <Form layout='inline' className='repayment-edit-form detailcard-form-container new-add-form-container'>
                {Intl.get('contract.78','从签订日起')}
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
                    <Option key="days" value="days">{Intl.get('contract.79','日')}</Option>
                    <Option key="weeks" value="weeks">{Intl.get('common.time.unit.week','周')}</Option>
                    <Option key="months" value="months">{Intl.get('common.time.unit.month','月')}</Option>
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
                {Intl.get('contract.155','元"')}
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
