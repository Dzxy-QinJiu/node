/**
 * Created by hzl on 2019/9/2.
 * 添加客户阶段面板
 */
import {Form, Input, TreeSelect} from 'antd';
const { SHOW_ALL } = TreeSelect;
const FormItem = Form.Item;
const {TextArea} = Input;
import Trace from 'LIB_DIR/trace';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {nameRule} from 'PUB_DIR/sources/utils/validate-util';
import CustomerStageForm from 'CMP_DIR/basic-form';

class CustomerStageFormPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    // 取消事件
    handleCancel(e) {
        e.preventDefault();
        Trace.traceEvent('关闭添加客户阶段面板');
        this.props.closeAddProcessFormPanel();
    }

    //保存客户阶段
    handleSubmit(event) {
        event.preventDefault();
        Trace.traceEvent(event, '保存客户阶段的信息');
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let submitObj = {
                name: _.trim(values.name),
            };
            this.props.submitSalesProcessForm(submitObj);
        });
    }


    // 客户阶段唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            let orderValue = _.trim(value); // 文本框中的值
            let existOrderStageList = this.props.salesProcessList; // 已存在的客户阶段
            let isExist = _.find(existOrderStageList, item => item.name === orderValue);
            if (isExist) { // 和已存在的客户阶段名称是相同
                callback(Intl.get('crm.order.stage.name.verify', '该阶段名称已存在'));
            } else {
                callback();
            }
        };
    };

    // 渲染客户阶段
    renderCustomerStage = () => {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <div>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('crm.order.stage.name', '阶段名称')}
                    key={key}
                >
                    {getFieldDecorator('stageName', {
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
                    key={key}
                >
                    {getFieldDecorator('description', {
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
            </div>
        );
    };

    // 添加阶段
    handleAddStage = () => {

    };

    renderFormContent() {
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
                        rules: [{
                            required: true,
                            validator: this.getValidator()
                        }, nameRule(Intl.get('weekly.report.customer.stage', '客户阶段'))]
                    })(
                        <Input placeholder={Intl.get('crm.order.stage.name.placeholder', '请输入阶段名称')}/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('customer.stage.stage.title', '阶段设置')}
                >
                    {getFieldDecorator('customer_stage', {
                        rules: [{
                            required: true,
                        }]
                    })(
                        <div>{this.renderCustomerStage()}</div>
                    )}
                </FormItem>
                <div
                    className="add-stage"
                    onClick={this.handleAddStage}
                >
                    {Intl.get('customer.stage.click.add.stage', '添加阶段')}
                </div>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('sales.process.suitable.objects', '适用范围')}
                >
                    {getFieldDecorator('scope', {
                    })(
                        <TreeSelect
                            allowClear={true}
                            treeData={this.props.treeSelectData}
                            treeCheckable={true}
                            treeDefaultExpandAll={true}
                            showCheckedStrategy={SHOW_ALL}
                            searchPlaceholder={Intl.get('contract.choose', '请选择')}
                            dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                        />
                    )}
                </FormItem>
                <FormItem>
                    <SaveCancelButton
                        loading={this.props.isSavingSalesStage}
                        saveErrorMsg={this.props.saveStageErrMsg}
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
                className="add-customer-stage-panel"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={Intl.get('sales.process.add.customer.stage', '添加客户阶段')}
                content={this.renderFormContent()}
                dataTracename='添加客户阶段'
            />);
    }
}
function noop() {
}
CustomerStageFormPanel.defaultProps = {
    cancelCustomerStageForm: noop,
    customerStage: {
        id: '', // 客户阶段id
        name: '', // 客户阶段名称,
    }
};
CustomerStageFormPanel.propTypes = {
    form: PropTypes.object,
    customerStage: PropTypes.object,
    submitSalesProcessForm: PropTypes.func,
    closeAddProcessFormPanel: PropTypes.func,
    salesProcessList: PropTypes.array,
    treeSelectData: PropTypes.array,
    isSavingSalesStage: PropTypes.boolean,
    saveStageErrMsg: PropTypes.string,
};
export default Form.create()(CustomerStageFormPanel);