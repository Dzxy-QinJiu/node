/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/6.
 */
require('./index.less');
import {Checkbox, Input} from 'antd';
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
    onCheckChange = (e) => {
        var checkStatus = e.target.checked;
        this.setState({
            checkStatus: checkStatus,
        },() => {
            this.props.onCheckboxChange(checkStatus);
            if (checkStatus){
                this.props.onInputPasswordChange('');
            }
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
        var containerCls = classNames('password-setting',{'has-input': !checkStatus});
        var showWarning = this.props.showWariningTip;
        return (
            <div className={containerCls}>
                <Checkbox checked={checkStatus} onChange={this.onCheckChange}>{Intl.get('apply.setting.password.auto', '自动生成密码')}</Checkbox>
                {!checkStatus ?
                    <span className="input-container">
                        <Input className={showWarning ? 'has-warning' : ''} type={this.state.inputType} onChange={this.onInputPasswordChange} autocomplete="new-password" readOnly={this.state.readonly} onFocus={this.removeAttribute} onBlur={this.setAttribute} />
                        <i className={iconCls} onClick={this.handlePasswordVisible}></i>
                        {showWarning ? <span className="warning-text">{this.props.warningText}</span> : null}
                    </span>
                    : null}
            </div>
        );
    }
}

PasswordSetting.defaultProps = {
    onCheckboxChange: function(){

    },
    onInputPasswordChange: function() {

    },
    checkStatus: true,
    showWariningTip: false,
    warningText: ''

};
PasswordSetting.propTypes = {
    onCheckboxChange: PropTypes.func,
    onInputPasswordChange: PropTypes.func,
    checkStatus: PropTypes.bool,
    showWariningTip: PropTypes.bool,
    warningText: PropTypes.string
};
export default PasswordSetting;