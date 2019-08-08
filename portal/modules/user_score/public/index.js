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
import {Tabs, Switch, Row, Col, Select, InputNumber, Button, Icon, message, Alert} from 'antd';
const {Option} = Select;
const {TabPane} = Tabs;
var uuid = require('uuid/v4');
import AlertTimer from 'CMP_DIR/alert-timer';
import Spinner from 'CMP_DIR/spinner';

class userScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userScoreFormData: {},//用户评分规则
            userEngagementFormData: {},//用户参与度规则
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

    }

    componentWillUnmount() {
        userScoreStore.unlisten(this.onStoreChange);
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
                'indicator': 'online_time',
                'interval': 'last_month',
                'online_unit': 'min',
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
        } else if (_.get(userIndicator, 'length')) {
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
                                    value={item['interval']}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'interval')}
                                >
                                    {userIndicatorRangeList[item['indicator']].map((item, index) => (
                                        <Option key={index} value={item.value}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={spanLength}>
                                <Select
                                    value={item['online_unit'] || 'day'}
                                    onChange={this.handleUserProperty.bind(this, item.id || item.randomId, 'online_unit')}
                                >
                                    {userIndicatorTypeList[item['indicator']].map((item, index) => (
                                        <Option key={index} value={item.value}>{item.name}</Option>
                                    ))}
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
            <div className="basic-score-rule">
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
        if (userEngagementObj.loading){
            return <Spinner/>;
        }else if (userEngagementObj.errMsg){
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
        }else{
            return (
                <div className="user-engagement-container">
                    <p>
                        {Intl.get('clue.customer.if.switch', '是否启用')}
                        <Switch size="small" onChange={this.handleUserEngagementRuleStatus}
                            checked={_.get(userEngagementObj, 'status') === 'enable'}/>
                    </p>
                </div>
            );
        }
    }

    //保存
    handleSaveRules = () => {
        var userScoreFormData = _.cloneDeep(this.state.userScoreFormData);
        var userDetail = _.get(userScoreFormData, 'detail');
        _.forEach(userDetail, item => {
            delete item.randomId;
            if(item.indicator === 'active_days'){
                delete item.online_unit;
            }
        });
        userScoreAction.saveUserScoreLists(userScoreFormData, () => {
            message.success(Intl.get('common.save.success', '保存成功'));
            //如果保存成功，会有回调
            userScoreAction.updateUserRule(userScoreFormData);
        });

    };

    //取消信息的保存
    handleCancelRules = () => {
        //把state上的
        this.setState({
            userScoreFormData: _.cloneDeep(this.state.userLevelObj.obj)
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
                                    {this.renderParticateScoreRules()}
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

