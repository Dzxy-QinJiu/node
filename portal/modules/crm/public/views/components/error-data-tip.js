/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/7.
 */
require("./css/error-data-tip.less");
import {Icon} from "antd";
class ErrorDataTip extends React.Component {
    constructor(props) {
        super(props);
    }

    retryFunc() {
        if (_.isFunction((this.props.retryFunc))) {
            this.props.retryFunc();
        }
    }

    render() {
        return (
            <div className="error-data-tip">
                <Icon type="close-circle"/>
                <span className="error-tip-msg">{this.props.errorMsg || ""},
                    {this.props.isRetry ? (
                        <a onClick={this.retryFunc.bind(this)}>
                            <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
                        </a>
                    ) : null}
                   </span>
            </div>
        );
    }
}

ErrorDataTip.defaultProps = {
    errorMsg: "",//错误提示
    isRetry: false,//是否重试
    retryFunc: function () {
        //点击重试时调用的方法
    }
};

export default ErrorDataTip;