/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import './style.less';

class EfLoading extends React.Component {
    render() {
        if(this.props.isShow) {
            return (
                <div className="ef-loading">
                    <span className={`ef-loading-icon ${this.props.size}`}>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                    </span>
                    {this.props.tip ? (<span className="ef-loading-tip">{this.props.tip}</span>) : null}
                </div>
            );
        }
        return null;
    }
}

EfLoading.defaultProps = {
    isShow: true,
    tip: '',
    size: ''
};
EfLoading.propTypes = {
    isShow: PropTypes.bool,
    size: PropTypes.string,
    tip: PropTypes.string,
};
export default EfLoading;