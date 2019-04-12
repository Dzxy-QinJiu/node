/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input,Checkbox } from 'antd';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('./index.less');
import classNames from 'classnames';
class InputEdit extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        this.state = {
            titleInput: _.get(formItem,'title',''),//标题
            addtionDescInput: _.get(formItem,'additionRules',''),//提示说明
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
            titleInput: value
        });
    };
    handleChangeTip = (e) => {
        var value = e.target.value;
        this.setState({
            addtionDescInput: value
        });
    };
    handleSubmit = () => {
        if (this.state.loading){
            return;
        }
        //如果必填项没有写，不允许提交
        if (!this.state.titleInput){
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
                additionRules: this.state.addtionDescInput,
                titleLabel: this.state.titleInput
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
        this.props.handleCancel(formItem);
    };

    render = () => {
        var formItem = this.props.formItem, hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('',{
            'err-tip': hasErrTip
        });
        return (
            <div className="edit-container">
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
                        <Input className={cls} defaultValue={this.state.titleInput} onChange={this.handleChangeTopic}/>
                        {hasErrTip ? <span className="require-err-tip">
                            {hasErrTip}
                        </span> : null}
                    </span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.tip.msg', '提示说明')}</span>
                    <span className='text-components'>
                        <Input className={cls} defaultValue={this.state.addtionDescInput} onChange={this.handleChangeTip}/>
                    </span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('crm.186', '其他')}</span>
                    <span className="text-components">
                        <Checkbox/>
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