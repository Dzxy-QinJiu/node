/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/26.
 */
require('./index.less');
class ApplyDetailInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount = () => {

    };
    componentWillReceiveProps = (nextProps) => {

    };
    componentWillUnmount = () => {

    };

    render() {
        return (
            <div className="apply-detail-customer apply-detail-info">
                <div className="customer-icon-block">
                    <span className="iconfont icon-leave icon-application-ico"/>
                </div>
                <div className="customer-info-block apply-info-block">
                    <div className="apply-info-content">
                        {_.map(this.props.showApplyInfo, (InfoItem) => {

                            return (
                                <div className="apply-info-label">
                                    <span className="user-info-label">
                                        {InfoItem.label}:
                                    </span>
                                    {InfoItem.canClick ? <a href="javascript:void(0)"
                                        onClick={InfoItem.handleClick}
                                    >
                                        {InfoItem.text}
                                    </a> : <span className="user-info-text" >
                                        {InfoItem.text}
                                    </span>}

                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>);
    }
}
ApplyDetailInfo.defaultProps = {
    showApplyInfo: {}
};
ApplyDetailInfo.propTypes = {
    showApplyInfo: PropTypes.object,

};

export default ApplyDetailInfo;