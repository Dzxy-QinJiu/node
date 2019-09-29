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
                </p>
            </div>
        );
    }
}

NoData.propTypes = {
    textContent: PropTypes.string,
};
export default NoData;