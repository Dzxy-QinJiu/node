const PropTypes = require('prop-types');
var React = require('react');
/**
 * 筛选器面板
 * author：xuning
 * params： {
 *  filterList
 * }
 */

import {Select, InputNumber, Input, Alert} from 'antd';
const Option = Select.Option;
import DateSelector from 'CMP_DIR/date-selector';
import teamAjaxTrans from '../../../../common/public/ajax/team';
const salesmanAjax = require('../../../../common/public/ajax/salesman');

class Filter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paramsList: props.filterList,
            userList: [],
            teamList: [],
            errMsg: {
                teamList: '',
                userList: ''
            }
        };
    }

    componentDidMount() {
        this.getTeamList();
        this.getUserList();
    }

    componentWillReceiveProps({filterList}) {
        this.setState({
            paramsList: filterList
        });
    }

    getTeamList() {
        teamAjaxTrans.getTeamListAjax().sendRequest().success(list => {
            list = _.isArray(list) ? list : [];
            if (list.length > 0) {
                list = list.map(x => ({
                    value: x.groupId,
                    name: x.groupName
                }));
            }
            this.setState({teamList: list});
        });
    }

    getUserList() {
        salesmanAjax.getSalesmanListAjax().addQueryParam({with_ketao_member: true}).sendRequest()
            .success(result => {
                if (_.isArray(result)) {
                    let list = [];
                    result.forEach(item => {
                        if (_.isObject(item)) {
                            list.push({
                                value: item.user_info.user_id,
                                name: item.user_info.nick_name,
                                group_id: item.user_groups[0].group_id,
                                group_name: item.user_groups[0].group_name
                            });
                        }
                    });
                    this.setState({
                        userList: list
                    });
                }
            })
            .error(() => {
                this.setState({
                    isGetUserSuccess: false,
                });
            })
            .timeout(() => {
                this.setState({
                    isGetUserSuccess: false,
                });
            });
    }

    //将筛选参数处理成filterList的结构,并传入外部回调
    processParams(paramObj, params) {
        paramObj.params = params;
        this.setState({
            paramsList: this.state.paramsList
        }, () => {
            this.props.onChange(this.state.paramsList);
        });
    }

    onSelectDate(param, start_time, end_time) {
        if (!start_time) {
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        this.processParams(param, {from: start_time, to: end_time});
    }

    handleInputNumberChange(paramObj, type, value) {
        //start和end都存在时再存储到state中
        if (value) {
            this.processParams(paramObj, $.extend(paramObj.params || {}, {[type]: value}));
        }
    }

    handleInputChange(paramObj, {target: {value}}) {
        if (value) {
            this.processParams(paramObj, {item: value});
        }
    }

    handleSelectChange(paramObj, value) {
        this.processParams(paramObj, {item: value});
    }

    renderDatePicker(filter) {
        //保存该筛选项参数的对象
        let param = this.state.paramsList.find(param => param.value === filter.value);
        const _this = this;
        return (
            <div className="filter-container">
                <p className="filter-title">{filter.text}</p>
                <div className="filter-content">
                    <DateSelector
                        range="all"
                        onSelect={function() {
                            _this.onSelectDate(param, ...arguments);
                        }}>
                        <DateSelector.Option value="all">{Intl.get('user.time.all', '全部时间')}</DateSelector.Option>
                        <DateSelector.Option value="-1w">{Intl.get('common.time.unit.week', '周')}</DateSelector.Option>
                        <DateSelector.Option value="-1m">{Intl.get('common.time.unit.month', '月')}</DateSelector.Option>
                        <DateSelector.Option value="-12m">{Intl.get('common.time.unit.year', '年')}</DateSelector.Option>
                        <DateSelector.Option
                            value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DateSelector.Option>
                        <DateSelector.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DateSelector.Option>
                    </DateSelector>
                </div>
            </div>
        );
    }

    renderWordSelector(filter) {
        if (filter.options && !Array.isArray(filter.options) && this.state.errMsg[filter.options]) {
            return (
                <div className="alert-timer">
                    <Alert message={this.state.errMsg[filter.options]} type="error" showIcon/>
                </div>
            );
        }
        const renderContent = () => {
            if (filter.options && Array.isArray(filter.options)) {
                const tip = Intl.get('contract.choose', '请选择') + filter.text;
                return (
                    <Select
                        placeholder={tip}
                        allowClear={true}
                        style={{width: 143}}
                        onChange={this.handleSelectChange.bind(this, filter)}>
                        {filter.options.map((x, index) => (
                            <Option key={index} value={x.value}>{x.name}</Option>
                        ))}
                    </Select>
                );
            } else if (filter.options && !Array.isArray(filter.options)) {
                const tip = Intl.get('contract.choose', '请选择') + filter.text;
                return (
                    <Select
                        placeholder={tip}
                        allowClear={true}
                        style={{width: 143}}
                        onChange={this.handleSelectChange.bind(this, filter)}>
                        {this.state[filter.options].map((x, index) => (
                            <Option key={index} value={x.value}>{x.name}</Option>
                        ))}
                    </Select>
                );
            } else if (!filter.options) {
                const tip = Intl.get('contract.input', '请输入') + filter.text;
                return (
                    <Input
                        placeholder={tip}
                        onChange={_.debounce(this.handleInputChange, 500).bind(this, filter)}
                    />
                );
            }
        };
        return (
            <div className="filter-container">
                {filter.fieldType !== 'string' ?
                    <p className="filter-title">{filter.text}</p> : null}
                <div className="filter-content">
                    {renderContent()}
                </div>
            </div>
        );
    }

    renderNumSelector(filter) {
        //保存该筛选项参数的对象
        let paramObj = this.state.paramsList.find(param => param.value === filter.value);
        return (<div className="filter-container word-selector">
            <p className="filter-title">{filter.text}</p>
            <div className="filter-content">
                <InputNumber
                    onChange={this.handleInputNumberChange.bind(this, paramObj, 'from')}
                />{Intl.get('contract.rangeTo', '至')}
                <InputNumber
                    onChange={this.handleInputNumberChange.bind(this, paramObj, 'to')}
                />
            </div>
        </div>);
    }

    renderFilter(filterList) {
        if (filterList && filterList.length) {
            return filterList.map(filter => {
                //保存该筛选项参数的对象
                let paramObj = this.state.paramsList.find(param => param.value === filter.value);
                let filterDOM = null;
                switch (paramObj.fieldType) {
                    case 'string':
                        filterDOM = this.renderWordSelector(paramObj);
                        break;
                    case 'num':
                        filterDOM = this.renderNumSelector(paramObj);
                        break;
                    case 'date':
                        filterDOM = this.renderDatePicker(paramObj);
                        break;
                    default:
                        break;
                }
                return filterDOM;
            });
        }
    }

    render = () => {
        return (
            <div className="filter-selector-container clearfix">
                {
                    this.props.filterList ?
                        this.renderFilter(this.props.filterList) : null
                }
            </div>
        );
    }
}
Filter.propTypes = {
    onChange: PropTypes.func,
    filterList: PropTypes.array
};
export default Filter;