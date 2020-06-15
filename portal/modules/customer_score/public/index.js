/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/30.
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
require('./css/index.less');
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {InputNumber, Row, Col, Input, Switch, Alert, Button, Icon, message, Popconfirm} from 'antd';
const InputGroup = Input.Group;
import Slider from 'rc-slider';
// const Range = Slider.Range;
const style = {width: 400, margin: 50};
import 'rc-slider/assets/index.css';
import Tooltip from 'rc-tooltip';
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;
import customerScoreStore from './store/index';
import customerScoreAction from './action/index';
import {TimeRangeSelect, numberSelect} from './utils/customer_score_util';
import Spinner from 'CMP_DIR/spinner';
var uuid = require('uuid/v4');
import AlertTimer from 'CMP_DIR/alert-timer';
var className = require('classnames');
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
const spanLength = '8';
import { StatusWrapper, AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import MemberStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';
import Trace from 'LIB_DIR/trace';
class customerScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerRulesFormData: {},
            isEditCustomerLevel: false,
            isEditCustomerRule: false,
            ...customerScoreStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(customerScoreStore.getState());
    };

    componentDidMount() {
        customerScoreStore.listen(this.onStoreChange);
        this.getCustomerScoreRules();
        this.getCustomerScoreLevel();
        this.getCustomerScoreIndicator();
    }

    componentWillUnmount() {
        customerScoreStore.unlisten(this.onStoreChange);
    }

    getCustomerScoreRules = () => {
        customerScoreAction.getCustomerScoreRules();
    };
    getCustomerScoreLevel = () => {
        customerScoreAction.getCustomerScoreLevel((result) => {
            this.setState({
                customerRulesFormData: _.cloneDeep(result)
            });
        });
    };
    getCustomerScoreIndicator = () => {
        customerScoreAction.getCustomerScoreIndicator();
    };

    componentWillMount() {
    }

    handleDisabledChange = disabled => {
        this.setState({disabled});
    };
    handleRangeChange = (value) => {
        if (_.first(value) > 0) {
            value[0] = 0;
        }
        customerScoreAction.setRangeValue(value);

    };
    afterHandleChange = () => {
        //滑动完成后再修改最大值
        var value = this.state.rangeHandleValue;
        var max = _.last(value) + (_.last(value) - value[1]);
        customerScoreAction.setRangeMaxValue(Math.ceil(max / 5) * 5);
    };
    handleCustomerScoreUnqualified = (value) => {
        customerScoreAction.changeLowerHandlePoint(value);
    };
    handleCustomerScoreQualified = (value) => {
        customerScoreAction.changeLargerHandlePoint(value);
    };
    handleCustomerRangeValues = () => {
        customerScoreAction.setRangeValue();
    };
    handleClickCustomerLevel = () => {
        this.setState({
            isEditCustomerLevel: true
        });
    };
    handleCancelCustomerLevel = () => {
        this.setState({
            isEditCustomerLevel: false
        });
    };
    //保存客户等级
    handleSaveCustomerLevel = () => {
        var customerLevelRules = _.cloneDeep(this.state.customerLevelRules);
        _.forEach(customerLevelRules, item => {
            if (item.level_name === 'cold') {
                item.to = this.state.lowerHandlePoint;
            } else if (item.level_name === 'warm') {
                item.from = this.state.lowerHandlePoint;
                item.to = this.state.largerHandlePoint;
            } else {
                item.from = this.state.largerHandlePoint;
                delete item.to;
            }
        });

        var submitObj = {
            level_rule: customerLevelRules,
        };
        customerScoreAction.saveCustomerLevels(submitObj, () => {
            message.success(Intl.get('common.save.success', '保存成功'));
            this.setState({
                isEditCustomerLevel: false
            });
            //如果保存成功，会有回调
            customerScoreAction.updateCustomerScoreRange(customerLevelRules);
        });
    };
    renderRangeLoadingAndContent = () => {
        if (this.state.customerLevelLoading) {
            return (<Spinner/>);
        } else if (this.state.customerLevelErrMsg) {
            var errMsg = <span>{this.state.customerLevelErrMsg}
                <a onClick={this.getCustomerScoreRules}>
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
            const {rangeHandleValue, minValue, maxValue, lowerHandlePoint, largerHandlePoint, isEditCustomerLevel} = this.state;
            var rangeCls = className('slider-container', {
                'not-edit-customer-level': !isEditCustomerLevel
            });
            var labelCls = className('customer_level', {
                'edit_customer-level': isEditCustomerLevel
            });
            return (
                <div>
                    <div className={rangeCls}>
                        <Range
                            min={minValue}
                            max={maxValue}
                            onChange={this.handleRangeChange}
                            pushable
                            onAfterChange={this.afterHandleChange}
                            value={rangeHandleValue}
                            marks={this.state.marks}
                            trackStyle={[{backgroundColor: '#EFA246'}, {backgroundColor: '#00C2C4'}]}
                            handleStyle={[{backgroundColor: '#fff'}, {backgroundColor: '#fff'}]}
                            railStyle={{backgroundColor: '#4662EF'}}

                        />
                    </div>
                    <div className="customer-level-score">
                        <span className={labelCls}>
                            <i className="customer-level-quarter unqualified-icon"></i>
                            {Intl.get('common.unqualified', '不合格')}：
                            {isEditCustomerLevel ? <InputGroup className="input-groups" compact>
                                <Input className='mini-number' disabled value='0'/>
                                <Input
                                    className='min-between-max'
                                    placeholder="——"
                                    disabled
                                />
                                <InputNumber min="1" className='max-number' value={lowerHandlePoint}
                                    onChange={(e) => {
                                        this.handleCustomerScoreUnqualified(+e.target.value);
                                    }} onBlur={this.handleCustomerRangeValues}/>
                            </InputGroup> : `0~${lowerHandlePoint}`}
                        </span>
                        <span className={labelCls}>
                            <i className="customer-level-quarter qualified-icon"></i>
                            {Intl.get('common.qualified', '合格')}：
                            {isEditCustomerLevel ? <InputGroup className="input-groups" compact>
                                <InputNumber min="0" className='mini-number' value={lowerHandlePoint}
                                    onBlur={this.handleCustomerRangeValues} onChange={(e) => {
                                        this.handleCustomerScoreUnqualified(e.target.value);
                                    }}/>
                                <Input
                                    className='min-between-max'
                                    placeholder="——"
                                    disabled
                                />
                                <InputNumber min="0" className='max-number' value={largerHandlePoint}
                                    onChange={(e) => {
                                        this.handleCustomerScoreQualified(+e.target.value);
                                    }} onBlur={this.handleCustomerRangeValues}/>
                            </InputGroup> : `${lowerHandlePoint}~${largerHandlePoint}`}

                        </span>
                        <span className={labelCls}>
                            <i className="customer-level-quarter perfect-icon"></i>
                            {Intl.get('clue.customer.score.good', '优质')}：
                            {isEditCustomerLevel ? <InputGroup className="input-groups good-level" compact>
                                <span className="above-certain-level">
                                    <ReactIntl.FormattedMessage
                                        id="clue.customer.above.limit"
                                        defaultMessage={'{score}以上'}
                                        values={{
                                            score: <Input type="number" min="0" className='mini-number'
                                                value={largerHandlePoint}
                                                onBlur={this.handleCustomerRangeValues}
                                                onChange={(e) => {
                                                    this.handleCustomerScoreQualified(e.target.value);
                                                }}/>
                                        }}
                                    />
                                </span>

                            </InputGroup> : Intl.get('clue.customer.above.limit', '{score}以上', {score: largerHandlePoint})}
                        </span>
                        {isEditCustomerLevel ? <span className="customer-level-save-btns-container">
                            {this.state.saveLevelsErr ?
                                (
                                    <AlertTimer
                                        time={3000}
                                        message={this.state.saveLevelsErr}
                                        type='error' showIcon
                                        onHide={this.hideSaveCustomerLevelTooltip}/>
                                ) : ''
                            }
                            <Button type='primary'
                                onClick={this.handleSaveCustomerLevel}>{Intl.get('common.save', '保存')}
                                {this.state.isSavingLevels ? <Icon type="loading"/> : null}
                            </Button>
                            <Button onClick={this.handleCancelCustomerLevel}>{Intl.get('common.cancel', '取消')}</Button>
                        </span> : null}
                    </div>
                </div>
            );
        }
    };
    hideSaveCustomerLevelTooltip = () => {
        customerScoreAction.hideSaveLevelErrMsg();
    };
    renderCustomerLevel = () => {
        const {isEditCustomerLevel} = this.state;
        return (<div className="customer-score-content-wrap">
            <div className="customer-score-lable">{Intl.get('clue.customer.customer.level', '客户评级')}
                {isEditCustomerLevel ? null :
                    <i className="iconfont icon-update" onClick={this.handleClickCustomerLevel}></i>}
            </div>
            {this.renderRangeLoadingAndContent()}
        </div>);
    };
    handleCustomerProperty = (id, property, value) => {
        var customerRulesFormData = this.state.customerRulesFormData;
        var customerScoreLists = _.get(customerRulesFormData, 'detail');
        var target = _.find(customerScoreLists, item => item.id === id || item.randomId === id);
        if (target) {
            target[property] = value;
            if (property === 'indicator') {
                if (value === 'user') {
                    delete target.score;
                    target['user_option'] = 'max';
                } else {
                    delete target.user_option;
                    target['score'] = '1';
                }
            }
        }

        this.setState({
            customerRulesFormData
        });
    };
    handleMinusBtn = (id) => {
        var customerRulesFormData = this.state.customerRulesFormData;
        var customerScoreLists = _.get(customerRulesFormData, 'detail');
        customerScoreLists = _.filter(customerScoreLists, item => item.randomId !== id && item.id !== id);
        customerRulesFormData.detail = customerScoreLists;
        this.setState({
            customerRulesFormData
        });
    };
    handleAddBtn = () => {
        var customerRulesFormData = this.state.customerRulesFormData;
        var customerScoreLists = _.get(customerRulesFormData, 'detail');
        //过滤掉已经添加的，在剩下的选项中添加一个
        var customerSelectLists = [];
        if (_.isArray(customerScoreLists)) {
            var customerSelectLists = _.cloneDeep(this.state.customerIndicatorArr);
            _.forEach(customerScoreLists, customerScoreItem => {
                customerSelectLists = _.filter(customerSelectLists, item => item.indicator !== customerScoreItem.indicator);
            });
        }

        if (_.get(customerSelectLists, 'length')) {
            if (_.get(customerSelectLists, '[0].indicator') === 'user') {
                customerScoreLists.push({
                    indicator: _.get(customerSelectLists, '[0].indicator'),
                    interval: 'last_month',
                    user_option: 'max',
                    randomId: uuid()
                });
            } else {
                customerScoreLists.push({
                    indicator: _.get(customerSelectLists, '[0].indicator'),
                    interval: 'last_month',
                    score: '1',
                    randomId: uuid()
                });
            }
        }
        this.setState({
            customerRulesFormData
        });


    };
    renderCustomerScoreData = () => {
        const {isEditCustomerRule, customerIndicatorArr} = this.state;
        var customerScoreLists = _.get(this, 'state.customerRulesFormData.detail');
        return (
            <div className="customer-score-datalists">
                {_.map(customerScoreLists, (item, index) => {
                    var subIndicator = [];
                    _.forEach(customerIndicatorArr, indicatorItem => {
                        if (indicatorItem.indicator !== item.indicator) {
                            var targetObj = _.find(customerScoreLists, list => list.indicator === indicatorItem.indicator);
                            if (!targetObj) {
                                subIndicator.push(indicatorItem);
                            }
                        } else {
                            subIndicator.push(indicatorItem);
                        }
                    });

                    var targetIndicator = _.find(customerIndicatorArr, indicator => indicator.indicator === item.indicator);
                    var targetTimeRange = _.find(TimeRangeSelect, timeRange => timeRange.value === item.interval);
                    var numberTarget = _.find(numberSelect, number => number.value === item.user_option);
                    return (
                        <Row>
                            <Col span={spanLength}>
                                {isEditCustomerRule ? <AntcSelect
                                    style={{width: 130}}
                                    value={item.indicator}
                                    onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'indicator')}>
                                    {_.map(subIndicator, (item) => {
                                        return <Option value={item.indicator}>{item.indicator_desc}</Option>;
                                    })}
                                </AntcSelect> : _.get(targetIndicator, 'indicator_desc')}

                            </Col>
                            <Col span={spanLength}>
                                {isEditCustomerRule ? <AntcSelect
                                    style={{width: 100}}
                                    value={item.interval}
                                    onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'interval')}>
                                    {_.map(TimeRangeSelect, item => {
                                        return <Option value={item.value}>{item.name}</Option>;
                                    })}
                                </AntcSelect> : _.get(targetTimeRange, 'name')}

                            </Col>
                            <Col span={spanLength} className='add-minus-container'>
                                {item.user_option ?
                                    <span>
                                        {isEditCustomerRule ? <AntcSelect value={item.user_option}
                                            style={{width: 100}}
                                            onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'user_option')}>
                                            {_.map(numberSelect, (item) => {
                                                return <Option value={item.value}>{item.name}</Option>;
                                            })}
                                        </AntcSelect> : _.get(numberTarget, 'name')}

                                    </span> :
                                    <span> {Intl.get('customer.score.total.count', '总次数')}
                                        <span className="icon-multiply">X</span>
                                        {isEditCustomerRule ? <InputNumber value={item.score}
                                            onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'score')}
                                            min={1}/> : item.score}
                                        {Intl.get('user.time.minute', '分')}</span>}
                                <span className="add-minus-btns">
                                    {index !== 2 && index === customerScoreLists.length - 1 && isEditCustomerRule ?
                                        <span onClick={this.handleAddBtn}> + </span> : null}
                                    {customerScoreLists.length > 1 && isEditCustomerRule ?
                                        <span
                                            onClick={this.handleMinusBtn.bind(this, item.id || item.randomId)}> - </span> : null}

                                </span>

                            </Col>
                        </Row>
                    );
                })}
            </div>
        );
    }
    //默认展示拜访客户次数和有效呼出电话次数
    renderCustomerRuleTable = () => {
        const {customerIndicatorArr} = this.state;
        var customerScoreLists = _.get(this, 'state.customerRulesFormData.detail');
        if (!customerScoreLists.length) {
            //如果沒有设置过流程，默认展示打通电话次数和拜访电话次数
            var defaultArr = _.filter(customerIndicatorArr, item => item.indicator !== 'user');
            _.forEach(defaultArr, defaultItem => {
                customerScoreLists.push({
                    indicator: _.get(defaultItem, 'indicator'),
                    interval: 'last_month',
                    score: '1',
                    randomId: uuid()
                });
            });
        }

        return (<div>
            <Row className='thead-title'>
                <Col span={spanLength}>{Intl.get('clue.customer.score.indicator', '指标')}</Col>
                <Col span={spanLength}>{Intl.get('user.apply.detail.table.time', '周期')}</Col>
                <Col span={spanLength}>{Intl.get('user.login.score', '分数')}</Col>
            </Row>
            {this.renderCustomerScoreData()}
        </div>);
    };
    handleCustomerScoreRuleStatus = (e) => {
        var customerRulesFormData = this.state.customerRulesFormData;
        let modalStr = Intl.get('member.start.this', '启用此');
        if (customerRulesFormData.status === 'enable') {
            modalStr = Intl.get('member.stop.this', '禁用此');
        }
        Trace.traceEvent(e, '点击确认' + modalStr + '该规则');

        let status = 'enable';
        if (customerRulesFormData.status === 'enable') {
            status = 'disable';
        }
        customerRulesFormData.status = status;

        this.setState({
            customerRulesFormData
        },() => {
            this.handleSaveRules();
        });
    };

    renderCustomerScore() {
        if (_.get(this, 'state.customerLevelObj.loading')) {
            return (<Spinner/>);
        } else if (_.get(this, 'state.customerLevelObj.errMsg')) {
            var errMsg = <span>{_.get(this, 'state.customerLevelObj.errMsg')}
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
        } else if (_.get(this, 'state.customerIndicatorArr.length')) {
            const {isEditCustomerRule} = this.state;
            return (
                <div className="customer-rule-score-level">
                    <div className="customer-rule-table">
                        {this.renderCustomerRuleTable()}
                    </div>
                    {isEditCustomerRule ? <div className="save-btns">
                        <SaveCancelButton loading={this.state.isSavingRules}
                            saveErrorMsg={this.state.saveRulesErr}
                            handleSubmit={this.handleSaveRules}
                            handleCancel={this.handleCancelRules}
                        />
                    </div> : null}
                </div>
            );
        }
    }

    hideSaveTooltip = () => {
        customerScoreAction.hideSaveErrMsg();
    };
    //取消信息的保存
    handleCancelRules = () => {
        customerScoreAction.setInitialRangeValue();
        //把state上的
        this.setState({
            isEditCustomerRule: false,
            customerRulesFormData: _.cloneDeep(this.state.customerLevelObj.obj)
        });
    };
    //保存客户评分规则
    handleSaveRules = () => {
        var customerRulesFormData = _.cloneDeep(this.state.customerRulesFormData);
        var customerDetail = _.get(customerRulesFormData, 'detail');
        _.forEach(customerDetail, item => {
            delete item.randomId;
        });
        customerScoreAction.saveCustomerRules(customerRulesFormData, () => {
            message.success(Intl.get('common.save.success', '保存成功'));
            //如果保存成功，会有回调
            this.setState({
                isEditCustomerRule: false
            });
            customerScoreAction.updateCustomerRule(this.state.customerRulesFormData);
        });

    };
    handleClickCustomerRule = () => {
        this.setState({
            isEditCustomerRule: true
        });
    };


    render() {
        const {isEditCustomerRule} = this.state;
        return (
            <div className="customer-score-container" data-tracename="客户评分">
                <div className="customer-score-wrap">
                    <div className="customer-score-content">
                        {this.renderCustomerLevel()}
                        <div className="customer-rules-container">
                            <p className="customer-rule-tip">
                                {Intl.get('clue.customer.level.score', '客户评分规则')}
                                {_.get(this, 'state.customerLevelObj.loading') ? null : <StatusWrapper
                                    errorMsg={this.state.errorMsg}
                                    size='small'
                                >
                                    <MemberStatusSwitch
                                        title={Intl.get('customer.score.status.rules', '确定要{status}该规则？', {
                                            status: _.get(this, 'state.customerRulesFormData.status') !== 'enable' ? Intl.get('common.enabled', '启用') :
                                                Intl.get('common.stop', '停用')
                                        })}
                                        handleConfirm={this.handleCustomerScoreRuleStatus}
                                        status={_.get(this, 'state.customerRulesFormData.status') === 'enable'}
                                    />
                                </StatusWrapper>}
                                {isEditCustomerRule ? null :
                                    <i className="iconfont icon-update" onClick={this.handleClickCustomerRule}></i>}
                            </p>
                            {this.renderCustomerScore()}
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

module.exports = customerScore;

