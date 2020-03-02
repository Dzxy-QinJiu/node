/**
 * Created by hzl on 2020/2/29.
 */

import { showWiningClueEmitter, clueEmitter } from 'PUB_DIR/sources/utils/emitters';
require('./index.less');

class WinningClue extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
        };
    }

    getRewardedCluesCount = () => {
        const data = {
            award_type: 'lead_followup',
            start: moment().startOf('day').valueOf(),
            end: moment().endOf('day').valueOf(),
        };
        $.ajax({
            url: '/rest/rewarded/clues/count',
            type: 'get',
            dateType: 'json',
            data: data,
            success: (count) => {
                this.setState({count});
            },
        });
    }

    componentDidMount() {
        showWiningClueEmitter.on(showWiningClueEmitter.SHOW_WINNING_CLUE, this.getRewardedCluesCount); // 获取已奖励的线索数量
    }

    componentWillUnmount() {
        showWiningClueEmitter.removeListener(showWiningClueEmitter.SHOW_WINNING_CLUE, this.getRewardedCluesCount);
    }


    handleClickExtractClue = () => {
        clueEmitter.emit(clueEmitter.SHOW_RECOMMEND_PANEL);
    }

    handleClickClose = () => {
        this.props.handleClickClose(false);
    }

    renderContent = () => {
        let count = this.state.count;
        return (
            <React.Fragment>
                <div className="title">
                    <span>写跟进，领线索</span>
                    <i className='iconfont icon-close' onClick={this.handleClickClose}/>
                </div>
                <div className="content-container">
                    <div className="content">
                        <ol>
                            <li>1.每跟进一条线索， 线索提取量 <span className="number">+2</span></li>
                            <li>2.每天最多可获得<span className="number">80</span>条线索提取量 </li>
                            <li>3.活动截止时间为3月31日</li>
                        </ol>
                    </div>
                    <div className="tips">
                        {
                            count && this.props.isNavBar ? (
                                <span>
                                今日已获得<span className="number">{count}</span>条线索，去
                                    <span onClick={this.handleClickExtractClue} className="extract-clue">
                                     提取线索
                                    </span>
                                </span>
                            ) : (
                                <span>
                                今日已获得<span className="number">{count}</span>条，快去跟进你的线索吧
                                </span>
                            )
                        }
                    </div>
                    <div className="owner">以上活动解释权为客套智能科技有限公司</div>
                </div>
            </React.Fragment>
        );
    }
    render() {
        return (
            <div className="winning-clue-container">
                {this.renderContent()}
            </div>
        );


    }
}

WinningClue.defaultProps = {
    isNavBar: false,
    handleClickClose: () => {}
};

WinningClue.propTypes = {
    isNavBar: PropTypes.bool,
    handleClickClose: PropTypes.func,
};

export default WinningClue;