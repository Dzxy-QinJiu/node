/**
 * Created by wangliping on 2016/3/30.
 */
require('./index.less');

var classNames = require('classnames');

class PassStrengthBar extends React.Component {
    static defaultProps = {
        passStrength: 'L'//密码强度，L/M/H
    };

    render() {
        var strength = this.props.passStrength;
        var classSet = classNames({
            'ant-pwd-strength': true,
            'ant-pwd-strength-low': strength === 'L',
            'ant-pwd-strength-medium': strength === 'M',
            'ant-pwd-strength-high': strength === 'H'
        });
        var level = {
            L: Intl.get('common.password.low', '低'),
            M: Intl.get('common.password.middle', '中'),
            H: Intl.get('common.password.high', '高')
        };

        return (
            <ul className={classSet}>
                <li className="ant-pwd-strength-item ant-pwd-strength-item-1"/>
                <li className="ant-pwd-strength-item ant-pwd-strength-item-2"/>
                <li className="ant-pwd-strength-item ant-pwd-strength-item-3"/>
                <span className="ant-form-text">
                    {level[strength]}
                </span>
            </ul>
        );
    }
}

//密码强度是否展示的获取
exports.getPassStrenth = function(value) {

    if (typeof value !== 'string') {
        return {passBarShow: false};
    }
    /**
     * count密码强度得分 70-100：强，55-70：中，25-56：弱，0-25:校验不通过
     * count得分规则如下：
     * 密码长度得分：0-5:-20   >5:25               >9:30
     * 字母得分：    0:0      全部大写或小写:10     大小写混合：25
     * 数字得分：    0:0      1:10                >1:20
     * 符号得分：    0:0      1:15                >1:25
     * 奖励得分：   字母和数字:2  字母数字和符号:3   字母(大小写都有)数字和符号:5
     */
    var count = 0;
    var strength = '';
    //长度检测
    count += value.length < 6 ? -20 : (value.length >= 10 ? 30 : 25);
    //字母检测
    count += !value.match(/[a-z]/i) ? 0 : (value.match(/[a-z]/) && value.match(/[A-Z]/) ? 25 : 10);
    //数字检测
    count += !value.match(/[0-9]/) ? 0 : (value.match(/[0-9]/g).length > 1 ? 20 : 10);
    //符号检测
    count += !value.match(/[\W_]/) ? 0 : (value.match(/[\W_]/g).length > 1 ? 25 : 15);
    //奖励得分
    count += !value.match(/[0-9]/) || !value.match(/[a-z]/i) ? 0 : (!value.match(/[\W_]/) ? 2 : (!value.match(/[a-z]/) || !value.match(/[A-Z]/) ? 3 : 5));
    if (count >= 70) {
        strength = 'H';
        return {passBarShow: true, passStrength: strength};
    } else if (count >= 55) {
        strength = 'M';
        return {passBarShow: true, passStrength: strength};
    } else if (count >= 25) {
        strength = 'L';
        return {passBarShow: true, passStrength: strength};
    } else {

        return {passBarShow: false};
    }


};

PassStrengthBar.propTypes = {
    passStrength: PropTypes.string,
};

exports.PassStrengthBar = PassStrengthBar;
//6到18位字母、数字、符号组成的密码验证规则
exports.passwordRegex = /^([a-z]|[A-Z]|[0-9]|[`~! @#$%^&*()-_+={}\[\]|\\:;'"<>,.?/]){6,18}$/;

