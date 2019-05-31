/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/23.
 */

import {Input, Select, Radio, Checkbox} from 'antd';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

class InputContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: ''
        };
    }

    onSaveAllData = () => {
        var submitObj = {};
        submitObj[this.props.labelKey + ''] = this.state.inputValue;
        return submitObj;
    };
    onChangeInputValue = (e) => {
       this.setState({
           inputValue: e.target.value
       });
    };
    render = () => {
        return (
            <div className="select-option-container">
                <Input {...this.props} onChange={this.onChangeInputValue}/>
            </div>
        );
    }
}

InputContent.defaultProps = {
    select_arr: [],
    type: '',
    placeholder: '',
    component_type: '',
    labelKey: ''
};

InputContent.propTypes = {
    select_arr: PropTypes.array,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    component_type: PropTypes.string,
    labelKey: PropTypes.string,
};
export default InputContent;