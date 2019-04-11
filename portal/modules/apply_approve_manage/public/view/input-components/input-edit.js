/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input,Checkbox } from 'antd';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('./index.less');
class InputEdit extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        this.state = {
            titleInput: _.get(formItem,'title',''),//标题
            addtionDescInput: _.get(formItem,'additionRules',''),//提示说明
            loading: false,//正在保存
            submitErrorMsg: ''
        };
    }
    onStoreChange = () => {

    };
    handleChangeTopic = (e) => {
        var value = e.target.value;
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
        var formItem = this.props.formItem;
        return (
            <div className="edit-container">
                <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.name', '组件名称')}</span>
                    <span className="text-components">
                        <i className={`iconfont ${_.get(formItem,'iconfontCls')}`}></i>
                        {_.get(formItem,'rulename')}
                    </span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('crm.alert.topic', '标题')}</span>
                    <span className="text-components">
                        <Input defaultValue={this.state.titleInput} onChange={this.handleChangeTopic}/>
                    </span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.tip.msg', '提示说明')}</span>
                    <span className="text-components">
                        <Input defaultValue={this.state.addtionDescInput} onChange={this.handleChangeTip}/>
                    </span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('crm.186', '其他')}</span>
                    <span className="text-components"><Checkbox/></span>
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