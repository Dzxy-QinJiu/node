var PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/16.
 */
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/15.
 * 可展示可编辑的多个联系人及联系方式组件
 * */

require('../css/multi-contact-inputs.less');
import {Form} from 'antd';
import Trace from 'LIB_DIR/trace';
import SaveCancelButton from '../../detail-card/save-cancel-button';
import DynamicAddDelContacts from '../../dynamic-add-del-contacts/index';
class MultiContactForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            submitErrorMsg: '',
            contactEmptyMsg: ''
        };
    }

    hasContactWay(contactWayArray) {
        return _.find(contactWayArray, item => item);
    }

    // 是否有联系方式的验证
    validateContactIsEmpty(contacts) {
        let contactIsEmpty = true;
        _.each(contacts, (contactItem) => {
            if (contactItem) {
                if (this.hasContactWay(contactItem.phone) ||
                    this.hasContactWay(contactItem.qq) ||
                    this.hasContactWay(contactItem.email) ||
                    this.hasContactWay(contactItem.weChat)) {
                    contactIsEmpty = false;
                    return false;
                }
            }
        });
        if (contactIsEmpty) {
            this.setState({
                contactEmptyMsg: Intl.get('clue.fill.clue.contacts', '请填写线索的联系方式')
            });
        } else {
            this.setState({
                contactEmptyMsg: ''
            });
        }
        return contactIsEmpty;
    }

    getContacts(values) {
        //联系人的处理
        let contacts = [];
        _.each(values, contact => {
            let submitContact = _.cloneDeep(contact);
            if (submitContact && submitContact.name) {
                // 过滤掉空的联系方式
                submitContact.phone = _.filter(submitContact.phone, phone => phone);
                submitContact.qq = _.filter(submitContact.qq, qq => qq);
                submitContact.email = _.filter(submitContact.email, email => email);
                submitContact.weChat = _.filter(submitContact.weChat, weChat => weChat);
                contacts.push(submitContact);
            }
        });
        return contacts;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            //是否有联系方式的验证
            if (this.validateContactIsEmpty(values.contacts)) {
                return;
            }
            let contacts = this.getContacts(values.contacts);
            Trace.traceEvent(e, '保存对联系方式的修改');
            this.setState({
                loading: true
            });
            if (_.isFunction(this.props.handleSubmit)) {
                this.props.handleSubmit(contacts, () => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: '',
                        contacts: contacts,
                    });
                }, (errorMsg) => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                    });
                });
            }
        });
    };

    handleCancel(e) {
        this.setState({
            contacts: this.props.contacts,
            submitErrorMsg: ''
        });
        if (_.isFunction(this.props.handleCancel)) this.props.handleCancel();
        Trace.traceEvent(e, '取消对联系方式的修改');
    }

    render() {
        return (
            <Form className='eidt-contact-form' horizontal autoComplete="off"
                style={{width: this.props.width || '100%'}}>
                <DynamicAddDelContacts form={this.props.form}
                    contacts={this.props.contacts}
                    phoneOnlyOneRules={this.props.phoneOnlyOneRules}/>
                <div className="buttons">
                    <SaveCancelButton loading={this.state.loading}
                        saveErrorMsg={this.state.submitErrorMsg}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </div>
            </Form>
        );
    }
}

MultiContactForm.propTypes = {
    width: PropTypes.number,//form的宽度设置
    contacts: PropTypes.array,//编辑时默认展示的联系人列表
    phoneOnlyOneRules: PropTypes.array,//电话验证规则
    form: PropTypes.object,
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func
};
export default Form.create()(MultiContactForm);