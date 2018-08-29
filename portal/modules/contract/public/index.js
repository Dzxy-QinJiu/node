var React = require('react');
import './style.less';
import classNames from 'classnames';
import {message, Button, Icon, Modal, Radio, Select} from 'antd';
const RadioGroup = Radio.Group;
import ajax from '../common/ajax';
import appAjaxTrans from '../../common/public/ajax/app';
import teamAjaxTrans from '../../common/public/ajax/team';
import routeList from '../common/route';
import TopNav from '../../../components/top-nav';
const Checker = require('../../../components/privilege/checker');
const PrivilegeChecker = Checker.PrivilegeChecker;
const hasPrivilege = Checker.hasPrivilege;
import Filter from './filter';
import List from './list';
import ContractRightPanel from './right-panel';
import ImportContractTemplate from './import_contract_template';
const scrollBarEmitter = require('../../../public/sources/utils/emitters').scrollBarEmitter;
import DatePicker from '../../../components/datepicker';
import rightPanelUtil from '../../../components/rightPanel';
import Trace from 'LIB_DIR/trace';
const RightPanel = rightPanelUtil.RightPanel;
const salesmanAjax = require('../../common/public/ajax/salesman');
const querystring = require('querystring');
import {VIEW_TYPE} from '../consts';
//正则
import {pathParamRegex} from 'PUB_DIR/sources/utils/consts';

//根据路由地址获取页面类型  sell buy repayment
const getTypeByPath = () => {
    return location.pathname.split('/').pop();
};

const defaultSorter = {field: 'date', order: 'descend'};

class Contract extends React.Component {
    constructor(props) {
        super(props);
        const location = props.location;
        //通过订单生成的合同id
        const orderGenerateContractId = location.state && location.state.contractId;
        //是否是从订单转过来的
        let isFromOrder = false;
        //判断条件中的PUSH是用来判断是否是通过history.pushState重定向过来的，重定向过来的location.action的值是PUSH，刷新页面的时候location.action的值是POP
        if (orderGenerateContractId && location.action === 'PUSH') {
            isFromOrder = true;
        }

        this.state = {
            contractList: [],
            appList: [],
            teamList: [],
            userList: [],
            typeList: [],
            rangeParams: [],
            type: getTypeByPath(),
            dateType: 'date',
            sum: '',
            contractCount: 0,
            currentContract: {},
            lastId: '',
            sorter: defaultSorter,
            listenScrollBottom: true,
            rightPanelView: '',
            isRightPanelShow: false,
            isTheadFilterShow: false,
            isExportModalShow: false,
            isListLoading: false,
            isScrollTop: false,
            isGetUserSuccess: true,
            //是否是从订单页面过来的
            isFromOrder: isFromOrder,
            //根据订单生成的合同id
            orderGenerateContractId: orderGenerateContractId,
            exportRange: 'filtered',
            contractTemplateRightPanelShow: false
        };
    }

    componentDidMount() {
        this.getTeamList();
        this.getAppList();
        this.getUserList();
        this.getTypeList();

        const queryParams = this.getQueryParams();

        const sorter = this.getSorter(this.state.type);

        if (_.isEmpty(queryParams)) {
            this.getContractList(true, sorter);
        } else {
            this.getContractList(true, sorter, queryParams);
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            type: getTypeByPath()
        }, () => {
            this.showContractList(this.state.type);
        });
    }

    getQueryParams = () => {
        const queryStr = location.search.slice(1);
        const queryParams = querystring.parse(queryStr);

        return queryParams;
    };

    getSorter = (type) => {
        let sorter = defaultSorter;

        if (type === VIEW_TYPE.REPAYMENT) {
            sorter = {field: 'repayment_date', order: 'descend'};
        }

        return sorter;
    };

    getCondition = () => {
        let reqData = {query: {}};

        const Filter = this.refs.filter;
        const ContractList = this.refs.contractList;

        if (Filter) _.extend(reqData.query, Filter.state.condition);
        _.extend(reqData.query, ContractList.state.condition);
        reqData.query.type = this.state.type;
        //如果是从订单点击查看合同过来的，则按传过来的合同id搜索
        if (this.state.isFromOrder) {
            reqData.query.id = this.state.orderGenerateContractId;
        }
        reqData.rang_params = this.state.rangeParams.concat(ContractList.state.rangeParams);

        return reqData;
    };

    showContractList = (type) => {
        const Filter = this.refs.filter;
        const ContractList = this.refs.contractList;
        const DateSelector = this.refs.dateSelector;

        if (DateSelector) {
            //日期选择器恢复到初始状态
            DateSelector.setState({
                timeRangeRecord: 'all',
                start_time_record: '',
                e_recordnd_time: '',
            });
        }

        const sorter = this.getSorter(type);

        this.setState({
            type: type,
            isTheadFilterShow: false,
            contractList: [],
            rangeParams: [],
            dateType: 'date',
            sorter: sorter,
        }, () => {
            this.getContractList(true);
        });
    };

    getContractList = (reset, sorter, queryParams) => {
        if (reset) {
            this.setState({
                isListLoading: true,
                isScrollTop: true,
                lastId: '',
            });
        }

        if (sorter) {
            this.state.sorter = sorter;
        } else {
            sorter = this.state.sorter;
        }

        //当前tab页选中的是合同回款时，获取回款列表，否则查询合同
        let handler = 'queryContract';
        const viewType = this.state.type;

        if (viewType === VIEW_TYPE.REPAYMENT) {
            handler = 'getRepaymentList';
        }

        if (viewType === VIEW_TYPE.COST) {
            handler = 'queryCost';
        }

        const route = _.find(routeList, route => route.handler === handler);
        let url = route.path;

        if (!reset) {
            url += '?id=' + this.state.lastId;
        }

        const reqData = this.getCondition();

        if (viewType === VIEW_TYPE.COST) {
            delete reqData.query.type;
        }

        if (queryParams) {
            reqData.query.sales_team = queryParams.team_name;

            const timestamp = parseInt(queryParams.time);

            if (timestamp) {
                const momentObj = moment(timestamp);
                const from = momentObj.startOf('month').valueOf();
                const to = momentObj.endOf('month').valueOf();
                reqData.rang_params = [{
                    name: 'date',
                    type: 'time',
                    from: from,
                    to: to,
                }];
            }
        }

        const params = {
            page_size: 20,
            sort_field: sorter.field,
            order: sorter.order,
        };

        const arg = {
            url: url,
            type: route.method,
            data: reqData,
            params: params
        };

        ajax(arg).then(result => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.state.isListLoading = false;
            this.state.isScrollTop = false;

            if (result && result.code === 0) {
                let list = _.isArray(result.list) ? result.list : [];

                if (!reset) {
                    this.state.contractList = this.state.contractList.concat(list);
                } else {
                    this.state.contractList = list;
                }

                //在更新后的合同列表中查找当前打开的合同
                const updatedCurrentContract = _.find(this.state.contractList, contract => contract.id === this.state.currentContract.id);

                if (updatedCurrentContract) {
                    //若找到，则更新
                    this.state.currentContract = updatedCurrentContract;
                } else {
                    //若未找到，但新列表有值，则将打开的合同设为列表中的第一项
                    //若新列表为空，则置空
                    this.state.currentContract = this.state.contractList[0] || '';
                }

                if (result.sum) this.state.sum = result.sum;

                this.state.contractCount = result.total || 0;
                this.state.listenScrollBottom = this.state.contractCount > this.state.contractList.length;
                //获取回款列表时用于下拉加载分页的id用回款id，否则用合同id
                const id = this.state.type === VIEW_TYPE.REPAYMENT ? 'repayment_id' : 'id';
                this.state.lastId = list.length ? _.last(list)[id] : '';
            } else {
                message.error(Intl.get('contract.111', '获取数据失败'));
            }

            //如果是从订单中点击查看合同过来的，自动打开右侧面板
            if (this.state.isFromOrder) {
                this.state.isFromOrder = false;
                this.state.shouldRightPanelShow = true;
            } else {
                this.state.shouldRightPanelShow = false;
            }
            //重置合同列表时，关闭右侧面板
            if (reset) this.state.isRightPanelShow = false;

            this.setState(this.state);
        })
            .fail(err => {
                this.state.isListLoading = false;
                this.state.isScrollTop = false;
                message.error((err && err.message) || Intl.get('contract.111', '获取数据失败'));
            });
    };

    //重新获取当前合同信息
    //参数说明：
    //id：合同id
    //isUpdateList：是否更新列表中的对应项，默认为更新
    //newContract：更新后的合同
    refreshCurrentContract = (id, isUpdateList = true, newContract) => {
        //如果提供了更新后的合同，则直接使用，不用再发请求获取了
        if (newContract) {
            if (isUpdateList) {
                let index = _.findIndex(this.state.contractList, item => item.id === id);
                if (index > -1) this.state.contractList[index] = newContract;
            }

            this.state.currentContract = newContract;

            this.setState(this.state);

            return;
        }

        let handler = 'queryContract';

        if (this.state.type === VIEW_TYPE.COST) {
            handler = 'queryCost';
        }

        const route = _.find(routeList, route => route.handler === handler);

        const params = {
            page_size: 1,
            sort_field: 'id',
            order: 'descend',
        };

        const arg = {
            url: route.path,
            type: route.method,
            data: {query: {id: id}},
            params: params
        };

        ajax(arg).then(result => {
            if (result && result.code === 0 && _.isArray(result.list) && result.list.length) {
                const updatedContract = result.list[0];

                if (isUpdateList) {
                    let index = _.findIndex(this.state.contractList, item => item.id === id);
                    if (index > -1) this.state.contractList[index] = updatedContract;
                }

                this.state.currentContract = updatedContract;
                this.setState(this.state);
            }
        });
    };

    // 前端更新操作后的数据（不请求后端接口获取最新数据）
    refreshCurrentContractNoAjax = (propName, type, data = {}, id) => {
        let currentContract = this.state.currentContract;
        switch(type) {
            case 'add':
                currentContract[propName].unshift(data);
                break;
            case 'update':
                currentContract[propName][_.findIndex(currentContract[propName], item => item.id === id)] = data;
                break;
            case 'delete':
                currentContract[propName] = _.filter(currentContract[propName], item => item.id !== id);
                break;
            case 'addOrUpdateInvoiceBasic':
                currentContract[propName] = data;
                break;
        }
        this.setState({
            currentContract
        });
    };

    deleteContract = (id) => {
        let index = _.findIndex(this.state.contractList, item => item.id === id);
        if (index > -1) this.state.contractList.splice(index, 1);
        this.setState(this.state);
    };

    exportData = () => {
        let exportName = {};
        exportName[VIEW_TYPE.SELL] = '导出销售合同';
        exportName[VIEW_TYPE.BUY] = '导出采购合同';
        exportName[VIEW_TYPE.REPAYMENT] = '导出合同回款';

        Trace.traceEvent('合同管理', exportName[this.state.type]);
        const route = _.find(routeList, route => route.handler === 'exportData');

        const sorter = this.state.sorter;

        const params = {
            page_size: 10000,
            sort_field: sorter.field,
            order: sorter.order,
        };

        const url = route.path.replace(pathParamRegex, function($0, $1) {
            return params[$1];
        });

        const reqData = this.state.exportRange === 'all' ? {query: {type: this.state.type}} : this.getCondition();

        let form = $('<form>', {action: url, method: 'post'});

        form.append($('<input>', {name: 'reqData', value: JSON.stringify(reqData)}));

        //将构造的表单添加到body上
        //Chrome 56 以后不在body上的表单不允许提交了
        $(document.body).append(form);

        form.submit();

        form.remove();

        this.hideExportModal();
    };

    addContract = (contract) => {
        this.state.contractList.unshift(contract);
        this.setState(this.state);
    };

    getAppList = () => {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(list => {
            list = _.isArray(list) ? list : [];
            this.setState({appList: list});
        });
    };

    getTeamList = () => {
        teamAjaxTrans.getTeamListAjax().sendRequest().success(list => {
            list = _.isArray(list) ? list : [];
            this.setState({teamList: list});
        });
    };

    getUserList = () => {
        salesmanAjax.getSalesmanListAjax().addQueryParam({with_ketao_member: true}).sendRequest()
            .success(result => {
                if (_.isArray(result)) {
                    let list = [];
                    result.forEach(item => {
                        if (_.isObject(item)) {
                            list.push({
                                user_id: item.user_info.user_id,
                                nick_name: item.user_info.nick_name,
                                group_id: item.user_groups[0].group_id,
                                group_name: item.user_groups[0].group_name
                            });
                        }
                    });

                    this.setState({
                        isGetUserSuccess: true,
                        userList: list
                    });
                }
            })
            .error(() => {
                this.setState({
                    isGetUserSuccess: false,
                });
            })
            .timeout(() => {
                this.setState({
                    isGetUserSuccess: false,
                });
            });
    };

    getTypeList = () => {
        const route = _.find(routeList, route => route.handler === 'getContractTypeList');

        const arg = {
            url: route.path,
            type: route.method,
        };

        ajax(arg).then(result => {
            if (result && _.isArray(result.result)) {
                this.state.typeList = result.result;
                this.setState(this.state);
            }
        });
    };

    showRightPanel = (view, rowIndex) => {
        Trace.traceEvent('合同管理', '打开合同添加面板');
        this.state.currentContract = !isNaN(rowIndex) ? this.state.contractList[rowIndex] : {};
        this.state.isRightPanelShow = true;
        this.state.rightPanelView = view || '';
        this.setState(this.state);
    };

    hideRightPanel = () => {
        this.setState({
            isRightPanelShow: false,
        });

        //取消合同列表项选中状态
        $('.custom-tbody .ant-table-row').removeClass('current-row');
    };

    toggleTheadFilter = () => {
        this.setState({
            isTheadFilterShow: !this.state.isTheadFilterShow
        }, () => {
            if (!this.state.isTheadFilterShow) {
                var condition = this.refs.contractList.state.condition;
                var keys = _.keys(condition);
                _.each(keys, (key) => {
                    delete condition[key];
                });
                this.refs.contractList.setState({
                    condition: condition
                }, () => {
                    this.getContractList(true);
                });
            }

        });
    };

    showExportModal = () => {
        this.setState({
            isExportModalShow: true,
        });
    };

    hideExportModal = () => {
        this.setState({
            isExportModalShow: false,
        });
    };

    onExportRangeChange = (e) => {
        this.setState({
            exportRange: e.target.value
        });
    };

    showContractTemplateRightPanel = () => {
        this.setState({
            contractTemplateRightPanelShow: true
        });
    };

    closeContractTemplatePanel = () => {
        this.setState({
            contractTemplateRightPanelShow: false
        });
    };

    onDateChange = (startTime, endTime) => {
        if (!startTime && !endTime) {
            this.state.rangeParams = [];
        } else {
            const dateRangeParam = {
                from: startTime,
                to: endTime,
                name: this.state.dateType,
                type: 'time',
            };
            this.state.rangeParams = [dateRangeParam];
        }

        this.setState(this.state, () => {
            this.getContractList(true);
        });
    };

    onDateTypeChange = (type) => {
        Trace.traceEvent('合同管理', '选择签订时间' + type);
        const rangeParams = this.state.rangeParams;

        if (rangeParams[0]) rangeParams[0].name = type;

        this.setState({
            dateType: type,
            rangeParams: rangeParams,
        }, () => {
            this.getContractList(true);
        });
    };

    render() {
        //点击添加合同按钮时，默认打开哪个视图
        const addBtnView = this.state.type === VIEW_TYPE.SELL ? 'chooseType' : 'buyForm';

        //时间类型
        let dateTypes = [{
            field: 'date',
            name: Intl.get('contract.34', '签订时间')
        }];

        if (this.state.type === VIEW_TYPE.REPAYMENT) {
            dateTypes = dateTypes.concat([{
                field: 'repayment_date',
                name: Intl.get('contract.122', '回款时间')
            }]);
        } else {
            dateTypes = dateTypes.concat([{
                field: 'start_time',
                name: Intl.get('contract.120', '开始时间')
            }, {
                field: 'end_time',
                name: Intl.get('contract.105', '结束时间')
            }]);
        }

        const isContractView = [VIEW_TYPE.SELL, VIEW_TYPE.BUY].indexOf(this.state.type) > -1;

        return (
            <div className="contract-list" data-tracename="合同管理">
                <TopNav>
                    <TopNav.MenuList />
                </TopNav>
                <div className="top-wrap">
                    <div className="privilege-btns">
                        {isContractView || this.state.type === VIEW_TYPE.REPAYMENT ? (
                            <PrivilegeChecker
                                onClick={this.showExportModal}
                                check="OPLATE_CONTRACT_QUERY"
                                className="btn"
                            >
                                {this.state.type === VIEW_TYPE.REPAYMENT ? (
                                    <ReactIntl.FormattedMessage id="contract.140" defaultMessage="导出回款"/>
                                ) : (
                                    <ReactIntl.FormattedMessage id="contract.113" defaultMessage="导出合同"/>
                                )}
                            </PrivilegeChecker>
                        ) : null}

                        {this.state.type === VIEW_TYPE.COST ? (
                            <PrivilegeChecker
                                onClick={this.showExportModal}
                                check="OPLATE_SALES_COST_QUERY"
                                className="btn"
                            >
                                {Intl.get('common.export', '导出')}{Intl.get('contract.133', '费用')}
                            </PrivilegeChecker>
                        ) : null}

                        {isContractView ? (
                            <PrivilegeChecker
                                onClick={this.showContractTemplateRightPanel}
                                check="OPLATE_CONTRACT_ADD"
                                className="btn"
                            >
                                <ReactIntl.FormattedMessage id="contract.114" defaultMessage="导入合同"/>
                            </PrivilegeChecker>
                        ) : null}

                        {isContractView ? (
                            <PrivilegeChecker
                                onClick={this.showRightPanel.bind(this, addBtnView)}
                                check="OPLATE_CONTRACT_ADD"
                                className="btn"
                            >
                                <ReactIntl.FormattedMessage id="contract.98" defaultMessage="添加合同"/>
                            </PrivilegeChecker>
                        ) : null}

                        {this.state.type === VIEW_TYPE.COST ? (
                            <PrivilegeChecker
                                onClick={this.showRightPanel.bind(this, 'detailCost')}
                                check="OPLATE_SALES_COST_ADD"
                                className="btn"
                            >
                                <ReactIntl.FormattedMessage id="contract.127" defaultMessage="添加费用"/>
                            </PrivilegeChecker>
                        ) : null}
                    </div>
                    <div className="pull-left" style={this.state.type === VIEW_TYPE.REPAYMENT ? {marginRight: 40} : {}}>
                        {isContractView ? (
                            <Filter
                                ref="filter"
                                type={this.state.type}
                                getContractList={this.getContractList.bind(this, true)}
                            />
                        ) : null}
                        <Button type="ghost" className="btn-filter" onClick={this.toggleTheadFilter}>
                            <ReactIntl.FormattedMessage id="common.filter" defaultMessage="筛选"/>
                            { this.state.isTheadFilterShow ? <Icon type="up"/> : <Icon type="down"/> }
                        </Button>

                        {this.state.type !== VIEW_TYPE.COST ? (
                            <Select
                                value={this.state.dateType}
                                onChange={this.onDateTypeChange}
                                className="date-type"
                            >
                                {dateTypes.map(dateType => {
                                    return <Option key="dateType.field" value={dateType.field}>{dateType.name}</Option>;
                                })}
                            </Select>
                        ) : null}

                        <div className="date-filter">
                            <DatePicker
                                ref="dateSelector"
                                disableDateAfterToday={true}
                                range="all"
                                onSelect={this.onDateChange}
                            >
                                <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                            </DatePicker>
                        </div>
                    </div>
                </div>

                <ImportContractTemplate
                    showFlag={this.state.contractTemplateRightPanelShow}
                    closeContractTemplatePanel={this.closeContractTemplatePanel}
                    getContractList={this.getContractList.bind(this, true)}
                />

                <List
                    ref="contractList"
                    contractList={this.state.contractList}
                    sum={this.state.sum}
                    type={this.state.type}
                    teamList={this.state.teamList}
                    userList={this.state.userList}
                    typeList={this.state.typeList}
                    contractCount={this.state.contractCount}
                    listenScrollBottom={this.state.listenScrollBottom}
                    isListLoading={this.state.isListLoading}
                    isScrollTop={this.state.isScrollTop}
                    isTheadFilterShow={this.state.isTheadFilterShow}
                    isRightPanelShow={this.state.isRightPanelShow}
                    shouldRightPanelShow={this.state.shouldRightPanelShow}
                    getContractList={this.getContractList}
                    showRightPanel={this.showRightPanel}
                />
                <RightPanel
                    showFlag={this.state.isRightPanelShow}
                    className={'right-panel-' + this.state.type}
                >
                    {this.state.isRightPanelShow ? (
                        <ContractRightPanel
                            view={this.state.rightPanelView}
                            contract={this.state.currentContract}
                            appList={this.state.appList}
                            teamList={this.state.teamList}
                            userList={this.state.userList}
                            getUserList={this.getUserList}
                            isGetUserSuccess={this.state.isGetUserSuccess}
                            hideRightPanel={this.hideRightPanel}
                            getContractList={this.getContractList.bind(this, true)}
                            refreshCurrentContract={this.refreshCurrentContract}
                            refreshCurrentContractNoAjax={this.refreshCurrentContractNoAjax}
                            addContract={this.addContract}
                            deleteContract={this.deleteContract}
                            viewType={this.state.type}
                        />
                    ) : null}
                </RightPanel>
                <Modal
                    className="contract-export-modal"
                    visible={this.state.isExportModalShow}
                    closable={false}
                    onOk={this.exportData}
                    onCancel={this.hideExportModal}
                >
                    <div>
                        <ReactIntl.FormattedMessage id="contract.116" defaultMessage="导出范围"/>：
                        <RadioGroup
                            value={this.state.exportRange}
                            onChange={this.onExportRangeChange}
                        >
                            <Radio key="all" value="all"><ReactIntl.FormattedMessage id="common.all"
                                defaultMessage="全部"/></Radio>
                            <Radio key="filtered" value="filtered"><ReactIntl.FormattedMessage id="contract.117"
                                defaultMessage="符合当前筛选条件"/></Radio>
                        </RadioGroup>
                    </div>
                    <div>
                        <ReactIntl.FormattedMessage id="contract.118" defaultMessage="导出类型"/>：
                        <ReactIntl.FormattedMessage id="contract.152" defaultMessage="excel格式"/>
                    </div>
                </Modal>
            </div>
        );
    }
}

module.exports = Contract;

