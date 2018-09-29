/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/29.
 */
import {Alert} from 'antd';
require('./index.less');
class ApplyError extends React.Component {
    constructor(props) {
        super(props);
        this.state = {


        };
    }


    componentDidMount = () => {

    };
    componentWillReceiveProps = (nextProps) => {

    };
    componentWillUnmount = () => {

    };

    render(){
        if (this.props.showErrTip) {
            var retry = (
                <span>
                    {this.props.errMsg}，<a href="javascript:void(0)"
                        onClick={this.props.retryFetchDetail}>
                        {Intl.get('common.retry', '重试')}
                    </a>
                </span>
            );
            return (
                <div className="app_user_manage_detail apply-error-container">
                    <Alert
                        message={retry}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }
        return null;
    }
}
ApplyError.defaultProps = {
    showErrTip: false,
    errMsg: '',
    retryFetchDetail: function(){

    }
};
ApplyError.propTypes = {
    showErrTip: PropTypes.boolean,
    errMsg: PropTypes.string,
    retryFetchDetail: PropTypes.func,
};

export default ApplyError;