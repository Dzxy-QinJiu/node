/**
 * Created by jinfeng on 2015/12/28.
 */
import {Form, Input} from 'antd';
const FormItem = Form.Item;
const {TextArea} = Input;
import Trace from 'LIB_DIR/trace';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
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
    // 订单阶段唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            // 首先，判断文本框是否有值，没有值，提示请输入阶段名称；有值时，判断是否有订单阶段
            // 有订单阶段时，需要判断编辑或是添加的订单阶段名称，和已有的是否相同，相同的话，提示该阶段名称已存在
            // 若只是编辑订单阶段的描述，即_.get(formData, 'name') === orderValue，无需出现提示信息
            // 没有订单阶段时，不需要判断，直接添加即可；
            let orderValue = _.trim(value); // 文本框中的值
            if (orderValue) { // 订单阶段名称
                let existOrderStageList = this.state.salesStageList; // 已存在的订单阶段
                let length = _.get(existOrderStageList, 'length');
                if (length) { // 已存在订单阶段
                    let formData = this.state.formData;
                    if (_.get(formData, 'name') === orderValue) { // 编辑订单信息，不修改名称的处理
                        callback();
                    } else {
                        let isExist = _.find(existOrderStageList, item => item.name === orderValue);
                        if (isExist) {
                            callback(Intl.get('crm.order.stage.name.verify', '该阶段名称已存在'));
                        } else {
                            callback();
                        }
                    }
                } else { // length === 0,说明无订单阶段，不需要判断订单阶段的名称是否存在
                    callback();
                }

            } else { // 订单阶段名称的值为空时的提示信息
                callback(Intl.get('crm.order.stage.name.placeholder', '请输入阶段名称'));
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
