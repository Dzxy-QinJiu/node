/**
 * Created by hzl on 2019/8/5.
 * 销售流程的添加表单
 */
import {Form, Input, Switch, TreeSelect} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const { SHOW_PARENT } = TreeSelect;
const FormItem = Form.Item;
const {TextArea} = Input;
import Trace from 'LIB_DIR/trace';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import SalesProcessStore from '../store';
import {nameRule} from 'PUB_DIR/sources/utils/validate-util';

class SalesProcessForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...SalesProcessStore.getState(),
        };
    }

    componentDidMount() {
        SalesProcessStore.listen(this.onChange);
    }

    componentWillUnmount() {
        SalesProcessStore.unlisten(this.onChange);
    }

    onChange = () => {
        this.setState(SalesProcessStore.getState());
    }

    // 取消事件
    handleCancel(event) {
        event.preventDefault();
        Trace.traceEvent(event, '关闭添加销售流程面板');
        this.props.closeAddProcessFormPanel();
    }

    //保存销售流程
    handleSubmit(event) {
        event.preventDefault();
        Trace.traceEvent(event, '保存销售流程的信息');
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let submitObj = {
                name: _.trim(values.name),
                status: '1', // values.status === true ? '1' : '0',
                description: values.description,
                // scope: values.scope
            };
            this.props.submitSalesProcessForm(submitObj);
        });
    }

    // 销售流程唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            let processValue = _.trim(value); // 文本框中的值
            let salesProcessList = this.state.salesProcessList; // 已存在的销售流程
            let isExist = _.find(salesProcessList, item => item.name === processValue);
            if (isExist) { // 和已存在的销售流程名称是相同
                callback(Intl.get('sales.process.name.verify.exist', '该销售流程已存在'));
            } else {
                callback();
            }
        };
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
                            validator: this.getValidator()
                        }, nameRule(Intl.get('menu.sales.process', '销售流程'))]
                    })(
                        <Input placeholder={Intl.get('sales.process.name.placeholder', '请输入销售流程名称')}/>
                    )}
                </FormItem>
                {/**
                 * todo  暂时隐藏
                 * <FormItem
                 {...formItemLayout}
                 label={Intl.get('common.status', '状态')}
                 >
                 {getFieldDecorator('status', {
                     initialValue: true
                 })(
                     <Switch defaultChecked />
                 )}
                 </FormItem>
                 *
                 */}
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.describe', '描述')}
                >
                    {getFieldDecorator('description', {
                        rules: [{
                            required: true,
                            min: 1,
                            max: 200,
                            message: Intl.get('sales.stage.input.length200.tip', '最少1个字符,最多200个字符')
                        }]
                    })(
                        <TextArea
                            autosize={{minRows: 2, maxRows: 6}}
                            placeholder={Intl.get('sales.process.destrip.placeholder', '请输入销售流程的描述信息')}
                        />
                    )}
                </FormItem>
                {
                    /**
                     * todo 暂时隐藏
                     * <FormItem
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
                             showCheckedStrategy={SHOW_PARENT}
                             searchPlaceholder={Intl.get('sales.process.suitable.objects.placeholder', '请选择适用该流程的团队或个人')}
                             dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                         />
                     )}
                     </FormItem>
                     * */
                }
                <FormItem>
                    <SaveCancelButton
                        loading={this.props.isLoading}
                        saveErrorMsg={this.props.saveResult === 'error' ? Intl.get('common.save.failed', '保存失败!') : null}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </FormItem>
            </Form>
        );
    }

    render = () => {
        return (
            <RightPanelModal
                className="salse-process-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={Intl.get('sales.process.add.process', '添加销售流程')}
                content={this.renderFormContent()}
                dataTracename={Intl.get('sales.process.add.process', '添加销售流程')}
            />);
    }
}
function noop() {
}
SalesProcessForm.defaultProps = {
    form: {},
    submitSalesProcessForm: noop,
    closeAddProcessFormPanel: noop,
    treeSelectData: [],
    isLoading: false,
    saveResult: ''
};
SalesProcessForm.propTypes = {
    form: PropTypes.object,
    closeAddProcessFormPanel: PropTypes.func,
    submitSalesProcessForm: PropTypes.func,
    treeSelectData: PropTypes.array,
    isLoading: PropTypes.boolean,
    saveResult: PropTypes.string,
};

export default Form.create()(SalesProcessForm);