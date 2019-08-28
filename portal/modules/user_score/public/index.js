/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/5.
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
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
class userScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userScoreFormData: {},//用户评分规则
            userEngagementFormData: {},//用户参与度规则
            showUserEngagementPanel: false,//是否展示添加用户参与度面板
            ...userScoreStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(userScoreStore.getState());
    };

    componentDidMount() {
        userScoreStore.listen(this.onStoreChange);
        this.getUserIndicator();
        this.getUserEngagementRule();
        this.getUserScoreLists();
        this.getAppLists();//获取应用列表

    }

    componentWillUnmount() {
        userScoreStore.unlisten(this.onStoreChange);
    }
    getAppLists(){
        userScoreAction.getAppList();
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
        });
    };
    renderUserScoreLists = () => {
        var spanLength = '6';
        const {userIndicator, userIndicatorRange, userIndicatorType, userScoreFormData} = this.state;
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

        if (_.get(this, 'state.userLevelObj.loading')) {
            return (<Spinner/>);
        } else if (_.get(this, 'state.userLevelObj.errMsg')) {
            var errMsg = <span>{_.get(this, 'state.userLevelObj.errMsg')}
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
                    return (
                        <Row>
                            <Col span={spanLength}>
                                <Select
                                    style={{width: 100 }}
                                    value={item['indicator']}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'indicator')}
                                >
                                    {userIndicatorList.map((item, index) => (
                                        <Option key={index} value={item.indicator}>{item.desc}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={spanLength}>
                                <Select
                                    style={{width: 100 }}
                                    value={item['interval']}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'interval')}
                                >
                                    {_.isArray(userIndicatorRangeList[item['indicator']]) ? userIndicatorRangeList[item['indicator']].map((item, index) => (
                                        <Option key={index} value={item.value}>{item.name}</Option>
                                    )) : null}

                                </Select>
                            </Col>
                            <Col span={spanLength}>
                                <Select
                                    style={{width: 100 }}
                                    value={item['online_unit']}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'online_unit')}
                                >
                                    {_.isArray(userIndicatorTypeList[item['indicator']]) ? userIndicatorTypeList[item['indicator']].map((item, index) => (
                                        <Option key={index} value={item.value}>{item.name}</Option>
                                    )) : null}

                                </Select>
                                <span className="start-icon">*</span>
                                <InputNumber value={item.score}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'score')}
                                    min={1}/> {Intl.get('user.time.minute', '分')}
                                <span className="add-minus-btns">
                                    {index + 1 !== _.get(userIndicator, 'length') && index === userScoreDetailList.length - 1 ?
                                        <span onClick={this.handleAddBtn}> + </span> : null}
                                    {userScoreDetailList.length > 1 ?
                                        <span
                                            onClick={this.handleMinusBtn.bind(this, item.id || item.randomId)}> - </span> : null}

                                </span>
                            </Col>
                        </Row>
                    );
                })}
                <div className="save-btns">
                    <div className="indicator">
                        {this.state.saveRulesErr ?
                            (
                                <AlertTimer
                                    time={3000}
                                    message={this.state.saveRulesErr}
                                    type='error' showIcon
                                    onHide={this.hideSaveTooltip}/>
                            ) : ''
                        }
                    </div>
                    <Button disabled={this.state.isSavingRules} type='primary'
                        onClick={this.handleSaveRules}>{Intl.get('common.save', '保存')}
                        {this.state.isSavingRules ? <Icon type="loading"/> : null}
                    </Button>
                    <Button onClick={this.handleCancelRules}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>;
        }
    };

    renderBasicScoreRules() {
        var spanLength = '6';
        return (
            <div className="basic-score-rule" data-tracename="基础评分">
                <p>
                    {Intl.get('clue.customer.if.switch', '是否启用')}
                    <Switch size="small" onChange={this.handleUserScoreRuleStatus}
                        checked={_.get(this, 'state.userScoreFormData.status') === 'enable'}/>
                </p>
                <Row>
                    <Col span={spanLength}>{Intl.get('clue.customer.score.indicator', '指标')}</Col>
                    <Col span={spanLength}>{Intl.get('user.apply.detail.table.time', '周期')}</Col>
                    <Col span={spanLength}>{Intl.get('user.login.score', '分数')}</Col>
                </Row>
                <Row>
                    <Col span={spanLength}>{Intl.get('user.score.nearly.active.days', '近期活跃天数分数')}</Col>
                    <Col span={spanLength}>{Intl.get('clue.customer.last.month', '近一月')}</Col>
                </Row>
                <Row>
                    <Col span={spanLength}>{Intl.get('user.score.online.score', '近期在线时长分数')}</Col>
                    <Col span={spanLength}>{Intl.get('clue.customer.last.month', '近一月')}</Col>
                </Row>
                <div className="user-score-lists">
                    {this.renderUserScoreLists()}
                </div>
            </div>
        );

    }

    //用户参与度规则
    renderParticateScoreRules() {
        var {userEngagementObj} = this.state;
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
            return (
                <div className="user-engagement-container">
                    <div>
                        {_.get(this, 'state.userEngagementFormData.user_engagements.length') || this.state.showUserEngagementPanel ? this.renderUserEngagementForm() :
                            <Button data-tracename="添加参与度"
                                onClick={this.handleShowUserEngagementPanel}>{Intl.get('common.add', '添加')}</Button>}
                    </div>
                </div>
            );
        }
    }
    getAppOptions = (engageTargetItem) => {
        const {userEngagementFormData} = this.state;
        var appList = _.cloneDeep(_.get(this, 'state.appList',[]));
        //过滤掉之前选过的应用
        _.forEach(_.get(userEngagementFormData,'user_engagements',[]),(engageItem) => {
            if(_.get(engageItem,'app_id') && engageItem.randomId !== engageTargetItem.randomId){
                appList = _.filter(appList,appItem => appItem.app_id !== engageItem.app_id);
            }
        });
        var list = appList.map((item) => {
            return <Option key={item.app_id} value={item.app_id} title={item.app_name}>{item.app_name}</Option>;
        });
        if (!appList.length) {
            var clickMsg = Intl.get('app.user.manager.click.get.app', '点击获取应用');
            if (this.state.appListErrorMsg) {
                clickMsg = Intl.get('app.user.failed.get.apps', '获取失败') + '，' + clickMsg;
            } else {
                clickMsg = Intl.get('user.no.product','暂无产品') + '，' + clickMsg;
            }
            list.unshift(<Option value={RETRY_GET_APP} key={RETRY_GET_APP} className="retry-get-applist-container">
                <div className="retry-get-appList" onClick={this.getAppLists}>
                    {clickMsg}
                </div>
            </Option>);
        }
        return list;
    };
    renderUserEngagementForm = () => {
        const {userEngagementFormData} = this.state;
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
        var spanLength = '6';
        return (<div className="user-engagement-panel">
            <p>
                {Intl.get('clue.customer.if.switch', '是否启用')}
                <Switch size="small" onChange={this.handleUserEngagementRuleStatus}
                    checked={_.get(userEngagementFormData, 'status') === 'enable'}/>
            </p>
            {_.map(userEngagements, (engageItem, index) => {
                var engageId = engageItem.app_id || engageItem.randomId;
                var appOptions = this.getAppOptions(engageItem);
                return (
                    <div className="user-engagement-item-wrap">
                        <div className="user-engagement-and-add">
                            <div className="user-engagement-item">
                                <Row>{Intl.get('menu.product', '产品')}：
                                    <Select
                                        value={_.get(engageItem,'app_id')}
                                        style={{ width: 100 }}
                                        showSearch
                                        placeholder={Intl.get('leave.apply.select.product', '请选择产品')}
                                        onChange={this.handleUserEngaegementProperty.bind(this,engageId, '', 'app_id')}
                                        notFoundContent={!appOptions.length ? Intl.get('user.no.product','暂无产品') : Intl.get('user.no.related.product','无相关产品')}
                                    >
                                        {appOptions}
                                    </Select>
                                </Row>
                                {_.map(_.get(engageItem, 'detail', []), (operateItem, idx) => {

                                    var detailId = operateItem.id || operateItem.randomId;
                                    return <div>
                                        {idx === 0 ? <Row>
                                            <Col span={spanLength}>{Intl.get('common.operate', '操作')}</Col>
                                            <Col span={spanLength}>{Intl.get('user.apply.detail.table.time', '周期')}</Col>
                                            <Col span={spanLength}>{Intl.get('user.login.score', '分数')}</Col>
                                        </Row> : null}
                                        <Row>
                                            <Col span={spanLength}>
                                                <Input value={operateItem.operate} onChange={this.handleUserEngaegementProperty.bind(this,engageId, detailId, 'operate')}/>
                                            </Col>
                                            <Col span={spanLength}>
                                                <Select
                                                    value={operateItem.interval}
                                                    style={{width: 100 }}
                                                    placeholder={Intl.get('user.score.choose.interval', '请选择周期')}
                                                    onChange={this.handleUserEngaegementProperty.bind(this,engageId, detailId, 'interval')}
                                                >
                                                    {_.map(TimeRangeSelect, item => {
                                                        return <Option value={item.value}>{item.name}</Option>;
                                                    })}
                                                </Select>
                                            </Col>
                                            <Col span={spanLength}>
                                                {Intl.get('customer.score.total.count', '总次数')} * <InputNumber value={operateItem.score}
                                                    onChange={this.handleUserEngaegementProperty.bind(this, engageId,detailId, 'score')}
                                                    min={1}/> {Intl.get('user.time.minute', '分')}
                                            </Col>
                                            <div className="add-operate-item">

                                                {idx + 1 === _.get(engageItem, 'detail.length') ? <span onClick={this.handeAddEngageDetail.bind(this, engageId)}>+</span> : null}
                                                {_.get(engageItem, 'detail.length') > 1 ? <span onClick={this.handleMinusEngageDetail.bind(this, engageId, detailId)}>-</span> : null}
                                            </div>
                                        </Row>
                                    </div>;
                                })}
                            </div>
                            <div className="add-user-engagement-item">
                                {index + 1 === _.get(userEngagements,'length') ? <span onClick={this.handleAddEngagementItem}>+</span> : null}
                                {_.get(userEngagements,'length') > 1 ? <span onClick={this.handleMinusEngagementItem.bind(this, engageId)}>-</span> : null}
                            </div>
                        </div>
                        {index + 1 === _.get(userEngagements,'length') ? <div className="save-btns">
                            <div className="indicator">
                                {this.state.saveEngagementErr ?
                                    (
                                        <AlertTimer
                                            time={3000}
                                            message={this.state.saveEngagementErr}
                                            type='error' showIcon
                                            onHide={this.hideSaveTooltip}/>
                                    ) : ''
                                }
                            </div>
                            <Button disabled={this.state.isSavingEngagement} type='primary'
                                onClick={this.handleSaveEngagements}>{Intl.get('common.save', '保存')}
                                {this.state.isSavingEngagement ? <Icon type="loading"/> : null}
                            </Button>
                            <Button onClick={this.handleCancelEngagement}>{Intl.get('common.cancel', '取消')}</Button>
                        </div> : null}

                    </div>
                );
            })}
        </div>);
    };
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
        if (target && _.isArray(target.detail)){
            target.detail = _.filter(target.detail, item => item.id !== detailId && item.randomId !== detailId);
        }
        this.setState({
            userEngagementFormData
        });
    };
    handleUserEngaegementProperty = (engageId, detailId, property,value) => {
        const {userEngagementFormData} = this.state;
        var userEngagements = _.get(userEngagementFormData, 'user_engagements', []);
        var target = _.find(userEngagements, item => item.randomId === engageId || item.app_id === engageId);
        if (target){
            if (_.isArray(target.detail) && detailId){
                var subTarget = _.find(target.detail, item => item.id === detailId || item.randomId === detailId);
                if (subTarget){
                    subTarget[property] = _.isString(value) ? value : value.target.value;
                }
            }else{
                target[property] = value;
                if (property === 'app_id'){
                    var appTarget = _.find(this.state.appList,appItem => appItem.app_id === value);
                    if (appTarget){
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
        if (target && _.isArray(target.detail)){
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
            if (!engageItem.app_id || !engageItem.app_name){
                hasError = true;
            }
            if (_.isArray(engageItem.detail)) {
                _.forEach(engageItem.detail,(operatorItem) => {
                    delete operatorItem.randomId;
                });
            }
        });
        if (hasError){
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
    handleChangeTab = () => {

    };

    render() {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        return (
            <div className="user-score-container" data-tracename="用户评分" style={{height: height}}>
                <div className="user-score-wrap">
                    <GeminiScrollBar style={{height: height}}>
                        <div className="user-score-content">
                            <p className="level-rule-tip">{Intl.get('user.score.level.rule', '用户评分规则')}</p>
                            <Tabs onChange={this.handleChangeTab} type="card">
                                <TabPane tab={Intl.get('user.score.basic.score', '基础评分')} key="1">
                                    {this.renderBasicScoreRules()}
                                </TabPane>
                                <TabPane tab={Intl.get('user.score.particate.in.score', '参与度评分')} key="2">
                                    <div className="particepate-container-warp" data-tracename="参与度评分">
                                        {this.renderParticateScoreRules()}
                                    </div>

                                </TabPane>
                            </Tabs>
                        </div>
                    </GeminiScrollBar>

                </div>
            </div>
        );
    }
}

module.exports = userScore;

