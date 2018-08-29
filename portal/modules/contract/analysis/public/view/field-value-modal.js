const PropTypes = require('prop-types');
var React = require('react');
/**
 * 用于选择值类型的modal
 * author：xuning
 * params {
 * selectedItem 选中的值字段
 * isShow
 * onOk
 * onCancel
 * }
 */

import {Button, Modal, Select} from 'antd';
var Option = Select.Option;
import {CONTRACT_VALUE_TYPES, CONTRACT_DEFAULT_VALUE_TYPE} from '../consts';

class ValueModal extends React.Component {
    constructor(props) {
        super(props);
        let selectedValueType = props.selectedItem && props.selectedItem.calcType && props.selectedItem.calcType.value;
        this.state = {
            selectedValueType: selectedValueType || CONTRACT_DEFAULT_VALUE_TYPE.value
        };
    }

    handleValueTypeChange(value) {
        this.setState({
            selectedValueType: value
        });
    }

    componentWillReceiveProps({selectedItem}) {
        let selectedValueType = selectedItem && selectedItem.calcType && selectedItem.calcType.value;
        this.setState({
            selectedValueType: selectedValueType || CONTRACT_DEFAULT_VALUE_TYPE.value
        });
    }

    render() {
        const typeList = CONTRACT_VALUE_TYPES.filter(item => !item.type || item.type === (this.props.selectedItem && this.props.selectedItem.fieldType));
        const typeOptions = typeList.map((item, index) => (
            <Option key={index} value={item.value}>{item.text}</Option>
        ));
        return (
            <Modal
                visible={this.props.isShow}
                title={Intl.get('contract.valueTypeConfig', '值字段设置')}
                footer={[
                    <Button key="back" onClick={this.props.onCancel}>
                        {Intl.get('common.cancel', '取消')}
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => this.props.onOk(this.state.selectedValueType)}>
                        {Intl.get('common.sure', '确定')}
                    </Button>
                ]}
            >
                <p>{Intl.get('contract.chooseCalcType', '选择用于汇总所选字段数据的计算类型')}</p>
                <Select
                    style={{width: 100}}
                    value={this.state.selectedValueType}
                    onChange={this.handleValueTypeChange.bind(this)}
                >
                    {typeOptions}
                </Select>
            </Modal>
        );
    }
}
ValueModal.defaultProps = {
    isShow: false,
    onOk: () => {
    },
    onCancel: () => {
    },
};
ValueModal.propTypes = {
    selectedItem: PropTypes.object,
    isShow: PropTypes.bool,
    onCancel: PropTypes.func,
    onOk: PropTypes.func
};
export default ValueModal;