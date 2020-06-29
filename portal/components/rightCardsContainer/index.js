/**
 * Created by wangliping on 2016/1/6.
 */

var language = require('../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./rightCardsContainer-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./rightCardsContainer-zh_CN.less');
}

var PrivilegeChecker = require('../privilege/checker').PrivilegeChecker;
var CardListView = require('../cardList');
import {SearchInput} from 'antc';

var Icon = require('antd').Icon;
var Button = require('antd').Button;
var noop = function() {

};
var CONSTANTS = {
    APP_MANAGE: 'appManage',
    MY_APP: 'myApp',
    USER_MANAGE: 'userManage'
};

class RihgtCardsContainer extends React.Component {
    static defaultProps = {
        showAddBtn: false,
        renderAddAndImportBtns: noop
    };
    
    render() {
        return (<div className="right-cards-container">
            {this.props.children}
            <div className="cards-table-block">
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
                    isPanelShow={this.props.isPanelShow}
                    modalType={this.props.modalType}
                    type={this.props.type}
                    removeFailRealm={this.props.removeFailRealm}
                    showAppOverViewPanel={this.props.showAppOverViewPanel}
                    renderAddAndImportBtns={this.props.renderAddAndImportBtns}
                    showAddBtn={this.props.showAddBtn}
                    deleteItem={this.props.deleteItem}
                    cardContainerHeight={this.props.cardContainerHeight}
                />
            </div>
        </div>

        );
    }
}

module.exports = RihgtCardsContainer;

