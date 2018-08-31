var React = require('react');
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var Button = require('antd').Button;
var AlertTimer = require('../../../../components/alert-timer');
var AuthorityAction = require('../action/authority-actions');
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var ModalDialog = require('../../../../components/ModalDialog');
import Trace from 'LIB_DIR/trace';

function noop() {
}

class AuthorityList extends React.Component {
    static defaultProps = {
        addAuthority: noop,
        deleteAuthority: noop,
        authorityGroup: {
            permissionGroupName: '',
            permissionList: []
        }
    };

    state = {
        authorityGroup: this.props.authorityGroup
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            authorityGroup: this.props.authorityGroup
        });
        this.setState({
            authorityGroup: nextProps.authorityGroup,
        });
    }

    showAddAuthorityForm = (authorityGroup) => {
        this.props.showAddAuthorityForm(authorityGroup, 'addAuthority');
    };

    deleteAuthorityGroup = (authorityGroup) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.authority-operation'),'点击删除权限');
        var authorityIds = [];
        if (authorityGroup && _.isArray(authorityGroup.permissionList) && authorityGroup.permissionList.length > 0) {
            authorityGroup.permissionList.forEach(function(authority) {
                authorityIds.push(authority.permissionId);
            });
        }
        this.props.deleteAuthorityGroup(authorityIds, authorityGroup.permissionGroupName);
    };

    //编辑权限分组
    showAuthorityGroupForm = (authorityGroup) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-update'),'点击编辑权限分组');
        AuthorityAction.beforeEditAuthority(authorityGroup);
        this.props.showAuthorityGroupForm(authorityGroup);
    };

    //展示删除时的提示框
    showModalDialog = (authorityGroup) => {
        this.props.showModalDialog(authorityGroup);
    };

    //隐藏删除时的提示框
    hideModalDialog = (authorityGroup) => {
        this.props.hideModalDialog(authorityGroup);
    };

    //展示删除时的提示框
    showAuthorityModalDialog = (authority) => {
        this.props.showAuthorityModalDialog(authority);
    };

    //展示删除时的提示框
    hideAuthorityModalDialog = (authority) => {
        this.props.hideAuthorityModalDialog(authority);
    };

    showAuthorityInfo = (authority) => {
        this.props.showAuthorityInfo(authority);
    };

    hideDelTooltip = () => {
        this.props.clearDelAuthGroupErrorMsg();
    };

    render() {
        var _this = this;
        var authorityGroup = this.props.authorityGroup;
        authorityGroup.authorityIDs = [];
        var authorityListDivHeight = this.props.authorityListDivHeight;
        var modalContentClassifyName = Intl.get('authority.del.group', '确定要删除这个权限组吗？');

        return (
            <div className="authority-container-div modal-container" style={{height: authorityListDivHeight}} data-tracename="权限列表">
                <div className="authority-title-div">
                    <div className="authority-title-name">{authorityGroup.permissionGroupName}</div>
                    <div className="authority-operation">
                        <PrivilegeChecker check={this.props.delAuthorityStr}>
                            <Button className="authority-btn-class icon-delete iconfont"
                                onClick={_this.showModalDialog.bind(_this, authorityGroup)}>
                            </Button>
                        </PrivilegeChecker>
                        <PrivilegeChecker check={this.props.editAuthorityStr}>
                            <Button className="authority-btn-class icon-update iconfont"
                                onClick={_this.showAuthorityGroupForm.bind(_this, authorityGroup)}
                            >
                            </Button>
                        </PrivilegeChecker>
                    </div>
                </div>
                <div className="authority-content" style={{height: authorityListDivHeight - 30}}>
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        {
                            authorityGroup.permissionList.map(function(authority, i) {
                                return (<div className='authority-content-list' key={i}>
                                    <div className="authority-authorityName">{authority.permissionName}</div>
                                </div>);
                            })
                        }
                    </GeminiScrollbar>
                </div>
                <ModalDialog modalContent={modalContentClassifyName}
                    modalShow={authorityGroup.modalDialogFlag}
                    container={_this}
                    hideModalDialog={_this.hideModalDialog.bind(_this,authorityGroup)}
                    delete={_this.deleteAuthorityGroup.bind(_this, authorityGroup)}
                />
                {
                    _this.props.delAuthGroupErrorMsg ? ( <AlertTimer time={2000}
                        message={_this.props.delAuthGroupErrorMsg}
                        type='error' showIcon
                        onHide={this.hideDelTooltip}/>) : null
                }
            </div>
        );
    }
}

module.exports = AuthorityList;
