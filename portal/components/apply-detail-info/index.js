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
    render() {
        var iconCls = 'iconfont ' + this.props.iconClass;
        var infoCls = 'user-info-text ' + this.props.textCls;
        return (
            <div className="apply-detail-customer apply-detail-info">
                <div className="customer-icon-block">
                    <span className={iconCls}/>
                </div>
                <div className="customer-info-block apply-info-block">
                    <div className="apply-info-content">
                        {_.map(this.props.showApplyInfo, (InfoItem) => {
                            return (
                                <div className="apply-info-label">
                                    {InfoItem.label ?
                                        <div className="user-info-label">
                                            {InfoItem.label}:
                                        </div>
                                        : null}

                                    <div className={infoCls}>
                                        {_.isFunction(InfoItem.renderText) ? InfoItem.renderText() :
                                            InfoItem.text
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>);
    }
}
ApplyDetailInfo.defaultProps = {
    showApplyInfo: {},
    iconClass: '',
    textCls: ''
};
ApplyDetailInfo.propTypes = {
    showApplyInfo: PropTypes.object,
    iconClass: PropTypes.string,
    textCls: PropTypes.string,

};

export default ApplyDetailInfo;