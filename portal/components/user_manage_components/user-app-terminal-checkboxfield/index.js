/**
 * Created by hzl on 2019/12/5.
 */
import {Form,Checkbox } from 'antd';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const UserAppTerminalCheckboxField = {
    renderUserAppTerminalCheckboxBlock(config) {
        config = $.extend({
            isCustomSetting: false,
            appId: '',
            globalTerminals: [],
            appAllTerminals: [],
        },config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        const onChange = !config.isCustomSetting ? this.setField.bind(this , 'terminals') : (checkedValues) => {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            let checkedTerminals = [];
            // 选择待处理
            _.each(checkedValues, (checked) => {
                let matchApp = _.find(config.selectedApps.terminals, item => item.code === checked);
                if (matchApp) {
                    checkedTerminals.push({id: matchApp.id, code: matchApp.code});
                }
            });
            const formData = appPropSettingsMap[config.appId] || {};
            formData.terminals.value = checkedTerminals;
            if(checkedValues !== config.globalTerminals) {
                formData.terminals.setted = true;
            }
            this.setState({appPropSettingsMap});
        };

        let currentValue;
        let options = _.map(config.selectedApps.terminals, 'code');
        if(config.isCustomSetting) {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const terminalsValue = appPropSettingsMap[config.appId].terminals.value;
            currentValue = _.map(terminalsValue, 'code');
        } else {
            currentValue = _.map(this.state.formData.terminals, 'value');
        }

        return (
            <div className="user-app-terminals-checkbox-block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                >
                    <CheckboxGroup
                        onChange={onChange}
                        value={currentValue}
                        options={options}
                    />
                </FormItem>
            </div>
        );
    }
};

export default UserAppTerminalCheckboxField;