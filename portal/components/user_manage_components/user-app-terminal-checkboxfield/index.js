/**
 * Created by hzl on 2019/12/5.
 */
import {Form,Checkbox } from 'antd';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
import { isModifyAppConfig } from 'PUB_DIR/sources/utils/common-method-util';
import {noSelectedAppTerminalEmitter} from 'PUB_DIR/sources/utils/emitters';
require('./index.less');

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
            if ( _.isEmpty(checkedValues)) {
                noSelectedAppTerminalEmitter.emit(noSelectedAppTerminalEmitter.NO_SELECTED_APP_TERMINAL, true);
            } else {
                noSelectedAppTerminalEmitter.emit(noSelectedAppTerminalEmitter.NO_SELECTED_APP_TERMINAL, false);
            }
            _.each(checkedValues, (checked) => {
                let matchApp = _.find(config.selectedApps.terminals, item => item.name === checked);
                if (matchApp) {
                    checkedTerminals.push({id: matchApp.id, code: matchApp.code, name: matchApp.name});
                }
            });
            const formData = appPropSettingsMap[config.appId] || {};
            isModifyAppConfig(_.clone(formData), 'terminals', checkedValues);
            formData.terminals.value = checkedTerminals;
            if(checkedValues !== config.globalTerminals) {
                formData.terminals.setted = true;
            }
            this.setState({appPropSettingsMap});
        };

        let currentValue;
        let options = _.map(config.selectedApps.terminals, 'name');
        if(config.isCustomSetting) {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const terminalsValue = appPropSettingsMap[config.appId].terminals.value;
            currentValue = _.map(terminalsValue, 'name');
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
                    {
                        _.isEmpty(currentValue) ? (
                            <div className="no-select-terminals-tips">
                                {Intl.get('user.app.no.select.terminals.tip', '请至少选择一个多终端')}
                            </div>
                        ) : null
                    }
                </FormItem>
            </div>
        );
    }
};

export default UserAppTerminalCheckboxField;