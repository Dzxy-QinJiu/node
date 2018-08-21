import DetailCard from 'CMP_DIR/detail-card';
import { Select, Input } from 'antd';

import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import { StatusWrapper } from 'antc';
import { PropTypes } from 'prop-types';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import OrganizationAjax from 'MOD_DIR/common/public/ajax/organization';
import { classNames } from 'classnames';
const Option = Select.Option;
const ID = 'user-organization';
//class的前缀
const CLASS_PREFIX = ID;
var UserDetailEditField = require('CMP_DIR/basic-edit-field/input');

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
    componentDidMount() {

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
        const hasEditAuth = hasPrivilege('USER_ORGANIZATION_MEMBER_EDIT') && hasPrivilege('APP_USER_EDIT');
        return (
            <DetailCard
                className='contact-card-container'
                title={Intl.get('crm.5', '联系方式')}
                content={(
                    <div className="sales-team-show-block">
                        <div className="sales-team clearfix">
                            <span className="sales-team-label">
                                {Intl.get('common.email', '邮箱')}
                            </span>
                            <span className="sales-team-text">
                                {/* {userInfo.email} */}
                                <UserDetailEditField
                                    user_id={userInfo.user_id}
                                    saveEditInput={this.props.saveEditInput}
                                    showBtn={true}
                                    {...this.props.email}
                                />
                            </span>
                        </div>
                        <div className="sales-team clearfix">
                            <span className="sales-team-label">
                                {Intl.get('user.phone', '手机号')}
                            </span>
                            <span className="sales-team-text">
                                <UserDetailEditField
                                    user_id={userInfo.user_id}
                                    saveEditInput={this.props.saveEditInput}
                                    showBtn={true}
                                    {...this.props.phone}
                                />
                            </span>
                        </div>
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