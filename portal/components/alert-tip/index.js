/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/1.
 */
import { Alert, Button ,Icon} from 'antd';
import classNames from 'classnames';
require('./index.less');
function noop() {}
class AlertTip extends React.Component {
    constructor(props){
        super (props);
        this.state = {
            isAnimateShow: this.props.isAnimateShow,
            isAnimateHide: this.props.isAnimateHide,
            setWebConfigStatus: this.props.setWebConfigStatus
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isAnimateShow !== this.props.isAnimateShow ) {
            this.setState({
                isAnimateShow: nextProps.isAnimateShow
            });
        }
        if (nextProps.isAnimateHide !== this.props.isAnimateHide ) {
            this.setState({
                isAnimateHide: nextProps.isAnimateHide
            });
        }
        if (nextProps.setWebConfigStatus !== this.props.setWebConfigStatus){
            this.setState({
                setWebConfigStatus: nextProps.setWebConfigStatus
            });
        }
    }
    render(){
        //外层父组件加载完成后再由上到下推出提示框
        var cls = classNames('active-email-tip-container',{
            'animate-show': this.state.isAnimateShow,
            'animate-hide': this.state.isAnimateHide
        });
        var warningText = (
            <div>
                {this.props.alertTipMessage}
                {this.props.showNoTipMore ? <span className="no-tip" onClick={this.props.handleClickNoTip}>
                    <i className="iconfont icon-close"></i>
                    {Intl.get('sale.homepage.no.tip.more', '不再提示')}
                    {this.state.setWebConfigStatus === 'loading' ? <Icon type="loading"/> : null}
                </span> : null}

            </div>
        );
        return (
            <div className={cls}>
                <Alert message={warningText} type="warning" showIcon />
            </div>);
    }
}
AlertTip.defaultProps = {
    alertTipMessage: '',
    isAnimateShow: false,
    isAnimateHide: false,
    setWebConfigStatus: '',
    showNoTipMore: true,
    handleClickNoTip: noop,
};

AlertTip.propTypes = {
    alertTipMessage: PropTypes.string,
    isAnimateShow: PropTypes.bool,
    isAnimateHide: PropTypes.bool,
    setWebConfigStatus: PropTypes.string,
    showNoTipMore: PropTypes.bool,
    handleClickNoTip: PropTypes.func
};
export default AlertTip;