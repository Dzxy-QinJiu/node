/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/31.
 *
 * 方形的图标，没有logo时用name的第一个字来代替
 */
require('./css/square-logo.less');
class SquareLogo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let name = this.props.name || '';
        let logo = this.props.logo || '';
        return (
            <span className="square-logo-wrap">
                {logo ?
                    (<img className="square-logo" src={logo} alt={name}/>)
                    : (<span className="square-logo-font">{name.substr(0, 1)}</span>)
                }
            </span>);
    }
}
SquareLogo.defaultProps = {
    logo: '',
    name: ''
};
const PropTypes = React.PropTypes;
SquareLogo.propTypes = {
    logo: PropTypes.string,
    name: PropTypes.string
};
export default SquareLogo;