/**
 * 渲染用户个数输入框
 */
import {Form,InputNumber} from 'antd';
const FormItem = Form.Item;

const UserCountNumberFieldMixin = {
    renderUserCountNumberField(config) {

        config = $.extend({
            isCustomSetting : false,
            appId  : '',
            globalNumber : 1
        } , config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }


        let currentValue;
        if(!config.isCustomSetting) {
            currentValue = this.state.formData.count_number;
        } else {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            currentValue = appPropSettingsMap[config.appId].number.value;
        }

        if(!currentValue) {
            currentValue = config.globalNumber;
        }

        const onChange = (value) => {
            if(!config.isCustomSetting) {
                const formData = this.state.formData;
                formData.count_number = value;
                this.setState({formData});
            } else {
                const appPropSettingsMap = this.state.appPropSettingsMap || {};
                const appInfo = appPropSettingsMap[config.appId] || {};
                appInfo.number.value = value;
                this.setState({appPropSettingsMap});
            }
        };

        const onBlur = (event) => {
            const value = event.target.value;
            if(!value) {
                if(!config.isCustomSetting) {
                    const formData = this.state.formData;
                    formData.count_number = 1;
                    this.setState({formData});
                } else {
                    const appPropSettingsMap = this.state.appPropSettingsMap || {};
                    const appInfo = appPropSettingsMap[config.appId] || {};
                    appInfo.number.value = 1;
                    this.setState({appPropSettingsMap});
                }
            }
        };

        return (
            <div className="user-count-numberfield-block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                >
                    <InputNumber name="count_number"
                                 value={currentValue}
                                 min={1}
                                 max={99}
                                 size="large"
                                 onBlur={onBlur.bind(this)}
                                 onChange={onChange.bind(this)}/>
                </FormItem>
            </div>
        );
    }
};

export default UserCountNumberFieldMixin;