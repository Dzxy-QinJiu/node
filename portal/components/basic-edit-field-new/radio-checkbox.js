/**
 * Created by hzl on 2020/5/21.
 */
import {Form, Radio, Checkbox} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const CheckboxGroup = Checkbox.Group;
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';
class RadioOrCheckBoxEditField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            displayType: props.displayType || 'text',
            value: props.value,
            submitErrorMsg: '',
            hoverShowEdit: true,
            selectOptions: props.selectOptions,
            componentType: props.componentType,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                value: nextProps.value,
                loading: false,
                displayType: nextProps.displayType || 'text',
                submitErrorMsg: '',
                selectOptions: nextProps.selectOptions,
                componentType: nextProps.componentType,
            });
        }
    }

    setEditable(e) {
        this.setState({
            displayType: 'edit',
            value: this.state.value,
        });
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    }

    handleSubmit(e) {
        Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
        var value = this.state.value;
        var saveObj = {
            id: this.props.id
        };
        saveObj[this.props.field] = value;
        this.setState({
            loading: true
        });

        const setDisplayState = () => {
            this.setState({
                loading: false,
                submitErrorMsg: '',
                value: value,
                displayType: 'text'
            });
        };

        if ((value !== this.props.value)) {
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
    }

    handleCancel(e) {
        this.setState({
            value: this.props.value,
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + this.props.field + '的修改');
    }

    handleRadioChange(event) {
        const value = _.get(event, 'target.value');
        this.setState({value});
    }

    handleCheckboxChange(checkedValues) {
        this.setState({
            value: checkedValues
        });
    }

    render() {
        var displayCls = classNames({
            'basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var displayText = this.state.value;
        let textBlock = null;
        var cls = classNames('edit-container',{
            'hover-show-edit': this.state.hoverShowEdit && this.props.hasEditPrivilege
        });
        if (this.state.displayType === 'text') {
            if (!_.isEmpty(displayText)) {
                textBlock = (
                    <div className={cls}>
                        {
                            this.props.hasEditPrivilege ? (
                                <DetailEditBtn
                                    title={this.props.editBtnTip}
                                    onClick={this.setEditable.bind(this)}
                                />
                            ) : null
                        }
                        <span className="inline-block basic-info-text">
                            {displayText}
                        </span>

                    </div>
                );
            } else {
                textBlock = (
                    <span className="inline-block basic-info-text no-data-descr">
                        {this.props.hasEditPrivilege ? (
                            <a
                                onClick={this.setEditable.bind(this)}
                                className="handle-btn-item"
                            >
                                {this.props.addDataTip}
                            </a>) : (
                            <span className="no-data-descr-nodata">
                                {this.props.noDataTip}
                            </span>
                        )
                        }

                    </span>
                );
            }
        }
        var inputBlock = this.state.displayType === 'edit' ? (
            <div className="date-wrap">
                <Form layout='horizontal' autoComplete="off" style={{width: this.props.width || '100%'}}>
                    <FormItem
                        labelCol={{span: 0}}
                        wrapperCol={{span: 24}}
                    >
                        {
                            this.state.componentType === 'radio' ? (
                                <RadioGroup
                                    onChange={this.handleRadioChange.bind(this)}
                                    value={this.state.value}
                                >
                                    {
                                        this.props.radioType === 'radio' ? (
                                            _.map(this.state.selectOptions, (item) => {
                                                return (<Radio value={item}>{item}</Radio>);
                                            })
                                        ) : (
                                            _.map(this.state.selectOptions, (item) => {
                                                return (<RadioButton value={item}>{item}</RadioButton>);
                                            })
                                        )
                                    }
                                </RadioGroup>
                            ) : (
                                <CheckboxGroup
                                    options={this.state.selectOptions}
                                    onChange={this.handleCheckboxChange.bind(this)}
                                    value={this.state.value}
                                />
                            )
                        }

                    </FormItem>
                    <div className="buttons">
                        {
                            this.props.hideButtonBlock ? null : (
                                <SaveCancelButton
                                    loading={this.state.loading}
                                    saveErrorMsg={this.state.submitErrorMsg}
                                    handleSubmit={this.handleSubmit.bind(this)}
                                    handleCancel={this.handleCancel.bind(this)}
                                />
                            )
                        }
                    </div>
                </Form>
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
RadioOrCheckBoxEditField.defaultProps = {
    id: '1',
    //字段
    field: 'select',
    //展示类型，text:文本展示状态，edit:编辑状态
    displayType: 'text',
    //是否有修改权限
    hasEditPrivilege: false,
    // 显示的值
    value: '',
    //编辑按钮的提示文案
    editBtnTip: Intl.get('common.update', '修改'),
    //请填写
    placeholder: '',
    //编辑区的宽度
    width: '100%',
    //无数据时的提示（没有修改权限时提示没有数据）
    noDataTip: '',
    //添加数据的提示（有修改权限时，提示补充数据）
    addDataTip: '',
    //是否隐藏保存取消按钮
    hideButtonBlock: false,
    //保存修改的方法
    saveEditInput: function() {
    },
    selectOptions: [],
    componentType: 'radio', // 组件类型，默认是radio
    radioType: 'radio', // radio 样式，默认是 radio
};
RadioOrCheckBoxEditField.propTypes = {
    id: PropTypes.string,
    field: PropTypes.string,
    displayType: PropTypes.string,
    hasEditPrivilege: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    editBtnTip: PropTypes.string,
    placeholder: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    noDataTip: PropTypes.string,
    addDataTip: PropTypes.string,
    hideButtonBlock: PropTypes.bool,
    saveEditInput: PropTypes.func,
    selectOptions: PropTypes.array,
    componentType: PropTypes.string,
    radioType: PropTypes.string,
};
export default RadioOrCheckBoxEditField;