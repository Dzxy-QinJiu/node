import React, { PureComponent } from 'react';
import differentVersionAction from '../public/action/different-version-action';
import differentVersionStore from '../public/store/different-version-store';
import PropTypes from 'prop-types';
import ColsLayout from 'CMP_DIR/cols-layout';
import {paymentEmitter} from 'PUB_DIR/sources/utils/emitters';
import history from 'PUB_DIR/sources/history';
import ApplyTry from 'MOD_DIR/apply_try/puiblic';
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';


require('./css/index.less');

export default class DifferentVersion extends PureComponent {
    state = {
        versionItems: [],
        showApply: false,
        showCall: false,
        showCallKey: null,
        width: document.body.clientWidth - 75,
        wrapperWidth: document.body.clientWidth > 1536 ? document.body.clientWidth - 126 : 1410,
        showFlag: true
    };

    resizeHandler = () => {
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
            this.setState({
                width: document.body.clientWidth - 75
            });
        }, 100);
    };

    static propTypes = {
        nowVersion: PropTypes.string, //当前版本,不传值则认为是试用版 
        closePath: PropTypes.string, //点击关闭以后的跳转路径
        closeVersion: PropTypes.func //关闭函数
    }
    onChange = () => {
        this.setState({...differentVersionStore.getState()});
    }
    componentDidMount() {
        differentVersionStore.listen(this.onChange);
        differentVersionAction.getAllVersions();
        document.onclick = this.cancleConnectWrapper;
        $(window).on('resize', this.resizeHandler);
    }
    componentWillUnmount() {
        differentVersionStore.unlisten(this.onChange);
        $(window).off('resize', this.resizeHandler);
    }
    cancleConnectWrapper = () => {//点击document隐藏联系销售
        this.setState({
            showCall: false
        });
    }
    showConnectWrapper = e => {
        e.nativeEvent.stopImmediatePropagation();
    }
    handleConnectBtn = (n,e) => { //点击联系销售按钮
        this.setState({
            showCall: !this.state.showCall,
            showCallKey: n
        });
        e.nativeEvent.stopImmediatePropagation();
    }
    handlePayBtn = () => { //点击购买按钮
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
            continueFn: () => {
                history.push('/clue_customer');
            }
        });
    }
    handleApplyBtn = () => {//点击申请试用按钮
        this.setState({
            showApply: !this.state.showApply
        });
    }
    hideApply = () => {//关闭申请页面
        this.setState({
            showApply: !this.state.showApply
        });
    }
    closeVersion = () => { //关闭面板
        this.setState({
            showFlag: false
        });
    }

    renderVersionItem() { //渲染每一个版本模块，返回一个jsx数组
        const versionData = this.state.versionData;
        return _.map(versionData, (versionItem) => {
            return <div className='version-item' key={versionItem.versionId} >
                <div className='version-item-header'>
                    <div className='version-item-name'>{versionItem.versionName}</div>
                    {versionItem.cost ? <div className='version-item-cost-wrapper'>
                        <span className='version-item-cost'>{versionItem.cost}</span>
                        元/月</div> : null}
                    {versionItem.beginSale ? <div className='version-item-begin-sale-wrapper'>
                        <span className='version-item-begin-sale'>{versionItem.beginSale}</span>
                    人起售</div> : null}
                </div>
                <div className='version-item-clues-recommend'><span>{versionItem.recommendClues}</span>条/月线索推荐</div>
                <div className='version-btn-wrapper'>
                    <button className='version-connect-btn' onClick={this.handleConnectBtn.bind(this,versionItem.versionId)}>联系销售</button>
                    {versionItem.cost ? <button className='version-pay-btn' onClick={this.handlePayBtn}>在线购买</button> : null}
                    {versionItem.applyTry ? <button className='version-apply-try-btn' onClick={this.handleApplyBtn}>申请试用</button> : null}
                </div>
                {this.state.showCall && this.state.showCallKey === versionItem.versionId ? <div className='version-show-call' onClick={this.showConnectWrapper}>请拨打400-6978-520</div> : null}
                <div className='version-item-features-wrapper'>
                    <GeminiScrollbar>
                        {_.map(versionItem.features, (featureItem, featureIndex) => {
                            return <div className='version-item-feature-item' key={featureIndex}>
                                <h4 className='version-item-feature-item-title'>{featureItem.featureName}</h4>
                                <div className='version-item-feature-item-children'>
                                    {featureItem.featureChildren && _.map(featureItem.featureChildren, (featureChild,index) => {
                                        let featureChildClass = featureChild.type === 'add' ? 'version-item-feature-item-child-add' : 'version-item-feature-item-child-have';
                                        return (
                                            <div className={featureChildClass} key={index}>{featureChild.featureChildName}</div>
                                        );
                                    })}
                                </div>
                            </div>;
                        })}
                    </GeminiScrollbar>
                </div>
            </div>;
        });
    }
    
    render() {
        return (<RightPanel className='different-versions-right-panel' showFlag={this.state.showFlag} style={{width: this.state.width + 'px'}}>
            <GeminiScrollbar>
                <i className="iconfont icon-close-wide different-version-close" onClick={this.closeVersion}></i>
                {this.state.errorMessage ?
                    <div>{this.state.errorMessage}</div> :
                    <ColsLayout
                        commonData={this.renderVersionItem()}
                        width={this.state.wrapperWidth}
                        itemWidth={310}
                    />
                }
                {this.state.showApply ? <ApplyTry hideApply={this.hideApply} destroyOnClose/> : null}
            </GeminiScrollbar>
        </RightPanel>);
    }
}