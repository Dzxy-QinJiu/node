/**
 * Created by hzl on 2020/5/16.
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { manageCustomTab, customFieldDefaultValue,
    customFieldCheckOptions, customFieldSelectOptions } from 'PUB_DIR/sources/utils/consts';
import {Form, Input, Checkbox, Select, Button, Icon, message} from 'antd';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
import { validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';
import SelectCustomField from './select-custom-field-component';
import {selectCustomFieldComponents} from '../utils';
import ajax from '../ajax';
require('../css/custom-field-panel.less');

const TitleHeight = 100;

class CustomFieldPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            tabType: props.tabType, // tab类型，线索、机会、客户
            defaultCheckedValue: this.getDefaultCheckedValue(props.editCustomField), // 是否统计，是否支持排序，是否出现在表单中，默认全选
            editCustomField: props.editCustomField, // 编辑字段
            customFieldData: _.cloneDeep(props.customFieldData), // 自定义数据
        };
    }

    getDefaultCheckedValue = (editCustomField) => {
        let defaultCheckedValue = customFieldDefaultValue;
        if (!_.isEmpty( editCustomField)) {
            let setCheckedValue = [];
            if (_.get(editCustomField, 'need_statistic')) {
                setCheckedValue.push('need_statistic');
            }
            if (_.get(editCustomField, 'need_sort')) {
                setCheckedValue.push('need_sort');
            }
            if (_.get(editCustomField, 'need_show')) {
                setCheckedValue.push('need_show');
            }
            defaultCheckedValue = setCheckedValue;
        }
        return defaultCheckedValue;
    };

    componentWillReceiveProps(nextProps) {
        if ( !_.isEqual(this.state.tabType, nextProps.tabType) ) {
            this.setState({
                tabType: nextProps.tabType,
                customFieldData: _.cloneDeep(nextProps.customFieldData)
            });
        } else if (!_.isEqual(this.state.editCustomField, nextProps.editCustomField)) {
            this.setState({
                editCustomField: nextProps.editCustomField,
                defaultCheckedValue: this.getDefaultCheckedValue(nextProps.editCustomField)
            });
        }
    }

    firstAddCustomField = (submitObj) => {
        ajax.addCustomFieldConfig(submitObj).then( (result) => {
            if (_.get(result, 'id')) {
                this.props.updateCustomFieldData([result]);
                this.handleCancel();
                message.success(Intl.get('user.user.add.success', '添加成功'));
            } else {
                message.error(Intl.get('crm.154', '添加失败'));
            }
        }, (errMsg) => {
            message.error(errMsg || Intl.get('crm.154', '添加失败'));
        } );
    };

    continueAddCustomField = (customizedVariables, id ) => {
        ajax.addItemCustomField(customizedVariables, id).then( (result) => {
            if (_.get(result, 'key')) {
                this.props.updateCustomFieldData(result, 'add');
                this.handleCancel();
                message.success(Intl.get('user.user.add.success', '添加成功'));
            } else {
                message.error(Intl.get('crm.154', '添加失败'));
            }
        }, (errMsg) => {
            message.error(errMsg || Intl.get('crm.154', '添加失败'));
        } );
    };

    updateCustomField = (customizedVariables, id) => {
        ajax.updateItemCustomField(customizedVariables, id).then( (result) => {
            if (_.get(result, 'key')) {
                this.props.updateCustomFieldData(result, 'update');
                this.handleCancel();
                message.success(Intl.get('crm.218', '修改成功！'));
            } else {
                message.error(Intl.get('crm.219', '修改失败！'));
            }
        }, (errMsg) => {
            message.error(errMsg || Intl.get('crm.219', '修改失败！'));
        } );
    }

    handleSubmit = (formItem) => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            } else {
                let submitObj = {
                    customized_type: this.state.tabType
                };
                let customized_variables = {};
                customized_variables.name = _.get(values, 'name');
                const selectType = _.get(values, 'select');
                customized_variables.field_type = selectType;
                // 统计相关的值
                const defaultChecked = _.get(values, 'checkbox', this.state.defaultCheckedValue);
                _.each(defaultChecked, item => {
                    customized_variables[item] = true;
                });
                // select_value的值
                if (_.includes(['text', 'multitext', 'number'], selectType)) {
                    customized_variables.select_values = [_.get(formItem, 'placeholder')];
                } else if(selectType === 'date') {
                    customized_variables.select_values = [moment().valueOf()];
                } else {
                    customized_variables.select_values = _.get(formItem, 'select_arr');
                }

                const id = _.get(this.state.customFieldData, '[0]id');

                // 第一次添加
                if (_.isEmpty(this.state.customFieldData)) {
                    customized_variables.show_index = 1;
                    submitObj.customized_variables = [customized_variables];
                } else {
                    let customizedVariables = _.get(this.state.customFieldData, '[0]customized_variables');
                    if (_.isEmpty(this.state.editCustomField)) { // 说明是添加（在原来的基础上添加一条）
                        customized_variables.show_index = _.get(customizedVariables, 'length') + 1;
                    } else { // 编辑字段
                        const showIndex = _.get(this.state.editCustomField, 'show_index');
                        const key = _.get(this.state.editCustomField, 'key');
                        customized_variables.show_index = showIndex;
                        customized_variables.key = key;
                    }
                }
                if (_.isEmpty(this.state.customFieldData)) {
                    this.firstAddCustomField(submitObj);
                } else {
                    if (_.isEmpty(this.state.editCustomField)) {
                        this.continueAddCustomField(customized_variables, id);
                    } else {
                        this.updateCustomField(customized_variables, id);
                    }
                }
            }
        });
    };

    renderFormContent = () => {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const name = Intl.get('custom.field.title', '字段名');
        // 选择字段类型
        const selectCustomType = getFieldValue('select') || _.get(this.state.editCustomField, 'field_type');
        let selectComponent = _.find(selectCustomFieldComponents, item => item.customField === selectCustomType);
        // 编辑单项字段
        if (!_.isEmpty(this.state.editCustomField)) {
            const select_values = _.get(this.state.editCustomField, 'select_values');
            // 选择框，修改时，使用默认的值
            if (!getFieldValue('select')) {
                if (_.includes(['text', 'multitext', 'number'], selectCustomType)) {
                    if (select_values[0]) {
                        selectComponent.placeholder = select_values[0];
                    }
                } else {
                    selectComponent.select_arr = select_values;
                }
            }
        }
        const height = $(window).height() - TitleHeight;
        return (
            <GeminiScrollBar style={{height: height}}>
                <Form className="form">
                    <FormItem>
                        {getFieldDecorator('name', {
                            initialValue: _.get(this.state.editCustomField, 'name'),
                            rules: [validatorNameRuleRegex(10, name)],
                            validateTrigger: 'onBlur'
                        })(
                            <Input
                                placeholder={Intl.get('custom.field.input.placeholder', '请输入{name}', {name: name})}
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('checkbox', {
                            valuePropName: 'checked'
                        })(
                            <CheckboxGroup
                                options={customFieldCheckOptions}
                                defaultValue={this.state.defaultCheckedValue}
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('select', {
                            initialValue: _.get(this.state.editCustomField, 'field_type')
                        })(
                            <Select placeholder="选择字段类型">
                                {
                                    _.map(customFieldSelectOptions, item => {
                                        return <Option value={item.value}>{item.name}</Option>;
                                    })
                                }
                            </Select>
                        )}
                    </FormItem>
                    {
                        selectCustomType ? (
                            <SelectCustomField
                                form={this.props.form}
                                formItem={selectComponent}
                                handleCancel={this.handleCancel}
                                handleSubmit={this.handleSubmit}
                            />
                        ) : null
                    }
                </Form>
            </GeminiScrollBar>
        );
    };

    handleCancel = () => {
        this.props.onClosePanel();
    };
    
    render(){
        const {tabType, editCustomField} = this.state;
        let title = Intl.get('custom.field.add.title', '添加{name}字段', {name: manageCustomTab[tabType]});
        if (!_.isEmpty(editCustomField)) {
            title = Intl.get('custom.field.edit.title', '{name}字段', {name: _.get(editCustomField, 'name')});
        }
        return (
            <RightPanelModal
                className="custom-field-panel-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={title}
                content={this.renderFormContent()}
            />
        );
    }
}

function noop() {
}
CustomFieldPanel.defaultProps = {
    tabType: '',
    editCustomField: {},
    customFieldData: {},
    onClosePanel: noop,
    updateCustomFieldData: noop,
};
CustomFieldPanel.propTypes = {
    form: PropTypes.form,
    tabType: PropTypes.string,
    editCustomField: PropTypes.Object,
    customFieldData: PropTypes.Object,
    onClosePanel: PropTypes.func,
    updateCustomFieldData: PropTypes.func, // 添加、编辑后成功后，更新数据
};

export default Form.create()(CustomFieldPanel);