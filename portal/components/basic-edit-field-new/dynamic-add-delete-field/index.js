/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/26.
 * 动态增删元素的组件
 */
require('./index.less');
import PhoneInput from 'CMP_DIR/phone-input';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import {Form, Input, Icon} from 'antd';
const FormItem = Form.Item;
import PhoneCallout from 'CMP_DIR/phone-callout';
import Trace from 'LIB_DIR/trace';
class DynamicAddDelField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayType: this.props.displayType || 'text',
            item_keys: this.getInitItemKeys(props.value),//用来处理增删数据的key
            value: this.props.value,
            loading: false,//正在保存
            submitErrorMsg: '',//保存失败的错误提示
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value,
                item_keys: this.getInitItemKeys(nextProps.value)
            });
        }
    }
    getInitItemKeys(value) {
        if (_.get(value, '[0]')) {
            return _.map(value, (item, index) => index);
        } else {
            return [0];
        }
    }

    handleSubmit = (e) => {
        Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            let saveObj = {
                id: this.props.id
            };
            saveObj[this.props.field] = _.filter(values[this.props.field], item => item);
            this.setState({loading: true});
            this.props.saveEditData(saveObj, () => {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: saveObj[this.props.field],
                    displayType: 'text'
                });
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });
        });
    }

    handleCancel = (e) => {
        this.setState({
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + this.props.field + '的修改');
    }


    // 删除元素
    handleDelItem = (key, index, size) => {
        if (index === 0 && size === 1) return;
        let item_keys = this.state.item_keys;
        // 过滤调要删除元素的key
        item_keys = _.filter(item_keys, item => item !== key);
        this.setState({item_keys});
    };

    // 添加元素
    handleAddItem = () => {
        let item_keys = this.state.item_keys;
        // 元素key数组中最后一个元素的key
        let lastItemKey = _.get(item_keys, `[${item_keys.length - 1}]`, 0);
        // 新加元素的key
        let addItemKey = lastItemKey + 1;
        item_keys.push(addItemKey);
        this.setState(item_keys);
    };

    renderItemContent = (key, index) => {
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
            colon: false
        };
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const fieldKey = `${this.props.field}[${key}]`;
        let initValue = _.get(this.state, `value[${key}]`, '');
        if (this.props.type === 'phone') {
            let validateRules = this.props.validateRules || [];
            if (index === 0) {//电话必填的验证
                validateRules = _.concat(validateRules, [{
                    required: true,
                    message: Intl.get('user.info.input.phone', '请输入电话'),
                }]);
            }
            return (
                <PhoneInput
                    initialValue={initValue}
                    placeholder={Intl.get('clue.add.phone.num', '电话号码')}
                    validateRules={validateRules}
                    id={fieldKey}
                    labelCol={{span: 4}}
                    wrapperCol={{span: 20}}
                    colon={false}
                    form={this.props.form}
                    label={index === 0 ? this.props.label : ' '}
                />);
        } else {
            return (
                <FormItem key={key}
                    label={index === 0 ? this.props.label : ' '}
                    {...formItemLayout}
                >
                    {getFieldDecorator(fieldKey, {
                        validateTrigger: ['onChange'],
                        rules: this.props.validateRules || [{}],
                        initialValue: initValue || ''
                    })(<Input placeholder={this.props.placeholder}/>)}
                </FormItem>
            );
        }
    };
    renderItemShowContent() {
        if (_.get(this, 'state.value[0]')) {
            return (
                <div className="item-show-content">
                    {_.map(this.state.value, item => {
                        return ( <div className="item-content">
                            {this.props.type === 'phone' ? <PhoneCallout phoneNumber={item} showPhoneNum={addHyphenToPhoneNumber(item)} showPhoneIcon={true}/> :
                                <span className="item-text">{item}</span>}

                        </div>);
                    })}
                    {this.props.hasEditPrivilege ? (
                        <DetailEditBtn title={this.props.editBtnTip}
                            onClick={this.setEditable.bind(this)}/>) : null}
                </div>);
        } else {//无数据时的处理
            return (
                <div className="item-show-content no-data-descr">
                    {this.props.hasEditPrivilege ? (
                        <a onClick={this.setEditable.bind(this)}>{this.props.addDataTip}</a>) : this.props.noDataTip}
                </div>
            );
        }
    }

    setEditable = (e) => {
        this.setState({
            displayType: 'edit',
            value: this.props.value
        });
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    }

    render() {
        const item_keys = this.state.item_keys;
        let itemSize = _.get(item_keys, 'length');
        if (this.state.displayType === 'text') {
            return (
                <div className="item-show-container">
                    <div className="item-show-label contact-way-icon">
                        {this.props.label}:
                    </div>
                    {this.renderItemShowContent()}
                </div>);
        } else {
            return (
                <Form className="dynamic-item-form">
                    {_.map(item_keys, (key, index) => {
                        return (
                            <div className="item-wrap" key={key}>
                                <div className="item-content">{this.renderItemContent(key, index)}</div>
                                {index === 0 && itemSize === 1 ? null : (
                                    <div className="item-minus-button"
                                        onClick={this.handleDelItem.bind(this, key, index, itemSize)}>
                                        {this.props.delItemBtn ? this.props.delItemBtn : (<Icon type="minus"/>)}
                                    </div>)}
                            </div>);
                    })}
                    <div className="item-plus-button" onClick={this.handleAddItem.bind(this)}>
                        {this.props.addItemBtn ? this.props.addItemBtn : (<Icon type="plus"/>)}
                    </div>
                    {!this.props.hideButtonBlock ?
                        <SaveCancelButton loading={this.state.loading}
                            saveErrorMsg={this.state.submitErrorMsg}
                            handleSubmit={this.handleSubmit}
                            handleCancel={this.handleCancel}
                            okBtnText={this.props.okBtnText}
                            cancelBtnText={this.props.cancelBtnText}
                        /> : null}
                </Form>);
        }
    }
}
DynamicAddDelField.propTypes = {
    id: PropTypes.string,
    field: PropTypes.string,
    value: PropTypes.array,
    type: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    validateRules: PropTypes.array,
    placeholder: PropTypes.string,
    hasEditPrivilege: PropTypes.bool,
    noDataTip: PropTypes.string,
    addDataTip: PropTypes.string,
    editBtnTip: PropTypes.string,
    okBtnText: PropTypes.string,
    displayType: PropTypes.string,
    cancelBtnText: PropTypes.string,
    hideButtonBlock: PropTypes.bool,
    form: PropTypes.object,
    delItemBtn: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    addItemBtn: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    contactName: PropTypes.string,
    saveEditData: PropTypes.func,

};
DynamicAddDelField.defaultProps = {
    //唯一标识
    id: '',
    //字段
    field: 'name',
    //值
    value: [],
    //增删元素的类型，默认：输入框(phone、number等)
    type: 'input',
    //验证规则
    validateRules: [{}],
    //字段描述,可传字符串的描述，也可传图标
    label: '',
    //是否有修改权限
    hasEditPrivilege: false,
    //默认提示
    placeholder: Intl.get('user.email.write.tip', '请填写邮箱'),
    //无数据时的提示（没有修改权限时提示没有数据）
    noDataTip: '',
    //添加数据的提示（有修改权限时，提示补充数据）
    addDataTip: '',
    //编辑按钮的提示文案
    editBtnTip: Intl.get('common.update', '修改'),
    //是否隐藏保存按钮区
    hideButtonBlock: false,
    //保存按钮的文字展示
    okBtnText: '',
    //取消按钮的文字展示
    cancelBtnText: '',
    //展示: text, 编辑: edit
    displayType: 'text',
    //保存修改后的数据
    saveEditData: function() {
    },
    //自定义的删除按钮
    delItemBtn: null,
    //自定义的保存按钮
    addItemBtn: null,
    //以下是电话类型时，需要传的打电话所需数据
    //联系人姓名
    contactName: '',
};
export default Form.create()(DynamicAddDelField);


