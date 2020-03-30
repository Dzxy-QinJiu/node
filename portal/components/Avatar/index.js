'use strict';
import {NavLink} from 'react-router-dom';
const DefaultUserLogoTitle = require('../default-user-logo-title');

// 头像组件
class Avatar extends React.Component {
    render() {
        var innerStyle = {
            display: 'inline-block',
            width: this.props.size ? this.props.size : '36px',
            height: this.props.size ? this.props.size : '36px'
        };
        var aStyle = {
            cursor: 'default'
        };
        return (
            <div className={this.props.className} style={ innerStyle }>
                {this.props.link ?
                    (<Aimg
                        url={this.props.url}
                        round={this.props.round}
                        src={this.props.src}
                        size={this.props.size}
                        userName={this.props.userName}
                        nickName={this.props.nickName}
                        showName={this.props.showName}
                        name={this.props.name}
                        isActiveFlag={this.props.isActiveFlag}
                        lineHeight={this.props.lineHeight}
                        isUseDefaultUserImage={this.props.isUseDefaultUserImage}
                        defaultUserImage={this.props.defaultUserImage}
                    />) :
                    (<a style={aStyle}><Img {...this.props}/>
                        {this.props.showName ? <Name name={this.props.name}/> : ''}</a>)
                }
            </div>
        );
    }
}

// 带链接图片组件
class Aimg extends React.Component {
    render() {
        return (
            <NavLink to={this.props.url} activeClassName="active">
                <Img
                    alt={this.props.name}
                    src={this.props.src}
                    round={this.props.round}
                    userName={this.props.userName}
                    nickName={this.props.nickName}
                    size={this.props.size}
                    isActiveFlag={this.props.isActiveFlag}
                    lineHeight={this.props.lineHeight}
                    isUseDefaultUserImage={this.props.isUseDefaultUserImage}
                    defaultUserImage={this.props.defaultUserImage}
                />
                {this.props.showName ? <Name name={this.props.name}/> : ''}
            </NavLink>
        );
    }
}

// 图片组件
class Img extends React.Component {
    render() {
        const imgStyle = {
            width: '100%',
            height: '100%',
            fontSize: this.props.fontSize || '24px',
            lineHeight: this.props.lineHeight || '45px',
            borderRadius: this.props.round ? '50%' : 0,
        };
        if (this.props.isActiveFlag) {
            imgStyle.borderColor = '#ffffff';
        }
        return (
            <DefaultUserLogoTitle
                userName={this.props.userName}
                nickName={this.props.nickName}
                userLogo={this.props.src}
                alt={this.props.name}
                style={ imgStyle }
                isUseDefaultUserImage={this.props.isUseDefaultUserImage}
                defaultUserImage={this.props.defaultUserImage}
            />
        );
    }
}

class Name extends React.Component {
    render() {
        var nameStyle = {
            lineHeight: '20px',
            color: '#fff'
        };
        return (
            <label style={nameStyle}>{this.props.name}</label>
        );
    }
}

Aimg.propTypes = {
    isActiveFlag: PropTypes.bool,
    size: PropTypes.string,
    className: PropTypes.string,
    link: PropTypes.string,
    url: PropTypes.string,
    round: PropTypes.string,
    src: PropTypes.string,
    userName: PropTypes.string,
    nickName: PropTypes.string,
    showName: PropTypes.string,
    name: PropTypes.string,
    lineHeight: PropTypes.string,
    isUseDefaultUserImage: PropTypes.bool,
    defaultUserImage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

Img.propTypes = {
    isActiveFlag: PropTypes.bool,
    size: PropTypes.string,
    round: PropTypes.string,
    src: PropTypes.string,
    userName: PropTypes.string,
    nickName: PropTypes.string,
    name: PropTypes.string,
    fontSize: PropTypes.string,
    lineHeight: PropTypes.string,
    isUseDefaultUserImage: PropTypes.bool,
    defaultUserImage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

Name.propTypes = {
    name: PropTypes.string
};



Avatar.propTypes = {
    isActiveFlag: PropTypes.bool,
    size: PropTypes.string,
    className: PropTypes.string,
    link: PropTypes.string,
    url: PropTypes.string,
    round: PropTypes.string,
    src: PropTypes.string,
    userName: PropTypes.string,
    nickName: PropTypes.string,
    showName: PropTypes.string,
    name: PropTypes.string,
    fontSize: PropTypes.string,
    lineHeight: PropTypes.string,
    isUseDefaultUserImage: PropTypes.bool, // 是否使用默认的头像
    defaultUserImage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

module.exports = Avatar;

