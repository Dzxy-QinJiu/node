/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/9/23.
 */

exports.withErrorHandler = (Component, errorTip) => {
    class WithErrorHandler extends React.Component {
        constructor() {
            super();
            // Construct the initial state
            this.state = {
                hasError: false,
                error: null,
                errorInfo: null
            };
        }

        componentDidCatch(error, info) {
            // Update state if error happens
            this.setState({hasError: true, error, errorInfo: info});

            // Report errors
            // errorCallback(error, info, this.props);
        }

        render() {
            // if state contains error we render fallback component
            if (this.state.hasError) {
                return errorTip || Intl.get('common.render.error', '界面渲染出错了');
            }

            return (<Component {...this.props} />);
        }
    }
    WithErrorHandler.displayName = `withErrorHandler(${Component.displayName})`;
    return WithErrorHandler;
};