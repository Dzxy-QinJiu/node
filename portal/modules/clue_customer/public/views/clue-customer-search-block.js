/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
import {Radio} from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import DatePicker from 'CMP_DIR/datepicker';
var userData = require('PUB_DIR/sources/user-data');
var clueCustomerAction = require('../action/clue-customer-action');
var clueCustomerStore = require('../store/clue-customer-store');
import Trace from 'LIB_DIR/trace';
import {SELECT_TYPE} from '../utils/clue-customer-utils';
class ClueCustomerSearchBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...clueCustomerStore.getState()
        };
        this.onStoreChange = this.onStoreChange.bind(this);
    }
    componentDidMount(){
        clueCustomerStore.listen(this.onStoreChange);
    }
    //是否是运营人员
    isOperation(){
        return userData.hasRole('operations');
    }
    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };
    componentWillUnmount(){
        clueCustomerStore.unlisten(this.onStoreChange);
    }
    onSelectDate = (start_time, end_time) => {
        if (!start_time) {
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        clueCustomerAction.setTimeRange({start_time: start_time, end_time: end_time});
        this.props.onTypeChange();
    };
    //筛选不同的状态
    onChange = (e) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.radio-group-wrap'), '点击切换筛选线索客户类型');
        clueCustomerAction.setFilterType(e.target.value);
        this.props.onTypeChange();
    };
    render() {
        let user = userData.getUserData();
        //是否是运营人员
        var isOperation = this.isOperation();
        var defaultValue = user.isCommonSales ? SELECT_TYPE.HAS_DISTRIBUTE : (isOperation ? '' : '0');
        return (
            <div className="block search-input-select-block" data-tracename="筛选线索客户">
                <div className="radio-group-wrap">
                    <RadioGroup size="large" onChange={this.onChange} defaultValue={defaultValue}>
                        {/*运营人员才展示全部这个按钮*/}
                        {isOperation ? <RadioButton value="">
                            {Intl.get('common.all', '全部')}
                        </RadioButton> : null}
                        {user.isCommonSales ? null : <RadioButton value="0" >
                            {Intl.get('clue.customer.will.distribution','待分配')}
                        </RadioButton>}
                        <RadioButton value="1">
                            {Intl.get('clue.customer.has.distribution','已分配')}
                        </RadioButton>
                        <RadioButton value="2">
                            {Intl.get('clue.customer.has.follow','已跟进')}
                        </RadioButton>
                    </RadioGroup>
                </div>
                <div className="date-picker-wrap">
                    <DatePicker
                        disableDateAfterToday={true}
                        range="week"
                        onSelect={this.onSelectDate}>
                        <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                        <DatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                        <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                        <DatePicker.Option
                            value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                        <DatePicker.Option
                            value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                        <DatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                        <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                    </DatePicker>
                </div>
            </div>
        );
    }
}
ClueCustomerSearchBlock.defaultProps = {
    onTypeChange: function() {

    }
};
ClueCustomerSearchBlock.propTypes = {
    onTypeChange: React.PropTypes.func,
};
export default ClueCustomerSearchBlock;