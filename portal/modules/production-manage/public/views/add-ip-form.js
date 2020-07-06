/**
 * Created by hzl on 2019/10/17.
 */
require('../style/add-ip-form.less');
import {Form, Input, Button, Icon} from 'antd';
const FormItem = Form.Item;
import { ipRegexWildcard } from 'PUB_DIR/sources/utils/validate-util';
const CHECKIPMSG = Intl.get('config.manage.input.ip','请输入有效的IP（eg:192.168.1.9）');

class AddIpForm extends React.Component {
    constructor(props) {
        super(props);
    }

    handleSubmitAddIp = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            this.props.handleSubmitAddIp({ip: _.trim(values.ip)});
        });
    };

    handleCancelAddIP = () => {
        this.props.handleCancelAddIP();
    };

    render = () => {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 2},
            wrapperCol: {span: 26},
        };
        return (
            <Form layout='horizontal' className="add-ip-form">
                <FormItem
                    {...formItemLayout}
                    label=''
                >
                    {getFieldDecorator('ip', {
                        rules: [{
                            pattern: ipRegexWildcard,
                            message: CHECKIPMSG
                        }],
                        validateTrigger: 'onBlur'
                    })(
                        <Input placeholder={Intl.get('product.filter.ip.add.ip.placeholder', '请输入要排除的IP')}/>
                    )}
                </FormItem>
                <FormItem>
                    <div className="save-buttons-zone">
                        <Button
                            className="confirm-btn"
                            disabled={this.props.loading}
                            onClick={this.handleSubmitAddIp}
                            type="primary"
                        >
                            {
                                this.props.loading ? <Icon type="loading"/> : null
                            }
                            {Intl.get('common.save', '保存')}
                        </Button>
                        <Button
                            className="cancel-btn"
                            onClick={this.handleCancelAddIP}
                        >
                            {Intl.get('common.cancel', '取消')}
                        </Button>
                    </div>
                </FormItem>
            </Form>
        );
    }
}

AddIpForm.propTypes = {
    form: PropTypes.object,
    handleSubmitAddIp: PropTypes.func,
    handleCancelAddIP: PropTypes.func,
    loading: PropTypes.boolean
};

export default Form.create()(AddIpForm);