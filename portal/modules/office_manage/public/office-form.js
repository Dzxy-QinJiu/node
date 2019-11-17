import { Form, Input, InputNumber} from 'antd';
const FormItem = Form.Item;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import officeManageAjax from './ajax';
import {validatorNameRuleRegex} from 'PUB_DIR/sources/utils/validate-util';
const DEFAULT_CUSTOMER_NUM = 1000; // 默认客户数
const MAX_CUSTOMER_NUM = 10000; // 最大客户数

class OfficeForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false, // loading
            errMsg: '', // 错误信息
            isEditNum: false, // 编辑数量，默认false
            isEditName: false, // 编辑名称，默认false
            formData: this.getFormData(this.props.itemOffice)
        };
    }

    getFormData = (itemOffice) => {
        let isEdit = _.get(itemOffice, 'id');
        if (isEdit) { // 编辑
            return {
                ...itemOffice,
            };
        } else { // 添加
            return {
                ...itemOffice,
                name: '',
                customer_num: DEFAULT_CUSTOMER_NUM
            };
        }
    };

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let nameValue = _.trim(values.position);
            let countValue = _.trim(values.count);
            let formData = this.state.formData;
            let isEdit = _.get(formData, 'id');
            this.setState({
                loading: true
            });
            if (isEdit) {
                let name = _.get(formData, 'name');
                let count = _.get(formData, 'customer_num');
                if (name !== nameValue) {
                    formData.isEditName = true;
                    formData.name = nameValue;
                }
                if (countValue !== count) {
                    formData.isEditNum = true;
                    formData.customer_num = countValue;
                }

                officeManageAjax.editPosition(formData).then( (result) => {
                    this.setState({
                        loading: false
                    });
                    if (result) {
                        this.props.handleSubmit(formData, 'edit');
                    } else {
                        this.setState({
                            errMsg: Intl.get('member.add.failed', '添加失败！')
                        });
                    }
                }, (errMsg) => {
                    this.setState({
                        loading: false,
                        errMsg: errMsg
                    });
                } );
            } else {
                formData.name = nameValue;
                if (countValue) {
                    formData.customer_num = countValue;
                } else {
                    formData.customer_num = DEFAULT_CUSTOMER_NUM;
                }
                officeManageAjax.addPosition(formData).then( (result) => {
                    this.setState({
                        loading: false,
                    });
                    if (result && _.get(result, 'id')) {
                        this.props.handleSubmit(result, 'add');
                    } else {
                        this.setState({
                            errMsg: Intl.get('member.add.failed', '添加失败！')
                        });
                    }
                }, (errMsg) => {
                    this.setState({
                        loading: false,
                        errMsg: errMsg || Intl.get('member.add.failed', '添加失败！')
                    });
                } );
            }
        });
    };

    handleCancel = (event) => {
        event.preventDefault();
        this.setState({
            isEditName: false,
            isEditNum: false
        });
        let formData = this.state.formData;
        this.props.handleCancelForm(formData);
    };

    validatePositionName = (positionValue, callback) => {
        // 判断添加的职务和已有的职务名称是否相同，唯一性检测
        let existPositionList = this.props.positionList; // 已存在的职务
        let isExist = _.find(existPositionList, item => item.name === positionValue);
        if (isExist) { // 和已存在的职务名称是相同
            callback(Intl.get('member.position.has.repeat', '该职务名称已存在'));
        } else {
            callback();
        }
    };

    // 职务唯一性检测
    getPositionValidator = () => {
        return (rule, value, callback) => {
            let positionValue = _.trim(value); // 文本框中的值
            let formData = this.state.formData;
            if (positionValue) {
                if (_.get(formData, 'id')) { // 编辑职务
                    if (_.get(formData, 'name') === positionValue) {
                        callback();
                    } else {
                        this.validatePositionName (positionValue, callback);
                    }
                } else { // 添加职务
                    this.validatePositionName (positionValue, callback);
                }
            } else {
                callback(Intl.get('member.position.name.placeholder', '请输入职务名称'));
            }

        };
    };

    getNumberValidator = () => {
        return (rule, value, callback) => {
            if (value) {
                if (value > MAX_CUSTOMER_NUM) {
                    callback(Intl.get('member.position.count.tips', '客户数不能超过{number}', {number: MAX_CUSTOMER_NUM}));
                } else {
                    callback();
                }
            } else {
                callback(Intl.get('member.position.no.count.tips', '请输入客户数'));
            }
        };
    };

    render() {
        const formItemLayout = {
            colon: false,
            labelCol: {span: 8},
            wrapperCol: {span: 16}
        };
        let formData = this.state.formData;
        let nameValue = _.get(formData, 'name');
        let count = _.get(formData, 'customer_num');
        const {getFieldDecorator} = this.props.form;
        return (
            <div className='office-form'>
                <Form layout='horizontal' className='form' autoComplete='off'>
                    <FormItem
                        label={Intl.get('member.position.name.label', '职务名称')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('position', {
                            initialValue: nameValue,
                            rules: [{
                                validator: this.getPositionValidator()
                            }, validatorNameRuleRegex(10, Intl.get('member.position.name.label', '职务名称'))]
                        })(
                            <Input
                                name="position"
                                id="position"
                                placeholder={Intl.get('member.position.name.placeholder', '请输入职务名称')}
                            />
                        )}

                    </FormItem>
                    <FormItem
                        label={Intl.get('sales.role.config.customer.num', '最大客户数')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('count', {
                            initialValue: count,
                            rules: [{
                                validator: this.getNumberValidator()
                            }]
                        })(
                            <InputNumber
                                min={1}
                                max={10000}
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        <SaveCancelButton
                            loading={this.state.loading}
                            saveErrorMsg={this.state.errMsg}
                            handleSubmit={this.handleSubmit.bind(this)}
                            handleCancel={this.handleCancel.bind(this)}
                        />
                    </FormItem>
                </Form>
            </div>
        );
    }
}

OfficeForm.propTypes = {
    form: PropTypes.object,
    itemOffice: PropTypes.object,
    positionList: PropTypes.array,
    handleSubmit: PropTypes.func,
    handleCancelForm: PropTypes.func
};

module.exports = Form.create()(OfficeForm);