/**
 * Created by xiaojinfeng on 2016/04/28.
 * 用法：
 * <DefaultUserLogoTitle
 *  isUsedefaultUserImage={true}
 * >
 * 属性：isUsedefaultUserImage 是否使用默认的头像
 * 传true则用，使用默认的头像，不传，使用昵称或是名称的第一个字
 */
require('./default-img-title.less');
const classNames = require('classnames');

class DefaultUserLogoTitle extends React.Component {
    state = {
        userLogo: this.props.userLogo
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.userLogo !== this.props.userLogo) {
            this.setState({
                userLogo: nextProps.userLogo
            });
        }
    }

    setDefaultImg = () => {
        this.setState({userLogo: ''});
    };

    render() {
        var userName = this.props.userName ? this.props.userName : '';
        //没有昵称时，用用户名展示
        var nickName = this.props.nickName ? this.props.nickName : userName;
        var defaultHeadIcon = 'default-user-logo-title-' + userName.substr(0, 1).toLowerCase();
        var headIconDefIconClass = classNames('no-user-logo-div', this.props.className, {
            [`${defaultHeadIcon}`]: true
        });

        return (
            this.state.userLogo ?
                (
                    <img className={this.props.defaultImgClass}
                        src={this.state.userLogo}
                        onError={this.setDefaultImg}
                        style={this.props.style}
                        alt={this.props.name}
                    />
                ) :
                (
                    <div
                        className={headIconDefIconClass}
                        style={this.props.style}
                    >
                        {
                            this.props.isUsedefaultUserImage ? (
                                <i className="iconfont icon-user-ico"></i>
                            ) : (nickName.substr(0, 1))
                        }
                    </div>
                )
        );
    }
}

DefaultUserLogoTitle.defaultProps = {
    isUsedefaultUserImage: false // 是否用默认的头像,默认不用
};

DefaultUserLogoTitle.propTypes = {
    className: PropTypes.string,
    userName: PropTypes.string,
    nickName: PropTypes.string,
    name: PropTypes.string,
    defaultImgClass: PropTypes.string,
    style: PropTypes.string,
    userLogo: PropTypes.string,
    isUsedefaultUserImage: PropTypes.bool
};

module.exports = DefaultUserLogoTitle;

