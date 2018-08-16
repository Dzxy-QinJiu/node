/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/15.
 * 可展示可编辑的多个联系人及联系方式组件
 * */

require('./css/multi-contact-inputs.less');
import {Form} from 'antd';
const FormItem = Form.Item;
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';
import DynamicAddDelContacts from '../dynamic-add-del-contacts';
class MultiContactInputs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            displayType: this.props.displayType || 'text',
            contacts: this.props.contacts,
            submitErrorMsg: '',
            hoverShowEdit: true,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                contacts: nextProps.contacts,
                loading: false,
                displayType: nextProps.displayType || 'text',
                submitErrorMsg: '',
            });
        }
    }

    setEditable(e) {
        this.setState({
            displayType: 'edit',
            contacts: this.state.contacts,
        });
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    }

    handleSubmit(e) {
        Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
        var contacts = this.state.contacts;
        var saveObj = {
            id: this.props.id
        };
        saveObj[this.props.field] = contacts;
        this.setState({
            loading: true
        });

        const setDisplayState = () => {
            this.setState({
                loading: false,
                submitErrorMsg: '',
                contacts: contacts,
                displayType: 'text'
            });
        };

        if ((contacts !== this.props.contacts)) {
            this.props.saveEditDateInput(saveObj, () => {
                setDisplayState();
            }, (errorMsg) => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });

        } else {
            setDisplayState();
        }
    }

    handleCancel(e) {
        this.setState({
            contacts: this.props.contacts,
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + this.props.field + '的修改');
    }

    changeSourceTime(value) {
        let timestamp = value && value.valueOf() || '';
        this.setState({
            value: timestamp
        });

    }

    render() {
        var displayCls = classNames({
            'basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var displayText = this.state.contacts;
        let textBlock = null;
        var cls = classNames('edit-container', {
            'hover-show-edit': this.state.hoverShowEdit && this.props.hasEditPrivilege
        });
        let contacts = this.state.contacts;
        if (this.state.displayType === 'text') {
            if (displayText) {
                textBlock = (
                    <div className={cls}>
                        <div className="contacts-info-container">
                            {_.map(contacts, (contactItem, index) => {
                                return (
                                    <div className="contact-item" key={index}>
                                        <div className="contact-name">{contactItem.name}</div>
                                        {_.map(contactItem.phone, (phone) => {
                                            return (
                                                <span className="contact-way">
                                                    <i className="iconfont icon-phone-call-out"/>
                                                    {phone}
                                                </span>
                                            );
                                        })}
                                        {_.map(contactItem.qq, (qq) => {
                                            return (
                                                <span className="contact-way-item">
                                                    <i className="iconfont icon-qq"/>
                                                    {qq}
                                                </span>
                                            );
                                        })}
                                        {_.map(contactItem.email, (email) => {
                                            return (
                                                <span className="contact-way">
                                                    <i className="iconfont icon-email"/>
                                                    {email}
                                                </span>
                                            );
                                        })}
                                        {_.map(contactItem.weChat, (weChat) => {
                                            return (
                                                <span className="contact-way">
                                                    <i className="iconfont icon-weChat"/>
                                                    {weChat}
                                                </span>
                                            );
                                        })}
                                    </div>
                                );

                            })}
                        </div>
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn title={this.props.editBtnTip}
                                onClick={this.setEditable.bind(this)}/>) : null}
                    </div>
                );
            } else {
                textBlock = (
                    <span className="inline-block basic-info-text no-data-descr">
                        {this.props.hasEditPrivilege ? (
                            <a onClick={this.setEditable.bind(this)}>{this.props.addDataTip}</a>) : this.props.noDataTip}

                    </span>
                );
            }
        }
        var inputBlock = this.state.displayType === 'edit' ? (
            <Form horizontal autoComplete="off" style={{width: this.props.width || '100%'}}>
                <DynamicAddDelContacts form={this.props.form}
                    contacts={contacts}
                    phoneValidateRules={this.props.phoneValidateRules}/>
                <div className="buttons">
                    {this.props.hideButtonBlock ? null :
                        <SaveCancelButton loading={this.state.loading}
                            saveErrorMsg={this.state.submitErrorMsg}
                            handleSubmit={this.handleSubmit.bind(this)}
                            handleCancel={this.handleCancel.bind(this)}
                        />}
                </div>
            </Form>
        ) : null;
        return (
            <div className={displayCls}>
                {textBlock}
                {inputBlock}
            </div>
        );
    }
}
MultiContactInputs.defaultProps = {
    id: '1',
    //字段
    field: 'contacts',
    //展示类型，text:文本展示状态，edit:编辑状态
    displayType: 'text',
    //是否有修改权限
    hasEditPrivilege: false,
    //联系人列表
    contacts: [],
    //编辑按钮的提示文案
    editBtnTip: Intl.get('common.update', '修改'),
    //请填写
    placeholder: '',
    //编辑区的宽度
    width: '100%',
    //无数据时的提示（没有修改权限时提示没有数据）
    noDataTip: '',
    //添加数据的提示（有修改权限时，提示补充数据）
    addDataTip: '',
    //是否隐藏保存取消按钮
    hideButtonBlock: false,
    //保存时间框的修改方法
    saveEditDateInput: function() {
    }
};
const PropTypes = React.PropTypes;
MultiContactInputs.propTypes = {
    id: PropTypes.string,
    field: PropTypes.string,
    displayType: PropTypes.string,
    hasEditPrivilege: PropTypes.bool,
    contacts: PropTypes.array,
    editBtnTip: PropTypes.string,
    placeholder: PropTypes.string,
    width: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
    noDataTip: PropTypes.string,
    addDataTip: PropTypes.string,
    hideButtonBlock: PropTypes.bool,
    saveEditDateInput: PropTypes.func,
    form: PropTypes.object,
    phoneValidateRules: PropTypes.array
};
export default Form.create()(MultiContactInputs);
