/**
 * Created by hzl on 2019/9/27.
 * 加载空状态的展示
 * 用法：
 * <NoData
 *  textContent={*******}
 * />
 * 属性说明：
 * textContent 空状态描述信息
 * isOperateClick 是否需要有点击事件，默认false
 * operateClickText 点击的文本描述
 * operateClickEvent 点击事件
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
                        this.props.isOperateClick ? (
                            <span>
                                ，
                                <a onClick={this.props.operateClickEvent}>
                                    {this.props.operateClickText}
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
    textContent: '', // 空状态描述信息
    isOperateClick: false, // 是否需要有点击事件
    operateClickText: '', // 点击的文本描述
    operateClickEvent: noop // 点击事件
};

NoData.propTypes = {
    textContent: PropTypes.string,
    isOperateClick: PropTypes.boolean,
    operateClickText: PropTypes.string,
    operateClickEvent: PropTypes.func
};
export default NoData;