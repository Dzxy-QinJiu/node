import {Form,Radio} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const UserStatusRadioField = {
    renderUserStatusRadioBlock(config) {

        config = $.extend({
            isCustomSetting : false,
            appId  : '',
            globalStatus : "1"
        },config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        const onChange = !config.isCustomSetting ? this.setField.bind(this , 'status') : (event) => {
            const value = event.target.value;
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[config.appId] || {};
            formData.status.value = value;
            if(value != config.globalStatus) {
                formData.status.setted = true;
            }
            this.setState({appPropSettingsMap});
        };

        let currentValue;
        if(config.isCustomSetting) {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            currentValue = appPropSettingsMap[config.appId].status.value;
        } else {
            currentValue = this.state.formData.status;
        }

        return (
            <div className="user-status-radiofield-block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                >
                    <RadioGroup onChange={onChange}
                                value={currentValue}>
                        <Radio key="false" value="false"><ReactIntl.FormattedMessage id="common.app.status.open" defaultMessage="开启" /></Radio>
                        <Radio key="true" value="true"><ReactIntl.FormattedMessage id="common.app.status.close" defaultMessage="关闭" /></Radio>
                    </RadioGroup>
                </FormItem>
            </div>
        );
    }
};

export default UserStatusRadioField;