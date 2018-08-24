/**
 * Oplate.hideSomeItem 用来判断西语的运行环境
 * */
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
import AppRolePermission from '../app-role-permission';

const PropTypes = React.PropTypes;

const AppPropertySetting = React.createClass({
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
        showMultiLogin: PropTypes.bool
    },
    getDefaultProps() {
        return {
            defaultSettings: {},
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
            showMultiLogin: true
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
                //当前应用的设置
                const originAppSetting = appPropSettingsMap[appId] || {};
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
                //检查单个属性，如果没有重新设置值，用defaultSettings里的值，重新生成
                function checkSingleProp(prop) {
                    if(!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if(!originAppSetting[prop].setted) {
                        originAppSetting[prop].value = defaultSettings[prop];
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
                        originAppSetting.time.start_time = defaultSettings.time.start_time;
                        originAppSetting.time.end_time = defaultSettings.time.end_time;
                        originAppSetting.time.range = defaultSettings.time.range;
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
            _.each(selectedApps , (currentApp) => {

                const appSettingConfig = appsSetting[currentApp.app_id];

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
                const appId = currentApp.app_id;
                const originAppSetting = appPropSettingsMap[appId] || {};
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
                checkRolePermission();
                checkTime();
                finalResult[appId] = originAppSetting;
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
        ) {
            const appPropSettingsMap = this.createPropertySettingData(nextProps);
            this.setState({appPropSettingsMap});
        }
    },
    componentDidUpdate(prevProps , prevState) {
        if (!this.compareEquals(this.state.appPropSettingsMap, prevState.appPropSettingsMap)) {
            this.props.onAppPropertyChange(this.state.appPropSettingsMap);
        }
        if(this.state.currentApp.app_id !== prevState.currentApp.app_id) {
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
        var app_id = state.currentApp.app_id;
        var app_info = state.appPropSettingsMap[app_id];
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
        const defaultSettings = this.props.defaultSettings;
        var currentAppInfo = this.state.appPropSettingsMap[currentApp.app_id] || {};
        var selectedRoles = currentAppInfo.roles || [];
        var selectedPermissions = currentAppInfo.permissions || [];
        return (
            <div className={this.state.changeCurrentAppLoading ? 'app-property-container-content change-current-app-loading' : 'app-property-container-content'}>
                <div className="app-property-custom-settings">
                    <div className="app-property-content basic-data-form app-property-other-property"
                        style={{display: this.props.hideSingleApp && this.props.selectedApps.length <= 1 ? 'none' : 'block'}}
                    >
                        {this.props.showUserNumber ? (
                            <div className="form-item">
                                <div className="form-item-label"><ReactIntl.FormattedMessage id="user.batch.open.count" defaultMessage="开通个数" /></div>
                                <div className="form-item-content">
                                    {
                                        this.renderUserCountNumberField({
                                            isCustomSetting: true,
                                            appId: currentApp.app_id,
                                            globalNumber: defaultSettings.number
                                        })
                                    }

                                </div>
                            </div>
                        ) : null}
                        {this.props.isSingleAppEdit ? (
                            !Oplate.hideSomeItem && <div className="form-item">
                                <div className="form-item-label"><ReactIntl.FormattedMessage id="user.user.type" defaultMessage="用户类型" /></div>
                                <div className="form-item-content">
                                    {
                                        this.renderUserTypeRadioBlock({
                                            isCustomSetting: true,
                                            appId: currentApp.app_id,
                                            globalUserType: defaultSettings.user_type
                                        })
                                    }
                                </div>
                            </div>
                        ) : null}
                        <div className="form-item">
                            <div className="form-item-label"><ReactIntl.FormattedMessage id="user.open.cycle" defaultMessage="开通周期" /></div>
                            <div className="form-item-content">
                                {this.renderUserTimeRangeBlock({
                                    isCustomSetting: true,
                                    appId: currentApp.app_id,
                                    globalTime: defaultSettings.time,
                                    //过期重新计算（开始时间变为从当前时间起算）
                                    expiredRecalculate: true,
                                })}
                            </div>
                        </div>
                        <div className="form-item">
                            <div className="form-item-label"><ReactIntl.FormattedMessage id="user.expire.select" defaultMessage="到期可选" /></div>
                            <div className="form-item-content">
                                {
                                    this.renderUserOverDraftBlock({
                                        isCustomSetting: true,
                                        appId: currentApp.app_id,
                                        globalOverDraft: defaultSettings.over_draft
                                    })
                                }
                            </div>
                        </div>
                        {
                            this.props.showIsTwoFactor ? (
                                !Oplate.hideSomeItem && <div className="form-item">
                                    <div className="form-item-label"><ReactIntl.FormattedMessage id="user.two.step.certification" defaultMessage="二步认证" /></div>
                                    <div className="form-item-content">
                                        {
                                            this.renderUserTwoFactorBlock({
                                                isCustomSetting: true,
                                                appId: currentApp.app_id,
                                                globalTwoFactor: defaultSettings.is_two_factor
                                            })
                                        }
                                    </div>
                                </div>) : null
                        }
                        {this.props.isSingleAppEdit ? (
                            <div className="form-item">
                                <div className="form-item-label"><ReactIntl.FormattedMessage id="common.app.status" defaultMessage="开通状态" /></div>
                                <div className="form-item-content">
                                    {
                                        this.renderUserStatusRadioBlock({
                                            isCustomSetting: true,
                                            appId: currentApp.app_id,
                                            globalStatus: defaultSettings.status
                                        })
                                    }
                                </div>
                            </div>
                        ) : null}
                        {
                            this.props.showMultiLogin ? (
                                !Oplate.hideSomeItem && <div className="form-item">
                                    <div className="form-item-label"><ReactIntl.FormattedMessage id="user.multi.login" defaultMessage="多人登录" /></div>
                                    <div className="form-item-content">
                                        {
                                            this.renderMultiLoginRadioBlock({
                                                isCustomSetting: true,
                                                appId: currentApp.app_id,
                                                globalMultiLogin: defaultSettings.multilogin
                                            })
                                        }
                                    </div>
                                </div>) : null
                        }
                    </div>
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
        var selectedApps = this.props.selectedApps;
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
        if(height !== 'auto') {
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
                <div className="app-property-container">
                    <Tabs
                        tabPosition="left"
                        onChange={this.currentTabChange}
                        style={{height: height}}
                    >
                        {
                            this.props.selectedApps.map((app) => {
                                return <TabPane tab={this.renderTabToolTip(app.app_name)} key={app.app_id}>
                                    <GeminiScrollBar style={{height: height}} ref="gemini" className="app-property-content">
                                        {this.renderTabContent(app.app_id)}
                                    </GeminiScrollBar>
                                </TabPane>;
                            })
                        }
                    </Tabs>

                </div>
            </div>
        );
    }
});

export default AppPropertySetting;