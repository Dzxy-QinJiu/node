import './clue-strategy-card.less';

import CardItem from'./cardItem';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';

const DELETE_CREATEREALM_DELAYTIME = 4000;//超时时间

class ClueStrategyCard extends React.Component {
    constructor(props) {
        super(props);
    }

    showCardInfo = (event) => {
        Trace.traceEvent(event, '查看线索分配策略详情');
        let curCard = this.props.curCard;
        let eventCls = event.target.className;
        //点删除按钮时，不触发打开下详情的事件
        if (eventCls && eventCls.indexOf('icon-delete') !== -1) return;
        //curCard.id =='' 如果是在创建中的安全域card是不能点击的
        if ((eventCls && eventCls.indexOf('icon-role-auth-config') >= 0) || curCard.id === '') {
            return;
        }
        this.props.showCardInfo(curCard);
    };

    //删除card
    deleteItem = (id, event) => {
        event.stopPropagation();
        this.props.deleteItem && this.props.deleteItem(id);
    };

    render() {
        //当前要展示的卡片
        let card = this.props.curCard;
        //线索分配策略卡片列表
        let cardItems = [];

        for (let key in card) {
            if (card[key] instanceof Object && card[key].showOnCard) {
                cardItems.push(<CardItem key={key} cardItem={card[key]}/>);
            }
        }

        if (card.createMsg === 'error') {
            //右上角通知DELETE_CREATEREALM_DELAYTIME 秒后关闭，在通知关闭后再在页面上移除创建失败的安全域card
            setTimeout(() => {
                this.props.removeFailRealm(card.taskId);
            }, DELETE_CREATEREALM_DELAYTIME);
        }
        let singleCard = classNames('single-card strategy', {
            'selected': this.props.isSelect
        });
        let cardTitle = classNames('card-title', {
            'card-disable': _.isEqual(card.status, 'disable')
        });
        return (
            <div className="card-layout-container strategy-card" style={{width: this.props.cardWidth}}>
                <div className="card-box" onClick={this.showCardInfo}>
                    {card.id ? null : (
                        <div className="card-stop-layer">
                            <div className="building-icon">
                                <ReactIntl.FormattedMessage id="member.is.building" defaultMessage="创建中"/>
                            </div>
                        </div>
                    )}
                    <div className={singleCard}>
                        <div className="card-content">
                            <div className={cardTitle} title={card.name}>{card.name}</div>
                            {cardItems}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ClueStrategyCard.defaultProps = {
    cardWidth: 'auto'
};
ClueStrategyCard.propTypes = {
    cardWidth: PropTypes.string,
    curCard: PropTypes.object,
    isSelect: PropTypes.bool,
    unselectCard: PropTypes.func,
    selectCard: PropTypes.func,
    removeFailRealm: PropTypes.func,
    showCardInfo: PropTypes.func,
    deleteItem: PropTypes.func,
    imgUrl: PropTypes.string,
    showDelete: PropTypes.bool
};
module.exports = ClueStrategyCard;
