import './clue-strategy-card.less';

import CardItem from'CMP_DIR/card/cardItem';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';

class ClueStrategyCard extends React.Component {
    constructor(props) {
        super(props);
    }

    showCardInfo = (event) => {
        Trace.traceEvent(event, '查看线索分配策略详情');
        let curCard = this.props.curCard;
        this.props.showCardInfo(curCard);
    };

    render() {
        //当前要展示的卡片
        let card = this.props.curCard;
        //线索分配策略卡片列表
        let cardItems = [];

        for (let key in card) {
            if (_.get(card[key], 'showOnCard')){
                cardItems.push(<CardItem key={key} cardItem={card[key]}/>);
            }
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
    showCardInfo: PropTypes.func,
};
module.exports = ClueStrategyCard;
