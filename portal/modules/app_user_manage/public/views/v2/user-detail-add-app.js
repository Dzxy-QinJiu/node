var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');

/**
 * Oplate.hideSomeItem 用来判断西语的运行环境
 * */
import { Form, Icon, Alert, Checkbox, Input, Button } from 'antd';
import Spinner from '../../../../../components/spinner';
import AlertTimer from '../../../../../components/alert-timer';
import { Carousel, CarouselItem } from 'react-bootstrap';
import FieldMixin from '../../../../../components/antd-form-fieldmixin';

import UserDetailAddAppActions from '../../action/v2/user-detail-add-app-actions';
import AppUserDetailAction from '../../action/app-user-detail-actions';
import AppUserPanelSwitchAction from '../../action/app-user-panelswitch-actions';
import AppUserAction from '../../action/app-user-actions';
import AppUserUtil from '../../util/app-user-util';

import UserDetailAddAppStore from '../../store/v2/user-detail-add-app-store';
import OperationSteps from '../../../../../components/user_manage_components/operation-steps';
import OperationStepsFooter from '../../../../../components/user_manage_components/operation-steps-footer';
import UserTypeRadioField from '../../../../../components/user_manage_components/user-type-radiofield';
import UserTimeRangeField from '../../../../../components/user_manage_components/user-time-rangefield';
import UserOverDraftField from '../../../../../components/user_manage_components/user-over-draftfield';
import UserTwoFactorField from '../../../../../components/user_manage_components/user-two-factorfield';
import UserMultiLoginField from '../../../../../components/user_manage_components/user-multilogin-radiofield';
import insertStyle from '../../../../../components/insert-style';
const GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
const DefaultUserLogoTitle = require('CMP_DIR/default-user-logo-title');
const CheckboxGroup = Checkbox.Group;
import UserAppConfig from 'CMP_DIR/user_manage_components/app-property-setting';
import ApplyUserAppConfig from 'CMP_DIR/apply-user-app-config';
import AppConfigForm from 'CMP_DIR/apply-user-app-config/app-config-form';
import {CONFIG_TYPE} from 'PUB_DIR/sources/utils/consts';
import {getConfigAppType} from 'PUB_DIR/sources/utils/common-method-util';

function merge(obj1, obj2) {
    obj1 = obj1 || {};
    obj2 = obj2 || {};
    for (var key in obj2) {
        obj1[key] = obj2[key];
    }
}


//动态添加的样式
var dynamicStyle;
//布局常量
const LAYOUT_CONSTANTS = {
    //应用选择组件顶部的高度
    APPS_CHOOSEN_TOPBAR: 106,
    TOP_PADDING: 130,
    APP_SELECTOR_HEIGHT: 180
};

const UserDetailAddApp = createReactClass({
    displayName: 'UserDetailAddApp',
    //mixin
    mixins: [
        FieldMixin,
        UserTypeRadioField,
        UserTimeRangeField,
        UserOverDraftField,
        UserTwoFactorField,
        UserMultiLoginField
    ],

    getInitialState() {
        const storeObj = UserDetailAddAppStore.getState();
        const appPropSettingsMap = this.createPropertySettingData(storeObj);
        if (!_.isEmpty(appPropSettingsMap)) {
            this.onAppPropertyChange(appPropSettingsMap);
        }
        return {
            ...storeObj,
            appPropSettingsMap,
            showAppSelector: true,
            selectedAppIds: [],
            configType: CONFIG_TYPE.UNIFIED_CONFIG,//配置类型：统一配置、分别配置
        };
    },

    onStateChange() {
        this.setState(UserDetailAddAppStore.getState());
    },

    propTypes: {
        isSingleAppEdit: PropTypes.string,
        showUserNumber: PropTypes.number,
        showIsTwoFactor: PropTypes.string,
        showMultiLogin: PropTypes.string,
        height: PropTypes.number,
        initialUser: PropTypes.object
    },

    componentDidMount() {
        UserDetailAddAppStore.listen(this.onStateChange);
        UserDetailAddAppActions.getCurrentRealmApps();
        $(window).on('resize', this.onStateChange);
    },

    componentWillUnmount() {
        UserDetailAddAppStore.unlisten(this.onStateChange);
        dynamicStyle && dynamicStyle.destroy();
        dynamicStyle = null;
    },

    createPropertySettingData(state) {
        //选中的应用
        const selectedApps = state.selectedApps;
        //默认配置，添加的情况下会传
        const defaultSettings = state.defaultSettings;
        //修改的情况下会传appsSetting
        const appsSetting = state.appsSetting;
        //当前的各个应用的设置
        const appPropSettingsMap = state && state.appPropSettingsMap || {};
        //最终生成的数据
        const finalResult = {};
        //根据默认属性生成配置(添加用户，添加应用)
        const createPropertySettingByDefaultSettings = () => {
            _.each(selectedApps, (currentApp) => {
                //当前应用的id
                const appId = currentApp.app_id;
                //当前应用的设置
                const originAppSetting = appPropSettingsMap[appId] || {};
                //检查角色、权限
                function checkRolePermission() {
                    if (!originAppSetting.roles) {
                        originAppSetting.roles = [];
                    }
                    if (!originAppSetting.permissions) {
                        originAppSetting.permissions = [];
                    }
                    //角色、权限，赋值，不会出现在全局设置里，直接设置
                    if (defaultSettings.roles && _.isArray(defaultSettings.roles)) {
                        originAppSetting.roles = defaultSettings.roles;
                    }
                    if (defaultSettings.permissions && _.isArray(defaultSettings.permissions)) {
                        originAppSetting.permissions = defaultSettings.permissions;
                    }
                }
                // 多终端类型，不会出现在默认配置中，是根据所选应用确定是否包含多终端类型
                if (!_.isEmpty(currentApp.terminals)) {
                    defaultSettings.terminals = currentApp.terminals;
                }
                //检查单个属性，如果没有重新设置值，用defaultSettings里的值，重新生成
                function checkSingleProp(prop) {
                    if (!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if (!originAppSetting[prop].setted) {
                        // 若是多终端属性，则用选择当前应用的多终端的值
                        if (prop === 'terminals') {
                            originAppSetting[prop].value = currentApp.terminals;
                        } else {
                            originAppSetting[prop].value = defaultSettings[prop];
                        }
                    }
                }
                //检查时间,时间格式比较特殊
                function checkTime() {
                    if (!originAppSetting.time) {
                        originAppSetting.time = {
                            setted: false
                        };
                    }
                    if (!originAppSetting.time.setted) {
                        originAppSetting.time.start_time = defaultSettings.time.start_time;
                        originAppSetting.time.end_time = defaultSettings.time.end_time;
                        originAppSetting.time.range = defaultSettings.time.range;
                    }
                }
                //检查用户类型
                checkSingleProp('user_type');
                //检查到期停用
                checkSingleProp('over_draft');
                //检查二步验证
                checkSingleProp('is_two_factor');
                //检查用户状态（启用、停用）
                checkSingleProp('status');
                //检查多人登录
                checkSingleProp('multilogin');
                // 检查多终端类型
                if (!_.isEmpty(currentApp.terminals)) {
                    checkSingleProp('terminals');
                }
                //检查角色、权限
                checkRolePermission();
                //检查时间
                checkTime();
                //添加到map中
                finalResult[appId] = originAppSetting;
            });
        };
        //根据传入的配置生成配置(修改单个应用，修改申请单-审批)
        const createPropertySettingByAppsSetting = () => {
            _.each(selectedApps, (currentApp) => {

                const appSettingConfig = appsSetting[currentApp.app_id];

                //检查角色、权限
                function checkRolePermission() {
                    if (!originAppSetting.roles) {
                        originAppSetting.roles = [];
                    }
                    if (!originAppSetting.permissions) {
                        originAppSetting.permissions = [];
                    }
                    //角色、权限，赋值，不会出现在全局设置里，直接设置
                    if (appSettingConfig.roles && _.isArray(appSettingConfig.roles)) {
                        originAppSetting.roles = appSettingConfig.roles;
                    }
                    if (appSettingConfig.permissions && _.isArray(appSettingConfig.permissions)) {
                        originAppSetting.permissions = appSettingConfig.permissions;
                    }
                }
                //检查单个属性
                function checkSingleProp(prop) {
                    if (!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if (!originAppSetting[prop].setted) {
                        originAppSetting[prop].value = appSettingConfig[prop];
                    }
                }
                //检查时间
                function checkTime() {
                    if (!originAppSetting.time) {
                        originAppSetting.time = {
                            setted: false
                        };
                    }
                    if (!originAppSetting.time.setted) {
                        originAppSetting.time.start_time = appSettingConfig.time.start_time;
                        originAppSetting.time.end_time = appSettingConfig.time.end_time;
                        originAppSetting.time.range = appSettingConfig.time.range;
                    }
                }
                const appId = currentApp.app_id;
                const originAppSetting = appPropSettingsMap[appId] || {};
                if (this.props.isSingleAppEdit) {
                    checkSingleProp('user_type');
                }
                if (this.props.showUserNumber) {
                    checkSingleProp('number');
                }
                checkSingleProp('over_draft');
                if (this.props.showIsTwoFactor) {
                    checkSingleProp('is_two_factor');
                }
                if (this.props.isSingleAppEdit) {
                    checkSingleProp('status');
                }
                if (this.props.showMultiLogin) {
                    checkSingleProp('multilogin');
                }
                checkRolePermission();
                checkTime();
                finalResult[appId] = originAppSetting;
            });
        };

        //如果有默认配置，用默认配置
        if (!_.isEmpty(defaultSettings)) {
            createPropertySettingByDefaultSettings();
            return finalResult;
            //如果有应用特殊配置，用特殊配置
        } else if (!_.isEmpty(appsSetting)) {
            createPropertySettingByAppsSetting();
            return finalResult;
        } else {
            //什么都没有，则什么都没有
            return appPropSettingsMap;
        }
    },

    //取消添加单个应用
    cancel() {
        UserDetailAddAppActions.resetState();
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
    },

    //关闭右侧面板
    closeRightPanel() {
        AppUserDetailAction.dismiss();
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
        AppUserAction.closeRightPanel();
        UserDetailAddAppActions.resetState();
    },

    handleRemoveApp(app) {
        const removeAppId = app.app_id;
        let selectedAppIds = this.state.selectedAppIds;
        selectedAppIds = selectedAppIds.filter(x => x !== removeAppId);
        this.setState({
            selectedAppIds,
            //删除后只剩一个时，改成统一配置
            configType: selectedAppIds.length === 1 ? CONFIG_TYPE.UNIFIED_CONFIG : this.state.configType,
        }, () => {
            this.handleSetSelectedApps(this.state.selectedAppIds);
        });

    },

    changeConfigType(configType) {
        this.setState({
            configType: configType
        });
    },

    handleFormItemEdit(field, app, appFormData, e) {
        let value = null;
        //处理多终端
        if (field === 'terminals') {
            let checkedValue = e;
            let terminals = [];
            value = [];
            if (!_.isEmpty(checkedValue)) {
                _.each(checkedValue, checked => {
                    if (checked) {
                        let selectedTerminals = _.find(app.terminals, item => item.name === checked);
                        terminals.push(selectedTerminals);
                    }
                });
                value = terminals;
            }
        } else {
            if (e.target.type === 'checkbox') {
                value = e.target.checked ? '1' : '0';
            } else {
                value = e.target.value;
            }
        }

        if (this.state.configType === CONFIG_TYPE.UNIFIED_CONFIG) {            
            const appPropSettingsMap = this.state.appPropSettingsMap;
            _.each(appPropSettingsMap, item => {
                const formData = item || {};
                formData[field].value = value;            
            });
            this.setState({ appPropSettingsMap });
            return this.setField.call(this, field, e);
        } else {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[app.app_id] || {};
            formData[field].value = value;           
            this.setState({ appPropSettingsMap });
        }
    },

    //选中的应用发生变化的时候
    onSelectedAppsChange(appIds) {
        this.setState({
            selectedAppIds: appIds
        });
        UserDetailAddAppActions.showSelectedAppsError(false);
    },

    //渲染“选择应用”步骤
    renderAppsCarousel() {
        const isSubmitError = this.state.isSelectedAppsError;
        const appsListError = this.state.currentRealmAppsResult === 'error';
        const appsListLoading = this.state.currentRealmAppsResult === 'loading';

        if (appsListLoading) {
            return (
                <div className="user-manage-v2-load8">
                    <Spinner />
                </div>
            );
        }
        if (appsListError) {
            return (
                <Alert type="error" showIcon message={<span>
                    <ReactIntl.FormattedMessage
                        id="user.app.list.error.tip"
                        defaultMessage={'应用列表获取失败，{retry}'}
                        values={{
                            'retry': <a href="javascript:void(0)" onClick={UserDetailAddAppActions.getCurrentRealmApps}><ReactIntl.FormattedMessage id="common.get.again" defaultMessage="重新获取" /></a>
                        }}
                    />
                </span>} />
            );
        }
        //高度限制，让页面出现滚动条
        var height = $(window).height() -
            OperationSteps.height -
            OperationStepsFooter.height -
            LAYOUT_CONSTANTS.APPS_CHOOSEN_TOPBAR;
        dynamicStyle = insertStyle(`.user-detail-add-app-v2 .search-icon-list-content{max-height:${height}px;overflow-y:auto;overflow-x:hidden;`);
        return (
            <div>               
                <div className="left-nav-container">
                    {
                        Intl.get('user.user.product.select','选择产品')
                    }：
                </div>
                <div className="add-app-content">
                    {
                        this.state.showAppSelector ?
                            this.renderAppSelector() : this.renderAppConfig()
                    }
                </div>
                {
                    isSubmitError ? (
                        <div className="has-error">
                            <div className="ant-form-explain">
                                <ReactIntl.FormattedMessage id="user.product.select.tip" defaultMessage="至少选择一个产品" />
                            </div>
                        </div>
                    ) : null
                }
            </div>
        );
    },

    searchTimer: null,

    handleInputChange(e) {
        const keyWords = e.target.value;
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
            UserDetailAddAppActions.filterApps(keyWords);
        }, 100);
    },

    showAppSelector(isShow) {
        this.setState({
            showAppSelector: isShow,
            selectedAppIds: []
        });
        UserDetailAddAppActions.showSelectedAppsError(false);
    },

    //根据选中app的ids，设置已选中app
    handleSetSelectedApps(selectedAppIds) {
        //检验通过了，切换到下一步
        const apps = selectedAppIds.map(id => this.state.rawApps.find(x => x.app_id === id));
        UserDetailAddAppActions.setSelectedApps(apps);
        // 若所选应用包括多终端类型，则直接显示分别配置界面
        let configType = getConfigAppType(selectedAppIds, apps);
        setTimeout(() => {
            this.setState({
                appPropSettingsMap: this.createPropertySettingData(this.state),
                configType: configType
            });
        });
        //当只有一个应用的时候，需要把特殊设置的应用属性隐藏掉，
        // 这个时候，要把第三步的应用属性同步到通用配置属性上
        if (apps.length === 1) {
            //渲染是异步的，加setTimeout能够获取到最新的配置信息
            setTimeout(() => {
                //todo将应用的特殊设置同步到全局设置
                // UserDetailAddAppActions.syncCustomAppSettingToGlobalSetting();
            });
        }
    },

    handleFinishSelectApp() {
        this.handleSetSelectedApps(this.state.selectedAppIds);
        this.setState({
            showAppSelector: false
        });
    },

    renderAppSelector() {
        return (
            <div className="app-selector-container">
                <div className="input-container">
                    <Input onChange={this.handleInputChange} placeHolder={Intl.get('user.detail.tip.searchApp', '输入关键字自动搜索')} />
                </div>
                <div className="app-list-container" style={{ height: LAYOUT_CONSTANTS.APP_SELECTOR_HEIGHT }}>
                    <GeminiScrollbar>
                        <CheckboxGroup
                            defaultValue={this.state.selectedAppIds}
                            options={this.state.currentRealmApps.map(x => ({
                                value: x.app_id,
                                label: x.app_name
                            }))}
                            onChange={this.onSelectedAppsChange}
                        />
                    </GeminiScrollbar>
                </div>
                <div className="btn-bar">
                    <Button onClick={this.showAppSelector.bind(this, false)}>{Intl.get('common.cancel', '取消')}</Button>
                    <Button onClick={this.handleFinishSelectApp} type="primary">{Intl.get('common.sure', '确定')}</Button>
                </div>
            </div>
        );
    },

    getAppConfigSetting() {
        return _.map(this.state.selectedApps, app => {
            let configInfo = {
                begin_date: moment(),
                client_id: app.app_id,
                end_date: moment().add(0.5, 'm'),
                number: 1,
                over_draft: 1,
                range: '0.5m',
            };
            if (!_.isEmpty(app.terminals)) {
                configInfo.terminals = app.terminals;
            }
            return configInfo;
        });
    },

    renderAppConfig() {
        return (
            <div style={{ height: this.props.height - LAYOUT_CONSTANTS.TOP_PADDING}}>
                <GeminiScrollbar>
                    <div className="app-config-container">
                        <div className="selected-app-container">
                            <ul>
                                {
                                    this.state.selectedApps.map(app => (
                                        <li key={app.app_id}>
                                            <div className="title-container">
                                                <span className="logo-container" title={app.app_name}>
                                                    <DefaultUserLogoTitle
                                                        nickName={app.app_name}
                                                        userLogo={app.app_logo}
                                                    />
                                                </span>
                                                <p title={app.app_name}>{app.app_name}</p>
                                                <span className="icon-bar">
                                                    <Icon onClick={this.handleRemoveApp.bind(this, app)} type="close" />
                                                </span>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                            <p className="btn-text" onClick={this.showAppSelector.bind(this, true)}>
                                {Intl.get('common.add.product','添加产品')}
                            </p>
                        </div>
                        <ApplyUserAppConfig
                            apps={this.state.selectedApps.map(x => ({
                                client_name: x.app_name,
                                client_logo: x.app_logo,
                                ...x
                            }))}
                            // todo defaultAppSettings
                            appsFormData={this.state.selectedApps.map(x => ({
                                begin_date: moment(),
                                client_id: x.app_id,
                                end_date: moment().add(0.5, 'm'),
                                number: 1,
                                over_draft: 1,
                                range: '0.5m',
                                terminals: x.terminals
                            }))}
                            configType={this.state.configType}
                            changeConfigType={this.changeConfigType}
                            renderAppConfigForm={this.renderAppConfigForm.bind(this)}
                        />
                    </div>
                </GeminiScrollbar>
            </div>
        );
    },

    formatAppFormMapItem(mapItem) {
        let item = mapItem;
        if (!mapItem) {
            item = this.state.defaultSettings;
        }
        let appConfig = {
            ...item.time,
            user_type: item.user_type.value,
            over_draft: item.over_draft.value,
            //二步认证
            is_two_factor: item.is_two_factor.value,
            //多人登录
            multilogin: item.multilogin.value,
        };
        if (!_.isEmpty(item.terminals)) {
            // 应用的多终端
            appConfig.terminals = item.terminals.value;
        }
        return appConfig;
    },

    //渲染“开通信息”步骤
    renderAppConfigForm(appFormData, app) {
        let formData = this.state.formData;
        const isSeparate = this.state.configType === CONFIG_TYPE.SEPARATE_CONFIG;
        if (isSeparate) {
            formData = app ?
                this.formatAppFormMapItem(this.state.appPropSettingsMap[app.app_id]) :
                appFormData;
        } else {
            //统一配置时，取第一个应用的配置传入appConfigForm组件（之前统一配置修改时会同步修改appSettingMap中所有应用的配置）
            if (_.get(this.state.selectedAppIds, 'length')) {
                formData = this.formatAppFormMapItem(this.state.appPropSettingsMap[this.state.selectedAppIds[0]]);
            }
        }
        const timePickerConfig = {
            isCustomSetting: isSeparate ? true : false,
            appId: isSeparate ? app.app_id : ''
        };
        return (
            <AppConfigForm
                selectedApp={app}
                appFormData={formData}
                needApplyNum={false}
                needUserType={true}
                timePickerConfig={timePickerConfig}
                renderUserTimeRangeBlock={this.renderUserTimeRangeBlock}
                onOverDraftChange={this.handleFormItemEdit.bind(this, 'over_draft', app)}
                onChangeUserType={this.handleFormItemEdit.bind(this, 'user_type', app)}
                onCheckTwoFactor={this.handleFormItemEdit.bind(this, 'is_two_factor', app)}
                onCheckMultiLogin={this.handleFormItemEdit.bind(this, 'multilogin', app)}
                needTwoFactorMultiLogin={true}
                isShowTerminals={!_.isEmpty(app.terminals)}
                onSelectTerminalChange={this.handleFormItemEdit.bind(this, 'terminals')}
            />
        );
    },

    //渲染“应用设置”步骤
    renderRolesCarousel() {
        const formData = this.state.formData;

        const height = this.props.height - OperationSteps.height - OperationStepsFooter.height;
        return (
            <div className="app-role-config-container">
                <UserAppConfig
                    defaultSettings={this.state.defaultSettings}
                    selectedApps={this.state.selectedApps}
                    onAppPropertyChange={this.onAppPropertyChange.bind(this)}
                    height={height}
                    hideSingleApp={true}
                    hideAppBasicInfo={true}
                />
            </div>
        );
    },

    //当应用的个性设置改变的时候触发
    onAppPropertyChange(appsSetting) {
        let newAppsSetting = _.get(this.state, 'appsSetting', {});
        _.each(newAppsSetting, (value, appId) => {
            value.roles = _.get(appsSetting[appId], 'roles', []);
            value.rolesInfo = _.get(appsSetting[appId], 'rolesInfo', []);
            value.permissions = _.get(appsSetting[appId], 'permissions', []);
        });
        UserDetailAddAppActions.saveAppsSetting(newAppsSetting);
    },

    //渲染loading，错误，成功提示
    renderIndicator() {
        if (this.state.submitResult === 'loading') {
            return (
                <Icon type="loading" />
            );
        }
        var hide = function() {
            UserDetailAddAppActions.hideSubmitTip();
        };
        if (this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get('user.app.add.success', '添加应用成功')} type="success" showIcon onHide={hide} />
            );
        }
        if (this.state.submitResult === 'error') {
            return (
                <AlertTimer time={3000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide} />
            );
        }
        // 添加应用时，没有选择角色的错误提示
        if (this.state.submitResult === 'selectRoleError') {
            return (
                <div className="apps-no-select-role">
                    <AlertTimer time={6000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide} />
                </div>
            );
        }
        return null;
    },

    turnStep(direction) {
        if (this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        //获取到当前是第几步
        let step = this.state.step;
        if (direction === 'next') {
            if (step === 0) {
                //第一部“选择应用”检查选中应用个数
                if (!this.state.selectedApps.length) {
                    UserDetailAddAppActions.showSelectedAppsError(true);
                    return;
                } else {
                    UserDetailAddAppActions.turnStep(direction);
                    const { appPropSettingsMap } = this.state;
                    //统一配置时将formData数据同步到appSettingMap中
                    if (this.state.configType === CONFIG_TYPE.UNIFIED_CONFIG) {
                        const { range, end_time, start_time } = this.state.formData;
                        _.each(appPropSettingsMap, item => {
                            item.time = {
                                range,
                                end_time,
                                start_time
                            };
                        });
                    }
                    this.setState({
                        appPropSettingsMap
                    }, () => {
                        //点击下一步时存储应用设置map
                        UserDetailAddAppActions.saveAppsSetting(this.state.appPropSettingsMap);
                    });
                }
            } else {
                UserDetailAddAppActions.turnStep(direction);
            }
        } else {
            //上一步直接切换
            UserDetailAddAppActions.turnStep(direction);
        }
    },

    //获取提交的数据
    getSubmitData() {
        //formData
        const formData = this.state.formData;
        //用户类型
        let user_type = formData.user_type;
        if (Oplate.hideSomeItem) {
            user_type = '正式用户';
        }
        //开通状态（开通）
        const status = '1';
        //选中的应用列表
        const selectedApps = this.state.selectedApps;
        //各个应用的配置
        const products = [];
        //遍历应用列表，添加应用配置
        _.each(selectedApps, (appInfo) => {
            const customAppSetting = {};
            //应用id
            const app_id = appInfo.app_id;
            //存下来的配置对象
            const savedAppSetting = this.state.appsSetting[app_id];
            //应用id
            customAppSetting.client_id = app_id;
            //角色
            customAppSetting.roles = savedAppSetting.roles;
            // 角色名称
            customAppSetting.rolesInfo = savedAppSetting.rolesInfo;
            //权限
            customAppSetting.permissions = savedAppSetting.permissions;
            //开通状态
            customAppSetting.status = status;
            //到期停用
            customAppSetting.over_draft = savedAppSetting.over_draft.value;
            //开始时间
            customAppSetting.begin_date = savedAppSetting.time.start_time;
            //结束时间
            customAppSetting.end_date = savedAppSetting.time.end_time;
            //两步验证
            customAppSetting.is_two_factor = savedAppSetting.is_two_factor.value;
            //多人登录
            customAppSetting.mutilogin = savedAppSetting.multilogin.value;
            // 多终端类型
            if (savedAppSetting.terminals) {
                customAppSetting.terminals = _.map(savedAppSetting.terminals.value, 'id');
            }
            //正式、试用
            customAppSetting.user_type = savedAppSetting.user_type.value;
            //设置user_id
            customAppSetting.user_id = this.props.initialUser.user.user_id;
            //添加到列表中
            products.push(customAppSetting);
        });
        return products;
    },

    //完成
    onStepFinish() {
        if (this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        //获取提交数据
        const submitData = this.getSubmitData();
        //选中的应用列表
        const selectedApps = this.state.selectedApps;
        
        //添加应用
        UserDetailAddAppActions.addUserApps(submitData, (apps) => {
            if (apps && _.isArray(apps)) {
                //添加一个应用之后，更新应用列表
                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.UPDATE_ADD_APP_INFO, {
                    user_id: this.props.initialUser.user.user_id,
                    app_info_array: apps
                });
            }

            //面板向右滑
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
            //添加应用成功后，返回详情页面
            AppUserPanelSwitchAction.resetState();
            setTimeout(() => {
                UserDetailAddAppActions.resetState();
            });
        });
    },

    //render函数
    render() {
        return (
            <div className="user-manage-v2 user-detail-add-app-v2">
                <span className="btn-return btn-text" onClick={this.cancel}>{Intl.get('user.detail.return', '返回基本信息')}</span>
                <Form layout='horizontal'>
                    <div className="add-app-container" style={{ height: this.props.height }}>
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <OperationSteps
                                title={Intl.get('common.add.product','添加产品')}
                                current={this.state.step}
                            >
                                <OperationSteps.Step
                                    action={<span className={this.state.step === 0 ? 'active' : ''}>
                                        {Intl.get( 'user.detail.addProduct.selectAndConfig', '选择产品并配置')}<span className="icon-ellipsis">....</span></span>}
                                >
                                </OperationSteps.Step>
                                <OperationSteps.Step
                                    action={<span className={this.state.step === 1 ? 'active' : ''}>
                                        {Intl.get('user.detail.addApp.setRolePermissions', '设置角色权限')}</span>}
                                ></OperationSteps.Step>
                            </OperationSteps>
                            {/* <div style={{ height: this.props.height - 100}}>
                            <GeminiScrollbar> */}
                            <Carousel
                                interval={0}
                                indicators={false}
                                controls={false}
                                activeIndex={this.state.step}
                                direction={this.state.stepDirection}
                                slide={false}
                            >
                                <CarouselItem>
                                    <div className="user-detail-add-app-v2-apps apps-carousel">
                                        {this.renderAppsCarousel()}
                                    </div>
                                </CarouselItem>
                                <CarouselItem>
                                    {this.renderRolesCarousel()}
                                </CarouselItem>
                            </Carousel>
                            {/* </GeminiScrollbar>
                        </div> */}
                            <OperationStepsFooter
                                currentStep={this.state.step}
                                totalStep={2}
                                onStepChange={this.turnStep}
                                onFinish={this.onStepFinish}
                            >
                                {this.renderIndicator()}
                            </OperationStepsFooter>
                        </Validation>
                    </div>
                </Form>
            </div>
        );
    },
});

export default UserDetailAddApp;

