/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/15.
 */
import {Input,Select } from 'antd';
const Option = Select.Option;
import classNames from 'classnames';
class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render = () => {
        var selectArr = this.props.selectedArr;
        return (
            <div className="range-input-container">
                <Input placeholder={this.props.placeholder} onChange={this.props.onChangeInput}/>
                <Select onChange={this.props.onChangeSelect} defaultValue={_.get(selectArr,'[0].value')}>
                    {_.map(selectArr, (item, index) => {
                        return (<Option key={index} value={item.value}>{item.label}</Option>);
                    })}
                </Select>

            </div>
        );
    }
}

RangeInput.defaultProps = {
    placeholder: '',
    selectedArr: [],
    onChangeSelect: function () {

    },
    onChangeInput: function () {

    }
};

RangeInput.propTypes = {
    placeholder: PropTypes.string,
    selectedArr: PropTypes.array,
    onChangeSelect: PropTypes.func,
    onChangeInput: PropTypes.func
};
export default RangeInput;