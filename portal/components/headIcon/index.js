/**
 * Created by wangliping on 2016/1/7.
 */
const language = require('../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./headIcon-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./headIcon-zh_CN.less');
}
const limitSize = 100;//图片大小限制100KB
const message = require('antd').message;
const DefaultUserLogoTitle = require('../default-user-logo-title');

class HeadIcon extends React.Component {
    state = {
        headIcon: this.props.headIcon,
        isChangeImageFlag: false, // 是否修改头像，默认false
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            headIcon: nextProps.headIcon
        });
    }

    uploadImg = (event) => {
        var _this = this;
        var flag = false;
        var file = event.target.files ? event.target.files[0] : null;
        if (file) {
            var type = file.type.split('/')[1];
            type = type.toUpperCase();
            if (type !== 'JPEG' && type !== 'PNG' && type !== 'JPG'
                && type !== 'GIF' && type !== 'BMP') {
                message.warn(Intl.get('common.image.type.tip', '图片类型必须是gif,jpeg,jpg,png,bmp中的一种！'));
                event.target.value = '';
            } else if (file.size > limitSize * 1024) {
                message.warn(
                    Intl.get('common.image.tip.size', '图片大小必须小于{size}KB!', {'size': limitSize}));
                event.target.value = '';
            } else {
                var reader = new FileReader();
                var _this = this;
                reader.onload = function(evt) {
                    var image = evt.target.result;
                    _this.props.onChange(image);
                };
                reader.readAsDataURL(file);
                flag = true;
            }
        }
        return flag;
    };

    setDefaultImg = () => {
        this.setState({
            headIcon: ''
        });
    };

    handleMouseEnter = () => {
        this.setState({
            isChangeImageFlag: true
        });
    };

    handleMouseLeave = () => {
        this.setState({
            isChangeImageFlag: false
        });
    }

    renderHeadImg = (headIcon) => {
        if (this.props.isUserHeadIcon) {
            return (
                <DefaultUserLogoTitle
                    userName={this.props.userName}
                    nickName={this.props.iconDescr}
                    userLogo={headIcon}
                    isUseDefaultUserImage={this.props.isUseDefaultUserImage}
                >
                </DefaultUserLogoTitle>
            );
        } else {
            return (
                <img
                    src={headIcon}
                    onError={this.setDefaultImg}
                />
            );
        }
    };

    render() {
        const headIcon = this.state.headIcon;
        return (
            <div className="head-image-container">
                {
                    this.props.isEdit ? (
                        <div
                            className="cirle-image"
                            onMouseEnter={this.handleMouseEnter}
                            onMouseLeave={this.handleMouseLeave}
                        >
                            <div className="upload-img-container">
                                <div className="change-img-container">
                                    {
                                        this.state.isChangeImageFlag ? (
                                            <span>
                                                {Intl.get('common.upload.img.change','更改')}
                                            </span>
                                        ) : (
                                            this.renderHeadImg(headIcon)
                                        )
                                    }
                                    <input
                                        title={Intl.get('common.image.upload.size','请上传小于100KB的图片')}
                                        className="upload-img-select"
                                        type="file"
                                        name="imgUpload"
                                        data-tracename="上传头像"
                                        onChange={this.uploadImg}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="cirle-image">
                            {this.renderHeadImg(headIcon)}
                        </div>
                    )
                }
                {
                    this.props.isNotShowUserName ? null : <p>{this.props.iconDescr}</p>
                }
            </div>
        );
    }
}

HeadIcon.propTypes = {
    isEdit: PropTypes.bool,
    isUserHeadIcon: PropTypes.bool,
    userName: PropTypes.string,
    iconDescr: PropTypes.string,
    isNotShowUserName: PropTypes.bool,
    headIcon: PropTypes.string,
    isUseDefaultUserImage: PropTypes.bool
};

module.exports = HeadIcon;