/**
 * 到期停用选择
 */
import {Form,Radio} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import { isModifyAppConfig } from 'PUB_DIR/sources/utils/common-method-util';

const UserOverDraftField = {
    renderUserOverDraftBlock(config) {

        config = $.extend({
            isCustomSetting: false,
            appId: '',
            globalOverDraft: '1'
        } , config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        let currentValue;
        if(!config.isCustomSetting) {
            currentValue = this.state.formData.over_draft;
        } else {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            currentValue = appPropSettingsMap[config.appId].over_draft.value;
        }

        const onChange = !config.isCustomSetting ? this.setField.bind(this , 'over_draft') : (event) => {
            const value = event.target.value;
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[config.appId] || {};
            isModifyAppConfig(_.clone(formData), 'over_draft', value);
            formData.over_draft.value = value;
            if(value != config.globalOverDraft) {
                formData.over_draft.setted = true;
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
                    <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.status.stop" defaultMessage="停用" /></Radio>
                    <Radio key="2" value="2"><ReactIntl.FormattedMessage id="user.status.degrade" defaultMessage="降级" /></Radio>
                    <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.status.immutability" defaultMessage="不变" /></Radio>
                </RadioGroup>
            </FormItem>
        );
    }
};

export default UserOverDraftField;