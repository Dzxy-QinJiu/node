/**
 * Created by hzl on 2019/9/2.
 * 添加客户阶段面板
 */
import {Form, Input, TreeSelect} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const { SHOW_ALL } = TreeSelect;
const FormItem = Form.Item;
const {TextArea} = Input;
import Trace from 'LIB_DIR/trace';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {nameRule} from 'PUB_DIR/sources/utils/validate-util';
import { CUSTOMER_STAGE_COLOR } from 'PUB_DIR/sources/utils/consts';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import classNames from 'classnames';

class CustomerStageFormPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemKeys: [0, 1],
        };
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
            let names = _.filter(values.names, item => item);
            let descriptions = _.filter(values.description, item => item);
            let length = names.length;
            let customer_stages = [];
            for (let i = 0; i < length; i++) {
                customer_stages.push({
                    order: i + 1,
                    name: names[i],
                    description: descriptions[i],
                    color: CUSTOMER_STAGE_COLOR[i]
                });
            }
            let submitObj = {
                name: _.trim(values.name),
                customer_stages: customer_stages,
                scope: values.scope
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
        let itemKeys = this.state.itemKeys;
        return (
            <div>
                {_.map(itemKeys, (key, index) => {
                    return (
                        <div className="item-set-stage-wrap" key={key}>
                            {this.renderItemContent(key, index)}
                        </div>);
                })}
            </div>
        );
    };


    renderItemContent = (key, index) => {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        let cls = classNames('operator-zone', {
            'no-show-delete-icon': _.get(this.state.itemKeys, 'length') < 3,
        });
        return (
            <div key={key}>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('crm.order.stage.name', '阶段名称')}
                >
                    {getFieldDecorator(`names[${key}]`, {
                        rules: [{
                            validator: this.getValidator()
                        }, nameRule(Intl.get('weekly.report.customer.stage', '客户阶段'))],
                        validateTrigger: 'onBlur'
                    })(
                        <Input placeholder={Intl.get('crm.order.stage.name.placeholder', '请输入阶段名称')}/>
                    )}
                    <div
                        className={cls}
                        onClick={this.handleDeleteCustomerStage.bind(this, key)}
                    >
                        <i className="icon-delete iconfont handle-btn-item" />
                    </div>

                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.stage.describe', '阶段描述')}
                >
                    {getFieldDecorator(`description[${key}]`, {
                        rules: [{
                            min: 1,
                            max: 200,
                            message: Intl.get('sales.stage.input.length200.tip', '最少1个字符,最多200个字符')
                        }],
                        validateTrigger: 'onBlur'
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
    handleAddCustomerStage = () => {
        let itemKeys = this.state.itemKeys;
        // 元素key数组中最后一个元素的key
        let lastItemKey = _.get(itemKeys, `[${itemKeys.length - 1}]`, 0);
        // 新加元素的key
        let addItemKey = lastItemKey + 1;
        itemKeys.push(addItemKey);
        this.setState(itemKeys);
    };

    // 删除客户阶段
    handleDeleteCustomerStage = (key) => {
        let itemKeys = this.state.itemKeys;
        // 过滤调要删除元素的key
        itemKeys = _.filter(itemKeys, item => item !== key);
        this.setState({itemKeys});
    };

    getContainerHeight = () => {
        const PADDING = 100;
        return $('body').height()
            - $('.member-detail-container .right-panel-modal-title').outerHeight(true)
            - $('.member-detail-container .ant-tabs-bar').outerHeight(true)
            - PADDING;
    };

    renderFormContent() {
        const {getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        const height = this.getContainerHeight();
        let cls = classNames('add-stage', {
            'no-show-add-stage-tips': _.get(this.state.itemKeys, 'length') > 7,
        });

        return (
            <div className="add-customer-stage-form-wrap" style={{height: height}}>
                <GeminiScrollBar style={{height: height}}>
                    <Form layout='horizontal' className="form">
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('common.definition', '名称')}
                        >
                            {getFieldDecorator('name', {
                                initialValue: this.props.saleProcesTitle,
                                rules: [{
                                    required: true,
                                    validator: this.getValidator()
                                }, nameRule(Intl.get('weekly.report.customer.stage', '客户阶段'))],
                                validateTrigger: 'onBlur'
                            })(
                                <Input placeholder={Intl.get('crm.order.stage.name.placeholder', '请输入阶段名称')}/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('customer.stage.stage.title', '阶段设置')}
                        >
                            {getFieldDecorator('customer_stages', {
                                rules: [{
                                    required: true,
                                }],
                                validateTrigger: 'onBlur'
                            })(
                                <div>{this.renderCustomerStage()}</div>
                            )}
                            <div
                                className={cls}
                                onClick={this.handleAddCustomerStage}
                            >
                                {Intl.get('customer.stage.click.add.stage', '添加阶段')}
                            </div>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('sales.process.suitable.objects', '适用范围')}
                        >
                            {getFieldDecorator('scope', {
                                rules: [{
                                    required: true,
                                }],
                                validateTrigger: 'onBlur'
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
                </GeminiScrollBar>
            </div>
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
    saleProcesTitle: PropTypes.string,
};
export default Form.create()(CustomerStageFormPanel);