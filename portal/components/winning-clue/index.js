/**
 * Created by hzl on 2020/2/29.
 */

import { showWiningClueEmitter, clueEmitter } from 'PUB_DIR/sources/utils/emitters';
import {getRewardedCluesCount} from 'PUB_DIR/sources/utils/common-data-util';
import history from 'PUB_DIR/sources/history';
import Trace from 'LIB_DIR/trace';
const ROUTE_CONSTS = {
    LEADS: 'leads'//线索
};
require('./index.less');
class WinningClue extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            count: _.get(props, 'count', 0),
        };
    }

    getRewardedCluesCount = () => {
        getRewardedCluesCount().then( (count) => {
            this.setState({
                count: count
            });
        } );
    }

    componentDidMount() {
        showWiningClueEmitter.on(showWiningClueEmitter.SHOW_WINNING_CLUE, this.getRewardedCluesCount); // 获取已奖励的线索数量
    }

    componentWillUnmount() {
        showWiningClueEmitter.removeListener(showWiningClueEmitter.SHOW_WINNING_CLUE, this.getRewardedCluesCount);
    }


    handleClickExtractClue = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.content-container .tips'), '点击去提取');
        if(location.pathname.indexOf(ROUTE_CONSTS.LEADS) === -1) {
            history.push('/' + ROUTE_CONSTS.LEADS, {
                showRecommendCluePanel: true
            });
        }else { //如果在线索界面，不用跳转, 直接根据推荐条件打开推荐线索列表
            clueEmitter.emit(clueEmitter.SHOW_RECOMMEND_PANEL);
        }
    }

    handleClickClose = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-close'), '点击关闭领线索');
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
                    <div className="owner">
                        {Intl.get('common.company.owner', '以上活动解释权归山东客套智能科技有限公司')}
                    </div>
                </div>
            </React.Fragment>
        );
    }
    render() {
        let tracename = '领线索活动';
        if (_.has(this.props, 'count')) { // 菜单中查看
            tracename = '菜单中查看活动';
        }
        return (
            <div className="winning-clue-container" data-tracename={tracename}>
                {this.renderContent()}
            </div>
        );
    }
}

WinningClue.defaultProps = {
    count: 0,
    isNavBar: false,
    handleClickClose: () => {}
};

WinningClue.propTypes = {
    isNavBar: PropTypes.bool,
    handleClickClose: PropTypes.func,
    count: PropTypes.number
};

export default WinningClue;