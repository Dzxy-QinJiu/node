/**
 * 客套分析主页
 */

require('./style.less');
import Truncate from 'react-truncated-component';
import {storageUtil} from 'ant-utils';
import Store from './store';
import ajax from 'ant-ajax';
import TableListPanel from 'CMP_DIR/table-list-panel';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import TopBar from './top-bar';
import {getCallSystemConfig} from 'PUB_DIR/sources/utils/common-data-util';
import HistoricHighDetail from './historic-high-detail';
import AppSelector from './app-selector';
import {getContextContent} from './utils';
import BackMainPage from 'CMP_DIR/btn-back';
import {
    authType,
    dataType,
    initialTime,
    STORED_APP_ID_KEY,
    CUSTOMER_IDS_FIELD,
    CALL_MENUS,
    ACCOUNT_MENUS
} from './consts';
import {AntcAnalysis} from 'antc';
import {Row, Col, Collapse} from 'antd';

const Panel = Collapse.Panel;

const commonDataUtil = require('PUB_DIR/sources/utils/common-data-util');

import {
    appSelectorEmitter,
    teamTreeEmitter,
    dateSelectorEmitter,
    analysisCustomerListEmitter,
    detailPanelEmitter,
    callDeviceTypeEmitter,
    terminalsSelectorEmitter,
    selectedAppEmitter
} from 'PUB_DIR/sources/utils/emitters';

import rightPanelUtil from 'CMP_DIR/rightPanel';

const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;
const CustomerList = require('MOD_DIR/crm/public/crm-list');

import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import { approveAppConfigTerminal } from 'PUB_DIR/sources/utils/common-method-util';
import SelectAppTerminal from 'CMP_DIR/select-app-terminal';
//引入pages目录（包括子目录）下的所有index.js文件
const req = require.context('./pages', true, /index\.js$/);
//分析组
const groups = getContextContent(req);

class CurtaoAnalysis extends React.Component {
    constructor(props) {
        super(props);

        const processedGroups = this.processMenu(groups);
        const currentPage = _.get(processedGroups, '[0].pages[0]', {});

        this.state = {
            currentMenuIndex: '0,0',
            currentCharts: _.get(currentPage, 'charts', []),
            //当前显示的页面
            currentPage,
            groups: processedGroups,
            isAppSelectorShow: false,
            //是否显示通话设备类型选择器
            isCallDeviceTypeSelectorShow: false,
            //是否显示右侧面板
            isRightPanelShow: false,
            //是否显示详情面板
            isDetailPanelShow: false,
            //是否显示客户列表
            isCustomerListShow: false,
            //是否显示试用合格客户统计历史最高值明细
            isHistoricHighDetailShow: false,
            //试用合格客户统计历史最高值记录
            historicHighData: {},
            isShowAppTerminalSelect: false, // 是否显示多终端筛选框
            selectedAppTerminals: [],
        };
    }

    componentDidMount() {
        this.getIndustryList();
        this.getAppList();
        this.getUserTypeList();
        // 获取组织电话系统配置
        this.getCallSystemConfig();

        analysisCustomerListEmitter.on(analysisCustomerListEmitter.SHOW_CUSTOMER_LIST, this.handleCustomerListEvent);
        detailPanelEmitter.on(detailPanelEmitter.SHOW, this.showDetailPanel);
        appSelectorEmitter.on(appSelectorEmitter.SELECT_APP, this.getSelectedAppId);
        //将页面body元素的overflow样式设为hidden，以防止出现纵向滚动条
        this.setBodyOverflow('hidden');
    }

    componentWillUnmount() {
        analysisCustomerListEmitter.removeListener(analysisCustomerListEmitter.SHOW_CUSTOMER_LIST, this.handleCustomerListEvent);
        detailPanelEmitter.removeListener(detailPanelEmitter.SHOW, this.showDetailPanel);
        appSelectorEmitter.removeListener(appSelectorEmitter.SELECT_APP, this.getSelectedAppId);
        //恢复页面body元素的overflow样式
        this.setBodyOverflow('auto');
    }

    getSelectedAppId = (selectedAppIds) => {
        // 切换应用后，多终端筛选框默认为全部终端
        selectedAppEmitter.emit(selectedAppEmitter.CHANGE_SELECTED_APP, '');
        const selectedAppArray = _.split(selectedAppIds, ',');
        // 只有一个应用时，才可能显示多终端信息，
        if (_.get(selectedAppArray, 'length') === 1 && selectedAppArray[0] !== 'all') {
            // 选择应用的多终端信息
            let selectedAppTerminals = approveAppConfigTerminal(selectedAppArray[0], Store.appList);
            if (!_.isEmpty(selectedAppTerminals)) {
                this.setState({
                    isShowAppTerminalSelect: true, // 是否显示多终端筛选框
                    selectedAppTerminals
                });
            }
        } else {
            this.setState({
                isShowAppTerminalSelect: false,
                selectedAppTerminals: []
            });
        }
    }

    //设置页面body元素的overflow样式
    setBodyOverflow(value = 'auto') {
        $('body').css('overflow', value);
    }

    //获取行业列表
    getIndustryList = () => {
        ajax.send({
            url: '/rest/customer/v2/customer/industries'
        }).then(result => {
            Store.industryList = result.result;
        });
    };

    //获取产品列表
    getAppList = () => {
        commonDataUtil.getAppList((list) => {
            if (_.isArray(list) && !_.isEmpty(list)) {
                Store.appList = _.cloneDeep(list);
                Store.appList.unshift({
                    app_id: 'all',
                    app_name: Intl.get('user.product.all', '全部产品')
                });
                //获取完应用后，再走一遍处理菜单的过程，以便根据是否有应用来控制菜单的显示隐藏
                this.setState({groups: this.processMenu(groups)});
            }
        });
    };

    //获取用户类型列表
    getUserTypeList = () => {
        commonDataUtil.getUserTypeList().then(result => {
            Store.userTypeList = result;
        });
    };
    
    //获取组织电话系统配置
    getCallSystemConfig() {
        getCallSystemConfig().then(config => {
            const isShowEffectiveTimeAndCount = _.get(config,'filter_114',false) || _.get(config,'filter_customerservice_number',false);

            Store.isShowEffectiveTimeAndCount = isShowEffectiveTimeAndCount;
        });
    }

    processMenu(menus, subMenuField = 'pages') {
        menus = _.cloneDeep(menus);

        return _.filter(menus, menu => {
            if (menu.privileges) {
                const foundPrivilege = _.find(menu.privileges, privilege => hasPrivilege(privilege));

                if (foundPrivilege) {
                    let isShow = true;

                    //若果定义了是否显示该菜单的回调函数，则调用该函数，以控制菜单的显示隐藏
                    if (_.isFunction(menu.isShowCallback)) {
                        isShow = menu.isShowCallback();
                    }

                    if (isShow) {
                        let subMenus = menu[subMenuField];
    
                        if (subMenus) {
                            menu[subMenuField] = this.processMenu(subMenus);
                        }
                    }
    
                    return isShow;
                } else {
                    return false;
                }
            }
        });
    }

    //处理一级菜单变更事件
    handleCollapseChange(key) {
        //如果菜单当前处于展开状态，点击时key为undefined，此时无需处理
        if (!key) return;

        const group = this.state.groups[key];
        const pages = group.pages;

        //当选中的一级菜单下只有一个二级菜单时，选中该二级菜单
        if (pages.length === 1) {
            const groupIndex = key;
            const pageIndex = 0;
            const menuIndex = groupIndex + ',' + pageIndex;

            this.handleMenuClick(menuIndex, groupIndex, pageIndex);
        }
    }

    //处理客户列表事件
    handleCustomerListEvent = (customerIds, num, customerIdsField, record) => {
        let state = {
            isRightPanelShow: true,
        };

        //如果是点击历史最高数触发的
        if (customerIdsField === CUSTOMER_IDS_FIELD) {
            _.extend(state, {
                isHistoricHighDetailShow: true,
                historicHighData: _.cloneDeep(record.highest_data),
            });
        } else {
            _.extend(state, {
                isCustomerListShow: true,
                customerListLocation: {
                    state: {
                        customerIds,
                        num,
                    }
                }
            });
        }

        this.setState(state);
    };

    //隐藏右侧面板
    hideRightPanel = () => {
        this.setState({
            isRightPanelShow: false,
            isCustomerListShow: false,
            isHistoricHighDetailShow: false,
        });
    };

    renderMenu() {
        return (
            <div className="analysis-menu">
                <Collapse accordion bordered={false} defaultActiveKey='0'
                    onChange={this.handleCollapseChange.bind(this)}>
                    {_.map(this.state.groups, (group, groupIndex) => (
                        <Panel header={group.title} key={groupIndex}>
                            {_.map(group.pages, (page, pageIndex) => {
                                const menuIndex = [groupIndex, pageIndex].join();
                                const className = menuIndex === this.state.currentMenuIndex ? 'active' : '';

                                return (
                                    <div key={pageIndex} className={className}
                                        onClick={this.handleMenuClick.bind(this, menuIndex, groupIndex, pageIndex)}>
                                        <Truncate numberOfLines={1} lineHeight={25}>
                                            <p title={page.title}>{page.title}</p>
                                        </Truncate>
                                    </div>
                                );
                            })}
                        </Panel>
                    ))}
                </Collapse>
            </div>
        );
    }

    renderContent() {
        return (
            <div className="analysis-content">
                <AntcAnalysis
                    charts={this.state.currentCharts}
                    isUseScrollBar={true}
                    forceUpdate={true}
                    chartHeight={240}
                    conditions={this.getConditions()}
                    emitterConfigList={this.getEmitters()}
                    isGetDataOnMount={true}
                    adjustConditions={this.state.adjustConditions}
                />

                <RightPanel
                    className="analysis-right-panel"
                    showFlag={this.state.isRightPanelShow}
                >
                    <div className="topNav">
                        <BackMainPage className="analysis-back-btn" handleBackClick={this.hideRightPanel}></BackMainPage>
                    </div>
                    <div className="right-panel-content">

                        {this.state.isCustomerListShow ? (
                            <CustomerList
                                location={this.state.customerListLocation}
                                fromSalesHome={true}
                            />
                        ) : null}

                        {this.state.isHistoricHighDetailShow ? (
                            <HistoricHighDetail
                                data={this.state.historicHighData}
                            />
                        ) : null}
                    </div>
                </RightPanel>
            </div>
        );
    }

    // 筛选终端类型
    onSelectTerminalsType = (value) => {
        terminalsSelectorEmitter.emit(terminalsSelectorEmitter.SELECT_TERMINAL, value);
    }

    // 渲染多终端类型
    renderAppTerminalsType = () => {
        return (
            <SelectAppTerminal
                appTerminals={this.state.selectedAppTerminals}
                handleSelectedTerminal={this.onSelectTerminalsType.bind(this)}
            />
        );
    }

    //获取默认应用id
    getDefaultAppId(arg = {}) {
        let defaultAppId = [];
        const currentPage = _.get(arg, 'page', this.state.currentPage);

        //上次选中的应用id
        const storedAppId = storageUtil.local.get(STORED_APP_ID_KEY);

        //当前页是否只能选择单个产品
        const isCanOnlySelectSingleApp = currentPage.isCanOnlySelectSingleApp;

        if (storedAppId) {
            if (storedAppId === 'all') {
                if (isCanOnlySelectSingleApp) {
                    defaultAppId = [_.get(Store.appList, '[1].app_id')];
                } else {
                    defaultAppId = [storedAppId];
                }
            } else {
                defaultAppId = storedAppId.split(',');

                defaultAppId = _.filter(defaultAppId, id => {
                    return _.find(Store.appList, app => app.app_id === id);
                });

                if (_.isEmpty(defaultAppId)) {
                    defaultAppId = [_.get(Store.appList, '[1].app_id')];
                } else if (isCanOnlySelectSingleApp) {
                    defaultAppId.splice(1);
                }
            }
        } else {
            if (isCanOnlySelectSingleApp) {
                defaultAppId = [_.get(Store.appList, '[1].app_id')];
            } else {
                defaultAppId = ['all'];
            }
        }

        if (arg.returnString) {
            defaultAppId = defaultAppId.join(',');
        }

        return defaultAppId;
    }

    //处理二级菜单点击事件
    handleMenuClick(menuIndex, groupIndex, pageIndex) {
        const group = _.get(this.state.groups, '[' + groupIndex + ']');
        const page = _.get(group, 'pages[' + pageIndex + ']');
        const charts = _.get(page, 'charts');

        let isAppSelectorShow = false;
        let isCallDeviceTypeSelectorShow = false;
        let isShowAppTerminalSelect = false;
        let selectedAppTerminals = []; // 选择产品的多终端信息
        let adjustConditions;

        function deleteCallDeviceTypeCondition(conditions) {
            const callDeviceTypeConditionIndex = _.findIndex(conditions, condition => condition.name === 'device_type');

            if (callDeviceTypeConditionIndex !== -1) {
                conditions.splice(callDeviceTypeConditionIndex, 1);
            }
        }

        if (group.key === CALL_MENUS.INDEX.key) {
            isCallDeviceTypeSelectorShow = true;
            adjustConditions = conditions => {
                const callDeviceTypeCondition = _.find(conditions, condition => condition.name === 'device_type');

                if (!callDeviceTypeCondition) {
                    conditions.push({
                        name: 'device_type',
                        value: 'all'
                    });
                }
            };
        } else if (group.key === ACCOUNT_MENUS.INDEX.key) { // 用户分析界面
            isAppSelectorShow = true;
            const defaultAppId = this.getDefaultAppId({page, returnString: true});
            const selectedAppArray = _.split(defaultAppId, ',');
            // 新增过期用户分析,不需要多终端筛选，其他分析，只有选择单个应用时 ，并且选择的应用有终端信息才显示多终端
            if (page.key !== ACCOUNT_MENUS.NEW_ADD_EXPIRE.key && _.get(selectedAppArray, 'length') === 1 && selectedAppArray[0] !== 'all') {
                // 选择应用的多终端信息
                selectedAppTerminals = approveAppConfigTerminal(selectedAppArray[0], Store.appList);
                if (!_.isEmpty(selectedAppTerminals)) {
                    isShowAppTerminalSelect = true;
                }
            }
            adjustConditions = conditions => {
                deleteCallDeviceTypeCondition(conditions);
                const appIdCondition = _.find(conditions, condition => condition.name === 'app_id');
                // 新增过期用户分析界面,不显示多终端筛选
                if (page.key === ACCOUNT_MENUS.NEW_ADD_EXPIRE.key) {
                    const terminalCondition = _.find(conditions, condition => condition.name === 'terminal');
                    _.set(terminalCondition, 'value', '');
                }
                _.set(appIdCondition, 'value', defaultAppId);
                this.adjustStartEndTime(conditions);
            };
        } else {
            if (page.adjustConditions) {
                adjustConditions = page.adjustConditions;
            } else {
                adjustConditions = conditions => {
                    deleteCallDeviceTypeCondition(conditions);

                    const appIdCondition = _.find(conditions, condition => condition.name === 'app_id');
                    _.set(appIdCondition, 'value', 'all');
                    this.adjustStartEndTime(conditions);
                };
            }
        }

        this.setState({
            currentMenuIndex: menuIndex,
            currentCharts: charts,
            currentPage: page,
            isAppSelectorShow,
            isCallDeviceTypeSelectorShow,
            adjustConditions,
            isShowAppTerminalSelect,
            selectedAppTerminals
        }, () => {
            //状态变更完成后，触发一下窗口大小变更事件，使分析组件重新计算其显示区域的高度，以解决显示或隐藏产品选择下拉菜单时，分析组件高度计算不准确的问题
            $(window).resize();
        });
    }

    //将请求条件中的开始结束时间设置为存储的开始结束时间
    //用于从试用合格客户分析切换到其他页面时，修正请求时间为进入试用合格客户分析页面之前的请求时间
    adjustStartEndTime(conditions) {
        const startTime = this.topBar.state.startTime;
        const endTime = this.topBar.state.endTime;
        const startTimeCondition = _.find(conditions, condition => condition.name === 'start_time');
        const endTimeCondition = _.find(conditions, condition => condition.name === 'end_time');

        if (startTimeCondition && endTimeCondition) {
            startTimeCondition.value = startTime;
            endTimeCondition.value = endTime;
        }
    }

    getConditions() {
        return [{
            name: 'team_ids',
            value: '',
        }, {
            name: 'member_ids',
            value: '',
        }, {
            name: 'app_id',
            value: 'all',
            type: 'query,params'
        }, {
            name: 'start_time',
            value: initialTime.start,
        }, {
            name: 'end_time',
            value: initialTime.end,
        }, {
            name: 'interval',
            value: 'day',
        }, {
            //日期选择器上当前选择的时间区间
            name: 'time_range',
            value: initialTime.range,
        }, {
            name: 'auth_type',
            value: authType,
            type: 'params',
        }, {
            name: 'data_type',
            value: dataType,
            type: 'params',
        }, {
            name: 'tab',
            value: 'total',
            type: 'params',
        }, {
            // 多终端类型
            name: 'terminal',
            value: ''
        }];
    }

    getEmitters() {
        return [{
            emitter: callDeviceTypeEmitter,
            event: callDeviceTypeEmitter.CHANGE_CALL_DEVICE_TYPE,
            callbackArgs: [{
                name: 'device_type',
            }],
        }, {
            emitter: appSelectorEmitter,
            event: appSelectorEmitter.SELECT_APP,
            callbackArgs: [{
                name: 'app_id',
                related: {
                    name: 'terminal',
                    value: ''
                }
            }],
        }, {
            emitter: teamTreeEmitter,
            event: teamTreeEmitter.SELECT_TEAM,
            callbackArgs: [{
                name: 'team_ids',
                exclusive: 'member_ids',
                related: {
                    name: 'statistics_type',
                    value: 'team'
                }
            }],
        }, {
            emitter: teamTreeEmitter,
            event: teamTreeEmitter.SELECT_MEMBER,
            callbackArgs: [{
                name: 'member_ids',
                exclusive: 'team_ids',
                related: {
                    name: 'statistics_type',
                    value: 'user'
                }
            }],
        }, {
            emitter: dateSelectorEmitter,
            event: dateSelectorEmitter.SELECT_DATE,
            callbackArgs: [{
                name: 'start_time',
            }, {
                name: 'end_time',
            }, {
                name: 'interval',
            }, {
                name: 'time_range',
            }],
        }, {
            emitter: terminalsSelectorEmitter,
            event: terminalsSelectorEmitter.SELECT_TERMINAL,
            callbackArgs: [{
                name: 'terminal',
            }],
        }];
    }

    //显示详情面板
    showDetailPanel = detailPanelParams => {
        this.setState({
            isDetailPanelShow: true,
            detailPanelParams
        });
    }

    //隐藏详情面板
    hideDetailPanel = () => {
        this.setState({
            isDetailPanelShow: false,
        });
    }

    render() {
        let appList = _.cloneDeep(Store.appList);
        //产品选择模式
        let appSelectMode = 'multiple';

        //如果当前页配置中设置了只能选择单个产品
        if (this.state.currentPage.isCanOnlySelectSingleApp) {
            //去掉全部产品项
            appList.splice(0, 1);
            //设成只能单选
            appSelectMode = '';
        }

        const defaultAppId = this.getDefaultAppId();

        return (
            <div className='curtao-analysis'>
                <TopBar
                    currentPage={this.state.currentPage}
                    ref={ref => this.topBar = ref}
                    isCallDeviceTypeSelectorShow={this.state.isCallDeviceTypeSelectorShow}
                />
                <Row>
                    <Col span={3}>
                        {this.renderMenu()}
                    </Col>
                    <Col span={21}>
                        {this.state.isAppSelectorShow ? (
                            <div className="page-top-bar">
                                <AppSelector
                                    storedAppIdKey={STORED_APP_ID_KEY}
                                    defaultValue={defaultAppId}
                                    appList={appList}
                                    selectMode={appSelectMode}
                                />
                                {
                                    this.state.isShowAppTerminalSelect && _.get(this.state.selectedAppTerminals, 'length') ? (
                                        <div className="select-app-terminals">
                                            { this.renderAppTerminalsType()}
                                        </div>
                                    ) : null
                                }
                            </div>
                        ) : null}

                        {this.renderContent()}
                    </Col>
                </Row>

                <TableListPanel/>

                {this.state.isDetailPanelShow ? (
                    <RightPanelModal
                        isShowCloseBtn={true}
                        onClosePanel={this.hideDetailPanel}
                        {...this.state.detailPanelParams}
                    />
                ) : null}
            </div>
        );
    }
}

export default CurtaoAnalysis;
