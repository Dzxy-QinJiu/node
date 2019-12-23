/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/12.
 */
require('./index.less');
const PropTypes = require('prop-types');
const weixinImgUrl = require('./image/weixin.jpg');
const singleSideBarHeight = 68;//一个图标的高度
const qrcodeHeight = 100; // 二维码高度
const QRCode = require('qrcode.react');
import classNames from 'classnames';
import { Button } from 'antd';

class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showChat: this.props.showChat !== 'false',
            isShowIosQRCode: false, // 是否显示ios二维码，默认false
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
    androidAppMouseEnter = () => {
        this.setState({
            showApp: true
        }
        );
    };
    androidAppMouseLeave = () => {
        this.setState({
            showApp: false
        }
        );
    };

    iosAppMouseEnter = () => {
        this.setState({
            isShowIosQRCode: true
        });
    };

    iosAppMouseLeave = () => {
        this.setState({
            isShowIosQRCode: false
        });
    };

    chatClick = () => {
        //如果有客服时，点击触发出客服界面
        $('#newBridge #nb_icon_wrap').trigger('click');
    };

    render() {
        let qrCodeBottom = 4 * singleSideBarHeight - qrcodeHeight;
        if (this.state.showApp) {
            qrCodeBottom = qrCodeBottom - singleSideBarHeight;
        } else if (this.state.isShowIosQRCode) {
            qrCodeBottom = qrCodeBottom - 2 * singleSideBarHeight;
        }
        let weixinClassName = classNames('qrcode', 'weixin', {'hide': !this.state.showWeixin});
        let appClassName = classNames('qrcode', 'app', {'hide': !this.state.showApp && !this.state.isShowIosQRCode});
        let qRCodeUrl = location.protocol + '//' + location.host + '/ketao';
        if (this.state.isShowIosQRCode) {
            qRCodeUrl = 'https://testflight.apple.com/join/q7kTEZVB';
        }
        let onlyService = classNames('single-bar-box', {
            'only-service': _.get(this.state, 'showChat')
        });

        return (
            <div className='side-bar-content'>
                <div className='side-bar'>
                    {/*{*/}
                    {/*this.state.showChat ? (*/}
                    {/*<Button className='apply-btn'>*/}
                    {/*<a href="https://www.curtao.com/apply" target="_blank" rel="noopener noreferrer">*/}
                    {/*{Intl.get('login.apply.trial', '申请试用')}*/}
                    {/*</a>*/}
                    {/*</Button>*/}
                    {/*) : null*/}
                    {/*}*/}

                    {this.state.showChat ? null : (
                        <React.Fragment>
                            <div className='single-bar-box'>
                                <i className='iconfont icon-weixin' onMouseEnter={this.weixinMouseEnter}
                                    onMouseLeave={this.weixinMouseLeave}
                                ></i>
                                <i className='single-bar-label'>{Intl.get('weixin.mini.program', '小程序')}</i>
                            </div>
                            <div className='single-bar-box'>
                                <i className='iconfont icon-ketao-app' onMouseEnter={this.androidAppMouseEnter}
                                    onMouseLeave={this.androidAppMouseLeave}></i>
                                <i className='single-bar-label'>{Intl.get('common.app.android', '安卓版')}</i>
                            </div>
                            <div className='single-bar-box'>
                                <i className='iconfont icon-ketao-app' onMouseEnter={this.iosAppMouseEnter}
                                    onMouseLeave={this.iosAppMouseLeave}></i>
                                <i className='single-bar-label'>{Intl.get('common.app.ios', 'IOS版')}</i>
                            </div>
                        </React.Fragment>
                    )}
                    {this.state.showChat ? (
                        null
                        /***
                        <div className={onlyService}>
                            <i className='iconfont icon-apply-message-tip' onClick={this.chatClick}></i>
                            <i className='single-bar-label'>{Intl.get('customer.service', '客服')}</i>
                        </div> ***/
                    ) : (<div className='single-bar-box is-placeholder'/>)}
                </div>
                <img className={weixinClassName} src={weixinImgUrl}
                    style={{'margin-bottom': qrCodeBottom + 'px'}}></img>
                <div className={appClassName}
                    style={{'margin-bottom': qrCodeBottom + 'px'}}>
                    <QRCode
                        value={qRCodeUrl}
                        level="H"
                        size={92}
                    />
                </div>
            </div>
        );
    }
}

SideBar.propTypes = {
    showChat: PropTypes.bool
};

export default SideBar;