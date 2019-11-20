require('../../css/organization.less');
import {Icon,Alert,Select} from 'antd';
import SelectFullWidth from '../../../../../components/select-fullwidth';
import OrganizationAjax from '../../../../common/public/ajax/organization';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import AlertTimer from '../../../../../components/alert-timer';
const Option = Select.Option;
const ID = 'user-organization';
import USER_MANAGE_PRIVILEGE from '../../privilege-const';
//class的前缀
const CLASS_PREFIX = ID;
//布局使用的常量
const LAYOUT_CONSTANTS = {
    MIN_WIDTH: 80,
    RANGE_WARP_PADDING: 30,
    MENU_ITEM_PADDING: 10
};

class Organization extends React.Component {
    static defaultProps = {
        list: [],
        user_id: '',
        onChange: function(){},
        showBtn: false,
        organization_id: '',
        onModifySuccess: function() {}
    };

    state = {
        list: [],
        displayType: 'text',
        organization_id: this.props.organization_id,
        organization_name: this.props.organization_name,
        submitType: '',
        errorMsg: ''
    };

    componentDidMount() {
        this.getOrganizationList();
    }

    getOrganizationList = () => {
        OrganizationAjax.getOrganizationListAjax().sendRequest().success((list) => {
            this.setState({
                list: list
            });
        }).error((xhr, code , errText) => {
            this.setState({
                list: []
            });
        }).timeout(function() {
            this.setState({
                list: []
            });
        });
    };

    onSelectChange = (value, text) => {
        var trimValue = _.trim(value);
        if(!trimValue) {
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
    };

    getOrganizationOptions = () => {
        var list = this.state.list.map((item) => {
            return (<Option key={item.group_id} value={item.group_id}>{item.group_name}</Option>);
        });
        if(!this.props.showBtn) {
            list.unshift(<Option key="" value="">&nbsp;</Option>);
        }
        return list;
    };

    getSelectedText = () => {
        var target = _.find(this.state.list , (item) => {
            return item.group_id === this.state.organization_id;
        });
        return target ? target.group_name : <span>&nbsp;</span>;
    };

    changeDisplayType = (type) => {
        if(type === 'text') {
            this.setState({
                organization_id: this.props.organization_id,
                organization_name: this.props.organization_name,
                displayType: type,
                submitType: '',
                errorMsg: ''
            });
        } else {
            this.setState({
                displayType: type
            });
        }
    };

    submit = () => {
        if(this.state.submitType === 'loading') {
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
                if(bool === true) {
                    this.setState({
                        submitType: 'success'
                    });
                    this.props.onModifySuccess({organization_id,organization_name});
                    setTimeout(() => {
                        this.setState({
                            submitType: '',
                            displayType: 'text',
                            errorMsg: '',
                            organization_name: organization_name
                        });
                    } , 1000);
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
                    errorMsg: xhr.responseJSON
                });
            }
        });
    };

    renderIndicator = () => {
        if(!this.props.showBtn) {
            return null;
        }
        if(this.state.submitType === 'loading') {
            return (<Icon type="loading" />);
        }
        var _this = this;
        var onSuccessHide = function() {
            _this.setState({
                submitType: '',
                displayType: 'text'
            });
        };
        if(this.state.submitType === 'success') {
            return <AlertTimer message={Intl.get('user.edit.success', '修改成功')} type="success" onHide={onSuccessHide} showIcon/>;
        }
        if(this.state.submitType === 'error') {
            return <Alert message={this.state.errorMsg || Intl.get('common.edit.failed', '修改失败')} type="error" showIcon/>;
        }
    };

    render() {

        if(this.props.showBtn && this.state.displayType === 'text') {
            return (
                <div className="user-basic-edit-field">
                    <span>{this.state.organization_name}</span>
                    { hasPrivilege(USER_MANAGE_PRIVILEGE.USER_MANAGE) ?
                        <i className="iconfont icon-update" onClick={this.changeDisplayType.bind(this,'edit')}/>
                        : null
                    }
                </div>
            );
        }

        var showBtn = this.props.showBtn;

        var options = this.getOrganizationOptions();

        return (
            <div className={CLASS_PREFIX} ref="wrap" id="organization-select-wrap">
                <SelectFullWidth
                    showSearch
                    optionFilterProp="children"
                    onChange={this.onSelectChange}
                    value={this.state.organization_id}
                    notFoundContent={!options.length ? Intl.get('user.no.organization', '暂无组织') : Intl.get('user.no.related.organization', '无相关组织')}
                    getPopupContainer={() => document.getElementById('organization-select-wrap')}
                >
                    {options}
                </SelectFullWidth>
                {showBtn ? <span className="iconfont icon-choose" onClick={this.submit}></span> : null}
                {showBtn ? <span className="iconfont icon-close" onClick={this.changeDisplayType.bind(this , 'text')}></span> : null}
                {this.renderIndicator()}
            </div>
        );
    }
}

module.exports = Organization;
