var React = require('react');
import routeList from '../common/route';
import ajax from '../common/ajax';
import GeminiScrollBar from '../../../components/react-gemini-scrollbar';
import rightPanelUtil from '../../../components/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
const RightPanelReturn = rightPanelUtil.RightPanelReturn;
const RightPanelClose = rightPanelUtil.RightPanelClose;
import Spinner from '../../../components/spinner';
import { Tabs, message, Button, Steps, Alert } from 'antd';
const Step = Steps.Step;
const TabPane = Tabs.TabPane;
import { PRODUCT, PROJECT, SERVICE, PURCHASE, CATEGORY, VIEW_TYPE } from '../consts';
import AddBasic from './add-basic';
import AddProduct from './add-product';
import AddReport from './add-report';
import AddRepayment from './add-repayment';
import AddBuyBasic from './add-buy-basic';
import AddBuyPayment from './add-buy-payment';
import DetailBasic from './detail-basic';
import DetailInvoice from './detail-invoice';
import DetailBuyBasic from './detail-buy-basic';
import DetailBuyPayment from './detail-buy-payment';
import DetailCost from './detail-cost';
import Trace from 'LIB_DIR/trace';
import calc from 'calculatorjs';
import { parseAmount } from 'LIB_DIR/func';
let stepMap = {
    '1': '基本信息',
    '2': '产品信息',
    '3': '回款计划'
};

class ContractRightPanel extends React.Component {
    state = {
        isLoading: false,
        currentView: this.props.contractType === PURCHASE ? 'buyForm' : 'sellForm',
        currentCategory: this.props.contractType,
        currentTabKey: '1',
        userList: JSON.parse(JSON.stringify(this.props.userList)),
        teamList: JSON.parse(JSON.stringify(this.props.teamList)),
        showDiffAmountWarning: false,
        contentHeight: 0,
        total_amount: 0, // 合同总金额
    };

    componentDidMount() {
        $(window).on('resize', this.setContentHeight);
        this.setContentHeight();

        //补充用户列表
        this.supplementUserList(this.props);
        //补充团队列表
        this.supplementTeamList(this.props);
    }

    componentDidUpdate() {
        const scrollBar = this.refs.gemiScrollBar;

        if (scrollBar) {
            // this.setContentHeight();
        }
    }

    componentWillUnmount() {
        $(window).off('resize', this.setContentHeight);
    }

    setContentHeight = () => {
        const wrapper = $('.add-form');
        //新高度 = 窗口高度 - 容器距窗口顶部的距离 - 底部留空
        const contentHeight = $(window).height() - $('.ant-steps').offset().top - 80;
        wrapper.height(contentHeight);
        this.setState({
            contentHeight
        });
        this.updateScrollBar();
    };

    updateScrollBar = () => {
        const scrollBar = this.refs.gemiScrollBar;

        if (!scrollBar) {
            return;
        }

        scrollBar.update();
    };

    componentWillReceiveProps(nextProps) {
        //当前视图是否是合同基本信息添加表单
        const state = this.state;
        const isOnAddForm = ['buyForm', 'sellForm'].indexOf(this.state.currentView) > -1;

        //如果当前视图是合同基本信息添加表单
        //并且从外层传进来的视图属性是选择类别的话
        //说明是从添加表单请求外层数据
        //（如重新获取负责人列表的这种操作）
        //此时应该保持在当前视图
        //否则应该切换到外层视图属性指定的视图
        if (!(isOnAddForm && nextProps.view === 'chooseType')) {
            state.currentView = nextProps.view;
        }

        //从外层点击添加合同按钮直接打开采购合同添加表单时，将合同类别设为采购合同
        if (nextProps.view === 'buyForm') {
            state.currentCategory = PURCHASE;
        }

        if (nextProps.contract.id !== this.props.contract.id) {
            state.currentTabKey = '1';
        }

        this.setState(state);

        //补充用户列表
        this.supplementUserList(nextProps);
        //补充团队列表
        this.supplementTeamList(nextProps);
    }

    //补充用户列表
    ///以防止在编辑的时候，已经离职的销售人员无法选中的问题
    supplementUserList = (props) => {
        const userId = props.contract.user_id;
        const userName = props.contract.user_name;
        const userIndex = _.findIndex(props.userList, user => user.user_id === userId);

        if (userId && userName && userIndex === -1) {
            this.state.userList.push({
                user_id: userId,
                nick_name: userName,
            });

            this.setState(this.state);
        }
    };

    //补充团队列表
    ///以防止在编辑的时候，已经删除的销售团队无法选中的问题
    supplementTeamList = (props) => {
        const teamId = props.contract.sales_team_id;
        const teamName = props.contract.sales_team;
        const teamIndex = _.findIndex(props.teamList, team => team.groupId === teamId);

        if (teamId && teamName && teamIndex === -1) {
            this.state.teamList.push({
                groupId: teamId,
                groupName: teamName,
            });

            this.setState(this.state);
        }
    };

    changeCurrentTabKey = (key) => {
        this.setState({
            currentTabKey: key
        });
    };

    changeToView = (view, category) => {
        const state = this.state;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加合同>选择\'' + category + '\'类型');
        if (view) state.currentView = view;
        if (category) state.currentCategory = category;
        state.currentTabKey = '1';
        this.setState(state);
    };

    goPrev = () => {
        const state = this.state;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加合同>进入上一步');
        let step = parseInt(state.currentTabKey);
        step--;
        state.currentTabKey = step.toString();
        this.setState(state);
    };

    goNext = () => {
        let {currentTabKey} = this.state;
        let step = parseInt(currentTabKey);
        step++;
        currentTabKey = step.toString();
        this.setState({currentTabKey});
    };

    // 下一步处理函数
    onNextStepBtnClick = () => {
        let validation;

        if (this.state.currentView === 'sellForm') {
            if (this.state.currentTabKey === '1') {
                validation = this.refs.addBasic.refs.validation;
                let contract_amount = this.refs.addBasic.state.formData.contract_amount;
                this.setState({
                    total_amount: parseAmount(contract_amount)
                });
            } else {
                // 产品合同第二步
                if ([PRODUCT].indexOf(this.state.currentCategory) > -1 && this.state.currentTabKey === '2') {
                    //构造validation对象，保持一致
                    validation = {
                        validate: this.refs.addProduct.validate
                    };
                }
                // 服务合同第二步
                else if ([SERVICE].indexOf(this.state.currentCategory) > -1 && this.state.currentTabKey === '2') {
                    validation = {
                        validate: this.refs.addReport.validate
                    };
                }
            }
        } else {
            validation = this.refs.addBuyBasic.refs.validation;
        }
        //当验证通过时，发送点击事件信息
        if (validation) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '添加合同>从\'' + stepMap[this.state.currentTabKey] + '\'进入下一步');
        }

        //添加服务合同时，产品信息可不填
        if (this.state.currentCategory === SERVICE && this.state.currentTabKey === '2') {
            this.goNext();
            return;
        }

        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                if ([PRODUCT, SERVICE].indexOf(this.state.currentCategory) > -1 && this.state.currentTabKey === '2') {
                    let totalProductsPrice = this.refs.addProduct.state.products.reduce(
                        // calc方法需要传入字符串来计算，因此使用模版字符串
                        (acc, cur) => cur.total_price ? calc(`${acc} + ${cur.total_price}`) : acc,
                        0
                    );
                    if (this.refs.addBasic.state.formData.contract_amount !== totalProductsPrice.toString()) {
                        this.setState({ showDiffAmountWarning: true });
                    } else {
                        this.setState({ showDiffAmountWarning: false }, this.goNext());
                    }
                    return;
                }
                this.goNext();
            }
        });
    };

    showLoading = () => {
        this.setState({ isLoading: true });
    };

    hideLoading = () => {
        this.setState({ isLoading: false });
    };

    //处理提交
    //cb：回调函数
    //refreshWithResult：是否用提交返回的结果来更新当前合同
    handleSubmit = (cb, refreshWithResult) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), stepMap[this.state.currentTabKey] + '添加合同>点击完成按钮');
        this.showLoading();

        const currentView = this.state.currentView;
        let type;
        let contractData;

        if (currentView === 'sellForm') {
            type = VIEW_TYPE.SELL;
            contractData = _.extend({}, this.props.contract, this.refs.addBasic.state.formData);
            contractData.category = this.state.currentCategory;

            const addProduct = this.refs.addProduct;
            if (addProduct && !_.isEmpty(addProduct.state.products[0])) {
                contractData.products = addProduct.state.products;
            }

            const addReport = this.refs.addReport;
            if (addReport && !_.isEmpty(addReport.state.reports[0])) {
                contractData.reports = addReport.state.reports.map(x => {
                    if (x.report_type) {
                        delete x.type;
                        delete x.num;
                    }
                    return x;
                });
            }

            if (this.refs.addRepayment) contractData.repayments = this.refs.addRepayment.state.repayments;
        } else if (currentView === 'buyForm') {
            type = VIEW_TYPE.BUY;
            contractData = _.extend({}, this.props.contract, this.refs.addBuyBasic.state.formData);
            contractData.category = this.state.currentCategory;
            if (this.refs.addBuyPayment) contractData.payments = this.refs.addBuyPayment.state.payments;
        } else {
            type = this.props.contract.type;
            if (type === VIEW_TYPE.SELL) {
                contractData = _.extend({}, this.props.contract, this.refs.detailBasic.state.formData);
            } else {
                contractData = _.extend({}, this.props.contract, this.refs.detailBuyBasic.state.formData);
            }
        }

        if (contractData.start_time) {
            //在用Validation组件验证开始时间是否小于结束时间时，该组件会用一个缓存的值覆盖通过赋值方法setField赋到state上的最新的值
            //现象就是，本来选择了开始时间后，赋到state里的开始时间是个时间戳，但经过验证组件验证后，就又变回了moment对象
            //所以在提交数据之前需要把moment再转成时间戳，否则接口会报错
            //下面的结束时间同理
            contractData.start_time = moment(contractData.start_time).valueOf();
        }

        if (contractData.end_time) {
            contractData.end_time = moment(contractData.end_time).valueOf();
        }

        const reqData = contractData;
        const params = { type: type };
        let operateType = 'add';
        let operateName = Intl.get('sales.team.add.sales.team', '添加');
        if (reqData.id) {
            operateType = 'edit';
            operateName = Intl.get('common.update', '修改');
        }
        const route = _.find(routeList, route => route.handler === operateType + 'Contract');
        const arg = {
            url: route.path,
            type: route.method,
            data: reqData,
            params: params
        };

        ajax(arg).then(result => {
            this.hideLoading();

            if (result && result.code === 0) {
                message.success(operateName + '成功');

                if (['sellForm', 'buyForm'].indexOf(currentView) > -1) {
                    this.props.hideRightPanel();
                }

                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);

                if (operateType === 'add') {
                    if (hasResult) {
                        this.props.addContract(result.result);
                    }
                } else {
                    if (hasResult) {
                        if (refreshWithResult) {
                            this.props.refreshCurrentContract(reqData.id, true, result.result);
                        } else {
                            this.props.refreshCurrentContract(reqData.id);
                        }
                    }
                }

                if (_.isFunction(cb)) cb();
            } else {
                message.error(operateName + '失败');
            }
        }, (errMsg) => {
            this.hideLoading();
            message.error(errMsg || operateName + '失败');
        });
    };

    handleCancel = () => {
        if (this.props.contract.id) {
            this.setState({ isFormShow: false });
        } else {
            this.props.hideRightPanel();
        }
    };

    render() {
        let endPaneKey = '3';
        if ([PROJECT, PURCHASE].indexOf(this.state.currentCategory) > -1) endPaneKey = '2';

        let sellFormPanes = {};

        sellFormPanes['1'] = props => (
            <div className={props.className}>
                <AddBasic
                    ref="addBasic"
                    contract={this.props.contract}
                    teamList={this.props.teamList}
                    userList={this.props.userList}
                    getUserList={this.props.getUserList}
                    isGetUserSuccess={this.props.isGetUserSuccess}
                    validateNumRepeat={true}
                />
            </div>
        );

        if ([PRODUCT].indexOf(this.state.currentCategory) > -1) {
            sellFormPanes['2'] = props => (
                <div className={props.className}>
                    <div className='total-amount-price'>{Intl.get('contract.report.contract.total.ccount', '本次合同总金额为')} {this.state.total_amount} {Intl.get('contract.155', '元')}</div>
                    <AddProduct
                        ref="addProduct"
                        appList={this.props.appList}
                        updateScrollBar={this.updateScrollBar}
                    />
                    {this.state.showDiffAmountWarning ? <div className="alert-container">
                        <Alert type="error" message={Intl.get('contract.different.amount.wanring', '合同额与产品总额不同提示信息')} showIcon />
                    </div> : null}
                </div>
            );
        }

        if (this.state.currentCategory === SERVICE) {
            sellFormPanes['2'] = props => (
                <div className={props.className}>
                    <div className='total-amount-price'>{Intl.get('contract.report.contract.total.ccount', '本次合同总金额为')} {this.state.total_amount} {Intl.get('contract.155', '元')}</div>
                    <AddProduct
                        ref="addProduct"
                        appList={this.props.appList}
                        updateScrollBar={this.updateScrollBar}
                    />
                    {this.state.showDiffAmountWarning ? <div className="alert-container">
                        <Alert type="error" message={Intl.get('contract.different.amount.wanring', '合同额与产品总额不同提示信息')} showIcon />
                    </div> : null}
                    <AddReport
                        ref="addReport"
                        contract={this.props.contract}
                        updateScrollBar={this.updateScrollBar}
                    />
                </div>
            );          
        }
        sellFormPanes[endPaneKey] = props => (
            <div className={props.className}>
                <AddRepayment
                    ref="addRepayment"
                    parent={this}
                    rightPanel={this}
                    updateScrollBar={this.updateScrollBar}
                />
            </div>
        );
        const tabContents = [];
        _.each(sellFormPanes, (value, key) => {
            tabContents.push(
                value({
                    className: this.state.currentTabKey !== key ? 'hide' : ''
                })
            );
        });
        const stepTitles = {
            [PRODUCT]: [
                '基本信息',
                '产品信息',
                '回款计划'
            ],
            [PROJECT]: [
                '基本信息',                
                '回款计划'
            ],
            [PURCHASE]: [
                '基本信息',
                '回款计划'
            ],
            [SERVICE]: [
                '基本信息',
                '产品与服务信息',
                '回款计划'
            ]            
        };
        const isDetailType = ['detail', 'detailCost'].includes(this.props.view);

        return (
            <div id="contractRightPanel">
                <Steps current={this.state.currentTabKey} size="small">
                    {stepTitles[this.props.contractType].map(title => <Step key={title} title={title} />)}
                </Steps>
                {/* {this.state.currentView === 'chooseType' ? (
                    
                    <Tabs defaultActiveKey="1" className="choose-type">
                        <TabPane tab={Intl.get('contract.98', '添加合同')} key="1">
                            选择类型：
                            <ul>
                                {CATEGORY.map((category, index) => {
                                    //将采购合同排除
                                    if (category === PURCHASE) return;

                                    const className = category === this.state.currentCategory ? 'active' : '';
                                    const view = category === PURCHASE ? 'buyForm' : 'sellForm';
                                    return (<li className={className}
                                        key={index}
                                        onClick={this.changeToView.bind(this, view, category)}
                                    >
                                        {category}
                                    </li>);
                                })}
                            </ul>
                        </TabPane>
                    </Tabs>
                ) : null} */}

                {/*添加其他合同（采购合同除外）*/}
                {!isDetailType && this.state.currentView === 'sellForm' ? (
                    <div className="add-form">
                        {/* {sellFormPanes[this.state.currentTabKey]} */}
                        <GeminiScrollBar ref="gemiScrollBar" style={{ height: this.state.contentHeight }}>
                            {tabContents}
                        </GeminiScrollBar>
                        <div className="step-button">
                            {
                                this.state.currentTabKey !== '1' ?
                                    <Button
                                        onClick={this.goPrev}
                                    >
                                        <ReactIntl.FormattedMessage id="user.user.add.back" defaultMessage="上一步" />
                                    </Button> : null
                            }
                            {this.state.currentTabKey !== endPaneKey ? (
                                <Button
                                    onClick={this.onNextStepBtnClick}
                                    type="primary"
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.next" defaultMessage="下一步" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={this.handleSubmit}
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.finish" defaultMessage="完成" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}

                {/*添加采购合同*/}
                {!isDetailType && this.state.currentView === 'buyForm' ? (
                    <div className="add-form">
                        {
                            this.state.currentTabKey === '1' ?
                                <AddBuyBasic
                                    ref="addBuyBasic"
                                    contract={this.props.contract}
                                    teamList={this.props.teamList}
                                    userList={this.props.userList}
                                    getUserList={this.props.getUserList}
                                    isGetUserSuccess={this.props.isGetUserSuccess}
                                    validateNumRepeat={true}
                                /> : null
                        }
                        {
                            this.state.currentTabKey === '2' ?
                                <GeminiScrollBar ref="gemiScrollBar">
                                    <AddBuyPayment
                                        ref="addBuyPayment"
                                        rightPanel={this}
                                        updateScrollBar={this.updateScrollBar}
                                    />
                                </GeminiScrollBar> : null
                        }

                        <div className="step-button">
                            {
                                this.state.currentTabKey !== '1' ?
                                    <Button
                                        onClick={this.goPrev}
                                    >
                                        <ReactIntl.FormattedMessage id="user.user.add.back" defaultMessage="上一步" />
                                    </Button> : null
                            }
                            {this.state.currentTabKey !== '2' ? (
                                <Button
                                    onClick={this.onNextStepBtnClick}
                                    type="primary"
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.next" defaultMessage="下一步" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={this.handleSubmit}
                                >
                                    <ReactIntl.FormattedMessage id="user.user.add.finish" defaultMessage="完成" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}

                {/*费用（添加和修改）*/}
                {this.props.view === 'detailCost' ? (
                    <div className="add-form">
                        {/*<Tabs activeKey={this.state.currentTabKey}>
                            <TabPane tab={_.isEmpty(this.props.contract) ? Intl.get('contract.127', '添加费用') : Intl.get('contract.129', '费用信息')} key="1">

                            </TabPane>
                        </Tabs>*/}
                        <DetailCost
                            ref="detailCost"
                            cost={this.props.contract}
                            teamList={this.props.teamList}
                            userList={this.props.userList}
                            getUserList={this.props.getUserList}
                            isGetUserSuccess={this.props.isGetUserSuccess}
                            showLoading={this.showLoading}
                            hideLoading={this.hideLoading}
                            addContract={this.props.addContract}
                            refreshCurrentContract={this.props.refreshCurrentContract}
                            deleteContract={this.props.deleteContract}
                            hideRightPanel={this.props.hideRightPanel}
                        />
                    </div>
                ) : null}

                {/*费用外的其他合同详情*/}
                {this.props.view === 'detail' ? (
                    <div className="detail">
                        {this.props.contract.type === VIEW_TYPE.SELL ? (
                            // 销售,服务,回款合同的信息
                            <Tabs activeKey={this.state.currentTabKey} onChange={this.changeCurrentTabKey}>
                                <TabPane tab={Intl.get('contract.101', '合同信息')} key="1">
                                    <GeminiScrollBar ref="gemiScrollBar">
                                        <DetailBasic
                                            ref="detailBasic"
                                            contract={this.props.contract}
                                            teamList={this.state.teamList}
                                            userList={this.state.userList}
                                            getUserList={this.props.getUserList}
                                            isGetUserSuccess={this.props.isGetUserSuccess}
                                            appList={this.props.appList}
                                            handleSubmit={this.handleSubmit}
                                            updateScrollBar={this.updateScrollBar}
                                            showLoading={this.showLoading}
                                            hideLoading={this.hideLoading}
                                            refreshCurrentContract={this.props.refreshCurrentContract}
                                            refreshCurrentContractRepayment={this.props.refreshCurrentContractRepayment}
                                            viewType={this.props.viewType}
                                        />
                                    </GeminiScrollBar>
                                </TabPane>
                                <TabPane tab={Intl.get('contract.103', '合同发票')} key="2">
                                    <GeminiScrollBar ref="gemiScrollBar">
                                        <DetailInvoice
                                            ref="detailInvoice"
                                            contract={this.props.contract}
                                            showLoading={this.showLoading}
                                            hideLoading={this.hideLoading}
                                            refreshCurrentContract={this.props.refreshCurrentContract}
                                            refreshCurrentContractNoAjax={this.props.refreshCurrentContractNoAjax}
                                            updateScrollBar={this.updateScrollBar}
                                        />
                                    </GeminiScrollBar>
                                </TabPane>
                            </Tabs>
                        ) : (
                            // 采购合同的信息
                            <Tabs activeKey={this.state.currentTabKey} onChange={this.changeCurrentTabKey}>
                                <TabPane tab={Intl.get('contract.101', '合同信息')} key="1">
                                    <GeminiScrollBar ref="gemiScrollBar">
                                        <DetailBuyBasic
                                            ref="detailBuyBasic"
                                            contract={this.props.contract}
                                            teamList={this.state.teamList}
                                            userList={this.state.userList}
                                            getUserList={this.props.getUserList}
                                            isGetUserSuccess={this.props.isGetUserSuccess}
                                            handleSubmit={this.handleSubmit}
                                        />
                                    </GeminiScrollBar>
                                </TabPane>
                                <TabPane tab={Intl.get('contract.104', '合同付款')} key="2">
                                    <GeminiScrollBar ref="gemiScrollBar">
                                        <DetailBuyPayment
                                            ref="detailBuyPayment"
                                            contract={this.props.contract}
                                            showLoading={this.showLoading}
                                            hideLoading={this.hideLoading}
                                            refreshCurrentContract={this.props.refreshCurrentContract}
                                            refreshCurrentContractNoAjax={this.props.refreshCurrentContractNoAjax}
                                            updateScrollBar={this.updateScrollBar}
                                        />
                                    </GeminiScrollBar>
                                </TabPane>
                            </Tabs>
                        )}
                    </div>
                ) : null}

                {this.state.isLoading ? (
                    <Spinner className="isloading" />
                ) : null}
            </div>
        );
    }
}
ContractRightPanel.propTypes = {
    contractType: PropTypes.string,
    userList: PropTypes.array,
    teamList: PropTypes.array,
    view: PropTypes.string,
    contract: PropTypes.object,
    hideRightPanel: PropTypes.func,
    addContract: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    getUserList: PropTypes.func,
    isGetUserSuccess: PropTypes.bool,
    appList: PropTypes.array,
    deleteContract: PropTypes.func,
    viewType: PropTypes.string,
    refreshCurrentContractNoAjax: PropTypes.func,
    refreshCurrentContractRepayment: PropTypes.func,
};
module.exports = ContractRightPanel;
