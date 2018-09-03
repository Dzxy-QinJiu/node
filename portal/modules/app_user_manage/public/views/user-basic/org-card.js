var React = require('react');
/**
* Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
* 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
* Created by xuning on 2018 
*/
import DetailCard from 'CMP_DIR/detail-card';
import { Select, Input } from 'antd';

import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import { StatusWrapper } from 'antc';
import { PropTypes } from 'prop-types';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import OrganizationAjax from 'MOD_DIR/common/public/ajax/organization';
const Option = Select.Option;

class OrgCard extends React.Component {
    constructor(props) {
        super();
        this.state = {
            list: [],
            displayType: 'text',
            organization_id: props.organization_id,
            organization_name: props.organization_name,
            submitType: '',
            errorMsg: ''
        };
    }
    componentDidMount() {
        this.getOrganizationList();
    }
    toggleEdit = () => {
        this.setState({
            showEdit: !this.state.showEdit
        });
    }
    getOrganizationList() {
        OrganizationAjax.getOrganizationListAjax().sendRequest().success((list) => {
            this.setState({
                list: list
            });
        }).error((xhr, code, errText) => {
            this.setState({
                list: []
            });
        }).timeout(function() {
            this.setState({
                list: []
            });
        });
    }
    onSelectChange(value, text) {
        var trimValue = $.trim(value);
        if (!trimValue) {
            this.props.onChange('');
            this.setState({
                organization_id: ''
            });
        } else {
            this.props.onChange(value);
            this.setState({
                organization_id: value
            });
        }
    }
    getOrganizationOptions() {
        var list = this.state.list.map((item) => {
            return (<Option key={item.group_id} value={item.group_id}>{item.group_name}</Option>);
        });
        if (!this.props.showBtn) {
            list.unshift(<Option key="" value="">&nbsp;</Option>);
        }
        return list;
    }
    getSelectedText() {
        var target = _.find(this.state.list, (item) => {
            return item.group_id === this.state.organization_id;
        });
        return target ? target.group_name : <span>&nbsp;</span>;
    }   
    submit() {
        if (this.state.submitType === 'loading') {
            return;
        }
        var organization_id = this.state.organization_id;
        var organization_name = this.getSelectedText();
        //要提交的数据
        var appUser = {
            //用户id
            user_id: this.props.user_id,
            //属于
            group_id: organization_id
        };
        this.setState({
            submitType: 'loading'
        });
        $.ajax({
            url: '/rest/global/organization/' + appUser.user_id + '/' + appUser.group_id,
            dataType: 'json',
            type: 'put',
            success: (bool) => {
                if (bool === true) {
                    this.setState({
                        submitType: 'success'
                    });
                    this.props.onModifySuccess({ organization_id, organization_name });
                    setTimeout(() => {
                        this.setState({
                            submitType: '',
                            displayType: 'text',
                            errorMsg: '',
                            organization_name: organization_name
                        });
                    }, 1000);
                } else {
                    this.setState({
                        submitType: 'error',
                        errorMsg: Intl.get('common.edit.failed', '修改失败')
                    });
                }
            },
            error: (xhr) => {
                this.setState({
                    submitType: 'error',
                    errorMsg: xhr.responseJSON || Intl.get('common.edit.failed', '修改失败')
                });
            }
        });
    }
    render() {
        const options = this.getOrganizationOptions();
        var showBtn = this.props.showBtn;
        const { userInfo, sales_team } = this.props;
        const hasEditAuth = hasPrivilege('USER_ORGANIZATION_MEMBER_EDIT') && hasPrivilege('APP_USER_EDIT');
        return (
            <DetailCard
                loading={this.state.submitType === 'loading'}
                titleBottomBorderNone={true}
                handleCancel={this.toggleEdit}
                handleSubmit={this.submit.bind(this)}
                isEdit={this.state.showEdit}
                title={(
                    <div className="sales-team-show-block">
                        <div className="sales-team">
                            <span className="sales-team-label">
                                {Intl.get('user.detail.belongToOrg', '所属组织')}
                            </span>
                            <span className="sales-team-text">
                                {userInfo.group_name}
                            </span>
                            {
                                hasEditAuth ?
                                    <DetailEditBtn
                                        title={Intl.get('common.edit', '编辑')}
                                        onClick={this.toggleEdit}
                                    /> : null
                            }

                        </div>
                    </div>
                )}
                content={(
                    <div className="sales-team-show-block">                       
                        {
                            this.state.showEdit ?
                                <div className='user-organization' ref="wrap" id="organization-select-wrap">
                                    <SelectFullWidth
                                        showSearch
                                        optionFilterProp="children"
                                        onChange={this.onSelectChange.bind(this)}
                                        value={this.state.organization_id}
                                        notFoundContent={!options.length ? Intl.get('user.no.organization', '暂无组织') : Intl.get('user.no.related.organization', '无相关组织')}
                                        getPopupContainer={() => document.getElementById('organization-select-wrap')}
                                    >
                                        {options}
                                    </SelectFullWidth>
                                    <StatusWrapper
                                        errorMsg={this.state.errorMsg}
                                    />
                                </div> :
                                <div className="sales-team">
                                    <span className="sales-team-label">
                                        {Intl.get('user.user.team', '团队')}:
                                    </span>
                                    <span className="sales-team-text">
                                        {sales_team.sales_team_name}
                                    </span>
                                </div>
                        }
                    </div>
                )}
            />
        );
    }
}

OrgCard.defaultProps = {
    onChange: function() { },
    showBtn: false,
    organization_id: '',
    onModifySuccess: function() { }
};

OrgCard.propTypes = {
    user_id: PropTypes.string,
    userInfo: PropTypes.object,
    sales_team: PropTypes.object,
    onModifySuccess: PropTypes.func,
    showBtn: PropTypes.bool,
    onChange: PropTypes.func,
    organization_name: PropTypes.string,
    organization_id: PropTypes.string,
};
export default OrgCard;