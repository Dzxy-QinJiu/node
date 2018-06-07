/**
 * Created by xiaojinfeng on 2016/04/28.
 */
require('./default-img-title.less');
var classNames = require('classnames');

var DefaultUserLogoTitle = React.createClass({
    getInitialState: function() {
        return {
            userLogo: this.props.userLogo
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if(nextProps.userLogo !== this.props.userLogo) {
            this.setState({
                userLogo: nextProps.userLogo
            });
        }
    },

    setDefaultImg: function() {
        this.setState({userLogo: ''});
    },

    render: function() {
        var userName = this.props.userName ? this.props.userName : '';
        //没有昵称时，用用户名展示
        var nickName = this.props.nickName ? this.props.nickName : userName;
        var defaultHeadIcon = 'default-user-logo-title-' + userName.substr(0, 1).toLowerCase();
        var headIconDefIconClass = classNames('no-user-logo-div', this.props.className, {
            [`${defaultHeadIcon}`]: true
        });

        return (
            this.state.userLogo ?
                ( <img className={this.props.defaultImgClass}
                    src={this.state.userLogo}
                    onError={this.setDefaultImg}
                    style={this.props.style}
                    alt={this.props.name}/>) :
                (<div
                    className={headIconDefIconClass}
                    style={this.props.style}
                >{nickName.substr(0, 1)}</div>)
        );
    }
});

module.exports = DefaultUserLogoTitle;
