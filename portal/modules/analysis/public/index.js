/**
 * 客套分析主页
 */

require('./style.less');
import { storageUtil } from 'ant-utils';
import Store from './store';
import ajax from 'ant-ajax';
import TopBar from './top-bar';
import AppSelector from './app-selector';
import { getContextContent } from './utils';
import { initialTime } from './consts';
import { AntcAnalysis } from 'antc';
import { Row, Col, Collapse } from 'antd';
const Panel = Collapse.Panel;

const emitters = require('PUB_DIR/sources/utils/emitters');
import { hasPrivilege } from 'CMP_DIR/privilege/checker';

const STORED_APP_ID_KEY = 'analysis_account_active_app_id';

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

        this.state = {
            currentMenuIndex: '0,0',
            currentCharts: _.get(groups, '[0].pages[0].charts'),
            groups: this.processMenu(groups),
            isAppSelectorShow: false,
        };
    }

    componentDidMount() {
        this.getStageList();
        this.getIndustryList();
        this.getAppList();
        this.getClueChannelList(); 
        this.getClueSourceList(); 
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
            url: '/rest/global/grant_applications'
        }).then(result => {
            Store.appList = result;
            Store.selectedAppId = _.get(result, '[0].app_id');
        });
    };

    //线索渠道列表
    getClueChannelList = () => {
        ajax.send({
            url: '/rest/customer/v2/clue/access_channel/100/1'
        }).then(result => {
            Store.clueChannelList = _.get(result, 'result');
        });
    };

    //线索来源列表
    getClueSourceList = () => {
        ajax.send({
            url: '/rest/customer/v2/clue/clue_source/100/1'
        }).then(result => {
            Store.clueSourceList = _.get(result, 'result');
        });
    };

    processMenu(menus, subMenuField = 'pages') {
        _.each(menus, (menu, index) => {
            if (menu.privileges) {
                const foundPrivilege = _.find(menu.privileges, privilege => hasPrivilege(privilege));

                if (foundPrivilege) {
                    const subMenus = menu[subMenuField];

                    this.processMenu(subMenus);
                } else {
                    menus.splice(index, 1);
                }
            }
        });

        return menus;
    }

    renderMenu() {
        return (
            <div className="analysis-menu">
                <Collapse accordion defaultActiveKey='0'>
                    {this.state.groups.map((group, groupIndex) => (
                        <Panel header={group.title} key={groupIndex}>
                            {group.pages.map((page, pageIndex) => {
                                const menuIndex = [groupIndex, pageIndex].join();
                                const className = menuIndex === this.state.currentMenuIndex ? 'active' : '';

                                return (
                                    <div key={pageIndex} className={className} onClick={this.handleMenuClick.bind(this, menuIndex, groupIndex, pageIndex)}>{page.title}</div>
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
                />
            </div>
        );
    }

    handleMenuClick(menuIndex, groupIndex, pageIndex) {
        const page = _.get(groups, '[' + groupIndex + '].pages[' + pageIndex + ']');
        const charts = _.get(page, 'charts');

        let isAppSelectorShow = false;

        if (page.title === '活跃分析') {
            isAppSelectorShow = true;
        }

        this.setState({
            currentMenuIndex: menuIndex,
            currentCharts: charts,
            isAppSelectorShow,
        });
    }

    getConditions() {
        return [{
            name: 'team_ids',
            value: '',
        }, {
            name: 'member_id',
            value: '',
        }, {
            name: 'app_id',
            value: 'all',
            type: 'query,params'
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'query',
        }, {
            name: 'endtime',
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
            emitter: emitters.appSelectorEmitter,
            event: emitters.appSelectorEmitter.SELECT_APP,
            callbackArgs: [{
                name: 'app_id',
            }],
        }, {
            emitter: emitters.teamTreeEmitter,
            event: emitters.teamTreeEmitter.SELECT_TEAM,
            callbackArgs: [{
                name: 'team_ids',
                exclusive: 'member_id'
            }],
        }, {
            emitter: emitters.teamTreeEmitter,
            event: emitters.teamTreeEmitter.SELECT_MEMBER,
            callbackArgs: [{
                name: 'member_id',
                exclusive: 'team_ids'
            }],
        }, {
            emitter: emitters.dateSelectorEmitter,
            event: emitters.dateSelectorEmitter.SELECT_DATE,
            callbackArgs: [{
                name: 'starttime',
            }, {
                name: 'endtime',
            }],
        }];
    }

    render() {
        const defaultAppId = storageUtil.local.get(STORED_APP_ID_KEY) || _.get(Store.appList, '[0].app_id');

        return (
            <div className='curtao-analysis'>
                <TopBar />
                <Row>
                    <Col span={6}>
                        {this.renderMenu()}
                    </Col>
                    <Col span={18}>
                        {this.state.isAppSelectorShow ? (
                            <div className="page-top-bar">
                                <AppSelector storedAppIdKey={STORED_APP_ID_KEY} defaultValue={defaultAppId}/>
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
