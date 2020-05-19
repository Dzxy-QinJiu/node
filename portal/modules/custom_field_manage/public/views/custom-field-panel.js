/**
 * Created by hzl on 2020/5/16.
 */
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { manageCustomTab, customFieldDefaultValue, customFieldCheckOptions, customFieldSelectOptions } from 'PUB_DIR/sources/utils/consts';
import {Form, Input, Checkbox, Select, Button, Icon} from 'antd';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
import { validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';
import SelectCustomField from './select-custom-field-component';
import {selectCustomFieldComponents} from '../utils';
require('../css/custom-field-panel.less');

class CustomFieldPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            tabType: props.tabType,
            defaultConfig: customFieldDefaultValue,
            editCustomField: props.editCustomField,
        };
    }

    componentWillReceiveProps(nextProps) {
        if ( !_.isEqual(this.state.tabType, nextProps.tabType) ) {
            this.setState({
                tabType: nextProps.tabType,
            });
        } else if (!_.isEqual(this.state.editCustomField, nextProps.editCustomField)) {
            this.setState({
                editCustomField: nextProps.editCustomField,
            });
        }
    }

    handleSubmit = (formItem) => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            } else {
                
            }
        });
    };

    renderFormContent = () => {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        // 选择字段类型
        const selectCustomType = getFieldValue('select');
        const selectComponent = _.find(selectCustomFieldComponents, item => item.customField === selectCustomType);
        const name = Intl.get('custom.field.title', '字段名');
        return (
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
                        initialValue: this.state.defaultConfig,
                        valuePropName: 'checked'
                    })(
                        <CheckboxGroup
                            options={customFieldCheckOptions}
                            defaultValue={this.state.defaultConfig}
                        />
                    )}
                </FormItem>
                {
                    _.isEmpty(this.state.editCustomField) ? (
                        <React.Fragment>
                            <FormItem>
                                {getFieldDecorator('select', {
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
                        </React.Fragment>

                    ) : (
                        <FormItem>
                            {
                                _.map(this.state.editCustomField.select_values, item => {
                                    return (
                                        <React.Fragment>
                                            <Input defaultValue={item}/>
                                        </React.Fragment>
                                    );
                                })
                            }
                        </FormItem>
                    )
                }

                {
                    false && <div className="submit-button-container">
                        <Button
                            disabled={this.state.loading}
                            type='primary'
                            onClick={this.handleSubmit.bind(this)}
                        >
                            {Intl.get('common.save', '保存')}
                            {
                                this.state.loading ? <Icon type="loading"/> : null
                            }
                        </Button>
                        <Button onClick={this.handleCancel.bind(this)}>
                            {Intl.get('common.cancel', '取消')}
                        </Button>
                    </div>
                }
            </Form>
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
    onClosePanel: noop,
};
CustomFieldPanel.propTypes = {
    form: PropTypes.form,
    tabType: PropTypes.string,
    editCustomField: PropTypes.Object,
    onClosePanel: PropTypes.func,
};

export default Form.create()(CustomFieldPanel);
