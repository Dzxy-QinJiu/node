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
import {isOpenCash} from 'PUB_DIR/sources/utils/common-method-util';
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
    NO_OPEN_CASH_SHOW_MENUS_KEY,
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
    callDeviceTypeEmitter
} from 'PUB_DIR/sources/utils/emitters';

import rightPanelUtil from 'CMP_DIR/rightPanel';

const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;
const CustomerList = require('MOD_DIR/crm/public/crm-list');

import {hasPrivilege} from 'CMP_DIR/privilege/checker';

//引入pages目录（包括子目录）下的所有index.js文件
const req = require.context('./pages', true, /index\.js$/);
//分析组
const groups = getContextContent(req);

class CurtaoAnalysis extends React.Component {
    constructor(props) {
        super(props);

        const processedGroups = this.processMenu(groups);
        console.log(processedGroups);

        this.state = {
            currentMenuIndex: '0,0',
            currentCharts: _.get(processedGroups, '[0].pages[0].charts'),
            //当前显示页面的id
            currentPage: '',
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
        };
    }

    componentDidMount() {
        this.getStageList();
        this.getIndustryList();
        this.getAppList();
        this.getUserTypeList();
        // 获取组织电话系统配置
        this.getCallSystemConfig();

        analysisCustomerListEmitter.on(analysisCustomerListEmitter.SHOW_CUSTOMER_LIST, this.handleCustomerListEvent);
        detailPanelEmitter.on(detailPanelEmitter.SHOW, this.showDetailPanel);

        //将页面body元素的overflow样式设为hidden，以防止出现纵向滚动条
        this.setBodyOverflow('hidden');
    }

    componentWillUnmount() {
        analysisCustomerListEmitter.removeListener(analysisCustomerListEmitter.SHOW_CUSTOMER_LIST, this.handleCustomerListEvent);
        detailPanelEmitter.removeListener(detailPanelEmitter.SHOW, this.showDetailPanel);

        //恢复页面body元素的overflow样式
        this.setBodyOverflow('auto');
    }

    //设置页面body元素的overflow样式
    setBodyOverflow(value = 'auto') {
        $('body').css('overflow', value);
    }

    //获取订单阶段列表
    getStageList = () => {
        ajax.send({
            url: '/rest/customer/v2/salestage'
        }).then(result => {
            Store.stageList = result.result;
        });
    };

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
        ajax.send({
            url: '/rest/global/grant_applications',
            data: {
                integration: true,
                page_size: 1000
            }
        }).then(result => {
            if (_.isArray(result) && !_.isEmpty(result)) {
                Store.appList = result;

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
            //若果定义了是否显示该菜单的回调函数，则调用该函数，以控制菜单的显示隐藏
            //所以这个方法得慎重，因为会跳过权限处理，所以若需要用到权限，还需在这个方法里进行权限验证
            //TODO 最好的处理是 isShowCallBack和privileges都验证通过后，才展示菜单
            if (_.isFunction(menu.isShowCallback)) {
                return menu.isShowCallback();
            }

            if (menu.privileges) {
                const foundPrivilege = _.find(menu.privileges, privilege => hasPrivilege(privilege));
                console.log(menu.title, menu.key, menu.privileges, foundPrivilege);
                //没有开通营收中心时，去掉对应的菜单项
                if(!isOpenCash()) {
                    let flag = _.includes(NO_OPEN_CASH_SHOW_MENUS_KEY, menu.key);
                    if(flag) {
                        return false;
                    }
                }

                if (foundPrivilege) {
                    let subMenus = menu[subMenuField];

                    if (subMenus) {
                        // subMenus = this.processMenu(subMenus);
                        menu[subMenuField] = this.processMenu(subMenus);
                    }

                    return true;
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

    //处理二级菜单点击事件
    handleMenuClick(menuIndex, groupIndex, pageIndex) {
        const group = _.get(this.state.groups, '[' + groupIndex + ']');
        const page = _.get(group, 'pages[' + pageIndex + ']');
        const charts = _.get(page, 'charts');

        let isAppSelectorShow = false;
        let isCallDeviceTypeSelectorShow = false;

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
        } else if (group.key === ACCOUNT_MENUS.INDEX.key) {
            isAppSelectorShow = true;
            adjustConditions = conditions => {
                deleteCallDeviceTypeCondition(conditions);

                let defaultAppId = storageUtil.local.get(STORED_APP_ID_KEY);

                //当前页是否只能选择单个产品
                const isCanOnlySelectSingleApp = this.state.currentPage.isCanOnlySelectSingleApp;
        
                if (defaultAppId) {
                    if (isCanOnlySelectSingleApp && defaultAppId === 'all') {
                        defaultAppId = [_.get(Store.appList, '[1].app_id')];
                    }
                } else {
                    if (isCanOnlySelectSingleApp) {
                        defaultAppId = _.get(Store.appList, '[1].app_id');
                    } else {
                        defaultAppId = 'all';
                    }
                }

                const appIdCondition = _.find(conditions, condition => condition.name === 'app_id');
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
            adjustConditions
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
        //当前页是否只能选择单个产品
        const isCanOnlySelectSingleApp = this.state.currentPage.isCanOnlySelectSingleApp;

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

        const storedAppId = storageUtil.local.get(STORED_APP_ID_KEY);

        let defaultAppId;

        if (storedAppId) {
            defaultAppId = storedAppId.split(',');

            if (isCanOnlySelectSingleApp && storedAppId === 'all') {
                defaultAppId = [_.get(Store.appList, '[1].app_id')];
            }
        } else {
            if (isCanOnlySelectSingleApp) {
                defaultAppId = [_.get(Store.appList, '[1].app_id')];
            } else {
                defaultAppId = ['all'];
            }
        }

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
