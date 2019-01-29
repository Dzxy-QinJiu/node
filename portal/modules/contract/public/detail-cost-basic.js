/** Created by 2019-01-29 10:04 */
import { parseAmount } from 'LIB_DIR/func';

var React = require('react');
import {message, Select, Radio} from 'antd';
let Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import Trace from 'LIB_DIR/trace';
require('../../user_manage/public/css/user-info.less');
import DetailCard from 'CMP_DIR/detail-card';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import ajax from '../common/ajax';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import { COST_TYPE } from '../consts';
import { getNumberValidateRule } from 'PUB_DIR/sources/utils/validate-util';
//展示的类型
const DISPLAY_TYPES = {
    EDIT: 'edit',//重新分配销售
    EDIT_TEAM: 'edit_team',//分配团队
    TEXT: 'text'//展示
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
            //切换客户时，重新设置state数据
            this.setState(this.getInitStateData(nextProps));
        }
    }

    //保存编辑的销售
    saveEditUser = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存销售人员的修改');
        console.log(saveObj);
        /*UserInfoAjax.updateUserTeam(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.afterEditTeamSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });*/
    };

    // 保存时间
    saveEditDate = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存日期的修改');
        console.log(saveObj);
    };

    // 保存费用
    saveEditCost = (saveObj, successFunc, errorFunc) => {
        console.log(saveObj);
    };

    // 修改费用类型显示
    setEditable(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '取消对费用的修改');
            this.setState({
                displayType: type
            });
            /*  this.setState({
                loading: false,
                displayType: type,
                userName: this.props.userName,
                userId: this.props.userId,
                salesTeam: this.props.salesTeam,
                salesTeamId: this.props.salesTeamId,
                salesTeamList: this.getSalesTeamList(this.props.userId, this.state.salesManList),
                submitErrorMsg: '',
                salesRole: ''
            });*/
        } else if (type === DISPLAY_TYPES.EDIT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '点击设置费用按钮');
            this.setState({
                displayType: type
            });
        }
    }

    // 费用类型变化
    handleChangeType(e) {
        let {formData} = this.state;
        formData.type = e.target.value;
        this.setState({
            formData
        });
    }

    handleSubmitType(e) {
        if (this.state.loading) return;
        Trace.traceEvent(e, '保存对费用类型的修改');
        this.setState({loading: true});

    }

    handleCancelType(e) {
        Trace.traceEvent(e, '取消对费用类型的修改');
        let {formData} = this.state;
        formData.type = this.props.cost.type || COST_TYPE[0];
        this.setState({
            displayType: 'text',
            formData,
            submitErrorMsg: ''
        });
    }

    renderTypeTitle() {
        return (
            <div className='cost-amout-type'>
                <span className="basic-info-label">
                    {Intl.get('contract.135', '费用类型')}:
                </span>
                {this.state.displayType === 'text' ?
                    <span className="basic-info-text">
                        {this.state.formData.type}
                    </span> : null}
                {this.props.enableEdit && this.state.displayType === 'text' ?
                    <DetailEditBtn title={Intl.get('common.edit', '编辑')} onClick={this.setEditable.bind(this,DISPLAY_TYPES.EDIT)}/> : null}
            </div>
        );
    }
    // 费用类型
    renderTypeContent() {
        const typeOptions = COST_TYPE.map(type => {
            return <RadioButton key={type} value={type}>{type}</RadioButton>;
        });

        if(this.state.displayType === DISPLAY_TYPES.TEXT) {
            return null;
        } else if(this.state.displayType === DISPLAY_TYPES.EDIT) {
            return (
                <div>
                    {this.state.displayType === 'text' ? <span className="value-text">{this.state.formData.type}</span> :
                        <RadioGroup
                            value={this.state.formData.type}
                            size='small'
                            onChange={this.handleChangeType.bind(this)}
                        >
                            {typeOptions}
                        </RadioGroup>
                    }
                </div>
            );
        }
    }

    renderContent() {
        const cost = this.state.formData;

        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + ' - ' + user.group_name}</Option>;
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
                        hasEditPrivilege={hasPrivilege('OPLATE_SALES_COST_ADD')}
                        saveEditSelect={this.saveEditUser}
                        noDataTip={Intl.get('crm.29', '暂无销售人员')}
                        addDataTip={Intl.get('crm.173', '设置销售')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('crm.146', '日期')}:
                    </span>
                    <BasicEditDateField
                        width={EDIT_FEILD_WIDTH}
                        id={cost.id}
                        field="date"
                        format={oplateConsts.DATE_FORMAT}
                        value={cost.date ? moment(cost.date) : ''}
                        saveEditDateInput={this.saveEditDate}
                        hasEditPrivilege={true}
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
                        value={parseAmount(cost.cost)}
                        placeholder={Intl.get('contract.82', '元')}
                        validators={[{
                            required: true, message: Intl.get('contract.134', '请填写费用')},
                        getNumberValidateRule()
                        ]}
                        hasEditPrivilege={true}
                        saveEditInput={this.saveEditCost}
                    />
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className={this.props.className}>
                <DetailCard
                    content={this.renderContent()}
                    className="member-detail-container"
                />
                <DetailCard title={this.renderTypeTitle()}
                    content={this.renderTypeContent()}
                    isEdit={this.state.displayType === 'edit'}
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmitType.bind(this)}
                    handleCancel={this.handleCancelType.bind(this)}
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

