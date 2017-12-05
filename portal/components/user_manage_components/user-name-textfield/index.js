const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * 渲染用户名输入框
 */
import {Form,Input} from 'antd';
import Ajax from './ajax';
import AppUserActions from '../../../modules/app_user_manage/public/action/app-user-actions';
import AppUserFormActions from '../../../modules/app_user_manage/public/action/v2/app-user-form-actions';
import history from '../../../public/sources/history';
const FormItem = Form.Item;
import UserNameTextFieldUtil from './util';

const UserNameTextFieldMixin = {
    checkUserExistAjax(userName) {
        return Ajax.userExists(userName);
    },
    userExistTimeout: null,
    checkUserExist(rule, value, callback) {
        clearTimeout(this.userExistTimeout);
        var trimValue = value.trim();
        // 校验的信息提示
        UserNameTextFieldUtil.validatorMessageTips(trimValue,callback);

        this.userExistTimeout = setTimeout(() => {
            this.checkUserExistAjax(trimValue).then((userInfo) => {
                callback(Intl.get("user.user.exist.tip", "用户已存在"));
                const $explain = $(".ant-form-explain", this.refs.username_block);
                var text = Intl.get("user.user.check", "查看该用户");
                var a = `<a href='javascript:void(0)' id='app_user_name_exist_view'>${text}</a>`;
                $explain.html(
                    Intl.get("user.user.exist.check.tip", "用户已存在，是否{check}?", {'check': a})
                );
                $("#app_user_name_exist_view").click((e) => {
                    e.preventDefault();
                    var loc = window.location.href;
                    if (/\/user\/list/.test(loc)) {
                        //清除表单内容
                        AppUserFormActions.resetState();
                        //展示详情
                        AppUserActions.showUserDetail({
                            user: {
                                user_id: userInfo.user_id
                            }
                        });
                    } else {
                        history.pushState({}, "/user/list", {});
                        //清除表单内容
                        AppUserFormActions.resetState();
                        //展示详情
                        AppUserActions.showUserDetail({
                            user: {
                                user_id: userInfo.user_id
                            }
                        });
                    }
                });
            }, () => {
                callback();
            });
        }, 1000);
    },
    renderUserNameTextField(config) {
        config = $.extend({
            existCheck: false
        }, config);
        const status = this.state.status;
        const formData = this.state.formData;
        let validators = [];
        if (config.existCheck) {
            validators.push({validator: this.checkUserExist});
        }
        return (
            <div className="user-name-textfield-block" ref="username_block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                    validateStatus={this.renderValidateStyle('user_name')}
                    help={status.user_name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.user_name.errors && status.user_name.errors.join(','))}
                >
                    <Validator rules={validators}>
                        <Input name="user_name"
                               placeholder={Intl.get("user.username.write.tip", "请填写用户名")}
                               value={formData.user_name}
                               onChange={this.setField.bind(this, 'user_name')}/>
                    </Validator>
                </FormItem>
            </div>
        );
    }
};

export default UserNameTextFieldMixin;