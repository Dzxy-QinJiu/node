/**
 * Oplate.hideSomeItem 用来判断西语的运行环境
 * */
var createReactClass = require('create-react-class');
require('./index.less');
var language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/form-basic-es_VE.less');
}else if (language.lan() === 'zh'){
    require('../css/form-basic-zh_CN.less');
}

require('../../../public/css/antd-vertical-tabs.css');
import {Tooltip,Tabs, Alert} from 'antd';
const TabPane = Tabs.TabPane;
import classNames from 'classnames';
import GeminiScrollBar from '../../react-gemini-scrollbar';
import UserTypeRadioField from '../user-type-radiofield';
import UserCountNumberField from '../user-count-numberfield';
import UserStatusRadioField from '../user-status-radiofield';
import UserTimeRangeField from '../user-time-rangefield';
import UserOverDraftField from '../user-over-draftfield';
import UserTwoFactorField from '../user-two-factorfield';
import UserMultiLoginField from '../user-multilogin-radiofield';
import UserAppTerminalCheckboxField from '../user-app-terminal-checkboxfield';
import AppRolePermission from '../app-role-permission';
import DetailCard from '../../detail-card';
import DefaultUserLogoTitle from '../../default-user-logo-title';
import AppUserUtil from 'MOD_DIR/app_user_manage/public/util/app-user-util.js';
const LAYOUT_CONSTANTS = AppUserUtil.LAYOUT_CONSTANTS;//右侧面板常量
import {modifyAppConfigEmitter} from 'PUB_DIR/sources/utils/emitters';
const AppPropertySetting = createReactClass({
    displayName: 'AppPropertySetting',

    mixins: [
        UserCountNumberField,
        UserTimeRangeField,
        UserOverDraftField,
        UserTwoFactorField,
        UserTypeRadioField,
        UserMultiLoginField,
        UserStatusRadioField,
        UserAppTerminalCheckboxField
    ],

    propTypes: {
        //默认配置(添加需要传-添加用户，添加单个应用)
        defaultSettings: PropTypes.object,
        // 应用默认配置
        appsDefaultSetting: PropTypes.object,
        //选中的应用列表
        selectedApps: PropTypes.array,
        //应用的自定义配置，修改的时候需要传(修改单个应用，审批界面，修改申请单)
        appsSetting: PropTypes.object,
        //是否是多用户的应用设置，多用户时，appsSetting中的key组成：app_id&&user_id
        isMultiUser: PropTypes.bool,
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
        height: PropTypes.number,
        hideAppBasicInfo: PropTypes.bool, // 隐藏应用的基本配置信息
        isShowOther: PropTypes.bool,
    },

    getDefaultProps() {
        return {
            defaultSettings: {},
            appsDefaultSetting: {},
            selectedApps: [],
            appsSetting: {},
            onAppPropertyChange: function() {},
            height: 'auto',
            isSingleAppEdit: false,
            //显示用户个数
            showUserNumber: false,
            //显示二步认证
            showIsTwoFactor: true,
            //隐藏单个应用
            hideSingleApp: false,
            //显示多人登录
            showMultiLogin: true,
            //是否时多用户的应用设置
            isMultiUser: false,
            hideAppBasicInfo: false, // 隐藏应用的基本配置信息
            isShowOther: true, // 是否显示其他项，默认展示
        };
    },

    //获取初始state
    getInitialState() {
        const props = this.props;
        let currentApp = _.isArray(props.selectedApps) && props.selectedApps[0] ? props.selectedApps[0] : {};
        const appPropSettingsMap = this.createPropertySettingData(this.props);
        if(!_.isEmpty(appPropSettingsMap)) {
            this.props.onAppPropertyChange(appPropSettingsMap);
        }
        return {
            currentApp: currentApp,
            appPropSettingsMap: appPropSettingsMap,
            //不显示用户类型错误
            show_user_type_error: false,
            //切换当前应用的loading
            changeCurrentAppLoading: false
        };
    },
    //获取应用配置对象中的key
    getAppSettingKey(appId, userId){
        //如果是多用户的应用配置，需要app_id和user_id组合确定唯一的应用配置的key
        return this.props.isMultiUser ? `${appId}&&${userId}` : appId;
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
            _.each(selectedApps , (currentApp) => {
                //当前应用的id
                const appId = currentApp.app_id;
                let key = this.getAppSettingKey(currentApp.app_id, currentApp.user_id);
                // 应用的默认配置
                const appsDefaultSetting = _.get(props,`appsDefaultSetting[${appId}]`,{});
                //当前应用的设置
                const originAppSetting = appPropSettingsMap[key] || {};
                //检查角色、权限
                function checkRolePermission() {
                    if(!originAppSetting.roles) {
                        originAppSetting.roles = [];
                    }
                    if(!originAppSetting.permissions) {
                        originAppSetting.permissions = [];
                    }
                    //角色、权限，赋值，不会出现在全局设置里，直接设置
                    if(defaultSettings.roles && _.isArray(defaultSettings.roles)) {
                        originAppSetting.roles = defaultSettings.roles;
                    }
                    if(defaultSettings.permissions && _.isArray(defaultSettings.permissions)) {
                        originAppSetting.permissions = defaultSettings.permissions;
                    }
                }
                //检查单个属性，如果应用有单个默认配置，则用应用的默认配置，如果没有重新设置值，用defaultSettings里的值，重新生成
                function checkSingleProp(prop) {
                    if(!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if(!originAppSetting[prop].setted) {
                        // 若是多终端属性，则用选择当前应用的多终端的值
                        if (prop === 'terminals') {
                            originAppSetting[prop].value = currentApp.terminals;
                        } else {
                            originAppSetting[prop].value = _.toString(appsDefaultSetting && appsDefaultSetting[prop] || defaultSettings[prop]);
                        }
                    }
                }
                //检查时间,时间格式比较特殊
                function checkTime() {
                    if(!originAppSetting.time) {
                        originAppSetting.time = {
                            setted: false
                        };
                    }
                    if(!originAppSetting.time.setted) {
                        originAppSetting.time.start_time = _.get(appsDefaultSetting, 'time.start_time') || defaultSettings.time.start_time;
                        originAppSetting.time.end_time = _.get(appsDefaultSetting, 'time.end_time') || defaultSettings.time.end_time;
                        originAppSetting.time.range = _.get(appsDefaultSetting, 'time.range') || defaultSettings.time.range;
                    }
                }
                //检查用户类型
                if(this.props.isSingleAppEdit) {
                    checkSingleProp('user_type');
                }
                //检查到期停用
                checkSingleProp('over_draft');
                //检查二步验证
                if(this.props.showIsTwoFactor) {
                    checkSingleProp('is_two_factor');
                }
                //检查用户状态（启用、停用）
                if(this.props.isSingleAppEdit) {
                    checkSingleProp('status');
                }
                //检查多人登录
                if(this.props.showMultiLogin) {
                    checkSingleProp('multilogin');
                }
                // 判断当前选择的应用，是否有多终端类型
                if ( !_.isEmpty(currentApp.terminals)) {
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
            let isMultiUser = this.props.isMultiUser;
            _.each(selectedApps , (currentApp) => {
                let key = this.getAppSettingKey(currentApp.app_id, currentApp.user_id);
                const appSettingConfig = appsSetting[key];

                //检查角色、权限
                function checkRolePermission() {
                    if(!originAppSetting.roles) {
                        originAppSetting.roles = [];
                    }
                    if(!originAppSetting.permissions) {
                        originAppSetting.permissions = [];
                    }
                    //角色、权限，赋值，不会出现在全局设置里，直接设置
                    if(appSettingConfig.roles && _.isArray(appSettingConfig.roles)) {
                        originAppSetting.roles = appSettingConfig.roles;
                    }
                    if(appSettingConfig.permissions && _.isArray(appSettingConfig.permissions)) {
                        originAppSetting.permissions = appSettingConfig.permissions;
                    }
                }
                //检查单个属性
                function checkSingleProp(prop) {
                    if(!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if(!originAppSetting[prop].setted) {
                        originAppSetting[prop].value = appSettingConfig[prop];
                    }
                }
                //检查时间
                function checkTime() {
                    if(!originAppSetting.time) {
                        originAppSetting.time = {
                            setted: false
                        };
                    }
                    if(!originAppSetting.time.setted) {
                        originAppSetting.time.start_time = appSettingConfig.time.start_time;
                        originAppSetting.time.end_time = appSettingConfig.time.end_time;
                        originAppSetting.time.range = appSettingConfig.time.range;
                    }
                }
                const originAppSetting = appPropSettingsMap[key] || {};
                if(this.props.isSingleAppEdit) {
                    checkSingleProp('user_type');
                }
                if(this.props.showUserNumber) {
                    checkSingleProp('number');
                }
                checkSingleProp('over_draft');
                if(this.props.showIsTwoFactor) {
                    checkSingleProp('is_two_factor');
                }
                if(this.props.isSingleAppEdit) {
                    checkSingleProp('status');
                }
                if(this.props.showMultiLogin) {
                    checkSingleProp('multilogin');
                }
                // 判断当前选择的应用，是否有多终端类型
                if ( !_.isEmpty(currentApp.terminals)) {
                    checkSingleProp('terminals');
                }
                checkRolePermission();
                checkTime();
                finalResult[key] = originAppSetting;
            });
        };

        //如果有默认配置，用默认配置
        if(!_.isEmpty(defaultSettings)) {
            createPropertySettingByDefaultSettings();
            return finalResult;
        //如果有应用特殊配置，用特殊配置
        } else if(!_.isEmpty(appsSetting)){
            createPropertySettingByAppsSetting();
            return finalResult;
        } else {
        //什么都没有，则什么都没有
            return appPropSettingsMap;
        }
    },

    compareEquals(json1,json2) {
        if(JSON.stringify(json1) !== JSON.stringify(json2)) {
            return false;
        }
        return true;
    },

    componentWillReceiveProps(nextProps) {

        if(!this.compareEquals(nextProps.selectedApps,this.props.selectedApps)) {
            const newState = {};
            let currentApp = _.isArray(nextProps.selectedApps) && nextProps.selectedApps[0] ? nextProps.selectedApps[0] : {};
            //新的当前应用的id数组
            const currentAppIds = _.map(nextProps.selectedApps , 'app_id');
            newState.currentApp = currentApp;
            this.setState(newState);
        }
        if(!this.compareEquals(nextProps.selectedApps,this.props.selectedApps)
            || !this.compareEquals(nextProps.defaultSettings,this.props.defaultSettings)
            || !this.compareEquals(nextProps.appsSetting,this.props.appsSetting)
            || !_.isEmpty(nextProps.appsDefaultSetting)
        ) {
            const appPropSettingsMap = this.createPropertySettingData(nextProps);
            this.setState({appPropSettingsMap});
        }
    },

    componentDidUpdate(prevProps , prevState) {
        if (!this.compareEquals(this.state.appPropSettingsMap, prevState.appPropSettingsMap)) {
            this.props.onAppPropertyChange(this.state.appPropSettingsMap);
        }
        this.handleChangeAppLoading(this.state, prevState);
    },
    handleChangeAppLoading(state, prevState){
        if(state.currentApp.app_id !== prevState.currentApp.app_id) {
            clearTimeout(this.changeCurrentAppLoadingTimeout);
            this.setState({
                changeCurrentAppLoading: true
            });
            this.changeCurrentAppLoadingTimeout = setTimeout(() => {
                this.setState({
                    changeCurrentAppLoading: false
                });
            },100);
        }
    },
    changeCurrentApp(appInfo) {
        const appId = appInfo.app_id;
        if(this.state.currentApp.app_id === appId) {
            return;
        }
        const newState = {};
        newState.currentApp = appInfo;
        this.setState(newState);

    },

    onRolesPermissionSelect(roles , permissions) {
        var state = this.state;
        var app_id = state.currentApp.app_id, user_id = state.currentApp.user_id;
        let key = this.getAppSettingKey(app_id, user_id);
        var app_info = state.appPropSettingsMap[key];
        if (!_.isEqual(app_info.roles, roles) || !_.isEqual(app_info.permissions, permissions)) {
            modifyAppConfigEmitter.emit(modifyAppConfigEmitter.MODIFY_APP_CONFIG);
        }
        app_info.roles = roles.slice();
        app_info.permissions = permissions.slice();
        this.setState({
            appPropSettingsMap: state.appPropSettingsMap
        });
    },

    renderTabContent(app_id) {
        const currentApp = this.state.currentApp;
        if(currentApp.app_id !== app_id) {
            return null;
        }
        let defaultSettings = this.props.defaultSettings;
        // 应用的默认配置
        const appsDefaultSetting = _.get(this,`props.appsDefaultSetting[${app_id}]`,{});
        let key = this.getAppSettingKey(_.get(currentApp,'app_id'),_.get(currentApp,'user_id'));
        var currentAppInfo = this.state.appPropSettingsMap[key] || {};
        let appId = currentApp.app_id;
        var selectedRoles = currentAppInfo.roles || [];
        var selectedPermissions = currentAppInfo.permissions || [];
        let isShowAppTerminals = !_.isEmpty(currentAppInfo.terminals);

        let number = defaultSettings.number;
        let userType = defaultSettings.user_type;
        let time = defaultSettings.time;
        let overDraft = defaultSettings.over_draft;
        let status = defaultSettings.status;
        let terminals = defaultSettings.terminals;
        let multilogin = defaultSettings.multilogin;
        let isTwoFactor = defaultSettings.is_two_factor;
        
        // 修改单个应用时
        if (this.props.isSingleAppEdit) {
            number = _.get(currentAppInfo, 'number.value');
            userType = _.get(currentAppInfo, 'user_type.value');
            time = _.get(currentAppInfo, 'time.value');
            overDraft = _.get(currentAppInfo, 'over_draft.value');
            status = _.get(currentAppInfo, 'status.value');
            terminals = _.get(currentAppInfo, 'terminals.value');
            multilogin = _.get(currentAppInfo, 'multilogin.value');
            isTwoFactor = _.get(currentAppInfo, 'is_two_factor.value');
        }
        // 应用配置的默认信息
        if (!_.isEmpty(appsDefaultSetting)) {
            time = appsDefaultSetting.time;
            overDraft = appsDefaultSetting.over_draft;
            status = appsDefaultSetting.status;
            terminals = _.get(appsDefaultSetting, 'terminals' || terminals);
            multilogin = appsDefaultSetting.multilogin;
            isTwoFactor = appsDefaultSetting.is_two_factor;
        }
        // 多终端
        if (this.props.isMultiUser) {
            appId = `${currentApp.app_id}&&${currentApp.user_id}`;
        }
        return (
            <div className={this.state.changeCurrentAppLoading ? 'app-property-container-content change-current-app-loading' : 'app-property-container-content'}>
                <div className="app-property-custom-settings">
                    {//多用户的应用设置时，只需要更改角色、权限，其他选项不需要更改
                        this.props.isMultiUser ? (
                            isShowAppTerminals ? (
                                <div className="form-item">
                                    <div className="form-item-label">{Intl.get('common.terminals', '终端')}</div>
                                    <div className="form-item-content">
                                        {
                                            this.renderUserAppTerminalCheckboxBlock({
                                                isCustomSetting: true,
                                                appId: appId,
                                                globalTerminals: _.get(defaultSettings, 'terminals',[]),
                                                appAllTerminals: currentAppInfo.terminals.value,
                                                selectedApps: currentApp
                                            })
                                        }
                                    </div>
                                </div>
                            ) : null
                        ) : (
                            <div
                                className="basic-data-form app-property-other-property"
                                style={{display: this.props.hideAppBasicInfo || this.props.hideSingleApp && this.props.selectedApps.length <= 1 && !isShowAppTerminals ? 'none' : 'block'}}
                            >
                                {
                                    this.props.isSingleAppEdit ? (
                                        <div className="form-item">
                                            <div className="form-item-label form-title">
                                                {Intl.get('appEdit.basicConig', '基本配置')}
                                            </div>
                                        </div>
                                    ) : null
                                }
                                {this.props.showUserNumber ? (
                                    <div className="form-item">
                                        <div className="form-item-label">
                                            <ReactIntl.FormattedMessage id="user.batch.open.count" defaultMessage="开通个数" />
                                        </div>
                                        <div className="form-item-content">
                                            {
                                                this.renderUserCountNumberField({
                                                    isCustomSetting: true,
                                                    appId: currentApp.app_id,
                                                    globalNumber: number
                                                })
                                            }

                                        </div>
                                    </div>
                                ) : null}
                                {this.props.isSingleAppEdit ? (
                                    !Oplate.hideSomeItem && <div className="form-item">
                                        <div className="form-item-label">
                                            <ReactIntl.FormattedMessage id="user.user.type" defaultMessage="用户类型" />
                                        </div>
                                        <div className="form-item-content">
                                            {
                                                this.renderUserTypeRadioBlock({
                                                    isCustomSetting: true,
                                                    appId: currentApp.app_id,
                                                    globalUserType: userType
                                                })
                                            }
                                        </div>
                                    </div>
                                ) : null}
                                <div className="form-item">
                                    <div className="form-item-label">
                                        <ReactIntl.FormattedMessage id="user.open.cycle" defaultMessage="开通周期" />
                                    </div>
                                    <div className="form-item-content">
                                        {this.renderUserTimeRangeBlock({
                                            isCustomSetting: true,
                                            appId: currentApp.app_id,
                                            globalTime: time,
                                            //过期重新计算（开始时间变为从当前时间起算）
                                            expiredRecalculate: true,
                                        })}
                                    </div>
                                </div>
                                <div className="form-item">
                                    <div className="form-item-label">
                                        <ReactIntl.FormattedMessage id="user.expire.select" defaultMessage="到期可选" />
                                    </div>
                                    <div className="form-item-content">
                                        {
                                            this.renderUserOverDraftBlock({
                                                isCustomSetting: true,
                                                appId: currentApp.app_id,
                                                globalOverDraft: overDraft
                                            })
                                        }
                                    </div>
                                </div>
                                {this.props.isSingleAppEdit ? (
                                    <div className="form-item">
                                        <div className="form-item-label">
                                            <ReactIntl.FormattedMessage id="common.app.status" defaultMessage="开通状态" />
                                        </div>
                                        <div className="form-item-content">
                                            {
                                                this.renderUserStatusRadioBlock({
                                                    isCustomSetting: true,
                                                    appId: currentApp.app_id,
                                                    globalStatus: status
                                                })
                                            }
                                        </div>
                                    </div>
                                ) : null}
                                {
                                    isShowAppTerminals ? (
                                        <div className="form-item">
                                            <div className="form-item-label">{Intl.get('common.terminals', '终端')}</div>
                                            <div className="form-item-content">
                                                {
                                                    this.renderUserAppTerminalCheckboxBlock({
                                                        isCustomSetting: true,
                                                        appId: currentApp.app_id,
                                                        globalTerminals: terminals,
                                                        appAllTerminals: currentAppInfo.terminals.value,
                                                        selectedApps: currentApp
                                                    })
                                                }
                                            </div>
                                        </div>
                                    ) : null
                                }
                                {
                                    this.props.isShowOther && !Oplate.hideSomeItem && <div className="form-item">
                                        <div className="form-item-label">{Intl.get('crm.186', '其他')}</div>
                                        <div className="form-item-content">
                                            {
                                                this.props.showMultiLogin ? this.renderMultiLoginRadioBlock({
                                                    isCustomSetting: true,
                                                    appId: currentApp.app_id,
                                                    globalMultiLogin: multilogin,
                                                    showCheckbox: true
                                                }) : null
                                            }
                                            {
                                                this.props.showIsTwoFactor ? this.renderUserTwoFactorBlock({
                                                    isCustomSetting: true,
                                                    appId: currentApp.app_id,
                                                    globalTwoFactor: isTwoFactor,
                                                    showCheckbox: true
                                                }) : null
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        )
                    }
                    <AppRolePermission
                        app_id={currentApp.app_id}
                        selectedRoles={selectedRoles}
                        selectedPermissions={selectedPermissions}
                        onRolesPermissionSelect={this.onRolesPermissionSelect}
                        updateScrollBar={this.updateScrollBar}
                    />
                    {
                        this.props.appSelectRoleError && !selectedRoles.length ? (
                            <div className="select-no-role">
                                <Alert message={this.props.appSelectRoleError} showIcon type="error"/>
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
        if(!app_id) return;
        var selectedApps = this.props.selectedApps;
        //多用户的应用配置，应用配置项中的key组成：app_id&&user_id(多用户延期时)
        if(this.props.isMultiUser){
            //需要取出实际的app_id
            app_id = _.get(app_id.split('&&'), '[0]');
        }
        var targetApp = _.find(selectedApps , (app) => app.app_id === app_id);
        if(targetApp) {
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

    render() {
        let height = this.props.height;
        if (this.props.isSingleAppEdit || this.props.hideAppBasicInfo) {
            height = height - LAYOUT_CONSTANTS.BTN_PADDING - LAYOUT_CONSTANTS.BOTTOM_PADDING;//减去底部按钮的padding
        } else if(height !== 'auto'){
            height -= 20;//减去上面的padding
        }
        //class名字
        const cls = classNames({
            'app-property-setting': true,
            //如果是单个应用的编辑，添加这个class
            'single-app-edit': this.props.isSingleAppEdit
        });
        if(!this.props.selectedApps.length) {
            return null;
        }
        return (
            <div className={cls}>
                {
                    this.props.isSingleAppEdit ? (
                        <div className="app-property-container">
                            <GeminiScrollBar style={{ height: height }} ref="gemini" className="app-property-content">
                                {
                                    this.props.selectedApps.map((app, index) => {
                                        return (
                                            <DetailCard
                                                key={index}
                                                title={(
                                                    <div className="title-container clearfix">
                                                        <span className="logo-container" title={app.app_name}>
                                                            <DefaultUserLogoTitle
                                                                nickName={app.app_name}
                                                                userLogo={app.app_logo}
                                                            />
                                                        </span>
                                                        <p title={app.app_name}>{app.app_name}</p>
                                                    </div>
                                                )}
                                                content={this.renderTabContent(app.app_id)}
                                            />
                                        );
                                    })
                                }
                            </GeminiScrollBar>
                        </div>
                    ) : (
                        <div className="app-property-container">
                            <Tabs
                                tabPosition="left"
                                onChange={this.currentTabChange}
                                style={{height: height}}
                            >
                                {
                                    this.props.selectedApps.map((app) => {
                                        return (
                                            <TabPane
                                                tab={this.renderTabToolTip(app.app_name)}
                                                key={this.getAppSettingKey(app.app_id, app.user_id)}
                                            >
                                                <GeminiScrollBar
                                                    style={{height: height}}
                                                    ref="gemini"
                                                    className="app-property-content"
                                                >
                                                    {this.renderTabContent(app.app_id)}
                                                </GeminiScrollBar>
                                            </TabPane>
                                        );
                                    })
                                }
                            </Tabs>

                        </div>
                    )
                }

            </div>
        );
    },
});

export default AppPropertySetting;