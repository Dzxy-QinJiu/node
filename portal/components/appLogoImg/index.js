var PropTypes = require('prop-types');
var React = require('react');
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Ajax = require('./app-logo-ajax');
var DefaultUserLogoTitle = require('../default-user-logo-title');

class AppLogoImg extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        showTooltip: PropTypes.bool
    };

    static defaultProps = {
        size: 60,
        id: '',
        title: '',
        showTooltip: false
    };

    state = {
        src: '',
        title: this.props.title,
        getFromServerFail: false
    };

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    retryCount = 0;
    isUnmounted = false;

    getImageSrc = () => {
        var _this = this;
        Ajax.getAppInfo(this.props.id).then(function(obj) {
            if(!_this.isUnmounted) {
                _this.setState({
                    src: obj.image,
                    title: obj.name
                });
            }
        } , function() {
            _this.retryCount++;
            if(_this.retryCount >= 3) {
                _this.setState({
                    getFromServerFail: true
                });
                return;
            }
            _this.getImageSrc();
        });
    };

    componentDidMount() {
        this.getImageSrc();
    }

    renderImageContent = () => {
        var props = {
            nickName: this.state.title,
            userLogo: this.state.src
        };
        if(!this.state.title) {
            props.style = {
                opacity: 0
            };
        }
        return (
            <div className="img-logo-wrap" style={{'display': 'inline-block','vertical-align': 'top'}}>
                <DefaultUserLogoTitle {...props} />
            </div>
        );
    };

    //渲染图标内容
    //1.没有app_name，不展示
    //2.有logo的情况,展示logo
    //3.没有logo的情况，默认首字母
    render() {
        //如果获取3次数据，还是失败，则不显示图标
        //这种情况属于系统异常，在数据库中删除了应用
        if(this.state.getFromServerFail && !this.state.title) {
            return null;
        }
        //能够获取数据的时候，显示logo
        var title = this.state.title;
        if(this.props.showTooltip && title) {
            var tooltip = (<Tooltip bsClass="app-logo-img-tooltip tooltip" id={this.props.id}>{title}</Tooltip>);
            return (
                <OverlayTrigger placement="bottom" overlay={tooltip}>
                    {this.renderImageContent()}
                </OverlayTrigger>
            );
        } else {
            return this.renderImageContent();
        }
    }
}

module.exports = AppLogoImg;
