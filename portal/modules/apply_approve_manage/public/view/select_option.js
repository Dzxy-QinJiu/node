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
        var selectArr = this.props.selectedArr;
        return (
            <RadioGroup>
                {_.map(selectArr, (item) => {
                    return (<Radio value={item.value}>{item.label}</Radio>);
                })}
            </RadioGroup>
        );
    };
    renderCheckGroup = () => {
        var selectArr = this.props.selectedArr;
        return <CheckboxGroup options={selectArr}/>;
    };

    render = () => {
        return (
            <div className="select-option-container">
                {this.props.type === 'radio' ? this.renderRadioGroup() : this.renderCheckGroup()}
            </div>
        );
    }
}

SelectOption.defaultProps = {
    selectedArr: [],
    type: ''
};

SelectOption.propTypes = {
    selectedArr: PropTypes.array,
    type: PropTypes.string
};
export default SelectOption;