/**
 * Created by wangliping on 2016/1/6.
 */

var React = require('react');
var language = require('../../public/language/getLanguage');
if (language.lan() == 'es' || language.lan() == 'en') {
    require('./rightCardsContainer-es_VE.less');
}else if (language.lan() == 'zh'){
    require('./rightCardsContainer-zh_CN.less');
}

var PrivilegeChecker = require('../privilege/checker').PrivilegeChecker;
var CardListView = require('../cardList');
var SearchInput = require('../searchInput');
var Icon = require('antd').Icon;
var Button = require('antd').Button;

var CONSTANTS = {
    APP_MANAGE: 'appManage',
    MY_APP: 'myApp',
    USER_MANAGE: 'userManage'
};

var RihgtCardsContainer = React.createClass({

    showCardForm: function() {
        this.props.showCardForm('add');
    },

    render: function() {
        return (<div className="right-cards-container">
            {this.props.children}
            <div className="cards-table-block">
                <div className="cards-filter clearfix">
                    {this.props.type == CONSTANTS.MY_APP ? (
                        <div className="block search-input-block my-app-title">
                            <ReactIntl.FormattedMessage id="common.my.app" defaultMessage="我的应用"/>
                        </div>) : (
                        <div className="block search-input-block">
                            <SearchInput searchPlaceHolder={this.props.searchPlaceHolder}
                                searchEvent={this.props.searchEvent}/>
                        </div>
                    )}
                    {this.props.type == CONSTANTS.APP_MANAGE || this.props.type == CONSTANTS.USER_MANAGE ? (
                        <Button type="ghost" className="tag-filter-btn" onClick={this.props.toggleFilterPanel}>

                            <ReactIntl.FormattedMessage id="common.filter" defaultMessage="筛选"/>
                            { this.props.isPanelShow ? <Icon type="up"/> :
                                <Icon type="down"/> }
                        </Button>) : null
                    }
                    {this.props.type == CONSTANTS.USER_MANAGE ? null : (this.props.type == CONSTANTS.MY_APP ? (
                        <div className="cards-filter-line"></div>) : (<div>
                        <PrivilegeChecker check={this.props.addRoleStr} className="block handle-btn-container"
                            onClick={this.showCardForm}>
                            {
                                this.props.type == CONSTANTS.APP_MANAGE ?
                                    Intl.get('common.add.app', '添加应用')
                                    : Intl.get('common.add', '添加') + this.props.modalType

                            }
                        </PrivilegeChecker>
                        <div className="cards-filter-line"></div>
                    </div>))}
                </div>
                <div>
                    <CardListView
                        curCardList={this.props.curCardList}
                        editCard={this.props.editCard}
                        deleteCard={this.props.deleteCard}
                        addSelectCard={this.props.addSelectCard}
                        subtractSelectCard={this.props.subtractSelectCard}
                        modalDialogShow={this.props.modalDialogShow}
                        listTipMsg={this.props.listTipMsg}
                        cardListSize={this.props.cardListSize}
                        changePageEvent={this.props.changePageEvent}
                        selectCards={this.props.selectCards}
                        hideModalDialog={this.props.hideModalDialog}
                        curPage={this.props.curPage}
                        pageSize={this.props.pageSize}
                        updatePageSize={this.props.updatePageSize}
                        showCardInfo={this.props.showCardInfo}
                        showRightFullScreen={this.props.showRightFullScreen}
                        isPanelShow={this.props.isPanelShow}
                        modalType={this.props.modalType}
                        type={this.props.type}
                        removeFailRealm={this.props.removeFailRealm}
                        showAppOverViewPanel={this.props.showAppOverViewPanel}
                    />
                </div>
            </div>
        </div>

        );
    }
});

module.exports = RihgtCardsContainer;

