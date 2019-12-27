import differentVersionAction from '../public/action/different-version-action';
import differentVersionStore from '../public/store/different-version-store';
import ColsLayout from 'CMP_DIR/cols-layout';
import {paymentEmitter} from 'PUB_DIR/sources/utils/emitters';
import ApplyTry from 'MOD_DIR/apply_try/public';
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import {COMPANY_PHONE} from 'PUB_DIR/sources/utils/consts';
import {Button} from 'antd';

require('./css/index.less');

export default class DifferentVersion extends React.PureComponent {
    state = {
        versionItems: [],
        showApply: false,
        width: document.body.clientWidth - 75,
        wrapperWidth: document.body.clientWidth > 1536 ? document.body.clientWidth - 126 : 1410,
        showFlag: this.props.showFlag,
        maxHeight: 0,
        versionKind: ''
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
        closePath: PropTypes.string, //点击关闭以后的跳转路径
        closeVersion: PropTypes.func, //关闭函数
        showFlag: PropTypes.bool, //版本信息面板是否显示
        continueFn: PropTypes.func, //个人版购买支付成功后，点击提取线索的回调函数
    }
    onChange = () => {
        this.setState({...differentVersionStore.getState()},() => {
            //获取height值最大的version-item-features-wrapper，然后将最大值赋给每一个version-item-features-wrapper
            let maxHeight = this.state.maxHeight; 
            _.each($('.version-item-features-wrapper') , ele => {
                if(maxHeight < ele.offsetHeight){
                    maxHeight = ele.offsetHeight;
                }
            });
            this.setState({
                maxHeight: maxHeight
            },() => {
                $('.version-item-features-wrapper').css('height', maxHeight + 'px');
            });
        });
    }
    componentDidMount() {
        differentVersionStore.listen(this.onChange);
        differentVersionAction.getAllVersions(this.getVersionFunctionsById);
        $(window).on('resize', this.resizeHandler);
    }
    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(nextProps.showFlag, this.props.showFlag)) {
            this.setState({showFlag: nextProps.showFlag});
        }
    }
    componentWillUnmount() {
        differentVersionStore.unlisten(this.onChange);
        $(window).off('resize', this.resizeHandler);
    }
    getVersionFunctionsById = (idArr) => {
        _.each(idArr, id => {
            differentVersionAction.getVersionFunctionsById(id); 
        });
    }
    handlePayBtn = () => { //点击购买按钮
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
            continueFn: _.isFunction(this.props.continueFn) && this.props.continueFn  
        });
    }
    handleApplyBtn = (item) => { //点击申请试用按钮
        this.setState({
            showApply: !this.state.showApply,
            versionKind: item.version_kind
        });
    }
    hideApply = () => { //关闭申请页面
        this.setState({
            showApply: !this.state.showApply
        });
    }
    closeVersion = () => { //关闭面板
        _.isFunction(this.props.closeVersion) && this.props.closeVersion();
    }

    renderVersionItem() { //渲染每一个版本模块，返回一个jsx数组
        const versionData = this.state.versionData;
        return _.isArray(versionData) && versionData.map((versionItem, versionIndex) => {
            return <div className='version-item' key={versionItem.versionId} >
                <div className='version-item-header'>
                    <span className='version-item-name'>
                        {versionItem.versionName === '基础版' && <img className='version-item-img' src={[require('./img/version-basic-level-company@2x.png')]}/>}
                        {versionItem.versionName === '专业版' && <img className='version-item-img' src={[require('./img/version-professional-level-company@2x.png')]}/>}
                        {versionItem.versionName === '企业版' && <img className='version-item-img' src={[require('./img/version-company-level-company@2x.png')]}/>}
                        {versionItem.versionName}
                        {versionItem.type === '企业' && <span className='version-item-type'>({versionItem.type})</span>}
                        <span className='version-show-call'>{Intl.get('versions.please.call.phone', '请拨打{phone}', {phone: COMPANY_PHONE})}</span>
                    </span>
                    {versionItem.cost ? <div className='version-item-cost-wrapper'>
                        <span className='version-item-cost'>{versionItem.cost}</span>
                        {Intl.get('versions.personal.price','元/月')}</div> : null}
                </div>
                <div className='version-item-clues-recommend'><span className='version-item-clues-recommend-number'>{versionItem.recommendClues}</span>{Intl.get('versions.monthly.clues.recommend','条/月线索推荐')}</div>
                <div className='version-btn-wrapper'>
                    {versionItem.cost ? <Button className='version-pay-btn' type="primary" onClick={this.handlePayBtn} >{
                        checkVersionAndType().isPersonalFormal ?
                            Intl.get('payment.renewal','续费') :
                            Intl.get('versions.online.pay','在线购买')
                    }</Button> : null}
                    {versionItem.applyTry &&
                        <Button type="primary" onClick={this.handleApplyBtn.bind(this,versionItem)} className='version-apply-try-btn' >{Intl.get('versions.apply.try','体验{version}',{version: versionItem.versionName})}</Button>}
                </div>
                
                <div className='version-item-add-feature'>
                    {versionIndex > 0 ?
                        Intl.get('versions.compare.add.features','比{versionName}增加以下功能:',{versionName: versionData[versionIndex - 1]['versionName']}) :
                        Intl.get('versions.compare.add.features','比{versionName}增加以下功能:',{versionName: '个人版'})
                    }
                </div>
                <div className='version-item-features-wrapper'>
                    {_.map(versionItem.features, (featureItem, featureIndex) => {
                        return <div className='version-item-feature-item' key={featureIndex}>
                            <h4 className='version-item-feature-item-title'>{featureItem.featureName}</h4>
                            <div className='version-item-feature-item-children'>
                                {featureItem.featureChildren && _.map(featureItem.featureChildren, (featureChild,index) => {
                                    return (
                                        <div className='version-item-feature-item-child-have' key={index}>
                                            <i className='iconfont icon-versions-feature-item'/>&nbsp;
                                            {featureChild.featureChildName}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>;
                    })}
                </div>
            </div>;
        });
    }
    
    render() {
        return (<RightPanel className='different-versions-right-panel' showFlag={this.state.showFlag} style={{width: this.state.width + 'px'}}>
            <GeminiScrollbar>   
                {this.state.errorMessage ?
                    <div>{this.state.errorMessage}</div> :
                    (<ColsLayout
                        commonData={this.renderVersionItem()}
                        width={this.state.wrapperWidth}
                        itemWidth={360}
                    >
                        <i className="iconfont icon-close-wide different-version-close" title={Intl.get('common.app.status.close', '关闭')} onClick={this.closeVersion}/>
                    </ColsLayout>)
                }
                {this.state.showApply ? <ApplyTry hideApply={this.hideApply} destroyOnClose versionKind={this.state.versionKind}/> : null}
                
            </GeminiScrollbar>
        </RightPanel>);
    }
}