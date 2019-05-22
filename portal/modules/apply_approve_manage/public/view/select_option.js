/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/16.
 */
import {Input, Select, Radio, Checkbox} from 'antd';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

class SelectOption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderRadioGroup = () => {
        var selectArr = this.props.default_value;
        return (
            <RadioGroup>
                {_.map(selectArr, (item) => {
                    return (<Radio value={item.value}>{item.label}</Radio>);
                })}
            </RadioGroup>
        );
    };
    renderCheckGroup = () => {
        var selectArr = this.props.default_value;
        return <CheckboxGroup options={selectArr}/>;
    };
    renderOptionGroup = () => {
        var selectArr = this.props.default_value;
        return (
            <Select
                showSearch
                placeholder={this.props.placeholder}
            >
                {_.map(selectArr,(item) => {
                    return <Option value={item.value}>{item.name}</Option>;
                })}
            </Select>
        );
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
    default_value: [],
    type: '',
    placeholder: ''
};

SelectOption.propTypes = {
    default_value: PropTypes.array,
    type: PropTypes.string,
    placeholder: PropTypes.string,
};
export default SelectOption;