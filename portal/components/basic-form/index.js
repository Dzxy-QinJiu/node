/**
 * Created by hzl on 2019/9/6.
 * 基础表单
 */
require('./index.less');
import {Form, Input, Button, Icon} from 'antd';
const FormItem = Form.Item;
const {TextArea} = Input;
import {nameRule} from 'PUB_DIR/sources/utils/validate-util';

class BasicForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: props.currentData, // 当前的数据
            customerStageList: props.customerStageList, // 客户阶段列表
        };
    }

    validatorOrderName = (orderValue, callback) => {
        let existOrderStageList = this.state.customerStageList; // 已存在的客户阶段
        let isExist = _.find(existOrderStageList, item => item.name === orderValue);
        if (isExist) { // 和已存在的客户阶段名称是相同
            callback(Intl.get('crm.order.stage.name.verify', '该阶段名称已存在'));
        } else {
            callback();
        }
    };


    // 客户阶段唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            let orderValue = _.trim(value); // 文本框中的值
            let formData = this.state.formData;
            if (_.get(formData, 'id')) { // 编辑客户阶段
                if (_.get(formData, 'name') === orderValue) { // 没有修改阶段名称
                    callback();
                } else {
                    this.validatorOrderName(orderValue, callback);
                }
            } else { // 添加客户阶段
                this.validatorOrderName(orderValue, callback);
            }
        };
    };

    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let formData = this.state.formData;
            let submitObj = {
                name: _.trim(values.name),
                description: values.description,
            };
            if (formData.id) {
                submitObj.id = formData.id;
            }
            this.props.handleSubmit(submitObj);
        });
    };

    handleCancel = () => {
        this.props.handleCancel();
    };

    render = () => {
        let formData = this.state.formData;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <Form layout='horizontal' className="customer-stage-form">
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('crm.order.stage.name', '阶段名称')}
                >
                    {getFieldDecorator('name', {
                        initialValue: formData.name,
                        rules: [{
                            validator: this.getValidator()
                        }, nameRule(Intl.get('weekly.report.customer.stage', '客户阶段'))]
                    })(
                        <Input placeholder={Intl.get('crm.order.stage.name.placeholder', '请输入阶段名称')}/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.stage.describe', '阶段描述')}
                >
                    {getFieldDecorator('description', {
                        initialValue: formData.description,
                        rules: [{
                            min: 1,
                            max: 200,
                            message: Intl.get('sales.stage.input.length200.tip', '最少1个字符,最多200个字符')
                        }]
                    })(
                        <TextArea
                            autosize={{minRows: 1, maxRows: 6}}
                            placeholder={Intl.get('crm.order.stage.destrip.palceholder', '请输入阶段的描述信息')}
                        />
                    )}
                </FormItem>
                <FormItem>
                    {
                        this.props.isShowSaveBtn ? (
                            <div className="save-buttons-zone">
                                <Button
                                    className="confirm-btn"
                                    disabled={this.props.loading}
                                    onClick={this.handleSubmit}
                                    type="primary"
                                >
                                    {
                                        this.props.loading ? <Icon type="loading"/> : null
                                    }
                                    {Intl.get('common.confirm', '确认')}
                                </Button>
                                <Button
                                    className="cancel-btn"
                                    onClick={this.handleCancel}
                                >
                                    {Intl.get('common.cancel', '取消')}
                                </Button>
                            </div>
                        ) : null
                    }
                </FormItem>
            </Form>
        );
    }
}

BasicForm.propTypes = {
    form: PropTypes.object,
    currentData: PropTypes.object,
    customerStageList: PropTypes.array,
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func,
    isShowSaveBtn: PropTypes.boolean,
    loading: PropTypes.boolean,
};

export default Form.create()(BasicForm);
