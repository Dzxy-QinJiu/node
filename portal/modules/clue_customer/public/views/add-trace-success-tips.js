
/**
 * Created by hzl on 2020/2/29.
 */
import {GIFT_LOGO} from 'PUB_DIR/sources/utils/consts';
require('../css/add-trace-success-tips.less');

class AddTraceContentSuccessTips extends React.Component {
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
            <div className="tips-wrap">
                {
                    this.state.show ? (
                        <div className="content">
                            <img className="gift-logo" src={GIFT_LOGO} />
                            <span className="tips">
                                太棒了 ，跟进成功！线索提取量
                                <span className="number">+2</span>
                            </span>
                        </div>
                    ) : null
                }
            </div>
        );
    }
}


AddTraceContentSuccessTips.defaultProps = {
    time: 2000, // 默认时间是2s
    onHide: () => {
    },
};

AddTraceContentSuccessTips.propTypes = {
    time: PropTypes.number,
    onHide: PropTypes.func,
};

export default AddTraceContentSuccessTips;