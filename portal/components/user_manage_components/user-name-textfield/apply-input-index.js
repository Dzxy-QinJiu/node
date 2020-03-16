const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 渲染用户名输入框
 */
import {Form,Input} from 'antd';
const FormItem = Form.Item;
import UserNameTextFieldUtil from './util';
import ApplyViewDetailStore from 'MOD_DIR/apply_approve_list/public/all_application_type/user_apply/public/store/apply-view-detail-store';
let number = 1;

const UserNameTextFieldMixin = {
    checkUserExist(rule,value,callback) {
        var trimValue = _.trim(value);
        // 校验的信息提示
        UserNameTextFieldUtil.validatorMessageTips(trimValue,callback, () => {
            var customer_id = ApplyViewDetailStore.getState().detailInfoObj.info.customer_id;
            var obj = {
                user_name: trimValue,
                customer_id: customer_id
            };
            UserNameTextFieldUtil.checkUserExist(rule,obj,callback, number, this.refs.username_block);
        });
    },
    renderUserNameTextField(config) {
        number = config.number;
        config = $.extend({
            existCheck: false
        } , config);

        const status = this.state.status;
        const formData = this.state.formData;
        let validators = [];
        if(config.existCheck) {
            validators.push({validator: this.checkUserExist});
        }

        return (
            <div className="user-name-textfield-block" ref="username_block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                    validateStatus={this.renderValidateStyle('user_name')}
                    help={status.user_name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.user_name.errors && status.user_name.errors.join(','))}
                >
                    <Validator rules={validators} trigger='onBlur'>
                        <Input name="user_name"
                            placeholder={Intl.get('user.username.write.tip', '请填写用户名')}
                            value={formData.user_name}
                            onChange={this.setField.bind(this, 'user_name')}/>
                    </Validator>
                </FormItem>
            </div>
        );
    },

    // 昵称
    renderNickNameTextField(config) {

        const status = this.state.status;
        const formData = this.state.formData;

        let validators = [{required: true,message: Intl.get('user.nickname.write.tip', '请填写昵称')}];

        return (
            <div className="user-name-textfield-block" ref="username_block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                    validateStatus={this.renderValidateStyle('nick_name')}
                >
                    <Validator rules={validators} trigger='onBlur'>
                        <Input name="nick_name"
                            placeholder={Intl.get('user.nickname.write.tip', '请填写昵称')}
                            value={formData.nick_name}
                            onChange={this.setField.bind(this, 'nick_name')}/>
                    </Validator>
                </FormItem>
            </div>
        );
    }
};

export default UserNameTextFieldMixin;