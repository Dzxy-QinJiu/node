/**
 * Created by wangliping on 2016/1/7.
 */
var language = require("../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./headIcon-es_VE.scss");
}else if (language.lan() == "zh"){
    require("./headIcon-zh_CN.scss");
}
var limitSize = 300;//图片大小限制300kb
var message = require("antd").message;
var DefaultUserLogoTitle = require("../default-user-logo-title");

import {FormattedMessage,defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../react-intl-mixin';

const messages = defineMessages({
    common_image_type_tip:{id:'common.image.type.tip'},//'图片类型必须是gif,jpeg,jpg,png,bmp中的一种！'
    common_image_tip_size:{id:'common.image.tip.size'},// "图片大小必须小于{size}kb!",
    member_upload_head_logo:{id:'member.upload.head.logo'},//"上传{upLoadDescr}"
});


var HeadIcon = React.createClass({
    mixins: [reactIntlMixin],
    getInitialState: function () {
        return {
            headIcon: this.props.headIcon
        };
    },

    componentWillReceiveProps: function (nextProps) {
        this.setState({
            headIcon: nextProps.headIcon
        });
    },

    uploadImg: function (event) {
        var _this = this;
        var flag = false;
        var file = event.target.files ? event.target.files[0] : null;
        if (file) {
            var type = file.type.split("/")[1];
            type = type.toUpperCase();
            if (type != "JPEG" && type != "PNG" && type != "JPG"
                && type != "GIF" && type != "BMP") {
                message.warn( Intl.get("common.image.type.tip", "图片类型必须是gif,jpeg,jpg,png,bmp中的一种！"));
                event.target.value = "";
            } else if (file.size > limitSize * 1024) {
                message.warn(
                    _this.props.intl['formatMessage'](messages.common_image_tip_size,{size:limitSize}));
                event.target.value = "";
            } else {
                var reader = new FileReader();
                var _this = this;
                reader.onload = function (evt) {
                    var image = evt.target.result;
                    _this.props.onChange(image);
                };
                reader.readAsDataURL(file);
                flag = true;
            }
        }
        return flag;
    },

    setDefaultImg: function () {
        this.setState({
            headIcon: ''
        });
    },

    render: function () {
        var headIcon = this.state.headIcon;
        var headImage = this.props.upLoadDescr ? this.props.upLoadDescr : "头像";
        return (
            <div className="head-image-container">
                <div className="cirle-image">
                    {this.props.isEdit ? ( <div className="upload-img-container">
                        <div
                            className="update-logo-desr"> { Intl.get("common.image.upload", "上传") + (this.props.upLoadDescr ? this.props.upLoadDescr : Intl.get("member.head.logo", "头像"))}</div>
                        <div className="upload-img-layer"></div>
                        <input className="upload-img-select" type="file" name="imgUpload" data-tracename="上传头像" onChange={this.uploadImg}
                               accept="image/*"/>
                        {
                            this.props.isUserHeadIcon ?
                                (<DefaultUserLogoTitle
                                    userName={this.props.userName}
                                    nickName={this.props.iconDescr}
                                    userLogo={headIcon}
                                >
                                </DefaultUserLogoTitle>) :
                                (<img src={headIcon} style={{cursor:"pointer"}}
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
                            (<img src={headIcon} style={{cursor:"pointer"}}
                                  onError={this.setDefaultImg}/>))
                    }
                </div>
                {
                    this.props.isNotShowUserName ? null : <p>{this.props.iconDescr}</p>
                }

                {this.props.isEdit ? (<div className="upload-img-tooltip"><ReactIntl.FormattedMessage id="common.image.upload.size" defaultMessage="注：请上传小于300kb的图片" /></div>) : ""}
            </div>
        );
    }
});

module.exports = injectIntl(HeadIcon);
