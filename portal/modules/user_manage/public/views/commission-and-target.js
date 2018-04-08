/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/3.
 */
import {InputNumber, Icon} from "antd";
var classNames = require("classnames");
var autosize = require("autosize");
import Trace from "LIB_DIR/trace";
require("../css/commission.less");
var CommissionAndTarget = React.createClass({
    getDefaultProps: function () {
        return {
            user_id: '',
            //字段
            field: "",
            //是否能修改
            disabled: false,
            //显示的值
            value: "",
            //提示文案
            title: Intl.get("common.update", "修改"),
            setSalesGoals: function () {
            },
        };
    },
    getInitialState: function () {
        return {
            user_id: this.props.user_id,
            loading: false,
            displayType: this.props.displayType || "text",
            initalValue: this.props.value,
            value: "",
            submitErrorMsg: '',
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.user_id !== this.state.user_id || nextProps.value !== this.state.initalValue) {
            this.setState({
                user_id: nextProps.user_id,
                initalValue: nextProps.value,
            });
        }
    },
    setEditable: function (e) {
        this.setState({
            displayType: "edit",
        });
        Trace.traceEvent(e, "点击编辑" + this.props.field);
    },
    handleSubmit: function (e) {
        Trace.traceEvent(e, "保存对" + this.props.field + "的修改");
        var value = this.state.value;
        this.setState({
            loading: true
        });
        var user = {};
        user[this.props.field] = value;
        //如果提成或者目标的id存在，就更新那条记录
        if (this.props.id) {
            user.id = this.props.id;
        } else if (this.props.user_id) {
            user.user_id = this.props.user_id;
        }
        this.props.setSalesGoals(user).then((result) => {
            if (result) {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    initalValue: value,
                    displayType: 'text'
                });
            } else {
                this.setState({
                    loading: false,
                    submitErrorMsg: Intl.get("common.edit.failed", "修改失败")
                });
            }
        },(errorMsg) =>  {
            this.setState({
                loading: false,
                submitErrorMsg: errorMsg || Intl.get("common.edit.failed", "修改失败")
            });
        });
    },

    handleCancel: function (e) {
        this.setState({
            displayType: "text",
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, "取消对" + this.props.field + "的修改");
    },
    onInputChange: function (value) {
        this.setState({
            value: value
        });
    },
    render: function () {
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
                               this.setEditable(e)
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
                <i title={Intl.get("common.update", "修改")} className="inline-block iconfont icon-choose"
                   onClick={(e) => {
                       this.handleSubmit(e)
                   }}></i>
                <i title={Intl.get("common.cancel", "取消")} className="inline-block iconfont icon-close"
                   onClick={(e) => {
                       this.handleCancel(e)
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
});

module.exports = CommissionAndTarget;
