/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/12.
 */
require('./index.less');
const PropTypes = require('prop-types');
const weixinImgUrl = require('./image/weixin.jpg');
const singleSideBarHeight = 68;//一个图标的高度
const weixinHeight = 100;//二维码高度

class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showChat: this.props.showChat !== 'false'
        };
    }

    weixinMouseEnter = () => {
        this.setState({
            showWeixin: true
        }
        );
    };
    weixinMouseLeave = () => {
        this.setState({
            showWeixin: false
        }
        );
    };

    chatClick = () => {
        $('#chatBtn').trigger('click');
    };

    render() {
        let marginBottom = singleSideBarHeight;
        marginBottom += this.state.showChat ? singleSideBarHeight : 0;
        marginBottom = marginBottom - weixinHeight;

        return (
            <div className='side-bar-content'>
                <div className='side-bar'>
                    <div className='single-bar-box'>
                        <i className='iconfont icon-weixin ' onMouseEnter={this.weixinMouseEnter}
                            onMouseLeave={this.weixinMouseLeave}
                        ></i>
                        <i className='single-bar-label'>{Intl.get('weixin.mini.program', '小程序')}</i>
                    </div>
                    {this.state.showChat ? <div className='single-bar-box'>
                        <i className='iconfont   icon-apply-message-tip' onClick={this.chatClick}></i>
                        <i className='single-bar-label'>{Intl.get('customer.service', '客服')}</i>
                    </div> : null}
                </div>
                <img className={this.state.showWeixin ? 'weixin' : 'weixin-hide'} src={weixinImgUrl}
                    style={{'margin-bottom': marginBottom + 'px'}}></img>
            </div>
        );
    }
}

SideBar.propTypes = {
    showChat: PropTypes.bool
};

export default SideBar;