/**
 * Created by hzl on 2020/5/19.
 */

import {Input,Checkbox, Icon, Radio} from 'antd';
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {ALL_COMPONENTS, selectCustomFieldComponents} from '../utils';
import classNames from 'classnames';
require('../css/select-custom-field.less');

class SelectCustomField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formItem: _.cloneDeep(this.props.formItem),
            loading: false,//正在保存
            submitErrorMsg: '',
            titleRequiredMsg: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        if ( !_.isEqual(this.state.formItem, nextProps.formItem) ) {
            this.setState({
                formItem: _.cloneDeep(nextProps.formItem),
            });
        }
    }

    handleChangeTip = (e) => {
        var formItem = this.state.formItem;
        formItem.placeholder = e.target.value;
        this.setState({
            formItem
        });
    };
    handleSubmit = () => {
        if (this.state.loading || this.state.submitErrorMsg){
            return;
        }
        var formItem = this.state.formItem;
        this.setState({
            loading: true
        },() => {
            this.props.handleSubmit(formItem,() => {
                this.setState({
                    loading: false,
                    submitErrorMsg: ''
                });
            },(errorMsg) => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });
        });
    };
    handleCancel = () => {
        var formItem = this.state.formItem;
        if (formItem){
            formItem.isEditting = false;
            this.props.handleCancel(formItem);
        }

    };
    onCheckboxChange = (e) => {
        var formItem = this.state.formItem;
        formItem.is_required = e.target.checked;
        this.setState({
            formItem
        });
    };
    ontimeRangeChange = (checkedValues) => {
        var formItem = this.state.formItem;
        formItem.default_value = _.filter(_.get(formItem, 'select_arr'), item =>
            _.indexOf(checkedValues, item.value) > -1
        );
        this.setState({formItem});
    };
    handleAddInput = () => {
        var formItem = this.state.formItem;
        var options = _.get(formItem,'select_arr');
        options.push('');
        this.setState({formItem});
    };
    handleMinusInput = (index) => {
        var formItem = this.state.formItem;
        var options = _.get(formItem,'select_arr');
        options.splice(index ,1);
        this.setState({formItem});
    };
    onPreciousRadioChange = (e) => {
        var formItem = this.state.formItem;
        formItem.selected_value = e.target.value;
        this.setState({formItem});
    };
    handleInputChange = (index,e) => {
        var formItem = this.state.formItem;
        var options = _.get(formItem,'select_arr');
        options.splice(index ,1, e.target.value);
        this.setState({formItem}, () => {
            this.props.modifyCustomFieldContent(formItem);
        });

    };

    render = () => {
        var formItem = this.state.formItem, hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('',{
            'err-tip': hasErrTip
        });
        return (
            <div className="select-container" key={formItem.key}>
                { _.get(this,'props.formItem.placeholder','') ? <div className="component-row">
                    <span className='text-components'>
                        <Input
                            className={cls}
                            defaultValue={ _.get(formItem,'placeholder','')}
                            onChange={this.handleChangeTip}
                        />
                    </span>
                </div> : null}
                {_.get(formItem,'component_type') === ALL_COMPONENTS.RANGEINPUT ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem,'unitLabel')}</span>
                        <span className='text-components'>
                            <CheckboxGroup
                                options={_.get(formItem,'select_arr',[])}
                                defaultValue={_.map(_.get(formItem,'default_value'),'value')}
                                onChange={this.ontimeRangeChange}
                            />
                        </span>
                    </div>
                    : null}
                {_.get(formItem,'component_type') === ALL_COMPONENTS.SELECTOPTION ?
                    <div className="component-row required">

                        <span className="label-components">{_.get(formItem,'unitLabel')}</span>
                        <span className="text-components">
                            {_.map(_.get(formItem,'select_arr'),(item,index) => {
                                const noShowMinus = index === 0 && _.get(formItem,'select_arr.length') === 1;
                                const noShowAdd = index + 1 !== _.get(formItem,'select_arr.length');
                                return <span className="option-container" key={index}>
                                    <Input value={item} onChange={this.handleInputChange.bind(this, index)}/>
                                    <span className="icon-container">
                                        <Icon className={noShowMinus ? 'hide-icon' : ''} type="minus" onClick={this.handleMinusInput.bind(this,index)}/>
                                        <Icon className={noShowAdd ? 'hide-icon' : ''} type="plus" onClick={this.handleAddInput.bind(this,index)}/>
                                    </span>
                                </span>;
                            })}
                        </span>

                    </div>
                    : null}
                {_.get(formItem,'component_type') === ALL_COMPONENTS.TIME_PERIOD ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem,'unitLabel')}</span>
                        <span className="text-components">
                            <RadioGroup onChange={this.onPreciousRadioChange} value={_.get(formItem,'selected_value')}>
                                {_.map(_.get(formItem,'select_arr'),(item) => {
                                    if (_.isString(item)){
                                        item = JSON.parse(item);
                                    }
                                    return <Radio value={item.value}>{item.label}</Radio>;})}
                            </RadioGroup>({_.get(formItem,'unitMsg')})
                        </span>

                    </div>
                    : null}

                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit}
                    handleCancel={this.handleCancel}
                />
            </div>
        );
    }
}

SelectCustomField.defaultProps = {
    formItem: {},
    handleCancel: function(){},
    handleSubmit: function(){},
    modifyCustomFieldContent: function(){},
};

SelectCustomField.propTypes = {
    formItem: PropTypes.object,
    handleCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
    modifyCustomFieldContent: PropTypes.func,
};
export default SelectCustomField;
