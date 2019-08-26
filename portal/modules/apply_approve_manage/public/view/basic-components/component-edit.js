/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input,Checkbox, Icon, Radio} from 'antd';
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';
require('./index.less');
import {ALL_COMPONENTS} from '../../utils/apply-approve-utils';
import classNames from 'classnames';
class componentEdit extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        this.state = {
            formItem: formItem,
            loading: false,//正在保存
            submitErrorMsg: '',
            titleRequiredMsg: '',
        };
    }
    onStoreChange = () => {

    };
    handleChangeTopic = (e) => {
        var formItem = this.state.formItem;
        var value = e.target.value;
        // if (value){
        //     var errTip = value.length > 6 ? Intl.get('apply.components.length.character', '标题长度不能超过6个字符') : '';
        //     this.setState({
        //         submitErrorMsg: errTip
        //     });
        // }
        formItem.title = value;
        this.setState({
            formItem
        });
    };
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
        //如果必填项没有写，不允许提交
        if (!formItem.title){
            this.setState({
                titleRequiredMsg: Intl.get('apply.components.write.title', '请填写标题！')
            });
            return;
        }
        this.setState({
            loading: true
        },() => {
            this.props.handleSubmit(formItem,() => {
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
        this.setState({formItem});
    };
    render = () => {
        var formItem = this.state.formItem, hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('',{
            'err-tip': hasErrTip
        });
        return (
            <div className="approve-edit-container" key={formItem.key}>
                <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.name', '组件名称')}</span>
                    <span className="text-components">
                        <i className={`iconfont ${_.get(formItem,'iconfontCls')}`}></i>
                        {_.get(formItem,'rulename')}
                    </span>
                </div>
                <div className="component-row required">
                    <span className="label-components">{Intl.get('crm.alert.topic', '标题')}</span>
                    <span className="text-components">
                        <Input className={cls} defaultValue={_.get(formItem,'title')} onChange={this.handleChangeTopic}/>
                        {hasErrTip ? <span className="require-err-tip">
                            {hasErrTip}
                        </span> : null}
                    </span>
                </div>
                { _.get(this,'props.formItem.placeholder','') ? <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.tip.msg', '提示说明')}</span>
                    <span className='text-components'>
                        <Input className={cls} defaultValue={ _.get(formItem,'placeholder','')} onChange={this.handleChangeTip}/>
                    </span>
                </div> : null}
                {_.get(formItem,'component_type') === ALL_COMPONENTS.RANGEINPUT ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem,'unitLabel')}</span>
                        <span className='text-components'>
                            <CheckboxGroup options={_.get(formItem,'select_arr',[])} defaultValue={_.map(_.get(formItem,'default_value'),'value')} onChange={this.ontimeRangeChange} />
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
                {_.get(formItem,'component_type') === ALL_COMPONENTS.TIMEPERIOD ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem,'unitLabel')}</span>
                        <span className="text-components">
                            <RadioGroup onChange={this.onPreciousRadioChange} value={_.get(formItem,'selected_value')}>
                                {_.map(_.get(formItem,'select_arr'),item => <Radio value={item.value}>{item.label}</Radio>)}
                            </RadioGroup>({_.get(formItem,'unitMsg')})
                        </span>

                    </div>
                    : null}

                <div className="component-row">
                    <span className="label-components">{Intl.get('crm.186', '其他')}</span>
                    <span className="text-components">
                        <Checkbox checked={_.get(formItem,'is_required')} onChange={this.onCheckboxChange}/>
                        {Intl.get('apply.components.required.item', '必填')}
                    </span>
                </div>
                <SaveCancelButton loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit}
                    handleCancel={this.handleCancel} />
            </div>
        );
    }
}

componentEdit.defaultProps = {
    formItem: {},
    handleCancel: function(){},
    handleSubmit: function(){},
};

componentEdit.propTypes = {
    formItem: PropTypes.object,
    handleCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
};
export default componentEdit;