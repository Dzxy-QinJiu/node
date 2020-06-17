/**
 * Created by jinfeng on 2015/12/28.
 */
import {Form, Input} from 'antd';
const FormItem = Form.Item;
const {TextArea} = Input;
import Trace from 'LIB_DIR/trace';
import {validatorNameRuleRegex} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
const SalesStageStore = require('../store/sales-stage-store');

class SalesStageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...SalesStageStore.getState(),
            formData: props.salesStage,
            salesStageFormShow: props.salesStageFormShow
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.salesStageFormShow) {
            this.setState({
                formData: nextProps.salesStage,
                salesStageFormShow: nextProps.salesStageFormShow
            });
        }
    }

    componentDidMount() {
        SalesStageStore.listen(this.onChange);
    }

    componentWillUnmount() {
        SalesStageStore.unlisten(this.onChange);
    }

    onChange = () => {
        this.setState(SalesStageStore.getState());
    }

    //取消事件
    handleCancel(e) {
        e.preventDefault();
        Trace.traceEvent(e, _.get(this.state, 'formData.id') ? '关闭添加订单阶段面板' : '关闭编辑订单阶段面板');
        this.props.cancelSalesStageForm();
    }

    //保存订单阶段
    handleSubmit(e) {
        e.preventDefault();
        Trace.traceEvent(e, '保存订单阶段的信息');
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let formData = this.state.formData;
            let submitObj = {
                name: _.trim(values.name),
                description: values.description
            };
            if (formData.id) {
                submitObj.id = formData.id;
            }
            this.props.submitSalesStageForm(submitObj);
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
                    label={Intl.get('crm.order.stage.name', '阶段名称')}
                >
                    {getFieldDecorator('name', {
                        initialValue: formData.name,
                        rules: [{
                            required: true,
                            validator: this.getValidator()
                        }, validatorNameRuleRegex(10, Intl.get('crm.order.stage', '订单阶段'))],
                        validateTrigger: 'onBlur'
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
                        }],
                        validateTrigger: 'onBlur'
                    })(
                        <TextArea autosize={{minRows: 2, maxRows: 6}}
                            placeholder={Intl.get('crm.order.stage.destrip.palceholder', '请输入阶段的描述信息')}
                        />
                    )}
                </FormItem>
                <FormItem>
                    <SaveCancelButton loading={this.state.isSavingSalesStage}
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
                className="stage-add-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={_.get(this.state, 'formData.id') ? Intl.get('crm.order.stage.edit', '编辑订单阶段') : Intl.get('crm.order.stage.add', '添加订单阶段')}
                content={this.renderFormContent()}
                dataTracename={_.get(this.state, 'formData.id') ? '编辑订单阶段' : '添加订单阶段'}
            />);
    }
}
function noop() {
}
SalesStageForm.defaultProps = {
    submitSalesStageForm: noop,
    cancelSalesStageForm: noop,
    salesStageFormShow: false,
    salesStage: {
        id: '',
        name: '',
        index: '',
        description: ''
    }
};
SalesStageForm.propTypes = {
    form: PropTypes.object,
    salesStage: PropTypes.object,
    salesStageFormShow: PropTypes.bool,
    cancelSalesStageForm: PropTypes.func,
    submitSalesStageForm: PropTypes.func
};
module.exports = Form.create()(SalesStageForm);
