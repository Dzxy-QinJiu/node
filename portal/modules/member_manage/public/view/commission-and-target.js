/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/3.
 */
var React = require('react');
import {InputNumber, Icon} from 'antd';
var classNames = require('classnames');
var autosize = require('autosize');
import Trace from 'LIB_DIR/trace';
require('../css/commission.less');

class CommissionAndTarget extends React.Component {
    static defaultProps = {
        //某条销售目标或者提成比例记录的id
        id: '',
        //某个用户的详情
        memberInfo: {},
        //字段
        field: '',
        //是否能修改
        disabled: false,
        //显示的值
        value: '',
        //提示文案
        title: Intl.get('common.update', '修改'),
        setSalesGoals: function() {
        },
    };

    state = {
        id: this.props.id,
        memberInfo: $.extend(true,{},this.props.memberInfo),
        loading: false,
        displayType: this.props.displayType || 'text',
        initalValue: this.props.value,
        value: '',
        submitErrorMsg: '',
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.memberInfo.id !== this.state.memberInfo.id || nextProps.value !== this.state.initalValue || nextProps.id !== this.state.id) {
            this.setState({
                memberInfo: $.extend(true,{},nextProps.memberInfo),
                initalValue: nextProps.value,
                id: nextProps.id
            });
        }
    }

    setEditable = (e) => {
        this.setState({
            displayType: 'edit',
        });
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    };

    handleSubmit = (e) => {
        Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
        var value = this.state.value;
        this.setState({
            loading: true
        });
        var user = {};
        user[this.props.field] = value;
        //如果提成或者目标的id存在，就更新那条记录
        if (this.state.id) {
            user.id = this.state.id;
        }
        if (this.state.memberInfo.id) {
            user.user_id = this.state.memberInfo.id;
            user.user_name = this.state.memberInfo.name;
            user.sales_team = this.state.memberInfo.teamName;
            user.sales_team_id = this.state.memberInfo.teamId;
        }
        this.props.setSalesGoals(user).then((result) => {
            if (result.id) {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    initalValue: value,
                    displayType: 'text'
                });
                //如果之前没有填写过销售目标和提成比例
                if (!this.state.id && _.isFunction(this.props.afterModifySuccess)){
                    var updateObj = {
                        id: result.id
                    };
                    if (result.goal || result.goal === 0){
                        updateObj.goal = result.goal;
                    }
                    if (result.commission_ratio || result.commission_ratio === 0){
                        updateObj.commission_ratio = result.commission_ratio;
                    }
                    this.props.afterModifySuccess(updateObj);
                }
            } else {
                this.setState({
                    loading: false,
                    submitErrorMsg: Intl.get('common.edit.failed', '修改失败')
                });
            }
        },(errorMsg) => {
            this.setState({
                loading: false,
                submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
            });
        });
    };

    handleCancel = (e) => {
        this.setState({
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + this.props.field + '的修改');
    };

    onInputChange = (value) => {
        this.setState({
            value: value
        });
    };

    render() {
        var displayCls = classNames({
            'commission-target-text': true,
            'editing': this.state.displayType === 'edit'
        });

        var textBlock = this.state.displayType === 'text' ? (
            <div>
                <span className="inline-block">
                    {this.state.initalValue}{this.props.countTip}
                </span>
                {
                    !this.props.disabled ? (
                        <i className="inline-block iconfont icon-update" title={this.props.title}
                            onClick={(e) => {
                                this.setEditable(e);
                            }}></i>
                    ) : null
                }

            </div>
        ) : null;

        var errorBlock = this.state.submitErrorMsg ? (
            <div className="has-error"><span className="ant-form-explain">{this.state.submitErrorMsg}</span></div>
        ) : null;

        var buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get('common.update', '修改')} className="inline-block iconfont icon-choose"
                    onClick={(e) => {
                        this.handleSubmit(e);
                    }}></i>
                <i title={Intl.get('common.cancel', '取消')} className="inline-block iconfont icon-close"
                    onClick={(e) => {
                        this.handleCancel(e);
                    }}></i>
            </div>
        );
        var inputBlock = this.state.displayType === 'edit' ? (
            <div className="inputWrap" ref="inputWrap">
                <InputNumber name="input"
                    defaultValue={this.state.initalValue}
                    onChange={this.onInputChange}
                    autoComplete="off"
                    min={this.props.min}
                    max={this.props.max}
                />
                <div className="text-container">{this.props.countTip}</div>
                <div className="buttons-container">
                    {!this.props.hideButtonBlock ? buttonBlock : null}
                </div>
                {errorBlock}
            </div>
        ) : null;
        return (
            <div className={displayCls}>
                {textBlock}
                {inputBlock}
            </div>
        );
    }
}

CommissionAndTarget.propTypes = {
    id: PropTypes.string,
    memberInfo: PropTypes.object,
    displayType: PropTypes.string,
    value: PropTypes.string,
    field: PropTypes.string,
    setSalesGoals: PropTypes.func,
    afterModifySuccess: PropTypes.func,
    countTip: PropTypes.string,
    disabled: PropTypes.bool,
    title: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    hideButtonBlock: PropTypes.string,
};

module.exports = CommissionAndTarget;

