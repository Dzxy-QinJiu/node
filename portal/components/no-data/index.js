/**
 * Created by hzl on 2019/9/27.
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