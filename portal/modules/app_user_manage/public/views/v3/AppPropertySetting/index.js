/**
 * Oplate.hideSomeItem 用来判断西语的运行环境
 * */
var createReactClass = require('create-react-class');
require('./index.less');
import { Tooltip, Alert, Tabs } from 'antd';
import classNames from 'classnames';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import UserTypeRadioField from 'CMP_DIR/user_manage_components/user-type-radiofield';
import UserCountNumberField from 'CMP_DIR/user_manage_components/user-count-numberfield';
import UserStatusRadioField from 'CMP_DIR/user_manage_components/user-status-radiofield';
import UserTimeRangeField from 'CMP_DIR/user_manage_components/user-time-rangefield';
import UserOverDraftField from 'CMP_DIR/user_manage_components/user-over-draftfield';
import UserTwoFactorField from 'CMP_DIR/user_manage_components/user-two-factorfield';
import UserMultiLoginField from 'CMP_DIR/user_manage_components/user-multilogin-radiofield';
import AppRolePermission from 'CMP_DIR/user_manage_components/app-role-permission';
var DefaultUserLogoTitle = require('CMP_DIR/default-user-logo-title');
import AppUserUtil from 'MOD_DIR/app_user_manage/public/util/app-user-util.js';
var LAYOUT_CONSTANTS = AppUserUtil.LAYOUT_CONSTANTS;//右侧面板常量
const TabPane = Tabs.TabPane;
import { PropTypes } from 'prop-types';

const AppPropertySetting = createReactClass({
    displayName: 'AppPropertySetting',

    mixins: [
        UserCountNumberField,
        UserTimeRangeField,
        UserOverDraftField,
        UserTwoFactorField,
        UserTypeRadioField,
        UserMultiLoginField,
        UserStatusRadioField
    ],

    propTypes: {
        //默认配置(添加需要传-添加用户，添加单个应用)
        defaultSettings: PropTypes.object,
        //选中的应用列表
        selectedApps: PropTypes.array,
        //应用的自定义配置，修改的时候需要传(修改单个应用，审批界面，修改申请单)
        appsSetting: PropTypes.object,
        //属性变化的时候触发
        onAppPropertyChange: PropTypes.func,
        //是否是单个应用的编辑，而不是添加
        isSingleAppEdit: PropTypes.bool,
        //显示用户个数
        showUserNumber: PropTypes.bool,
        //显示二步认证
        showIsTwoFactor: PropTypes.bool,
        //隐藏单个应用的表单界面
        hideSingleApp: PropTypes.bool,
        //显示多人登录
        showMultiLogin: PropTypes.bool,
        appSelectRoleError: PropTypes.string,
        height: PropTypes.number
    },

    getDefaultProps() {
        return {
            defaultSettings: {},
            selectedApps: [],
            appsSetting: {},
            onAppPropertyChange: function() { },
            height: 'auto',
            isSingleAppEdit: false,
            //显示用户个数
            showUserNumber: false,
            //显示二步认证
            showIsTwoFactor: true,
            //隐藏单个应用
            hideSingleApp: false,
            //显示多人登录
            showMultiLogin: true
        };
    },

    //获取初始state
    getInitialState() {
        const props = this.props;
        let currentApp = _.isArray(props.selectedApps) && props.selectedApps[0] ? props.selectedApps[0] : {};
        const appPropSettingsMap = this.createPropertySettingData(this.props);
        if (!_.isEmpty(appPropSettingsMap)) {
            this.props.onAppPropertyChange(appPropSettingsMap);
        }
        return {
            currentApp: currentApp,
            appPropSettingsMap: appPropSettingsMap,
            //不显示用户类型错误
            show_user_type_error: false,
            //切换当前应用的loading
            changeCurrentAppLoading: false,
            activeKey: ''
        };
    },

    createPropertySettingData(props) {
        //选中的应用
        const selectedApps = props.selectedApps;
        //默认配置，添加的情况下会传
        const defaultSettings = props.defaultSettings;
        //修改的情况下会传appsSetting
        const appsSetting = props.appsSetting;
        //当前的各个应用的设置
        const appPropSettingsMap = this.state && this.state.appPropSettingsMap || {};
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
                //检查单个属性，如果没有重新设置值，用defaultSettings里的值，重新生成
                function checkSingleProp(prop) {
                    if (!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if (!originAppSetting[prop].setted) {
                        originAppSetting[prop].value = defaultSettings[prop];
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
                if (this.props.isSingleAppEdit) {
                    checkSingleProp('user_type');
                }
                //检查到期停用
                checkSingleProp('over_draft');
                //检查二步验证
                if (this.props.showIsTwoFactor) {
                    checkSingleProp('is_two_factor');
                }
                //检查用户状态（启用、停用）
                if (this.props.isSingleAppEdit) {
                    checkSingleProp('status');
                }
                //检查多人登录
                if (this.props.showMultiLogin) {
                    checkSingleProp('multilogin');
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
                    //角色、角色名称、权限，赋值，不会出现在全局设置里，直接设置
                    if (appSettingConfig.roles && _.isArray(appSettingConfig.roles)) {
                        originAppSetting.roles = appSettingConfig.roles;
                    }
                    if (appSettingConfig.rolesInfo && _.isArray(appSettingConfig.rolesInfo)) {
                        originAppSetting.rolesInfo = appSettingConfig.rolesInfo;
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

    compareEquals(json1, json2) {
        if (JSON.stringify(json1) !== JSON.stringify(json2)) {
            return false;
        }
        return true;
    },

    componentWillReceiveProps(nextProps) {

        if (!this.compareEquals(nextProps.selectedApps, this.props.selectedApps)) {
            const newState = {};
            let currentApp = _.isArray(nextProps.selectedApps) && nextProps.selectedApps[0] ? nextProps.selectedApps[0] : {};
            //新的当前应用的id数组
            const currentAppIds = _.map(nextProps.selectedApps, 'app_id');
            newState.currentApp = currentApp;
            this.setState(newState);
        }
        if (!this.compareEquals(nextProps.selectedApps, this.props.selectedApps)
            || !this.compareEquals(nextProps.defaultSettings, this.props.defaultSettings)
            || !this.compareEquals(nextProps.appsSetting, this.props.appsSetting)
        ) {
            const appPropSettingsMap = this.createPropertySettingData(nextProps);
            this.setState({ appPropSettingsMap, activeKey: '' });
        }
    },

    componentDidUpdate(prevProps, prevState) {
        if (!this.compareEquals(this.state.appPropSettingsMap, prevState.appPropSettingsMap)) {
            this.props.onAppPropertyChange(this.state.appPropSettingsMap);
        }
        if (this.state.currentApp.app_id !== prevState.currentApp.app_id) {
            this.handleChangeCurrentApp();
        }
    },

    handleChangeCurrentApp() {
        clearTimeout(this.changeCurrentAppLoadingTimeout);
        this.setState({
            changeCurrentAppLoading: true
        });
        this.changeCurrentAppLoadingTimeout = setTimeout(() => {
            this.setState({
                changeCurrentAppLoading: false
            });
        }, 100);
    },

    changeCurrentApp(appInfo) {
        const appId = appInfo.app_id;
        if (this.state.currentApp.app_id === appId) {
            return;
        }
        const newState = {};
        newState.currentApp = appInfo;
        this.setState(newState);

    },

    onRolesPermissionSelect(app_id, roles, permissions, rolesInfo) {
        var state = this.state;
        var app_info = state.appPropSettingsMap[app_id];
        app_info.roles = roles.slice();
        if (_.isArray(rolesInfo) && rolesInfo.length) {
            app_info.rolesInfo = _.clone(rolesInfo);
        }
        app_info.permissions = permissions.slice();
        this.setState({
            appPropSettingsMap: state.appPropSettingsMap
        }, () => {
            this.props.onAppPropertyChange(this.state.appPropSettingsMap);
        });
    },

    renderTabContent(app_id) {
        const currentApp = this.state.currentApp;
        // if (currentApp.app_id !== app_id) {
        //     return null;
        // }
        const defaultSettings = this.props.defaultSettings;
        var currentAppInfo = this.state.appPropSettingsMap[app_id] || {};
        var selectedRoles = currentAppInfo.roles || [];
        var selectedPermissions = currentAppInfo.permissions || [];
        return (
            <div className={this.state.changeCurrentAppLoading ? 'app-property-container-content change-current-app-loading' : 'app-property-container-content'}>
                <div className="app-property-custom-settings">                   
                    {
                        this.state.activeKey === app_id || !this.state.activeKey ?
                            <AppRolePermission
                                app_id={app_id}
                                selectedRoles={selectedRoles}
                                selectedPermissions={selectedPermissions}
                                onRolesPermissionSelect={this.onRolesPermissionSelect.bind(this, app_id)}
                                updateScrollBar={this.updateScrollBar}
                            /> : null
                    }

                    {
                        this.props.appSelectRoleError && !selectedRoles.length ? (
                            <div className="select-no-role">
                                <Alert message={this.props.appSelectRoleError} showIcon type="error" />
                            </div>
                        ) : null
                    }
                </div>
            </div>
        );
    },

    updateScrollBar: function() {
        this.refs.gemini && this.refs.gemini.update();
    },

    currentTabChange(app_id) {
        var selectedApps = this.props.selectedApps;
        var targetApp = _.find(selectedApps, (app) => app.app_id === app_id);
        if (targetApp) {
            this.changeCurrentApp(targetApp);
        }
    },

    renderTabToolTip(app_name) {
        return (
            <Tooltip title={app_name} placement="right">
                {<div className="app_name_tooltip">{app_name}</div>}
            </Tooltip>
        );
    },

    handleTabChange(activeKey) {
        this.setState({
            activeKey
        });
    },

    render() {
        let height = this.props.height;
        if (height !== 'auto') {
            height = height - LAYOUT_CONSTANTS.BTN_PADDING - LAYOUT_CONSTANTS.BOTTOM_PADDING;//减去底部按钮的padding
        }
        //class名字
        const cls = classNames({
            'app-property-setting': true,
            //如果是单个应用的编辑，添加这个class
            'single-app-edit': this.props.isSingleAppEdit
        });
        if (!this.props.selectedApps.length) {
            return null;
        }
        return (
            <div className={cls}>
                <div className="app-property-container-v3">
                    <Tabs
                        tabPosition='left'
                        onChange={this.handleTabChange}
                    >
                        {
                            this.props.selectedApps.map((app, index) => (
                                <TabPane tab={
                                    <div className="title-container clearfix">
                                        <span className="logo-container" title={app.app_name}>
                                            <DefaultUserLogoTitle
                                                nickName={app.app_name}
                                                userLogo={app.app_logo}
                                            />
                                        </span>
                                        <p title={app.app_name}>{app.app_name}</p>
                                    </div>
                                }
                                key={app.app_id}
                                >
                                    <GeminiScrollBar style={{ height: height }} ref="gemini" className="app-property-content">
                                        {this.renderTabContent(app.app_id)}
                                    </GeminiScrollBar>
                                </TabPane>
                            ))
                        }
                    </Tabs>
                </div>
            </div>
        );
    },
});

export default AppPropertySetting;
