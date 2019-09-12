import { Form, Input, InputNumber} from 'antd';
const FormItem = Form.Item;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import officeManageAjax from './ajax';

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
                customer_num: 1000
            };
        }
    };
    // 编辑职务名称
    handlePositionName = (event) => {
        let value = _.get(event, 'target.value');
        let formData = this.state.formData;
        formData.name = _.trim(value);
        formData.isEditName = true;
        this.setState({formData});
    };

    handleCustomerCount = (value) => {
        let formData = this.state.formData;
        formData.customer_num = _.trim(value);
        formData.isEditNum = true;
        this.setState({formData});
    };

    handleSubmit = (event) => {
        event.preventDefault();
        let formData = this.state.formData;
        let isEdit = _.get(formData, 'id');
        this.setState({
            loading: true
        });
        if (isEdit) {
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
            let nameValue = _.get(formData, 'name');
            if (nameValue) {
                // 判断添加的职务和已有的职务名称是否相同，唯一性检测
                let targetItem = _.find(this.props.positionList, item => item.name === nameValue);
                if (targetItem){
                    this.setState({
                        loading: false,
                        errMsg: Intl.get('config.sales.role.has.repeat', '该职务名称已存在')
                    });
                    return;
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
                        errMsg: errMsg
                    });
                } );
            } else {
                this.setState({
                    loading: false,
                    errMsg: Intl.get('member.position.name.placeholder', '请输入职务名称')
                });
            }
        }
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

    render() {
        const formItemLayout = {
            colon: false,
            labelCol: {span: 8},
            wrapperCol: {span: 16}
        };
        let formData = this.state.formData;
        let nameValue = _.get(formData, 'name');
        let count = _.get(formData, 'customer_num');
        return (
            <div className='office-form'>
                <Form layout='horizontal' className='form' autoComplete='off'>
                    <FormItem
                        label={Intl.get('member.position.name.label', '职务名称')}
                        {...formItemLayout}
                    >
                        <Input
                            placeholder={Intl.get('member.position.name.placeholder', '请输入职务名称')}
                            value={nameValue}
                            onChange={this.handlePositionName}
                        />
                    </FormItem>
                    <FormItem
                        label={Intl.get('sales.role.config.customer.num', '最大客户数')}
                        {...formItemLayout}
                    >
                        <InputNumber
                            onChange={this.handleCustomerCount}
                            value={count}
                            min={1}
                        />
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
    itemOffice: PropTypes.object,
    positionList: PropTypes.array,
    handleSubmit: PropTypes.func,
    handleCancelForm: PropTypes.func
};

module.exports = Form.create()(OfficeForm);