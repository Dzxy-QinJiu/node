/**
 * Created by hzl on 2019/8/5.
 * 客户阶段的添加和编辑表单
 */
import {Form, Input} from 'antd';
const FormItem = Form.Item;
const {TextArea} = Input;
import Trace from 'LIB_DIR/trace';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import CustomerStageStore from '../store/customer-stage-store';

class CustomerStageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...CustomerStageStore.getState(),
            formData: props.customerStage,
            isShowCustomerStagePanel: props.isShowCustomerStagePanel
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.isShowCustomerStagePanel) {
            this.setState({
                formData: nextProps.customerStage,
                isShowCustomerStagePanel: nextProps.isShowCustomerStagePanel
            });
        }
    }

    componentDidMount() {
        CustomerStageStore.listen(this.onChange);
    }

    componentWillUnmount() {
        CustomerStageStore.unlisten(this.onChange);
    }

    onChange = () => {
        this.setState(CustomerStageStore.getState());
    }

    // 取消事件
    handleCancel(e) {
        e.preventDefault();
        Trace.traceEvent(e, _.get(this.state, 'formData.id') ? '关闭添加客户阶段面板' : '关闭编辑客户阶段面板');
        this.props.cancelCustomerStagForm();
    }

    //保存客户阶段
    handleSubmit(e) {
        e.preventDefault();
        Trace.traceEvent(e, '保存客户阶段的信息');
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let formData = this.state.formData;
            let submitObj = {
                name: _.trim(values.name),
                status: values.status,
                description: values.description,
                teams: [],
                users: []
            };
            if (formData.id) {
                submitObj.id = formData.id;
            }
            this.props.submitSalesProcessForm(submitObj);
        });
    }

    validatorOrderName = (orderValue, callback) => {
        let existOrderStageList = this.state.salesStageList; // 已存在的订单阶段
        let isExist = _.find(existOrderStageList, item => item.name === orderValue);
        if (isExist) { // 和已存在的订单阶段名称是相同
            callback(Intl.get('crm.order.stage.name.verify', '该阶段名称已存在'));
        } else {
            callback();
        }
    };


    // 订单阶段唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            let orderValue = _.trim(value); // 文本框中的值
            let formData = this.state.formData;
            if (_.get(formData, 'id')) { // 编辑订单阶段
                if (_.get(formData, 'name') === orderValue) { // 没有修改阶段名称
                    callback();
                } else {
                    this.validatorOrderName(orderValue, callback);
                }
            } else { // 添加订单阶段
                this.validatorOrderName(orderValue, callback);
            }
        };
    };

    renderFormContent() {
        let formData = this.state.formData;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <Form layout='horizontal' className="form">
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.definition', '名称')}
                >
                    {getFieldDecorator('name', {
                        initialValue: formData.name,
                        rules: [{
                            required: true,
                            validator: this.getValidator()
                        }, nameLengthRule]
                    })(
                        <Input placeholder={Intl.get('crm.order.stage.name.placeholder', '请输入阶段名称')}/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.describe', '描述')}
                >
                    {getFieldDecorator('description', {
                        initialValue: formData.description,
                        rules: [{
                            required: true,
                            min: 1,
                            max: 200,
                            message: Intl.get('sales.stage.input.length200.tip', '最少1个字符,最多200个字符')
                        }]
                    })(
                        <TextArea
                            autosize={{minRows: 2, maxRows: 6}}
                            placeholder={Intl.get('crm.order.stage.destrip.palceholder', '请输入阶段的描述信息')}
                        />
                    )}
                </FormItem>
                <FormItem>
                    <SaveCancelButton
                        loading={this.state.isSavingSalesStage}
                        saveErrorMsg={this.state.saveStageErrMsg}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </FormItem>
            </Form>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="customer-stage-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={_.get(this.state, 'formData.id') ?
                    Intl.get('sales.process.edit.customer.stage', '编辑客户阶段') :
                    Intl.get('sales.process.add.customer.stage', '添加客户阶段')
                }
                content={this.renderFormContent()}
                dataTracename={_.get(this.state, 'formData.id') ? '编辑客户阶段' : '添加客户阶段'}
            />);
    }
}
function noop() {
}
CustomerStageForm.defaultProps = {
    submitSalesProcessForm: noop,
    closeProcessSalesProcessPanel: noop,
    handleConfirmChangeProcessStatus: noop,
    cancelCustomerStagForm: noop,
    isShowCustomerStagePanel: false,
    customerStage: {
        id: '', // 客户阶段id
        name: '', // 客户阶段名称,
        description: '', // 客户阶段描述
    }
};
CustomerStageForm.propTypes = {
    form: PropTypes.object,
    customerStage: PropTypes.object,
    isShowCustomerStagePanel: PropTypes.bool,
    closeProcessSalesProcessPanel: PropTypes.func,
    submitSalesProcessForm: PropTypes.func,
    handleConfirmChangeProcessStatus: PropTypes.func,
    cancelCustomerStagForm: PropTypes.func,
};
export default Form.create()(CustomerStageForm);