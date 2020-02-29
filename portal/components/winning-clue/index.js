/**
 * Created by hzl on 2020/2/29.
 */

import { Popover, Button} from 'antd';
require('./index.less');

class WinningClue extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            visible: false,
        };
    }

    getRewardedCluesCount = () => {
        $.ajax({
            url: '/rest/rewarded/clues/count',
            type: 'get',
            dateType: 'json',
            success: (count) => {
                this.setState({count});
            },
        });
    }

    componentDidMount() {
        this.getRewardedCluesCount(); // 获取已奖励的线索数量
    }

    handleClickClose = () => {
        this.setState({
            visible: false,
        });
    }

    renderPopoverTitle = () => {
        return (
            <div className="winning-clue-title">
                <span>写跟进，领线索</span>
                <i className='iconfont icon-close' onClick={this.handleClickClose} />
            </div>
        );
    }

    renderPopoverContent = () => {
        return (
            <div className="winning-clue-container">
                <div className="content">
                    <ol>
                        <li>1.每跟进一条线索， 线索提取量 <span className="number">+2</span></li>
                        <li>2.每天最多可获得<span className="number">80</span>条线索提取量 </li>
                        <li>3.活动截止时间为3月31日</li>
                    </ol>
                </div>
                <div className="tips">
                    今日已获得<span className="number">{this.state.count}</span>条，快去跟进你的线索吧！
                </div>
                <div className="owner">以上活动解释权为客套智能科技有限公司</div>
            </div>
        );
    }

    handleVisibleChange = (visible) => {
        this.setState({visible});
    }

    render() {
        return (
            <Popover
                title={this.renderPopoverTitle()}
                content={this.renderPopoverContent()}
                placement={this.props.placement}
                trigger={this.props.trigger}
                visible={this.state.visible}
                onVisibleChange={this.handleVisibleChange}
                overlayClassName="winning-clue-popover"
            >
                {
                    this.props.isShowText ? (
                        <Button>
                            <i className='iconfont icon-gift' />
                            <span className="text">领线索</span>
                        </Button>
                    ) : (
                        <i className='iconfont icon-gift'/>
                    )
                }
            </Popover>
        );
    }
}

WinningClue.defaultProps = {
    placement: 'right',
    trigger: 'hover',
    isShowText: false
};

WinningClue.propTypes = {
    placement: PropTypes.string,
    trigger: PropTypes.string,
    isShowText: PropTypes.bool
};

export default WinningClue;