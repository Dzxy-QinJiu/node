/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/30.
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
require('./css/index.less');
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {InputNumber, Row, Col, Input, Switch} from 'antd';
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
class customerScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            marks: {0: 0},
            ...customerScoreStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(customerScoreStore.getState());
    };

    componentDidMount() {
        customerScoreStore.listen(this.onStoreChange);
        this.getCustomerScoreLevel();
    }

    componentWillUnmount() {
        customerScoreStore.unlisten(this.onStoreChange);
    }

    getCustomerScoreLevel = () => {
        customerScoreAction.getCustomerScoreRules();
    };

    componentWillMount() {
        // this.handleMarks();
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
        var value = this.state.rangeHandleValue;
        var max = _.last(value) + (_.last(value) - value[1]);
        customerScoreAction.setRangeMaxValue(Math.ceil(max / 5) * 5 < 100 ? 100 : Math.ceil(max / 5) * 5 );
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
            <span className="customer-score-lable"> {Intl.get('clue.customer.customer.level', '客户分数')}</span>
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

    render() {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        return (
            <div className="customer-score-container" data-tracename="客户评分" style={{height: height}}>
                <div className="customer-score-wrap">
                    <GeminiScrollBar style={{height: height}}>
                        <div className="customer-score-content">
                            {_.get(this, 'state.rangeHandleValue.length') ? this.renderCustomerScoreList() : null}
                            <p>{Intl.get('clue.customer.level.score', '客户评分规则')}</p>
                            <div>
                                {Intl.get('clue.customer.if.switch', '是否启用')}
                                <Switch/>
                            </div>
                        </div>
                    </GeminiScrollBar>

                </div>
            </div>
        );
    }
}

module.exports = customerScore;

