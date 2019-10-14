/**
 * Created by hzl on 2019/9/27.
 * 加载空状态的展示
 * 用法：
 * <NoData
 *  textContent={*******}
 * />
 * 属性说明：
 * textContent 空状态描述信息
 */

import './index.less';

class NoData extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="no-data-intro-wrap">
                <div className="no-data-intro-img"></div>
                <p className="no-data-tip">
                    {this.props.textContent}
                    {
                        this.props.isOperate ? (
                            <span>
                                ，
                                <a onClick={this.props.operateFun}>
                                    {this.props.operateText}
                                </a>
                            </span>

                        ) : null
                    }
                </p>
            </div>
        );
    }
}

const noop = function() {
};

NoData.defaultProps = {
    textContent: '',
    isOperate: false,
    operateText: '',
    operateFun: noop
};

NoData.propTypes = {
    textContent: PropTypes.string,
    isOperate: PropTypes.boolean,
    operateText: PropTypes.string,
    operateFun: PropTypes.func
};
export default NoData;