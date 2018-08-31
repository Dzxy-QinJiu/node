var PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/7/5.
 */
require('./index.less');
class NoDataIconTip extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="no-data-icon-tip-container">
                <div className="iconfont icon-no-data"/>
                <div className='tip-text'>{this.props.tipContent}</div>
            </div>);
    }
}

NoDataIconTip.defaultProps = {};
NoDataIconTip.propTypes = {
    tipContent: PropTypes.string,
};
export default NoDataIconTip;
