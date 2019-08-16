/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/30.
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
require('./css/index.less');
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {InputNumber, Row, Col, Input, Switch, Select, Alert, Button, Icon, message} from 'antd';
const Option = Select.Option;
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
class customerScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerRulesFormData: {},
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
        customerScoreAction.getCustomerScoreIndicator((result) => {
            this.setState({
                customerIndicator: _.cloneDeep(result)
            });
        });
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
    renderCustomerScoreList = () => {
        const {rangeHandleValue, minValue, maxValue, rangeValue, lowerHandlePoint, largerHandlePoint} = this.state;
        return (<div className="customer-score-content-wrap">
            <div className="customer-score-lable"> {Intl.get('clue.customer.customer.level', '客户评级')}</div>
            <div className="slider-container">
                <Range
                    min={minValue}
                    max={maxValue}
                    onChange={this.handleRangeChange}
                    pushable
                    onAfterChange={this.afterHandleChange}
                    value={rangeHandleValue}
                    marks={this.state.marks}
                    trackStyle={[{backgroundColor: 'blue'}, {backgroundColor: 'yellow'}]}
                    handleStyle={[{backgroundColor: '#fff'}, {backgroundColor: '#fff'}]}
                    railStyle={{backgroundColor: 'red'}}

                />
            </div>
            <div className="customer-level-score">
                <span className="customer_level">
                    {Intl.get('common.unqualified', '不合格')}
                    <InputGroup className="input-groups" compact>
                        <Input className='mini-number' disabled value='0'/>
                        <Input
                            className='min-between-max'
                            placeholder="——"
                            disabled
                        />
                        <Input type="number" min="1" className='max-number' value={lowerHandlePoint} onChange={(e) => {
                            this.handleCustomerScoreUnqualified(+e.target.value);
                        }} onBlur={this.handleCustomerRangeValues}/>
                    </InputGroup>
                </span>
                <span className="customer_level"> {Intl.get('common.qualified', '合格')}
                    <InputGroup className="input-groups" compact>
                        <Input type="number" min="0" className='mini-number' value={lowerHandlePoint + 1}
                            onBlur={this.handleCustomerRangeValues} onChange={(e) => {
                                this.handleCustomerScoreUnqualified(+e.target.value - 1);
                            }}/>
                        <Input
                            className='min-between-max'
                            placeholder="——"
                            disabled
                        />
                        <Input type="number" min="0" className='max-number' value={largerHandlePoint} onChange={(e) => {
                            this.handleCustomerScoreQualified(+e.target.value);
                        }} onBlur={this.handleCustomerRangeValues}/>
                    </InputGroup>
                </span>
                <span className="customer_level">{Intl.get('clue.customer.score.good', '优质')}
                    <InputGroup className="input-groups good-level" compact>
                        <ReactIntl.FormattedMessage
                            id="clue.customer.above.limit"
                            defaultMessage={'{score}以上'}
                            values={{
                                score: <Input type="number" min="0" className='mini-number'
                                    value={largerHandlePoint + 1} onBlur={this.handleCustomerRangeValues}
                                    onChange={(e) => {
                                        this.handleCustomerScoreQualified(+e.target.value - 1);
                                    }}/>
                            }}
                        />
                    </InputGroup>
                </span>
            </div>
        </div>);
    };
    handleCustomerProperty = (id, property, value) => {
        var customerRulesFormData = this.state.customerRulesFormData;
        var customerScoreLists = _.get(customerRulesFormData, 'detail');
        var target = _.find(customerScoreLists, item => item.id === id || item.randomId === id);
        if (target) {
            target[property] = value;
            //如果是
            if (property === 'source') {
                if(value === 'user'){
                    target['indicator'] = _.get(this, 'state.customerIndicator[1].indicator_details[0].indicator');
                    delete target.score;
                    target['user_option'] = 'max';
                }else{
                    //indicator 需要看一下另外一个item是否有值
                    var salesLists = _.filter(customerScoreLists, item => item.source === 'sales' && item.randomId !== id && item.id !== id);
                    if (_.get(salesLists,'length') === 1){
                        var otherTarget = _.get(salesLists,'[0]',{});
                        if (otherTarget.indicator === _.get(this, 'state.customerIndicator[0].indicator_details[1].indicator')){
                            target['indicator'] = _.get(this, 'state.customerIndicator[0].indicator_details[0].indicator');
                        }else{
                            target['indicator'] = _.get(this, 'state.customerIndicator[0].indicator_details[1].indicator');
                        }
                    }else{
                        target['indicator'] = _.get(this, 'state.customerIndicator[0].indicator_details[0].indicator');
                    }
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
        //
        if (customerScoreLists.length === 1) {
            //一共三种情况，这三种情况不可以重复展示
            _.each(customerScoreLists, item => {
                if (item.source === _.get(this, 'state.customerIndicator[0].source')) {
                    if (item.indicator === _.get(this, 'state.customerIndicator[0].indicator_details[0].indicator')) {
                        customerScoreLists.push({
                            source: _.get(this, 'state.customerIndicator[0].source'),
                            indicator: _.get(this, 'state.customerIndicator[0].indicator_details[1].indicator'),
                            interval: 'last_month',
                            score: '1',
                            randomId: uuid()
                        });

                    } else {
                        customerScoreLists.push({
                            source: _.get(this, 'state.customerIndicator[0].source'),
                            indicator: _.get(this, 'state.customerIndicator[0].indicator_details[0].indicator'),
                            interval: 'last_month',
                            score: '1',
                            randomId: uuid()
                        });
                    }

                } else {
                    customerScoreLists.push({
                        source: _.get(this, 'state.customerIndicator[0].source'),
                        indicator: _.get(this, 'state.customerIndicator[0].indicator_details[0].indicator'),
                        interval: 'last_month',
                        score: '1',
                        randomId: uuid()
                    });
                }
            });

        } else if (customerScoreLists.length === 2) {
            //如果都是销售行为，增加一个用户行为
            var salesLists = _.filter(customerScoreLists, item => item.source === 'sales');
            if (salesLists.length === 2) {
                customerScoreLists.push({
                    source: _.get(this, 'state.customerIndicator[1].source'),
                    indicator: _.get(this, 'state.customerIndicator[1].indicator_details[0].indicator'),
                    interval: 'last_month',
                    user_option: 'max',
                    randomId: uuid()
                });

            } else {
                var item = _.get(salesLists, '[0]');
                if (item.indicator === _.get(this, 'state.customerIndicator[0].indicator_details[0].indicator')) {
                    customerScoreLists.push({
                        source: _.get(this, 'state.customerIndicator[0].source'),
                        indicator: _.get(this, 'state.customerIndicator[0].indicator_details[1].indicator'),
                        interval: 'last_month',
                        score: '1',
                        randomId: uuid()
                    });

                } else {
                    customerScoreLists.push({
                        source: _.get(this, 'state.customerIndicator[0].source'),
                        indicator: _.get(this, 'state.customerIndicator[0].indicator_details[0].indicator'),
                        interval: 'last_month',
                        score: '1',
                        randomId: uuid()
                    });
                }
            }


        }
        
        this.setState({
            customerRulesFormData
        });


    };
    renderCustomerRuleTable = () => {
        var customerScoreLists = _.get(this, 'state.customerRulesFormData.detail');
        var spanLength = '6', subIndicator = [], sourceLists = [];
        var defaultSource = '', defaultIndicator = '', defaultInterval = '', defaultScore = 1;
        if (!customerScoreLists.length) {
            customerScoreLists.push({
                source: '',
                indicator: '',
                interval: '',
                score: '1',
                randomId: uuid()
            });
        }

        return (<div>
            <Row>
                <Col span={spanLength}>{Intl.get('clue.customer.score.indicator', '指标')}</Col>
                <Col span={spanLength}>{Intl.get('user.apply.detail.table.time', '周期')}</Col>
                <Col span={spanLength}>{Intl.get('user.login.score', '分数')}</Col>
            </Row>
            {/*获取之前保存的数据*/}
            {/*{customerScoreLists.length ? null : null}*/}
            {_.map(customerScoreLists, (item, index) => {
                var subIndicator = [], sourceLists = [];
                var target = _.find(this.state.customerIndicator, indicatorItem => indicatorItem.source === item.source);
                if (item.source === 'user') {
                    if (target) {
                        subIndicator = target.indicator_details;
                    }
                } else {
                    var salesLists = _.filter(customerScoreLists, item => item.source === 'sales');
                    if (salesLists.length === 1) {
                        subIndicator = _.get(this, 'state.customerIndicator[0].indicator_details');
                    } else {
                        subIndicator = _.filter(_.get(this, 'state.customerIndicator[0].indicator_details'), detailItem => detailItem.indicator === item.indicator);
                    }
                }

                if (customerScoreLists.length === 3) {
                    if (!sourceLists.length) {
                        sourceLists.push(target);
                    }
                } else {
                    var salesLists = _.filter(customerScoreLists, item => item.source === 'user');
                    //如果有用户行为了，下拉中就不能出现用户行为了
                    if (salesLists.length) {
                        if (item.source !== 'user' ) {
                            sourceLists = _.filter(_.get(this, 'state.customerIndicator'), item => item.source !== 'user');
                        }else{
                            sourceLists = _.get(this, 'state.customerIndicator');
                        }

                    } else {
                        sourceLists = _.get(this, 'state.customerIndicator');
                    }
                }
                return (
                    <Row>
                        <Col span={spanLength}>
                            <Select
                                style={{width: 130 }}
                                value={item.indicator}
                                onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'indicator')}>
                                {_.map(subIndicator, (item) => {
                                    return <Option value={item.indicator}>{item.indicator_desc}</Option>;
                                })}
                            </Select>
                        </Col>
                        <Col span={spanLength}>
                            <Select
                                style={{width: 100 }}
                                value={item.interval}
                                onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'interval')}>
                                {_.map(TimeRangeSelect, item => {
                                    return <Option value={item.value}>{item.name}</Option>;
                                })}
                            </Select>
                        </Col>
                        <Col span={spanLength}>
                            {item.user_option ?
                                <span>
                                    <Select value={item.user_option}
                                        style={{width: 100 }}
                                        onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'user_option')}>
                                        {_.map(numberSelect, (item) => {
                                            return <Option value={item.value}>{item.name}</Option>;
                                        })}
                                    </Select>
                                </span> :
                                <span> {Intl.get('customer.score.total.count', '总次数')} * <InputNumber value={item.score}
                                    onChange={this.handleCustomerProperty.bind(this, item.id || item.randomId, 'score')}
                                    min={1}/> {Intl.get('user.time.minute', '分')}</span>}
                            <span className="add-minus-btns">
                                {index !== 2 && index === customerScoreLists.length - 1 ?
                                    <span onClick={this.handleAddBtn}> + </span> : null}
                                {customerScoreLists.length > 1 ?
                                    <span onClick={this.handleMinusBtn.bind(this, item.id || item.randomId)}> - </span> : null}

                            </span>

                        </Col>
                    </Row>

                );
            })}

        </div>);
    };
    handleCustomerScoreRuleStatus = (checkFlag) => {
        var customerRulesFormData = this.state.customerRulesFormData;
        if (checkFlag){
            customerRulesFormData.status = 'enable';
        }else{
            customerRulesFormData.status = 'disable';
        }
        this.setState({
            customerRulesFormData
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
        } else if (_.get(this, 'state.customerIndicator.length')) {
            return (
                <div className="customer-rule-score-level">
                    <div className="customer-rule-status">
                        <span className="switch-tip">
                            {Intl.get('clue.customer.if.switch', '是否启用')}
                        </span>
                        <Switch size="small" onChange={this.handleCustomerScoreRuleStatus} checked={_.get(this, 'state.customerRulesFormData.status') === 'enable'}/>
                    </div>
                    <div className="customer-rule-table">
                        {this.renderCustomerRuleTable()}
                    </div>
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
                        <Button disabled={this.state.isSavingRules} type='primary' onClick={this.handleSaveRules}>{Intl.get('common.save', '保存')}
                            {this.state.isSavingRules ? <Icon type="loading"/> : null}

                        </Button>
                        <Button onClick={this.handleCancelRules}>{Intl.get('common.cancel', '取消')}</Button>
                    </div>

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
            customerRulesFormData: _.cloneDeep(this.state.customerLevelObj.obj)
        });
    };
    //保存
    handleSaveRules = () => {
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
        var customerRulesFormData = _.cloneDeep(this.state.customerRulesFormData);
        var customerDetail = _.get(customerRulesFormData,'detail');
        _.forEach(customerDetail, item => {
            delete item.randomId;
        });
        var submitObj = {
            level_rule: customerLevelRules,
            score_rule: customerRulesFormData,
        };
        customerScoreAction.saveCustomerRules(submitObj,() => {
            message.success(Intl.get('common.save.success', '保存成功'));
            //如果保存成功，会有回调
            customerScoreAction.updateCustomerScoreRange(customerLevelRules);
            customerScoreAction.updateCustomerRule(customerRulesFormData);
        });

    };


    render() {
        return (
            <div className="customer-score-container" data-tracename="客户评分">
                <div className="customer-score-wrap">
                    <div className="customer-score-content">
                        {_.get(this, 'state.rangeHandleValue.length') ? this.renderCustomerScoreList() : null}
                        <div className="customer-rules-container">
                            <p className="customer-rule-tip">{Intl.get('clue.customer.level.score', '客户评分规则')}</p>
                            {this.renderCustomerScore()}
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

module.exports = customerScore;

