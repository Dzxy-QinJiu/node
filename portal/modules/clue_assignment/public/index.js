/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2019/9/2.
 */
import './style/index.less';

import ClueAssignmentStore from './store';
import ClueAssignmentAction from './action';

import {Button, Icon, Popover} from 'antd';
import NoStrategy from './views/no_assign_strategy';
import StrategyForm from './views/strategy-form';
import StrategyInfo from './views/strategy-info';
import CardList from 'CMP_DIR/cardList';
import Spinner from 'CMP_DIR/spinner';
import Trace from 'LIB_DIR/trace';

//当前页面布局常量
const LAYOUT = {
    PADDING: 56, //最外层padding宽度12px
    TOP_ZONE_HEIGHT: 80,
    NO_DATA_WIDTH: 306,
    ERROR_WIDTH: 304
};
//编辑，展示线索分配策略
const EDIT_TYPE = {
    EDIT: 'edit',
    ADD: 'add',
};
//默认一页展示的数量
const PAGE_SIZE = {
    SIZE: 20
};

class ClueAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...ClueAssignmentStore.getState(),
        };
    }

    componentDidMount = () => {
        ClueAssignmentStore.listen(this.onStoreChange);
        ClueAssignmentAction.getAllSalesManList();
        let requestBody = {};
        requestBody.pageSize = PAGE_SIZE.SIZE;
        ClueAssignmentAction.getAssignmentStrategies(requestBody);
    }

    componentWillUnmount = () => {
        ClueAssignmentStore.unlisten(this.onStoreChange);
    }

    onStoreChange = () => {
        this.setState(ClueAssignmentStore.getState());
    }

    //关闭右侧添加面板
    closeInfoRightPanel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.clue-assignment-right-panel'), '关闭线索分配策略添加面板');
        ClueAssignmentAction.closeInfoRightPanel();
    }

    //关闭右侧线索信息面板
    closeFormRightPanel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.clue-assignment-right-panel'), '关闭线索分配策略信息面板');
        ClueAssignmentAction.closeFormRightPanel();
    }

    //添加分配策略
    addAssignmentStrategy = (type) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-btn-item'), '点击添加分配策略按钮');
        ClueAssignmentAction.showStrategyForm(type);
    }

    //一页展示多少
    updatePageSize = (count) => {
        setTimeout(() => {
            ClueAssignmentAction.updatePageSize(count);
        });
    };
    //切换页数时，当前页展示数据的修改
    onChangePage = (count, curPage) => {
        if(_.isEmpty(this.state.getStrategyListErrMsg)) {
            setTimeout(() => {
                ClueAssignmentAction.updateCurPage(curPage);
                let requestBody = {};
                requestBody.pageSize = PAGE_SIZE.SIZE;
                requestBody.sortId = this.state.lastId;
                ClueAssignmentAction.getAssignmentStrategies(requestBody);
            });
        }
    };
    //获取线索分类策略
    getStrategyCardList = () => {
        let strategyList = _.isArray(this.state.strategyList) ? this.state.strategyList : [];
        return strategyList.map(strategy => {
            let provinceTips = _.join(strategy.condition.province, '、');
            provinceTips = _.isEqual(provinceTips, 'all') ? Intl.get('clue.assignment.needs.regions.all.regions', '全部地域') : provinceTips;
            let needsContent = `${Intl.get('clue.assignment.needs.region','地域')} (${provinceTips})`;
            return {
                id: strategy.id,
                name: strategy.name,
                status: strategy.status,
                description: {
                    label: Intl.get('clue.assignment.description', '描述') + ':',
                    value: strategy.description,
                    showOnCard: true
                },
                condition: {
                    label: Intl.get('clue.assignment.needs', '满足条件') + ':',
                    value: needsContent,
                    showOnCard: true
                },
                assignee: {
                    label: Intl.get('clue.assignment.assignee', '分配给') + ':',
                    value: strategy.user_name,
                    showOnCard: true
                }
            };
        });
    }

    showDetailPanel = (strategy) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.clue-assignment-list-container'), '点击查看线索分配策略详情');
        ClueAssignmentAction.setCurStrategy(strategy.id);
        ClueAssignmentAction.showStrategyInfoPanel();
    };

    //渲染加载或者有错误信息的状态
    renderLoadingAndErrAndNodataContent = () => {
        //错误信息提示padding
        let paddingTop = ($(window).height() - LAYOUT.ERROR_WIDTH) / 2;
        //如果加载完成并且有错误信息,并且不是首次加载时，提示错误
        if(!_.isEmpty(_.get(this.state, 'getStrategyListErrMsg')) && !_.get(this.state, 'isGetStrategyDetailLoading') && !_.get(this.state, 'lastId')) {
            return (
                <div className="err-content" style={{paddingTop: paddingTop}}>
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{_.get(this.state, 'getStrategyListErrMsg')}</p>
                </div>
            );
        } else if(_.get(this.state, 'strategyList[0]')) {
            return this.renderClueAssignList();
        } else {
            return this.renderClueAssignNoData();
        }
    }

    //渲染顶端操作项
    renderTopNavOperation = () => {
        return (
            <div className="add-clue-assignment-top">
                <div className="add-clue-assignment-btn">
                    {this.renderAddStrategyBtn()}
                </div>
            </div>
        );
    }

    //当前有分配策略时的展示
    renderClueAssignList = () => {
        let height = $(window).height() - LAYOUT.PADDING;
        let cardContainerHeight = height - LAYOUT.TOP_ZONE_HEIGHT;
        return(
            <div className="clue-assignment-list-container">
                <div className="clue-top-nav">
                    {this.renderTopNavOperation()}
                </div>
                <CardList
                    cardListSize={this.state.strategyTotal}
                    selectCards={this.state.currentStrategy}
                    curCardList={this.getStrategyCardList()}
                    listTipMsg={this.state.listTipMsg}
                    curPage={this.state.curPage}
                    pageSize={this.state.pageSize}
                    updatePageSize={this.updatePageSize.bind(this)}
                    changePageEvent={this.onChangePage.bind(this)}
                    showCardInfo={this.showDetailPanel.bind(this)}
                    cardType='clue-strategy'
                    cardContainerHeight={cardContainerHeight}
                />
            </div>
        );
    }

    //添加分配策略按钮
    renderAddStrategyBtn = () => {
        let isDisableButton = _.includes(_.get(this.state, 'strategyList[0].condition.province'), 'all');
        let tips = Intl.get('clue.assignment.all.regions.tips', '策略中已包含全部地域，请修改后再添加');
        return(
            isDisableButton ?
                (<Popover content={tips}>
                    <Button
                        className="add-btn-item"
                        disabled={true}
                    >
                        <Icon type="plus" />
                        <div className="add-btn-char">
                            {Intl.get('clue.assignment.strategy.add','添加分配策略')}
                        </div>
                    </Button>
                </Popover>) :
                (<Button
                    className="add-btn-item"
                    onClick={this.addAssignmentStrategy.bind(this, EDIT_TYPE.ADD)}
                    data-tracename="添加分配策略"
                >
                    <Icon type="plus" />
                    <div className="add-btn-char">
                        {Intl.get('clue.assignment.strategy.add','添加分配策略')}
                    </div>
                </Button>)
        );
    }

    //当前无分配策略时的展示
    renderClueAssignNoData = () => {
        let paddingTop = ($(window).height() - LAYOUT.NO_DATA_WIDTH) / 2;
        return (
            <div className="no-strategy-data-container" style={{paddingTop: paddingTop}}>
                <NoStrategy
                    renderAddStrategyBtn={this.renderAddStrategyBtn}
                />
            </div>
        );
    }

    render() {
        let height = $(window).height() - LAYOUT.PADDING;
        return (
            <div
                className="clue-assignment-container"
                data-tracename="线索分配"
            >
                <div className="clue-assignment-content" style={{height: height}}>
                    {
                        _.get(this.state, 'isGetStrategyDetailLoading') && !this.state.lastId ? <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/> : (
                            <div className="clue-assignment-content">
                                {this.renderLoadingAndErrAndNodataContent()}
                                <div className="clue-assignment-right-panel">
                                    {
                                        _.get(this.state, 'isShowStrategyForm') ?
                                            <StrategyForm
                                                closeRightPanel={this.closeFormRightPanel}
                                                regions={this.state.regions}
                                                salesManList={this.state.salesManList}
                                                isFirstTimeAdd={_.isEmpty(_.get(this.state, 'strategyList[0]'))}
                                            /> : null
                                    }
                                    {
                                        _.get(this.state, 'isShowStrategyDetail') ?
                                            <StrategyInfo
                                                closeRightPanel={this.closeInfoRightPanel}
                                                strategyInfo={this.state.currentStrategy}
                                                regions={this.state.regions}
                                                salesManList={this.state.salesManList}
                                                isFirstOneEdit={_.isEqual(_.get(this.state, 'strategyList.length'), 1)}
                                            /> : null
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}

export default ClueAssignment;