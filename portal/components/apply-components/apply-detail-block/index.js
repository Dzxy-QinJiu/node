/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/30.
 */
class ApplyDetailBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {


        };
    }
    render(){
        var cls = 'iconfont ' + this.props.iconclass;
        return (
            <div className="apply-detail-reply-list apply-detail-info">
                <div className="reply-icon-block">
                    <span className={cls}/>
                </div>
                <div className="reply-info-block apply-info-block">
                    <div className="reply-list-container apply-info-content">
                        {this.props.renderApplyInfoContent()}
                    </div>
                </div>
            </div>
        );
    }
}
ApplyDetailBlock.defaultProps = {
    iconclass: '',
    renderApplyInfoContent: function(){
    }
};
ApplyDetailBlock.propTypes = {
    iconclass: PropTypes.string,
    renderApplyInfoContent: PropTypes.func,
};

export default ApplyDetailBlock;