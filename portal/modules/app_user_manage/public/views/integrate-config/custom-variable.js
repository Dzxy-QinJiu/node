/** Created by 2019-05-28 16:23 */
// 自定义属性的添加，编辑
import './custom-variable.less';
import { Form, Button, Icon, Input, Col} from 'antd';
const FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import classNames from 'classnames';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {productKeyRule, productDesRule} from 'PUB_DIR/sources/utils/validate-util';

// 自定义属性变量的字段名
const CUSTOM_VARIABLE_FIELD = 'custom_variable';
const CUSTOM_TYPES = {
    key: 'key',
    desc: 'description'
};
// 自定义属性的最大个数(2),总共7个减去固定的5个
const maxCustomVariableCount = 2;

class CustomVariable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            displayType: props.displayType || 'text',
            value: this.dealCustomVariable(props.value),
            submitErrorMsg: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                value: this.dealCustomVariable(nextProps.value),
                loading: false,
                displayType: nextProps.displayType || 'text',
                submitErrorMsg: '',
            });
        }
    }

    setEditable(type, e) {
        let value = this.state.value;
        if(type === 'add') {
            value = [{
                key: '',
                description: '',
                keyErrMsg: '',
                desErrMsg: ''
            }];
        }
        this.setState({
            displayType: 'edit',
            value,
        });
        Trace.traceEvent(e, '点击编辑' + CUSTOM_VARIABLE_FIELD);
    }

    // 添加自定义属性框
    addCustomVariable = () => {
        let value = this.state.value;
        // 自定义属性不能超过最大个数
        if(_.get(value, 'length') < maxCustomVariableCount) {
            value.push({
                key: '',
                description: '',
                keyErrMsg: '',
                desErrMsg: ''
            });
            this.setState({
                value
            });
        }
    };

    // 删除自定义属性
    deleteCustomVariable = (index) => {
        let { value } = this.state;

        value.splice(index, 1);
        // 清除form数据，以免缓存
        this.props.form.resetFields();
        this.setState({
            value
        }, () => {

        });
    };

    //输入框改变事件
    onInputChange = (type, index, e) => {
        let inputValue = e.target.value;
        let value = this.state.value;
        let fieldName = CUSTOM_VARIABLE_FIELD + index;
        if(inputValue) {
            // key发生变化
            if(type === CUSTOM_TYPES.key) {
                fieldName += CUSTOM_TYPES.key;
                if(!productKeyRule.pattern.test(inputValue)) {
                    value[index].keyErrMsg = productKeyRule.message;
                }else {
                    value[index].key = inputValue;
                    value[index].keyErrMsg = '';
                }
            }
            else if(type === CUSTOM_TYPES.desc) {// 描述发生变化
                fieldName += CUSTOM_TYPES.desc;
                if(!productDesRule.pattern.test(inputValue)) {
                    value[index].desErrMsg = productDesRule.message;
                }else {
                    value[index].description = inputValue;
                    value[index].desErrMsg = '';
                }
            }
        }else {
            // 没值时，清除所有的参数
            value[index][type] = '';
            if(type === CUSTOM_TYPES.key) {
                value[index].keyErrMsg = '';
            }else { value[index].desErrMsg = ''; }
        }
        this.setState({
            value
        }, () => {
            this.props.form.validateFields([fieldName], {force: true});
        });
    };

    // 处理自定义属性集合
    dealCustomVariable = (data) => {
        // data: {key: 描述}, 如{status: '状态'}
        let keys = _.keys(data);
        return _.map(keys,key => {
            return {
                key,
                description: data[key],
                keyErrMsg: '',
                desErrMsg: ''
            };
        });
    };

    //反编译自定义属性集合
    reverseDeakCustomVariable = () => {
        let value = this.state.value;
        let obj = {};
        _.each(value, item => {
            obj[item.key] = item.description;
        });
        return obj;
    };

    getCustomVariableKeyValidateRules = (index) => {
        return {
            validator: (rule, value, callback) => {
                let errMsg = _.get(this.state.value, `[${index}].keyErrMsg`, '');
                if (errMsg) {
                    callback(errMsg);
                } else {
                    // 判断key是否有值
                    if (this.state.value[index].key) {
                        callback();
                    } else {
                        callback(Intl.get('app.user.manage.custom.variable.no.key.tip', '自定义属性的key不能为空'));
                    }
                }
            }
        };
    };

    getCustomVariableDesValidateRules = (index) => {
        return {
            validator: (rule, value, callback) => {
                let errMsg = _.get(this.state.value, `[${index}].desErrMsg`, '');
                if (errMsg) {
                    callback(errMsg);
                } else {
                    // 判断description是否有值
                    if (this.state.value[index].description) {
                        callback();
                    } else {
                        callback(Intl.get('app.user.manage.custom.variable.no.des.tip', '自定义属性的描述不能为空'));
                    }
                }
            }
        };
    };

    handleCancel = (e) => {
        this.setState({
            value: this.dealCustomVariable(this.props.value),
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + CUSTOM_VARIABLE_FIELD + '的修改');
    };

    handleSubmit = (e) => {
        this.props.form.validateFields((err, value) => {
            if(err) return false;
            Trace.traceEvent(e, '保存对' + CUSTOM_VARIABLE_FIELD + '的修改');
            let saveObj = {
                id: this.props.id
            };
            saveObj.custom_variable = this.reverseDeakCustomVariable();
            this.setState({
                loading: true
            });

            const setDisplayState = () => {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: this.dealCustomVariable(saveObj.custom_variable),
                    displayType: 'text'
                });
            };

            if (!_.isEqual(saveObj.custom_variable, this.props.value)) {
                this.props.saveEditInput(saveObj, () => {
                    setDisplayState();
                }, (errorMsg) => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                    });
                });
            } else {
                setDisplayState();
            }
        });
    };

    render() {
        let displayCls = classNames({
            'clearfix': true,
            'custom-variables-wrapper': true,
            'editing': this.state.displayType === 'edit'
        });

        let displayText = this.state.value;
        let textBlock = null;
        let cls = classNames('edit-container',{
            'hover-show-edit': this.props.hasEditPrivilege
        });
        let {getFieldDecorator} = this.props.form;
        let itemSize = _.get(displayText, 'length');

        if (this.state.displayType === 'text') {
            if (_.get(displayText, '[0]')) {
                textBlock = (
                    <div className={cls}>
                        <div className="edit-text-wrapper">
                            {
                                _.map(displayText, item => {
                                    return (
                                        <div className="custom-variable-item">
                                            <span className="custom-variable-key">key：{item.key}</span>
                                            <span>{Intl.get('common.describe', '描述')}：{item.description}</span>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn
                                title={Intl.get('common.update', '修改')}
                                onClick={this.setEditable.bind(this, 'edit')}
                            />) : null}
                    </div>
                );
            } else {// 添加按钮
                textBlock = (
                    <span>
                        {this.props.hasEditPrivilege ? (
                            <Button type="primary" onClick={this.setEditable.bind(this, 'add')}>
                                {this.props.addBtnTip}
                            </Button>
                        ) : null}
                    </span>
                );
            }
        }
        let inputBlock = this.state.displayType === 'edit' ? (
            <div className="custom-variable-wrap">
                <Form className="clearfix" layout='horizontal' autoComplete="off" style={{width: this.props.width || '100%'}}>
                    {
                        _.map(displayText, (item, index) => {
                            const fieldName = CUSTOM_VARIABLE_FIELD + index;
                            // 展示删除按钮， 自定义属性数组长度不为1时展示
                            const isShowDeleteBtn = itemSize !== 1;
                            return (
                                <div className="custom-form-item ant-row">
                                    <Col span={11}>
                                        <FormItem
                                            key={index}
                                            className='custom-key'
                                            label='key'
                                            labelCol={{span: 4}}
                                            wrapperCol={{span: 20}}
                                        >
                                            {getFieldDecorator(fieldName + CUSTOM_TYPES.key, {
                                                initialValue: item.key,
                                                rules: [this.getCustomVariableKeyValidateRules(index)],
                                            })(
                                                <Input
                                                    title={Intl.get('app.user.manage.custom.variable.key.tip', '请输入自定义属性的key')}
                                                    placeholder={Intl.get('app.user.manage.custom.variable.key.tip', '请输入自定义属性的key')}
                                                    onChange={this.onInputChange.bind(this, CUSTOM_TYPES.key, index)}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={11}>
                                        <FormItem
                                            key={index}
                                            className='custom-des'
                                            label={Intl.get('common.describe', '描述')}
                                            labelCol={{span: 4}}
                                            wrapperCol={{span: 20}}
                                        >
                                            {getFieldDecorator(fieldName + CUSTOM_TYPES.desc, {
                                                initialValue: item.description,
                                                rules: [this.getCustomVariableDesValidateRules(index)],
                                            })(
                                                <Input
                                                    title={Intl.get('app.user.manage.custom.variable.des.tip', '请输入自定义属性的描述')}
                                                    placeholder={Intl.get('app.user.manage.custom.variable.des.tip', '请输入自定义属性的描述')}
                                                    onChange={this.onInputChange.bind(this, CUSTOM_TYPES.desc, index)}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    {isShowDeleteBtn ? (
                                        <div className="circle-button circle-button-minus"
                                            title={Intl.get('common.delete', '删除')}
                                            onClick={this.deleteCustomVariable.bind(this, index)}>
                                            <Icon type="minus"/>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })
                    }
                    {
                        displayText.length < maxCustomVariableCount ? (
                            <div
                                className="circle-button circle-button-plus"
                                title={Intl.get('common.add', '添加')}
                                onClick={this.addCustomVariable}>
                                <Icon type="plus"/>
                            </div>
                        ) : null
                    }
                </Form>
                <div className="buttons">
                    <SaveCancelButton
                        loading={this.state.loading}
                        saveErrorMsg={this.state.submitErrorMsg}
                        okBtnText={this.props.okBtnText}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </div>
            </div>
        ) : null;
        return (
            <div className={displayCls}>
                {textBlock}
                {inputBlock}
            </div>
        );
    }
}
CustomVariable.defaultProps = {
    id: '',
    // 自定义属性集合， {status: 状态}
    value: {},
    // 展示类型，text:文本展示状态，edit:编辑状态
    displayType: '',
    //是否有修改权限
    hasEditPrivilege: false,
    //添加按钮的提示文案
    addBtnTip: Intl.get('common.add', '添加'),
    //编辑区的宽度
    width: '100%',
    //保存按钮的文字展示
    okBtnText: Intl.get('common.add', '添加'),
    //保存自定义属性的修改方法
    saveEditInput: function() {}
};
CustomVariable.propTypes = {
    id: PropTypes.string,
    form: PropTypes.object,
    displayType: PropTypes.string,
    value: PropTypes.array,
    hasEditPrivilege: PropTypes.bool,
    saveEditInput: PropTypes.func,
    addBtnTip: PropTypes.string,
    width: PropTypes.string,
    okBtnText: PropTypes.string,
};
export default Form.create()(CustomVariable);