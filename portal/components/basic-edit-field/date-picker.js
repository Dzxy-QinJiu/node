/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/6/20.
 */
/**
 * 修改时间的组件
 */
var React = require('react');
import {DatePicker, Icon} from 'antd';
var classNames = require('classnames');
import Trace from 'LIB_DIR/trace';
require('./css/basic-date-picker.less');

class DatePickerEditField extends React.Component {
    static defaultProps = {
        user_id: '1',
        //字段
        field: 'time',
        //是否能修改
        disabled: false,
        //显示时间对应的时间戳
        value: '',
        //提示文案
        title: Intl.get('common.update', '修改'),
        //不能选择的时间
        disabledDate: '',
        //展示的时间格式
        format: '',
        //修改成功
        modifySuccess: function() {
        },
        onValueChange: function() {
        }
    };

    state = {
        loading: false,
        displayType: this.props.displayType || 'text',
        value: this.props.value,
        submitErrorMsg: '',
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.user_id !== this.props.user_id) {
            this.setState({
                value: nextProps.value,
            });
        }
    }

    setEditable = () => {
        this.setState({
            displayType: 'edit',
        });
    };

    handleSubmit = (e) => {
        Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
        var _this = this;
        var value = this.state.value;
        var user = {
            user_id: this.props.user_id
        };
        user[this.props.field] = value;
        this.setState({
            loading: true
        });

        function setDisplayState() {
            _this.setState({
                loading: false,
                submitErrorMsg: '',
                value: value,
                displayType: 'text'
            });
        }

        if ((value !== this.props.value)) {
            this.props.saveEditInput(user).then((result) => {
                if (result) {
                    setDisplayState();
                    this.props.modifySuccess(user);
                } else {
                    this.setState({
                        loading: false,
                        submitErrorMsg: Intl.get('common.edit.failed', '修改失败')
                    });
                }
            }, (errorMsg) => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });

        } else {
            setDisplayState();
        }
    };

    handleCancel = (e) => {
        var oldValue = this.props.value;
        this.setState({
            value: oldValue,
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + this.props.field + '的修改');
    };

    changeSourceTime = (value) => {
        let timestamp = value && value.valueOf() || '';
        this.setState({
            value: timestamp
        });

    };

    render() {
        var displayCls = classNames({
            'user-basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var displayText = this.state.value;
        var textBlock = this.state.displayType === 'text' ? (
            <div>
                <span
                    className="inline-block">{moment(displayText).format(oplateConsts.DATE_FORMAT)}</span>
                {
                    !this.props.disabled ? (
                        <i className="inline-block iconfont icon-update handle-btn-item" title={this.props.title}
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
            <div className="date-wrap">
                <DatePicker
                    disabledDate={this.props.disabledDate}
                    defaultValue={moment(this.state.value)}
                    onChange={this.changeSourceTime.bind(this)}
                    allowClear={false}/>
                <div className="buttons">
                    {buttonBlock}
                </div>
            </div>
        ) : null;
        return (
            <div className={displayCls}>
                {textBlock}
                {inputBlock}
                {errorBlock}
            </div>
        );
    }
}

module.exports = DatePickerEditField;

