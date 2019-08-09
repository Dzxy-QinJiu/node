/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/16.
 */
import {Input, Select, Radio, Checkbox} from 'antd';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

class SelectOption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRadioValue: ''
        };
    }

    renderRadioGroup = () => {
        var selectArr = this.props.select_arr;
        return (
            <RadioGroup onChange={this.handleRadioChange}>
                {_.map(selectArr, (item) => {
                    return (<Radio value={item}>{item}</Radio>);
                })}
            </RadioGroup>
        );
    };
    handleRadioChange = (e) => {
        this.setState({
            selectedRadioValue: e.target.value
        });
    };
    renderCheckGroup = () => {
        var selectArr = this.props.select_arr;
        return <CheckboxGroup options={selectArr}/>;
    };
    renderOptionGroup = () => {
        var selectArr = this.props.select_arr;
        return (
            <Select
                showSearch
                placeholder={this.props.placeholder}
                filterOption={(input, option) => ignoreCase(input, option)}
            >
                {_.map(selectArr,(item) => {
                    return <Option value={item.value}>{item.name}</Option>;
                })}
            </Select>
        );
    };
    onSaveAllData = () => {
        if (this.props.type === 'radio'){
            var submitObj = {}, label = this.props.labelKey;
            submitObj[label + ''] = this.state.selectedRadioValue;
            return submitObj;
        }
    };

    render = () => {
        return (
            <div className="select-option-container">
                {this.props.type === 'radio' ? this.renderRadioGroup() : null}
                {this.props.type === 'checkbox' ? this.renderCheckGroup() : null}
                {this.props.type === 'option' ? this.renderOptionGroup() : null}
            </div>
        );
    }
}

SelectOption.defaultProps = {
    select_arr: [],
    type: '',
    placeholder: '',
    component_type: '',
    labelKey: ''
};

SelectOption.propTypes = {
    select_arr: PropTypes.array,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    component_type: PropTypes.string,
    labelKey: PropTypes.string,
};
export default SelectOption;