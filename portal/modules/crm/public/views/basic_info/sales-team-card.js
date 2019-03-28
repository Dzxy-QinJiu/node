var React = require('react');
import {message, Select, Button, Icon} from 'antd';
let Option = Select.Option;
let userData = require('../../../../../public/sources/user-data');
let CrmBasicAjax = require('../../ajax/index');
import batchChangeAjax from '../../ajax/batch-change-ajax';
import batchChangeAction from '../../action/batch-change-actions';
import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import CrmAction from '../../action/crm-actions';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {formatSalesmanList} from 'PUB_DIR/sources/utils/common-method-util';
//展示的类型
const DISPLAY_TYPES = {
    EDIT: 'edit',//重新分配销售
    EDIT_TEAM: 'edit_team',//分配团队
    TEXT: 'text'//展示
};
const PRIVILEGES = {
    EDIT_TEAM_MANAGER: 'CRM_MANAGER_UPDATE_CUSTOMER_SALES_TEAM',//管理员修改所属团队的权限
    EDIT_TEAM_USER: 'CRM_USER_UPDATE_CUSTOMER_SALES_TEAM'//销售修改所属团队的权限
};

class SalesTeamCard extends React.Component {
    static defaultProps = {
        list: [],
        onChange: function() {
        },
        onModifySuccess: function() {
        }
    };

    state = {
        ...this.getInitStateData(this.props),
        salesManList: [],
        mySubTeamList: [],//我所在团队及下级团队列表
    };

    getInitStateData(props){
        return {
            list: [],//下拉列表中的数据
            displayType: DISPLAY_TYPES.TEXT,
            isLoadingList: true,//正在获取下拉列表中的数据
            enableEdit: props.enableEdit,
            enableEditTeam: props.enableEditTeam,
            enableEidtSecondSales: props.enableEidtSecondSales,
            isMerge: props.isMerge,
            customerId: props.customerId,
            userName: props.userName,
            userId: props.userId,
            salesTeam: props.salesTeam,
            salesTeamId: props.salesTeamId,
            salesTeamList: [],
            loading: false,
            submitErrorMsg: '',
            salesRole: '',
            secondUserId: '',//联合跟进人
            secondUserName: '',
            secondTeamId: '',//联合跟进人所在团队
            secondTeamName: ''
        };
    }

    componentDidMount() {
        //有修改所属销售的权限时
        if (this.state.enableEdit) {
            //获取团队和对应的成员列表（管理员：所有，销售：所在团队及其下级团队和对应的成员列表）
            if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
                // 管理员角色（可以将客户分给除销售外的其他人）
                this.getAllUserList();
            } else { //销售角色
                this.getSalesManList();
            }
        }
        //有修改所属团队的权限时
        if (this.state.enableEditTeam) {
            //获取我所在团队及下级团队列表
            getMyTeamTreeAndFlattenList(({teamTree, teamList}) => {
                this.setState({mySubTeamList: teamList});
            });
        }
        if (!this.props.hideSalesRole) {
            //获取销售对应的角色
            this.getSalesRoleByMemberId(this.state.userId);
        }
        //获取销售及联合跟进人
        this.getSalesByCustomerId(this.state.customerId);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.customerId !== this.state.customerId) {
            //切换客户时，重新设置state数据
            this.setState(this.getInitStateData(nextProps));
            if (!nextProps.hideSalesRole) {
                //获取销售对应的角色
                this.getSalesRoleByMemberId(nextProps.userId);
            }
            //获取销售及联合跟进人
            this.getSalesByCustomerId(nextProps.customerId);
        }
    }

    getSalesTeamList = (userId, salesManList) => {
        let salesTeamList = [];
        _.each(salesManList, (salesMan) => {
            if (salesMan.user_info && salesMan.user_info.user_id === userId && _.isArray(salesMan.user_groups)) {
                salesMan.user_groups.forEach(function(group) {
                    salesTeamList.push({
                        group_id: group.group_id,
                        group_name: group.group_name
                    });
                });
            }
        });
        return salesTeamList;
    };

    //管理员获取所有成员列表
    getAllUserList = () => {
        batchChangeAction.getALLUserList({}, (result) => {
            if (_.isArray(result) && result.length) {
                this.setState({salesManList: result, salesTeamList: []});
            } else {
                this.setState({
                    salesManList: []
                });
            }
        });
    };

    //获取客户所属销售及其团队下拉列表
    getSalesManList = () => {
        batchChangeAjax.getSalesManList().then(list => {
            if (_.isArray(list) && list.length) {
                //过滤掉停用的成员
                list = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
            } else {
                list = [];
            }
            this.setState({salesManList: list, salesTeamList: this.getSalesTeamList(this.props.userId, list)});
        }, errorMsg => {
            this.setState({salesManList: []});
        });
    };

    getSalesRoleByMemberId = (memberId) => {
        if (!memberId) return;
        $.ajax({
            url: '/rest/sales/role',
            type: 'get',
            dateType: 'json',
            data: {member_id: memberId},
            success: (data) => {
                if (data && data.teamrole_name) {
                    this.setState({
                        salesRole: data.teamrole_name,
                    });
                }
            },
            error: (errorMsg) => {
                this.setState({
                    salesRole: '',
                });
            }
        });
    };
    //获取客户的销售及联合跟进人
    getSalesByCustomerId = (customerId) => {
        if (!customerId) return;
        $.ajax({
            url: '/rest/customer/sales/' + customerId,
            type: 'get',
            dateType: 'json',
            success: (salesList) => {
                //不是所属销售的即为联合跟进人
                let secondSales = _.find(salesList, sales => sales.user_id !== this.state.userId);
                this.setState({
                    secondUserId: _.get(secondSales, 'user_id', ''),//联合跟进人
                    secondUserName: _.get(secondSales, 'user_name', ''),
                    secondTeamId: _.get(secondSales, 'team_id', ''),//联合跟进人所在团队
                    secondTeamName: _.get(secondSales, 'team_name', '')
                });
            },
            error: (errorMsg) => {
                this.setState({
                    secondUserId: '',//联合跟进人
                    secondUserName: '',
                    secondTeamId: '',//联合跟进人所在团队
                    secondTeamName: ''
                });
            }
        });
    };


    // 获取普通销售所在团队里的成员列表
    getSalesTeamMembers = () => {
        let userInfo = userData.getUserData();
        let teamId = userInfo.team_id;
        batchChangeAjax.getSalesTeamMembers(teamId).then(list => {
            if (_.isArray(list) && list.length) {
                //过滤掉停用的成员
                list = _.filter(list, sales => sales && sales.status === 1);
            } else {
                list = [];
            }
            this.setState({
                salesManList: list,
                salesTeamList: [{
                    group_id: teamId,
                    group_name: userInfo.team_name
                }]
            });
        }, errorMsg => {
            this.setState({salesManList: []});
        });
    };

    //获取所属销售及团队的信息，idStr: userId&&teamId
    getSalesTeamParams = (idStr) => {
        let params = {
            userId: '',
            userName: '',
            salesTeamId: '',
            salesTeam: ''
        };
        //销售id和所属团队的id
        let idArray = idStr.split('&&');
        if (_.isArray(idArray) && idArray.length) {
            if (idArray.length === 1) {
                params.userId = idArray[0];
                params.salesTeamId = '';
            } else {
                params.userId = idArray[0];
                params.salesTeamId = idArray[1];
            }

        }
        //销售昵称和所属团队的团队名称
        let salesman = _.find(this.state.salesManList, item => item.user_info && item.user_info.user_id === params.userId);
        if (salesman) {
            params.userName = salesman.user_info ? salesman.user_info.nick_name : '';
            if (_.isArray(salesman.user_groups) && salesman.user_groups.length) {
                let team = _.find(salesman.user_groups, team => team.group_id === params.salesTeamId);
                if (team) {
                    params.salesTeam = team.group_name;
                }
            }
        }
        return params;
    };

    //更新销售人员
    handleSalesManChange = (idStr) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '修改销售人员及其团队');
        let params = this.getSalesTeamParams(idStr);
        this.setState(params);
        if (params.userId && !this.props.hideSalesRole) {
            this.getSalesRoleByMemberId(params.userId);
        }
    };
    //修改团队
    onTeamChange = (teamId) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '修改所属团队');
        if (teamId) {
            let team = _.find(this.state.mySubTeamList, item => item.group_id === teamId);
            this.setState({salesTeamId: teamId, salesTeam: _.get(team, 'group_name', ''), userId: '', userName: ''});
        }
    };
    changeDisplayType = (type) => {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '取消对销售人员/团队的修改');
            if (!this.props.hideSalesRole) {
                this.getSalesRoleByMemberId(this.props.userId);
            }
            this.setState({
                loading: false,
                displayType: type,
                userName: this.props.userName,
                userId: this.props.userId,
                salesTeam: this.props.salesTeam,
                salesTeamId: this.props.salesTeamId,
                salesTeamList: this.getSalesTeamList(this.props.userId, this.state.salesManList),
                submitErrorMsg: '',
                salesRole: ''
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '点击设置销售按钮');
            this.setState({
                displayType: type
            });
        } else if (type === DISPLAY_TYPES.EDIT_TEAM) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '点击分配团队按钮');
            this.setState({
                displayType: type
            });
        }
    };

    //回到展示状态
    backToDisplay = () => {
        this.setState({
            loading: false,
            displayType: DISPLAY_TYPES.TEXT,
            submitErrorMsg: ''
        });
    };

    submitData = () => {
        let submitData = {
            id: this.state.customerId,
            type: 'sales',
            user_id: this.state.userId,
            user_name: this.state.userName,
            sales_team_id: this.state.salesTeamId,
            sales_team: this.state.salesTeam
        };
        if (this.props.isMerge) {
            this.props.updateMergeCustomer(submitData);
            this.backToDisplay();
        } else if (this.state.displayType === DISPLAY_TYPES.EDIT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '重新分配客户的所属销售');
            CrmBasicAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    this.backToDisplay();
                    //更新列表中的销售人员
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('crm.172', '修改客户所属销售失败')
                });
            });
        }
    };
    //只提交修改的团队时（分配客户给团队）
    onlySubmitEditTeam() {
        let submitData = {
            id: this.state.customerId,
            user_id: '',
            user_name: '',
            sales_team_id: this.state.salesTeamId,
            sales_team: this.state.salesTeam
        };
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存所属团队的修改');
        this.setState({
            loading: false
        });
        let type = 'user';//CRM_USER_UPDATE_CUSTOMER_SALES_TEAM
        if (hasPrivilege(PRIVILEGES.EDIT_TEAM_MANAGER)) {
            type = 'manager';
        }
        $.ajax({
            url: `/rest/crm/${type}/team`,
            dataType: 'json',
            type: 'put',
            data: submitData,
            success: (data) => {
                if (data) {
                    this.backToDisplay();
                    //清空列表中的销售人员
                    this.props.modifySuccess(submitData);
                } else {
                    this.setState({
                        loading: false,
                        submitErrorMsg: Intl.get('member.change.group.failed', '修改所属团队失败')
                    });
                }
            },
            error: errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('member.change.group.failed', '修改所属团队失败')
                });
            }
        });
    }

    handleSubmit = () => {
        if (this.state.loading) return;
        //将客户分配给某个团队
        if (this.state.displayType === DISPLAY_TYPES.EDIT_TEAM) {
            this.onlySubmitEditTeam();
        } else {
            //将客户分配给某个销售时
            if (this.state.userId === this.props.userId) {
                //没做修改时，直接回到展示状态
                this.backToDisplay();
                return;
            }
            //在变更销售之前，先检查是否会超过该销售所拥有客户的数量
            if (this.state.displayType === DISPLAY_TYPES.EDIT) {
                this.setState({loading: true});
                CrmAction.getCustomerLimit({member_id: this.state.userId, num: 1}, (result) => {
                    //result>0 ，不可转入或变更客户
                    if (_.isNumber(result) && result > 0) {
                        message.warn(Intl.get('crm.should.reduce.customer', '该销售拥有客户数量已达到上限！'));
                        this.setState({loading: false});
                    } else {
                        this.submitData();
                    }
                });
            } else {
                this.submitData();
            }
        }
    };

    //更新团队
    handleTeamChange = (value) => {
        const team = _.find(this.state.salesTeamList, item => item.group_id === value);
        this.setState({
            salesTeamId: value,
            salesTeam: _.get(team, 'group_name', '')
        });
    };

    renderTitle = () => {
        return (
            <div className="sales-team-show-block">
                <div className="sales-team">
                    <span className="sales-team-label">{Intl.get('common.belong.sales', '所属销售')}:</span>
                    <span className="sales-team-text">
                        {this.state.userName}
                        {/*{this.state.salesTeam ? ` - ${this.state.salesTeam}` : ''}*/}
                    </span>
                    {this.state.enableEdit ? (
                        <DetailEditBtn title={Intl.get('common.edit', '编辑')}
                            onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}/>) : null}
                </div>
                {this.props.hideSalesRole ? null :
                    <div className="sales-role">
                        <span className="sales-team-label">{Intl.get('crm.detail.sales.role', '销售角色')}:</span>
                        <span className="sales-team-text">
                            {this.state.salesRole || ''}
                        </span>
                    </div>}
                <div className="sales-team">
                    <span className="sales-team-label">{Intl.get('common.belong.team', '所属团队')}:</span>
                    <span className="sales-team-text">
                        {this.state.salesTeam}
                    </span>
                    {this.state.enableEditTeam && !this.state.isMerge ? (
                        <DetailEditBtn title={Intl.get('common.edit', '编辑')}
                            onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT_TEAM)}/>) : null}
                </div>
                {this.state.secondUserName ? (
                    <div className="sales-team">
                        <span className="sales-team-label">{Intl.get('crm.second.sales', '联合跟进人')}:</span>
                        <span className="sales-team-text">
                            {this.state.secondUserName}
                            {this.state.secondTeamName ? ` - ${this.state.secondTeamName}` : null}
                        </span>
                    </div>
                ) : null}
            </div>
        );
    };
    //只修改团队的界面渲染
    renderOnlyChangeTeamSelect() {
        let teamOptions = _.map(this.state.mySubTeamList, (item, key) => {
            return (<Option value={item.group_id} key={key}>{item.group_name}</Option>);
        });

        return (
            <div className="sales-team-edit-block" id="team-edit-block">
                <Select
                    placeholder={Intl.get('crm.31', '请选择销售团队')}
                    showSearch
                    onChange={this.onTeamChange}
                    value={this.state.salesTeamId}
                    optionFilterProp="children"
                    notFoundContent={teamOptions.length ? Intl.get('member.no.group', '暂无此团队') : Intl.get('member.no.groups', '暂无团队') }
                    getPopupContainer={() => document.getElementById('team-edit-block')}

                >
                    {teamOptions}
                </Select>
            </div>
        );
    }

    //修改销售的界面渲染
    renderChangeSalesSelect() {
        let dataList = formatSalesmanList(this.state.salesManList);
        //销售人员与销售团队下拉列表的填充内容
        let salesmanOptions = dataList.map(function(item) {
            return (<Option value={item.value} key={item.value}>{item.name}</Option>);
        });
        var selectValue = '';
        if (this.state.salesTeamId && !userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            selectValue = `${this.state.userId}&&${this.state.salesTeamId}`;
        } else {
            selectValue = `${this.state.userId}`;
        }
        return (
            <div className="sales-team-edit-block" id="sales-team-edit-block">
                <Select
                    placeholder={Intl.get('crm.17', '请选择销售人员')}
                    showSearch
                    onChange={this.handleSalesManChange}
                    value={selectValue}
                    optionFilterProp="children"
                    notFoundContent={salesmanOptions.length ? Intl.get('crm.30', '无相关销售') : Intl.get('crm.29', '暂无销售') }
                    getPopupContainer={() => document.getElementById('sales-team-edit-block')}

                >
                    {salesmanOptions}
                </Select>
            </div>
        );
    }

    renderContent = () => {
        if (this.state.displayType === DISPLAY_TYPES.TEXT) {
            return null;
        } else if (this.state.displayType === DISPLAY_TYPES.EDIT_TEAM) {
            //只修改团队的界面渲染
            return this.renderOnlyChangeTeamSelect();
        } else {
            //修改销售的界面渲染
            return this.renderChangeSalesSelect();
        }
    };

    //编辑销售及团队时的按钮渲染
    renderEditButtons() {
        if (this.state.displayType === DISPLAY_TYPES.EDIT_TEAM) {
            //将客户分配团队时，渲染分配按钮
            return (
                <Button className="button-edit-team" type="primary"
                    onClick={this.handleSubmit.bind(this)}>
                    {Intl.get('clue.customer.distribute', '分配')}
                </Button>
            );
        } else {//重新分配按钮的渲染
            return (
                <span>
                    {this.state.enableEdit ? (
                        <Button className="button-redistribution" type="primary"
                            onClick={this.handleSubmit.bind(this)}>
                            {Intl.get('crm.sales.redistribution', '重新分配')}
                        </Button>) : null}
                </span>
            );
        }
    }

    renderHandleSaveBtns = () => {
        return (<div className="button-container">
            <Button className="button-cancel"
                onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.TEXT)}>
                {Intl.get('common.cancel', '取消')}
            </Button>
            {this.renderEditButtons()}
            {this.state.loading ? (
                <Icon type="loading" className="save-loading"/>) : this.state.submitErrorMsg ? (
                <span className="save-error">{this.state.submitErrorMsg}</span>
            ) : null}
        </div>);
    };

    render() {
        return (<DetailCard title={this.renderTitle()}
            content={this.renderContent()}
            className="sales-team-container"
            isEdit={this.state.displayType !== DISPLAY_TYPES.TEXT}
            renderHandleSaveBtns={this.renderHandleSaveBtns}
        />);
    }
}
SalesTeamCard.propTypes = {
    enableEdit: PropTypes.bool,
    enableEditTeam: PropTypes.bool,
    isMerge: PropTypes.bool,
    customerId: PropTypes.string,
    userName: PropTypes.string,
    userId: PropTypes.string,
    salesTeam: PropTypes.string,
    salesTeamId: PropTypes.string,
    hideSalesRole: PropTypes.bool,
    updateMergeCustomer: PropTypes.func,
    modifySuccess: PropTypes.func
};
module.exports = SalesTeamCard;
