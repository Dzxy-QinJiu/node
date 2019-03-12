/**
 * 客套分析主页
 */

require('./style.less');
import {storageUtil} from 'ant-utils';
import Store from './store';
import ajax from 'ant-ajax';
import TopBar from './top-bar';
import HistoricHighDetail from './historic-high-detail';
import AppSelector from './app-selector';
import {getContextContent} from './utils';
import {initialTime, STORED_APP_ID_KEY, CUSTOMER_IDS_FIELD, DEFERRED_ACCOUNT_ANALYSIS_TITLE} from './consts';
import {AntcAnalysis} from 'antc';
import {Row, Col, Collapse} from 'antd';

const Panel = Collapse.Panel;

import {
    appSelectorEmitter,
    teamTreeEmitter,
    dateSelectorEmitter,
    analysisCustomerListEmitter
} from 'PUB_DIR/sources/utils/emitters';

import rightPanelUtil from 'CMP_DIR/rightPanel';

const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;
const CustomerList = require('MOD_DIR/crm/public/crm-list');

import {hasPrivilege} from 'CMP_DIR/privilege/checker';

//权限类型
const authType = hasPrivilege('CUSTOMER_ANALYSIS_MANAGER') ? 'manager' : 'common';
//数据类型
const dataType = hasPrivilege('GET_TEAM_LIST_ALL') ? 'all' : 'self';

//引入pages目录（包括子目录）下的所有index.js文件
const req = require.context('./pages', true, /index\.js$/);
//分析组
const groups = getContextContent(req);

class CurtaoAnalysis extends React.Component {
    constructor(props) {
        super(props);

        const processedGroups = this.processMenu(groups);

        this.state = {
            currentMenuIndex: '0,0',
            currentCharts: _.get(processedGroups, '[0].pages[0].charts'),
            //当前显示页面的id
            currentPage: '',
            groups: this.processMenu(processedGroups),
            isAppSelectorShow: false,
            //是否显示右侧面板
            isRightPanelShow: false,
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
        this.getClueChannelList();
        this.getClueSourceList();

        analysisCustomerListEmitter.on(analysisCustomerListEmitter.SHOW_CUSTOMER_LIST, this.handleCustomerListEvent);
    }

    componentWillUnmount() {
        analysisCustomerListEmitter.removeListener(analysisCustomerListEmitter.SHOW_CUSTOMER_LIST, this.handleCustomerListEvent);
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

    //获取应用列表
    getAppList = () => {
        ajax.send({
            url: '/rest/global/grant_applications',
            data: {
                integration: true,
                page_size: 1000
            }
        }).then(result => {
            Store.appList = result;
            Store.appList.unshift({
                app_id: 'all',
                app_name: '全部应用',
            });
        });
    };

    //线索渠道列表
    getClueChannelList = () => {
        ajax.send({
            url: '/rest/clue/v1/access_channel/100/1'
        }).then(result => {
            Store.clueChannelList = _.get(result, 'result');
        });
    };

    //线索来源列表
    getClueSourceList = () => {
        ajax.send({
            url: '/rest/clue/v1/clue_source/100/1'
        }).then(result => {
            Store.clueSourceList = _.get(result, 'result');
        });
    };

    processMenu(menus, subMenuField = 'pages') {
        return _.filter(menus, menu => {
            if (menu.privileges) {
                const foundPrivilege = _.find(menu.privileges, privilege => hasPrivilege(privilege));

                if (foundPrivilege) {
                    let subMenus = menu[subMenuField];

                    if (subMenus) {
                        subMenus = this.processMenu(subMenus);
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
                                        onClick={this.handleMenuClick.bind(this, menuIndex, groupIndex, pageIndex)}>{page.title}</div>
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
                        <RightPanelClose
                            title={Intl.get('common.app.status.close', '关闭')}
                            onClick={this.hideRightPanel}
                        />
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

        let adjustConditions;

        if (group.title === '账号分析') {
            isAppSelectorShow = true;
            adjustConditions = conditions => {
                let defaultAppId = storageUtil.local.get(STORED_APP_ID_KEY);
                if (defaultAppId) {
                    if (page.title === DEFERRED_ACCOUNT_ANALYSIS_TITLE && defaultAppId === 'all') {
                        defaultAppId = [_.get(Store.appList, '[1].app_id')];
                    }
                } else {
                    if (page.title === DEFERRED_ACCOUNT_ANALYSIS_TITLE) {
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
            adjustConditions
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
            type: 'query',
        }, {
            name: 'end_time',
            value: initialTime.end,
            type: 'query',
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
            }],
        }];
    }

    render() {
        //是否不显示全部应用选项
        let noAllApp = false;

        if (this.state.currentPage.title === DEFERRED_ACCOUNT_ANALYSIS_TITLE) {
            noAllApp = true;
        }

        const storedAppId = storageUtil.local.get(STORED_APP_ID_KEY);

        let defaultAppId;

        if (storedAppId) {
            defaultAppId = storedAppId.split(',');

            if (this.state.currentPage.title === DEFERRED_ACCOUNT_ANALYSIS_TITLE && storedAppId === 'all') {
                defaultAppId = [_.get(Store.appList, '[1].app_id')];
            }
        } else {
            if (this.state.currentPage.title === DEFERRED_ACCOUNT_ANALYSIS_TITLE) {
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
                                    noAllApp={noAllApp}
                                />
                            </div>
                        ) : null}
                        {this.renderContent()}
                    </Col>
                </Row>
            </div>
        );
    }
}

export default CurtaoAnalysis;
