/**
 * Created by hzl on 2019/10/23.
 *
 * 组件标题：SavedTips返回结果信息的展示
 *
 * 适用场景: 点击保存后，操作是成功还是失败的提示
 *
 * 用法：
 *
 * <SavedTips
 *   time={3000}
 *   tipsContent={this.state.setFilterPrivateIpMsg}
 *   savedResult={this.state.setFilterPrivateResult}
 *   onHide={hide}
 *   />
 *
 * 属性说明：
 * time 提示信息显示时间，默认是2秒
 * tipsContent 提示信息内容
 * savedResult 返回结果，success或是error
 * onHide 信息不提示时，调用的函数
 */
require('./index.less');

class SavedTips extends React.Component {
    constructor(props){
        super (props);
        this.state = {
            show: true
        };
    }

    isUnmount = false;

    timer = null;

    componentDidMount() {
        this.timer = setTimeout( () => {
            if(!this.isUnmount) {
                this.setState({
                    show: false
                });
            }
            this.props.onHide();
        }, this.props.time);
    }

    componentWillUnmount() {
        this.isUnmount = true;
        clearTimeout(this.timer);
    }

    render() {
        return (
            <div className="saved-tips-wrap">
                {
                    this.state.show ? (
                        <div className="saved-tips-content">
                            {
                                this.props.savedResult === 'success' ? (
                                    <i className="iconfont icon-add-success"></i>
                                ) : (<i className="iconfont icon-saved-error-tips"></i>)}
                            <span className="tips">{this.props.tipsContent}</span>
                        </div>
                    ) : null
                }
            </div>
        );
    }
}


SavedTips.defaultProps = {
    time: 2000, // 默认时间是2s
    tipsContent: '', // 内容提示
    onHide: function() {
    },
    savedResult: '' // 保存的结果
};

SavedTips.propTypes = {
    time: PropTypes.number,
    tipsContent: PropTypes.string,
    onHide: PropTypes.func,
    savedResult: PropTypes.bool,
};

export default SavedTips;