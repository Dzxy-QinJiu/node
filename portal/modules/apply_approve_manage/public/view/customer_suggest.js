/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/23.
 */

import {Input, Select, Radio, Checkbox} from 'antd';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
class CustomerContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onSaveAllData = () => {
        var submitObj = {};
        submitObj[this.props.labelKey + ''] = [this.state];
        return submitObj;
    };
    onChangeInputValue = (e) => {
        this.setState({
            inputValue: e.target.value
        });
    };
    onCustomerChoosen = (resultObj) => {
        for (var key in resultObj){
            if (!resultObj[key]){
                delete resultObj[key];
            }
        }
        this.setState({
            ...resultObj
        });
    };
    render = () => {
        const {display_type} = this.props;
        if (display_type){
            this.props['displayType'] = display_type;
        }
        return (
            <div className="select-option-container">
                <CustomerSuggest {...this.props} customerChoosen={this.onCustomerChoosen}/>
            </div>
        );
    }
}

CustomerContent.defaultProps = {
    select_arr: [],
    type: '',
    placeholder: '',
    component_type: '',
    labelKey: '',
    displayType: '',
    display_type: ''
};

CustomerContent.propTypes = {
    select_arr: PropTypes.array,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    component_type: PropTypes.string,
    labelKey: PropTypes.string,
    displayType: PropTypes.string,
    display_type: PropTypes.string,
};
export default CustomerContent;