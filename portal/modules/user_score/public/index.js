/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/5.
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import NoDataIntro from 'CMP_DIR/no-data-intro';
require('./css/index.less');
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import userScoreStore from './store/index';
import userScoreAction from './action/index';
import {Input, Tabs, Switch, Row, Col, Select, InputNumber, Button, Icon, message, Alert} from 'antd';
const {Option} = Select;
const {TabPane} = Tabs;
var uuid = require('uuid/v4');
import AlertTimer from 'CMP_DIR/alert-timer';
import Spinner from 'CMP_DIR/spinner';
import {TimeRangeSelect} from 'MOD_DIR/customer_score/public/utils/customer_score_util';
import {RETRY_GET_APP} from 'MOD_DIR/app_user_manage/public/util/consts';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import {StatusWrapper} from 'antc';
import MemberStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';
var spanLength = '8';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {getIntegrationConfig, getProductList, uniqueObjectOfArray} from 'PUB_DIR/sources/utils/common-data-util';
let history = require('PUB_DIR/sources/history');
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
class userScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userScoreFormData: {},//用户评分规则
            userEngagementFormData: {},//用户参与度规则
            showUserEngagementPanel: false,//是否展示添加用户参与度面板
            getUserIntegrationConfigLoading: false,//是否正在获取用户接入
            getUserIntegrationConfigErrMsg: '',//获取用户接入失败的信息
            isEditUserEngagementRule: false,
            ...userScoreStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(userScoreStore.getState());
    };
    getUserScoreData = () => {
        this.getUserIndicator();
        this.getUserEngagementRule();
        this.getUserScoreLists();
    };
    getUserIntegrationConfig = () => {
        this.setState({
            getUserIntegrationConfigLoading: true,
            getUserIntegrationConfigErrMsg: ''
        });
        getIntegrationConfig().then(resultObj => {
            let integrationType = _.get(resultObj, 'type');
            //集成类型不存在或集成类型为uem时，
            if (!integrationType || integrationType === INTEGRATE_TYPES.UEM) {
                //获取已集成的产品列表
                getProductList(productList => {
                    //有产品时，直接获取用户列表并展示
                    if (_.get(productList, '[0]')) {
                        this.setState({
                            showUserIntro: false,
                            appList: productList,
                            getUserIntegrationConfigLoading: false,
                            getUserIntegrationConfigErrMsg: ''
                        });
                        this.getUserScoreData();
                    } else {//没有产品时，展示添加产品及配置界面
                        this.setState({
                            showUserIntro: true,
                            getUserIntegrationConfigLoading: false,
                            getUserIntegrationConfigErrMsg: ''
                        });
                    }
                });
            } else {//集成类型为：oplate或matomo时，直接获取用户列表并展示
                this.setState({
                    showUserIntro: false,
                    getUserIntegrationConfigLoading: false,
                    getUserIntegrationConfigErrMsg: ''
                });
                this.getAppLists();
                this.getUserScoreData();
            }
        }, errorMsg => {
            this.setState({
                showUserIntro: false,
                getUserIntegrationConfigLoading: false,
                getUserIntegrationConfigErrMsg: errorMsg
            });
        });
    };

    componentDidMount() {
        userScoreStore.listen(this.onStoreChange);
        this.getUserIntegrationConfig();


    }

    componentWillUnmount() {
        userScoreStore.unlisten(this.onStoreChange);
    }
    getAppLists(){
        userScoreAction.getAppList((result) => {
            this.setState({
                appList: result
            });
        });
    }
    getUserIndicator() {
        userScoreAction.getUserScoreIndicator();
    }

    getUserEngagementRule() {
        userScoreAction.getUserEngagementRule((result) => {
            this.setState({
                userEngagementFormData: _.cloneDeep(result)
            });
        });
    }

    getUserScoreLists() {
        userScoreAction.getUserScoreLists((result) => {
            this.setState({
                userScoreFormData: _.cloneDeep(result)
            });
        });
    }


    componentWillMount() {
    }

    handleUserProperty = (id, property, value) => {
        const {userScoreFormData} = this.state;
        var userScoreDetailList = _.get(userScoreFormData, 'detail', []);
        var target = _.find(userScoreDetailList, item => item.id === id || item.randomId === id);
        if (target) {
            target[property] = value;
            //如果修改indicator，也需要把后面分数的选项更改一下
            if (property === 'indicator') {
                target['online_unit'] = _.get(this, `state.userIndicatorType[${value}][0].value`);
            }
        }

        this.setState({
            userScoreFormData
        });
    };

    handleAddBtn = () => {
        const {userScoreFormData, userIndicator, userIndicatorRange, userIndicatorType} = this.state;
        var userScoreDetailList = _.get(userScoreFormData, 'detail', []);
        if (userScoreDetailList.length === 1) {
            //查出上一条记录选择的是什么
            var dataItem = _.get(userScoreDetailList, '[0]');
            var userIndicatorFilter = _.filter(userIndicator, item => item.indicator !== dataItem.indicator);
            if (_.get(userIndicatorFilter, 'length')) {
                var indicator = _.get(userIndicatorFilter, '[0].indicator');
                userScoreDetailList.push({
                    'indicator': indicator,
                    'interval': _.get(userIndicatorRange[indicator], '[0].value'),
                    'online_unit': _.get(userIndicatorType[indicator], '[0].value'),
                    'score': '1',
                    'randomId': uuid()
                });
            }
        }

        this.setState({
            userScoreFormData
        });
    };
    handleMinusBtn = (id) => {
        var {userScoreFormData} = this.state;
        var userScoreDetailList = _.get(userScoreFormData, 'detail', []);
        userScoreFormData.detail = _.filter(userScoreDetailList, item => item.randomId !== id && item.id !== id);
        this.setState({
            userScoreFormData
        });
    };
    handleUserScoreRuleStatus = (checkFlag) => {
        var {userScoreFormData} = this.state;
        if (checkFlag) {
            userScoreFormData.status = 'enable';
        } else {
            userScoreFormData.status = 'disable';
        }

        this.setState({
            userScoreFormData
        });
    };
    handleUserEngagementRuleStatus = (checkFlag) => {
        var {userEngagementFormData} = this.state;
        if (checkFlag) {
            userEngagementFormData.status = 'enable';
        } else {
            userEngagementFormData.status = 'disable';
        }
        this.setState({
            userEngagementFormData
        },() => {

        });
    };
    renderUserBasicScoreLists = () => {
        const {userIndicator, userIndicatorRange, userIndicatorType, userScoreFormData, isEditUserBasicRule, userLevelObj} = this.state;
        var userScoreDetailList = _.get(userScoreFormData, 'detail', []);
        if (!userScoreDetailList.length) {
            userScoreDetailList.push({
                'indicator': '',
                'interval': '',
                'online_unit': '',
                'score': '1',
                'randomId': uuid()
            });
        }

        if (_.get(userLevelObj, 'loading')) {
            return (<Spinner/>);
        } else if (_.get(userLevelObj, 'errMsg')) {
            var errMsg = <span>{_.get(userLevelObj, 'errMsg')}
                <a onClick={this.getCustomerScoreLevel}>
                    {Intl.get('user.info.retry', '请重试')}
                </a></span>;
            return (
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                />
            );
        } else if (_.isArray(userIndicator) && _.get(userIndicator, 'length')) {
            return <div>
                {_.map(userScoreDetailList, (item, index) => {
                    var userIndicatorList = _.cloneDeep(userIndicator),
                        userIndicatorRangeList = _.cloneDeep(userIndicatorRange),
                        userIndicatorTypeList = _.cloneDeep(userIndicatorType);
                    //过滤一下下拉框的选项
                    if (_.get(userScoreDetailList, 'length') === _.get(userIndicator, 'length')) {
                        userIndicatorList = _.filter(userIndicatorList, indicatorItem => indicatorItem.indicator === item.indicator);
                    }
                    var targetIndicator = _.find(userIndicatorList, indicator => indicator.indicator === item.indicator);
                    var targetTimeRange = _.find(userIndicatorRangeList[item['indicator']], timeRange => timeRange.value === item.interval);
                    var numberTarget = _.find(userIndicatorTypeList[item['indicator']], number => number.value === item.online_unit);
                    return (
                        <Row>
                            <Col span={spanLength}>
                                {isEditUserBasicRule ? <Select
                                    style={{width: 100}}
                                    value={item['indicator']}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'indicator')}
                                >
                                    {userIndicatorList.map((item, index) => (
                                        <Option key={index} value={item.indicator}>{item.desc}</Option>
                                    ))}
                                </Select> : _.get(targetIndicator, 'desc')}

                            </Col>
                            <Col span={spanLength}>
                                {isEditUserBasicRule ? <Select
                                    style={{width: 100}}
                                    value={item['interval']}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'interval')}
                                >
                                    {_.isArray(userIndicatorRangeList[item['indicator']]) ? userIndicatorRangeList[item['indicator']].map((item, index) => (
                                        <Option key={index} value={item.value}>{item.name}</Option>
                                    )) : null}
                                </Select> : _.get(targetTimeRange, 'name')}
                            </Col>
                            <Col span={spanLength}>
                                {isEditUserBasicRule ? <Select
                                    style={{width: 100}}
                                    value={item['online_unit']}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'online_unit')}
                                >
                                    {_.isArray(userIndicatorTypeList[item['indicator']]) ? userIndicatorTypeList[item['indicator']].map((item, index) => (
                                        <Option key={index} value={item.value}>{item.name}</Option>
                                    )) : null}

                                </Select> : _.get(numberTarget, 'name')}
                                <span className="start-icon"> X </span>
                                {isEditUserBasicRule ? <InputNumber value={item.score}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'score')}
                                    min={1}/> : item.score || 1}
                                {Intl.get('user.time.minute', '分')}
                                {isEditUserBasicRule ? <span className="add-minus-btns">
                                    {index + 1 !== _.get(userIndicator, 'length') && index === userScoreDetailList.length - 1 ?
                                        <span onClick={this.handleAddBtn}> + </span> : null}
                                    {userScoreDetailList.length > 1 ?
                                        <span
                                            onClick={this.handleMinusBtn.bind(this, item.id || item.randomId)}> - </span> : null}

                                </span> : null}

                            </Col>
                        </Row>
                    );
                })}

                {isEditUserBasicRule ? <div className="save-btns">
                    <SaveCancelButton loading={this.state.isSavingRules}
                        saveErrorMsg={this.state.saveRulesErr}
                        handleSubmit={this.handleSaveRules}
                        handleCancel={this.handleCancelRules}
                    />
                </div> : null}
            </div>;
        }
    };
    handleClickUserBasicRule = () => {
        this.setState({
            isEditUserBasicRule: true
        });
    };

    renderBasicScoreRules() {
        const {isEditUserBasicRule, userLevelObj} = this.state;
        return (
            <div className="basic-score-rule" data-tracename="基础评分">
                <p className="basic-score-title">
                    {Intl.get('user.score.basic.score', '基础评分')}
                    {userLevelObj.loading ? null : <StatusWrapper
                        errorMsg={this.state.errorMsg}
                        size='small'
                    >
                        <MemberStatusSwitch
                            title={Intl.get('customer.score.status.rules', '确定要{status}该规则？', {
                                status: _.get(this, 'state.userScoreFormData.status') !== 'enable' ? Intl.get('common.enabled', '启用') :
                                    Intl.get('common.stop', '停用')
                            })}
                            handleConfirm={this.handleUserScoreRuleStatus}
                            status={_.get(this, 'state.userScoreFormData.status') === 'enable'}
                        />
                    </StatusWrapper>}
                    {isEditUserBasicRule || userLevelObj.loading ? null :
                        <i className="iconfont icon-update" onClick={this.handleClickUserBasicRule}></i>}
                </p>
                <Row className='thead-title'>
                    <Col span={spanLength}>{Intl.get('clue.customer.score.indicator', '指标')}</Col>
                    <Col span={spanLength}>{Intl.get('user.apply.detail.table.time', '周期')}</Col>
                    <Col span={spanLength}>{Intl.get('user.login.score', '分数')}</Col>
                </Row>

                <div className="user-score-lists">
                    {this.renderUserBasicScoreLists()}
                </div>
            </div>
        );

    }
    handleClickUserEngagementRule = () => {
        this.setState({
            isEditUserEngagementRule: true
        });
    };
    handleSelectedAppChange = () => {
        this.setState({
            isEditUserEngagementRule: false
        });
    }
    renderEngagementTabs = () => {
        const {appList, userEngagementFormData, isEditUserEngagementRule} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements');

        return (
            <div>
                <Tabs defaultActiveKey="1" tabPosition='left' style={{ height: 220 }} onChange={this.handleSelectedAppChange}>
                    {_.map(appList,(appItem, idx) => {
                        var engageItem = _.find(userEngagements,item => item.app_id === appItem.app_id);
                        return (
                            <TabPane tab={appItem.app_name} key={idx} >
                                {_.get(engageItem,'detail[0]') ?
                                    _.map(_.get(engageItem, 'detail', []), (operateItem, idx) => {
                                        var engageId = engageItem.app_id || engageItem.randomId;
                                        var detailId = operateItem.id || operateItem.randomId;
                                        var targetTimeRange = _.find(TimeRangeSelect, timeRange => timeRange.value === operateItem.interval);
                                        return <div>
                                            {idx === 0 ? <Row className='thead-title'>
                                                <Col span={spanLength}>{Intl.get('common.operate', '操作')}</Col>
                                                <Col
                                                    span={spanLength}>{Intl.get('user.apply.detail.table.time', '周期')}</Col>
                                                <Col
                                                    span={spanLength}>{Intl.get('user.login.score', '分数')}</Col>
                                            </Row> : null}
                                            <Row>
                                                <Col span={spanLength}>
                                                    {isEditUserEngagementRule ? <Input value={operateItem.operate}
                                                        onChange={this.handleUserEngaegementProperty.bind(this, engageId, detailId, 'operate')}/> : operateItem.operate}

                                                </Col>
                                                <Col span={spanLength}>
                                                    {isEditUserEngagementRule ? <Select
                                                        value={operateItem.interval}
                                                        style={{width: 100}}
                                                        placeholder={Intl.get('user.score.choose.interval', '请选择周期')}
                                                        onChange={this.handleUserEngaegementProperty.bind(this, engageId, detailId, 'interval')}
                                                    >
                                                        {_.map(TimeRangeSelect, item => {
                                                            return <Option
                                                                value={item.value}>{item.name}</Option>;
                                                        })}
                                                    </Select> : _.get(targetTimeRange, 'name')}

                                                </Col>
                                                <Col span={spanLength}>
                                                    {Intl.get('customer.score.total.count', '总次数')}
                                                    X
                                                    {isEditUserEngagementRule ? <InputNumber value={operateItem.score}
                                                        onChange={this.handleUserEngaegementProperty.bind(this, engageId, detailId, 'score')}
                                                        min={1}/> : operateItem.score || 1}
                                                    {Intl.get('user.time.minute', '分')}
                                                </Col>
                                                <div className="add-operate-item">

                                                    {idx + 1 === _.get(engageItem, 'detail.length') && !isEditUserEngagementRule ? <span
                                                        onClick={this.handeAddEngageDetail.bind(this, engageId)}>+</span> : null}
                                                    {_.get(engageItem, 'detail.length') > 1 && !isEditUserEngagementRule ? <span
                                                        onClick={this.handleMinusEngageDetail.bind(this, engageId, detailId)}>-</span> : null}
                                                </div>
                                            </Row>
                                        </div>;
                                    })
                                    : <NoDataIntro renderAddAndImportBtns={this.noOperationIntroBtn} showAddBtn={true} noDataAndAddBtnTip = {Intl.get('user.score.no.config.operation.config', '暂未配置操作指标')} />}
                                {/*保存*/}
                            </TabPane>
                        );
                    })}
                </Tabs>
            </div>
        );
    };
    noOperationIntroBtn = () => {
        return <div className="btn-containers">
            <Button type='primary' onClick={this.handleShowAppPanel}>{Intl.get('user.score.start.config', '开始配置')}</Button>
        </div>;
    };
    handleShowAppPanel = () => {
        this.setState({
            isEditUserEngagementRule: true
        });
    };

    renderParticateScoreRules = () => {
        const {userEngagementFormData, userEngagementObj, isEditUserEngagementRule} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements', []);
        if (!_.get(userEngagements, 'length')) {
            userEngagementFormData.status = 'enable';
            userEngagements.push({
                app_id: '',
                app_name: '',
                randomId: uuid(),
                detail: [{
                    operate: '',
                    randomId: uuid(),
                    interval: '',
                    score: 1
                }]
            });
            userEngagementFormData['user_engagements'] = userEngagements;
        }
        if (userEngagementObj.loading) {
            return <Spinner/>;
        } else if (userEngagementObj.errMsg) {
            var errMsg = <span>{_.get(userEngagementObj, 'errMsg')}
                <a onClick={this.getUserEngagementRule}>
                    {Intl.get('user.info.retry', '请重试')}
                </a></span>;
            return (
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                />
            );
        } else {
            var engageRuleOpen = _.get(userEngagementFormData, 'status') === 'enable';
            return (<div className="user-engagement-panel">
                <p className="user-engage-title">
                    {Intl.get('user.score.particate.in.score', '参与度评分')}
                    {userEngagementObj.loading ? null : <StatusWrapper
                        errorMsg={userEngagementObj.errMsg}
                        size='small'
                    >
                        <MemberStatusSwitch
                            title={Intl.get('customer.score.status.rules', '确定要{status}该规则？', {
                                status: !engageRuleOpen ? Intl.get('common.enabled', '启用') :
                                    Intl.get('common.stop', '停用')
                            })}
                            handleConfirm={this.handleUserEngagementRuleStatus}
                            status={engageRuleOpen}
                        />
                    </StatusWrapper>}
                    {isEditUserEngagementRule || userEngagementObj.loading || !engageRuleOpen ? null :
                        <i className="iconfont icon-update" onClick={this.handleClickUserEngagementRule}></i>}
                </p>
                <div className="user-engagement-item-wrap">
                    <div className="user-engagement-and-add">
                        <div className="user-engagement-item">
                            {/*如果参与度是禁用状态，加提示*/}
                            {_.get(userEngagementFormData, 'status') !== 'enable' ? <NoDataIntro noDataTip={Intl.get('user.score.no.engagement.score', '暂未开启参与度评分')}/> : this.renderEngagementTabs()}
                        </div>
                    </div>
                </div>
            </div>);
        }
    }
    handleAddEngagementItem = () => {
        const {userEngagementFormData} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements', []);
        userEngagements.push({
            app_id: '',
            app_name: '',
            randomId: uuid(),
            detail: [{
                operate: '',
                randomId: uuid(),
                interval: '',
                score: 1
            }]
        });
        this.setState({
            userEngagementFormData
        });
    };
    handleMinusEngagementItem = (engageId) => {
        const {userEngagementFormData} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements', []);
        userEngagementFormData['user_engagements'] = _.filter(userEngagements, item => item.app_id !== engageId && item.randomId !== engageId);
        this.setState({
            userEngagementFormData
        });
    };
    handleMinusEngageDetail = (engageId, detailId) => {
        const {userEngagementFormData} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements', []);
        var target = _.find(userEngagements, item => item.randomId === engageId || item.app_id === engageId);
        if (target && _.isArray(target.detail)) {
            target.detail = _.filter(target.detail, item => item.id !== detailId && item.randomId !== detailId);
        }
        this.setState({
            userEngagementFormData
        });
    };
    handleUserEngaegementProperty = (engageId, detailId, property, value) => {
        const {userEngagementFormData} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements', []);
        var target = _.find(userEngagements, item => item.randomId === engageId || item.app_id === engageId);
        if (target) {
            if (_.isArray(target.detail) && detailId) {
                var subTarget = _.find(target.detail, item => item.id === detailId || item.randomId === detailId);
                if (subTarget) {
                    subTarget[property] = _.isString(value) ? value : value.target.value;
                }
            } else {
                target[property] = value;
                if (property === 'app_id') {
                    var appTarget = _.find(this.state.appList, appItem => appItem.app_id === value);
                    if (appTarget) {
                        target['app_name'] = appTarget['app_name'];
                    }
                }
            }
        }
        this.setState({
            userEngagementFormData
        });
    };
    handeAddEngageDetail = (engageId) => {
        const {userEngagementFormData} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements', []);
        var target = _.find(userEngagements, item => item.randomId === engageId || item.app_id === engageId);
        if (target && _.isArray(target.detail)) {
            target.detail.push({
                operate: '',
                randomId: uuid(),
                interval: '',
                score: 1
            });
        }
        this.setState({
            userEngagementFormData
        });
    };
    handleShowUserEngagementPanel = () => {
        this.setState({
            showUserEngagementPanel: true
        });
    };

    //保存
    handleSaveRules = () => {
        var userScoreFormData = _.cloneDeep(this.state.userScoreFormData);
        var userDetail = _.get(userScoreFormData, 'detail');
        _.forEach(userDetail, item => {
            delete item.randomId;
            if (item.indicator === 'active_days') {
                delete item.online_unit;
            }
        });
        userScoreAction.saveUserScoreLists(userScoreFormData, () => {
            message.success(Intl.get('common.save.success', '保存成功'));
            //如果保存成功，会有回调
            userScoreAction.updateUserRule(userScoreFormData);
        });

    };
    handleSaveEngagements = () => {
        var userEngagementFormData = _.cloneDeep(this.state.userEngagementFormData);
        var userEngagements = _.get(userEngagementFormData, 'user_engagements');
        var hasError = false;
        _.forEach(userEngagements, engageItem => {
            delete engageItem.randomId;
            if (!engageItem.app_id || !engageItem.app_name) {
                hasError = true;
            }
            if (_.isArray(engageItem.detail)) {
                _.forEach(engageItem.detail, (operatorItem) => {
                    delete operatorItem.randomId;
                });
            }
        });
        if (hasError) {
            message.error(Intl.get('leave.apply.select.product', '请选择产品'));
            return;
        }
        userScoreAction.saveUserEngagementRule(userEngagementFormData, () => {
            message.success(Intl.get('common.save.success', '保存成功'));
            //如果保存成功，会有回调
            userScoreAction.updateUserEngagement(userEngagementFormData);
        });
    };

    //取消信息的保存
    handleCancelRules = () => {
        this.setState({
            userScoreFormData: _.cloneDeep(this.state.userLevelObj.obj)
        });
    };
    handleCancelEngagement = () => {
        this.setState({
            userEngagementFormData: _.cloneDeep(this.state.userEngagementObj.obj)
        });
    };
    hideSaveTooltip = () => {
        userScoreAction.hideSaveErrMsg();
    };
    jumpToUserPanel = () => {
        history.push('/user/list');
    };
    renderAddAndImportBtns = () => {
        return (
            <div className="btn-containers">
                <Button type='primary'
                    onClick={this.jumpToUserPanel}>{Intl.get('user.score.intro.user', '接入用户')}</Button>
            </div>
        );

    };
    renderUserInfo = () => {
        return (
            <NoDataIntro
                showAddBtn={true}
                renderAddAndImportBtns={this.renderAddAndImportBtns}
                noDataAndAddBtnTip={Intl.get('user.score.no.data.info', '暂无用户信息')}
            />
        );
    };

    render() {
        var {userEngagementObj, userLevelObj, getUserIntegrationConfigLoading, getUserIntegrationConfigErrMsg, showUserIntro} = this.state;
        var errMsg = <span>{getUserIntegrationConfigErrMsg}
            <a onClick={this.getUserIntegrationConfig}>
                {Intl.get('user.info.retry', '请重试')}
            </a></span>;
        return (
            <div className="user-score-container" data-tracename="用户评分">
                <div className="user-score-wrap">
                    <div className="user-score-content">
                        <p className="level-rule-tip">{Intl.get('user.score.level.rule', '用户评分规则')}
                        </p>
                        {getUserIntegrationConfigLoading ? <Spinner/> :
                            <div>{getUserIntegrationConfigErrMsg ?
                                <Alert
                                    message={errMsg}
                                    type="error"
                                    showIcon
                                />
                                : <div className="user-basic-particate-wrap">
                                    {showUserIntro ? this.renderUserInfo() : <div>
                                        <div className="user-basic-content">
                                            {this.renderBasicScoreRules()}
                                        </div>
                                        <div className="user-particate-content">
                                            {this.renderParticateScoreRules()}
                                        </div>
                                    </div>
                                    }
                                </div>
                            }</div>}

                    </div>
                </div>
            </div>
        );
    }
}

module.exports = userScore;

