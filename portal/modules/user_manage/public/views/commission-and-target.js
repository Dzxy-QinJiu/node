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
            field: "email",
            //是否能修改
            disabled: false,
            initalValue: "",
            //显示的值
            value: "",
            //提示文案
            title: Intl.get("common.update", "修改"),
            //修改成功
            modifySuccess: function () {
            },
            onDisplayTypeChange: function () {
            },
            onValueChange: function () {
            },
            saveEditInput: function () {
            },
        };
    },
    getInitialState: function () {
        return {
            loading: false,
            displayType: this.props.displayType || "text",
            initalValue:this.props.value,
            value: "",
            submitErrorMsg: '',
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.user_id !== this.props.user_id) {
            var value = nextProps.value;
            this.setState({
                value: value,
            });
        }
    },
    setEditable: function (e) {
        this.setState({
            displayType: "edit",
        });
        this.props.onDisplayTypeChange("edit");
        Trace.traceEvent(e, "点击编辑" + this.props.field);
    },
    handleSubmit: function (e) {
        Trace.traceEvent(e, "保存对" + this.props.field + "的修改");
            var value = this.state.value;
            var user = {
                user_id: this.props.user_id
            };
            user[this.props.field] = value;
            this.setState({
                loading: true
            });

            function setDisplayState() {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: value,
                    displayType: 'text'
                });
            }
            if ((value != this.state.value)) {
                this.props.saveEditInput(user).then(function (result) {
                    if (result) {
                        setDisplayState();
                        this.props.modifySuccess(user);
                    } else {
                        this.setState({
                            loading: false,
                            submitErrorMsg: Intl.get("common.edit.failed", "修改失败")
                        });
                    }
                }, function (errorMsg) {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get("common.edit.failed", "修改失败")
                    });
                });

            } else {
                setDisplayState();
            }

    },
    handleCancel: function (e) {
        this.setState({
            displayType: "text",
            submitErrorMsg: ''
        });
        this.props.onDisplayTypeChange("text");
        Trace.traceEvent(e, "取消对" + this.props.field + "的修改");
    },
    onInputChange: function (value) {
        this.setState({
            value: value
        });
        this.props.onValueChange();
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
                {this.props.countTip}
                <div className="buttons">
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
