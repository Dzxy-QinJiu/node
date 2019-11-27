var React = require('react');
import {message, Select, Button, Icon} from 'antd';
import classNames from 'classnames';
let Option = Select.Option;
let userData = require('../../../../../public/sources/user-data');
let CrmBasicAjax = require('../../ajax/index');
import batchChangeAjax from '../../ajax/batch-change-ajax';
import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import CrmAction from '../../action/crm-actions';
import {
    getMyTeamTreeList,
    getAllSalesUserList,
    getSalesmanList
} from 'PUB_DIR/sources/utils/common-data-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {formatSalesmanList, checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import {checkPrivilege} from '../../utils/crm-util';
import crmPrivilegeConst from '../../privilege-const';
import {isCommonSalesOrPersonnalVersion} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';

//展示的类型
const DISPLAY_TYPES = {
    EDIT: 'edit',//重新分配销售
    EDIT_SECOND_SALES: 'eidt_second_sales',//修改联合跟进人
    TEXT: 'text'//展示
};
//销售修改的类型
const SALES_EDIT_TYPES = {
    SALES_TEAM: 'sales_team',//负责人及团队的修改
    SECOND_SALES_TEAM: 'second_sales_team'//联合跟进人及团队的修改
};
//编辑表单的宽度设置
const EDIT_FEILD_WIDTH = {
    SALES: 348,
    SECOND_SALES: 320
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
        duplicateSalesWarning: false, //联合跟进人设置为负责人提示
        salesManList: [],//销售及对应团队列表
        allUserList: [],//所有的成员列表（包括销售在内）
        myTeamTree: [],//我所在团队及下级团队树（销售领导判断负责人和联合跟进人是否能修改）
    };

    getInitStateData(props) {
        return {
            displayType: DISPLAY_TYPES.TEXT,
            isLoadingList: true,//正在获取下拉列表中的数据
            isMerge: props.isMerge,
            customerId: props.customerId,
            userName: props.userName,
            userId: props.userId,
            salesTeam: props.salesTeam,
            salesTeamId: props.salesTeamId,
            secondUserId: '',//联合跟进人
            secondUserName: '',
            secondTeamId: '',//联合跟进人所在团队
            secondTeamName: '',
            isLoadingSecondSales: true,//正在获取联合跟进人
            isUnableEditSales: true,//不能编辑负责人
            isUnableEditSecondSales: true,//不能编辑联合跟进人
        };
    }

    componentDidMount() {
        //不是普通销售时，获取负责人、联合跟进人修改时的下拉列表
        if (!isCommonSalesOrPersonnalVersion()) {
            // 验证是否能修改负责人和联合跟进人
            this.checkCanEditSales(this.state.customerId);
            this.checkCanEditSecondSales(this.state.customerId);

            let isManager = this.isManager();
            //管理员修改客户的所属销售时
            if (this.enableEditSales() && isManager) {
                // 获取所有的成员和带团队的销售组合的列表（可以将客户分给除销售外的其他人）
                this.getAllUserList();
            }
            //销售领导修改客户的所属销售或有修改联合跟进人的权限时
            if (this.enableEditSales() && !isManager || this.enableEditSecondSales()) {
                //获取销售所在团队及其下级团队和对应的成员列表
                this.getSalesManList();
            }
            //销售领导获取我所在团队及下级团队树（销售领导判断负责人和联合跟进人是否能修改）
            if (this.enableEditSales() && !isManager) {
                getMyTeamTreeList(result => {
                    this.setState({myTeamTree: _.get(result, 'teamTreeList', [])});
                });
            }
        }
        //获取销售及联合跟进人
        this.getSalesByCustomerId(this.state.customerId);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.customerId !== this.state.customerId) {
            //切换客户时，重新设置state数据
            this.setState(this.getInitStateData(nextProps));
            if(!isCommonSalesOrPersonnalVersion()) {
                // 验证是否能修改负责人和联合跟进人
                this.checkCanEditSales(nextProps.customerId);
                this.checkCanEditSecondSales(nextProps.customerId);
            }
            //获取销售及联合跟进人
            this.getSalesByCustomerId(nextProps.customerId);
        }
    }

    isManager() {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
    }

    //管理员获取所有成员列表
    getAllUserList = () => {
        getAllSalesUserList((allUserList) => {
            if (_.isEmpty(allUserList)) {
                this.setState({
                    allUserList: []
                });
            } else {
                this.setState({allUserList});
            }
        });
    };

    //获取客户所属销售及其团队下拉列表
    getSalesManList = () => {
        getSalesmanList().then(list => {
            if (_.isArray(list) && list.length) {
                //过滤掉停用的成员
                list = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
            } else {
                list = [];
            }
            this.setState({salesManList: list});
        }, errorMsg => {
            this.setState({salesManList: []});
        });
    };

    //获取客户的销售及联合跟进人
    getSalesByCustomerId = (customerId) => {
        if (!customerId) return;
        this.setState({isLoadingSecondSales: true});
        $.ajax({
            url: '/rest/customer/sales/' + customerId,
            type: 'get',
            dateType: 'json',
            success: (salesList) => {
                //不是所属销售的即为联合跟进人
                let secondSales = salesList[0];
                this.setState({
                    isLoadingSecondSales: false,
                    secondUserId: _.get(secondSales, 'user_id', ''),//联合跟进人
                    secondUserName: _.get(secondSales, 'user_name', ''),
                    secondTeamId: _.get(secondSales, 'team_id', ''),//联合跟进人所在团队
                    secondTeamName: _.get(secondSales, 'team_name', ''),
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isLoadingSecondSales: false,
                    secondUserId: '',//联合跟进人
                    secondUserName: '',
                    secondTeamId: '',//联合跟进人所在团队
                    secondTeamName: '',
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
            });
        }, errorMsg => {
            this.setState({salesManList: []});
        });
    };

    //获取所属销售及团队的信息，idStr: userId&&teamId,type:当前修改的是负责人还是联合跟进人
    getSalesTeamParams = (idStr, type) => {
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
        //修改联合跟进人或销售修改客户所属销售时,只需要展示带团队的销售
        let userlist = this.state.salesManList;
        //管理员修改客户所属销售时，需要展示带团队的销售和不带团队的其他角色成员
        if (type === SALES_EDIT_TYPES.SALES_TEAM && userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            userlist = this.state.allUserList;
        }
        let salesman = _.find(userlist, item => item.user_info && item.user_info.user_id === params.userId);
        //销售昵称和所属团队的团队名称的获取
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

    saveSalesTeam = (saveObj, successFunc, errorFunc) => {
        let salesTeamIdStr = saveObj[SALES_EDIT_TYPES.SALES_TEAM];
        let saleParams = this.getSalesTeamParams(salesTeamIdStr, SALES_EDIT_TYPES.SALES_TEAM);
        let submitData = {
            id: saveObj.id,
            type: 'sales',
            user_id: saleParams.userId,
            user_name: saleParams.userName,
            sales_team_id: saleParams.salesTeamId,
            sales_team: saleParams.salesTeam
        };
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存客户负责人的修改');
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(submitData);
            if (_.isFunction(successFunc)) successFunc();
        } else {
            CrmBasicAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();
                    //更新列表中的销售人员
                    this.props.modifySuccess(submitData);
                    //变更销售后，更新所属销售
                    this.setState({
                        userId: submitData.user_id,
                        userName: submitData.user_name,
                        salesTeamId: submitData.sales_team_id,
                        salesTeam: submitData.sales_team
                    });
                    //如果有"联合跟进人将删除"提示
                    if(_.get(this.state,'duplicateSalesWarning')){
                        this.setState({
                            duplicateSalesWarning: false
                        });
                        //将联合跟进人的状态清空
                        this.setState({
                            secondUserId: '',
                            secondUserName: '',
                            secondTeamId: '',
                            secondTeamName: ''
                        });
                    }
                }
            }, errorMsg => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('crm.172', '修改客户负责人失败'));
            });
        }
    };

    saveSecondSales = (saveObj, successFunc, errorFunc) => {
        let salesTeamIdStr = saveObj[SALES_EDIT_TYPES.SECOND_SALES_TEAM];
        let saleParams = this.getSalesTeamParams(salesTeamIdStr, SALES_EDIT_TYPES.SECOND_SALES_TEAM);
        let submitData = {
            id: saveObj.id,
        };
        //修改或添加联合跟进人时(删除时，不传new_user_id等信息)
        if (saleParams.userId) {
            //新分配的联合跟进人及其团队
            submitData.new_user_id = saleParams.userId;
            submitData.new_user_name = saleParams.userName;
            submitData.new_sales_team_id = saleParams.salesTeamId;
            submitData.new_sales_team = saleParams.salesTeam;
        }
        //修改或删除时要传入被替换或删除的联合跟进人（添加时，不传old_user_id等信息）
        if (this.state.secondUserId) {
            submitData.old_sales_team_id = this.state.secondTeamId;
            submitData.old_user_id = this.state.secondUserId;
        }
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存客户联合跟进人的修改');
        CrmBasicAjax.editSecondSales(submitData).then(result => {
            if (_.isFunction(successFunc)) successFunc();
            //修改成功后的更新
            this.setState({
                secondUserId: saleParams.userId,
                secondUserName: saleParams.userName,
                secondTeamId: saleParams.salesTeamId,
                secondTeamName: saleParams.salesTeam
            });
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('crm.219', '修改失败'));
        });
    }
    //修改负责人及团队的处理
    handleEditSalesTeam = (saveObj, successFunc, errorFunc) => {
        //在变更销售之前，先检查是否会超过该销售所拥有客户的数量
        CrmAction.getCustomerLimit({member_id: this.state.userId, num: 1}, (result) => {
            //result>0 ，不可转入或变更客户
            if (_.isNumber(result) && result > 0) {
                if (_.isFunction(errorFunc)) errorFunc(Intl.get('crm.should.reduce.customer', '该负责人拥有客户数已达到上限！'));
            } else {
                this.saveSalesTeam(saveObj, successFunc, errorFunc);
            }
        });
    };

    //获取销售-团队的展示内容
    getSalesTeamText(userName, salesTeam) {
        let text = userName || '';
        if (salesTeam && salesTeam !== 'unknown') {
            text += ` - ${salesTeam}`;
        }
        return text;
    }

    //获取负责人、联合跟进人的下拉选项
    getSelectOptions(type) {
        //修改联合跟进人或销售修改负责人时，下拉选项为：我所在团队及下级团队的人员列表
        let userList = this.state.salesManList;
        //管理员修改客户负责人时，下拉选项为：所有的成员（带团队的销售+其他角色的成员）
        if (type === SALES_EDIT_TYPES.SALES_TEAM && userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            userList = this.state.allUserList;
        }
        let dataList = formatSalesmanList(userList);
        //销售人员与销售团队下拉列表的填充内容
        let salesmanOptions = dataList.map(function(item) {
            return (<Option value={item.value} key={item.value}>{item.name}</Option>);
        });
        //联合跟进人添加可以清空的选项
        if (type === SALES_EDIT_TYPES.SECOND_SALES_TEAM) {
            salesmanOptions.unshift(<Option value='' key=''>&nbsp;</Option>);
        }
        return salesmanOptions;
    }

    //获取负责人、联合跟进人的选择值
    getSelectValue(type) {
        let selectValue = '';
        //修改联合跟进人
        if (type === SALES_EDIT_TYPES.SECOND_SALES_TEAM) {
            let secondTeamId = this.state.secondTeamId ? `&&${this.state.secondTeamId}` : '';
            selectValue = _.get(this.state, 'secondUserId', '') + secondTeamId;
        } else if (type === SALES_EDIT_TYPES.SALES_TEAM) {
            // 修改客户的负责人时
            let salesTeamId = this.state.salesTeamId ? `&&${this.state.salesTeamId}` : '';
            selectValue = _.get(this.state, 'userId', '') + salesTeamId;
        }
        return selectValue;
    }

    //是否是普通销售
    isCommonSales() {
        let userObj = userData.getUserData();
        return _.get(userObj, 'isCommonSales');
    }

    //是否是我团队或下级团队的人
    isMyTeamOrChildUser(teamId,userId) {
        let userObj = userData.getUserData();
        let flag = false;
        if (teamId) {
            //我团队的人
            if (teamId === userObj.team_id) {
                flag = true;
            } else {//下级团队的人
                flag = this.travelMyTeamUserFlag(this.state.myTeamTree, teamId);
            }
        } else if (!userId) {//未设置时，都可以修改(销售及团队都没有时才是未设置的情况，只设置了没有团队的销售时，销售主管不能修改)
            flag = true;
        }
        return flag;
    }

    //递归变量团队树判断是否是我下级团队
    travelMyTeamUserFlag(treeList, teamId) {
        let flag = false;
        _.each(treeList, team => {
            if (team.group_id === teamId) {
                flag = true;
                return false;
            } else if (!_.isEmpty(team.child_groups)) {
                flag = this.travelMyTeamUserFlag(team.child_groups, teamId);
                if (flag) {
                    return false;
                }
            }
        });
        return flag;
    }

    //是否可修改负责人
    enableEditSales() {
        //有修改负责人的权限，可修改，不是普通销售,负责人是我团队的人
        return checkPrivilege([crmPrivilegeConst.CUSTOMER_UPDATE, crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL]) && !this.props.disableEdit && !isCommonSalesOrPersonnalVersion();
    }

    //是否可修改联合跟进人
    enableEditSecondSales() {
        //有修改联合跟进人的权限，可修改，不是普通销售或者个人版
        return checkPrivilege(crmPrivilegeConst.CRM_ASSERT_CUSTOMER_SALES) && !this.props.disableEdit && !isCommonSalesOrPersonnalVersion();
    }

    // 验证是否可以处理负责人
    checkCanEditSales(customerId) {
        if(!customerId) return;
        CrmBasicAjax.checkCrmUpdateUserByCustomerId(customerId).then((res) => {
            if(res) {
                this.setState({isUnableEditSales: false});
            }
        });
    }

    // 验证是否可以处理联合跟进人
    checkCanEditSecondSales(customerId) {
        if(!customerId) return;
        CrmBasicAjax.checkCrmJoinUserByCustomerId(customerId).then((res) => {
            if(res) {
                this.setState({isUnableEditSecondSales: false});
            }
        });
    }

    //负责人选择改变时
    handleChangeSalesTeam = (selectVal) => {
        let userId = _.split(selectVal, '&&')[0];
        let secondUserId = _.get(this.state, 'secondUserId');
        //如果联合跟进人加为负责人
        if(_.isEqual(userId, secondUserId)) {
            //提示信息
            this.setState({
                duplicateSalesWarning: true
            });
        } else {
            //如果不是同一个人并且duplicateSalesWarning为true
            if(_.get(this.state, 'duplicateSalesWarning')){
                this.setState({
                    duplicateSalesWarning: false
                });
            }
        }
    }

    //负责人选择取消时
    handleCancelSalesTeam = () => {
        //如果有"联合跟进人将删除"提示
        if(_.get(this.state,'duplicateSalesWarning')){
            this.setState({
                duplicateSalesWarning: false
            });
        }
    }

    //联合跟进人验证
    checkSecondSales = (rule, value, callback) => {
        value = _.trim(value);
        let secondUserId = _.split(value, '&&')[0];
        let userId = _.get(this.state, 'userId');
        //如果负责人设置为联合跟进人
        if(_.isEqual(userId, secondUserId)) {
            let userName = _.get(this.state, 'userName');
            callback(Intl.get('crm.already.sale.error', '{user}已是负责人，不能再设置联合跟进人', {user: userName}));
        } else {
            callback();
        }
    };

    renderContent = () => {
        let secondUserName = _.get(this.state, 'secondUserName');
        let salesTeam = classNames('sales-team',{'duplicate-sales-warning': this.state.duplicateSalesWarning});
        const hasEditSalesPrivilege = !this.props.disableEdit && !this.state.isUnableEditSales;
        const hasEditSecondSalesPrivilege = !this.props.disableEdit && !this.state.isUnableEditSecondSales;

        return (
            <div className="sales-team-show-block">
                {
                    checkVersionAndType().isPersonalTrial ? null : (
                        <div className={salesTeam}>
                            <span className="sales-team-label">{Intl.get('crm.6', '负责人')}:</span>
                            <BasicEditSelectField
                                width={EDIT_FEILD_WIDTH.SALES}
                                updateMergeCustomer={this.props.updateMergeCustomer}
                                id={this.state.customerId}
                                displayText={this.getSalesTeamText(this.state.userName, this.state.salesTeam)}
                                value={this.getSelectValue(SALES_EDIT_TYPES.SALES_TEAM)}
                                field={SALES_EDIT_TYPES.SALES_TEAM}
                                selectOptions={this.getSelectOptions(SALES_EDIT_TYPES.SALES_TEAM)}
                                onSelectChange={this.handleChangeSalesTeam}
                                hasEditPrivilege={hasEditSalesPrivilege}
                                placeholder={Intl.get('contract.63', '请选择负责人')}
                                saveEditSelect={this.handleEditSalesTeam}
                                cancelEditField={this.handleCancelSalesTeam}
                                noDataTip={Intl.get('contract.64', '暂无负责人')}
                                addDataTip={Intl.get('contract.206', '设置负责人')}
                            />
                            { this.state.duplicateSalesWarning ?
                                <span className="select-warning">{Intl.get('crm.second.sale.delete','保存后，联合跟进人中{user}将被删除', {user: secondUserName})}</span> : null
                            }
                        </div>
                    )
                }
                {
                    hasPrivilege(crmPrivilegeConst.CRM_ASSERT_CUSTOMER_SALES) ? (
                        <div className="sales-team">
                            <span className="sales-team-label">{Intl.get('crm.second.sales', '联合跟进人')}:</span>
                            {this.state.isLoadingSecondSales ? <Icon type="loading"/> :
                                <BasicEditSelectField
                                    width={EDIT_FEILD_WIDTH.SECOND_SALES}
                                    updateMergeCustomer={this.props.updateMergeCustomer}
                                    id={this.state.customerId}
                                    displayText={this.getSalesTeamText(this.state.secondUserName, this.state.secondTeamName)}
                                    value={this.getSelectValue(SALES_EDIT_TYPES.SECOND_SALES_TEAM)}
                                    field={SALES_EDIT_TYPES.SECOND_SALES_TEAM}
                                    selectOptions={this.getSelectOptions(SALES_EDIT_TYPES.SECOND_SALES_TEAM)}
                                    hasEditPrivilege={hasEditSecondSalesPrivilege}
                                    placeholder={Intl.get('crm.select.second.sales', '请选择联合跟进人')}
                                    saveEditSelect={this.saveSecondSales}
                                    validators={[{ validator: this.checkSecondSales }]}
                                    noDataTip={Intl.get('crm.no.second.sales', '暂无联合跟进人')}
                                    addDataTip={Intl.get('crm.set.second.sales', '设置联合跟进人')}
                                />}
                        </div>
                    ) : null
                }
            </div>
        );
    };

    render() {
        return (
            <DetailCard
                content={this.renderContent()}
                className="sales-team-container"
            />);
    }
}
SalesTeamCard.propTypes = {
    disableEdit: PropTypes.bool,
    isMerge: PropTypes.bool,
    customerId: PropTypes.string,
    userName: PropTypes.string,
    userId: PropTypes.string,
    salesTeam: PropTypes.string,
    salesTeamId: PropTypes.string,
    updateMergeCustomer: PropTypes.func,
    modifySuccess: PropTypes.func,

};
module.exports = SalesTeamCard;
