require('./cardList.less');
var scrollBarEmitter = require('../../public/sources/utils/emitters').scrollBarEmitter;
var cardEmitter = require('../../public/sources/utils/emitters').cardEmitter;

var Card = require('../card');
import StrategyCard from '../clue-strategy-card';
//滚动条
var GeminiScrollbar = require('../react-gemini-scrollbar');
import NoDataIntro from 'CMP_DIR/no-data-intro';

var CONSTANTS = {
    RIGHT_PADDING: 16, // 右侧padding
    TOP_NAV_HEIGHT: 80,//头部导航的高度
    SEARCH_INPUT_HEIGHT: 55,//成员管理中搜索框的高度设置
    PAGE_NAV_HEIGHT: 30//分页导航的高度
};
// 单个卡片的宽度和高度（正常）
var CARDCONSTANTS = {
    CARD_WIDTH: 360, //  卡片的宽度
    CARD_HEIGHT: 135 // 卡片的高度
};

// 卡片的最小宽度为332
var MINCARDWIDTH = 332;

const CARD_TYPE = {
    PRODUCTION: 'production',
    STRATEGY: 'clue-strategy'
};
function noop() {
}

class CardList extends React.Component {
    static defaultProps = {
        updatePageSize: noop,
        changePageEvent: noop,
        pageSize: 20,
        type: '',
        showAddBtn: false,
        renderAddAndImportBtns: noop,
        showCardInfo: noop,
        curPage: 1,
        cardListSize: 0,
        listTipMsg: '',
    };

    state = {
        listenScrollBottom: true,
        cardWidth: 'auto',
        loadedCardCount: 0
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        this.getInitialCardCount();

        $(window).on('resize', this.changeWindowSize);
        cardEmitter.on(cardEmitter.ADD_CARD, this.addCard);
    }
   getInitialCardCount= () => {
       // 初始加载卡片的个数
       var firstLoaderCount = this.getCardsCount();
       this.props.updatePageSize(firstLoaderCount);
       this.setState({
           loadedCardCount: firstLoaderCount
       });
       // 初次加载
       this.props.changePageEvent(firstLoaderCount, 1);
   };

    // 添加卡片时，滚动到顶部，重新获取数据
    addCard = () => {
        this.setState({
            loadedCardCount: this.props.pageSize
        });
        GeminiScrollbar.scrollTo(this.refs.scrolltoTop, 0);
        this.props.changePageEvent(this.props.pageSize, 1);
    };

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        $(window).off('resize', this.changeWindowSize);
    }

    // 改变窗口
    changeWindowSize = () => {
        // 重新render，计算滚动条的长短
        this.setState({});
        var _this = this;
        setTimeout(function() {
            var lastCardLength = _this.props.curCardList.length;
            var nowCardLength = _this.getRequestPageSize();
            if (lastCardLength < nowCardLength) {
                _this.props.changePageEvent(nowCardLength, 1);
                _this.setState({
                    loadedCardCount: nowCardLength
                });
            }
        }, 100);
    };

    // 获取卡片容器的高度
    getCardListHeight = () => {
        return this.props.cardContainerHeight || $('body').height() - CONSTANTS.TOP_NAV_HEIGHT - CONSTANTS.PAGE_NAV_HEIGHT;
    };

    // 获取片容器的宽度
    getCardListWidth = () => {
        return $('.card-list-content').width() - CONSTANTS.RIGHT_PADDING;
    };

    //展示详细信息
    showCardInfo = (card) => {
        this.props.showCardInfo(card);
    };

    // 根据剩余空白宽度调整卡边的宽度
    adjustCardWidth = () => {
        var cardWidth = 0;
        const cardListWidth = this.getCardListWidth();
        // 根据固定卡片宽度计算可以放卡片的个数
        var everyRowCardCounts = Math.floor(cardListWidth / CARDCONSTANTS.CARD_WIDTH);
        // 计算空白宽度
        var restSpaceWidth = cardListWidth % CARDCONSTANTS.CARD_WIDTH;
        // 根据空白大小计算可以放几个卡片
        if (restSpaceWidth <= (MINCARDWIDTH / 2)) {
            cardWidth = Math.floor(cardListWidth / everyRowCardCounts);
        } else {
            var changeCardWidth = (cardListWidth / (everyRowCardCounts + 1));
            if (changeCardWidth >= MINCARDWIDTH) {
                cardWidth = changeCardWidth;
            } else {
                if(everyRowCardCounts === 0){
                    cardWidth = MINCARDWIDTH;
                }else {
                    cardWidth = Math.floor(cardListWidth / everyRowCardCounts);
                }

            }
        }
        // 调整界面上卡片的宽度
        this.setState({
            cardWidth: cardWidth
        });

        return cardWidth;
    };

    // 计算当前屏幕可以放置的卡片个数
    getCardsCount = () => {
        // 默认行数和列数
        var cols = 1;
        var rows = 1;
        // 调整后卡片的宽度
        var newCardWidth = this.adjustCardWidth();
        // 计算卡片容器的高度和高度
        var cardListHeight = this.getCardListHeight();
        const cardListWidth = this.getCardListWidth();
        // 根据调整后卡片的宽度，重新计算一行可以放置卡片的个数
        var everyRowCardCounts = Math.floor(cardListWidth / newCardWidth);
        // 计算卡片容器中可以卡片的行数
        var everyColumnCardCounts = Math.floor(cardListHeight / CARDCONSTANTS.CARD_HEIGHT);
        if(everyRowCardCounts >= 2){
            cols = everyRowCardCounts;
        }
        if(everyColumnCardCounts >= 2){
            rows = everyColumnCardCounts;
        }
        // 保证可以出现滚动条
        if (cardListHeight > rows * CARDCONSTANTS.CARD_HEIGHT) {
            rows = rows + 1;
        }
        // 返回当前屏幕中可以放置的卡片个数
        return (rows * cols);

    };

    getRequestPageSize = () => {
        // cardCount是此屏幕中可以放置卡片的个数
        var cardCount = this.getCardsCount();
        //  窗口缩小时，每屏按没缩放之前区卡边的个数
        if (cardCount <= this.props.pageSize) {
            this.props.updatePageSize(this.props.pageSize);
            return this.props.pageSize;
        } else { // 窗口放大时，从第一页可以取数据，计算可以取卡片的个数
            var screenBigCountPageSize = Math.ceil(this.state.loadedCardCount / cardCount) * cardCount;
            this.props.updatePageSize(screenBigCountPageSize);
            return screenBigCountPageSize;
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.curPage === 1) {
            this.setState({
                listenScrollBottom: true
            });
        }
    }

    stopScrollLoadedData = () => {
        if (this.props.cardListSize === this.state.loadedCardCount) {
            this.setState({
                listenScrollBottom: false
            });
        }
    };

    handleScrollBottom = () => {
        // 获取每次加载的数据
        var everyLoadedPageSize = this.getRequestPageSize();
        // 计算剩余还没加载卡边的个数  cardListSize总卡片数  loadedCardCount已加载卡片数
        var restNeedLoadedData = this.props.cardListSize - this.state.loadedCardCount;
        // 已加载的卡片数
        if (restNeedLoadedData < everyLoadedPageSize) {
            this.state.loadedCardCount += restNeedLoadedData;
        } else if (this.state.loadedCardCount < everyLoadedPageSize) {
            this.state.loadedCardCount = everyLoadedPageSize;
        } else {
            this.state.loadedCardCount += everyLoadedPageSize;
        }

        // 计算需要加载第几页的卡片
        var everyLoadedNewPage = Math.floor(this.state.loadedCardCount / everyLoadedPageSize);
        // 是否还有没有加载完的卡片
        var restData = this.state.loadedCardCount % everyLoadedPageSize;
        if (restData) {
            everyLoadedNewPage = everyLoadedNewPage + 1;
        }
        this.props.changePageEvent(everyLoadedPageSize, everyLoadedNewPage);
        // 数据加载完时，触发停止加载数据事件
        if (this.state.loadedCardCount === this.props.cardListSize) {
            scrollBarEmitter.on(scrollBarEmitter.STOP_LOADED_DATA, this.stopScrollLoadedData);
        }
    };

    renderScrollBarLazyload = () => {
        var _this = this;
        var curCardListLen = _this.props.curCardList.length;
        var cards = '';
        let isProductionCard = _.isEqual(this.props.cardType, CARD_TYPE.PRODUCTION);
        // 当前页中的应用列表遍历
        if (_this.props.curCardList && curCardListLen > 0 && isProductionCard) {
            cards = _this.props.curCardList.map(function(card, index) {
                var selectCards = _this.props.selectCards;
                var isSelect = _.includes(selectCards, card.id);

                return <Card key={index}
                    curCard={card}
                    imgUrl={card.image}
                    isSelect={isSelect}
                    showCardInfo={_this.showCardInfo}
                    cardWidth={_this.state.cardWidth}
                    type={_this.props.type}
                    showDelete={card.showDelete}
                    deleteItem={_this.props.deleteItem}
                    leftFlagDesc={card.leftFlagDesc}
                />;
            });
        } else if(_this.props.curCardList && curCardListLen > 0) {
            cards = _this.props.curCardList.map(function(card, index) {
                var selectCards = _this.props.selectCards;
                var isSelect = _.includes(selectCards, card.id);
                return <StrategyCard key={index}
                    curCard={card}
                    selectCard={_this.selectCard}
                    isSelect={isSelect}
                    showCardInfo={_this.showCardInfo}
                    cardWidth={_this.state.cardWidth}
                    type={_this.props.type}
                    showDelete={card.showDelete}
                    deleteItem={_this.props.deleteItem}
                />;
            });
        }

        let cardListHeight = this.getCardListHeight();

        return (
            <div className="card-list-container">
                {
                    this.props.listTipMsg ? ((<NoDataIntro
                        noDataTip={this.props.listTipMsg}
                        renderAddAndImportBtns={this.props.renderAddAndImportBtns}
                        showAddBtn={this.props.showAddBtn}
                        noDataAndAddBtnTip={this.props.listTipMsg}/>)
                    ) : (
                        <div ref="scrolltoTop">
                            <div className="card-list" style={{height: cardListHeight}}>
                                <GeminiScrollbar
                                    handleScrollBottom={this.handleScrollBottom}
                                    listenScrollBottom={this.state.listenScrollBottom}
                                >
                                    <div className="card-list-content clearfix">
                                        {cards}
                                    </div>
                                </GeminiScrollbar>
                            </div>

                        </div>
                    )
                }
            </div>
        );
    };

    render() {
        return (
            <div>
                {this.renderScrollBarLazyload()}
            </div>
        );
    }
}

CardList.defaultProps = {
    cardType: 'production' //card类型 ‘production'产品卡片  'clue-strategy'线索策略卡片
};

CardList.propTypes = {
    updatePageSize: PropTypes.func,
    changePageEvent: PropTypes.func,
    pageSize: PropTypes.number,
    type: PropTypes.string,
    showAddBtn: PropTypes.bool,
    renderAddAndImportBtns: PropTypes.func,
    showCardInfo: PropTypes.func,
    curPage: PropTypes.number,
    cardListSize: PropTypes.number,
    listTipMsg: PropTypes.string,
    cardType: PropTypes.string,
};

module.exports = CardList;
