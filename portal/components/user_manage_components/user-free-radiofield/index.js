/**
 * 免费用户
 */
import {Form,Radio} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;


const UserFreeRadioField = {
    renderUserFreeFieldBlock(config) {

        config = $.extend({
            isCustomSetting: false,
            appId: '',
            globalUserFree: '0'
        } , config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        let currentValue;
        if(!config.isCustomSetting) {
            currentValue = this.state.formData.user_free;
        } else {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            currentValue = appPropSettingsMap[config.appId].user_free.value;
        }

        const onChange = !config.isCustomSetting ? this.setField.bind(this , 'user_free') : (event) => {
            const value = event.target.value;
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[config.appId] || {};
            formData.user_free.value = value;
            if(value != config.globalUserFree) {
                formData.user_free.setted = true;
            }
            this.setState({appPropSettingsMap});
        };

        return (
            <FormItem
                label=""
                labelCol={{span: 0}}
                wrapperCol={{span: 24}}
            >
                <RadioGroup onChange={onChange}
                    value={currentValue}>
                    <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.yes" defaultMessage="是" /></Radio>
                    <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.no" defaultMessage="否" /></Radio>
                </RadioGroup>
            </FormItem>
        );
    }
};

export default UserFreeRadioField;