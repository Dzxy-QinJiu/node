import {Form,Radio} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const UserTypeRadioField = {
    showMultiLoginError() {
        this.setState({
            show_multilogin_error : true
        });
    },
    hideMultiLoginError() {
        this.setState({
            show_multilogin_error : false
        });
    },
    componentDidMount() {
        if(this.props.isSingleAppEdit) {
            emitter.on("app_user_manage.edit_app.show_multilogin_error" , this.showMultiLoginError);
        }
    },
    componentWillUnmount() {
        if(this.props.isSingleAppEdit) {
            emitter.removeListener("app_user_manage.edit_app.show_multilogin_error" , this.showMultiLoginError);
        }
    },
    renderMultiLoginRadioBlock(config) {

        config = $.extend({
            isCustomSetting : false,
            appId  : '',
            globalMultiLogin : "0"
        },config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        const callback = config.isCustomSetting ? (event)=>{
            const value = event.target.value;
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[config.appId] || {};
            formData.multilogin.value = value;
            if(value != config.globalUserType) {
                formData.multilogin.setted = true;
            }
            this.setState({appPropSettingsMap});
            if(this.props.isSingleAppEdit) {
                this.hideMultiLoginError();
            }
        }:(event)=>{
            const value = event.target.value;
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
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage id="common.app.status.open" defaultMessage="开启" /></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage id="common.app.status.close" defaultMessage="关闭" /></Radio>
                    </RadioGroup>
                </FormItem>
                {this.state.show_multilogin_error ? (<div className="error_form_tip"><ReactIntl.FormattedMessage id="user.multi.login.type.tip" defaultMessage="请选择多人登录类型" /></div>) : null}
            </div>
        );
    }
};

export default UserTypeRadioField;