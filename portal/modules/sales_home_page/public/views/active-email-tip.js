/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/19.
 */
import { Alert, Button ,Icon} from 'antd';
import classNames from "classnames";
function noop() {}
class ActiveEmailTip extends React.Component {
    constructor(props){
        super (props);
        this.state = {
            isAnimateShow: this.props.isAnimateShow,
            isAnimateHide: this.props.isAnimateHide,
            setWebConfigStatus: this.props.setWebConfigStatus
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isAnimateShow != this.props.isAnimateShow ) {
            this.setState({
                isAnimateShow: nextProps.isAnimateShow
            });
        }
        if (nextProps.isAnimateHide != this.props.isAnimateHide ) {
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
                {this.props.addEmail ? <ReactIntl.FormattedMessage
                    id="sales.add.email.info"
                    defaultMessage={`请到{userinfo}页面添加邮箱，否则将会无法接收用户申请的邮件。`}
                    values={{
                        'userinfo': <span className="jump-to-userinfo" onClick={this.props.jumpToUserInfo}>
                            {Intl.get("user.info.user.info","个人资料")}
                        </span>
                    }}
                /> : <div>
                    <span>
                        {Intl.get("sales.frontpage.active.info","请激活邮箱，以免影响收取审批邮件！")}
                    </span>
                    <Button type="primary" size="small" onClick={this.props.activeUserEmail}>{Intl.get("sales.frontpage.active.email","激活邮箱")}</Button>
                    <span className="no-tip" onClick={this.props.handleClickNoTip}>
                        {Intl.get("sale.homepage.no.tip.more","不再提示")}
                        {this.state.setWebConfigStatus === "loading" ? <Icon type="loading"/> : null}
                    </span>
                </div>}

            </div>
        );
        return (
            <div className={cls}>
                <Alert message={warningText} type="warning" showIcon />
            </div>);
    }
}
ActiveEmailTip.defaultProps = {
    isAnimateShow: false,
    isAnimateHide: false,
    setWebConfigStatus: "",
    handleClickNoTip: noop,
    activeUserEmail: noop,
    jumpToUserInfo: noop
};
export default ActiveEmailTip;