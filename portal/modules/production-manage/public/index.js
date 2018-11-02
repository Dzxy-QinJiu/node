/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/30.
 */
let language = require('PUB_DIR/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./style/index-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./style/index-zh_CN.less');
}
let ProductionStore = require('./store/production-store');
let ProductionAction = require('./action/production-actions');
let RightCardsContainer = require('../../../components/rightCardsContainer');
let Production = require('./views/production');
let TopNav = require('../../../components/top-nav');
let PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
let Spinner = require('../../../components/spinner');
let openTimeout = null;//打开面板时的时间延迟设置
let hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
let util = require('./utils/production-util');
import {Button} from 'antd';
import Trace from 'LIB_DIR/trace';

class ProductionManage extends React.Component {
    state = ProductionStore.getState();

    onChange = () => {
        this.setState(ProductionStore.getState());
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        ProductionStore.listen(this.onChange);
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        ProductionStore.unlisten(this.onChange);
    }

    //展示产品信息
    events_showAddForm = (type) => {
        ProductionAction.showForm(type);
    };

    //切换页数时，当前页展示数据的修改
    events_onChangePage = (count, curPage) => {
        ProductionAction.updateCurPage(curPage);
        ProductionAction.getProductions();
    };

    events_showDetail = (production) => {
        Trace.traceEvent('产品管理', '点击查看产品详情');
        ProductionAction.setCurProduction(production.id);
        if ($('.right-panel-content').hasClass('right-panel-content-slide')) {
            $('.right-panel-content').removeClass('right-panel-content-slide');
            if (openTimeout) {
                clearTimeout(openTimeout);
            }
            openTimeout = setTimeout(function() {
                ProductionAction.showInfoPanel();
            }, 200);
        } else {
            ProductionAction.showInfoPanel();
        }
    };

    events_searchEvent = (searchContent) => {
    };

    //右侧面板的关闭
    events_closeRightPanel = () => {
        //将数据清空
        ProductionAction.setInitialData();
        ProductionAction.closeInfoPanel();
    };
    //添加产品后
    events_afterOperation = (type, production) => {
        if (type === util.CONST.ADD) {
            ProductionAction.addProduction(production);
        } else {
            ProductionAction.updateProduction(production);
        }
    };

    //由编辑页面返回信息展示页面
    events_returnInfoPanel = (newAddUser) => {
        ProductionAction.returnInfoPanel(newAddUser);
    };

    //一页展示多少
    events_updatePageSize = (count) => {
        ProductionAction.updatePageSize(count);
    };

    getCardList = () => {
        let productionList = _.isArray(this.state.productionList) ? this.state.productionList : [];
        return productionList.map(production => {
            return {
                id: production.id,
                name: production.name,
                full_image: production.full_image,
                image: production.preview_image,
                specifications: {
                    label: Intl.get('config.product.spec', '规格或版本') + ':',
                    value: production.specifications,
                    showOnCard: true
                },
                code: {
                    label: Intl.get('config.product.code', '产品编号') + ':',
                    value: production.code,
                    showOnCard: true
                },
                description: production.description,
                url: {
                    label: Intl.get('config.product.url', '访问地址') + ':',
                    value: production.url,
                    showOnCard: true
                },
                showDelete: true
            };
        });

    };

    hasNoFilterCondition = () => {
        if (this.state.searchContent) {
            return false;
        } else {
            return true;
        }

    };
    renderAddAndImportBtns = () => {
        if (hasPrivilege('USER_MANAGE_ADD_USER')) {
            return (
                <div className="btn-containers">
                    <Button className='add-clue-btn btn-item btn-m-r-2'
                            onClick={this.events_showAddForm.bind(this, util.CONST.ADD)}>{Intl.get('common.add.member', '添加成员')}</Button>
                </div>
            );
        } else {
            return null;
        }

    };
    //删除item
    deleteItem = (itemId) => {
        ProductionAction.deleteItemById(itemId);
    };

    render() {
        var firstLoading = this.state.isLoading;
        return (
            <div className="user_manage_style backgroundManagement_user_content" data-tracename="成员管理">
                {
                    firstLoading ? <div className="firstLoading">
                        <Spinner/>
                    </div> : null
                }
                <RightCardsContainer
                    currentCard={this.state.currentProduction}
                    cardListSize={this.state.userListSize}
                    curCardList={this.getCardList()}
                    listTipMsg={this.state.listTipMsg}
                    curPage={this.state.curPage}
                    pageSize={this.state.pageSize}
                    searchPlaceHolder={Intl.get('common.product.name', '产品名称')}
                    updatePageSize={this.events_updatePageSize.bind(this)}
                    changePageEvent={this.events_onChangePage.bind(this)}
                    showCardInfo={this.events_showDetail.bind(this)}
                    renderAddAndImportBtns={this.renderAddAndImportBtns}
                    showAddBtn={this.hasNoFilterCondition()}
                    deleteItem={this.deleteItem}
                >
                    <TopNav>
                        <TopNav.MenuList/>
                        <PrivilegeChecker check="PRODUCTS_MANAGE" className="block float-r btn-item-container"
                                          onClick={this.events_showAddForm.bind(this, util.CONST.ADD)}
                                          data-tracename="添加产品">
                            <Button className="btn-item btn-m-r-2">
                                {Intl.get('config.product.add', '添加产品')}
                            </Button>
                        </PrivilegeChecker>
                    </TopNav>
                    {this.state.formShow ?
                        <Production
                            formType={this.state.currentProduction.id ? '' : util.CONST.ADD}
                            info={this.state.currentProduction}
                            closeRightPanel={this.events_closeRightPanel}
                            afterOperation={this.events_afterOperation}
                        /> : null}
                    {this.state.deleteError ? (<message></message>) : null}
                </RightCardsContainer>
            </div>
        );
    }
}


module.exports = ProductionManage;
