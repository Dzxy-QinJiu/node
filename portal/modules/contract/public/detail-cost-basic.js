/** Created by 2019-01-29 10:04 */
var React = require('react');
import {message, Select, Radio} from 'antd';
let Option = Select.Option;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import ajax from '../common/ajax';
import { COST_TYPE, OPERATE } from '../consts';
import oplateConsts from 'LIB_DIR/consts';
import { getNumberValidateRule } from 'PUB_DIR/sources/utils/validate-util';
import routeList from 'MOD_DIR/contract/common/route';
//展示的类型
const DISPLAY_TYPES = {
    EDIT: 'edit',//编辑
    TEXT: 'text'//展示
};
const COST_TYPES = {
    cost: '费用',
    date: '日期',
    type: '费用类型',
};

const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 354;

class DetailCostCard extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props){
        const formData = _.clone({...props.cost,type: props.cost.type || COST_TYPE[0]});
        return {
            formData,
            displayType: DISPLAY_TYPES.TEXT,
            enableEdit: props.enableEdit,
            enableTransfer: props.enableTransfer,
            loading: false,
            submitErrorMsg: ''
        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        let cost = _.isEmpty(nextProps.cost);
        if(!cost && _.get(nextProps.cost,'id') !== this.state.formData.id){
            //切换费用时，重新设置state数据
            this.setState(this.getInitStateData(nextProps));
        }
    }

    //保存编辑的销售
    saveEditUser = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存销售人员的修改');
        const selectedUser = _.find(this.props.userList, user => user.user_id === saveObj.sales_id);
        saveObj.sales_name = selectedUser.nick_name;
        saveObj.sales_team_id = selectedUser.group_id;
        saveObj.sales_team = selectedUser.group_name;
        this.editCost(saveObj,successFunc,errorFunc);
    };

    // 费用类型提交
    saveEdithandle = (type,options) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存对${COST_TYPES[type]}类型的修改`);
        this.editCost(options[0],options[1],options[2]);
    };

    editCost(data,successFunc,errorFunc) {
        const handler = 'updateCost';
        const route = _.find(routeList, route => route.handler === handler);
        const arg = {
            url: route.path,
            type: route.method,
            data: data || {},
        };


        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(OPERATE['update'] + '费用信息成功');
                if(_.isFunction(successFunc)) successFunc();
                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);
                if(hasResult){
                    let contract = _.extend({},this.props.cost,result.result);
                    this.props.refreshCurrentContract(this.props.cost.id,true,contract);
                }
            } else {
                message.error(result.msg || OPERATE[type] + '费用信息失败');
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    }

    renderContent() {
        const cost = this.state.formData;

        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + ' - ' + user.group_name}</Option>;
        });
        const typeOptions = COST_TYPE.map(type => {
            return <Option key={type} value={type}>{type}</Option>;
        });

        return (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('user.salesman', '销售人员')}:
                    </span>
                    <BasicEditSelectField
                        id={cost.id}
                        displayText={cost.sales_name + ' - ' + cost.sales_team}
                        value={cost.sales_id}
                        field="sales_id"
                        selectOptions={userOptions}
                        placeholder={Intl.get('crm.17', '请选择销售人员')}
                        validators={[{message: Intl.get('crm.17', '请选择销售人员')}]}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={this.props.enableEdit}
                        saveEditSelect={this.saveEditUser}
                        noDataTip={Intl.get('crm.29', '暂无销售人员')}
                        addDataTip={Intl.get('crm.173', '设置销售')}
                        editBtnTip={Intl.get('crm.173', '设置销售')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('crm.146', '日期')}:
                    </span>
                    <BasicEditDateField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={cost.id}
                        field="date"
                        format={oplateConsts.DATE_FORMAT}
                        value={cost.date ? moment(cost.date) : ''}
                        saveEditDateInput={(...option) => this.saveEdithandle('date',option)}
                        hasEditPrivilege={this.props.enableEdit}
                        editBtnTip={`${Intl.get('common.update', '修改')}${Intl.get('crm.146', '日期')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.135', '费用类型')}:
                    </span>
                    <BasicEditSelectField
                        id={cost.id}
                        displayText={cost.type}
                        value={cost.type}
                        field="type"
                        selectOptions={typeOptions}
                        placeholder={Intl.get('contract.136', '请选择费用类型')}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={this.props.enableEdit}
                        saveEditSelect={(...option) => this.saveEdithandle('type',option)}
                        noDataTip={Intl.get('contract.137', '暂无费用类型')}
                        editBtnTip={`${Intl.get('common.update', '修改')}${Intl.get('contract.135', '费用类型')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.133', '费用')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={cost.id}
                        field="cost"
                        value={cost.cost}
                        placeholder={Intl.get('contract.82', '元')}
                        validators={[{
                            required: true, message: Intl.get('contract.134', '请填写费用')},
                        getNumberValidateRule()
                        ]}
                        hasEditPrivilege={this.props.enableEdit}
                        saveEditInput={(...option) => this.saveEdithandle('cost',option)}
                        editBtnTip={`${Intl.get('common.update', '修改')}${Intl.get('contract.133', '费用')}`}
                    />
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className={this.props.className} data-tracename='费用基本信息'>
                <DetailCard
                    content={this.renderContent()}
                    className="member-detail-container"
                />
            </div>
        );
    }
}
DetailCostCard.propTypes = {
    cost: PropTypes.object,
    userList: PropTypes.array,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    addContract: PropTypes.func,
    hideRightPanel: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    deleteContract: PropTypes.func,
    getUserList: PropTypes.func,
    isGetUserSuccess: PropTypes.bool,
    teamList: PropTypes.array,
    enableEdit: PropTypes.bool,
    className: PropTypes.string
};
module.exports = DetailCostCard;

