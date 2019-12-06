import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {Input} from 'antd';
require('./css/index.less');

export default class index extends Component {
    state={
        successFlag: false
    }

    static propTypes = {
        hideApply: PropTypes.func
    }

    handleApplyClick = () => {
        this.setState({
            successFlag: !this.state.successFlag 
        });
    }

    handleClose = () => {
        this.props.hideApply();
    }

    renderApplyTryContent(){
        return <div className='apply-try-content'>
            {this.renderApplyTryTitle()}
            {this.state.successFlag ? this.renderApplySuccess() : (
                <div className='apply-try-content-wrapper'>
                    <div className='apply-try-content-title'>申请试用</div>
                    <div className='apply-try-content-componey'>
                        <span>公司名称</span>
                        <Input className='apply-try-content-componey-input'></Input>
                    </div>
                    <div className='apply-try-content-useNumber-wrapper'>
                        <span>使用人数</span>
                        <button className='apply-try-content-useNumber'>5人以下</button>
                        <button className='apply-try-content-useNumber'>6-10人</button>
                        <button className='apply-try-content-useNumber'>11-20人</button>
                        <button className='apply-try-content-useNumber'>20人以上</button>
                    </div>
                    <button className='apply-try-content-apply-btn' onClick={this.handleApplyClick}>申请</button>
                </div>
            )}
            
        </div>;
    }
    renderApplyTryTitle(){
        return (<div className='apply-try-header'>
            <div className='apply-try-header-title'>拨打400-6978-520可快速申请试用</div>
            <div className='apply-try-header-close' onClick={this.handleClose}>×</div>
        </div>);
    }
    renderApplySuccess(){
        return <div className='apply-try-success-wrapper'>
            <div className='apply-try-success-icon'></div>
            <div className='apply-try-success-title'>申请成功</div>
            <div className='apply-try-success-content'>稍后会有客户经理专门为您服务</div>
        </div>;
    }
    renderApplyTry(){
        return<RightPanelModal
            content={this.renderApplyTryContent()}
            width='300'/>;
    }
    render() {
        return <div className='apply-try-wrapper'>
            {this.renderApplyTry()}
        </div>;
    }
}
