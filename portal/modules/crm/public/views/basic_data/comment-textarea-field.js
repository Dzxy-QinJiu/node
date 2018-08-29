/**
 * 显示、编辑 的组件
 * 可切换状态
 */
var React = require('react');
import {Input,Icon} from 'antd';
let autosize = require('autosize');
import FieldMixin from '../../../../../components/antd-form-fieldmixin';
let AutosizeTextarea = require('../../../../../components/autosize-textarea');
let CrmBasicAjax = require('../../ajax/index');
import Trace from 'LIB_DIR/trace';
let BasicEditInputField = React.createClass({
    mixins: [FieldMixin],
    getDefaultProps: function() {
        return {
            //是否能修改
            disabled: false,
            //显示的值
            remarks: '',
            //修改成功
            modifySuccess: function() {
            }
        };
    },
    getInitialState: function() {
        return {
            loading: false,
            displayType: 'text',
            disabled: this.props.disabled,
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            remarks: this.props.remarks,
            submitErrorMsg: ''
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.customerId != this.state.customerId) {
            //切换客户时,重新设置state数据
            let stateData = this.getInitialState();
            stateData.isMerge = nextProps.isMerge;
            stateData.customerId = nextProps.customerId;
            stateData.remarks = nextProps.remarks;
            stateData.disabled = nextProps.disabled;
            this.setState(stateData);
        }
    },
    setEditable: function() {
        Trace.traceEvent(ReactDOM.findDOMNode(this),'点击设置备注按钮');
        this.setState({
            displayType: 'edit'
        });
    },
    //回到展示状态
    backToDisplay: function() {
        this.setState({
            loading: false,
            displayType: 'text',
            submitErrorMsg: ''
        });
    },
    handleSubmit: function() {
        if (this.state.loading) return;
        if (this.state.remarks == this.props.remarks){
            this.backToDisplay();
            return;
        }
        let submitData = {
            id: this.props.customerId,
            type: 'comment',
            remarks: $.trim(this.state.remarks)
        };
        Trace.traceEvent(ReactDOM.findDOMNode(this),'点击保存备注按钮');
        if (this.props.isMerge) {
            this.props.updateMergeCustomer(submitData);
            this.backToDisplay();
        } else {
            this.setState({loading: true});
            CrmBasicAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    this.setState({
                        loading: false,
                        displayType: 'text',
                        submitErrorMsg: '',
                        remarks: submitData.remarks
                    });
                    //更新列表中的客户名
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('crm.171', '修改客户备注失败')
                });
            });
        }
    },


    handleCancel: function() {
        Trace.traceEvent(ReactDOM.findDOMNode(this),'点击取消保存备注按钮');
        this.setState({
            remarks: this.props.remarks,
            displayType: 'text',
            submitErrorMsg: '',
            loading: false
        });
    },
    onInputChange: function(e) {
        this.setState({
            remarks: e.target.value
        });
    },
    render: function() {
        let textBlock = this.state.displayType === 'text' ? (
            <div>
                <span className="inline-block">{this.state.remarks}</span>
                {
                    !this.props.disabled ? (
                        <i className="inline-block iconfont icon-update" title={Intl.get('user.remark.set.tip', '设置备注')}
                            onClick={this.setEditable}/>
                    ) : null
                }

            </div>
        ) : null;

        let errorBlock = this.state.submitErrorMsg ? (
            <div className="has-error"><span className="ant-form-explain">{this.state.submitErrorMsg}</span></div>
        ) : null;

        let buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get('common.save', '保存')} className="inline-block iconfont icon-choose" onClick={this.handleSubmit}/>
                <i title={Intl.get('common.cancel', '取消')} className="inline-block iconfont icon-close" onClick={this.handleCancel}/>
            </div>
        );


        let inputBlock = this.state.displayType === 'edit' ? (
            <div className="inputWrap" ref="inputWrap">
                <AutosizeTextarea rows="4" value={this.state.remarks}
                    onChange={this.onInputChange}
                />
                <div className="buttons">
                    {buttonBlock}
                </div>
                {errorBlock}
            </div>
        ) : null;

        return (
            <div>
                {textBlock}
                {inputBlock}
            </div>
        );
    }
});

module.exports = BasicEditInputField;
