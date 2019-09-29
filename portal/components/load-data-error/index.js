/**
 * Created by hzl on 2019/9/29.
 * 数据加载失败的展示
 * 用法：
 * <LoadDataError
 *  retryLoadData={function(){}}
 * />
 * 属性说明：
 * retryLoadData属性是重新获取数据的方法
 */
import './index.less';

class LoadDataError extends React.Component {
    constructor(props) {
        super(props);
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
                                onClick={this.props.retryLoadData}>{Intl.get('common.refresh', '刷新')}</a>
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