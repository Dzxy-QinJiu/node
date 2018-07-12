/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/6/20.
 */
/**
 * 修改日期的组件
 */
require('./css/basic-edit-field.less');
import {Form, DatePicker} from 'antd';
var FormItem = Form.Item;
var classNames = require('classnames');
import Trace from 'LIB_DIR/trace';
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';

var DatePickerEditField = React.createClass({
    getDefaultProps: function() {
        return {
            id: '1',
            //字段
            field: 'time',
            //是否有修改权限
            hasEditPrivilege: false,
            //显示时间对应的时间戳
            value: '',
            //编辑按钮的提示文案
            editBtnTip: Intl.get('common.update', '修改'),
            //不能选择的时间
            disabledDate: null,
            //展示的时间格式
            format: '',
            //请填写
            placeholder: '',
            //编辑区的宽度
            width: '100%',
            //无数据时的提示（没有修改权限时提示没有数据）
            noDataTip: '',
            //添加数据的提示（有修改权限时，提示补充数据）
            addDataTip: '',
            saveEditDateInput: function() {
            }
        };
    },
    getInitialState: function() {
        return {
            loading: false,
            displayType: this.props.displayType || 'text',
            value: this.props.value,
            submitErrorMsg: '',
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                value: nextProps.value,
                loading: false,
                displayType: nextProps.displayType || 'text',
                submitErrorMsg: '',
            });
        }
    },
    setEditable: function(e) {
        this.setState({
            displayType: 'edit',
            value: this.state.value,
        });
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    },

    handleSubmit: function(e) {
        Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
        var value = this.state.value;
        var saveObj = {
            id: this.props.id
        };
        saveObj[this.props.field] = value;
        this.setState({
            loading: true
        });

        const setDisplayState = () => {
            this.setState({
                loading: false,
                submitErrorMsg: '',
                value: value,
                displayType: 'text'
            });
        };

        if ((value !== this.props.value)) {
            this.props.saveEditDateInput(saveObj, () => {
                setDisplayState();
            }, (errorMsg) => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });

        } else {
            setDisplayState();
        }
    },
    handleCancel: function(e) {
        this.setState({
            value: this.props.value,
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + this.props.field + '的修改');
    },

    changeSourceTime: function(value) {
        let timestamp = value && value.valueOf() || '';
        this.setState({
            value: timestamp
        });

    },
    render: function() {
        var displayCls = classNames({
            'basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var displayText = this.state.value;
        let textBlock = null;
        if (this.state.displayType === 'text') {
            if (displayText) {
                textBlock = (
                    <div>
                        <span
                            className="inline-block basic-info-text">{moment(displayText).format(oplateConsts.DATE_FORMAT)}</span>
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn title={this.props.editBtnTip}
                                onClick={this.setEditable.bind(this)}/>) : null}
                    </div>
                );
            } else {
                textBlock = (
                    <span className="inline-block basic-info-text no-data-descr">
                        {this.props.hasEditPrivilege ? (
                            <a onClick={this.setEditable.bind(this)}>{this.props.addDataTip}</a>) : this.props.noDataTip}

                    </span>
                );
            }
        }
        var inputBlock = this.state.displayType === 'edit' ? (
            <div className="date-wrap">
                <Form horizontal autoComplete="off" style={{width: this.props.width || '100%'}}>
                    <FormItem
                        labelCol={{span: 0}}
                        wrapperCol={{span: 24}}
                    >
                        <DatePicker
                            disabledDate={this.props.disabledDate}
                            defaultValue={this.state.value ? moment(this.state.value) : null}
                            onChange={this.changeSourceTime.bind(this)}
                            allowClear={false}/>
                    </FormItem>
                    <div className="buttons">
                        {this.props.hideButtonBlock ? null :
                            <SaveCancelButton loading={this.state.loading}
                                saveErrorMsg={this.state.submitErrorMsg}
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.handleCancel}
                            />}
                    </div>
                </Form>
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

module.exports = DatePickerEditField;
