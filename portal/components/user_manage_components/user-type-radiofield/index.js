import {Form, Radio} from 'antd';
import AppUserUtil from '../../../modules/app_user_manage/public/util/app-user-util';
import { isModifyAppConfig } from 'PUB_DIR/sources/utils/common-method-util';
const FormItem = Form.Item;
const UserTypeRadioField = {
    showUserTypeError() {
        this.setState({
            show_user_type_error: true
        });
    },
    hideUserTypeError() {
        this.setState({
            show_user_type_error: false
        });
    },
    componentDidMount() {
        if(this.props.isSingleAppEdit) {
            emitter.on('app_user_manage.edit_app.show_user_type_error' , this.showUserTypeError);
        }
    },
    componentWillUnmount() {
        if(this.props.isSingleAppEdit) {
            emitter.removeListener('app_user_manage.edit_app.show_user_type_error' , this.showUserTypeError);
        }
    },
    renderUserTypeRadioBlock(config) {

        config = $.extend({
            isCustomSetting: false,
            appId: '',
            globalUserType: '1'
        },config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        const callback = config.isCustomSetting ? (event) => {
            const value = event.target.value;
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[config.appId] || {};
            isModifyAppConfig(_.clone(formData), 'user_type', value);
            formData.user_type.value = value;
            if(value !== config.globalUserType) {
                formData.user_type.setted = true;
            }
            this.setState({appPropSettingsMap});
            if(this.props.isSingleAppEdit) {
                this.hideUserTypeError();
            }
        } : (event) => {
            const value = event.target.value;
            const formData = this.state.formData;
            formData.user_type = value;
            this.setState({formData});
        };

        let currentValue;
        if(config.isCustomSetting) {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            currentValue = appPropSettingsMap[config.appId].user_type.value;
        } else {
            currentValue = this.state.formData.user_type;
        }

        const options = _.map(AppUserUtil.USER_TYPE_VALUE_MAP, (value, key) => {
            return (<Radio.Button value={value}>{ AppUserUtil.USER_TYPE_TEXT_MAP[key]}</Radio.Button>);
        });

        return (
            <div className="user-type-radiofield-block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                >
                    <Radio.Group
                        value={currentValue}
                        onChange={callback}
                    >
                        {options}
                    </Radio.Group>

                </FormItem>
                {this.state.show_user_type_error ? (<div className="error_form_tip"><ReactIntl.FormattedMessage id="user.open.type.select" defaultMessage="请选择开通类型" /></div>) : null}
            </div>
        );
    }
};

export default UserTypeRadioField;