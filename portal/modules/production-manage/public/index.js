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
let Production = require('./views/production');
let PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
let Spinner = require('../../../components/spinner');
let openTimeout = null;//打开面板时的时间延迟设置
let hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
let util = require('./utils/production-util');
import {Button, Icon, Popover} from 'antd';
import Trace from 'LIB_DIR/trace';
import {getIntegrationConfig} from 'PUB_DIR/sources/utils/common-data-util';
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import ProductDropDown from './views/product-dropdown';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import IpFilterAjax from './ajax/ip-filter-ajax';
import IpFilter from './views/ip-filter';
import production_manager_privilegeConfig from './privilege-config';
import {isExpired, getContactSalesPopoverTip, isCurtao} from 'PUB_DIR/sources/utils/common-method-util';
import CardList from 'CMP_DIR/cardList';
//用来存储获取的oplate\matomo产品列表，不用每次添加产品时都获取一遍
let productList = [];
class ProductionManage extends React.Component {
    state = {
        ...ProductionStore.getState(),
        integrateType: '', //集成类型uem、oplate、matomo
        productList: productList, //集成的oplate\matomo产品列表
        addErrorMsg: '',//导入产品失败的提示
        isLoading: false, // 获取ip；列表loading
        globalFilterIpList: [], // 全局过滤的IP
        errMsg: '',
        isShowIpFilterPanel: false, // 是否显示ip过滤面板，默认false
    };

    onChange = () => {
        this.setState(ProductionStore.getState());
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        ProductionStore.listen(this.onChange);
        //获取集成类型
        this.getIntegrationConfig();
        // 获取全部产品过滤的IP
        this.getAllProductionFilterIpList();
    }

    getAllProductionFilterIpList = () => {
        this.setState({
            isLoading: true
        });
        IpFilterAjax.getIpList({page_size: 1000}).then( (result) => {
            this.setState({
                isLoading: false,
                globalFilterIpList: _.isArray(result) && result || []
            });
        }, (errMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errMsg
            });
        } );
    };

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        ProductionStore.unlisten(this.onChange);
    }

    getIntegrationConfig() {
        this.setState({isGettingIntegrateType: true});
        getIntegrationConfig().then(resultObj => {
            //集成类型： uem、oplate、matomo
            let integrateType = _.get(resultObj, 'type');
            this.setState({isGettingIntegrateType: false, integrateType, getItegrateTypeErrorMsg: ''});
            //获取oplate\matomo产品列表
            if (this.isOplateOrMatomoType(integrateType)) {
                this.getProductList(integrateType);
            }
        }, errorMsg => {
            // 获取集成配置信息失败后的处理
            this.setState({isGettingIntegrateType: false, getItegrateTypeErrorMsg: errorMsg});
        });
    }

    //是否是oplate或matomo类型
    isOplateOrMatomoType(integration_type) {
        let typeList = [INTEGRATE_TYPES.OPLATE, INTEGRATE_TYPES.MATOMO];
        return typeList.indexOf(integration_type) !== -1;
    }

    getProductList(integrationType) {
        if (_.get(productList, '[0]')) {
            this.setState({productList: productList});
        } else {
            $.ajax({
                url: '/rest/product_list/' + integrationType,
                type: 'get',
                dataType: 'json',
                data: {page_num: 1, page_size: 1000},
                success: (result) => {
                    productList = result || [];
                    this.setState({productList: productList});
                },
                error: (xhr) => {
                    productList = [];
                    this.setState({productList: productList});
                }
            });
        }
    }

    //展示产品信息
    events_showAddForm = (type) => {
        ProductionAction.showForm(type);
    };

    //切换页数时，当前页展示数据的修改
    events_onChangePage = (count, curPage) => {
        ProductionAction.updateCurPage(curPage);
        const queryObj = {
            page_size: count,
            id: curPage === 1 ? '' : this.state.lastId,
        };
        ProductionAction.getProductions(queryObj);
    };

    events_showDetail = (production) => {
        Trace.traceEvent('产品管理', '点击查看产品详情');
        ProductionAction.productionGetFilterIP(production.id);
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
                    label: Intl.get('config.product.spec', '规格/版本') + ':',
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
                showDelete: production.integration_type ? false : true,//集成的产品不可以删除，自己加的普通产品可以删
                leftFlagDesc: this.getProductFlagDesc(production),
                status: _.get(production, 'status', 1) // 产品中，没有状态，默认为启用
            };
        });

    };
    //获取产品标识的描述
    getProductFlagDesc(production) {
        let integration_type = _.get(production, 'integration_type');
        if (integration_type) {
            if (integration_type === 'uem') {
                return Intl.get('customer.ketao.app', '客套');
            } else {
                return integration_type.toUpperCase();
            }
        } else {
            return '';
        }
    }
    
    renderAddAndImportBtns = () => {
        if (hasPrivilege(production_manager_privilegeConfig.USER_MANAGE_ADD_USER)) {
            return (
                <div className="btn-containers">
                    <Button className='add-clue-btn btn-item btn-m-r-2'
                        onClick={this.events_showAddForm.bind(this, util.CONST.ADD)}> {Intl.get('config.product.add', '添加产品')}</Button>
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

    // 显示ip过滤面板
    showIpFilterPanel = () => {
        this.setState({
            isShowIpFilterPanel: true
        });
    };

    // 是否显示添加过滤IP的功能的判断
    isShowFilterIp = () => {
        return !isCurtao() && hasPrivilege(production_manager_privilegeConfig.ORGANIZATION_CONFIG) && (
            hasPrivilege(production_manager_privilegeConfig.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL) ||
                hasPrivilege(production_manager_privilegeConfig.CRM_CONTRACT_SALES_REPORTS_MANAGER) ||
                hasPrivilege(production_manager_privilegeConfig.CRM_DAILY_REPORT)
        );
    };

    renderFilterIpBtn = () => {
        if (isExpired()) {
            return (
                <Popover
                    placement='left'
                    content={getContactSalesPopoverTip()}
                >
                    <Button
                        className="filter-ip-btn"
                        data-tracename="过滤IP"
                        disabled={isExpired()}
                    >
                        <i className="iconfont icon-filter-ip"></i>
                        <span>{Intl.get('product.filter.ip', '过滤IP')}</span>
                    </Button>
                </Popover>
            );
        } else {
            return (
                <Button
                    className="filter-ip-btn"
                    data-tracename="过滤IP"
                    onClick={this.showIpFilterPanel}
                >
                    <i className="iconfont icon-filter-ip"></i>
                    <span>{Intl.get('product.filter.ip', '过滤IP')}</span>
                </Button>
            );
        }
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <PrivilegeChecker
                        check= {production_manager_privilegeConfig.PRODUCTS_MANAGE}
                        className="btn-item"
                    >
                        <Button
                            data-tracename="添加产品"
                            onClick={this.events_showAddForm.bind(this, util.CONST.ADD)}
                        >
                            <Icon type="plus" />{Intl.get('config.product.add', '添加产品')}
                        </Button>
                    </PrivilegeChecker>
                    {
                        _.get(this.state, 'productList[0]') ? (
                            <ProductDropDown
                                integrateType={this.state.integrateType}
                                productList={this.state.productList}
                                afterOperation={this.events_afterOperation}
                            />
                        ) : null
                    }
                </div>
                <div className='pull-right'>
                    {
                        this.isShowFilterIp() ? (
                            <div className="btn-item">
                                {this.renderFilterIpBtn()}
                            </div>
                        ) : null
                    }
                </div>
            </div>
        );
    };

    // 关闭ip过滤面板
    closeIpFilterPanel = () => {
        this.setState({
            isShowIpFilterPanel: false
        });
    };

    handleUpdateFilterIp = (globalFilterIpList) => {
        this.setState({
            globalFilterIpList: globalFilterIpList
        });
    };

    render() {
        let firstLoading = this.state.isLoading;
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let cardContainerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT - BACKGROUG_LAYOUT_CONSTANTS.BOTTOM_HEIFHT;
        return (
            <div className='production-manage-container' style={{height: height}}>
                <div
                    className="production_manage_style backgroundManagement_production_content"
                    data-tracename="产品管理"
                    style={{height: height}}
                >
                    <div className='production-top-nav'>
                        {this.renderTopNavOperation()}
                    </div>
                    {
                        firstLoading ? <div className="firstLoading">
                            <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>
                        </div> : null
                    }
                    <CardList
                        selectCards={this.state.currentProduction}
                        cardListSize={this.state.userListSize}
                        curCardList={this.getCardList()}
                        listTipMsg={this.state.listTipMsg}
                        curPage={this.state.curPage}
                        pageSize={this.state.pageSize}
                        updatePageSize={this.events_updatePageSize.bind(this)}
                        changePageEvent={this.events_onChangePage.bind(this)}
                        showCardInfo={this.events_showDetail.bind(this)}
                        renderAddAndImportBtns={this.renderAddAndImportBtns}
                        showAddBtn={true}
                        deleteItem={this.deleteItem}
                        cardContainerHeight={cardContainerHeight}
                        type="production"
                    />
                    {
                        this.state.formShow ? (
                            <Production
                                integrateType={this.state.integrateType}
                                formType={this.state.currentProduction.id ? util.CONST.EDIT : util.CONST.ADD}
                                info={this.state.currentProduction}
                                closeRightPanel={this.events_closeRightPanel}
                                openRightPanel={this.events_showDetail.bind(this, this.state.currentProduction)}
                                afterOperation={this.events_afterOperation}
                                globalFilterIpList={this.state.globalFilterIpList}
                                productionFilterIp={this.state.productionFilterIp}
                                showIpFilterPanel={this.showIpFilterPanel}
                            />
                        ) : null
                    }
                    {
                        this.state.isShowIpFilterPanel ? (
                            <IpFilter
                                closeIpFilterPanel={this.closeIpFilterPanel}
                                globalFilterIpList={this.state.globalFilterIpList}
                                updateFilterIpList={this.handleUpdateFilterIp}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

module.exports = ProductionManage;