/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input,Checkbox } from 'antd';
const CheckboxGroup = Checkbox.Group;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('./index.less');
import classNames from 'classnames';
class InputEdit extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        this.state = {
            title: _.get(formItem,'title',''),//标题
            placeholder: _.get(formItem,'placeholder','') || _.get(formItem,'defaultPlaceholder',''),//提示说明
            isRequired: _.get(formItem,'isRequired',false), //是否必填
            loading: false,//正在保存
            submitErrorMsg: '',
            titleRequiredMsg: '',
        };
    }
    onStoreChange = () => {

    };
    handleChangeTopic = (e) => {
        var value = e.target.value;
        if (value){
            var errTip = value.length > 6 ? Intl.get('apply.components.length.character', '标题长度不能超过6个字符') : '';
            this.setState({
                submitErrorMsg: errTip
            });
        }
        this.setState({
            title: value
        });
    };
    handleChangeTip = (e) => {
        var value = e.target.value;
        this.setState({
            placeholder: value
        });
    };
    handleSubmit = () => {
        if (this.state.loading || this.state.submitErrorMsg){
            return;
        }
        //如果必填项没有写，不允许提交
        if (!this.state.title){
            this.setState({
                titleRequiredMsg: Intl.get('apply.components.write.title', '请填写标题！')
            });
            return;
        }
        this.setState({
            loading: true
        },() => {
            var submitData = {
                key: _.get(this,'props.formItem.key'),
                placeholder: this.state.placeholder,
                title: this.state.title,
                isRequired: this.state.isRequired
            };
            this.props.handleSubmit(submitData,() => {
            },(errorMsg) => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });
        });
    };
    handleCancel = () => {
        var formItem = this.props.formItem;
        if (formItem){
            formItem.isEditting = false;
            this.props.handleCancel(formItem);
        }

    };
    onCheckboxChange = (e) => {
        this.setState({
            isRequired: e.target.checked
        });
    };
    ontimeRangeChange = (checkedValues) => {
        var formItem = this.props.formItem;
        formItem.selectedArr = checkedValues;
    };
    render = () => {
        var formItem = this.props.formItem, hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('',{
            'err-tip': hasErrTip
        });
        return (
            <div className="edit-container" key={formItem.key}>
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
                        <Input className={cls} defaultValue={this.state.title} onChange={this.handleChangeTopic}/>
                        {hasErrTip ? <span className="require-err-tip">
                            {hasErrTip}
                        </span> : null}
                    </span>
                </div>
                {this.state.placeholder ? <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.tip.msg', '提示说明')}</span>
                    <span className='text-components'>
                        <Input className={cls} defaultValue={this.state.placeholder} onChange={this.handleChangeTip}/>
                    </span>
                </div> : null}
                {_.get(formItem,'timeRange') ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem,'timeRange.unitLabel')}</span>
                        <span className='text-components'>
                            <CheckboxGroup options={_.get(formItem,'timeRange.unitList',[])} defaultValue={_.get(formItem,'selectedArr')} onChange={this.ontimeRangeChange} />
                        </span>
                    </div>
                    : null}

                <div className="component-row">
                    <span className="label-components">{Intl.get('crm.186', '其他')}</span>
                    <span className="text-components">
                        <Checkbox checked={this.state.isRequired} onChange={this.onCheckboxChange}/>
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

InputEdit.defaultProps = {
    formItem: {},
    handleCancel: function(){},
    handleSubmit: function(){},
};

InputEdit.propTypes = {
    formItem: PropTypes.object,
    handleCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
};
export default InputEdit;