/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/30.
 */
import ApplyLoading from '../apply-loading';
import ApplyError from '../apply-error';
import ApplyNoData from '../apply-no-data';
class ApplyDetailStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render(){
        if (this.props.showLoading) {
            return <ApplyLoading/>;
        }else if (this.props.showErrTip) {
            return <ApplyError
                errMsg={this.props.errorMsg}
                retryFetchDetail={this.props.retryFetchDetail}
            />;
        }else if (this.props.showNoData) {
            return (
                <ApplyNoData/>
            );
        }else {
            return null;
        }
    }
}
ApplyDetailStatus.defaultProps = {
    showNoData: false,
    showLoading: false,
    showErrTip: false,
    errorMsg: '',
    retryFetchDetail: function(){

    }
};
ApplyDetailStatus.propTypes = {
    showNoData: PropTypes.bool,
    showLoading: PropTypes.bool,
    showErrTip: PropTypes.bool,
    errorMsg: PropTypes.string,
    retryFetchDetail: PropTypes.func,
};

export default ApplyDetailStatus;
