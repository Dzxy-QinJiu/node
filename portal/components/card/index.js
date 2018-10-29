import ContractStatistics from 'CMP_DIR/chart/contract-statistics';

/**
 * Created by wangliping on 2015/12/23.
 */
var React = require('react');
var language = require('../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./card-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./card-zh_CN.less');
}
var CardItem = require('./cardItem');
var Icon = require('antd').Icon;
var DefaultUserLogoTitle = require('../default-user-logo-title');
const DELETE_CREATEREALM_DELAYTIME = 4000;
import Trace from 'LIB_DIR/trace';

class Card extends React.Component {
    static defaultProps = {
        cardWidth: 'auto'
    };

    selectCardEvent = () => {
        var cardId = this.props.curCard.id;
        if (this.props.isSelect) {
            //之前选中，则取消选中
            this.props.unselectCard(cardId);
        } else {
            //    之前未选中，则选中
            this.props.selectCard(cardId);
        }
    };

    showCardInfo = (event) => {
        Trace.traceEvent(event, '查看应用详情');
        var curCard = this.props.curCard;
        //curCard.id =='' 如果是在创建中的安全域card是不能点击的
        if (event.target.className.indexOf('icon-role-auth-config') >= 0 || curCard.id === '') {
            return;
        }
        this.props.showCardInfo(curCard);
    };

    showRightFullScreen = (event) => {
        event.stopPropagation();
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-role-auth-config'), '查看应用角色列表和权限列表');
        this.props.showRightFullScreen(this.props.curCard);
    };

    render() {
        //当前要展示的卡片
        var card = this.props.curCard;
        var imgUrl = this.props.imgUrl;
        //用户卡片列表
        var cardItems = [];

        for (var key in card) {
            if (card[key] instanceof Object && card[key].showOnCard) {
                if (key === 'date') {
                    cardItems.push(<CardItem key={key} cardItem={card[key]} noRihtValue={true}/>);
                } else {
                    cardItems.push(<CardItem key={key} cardItem={card[key]}/>);
                }
            }
        }
        // 选择图标的样式设置
        var iconClass = 'select-icon';
        if (this.props.isSelect) {
            iconClass += ' active';
        }
        //禁用卡片的样式设置
        if (!card.status) {
            iconClass += ' select-icon-stop';
        }
        if (card.createMsg === 'error') {
            //右上角通知3s后关闭，在通知关闭后再在页面上移除创建失败的安全域card
            setTimeout(() => {
                this.props.removeFailRealm(card.taskId);
            }, DELETE_CREATEREALM_DELAYTIME);
        }
        var userName = card.userName ? card.userName.value : '';
        return (
            <div className="card-layout-container " style={{width: this.props.cardWidth}}>
                <div className="card-box" onClick={this.showCardInfo}>
                    <div className="card-stop-layer" style={{display: card.status === 0 ? 'block' : 'none'}}>
                        <div className="card-stop-bg"></div>
                        <div className="stop-icon">
                            <ReactIntl.FormattedMessage id="common.stop" defaultMessage="停用"/>
                        </div>
                        <div className="stop-triangle"></div>
                    </div>
                    {card.id ? null : (
                        <div className="card-stop-layer">
                            <div className="card-stop-bg"></div>
                            <div className="building-icon">
                                <ReactIntl.FormattedMessage id="member.is.building" defaultMessage="创建中"/>
                            </div>
                            <div className="stop-triangle"></div>
                        </div>
                    )}
                    <div className="single-card">
                        <div className="img-container">
                            <DefaultUserLogoTitle
                                userName={userName}
                                nickName={card.name}
                                userLogo={imgUrl}
                            >
                            </DefaultUserLogoTitle>
                        </div>
                        <div className="card-content">
                            <div className="card-title" title={card.name}>{card.name}</div>
                            {cardItems}
                        </div>

                        <Icon className={iconClass} type="check-circle-o"
                            style={{display: this.props.bulkOpersShow ? 'block' : 'none'}}
                            onClick={this.selectCardEvent}/>
                    </div>
                </div>
            </div>
        );
    }
}

Card.propTypes = {
    cardWidth: PropTypes.string,
    curCard: PropTypes.object,
    isSelect: PropTypes.boolean,
    unselectCard: PropTypes.func,
    selectCard: PropTypes.func,
    showCardInfo: PropTypes.func,
    showRightFullScreen: PropTypes.func,
    imgUrl: PropTypes.string,
    removeFailRealm: PropTypes.func,
    bulkOpersShow: PropTypes.boolean

};

module.exports = Card;
