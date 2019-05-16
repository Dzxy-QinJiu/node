/**
 * Created by wangliping on 2016/1/7.
 */
var React = require('react');
var language = require('../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./headIcon-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./headIcon-zh_CN.less');
}
var limitSize = 10;//图片大小限制10kb
var message = require('antd').message;
var DefaultUserLogoTitle = require('../default-user-logo-title');

class HeadIcon extends React.Component {
    state = {
        headIcon: this.props.headIcon
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
                    Intl.get('common.image.tip.size', '图片大小必须小于{size}kb!', {'size': limitSize}));
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

    render() {
        var headIcon = this.state.headIcon;
        return (
            <div className="head-image-container">
                <div className="cirle-image">
                    {this.props.isEdit ? ( <div className="upload-img-container" title={Intl.get('common.image.upload.size','请上传小于10kb的图片')}>
                        <div className="update-logo-desr"> {Intl.get('common.upload.img.change','更改')}</div>
                        <input className="upload-img-select" type="file" name="imgUpload" data-tracename="上传头像"
                            onChange={this.uploadImg}
                            accept="image/*"/>
                        {
                            this.props.isUserHeadIcon ?
                                (<DefaultUserLogoTitle
                                    userName={this.props.userName}
                                    nickName={this.props.iconDescr}
                                    userLogo={headIcon}
                                >
                                </DefaultUserLogoTitle>) :
                                (<img src={headIcon} style={{cursor: 'pointer'}}
                                    onError={this.setDefaultImg}/>)
                        }
                    </div>) : (
                        this.props.isUserHeadIcon ?
                            (<DefaultUserLogoTitle
                                userName={this.props.userName}
                                nickName={this.props.iconDescr}
                                userLogo={headIcon}
                            >
                            </DefaultUserLogoTitle>) :
                            (<img src={headIcon} style={{cursor: 'pointer'}}
                                onError={this.setDefaultImg}/>))
                    }
                </div>
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
    headIcon: PropTypes.string
};

module.exports = HeadIcon;

