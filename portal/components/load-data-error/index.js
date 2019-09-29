/**
 * Created by hzl on 2019/9/29.
 */
import './index.less';

class LoadDataError extends React.Component {
    constructor(props) {
        super(props);
    }

    retryLoadData = () => {
        this.props.retryLoadData();
    }

    render() {
        return (
            <div className="load-data-error-wrap">
                <div className="load-data-error-img"></div>
                <p className="load-data-error-tip">
                    <ReactIntl.FormattedMessage
                        id="common.load.data.error"
                        defaultMessage={'加载失败，请{refresh}'}
                        values={{
                            'refresh': <a
                                onClick={this.retryLoadData}>{Intl.get('common.refresh', '刷新')}</a>
                        }}
                    />
                </p>
            </div>
        );
    }
}

LoadDataError.propTypes = {
    retryLoadData: PropTypes.func
};
export default LoadDataError;