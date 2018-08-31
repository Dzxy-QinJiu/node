var PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/31.
 *
 * 带logo的标签，没有logo时用name的第一个字来代替
 */
require('./css/index.less');
import SquareLogo from './square-logo';
class LogoTag extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let name = this.props.name || '';
        return (
            <div className="square-logo-tag" title={name}>
                <SquareLogo {...this.props}/>
                <span className="square-logo-tag-text">{name}</span>
            </div>);
    }
}
LogoTag.defaultProps = {
    logo: '',
    name: ''
};
LogoTag.propTypes = {
    logo: PropTypes.string,
    name: PropTypes.string
};
export default LogoTag;