/**
 * Created by hzl on 2020/6/17.
 * 自定义字段的选项
 */
import {Input, DatePicker, Icon} from 'antd';
import { selectType } from 'PUB_DIR/sources/utils/consts';
import '../css/custom-field-option.less';

class CustomFieldOptions extends React.Component {
    constructor(props){
        super(props);
        const formItem = _.cloneDeep(props.formItem);
        this.state = {
            selectOption: _.get(formItem, 'selectOption'),
            fieldType: _.get(formItem, 'fieldType')
        };
        this.handleSelectDate = this.handleSelectDate.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'isChangeCustomField')) {
            const formItem = _.cloneDeep(nextProps.formItem);
            this.setState({
                selectOption: _.get(formItem, 'selectOption'),
                fieldType: _.get(formItem, 'fieldType')
            });
        }
    }

    handleSelectDate(time) {
        const timestamp = time && time.valueOf() || '';
        this.setState({
            selectOption: timestamp
        }, () => {
            this.props.modifyCustomFieldOptions([timestamp]);
        });
    }

    handleInputChange(e) {
        const value = _.get(e, 'target.value');
        this.setState({
            selectOption: value
        }, () => {
            this.props.modifyCustomFieldOptions([value]);
        });
    }

    handleOptionsInputChange(idx, e) {
        const value = _.get(e, 'target.value');
        let selectOption = this.state.selectOption;
        selectOption.splice(idx ,1, value);
        this.setState({selectOption});
    }
    handleInputBlur() {
        const formItem = _.cloneDeep(this.props.formItem);
        const selectOption = _.get(formItem, 'selectOption');
        if (!_.isEqual(selectOption, this.state.selectOption)) {
            // 过滤掉数组中，空字符的情况
            this.props.modifyCustomFieldOptions(_.compact(this.state.selectOption));
        }
    }

    handleAddItem = () => {
        let selectOption = this.state.selectOption;
        selectOption.push('');
        this.setState({selectOption});
    };
    handleMinusItem = (idx) => {
        let selectOption = this.state.selectOption;
        selectOption.splice(idx ,1);
        this.setState({selectOption}, () => {
            this.props.modifyCustomFieldOptions(_.compact(this.state.selectOption));
        });
    };

    renderOptionsContent() {
        const fieldType = this.state.fieldType;
        const selectValue = this.state.selectOption;
        if (fieldType === 'date') {
            return (
                <div className="select-content">
                    <DatePicker
                        defaultValue={moment(_.toNumber(selectValue))}
                        onChange={this.handleSelectDate}
                        allowClear={false}
                    />
                </div>
            );
        } else if (_.isEqual(fieldType, 'options')) {
            return (
                <div className="select-content">
                    {
                        _.map( selectValue, (item, idx) => {
                            const length = _.get(selectValue, 'length');
                            const noShowMinus = idx === 0 && length === 1;
                            const noShowAdd = idx !== length - 1;
                            return (
                                <span className="option-container" key={idx}>
                                    <Input 
                                        value={item} 
                                        onChange={this.handleOptionsInputChange.bind(this, idx)}
                                        onBlur={this.handleInputBlur}
                                    />
                                    <span className="icon-container">
                                        <Icon 
                                            className={noShowMinus ? 'hide-icon' : ''} 
                                            type="minus" 
                                            onClick={this.handleMinusItem.bind(this,idx)}
                                        />
                                        <Icon 
                                            className={noShowAdd ? 'hide-icon' : ''} 
                                            type="plus" 
                                            onClick={this.handleAddItem.bind(this,idx)}
                                        />
                                    </span>
                                </span>
                            );
                        } )
                    }
                </div>
            );
        } else {
            return (
                <div className="select-content">
                    <Input
                        value={selectValue}
                        onChange={this.handleInputChange}
                    />
                </div>
            );
        }
    }

    render() {
        return(
            <div className="custom-field-options-wrap">
                {this.renderOptionsContent()}
            </div>
        );
    }
}

CustomFieldOptions.defaultProps = {
    formItem: {},
    isChangeCustomField: false, // 是否修改了字段类型，默认false
    modifyCustomFieldOptions: () => {}
};

CustomFieldOptions.propTypes = {
    formItem: PropTypes.Object,
    isChangeCustomField: PropTypes.bool,
    modifyCustomFieldOptions: PropTypes.func,
};

export default CustomFieldOptions;
