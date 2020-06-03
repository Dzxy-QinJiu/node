/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/3.
 */
// 带头像的popover提示
import './style.less';
import React, {Component} from 'react';
import {Popover} from 'antd';
import classNames from 'classnames';

class AvatarPopoverTip extends Component {

    renderContent(content, onVisibleChange) {
        return (
            <div className="avatar-popover-content" data-tracename="带头像的popover提示">
                <div className="avatar-popover-img">
                    <img className="image" src="/static/images/curtao-personal.svg"/>
                </div>
                <span className="avatar-popover-text">{content}</span>
                <i className="iconfont icon-close" data-tracename="点击提示中的关闭按钮" title={Intl.get('common.app.status.close', '关闭')} onClick={onVisibleChange.bind(this, false)}/>
            </div>
        );
    }

    render() {
        let {...props} = this.props;
        props.overlayClassName = classNames('avatar-popover-container', props.overlayClassName);

        if(!props.trigger) {
            props.trigger = 'click';
        }

        if(!props.placement) {
            props.placement = 'bottomLeft';
        }

        props.content = this.renderContent(props.content, props.onVisibleChange);

        return (
            <Popover {...props}>
                {props.children}
            </Popover>
        );
    }
}

export default AvatarPopoverTip;