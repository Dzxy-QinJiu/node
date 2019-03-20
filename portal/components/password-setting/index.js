/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/6.
 */
require('./index.less');
import {Checkbox, Input, Radio } from 'antd';
const RadioGroup = Radio.Group;
import classNames from 'classnames';
const INPUT_TYPE = {
    PASSWORD: 'password',
    TEXT: 'text'
};
class PasswordSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkStatus: this.props.checkStatus,
            inputType: INPUT_TYPE.PASSWORD,
            readonly: false
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.checkStatus !== this.props.checkStatus) {
            this.setState({
                checkStatus: nextProps.checkStatus
            });
        }
    }
    onRadioChange = (e) => {
        var checkStatus = e.target.value;
        this.setState({
            checkStatus: checkStatus,
        },() => {
            this.props.onCheckboxChange(checkStatus);
        });
    };
    getIntputPasswordType = () => {
        return this.state.inputType === INPUT_TYPE.PASSWORD;
    };
    handlePasswordVisible = () => {
        this.setState({
            inputType: this.getIntputPasswordType() ? INPUT_TYPE.TEXT : INPUT_TYPE.PASSWORD
        });
    };
    onInputPasswordChange = (e) => {
        var password = _.trim(e.target.value);
        this.props.onInputPasswordChange(password);
    };
    removeAttribute = () => {
        this.setState({
            readonly: false
        });
    };
    setAttribute = () => {
        this.setState({
            readonly: true
        });
    };

    render() {
        var checkStatus = this.state.checkStatus;
        var isPasswordType = this.getIntputPasswordType();
        var iconCls = classNames('iconfont',{'icon-password-visible': isPasswordType, 'icon-password-hide': !isPasswordType});
        var title = isPasswordType ? Intl.get('apply.detail.show.password', '显示密码') : Intl.get('apply.detail.hide.password', '隐藏密码');
        var containerCls = classNames('password-setting',{'has-input': !checkStatus});
        var showWarning = this.props.showWariningTip;
        return (
            <div className={containerCls}>
                <div className="label-container">{Intl.get('common.password', '密码')}:</div>
                <div className="check-container">
                    <RadioGroup onChange={this.onRadioChange} value={checkStatus}>
                        <Radio value={true}>{Intl.get('apply.setting.password.auto', '自动生成')}</Radio>
                        <Radio value={false}>{Intl.get('user.time.custom', '自定义')}</Radio>
                    </RadioGroup>
                    {!checkStatus ?
                        <div className="input-msg-container">
                            <div className="input-container">
                                <Input placeholder={Intl.get('common.input.password', '请输入密码')} className={showWarning ? 'has-warning' : ''} type={this.state.inputType} onChange={this.onInputPasswordChange} autocomplete="new-password" readOnly={this.state.readonly} onFocus={this.removeAttribute} onBlur={this.setAttribute} />
                                <i title={title} className={iconCls} onClick={this.handlePasswordVisible}></i>
                            </div>
                            {showWarning ? <span className="warning-text">{this.props.warningText}</span> : null}
                        </div>
                        : null}
                </div>
            </div>
        );
    }
}

PasswordSetting.defaultProps = {
    onCheckboxChange: function(){

    },//切换选中的按钮后的回调
    onInputPasswordChange: function() {

    },//输入密码后的回调
    checkStatus: true,//一开始按钮的选中值
    showWariningTip: false,//没写密码但是选中自定义按钮后的提示
    warningText: ''//提示输入密码的文本

};
PasswordSetting.propTypes = {
    onCheckboxChange: PropTypes.func,
    onInputPasswordChange: PropTypes.func,
    checkStatus: PropTypes.bool,
    showWariningTip: PropTypes.bool,
    warningText: PropTypes.string
};
export default PasswordSetting;