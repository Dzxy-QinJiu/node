import {Form,Radio,Checkbox} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const CHECKED = {
    TRUE: '1',
    FALSE: '0'
};
import { isModifyAppConfig } from 'PUB_DIR/sources/utils/common-method-util';
const UserTypeRadioField = {
    showMultiLoginError() {
        this.setState({
            show_multilogin_error: true
        });
    },
    hideMultiLoginError() {
        this.setState({
            show_multilogin_error: false
        });
    },
    componentDidMount() {
        if(this.props.isSingleAppEdit) {
            emitter.on('app_user_manage.edit_app.show_multilogin_error' , this.showMultiLoginError);
        }
    },
    componentWillUnmount() {
        if(this.props.isSingleAppEdit) {
            emitter.removeListener('app_user_manage.edit_app.show_multilogin_error' , this.showMultiLoginError);
        }
    },
    renderMultiLoginRadioBlock(config) {
        config = $.extend({
            isCustomSetting: false,
            appId: '',
            globalMultiLogin: '0'
        },config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        function selectValue(event) {
            let value = event.target.type === 'radio' && event.target.value;
            if (event.target.type === 'checkbox') {
                value = event.target.checked ? '1' : '0';
            }
            return value;
        }

        const callback = config.isCustomSetting ? (event) => {
            let value = selectValue(event);
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[config.appId] || {};
            isModifyAppConfig(_.clone(formData), 'multilogin', value);
            formData.multilogin.value = value;
            if(value !== config.globalMultiLogin) {
                formData.multilogin.setted = true;
            }
            this.setState({appPropSettingsMap});
            if(this.props.isSingleAppEdit) {
                this.hideMultiLoginError();
            }
        } : (event) => {
            let value = selectValue(event);
            const formData = this.state.formData;
            formData.multilogin = value;
            this.setState({formData});
        };

        let currentValue;
        if(config.isCustomSetting) {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            currentValue = appPropSettingsMap[config.appId].multilogin.value;
        } else {
            currentValue = this.state.formData.multilogin;
        }
        if (config.showCheckbox) {
            return (
                <div className="user-multilogin-radiofield-block">
                    <Checkbox checked={currentValue === CHECKED.TRUE} onChange={callback}>{Intl.get('user.multi.login', '多人登录')}</Checkbox>
                    {this.state.show_multilogin_error ? (<div className="error_form_tip"><ReactIntl.FormattedMessage id="user.multi.login.type.tip" defaultMessage="请选择多人登录类型" /></div>) : null}
                </div>
            );
        }
        return (
            <div className="user-multilogin-radiofield-block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                >
                    <RadioGroup
                        value={currentValue}
                        onChange={callback}
                    >
                        <Radio key={CHECKED.TRUE} value={CHECKED.TRUE}><ReactIntl.FormattedMessage id="common.app.status.open" defaultMessage="开启" /></Radio>
                        <Radio key={CHECKED.FALSE} value={CHECKED.FALSE}><ReactIntl.FormattedMessage id="common.app.status.close" defaultMessage="关闭" /></Radio>
                    </RadioGroup>
                </FormItem>
                {this.state.show_multilogin_error ? (<div className="error_form_tip"><ReactIntl.FormattedMessage id="user.multi.login.type.tip" defaultMessage="请选择多人登录类型" /></div>) : null}
            </div>
        );
    }
};

export default UserTypeRadioField;