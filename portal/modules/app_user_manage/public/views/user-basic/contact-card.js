/**
* Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
* 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
* Created by xuning on 2018.8.28
*/
import DetailCard from 'CMP_DIR/detail-card';
import { PropTypes } from 'prop-types';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
var UserDetailEditField = require('CMP_DIR/basic-edit-field-new/input');
import userManagePrivilege from '../../privilege-const';

class ContactCard extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showEdit: {
                phone: false,
                email: false,
            },
            list: [],
            displayType: 'text',
            organization_id: props.organization_id,
            organization_name: props.organization_name,
            submitType: '',
            errorMsg: ''
        };
    }
    toggleEdit = (type) => {
        const showEdit = this.state.showEdit;
        showEdit[type] = !this.state.showEdit[type];
        this.setState({
            showEdit
        });
    }
    render() {
        const { userInfo } = this.props;
        const hasEditAuth = hasPrivilege(userManagePrivilege.USER_MANAGE);
        return (
            <DetailCard
                className='contact-card-container'
                title={Intl.get('crm.5', '联系方式')}
                content={(
                    <div className="sales-team-show-block">
                        {
                            hasEditAuth || this.props.email.value ? (
                                <div className="sales-team clearfix">
                                    <span className="sales-team-label">
                                        {Intl.get('common.email', '邮箱')}:
                                    </span>
                                    <span className="sales-team-text">
                                        <UserDetailEditField
                                            id={userInfo.user_id}
                                            saveEditInput={this.props.saveEditInput}
                                            showBtn={true}
                                            {...this.props.email}
                                        />
                                    </span>
                                </div>
                            ) : null
                        }
                        {
                            hasEditAuth || this.props.phone.value ? (
                                <div className="sales-team clearfix">
                                    <span className="sales-team-label">
                                        {Intl.get('user.phone', '手机号')}:
                                    </span>
                                    <span className="sales-team-text">
                                        <UserDetailEditField
                                            id={userInfo.user_id}
                                            saveEditInput={this.props.saveEditInput}
                                            showBtn={true}
                                            {...this.props.phone}
                                        />
                                    </span>
                                </div>
                            ) : null
                        }
                    </div>
                )}
            />
        );
    }
}

ContactCard.defaultProps = {
    onChange: function() { },
    showBtn: false,
    organization_id: '',
    onModifySuccess: function() { }
};

ContactCard.propTypes = {
    user_id: PropTypes.string,
    phone: PropTypes.object,
    email: PropTypes.object,
    saveEditInput: PropTypes.func,
    userInfo: PropTypes.object,
    organization_name: PropTypes.string,
    organization_id: PropTypes.string,
};
export default ContactCard;