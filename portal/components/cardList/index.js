var React = require('react');
require('./cardList.less');
var scrollBarEmitter = require('../../public/sources/utils/emitters').scrollBarEmitter;
var cardEmitter = require('../../public/sources/utils/emitters').cardEmitter;

var Card = require('../card');
//滚动条
var GeminiScrollbar = require('../react-gemini-scrollbar');
import NoDataIntro from 'CMP_DIR/no-data-intro';

var CONSTANTS = {
    TOP_NAV_HEIGHT: 64,//头部导航的高度
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


var TYPES = {
    APP_MANAGE: 'appManage',
    USER_MANAGE: 'userManage'
};
function noop() {
}

class CardList extends React.Component {
    static defaultProps = {
        updatePageSize: noop,
        changePageEvent: noop,
        pageSize: 20,
        isPanelShow: false,
        type: '',
        editCard: noop,
        deleteCard: noop,
        showAddBtn: false,
        renderAddAndImportBtns: noop,
        addSelectCard: noop,
        subtractSelectCard: noop,
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
        //右侧卡片区域的高度设置
        var cardListHeight = $('body').height() - CONSTANTS.TOP_NAV_HEIGHT - CONSTANTS.PAGE_NAV_HEIGHT;
        if (this.props.isPanelShow) {
            if (this.props.type === TYPES.APP_MANAGE) {
                cardListHeight = cardListHeight - $('.app_content .app-filter-adv').outerHeight(true);
            } else if (this.props.type === TYPES.USER_MANAGE) {
                cardListHeight = cardListHeight - $('.backgroundManagement_user_content .user-filter-adv').outerHeight(true);
            }
        }
        return cardListHeight;
    };

    //编辑域
    editCard = (card) => {
        this.props.editCard(card);
    };

    //删除域
    deleteCard = () => {
        this.props.deleteCard();
    };

    //选择安全域
    selectCard = (cardId) => {
        this.props.addSelectCard(cardId);
    };

    //取消选择安全域
    unSelectCard = (cardId) => {
        this.props.subtractSelectCard(cardId);
    };

    //展示详细信息
    showCardInfo = (card) => {
        this.props.showCardInfo(card);
    };

    // 根据剩余空白宽度调整卡边的宽度
    adjustCardWidth = () => {
        var cardWidth = 0;
        var cardListWidth = $('.card-list-content').width();
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
        var cardListWidth = $('.card-list-content').width();
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
        var bulkOpersShow = _this.props.bulkOpersShow;
        var curCardListLen = _this.props.curCardList.length;
        var cards = '';
        // 当前页中的应用列表遍历
        if (_this.props.curCardList && curCardListLen > 0) {
            cards = _this.props.curCardList.map(function(card, index) {
                var selectCards = _this.props.selectCards;
                var isSelect = _.includes(selectCards, card.id);
                return <Card key={index}
                    curCard={card}
                    imgUrl={card.image}
                    bulkOpersShow={bulkOpersShow}
                    selectCard={_this.selectCard}
                    unselectCard={_this.unSelectCard}
                    isSelect={isSelect}
                    showCardInfo={_this.showCardInfo}
                    cardWidth={_this.state.cardWidth}
                    showRightFullScreen={_this.props.showRightFullScreen}
                    showAppOverViewPanel={_this.props.showAppOverViewPanel}
                    type={_this.props.type}
                    removeFailRealm={_this.props.removeFailRealm}
                    showDelete={card.showDelete}
                    deleteItem={_this.props.deleteItem}
                />;
            });
        }

        var cardListHeight = this.getCardListHeight();
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
CardList.propTypes = {
    updatePageSize: PropTypes.func,
    changePageEvent: PropTypes.func,
    pageSize: PropTypes.number,
    isPanelShow: PropTypes.bool,
    type: PropTypes.string,
    editCard: PropTypes.func,
    deleteCard: PropTypes.func,
    showAddBtn: PropTypes.bool,
    renderAddAndImportBtns: PropTypes.func,
    addSelectCard: PropTypes.func,
    subtractSelectCard: PropTypes.func,
    showCardInfo: PropTypes.func,
    curPage: PropTypes.number,
    cardListSize: PropTypes.number,
    listTipMsg: PropTypes.string,
};

module.exports = CardList;
