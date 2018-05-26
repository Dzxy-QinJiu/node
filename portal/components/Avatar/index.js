"use strict";
var ReactRouter = require("react-router");
var DefaultUserLogoTitle = require("../default-user-logo-title");
var Link = ReactRouter.Link;
// 头像组件
var Avatar = React.createClass({
    render: function() {
        var innerStyle = {
            display: 'inline-block',
            width: this.props.size ? this.props.size : 36,
            height: this.props.size ? this.props.size : 36
        };
        var aStyle = {
            cursor: "default"
        };
        return (
            <div className={this.props.className} style={ innerStyle }>
                {this.props.link ?
                    (<Aimg url={this.props.url} round={this.props.round} src={this.props.src}
                        userName={this.props.userName} nickName={this.props.nickName}
                        showName={this.props.showName} name={this.props.name}/>) :
                    (<a style={aStyle}><Img src={this.props.src} size={this.props.size} round={this.props.round}/>
                        {this.props.showName ? <Name name={this.props.name}/> : ""}</a>)
                }
            </div>
        );
    }
});
// 带链接图片组件
var Aimg = React.createClass({
    render: function() {
        return (
            <Link to={this.props.url} activeClassName="active">
                <Img alt={this.props.name} src={this.props.src} round={this.props.round}
                    userName={this.props.userName} nickName={this.props.nickName}
                />
                {this.props.showName ? <Name name={this.props.name}/> : ""}
            </Link>
        );
    }
});
// 图片组件
var Img = React.createClass({
    render: function() {
        var imgStyle = {
            width: "100%",
            height: "100%",
            fontSize: "24px",
            lineHeight: "45px",
            borderRadius: this.props.round ? "50%" : 0
        };
        return (
            <DefaultUserLogoTitle
                userName={this.props.userName}
                nickName={this.props.nickName}
                userLogo={this.props.src}
                alt={this.props.name}
                style={ imgStyle }>
            </DefaultUserLogoTitle>
        );
    }
});

var Name = React.createClass({
    render: function() {
        var nameStyle = {
            lineHeight: "20px",
            color: "#fff"
        };
        return (
            <label style={nameStyle}>{this.props.name}</label>
        );
    }
});

module.exports = Avatar;
