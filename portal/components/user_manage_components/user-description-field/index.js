/**
 * 用户备注
 */
import {Form,Input} from 'antd';
const FormItem = Form.Item;


const UserDescriptionField = {
    renderUserDescriptionBlock() {
        const formData = this.state.formData;
        return (
            <FormItem
                label=""
                labelCol={{span: 0}}
                wrapperCol={{span: 24}}
            >
                <Input rows="3" type="textarea" placeholder={Intl.get("user.input.remark","请输入备注")} value={formData.description} onChange={this.setField.bind(this , 'description')}/>
            </FormItem>
        );
    }
};

export default UserDescriptionField;