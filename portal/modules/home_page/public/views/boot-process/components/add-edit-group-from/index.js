/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/02.
 */
import './index.less';
import {Form, Input} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const FormItem = Form.Item;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import SalesTeamActions from 'MOD_DIR/sales_team/public/action/sales-team-actions';
import MemberFormAction from 'MOD_DIR/member_manage/public/action/member-form-actions';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';


class AddEditGroupForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            submitErrMsg: '',
            organization: getOrganization()
        };
    }

    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if(err) return;
            let addGroupData = {
                groupName: values.title
            };
            let {organization, loading,submitErrMsg} = this.state;
            // 判断是否是根组织
            let isRoot = _.isEqual(values.superiorTeam, organization.id);
            if(!isRoot) {
                addGroupData.parentGroup = values.superiorTeam;//上级组织
            }
            loading = true;
            this.setState({loading});
            SalesTeamActions.saveAddGroup(addGroupData, (result, addTeam) => {
                submitErrMsg = result.saveMsg;
                loading = false;
                this.setState({submitErrMsg,loading});
                // 添加成功后的处理
                if(result.saveResult === 'success') {
                    this.props.cancelAddGroup(addTeam);
                }
            });
        });
    };

    handleCancel = () => {
        this.props.onHandleClose(false);
    };

    renderTeamOptions = () => {
        let teamOptions = [];
        let salesTeamList = _.cloneDeep(this.props.salesTeamList);
        let organization = this.state.organization;
        if(!_.isEmpty(organization)) {
            salesTeamList = [{
                group_id: _.get(organization,'id', ''),
                group_name: _.get(organization,'name','')
            }].concat(salesTeamList);
        }
        if (_.isArray(salesTeamList) && salesTeamList.length > 0) {
            salesTeamList.forEach(team => {
                teamOptions.push(<Option key={team.group_id} value={team.group_id}>
                    {team.group_name}
                </Option>);
            });
        }
        return teamOptions;
    };

    render() {
        let {getFieldDecorator} = this.props.form;
        const formLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };


        return (
            <div className="add-sales-team-form">
                <Form layout='horizontal' className="form" autoComplete="off">
                    <FormItem
                        {...formLayout}
                        label={Intl.get('guide.add.member.team.name', '部门名称')}
                    >
                        {
                            getFieldDecorator('title', {
                                rules: [
                                    {
                                        required: true,
                                        min: 1,
                                        max: 20 ,
                                        message: Intl.get('common.input.character.rules', '最少1个字符,最多8个字符')
                                    }
                                ]
                            })(
                                <Input placeholder={Intl.get('guide.add.member.team.name.placeholder', '请输入部门名称')}/>
                            )
                        }
                    </FormItem>
                    <FormItem
                        {...formLayout}
                        label={Intl.get('organization.parent.department', '上级部门')}
                    >
                        {
                            getFieldDecorator('superiorTeam', {
                                // initialValue: '',
                                rules: [{
                                    required: true, message: Intl.get('organization.select.parent.department', '请选择上级部门')
                                }]
                            })(
                                <AntcSelect
                                    placeholder={Intl.get('contract.67', '请选择部门')}
                                    showSearch
                                    optionFilterProp="children"
                                    notFoundContent={Intl.get('member.no.department', '暂无此部门')}
                                    searchPlaceholder={Intl.get('member.search.department.by.name', '输入部门名称搜索')}
                                    getPopupContainer={this.props.getPopupContainer}
                                >
                                    {this.renderTeamOptions()}
                                </AntcSelect>
                            )
                        }
                    </FormItem>
                    <FormItem
                        prefixCls="add-sales-team-btn-item ant-form"
                        wrapperCol={{span: 24}}>
                        <SaveCancelButton
                            loading={this.state.loading}
                            saveErrorMsg={this.state.submitErrMsg}
                            handleSubmit={this.handleSubmit}
                            handleCancel={this.handleCancel}
                        />
                    </FormItem>
                </Form>
            </div>
        );
    }

}
AddEditGroupForm.defaultProps = {
    salesTeamList: [],
    onHandleClose: function() {},
    cancelAddGroup: function() {},
    getPopupContainer: function() {}
};
AddEditGroupForm.propTypes = {
    form: PropTypes.object,
    salesTeamList: PropTypes.array,
    onHandleClose: PropTypes.func,
    cancelAddGroup: PropTypes.func,
    getPopupContainer: PropTypes.func,
};

export default Form.create()(AddEditGroupForm);