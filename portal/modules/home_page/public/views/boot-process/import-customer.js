/** Created by 2019-07-31 20:07 */
import ImportCrmTemplate from 'CMP_DIR/import_step';
import {XLS_FILES_TYPE_RULES} from 'PUB_DIR/sources/utils/consts';
import { Button, message } from 'antd';
import classNames from 'classnames';
import routeList from 'MOD_DIR/common/route';
var CrmAction = require('MOD_DIR/crm/public/action/crm-actions');
import Trace from 'LIB_DIR/trace';
import ajax from 'MOD_DIR/common/ajax';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';

class CustomerImport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previewList: []
        };
    }

    //获取导入预览中的列
    getPreviewColumns = () => {
        const column_width_min = 80, column_width = 120, column_width_max = 200;
        return [
            {
                title: Intl.get('crm.4', '客户名称'),
                width: column_width_max,
                dataIndex: 'name',
                render: (text, record, index) => {
                    if (text) {
                        //客户名不符合验证规则
                        let name_verify = _.get(record, 'errors.name_verify');
                        //导入的数据中存在同名客户
                        let import_name_repeat = _.get(record, 'errors.import_name_repeat');
                        //系统中存在同名客户
                        let name_repeat = _.get(record, 'errors.name_repeat');
                        let cls = classNames({
                            'repeat-item-name': name_verify || import_name_repeat || name_repeat
                        });
                        let title = '';
                        if (name_verify) {
                            title = Intl.get('crm.197', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号，且长度在1到25（包括25）之间');
                        } else if (import_name_repeat) {
                            title = Intl.get('crm.import.name.repeat', '导入数据中存在同名{type}',{type: Intl.get('call.record.customer', '客户')});
                        } else if (name_repeat) {
                            title = Intl.get('crm.system.name.repeat', '系统中已存在同名{type}',{type: Intl.get('call.record.customer', '客户')});
                        }
                        return (<span className={cls} title={title}>{text}</span>);
                    } else {//必填
                        return (
                            <span className='repeat-item-name' title={Intl.get('crm.import.required', '必填项，不能为空')}>
                                {Intl.get('apply.components.required.item', '必填')}
                            </span>);
                    }
                }
            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                width: column_width_min,
                dataIndex: 'contact_name',
            }, {
                title: Intl.get('clue.add.phone.num', '电话号码'),
                width: column_width,
                dataIndex: 'contact_phone',
                render: (text, record, index) => {
                    if (_.get(record, 'contact_phone.length')) {
                        return _.map(record.contact_phone, (item, index) => {
                            //电话规则不匹配的电话列表
                            let phone_verify_list = _.get(record, 'errors.phone_verify');
                            //导入的列表中存在相同的电话的电话列表
                            let import_phone_repeat_list = _.get(record, 'errors.import_phone_list');
                            //系统中存在相同电话的电话列表
                            let phone_repeat_list = _.get(record, 'errors.phone_repeat_list');
                            let cls = '';
                            let title = '';
                            //电话规则不匹配
                            if (this.isIncludesItem(phone_verify_list, item)) {
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.import.phone.verify', '电话只能是11位手机号或11-12位带区号的座机号');
                            } else if (this.isIncludesItem(import_phone_repeat_list, item)) {
                                //导入的列表中存在相同的电话
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.import.phone.repeat', '导入数据中存在相同的电话');
                            } else if (this.isIncludesItem(phone_repeat_list, item)) {
                                //系统中存在同名客户
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.system.phone.repeat', '电话已被其他{type}使用', {type: Intl.get('call.record.customer', '客户')});
                            }
                            return (<div className={cls} title={title} key={index}>{item}</div>);
                        });
                    } else {//必填
                        return (
                            <span className='repeat-item-name' title={Intl.get('crm.import.required', '必填项，不能为空')}>
                                {Intl.get('apply.components.required.item', '必填')}
                            </span>);

                    }
                }
            }, {
                title: 'QQ',
                width: column_width,
                dataIndex: 'contact_qq',
                render: (text, record, index) => {
                    return _.map(record.contact_qq, (item, index) => {
                        return (<div key={index}>{item}</div>);
                    });
                }
            }, {
                title: Intl.get('common.email', '邮箱'),
                width: column_width,
                dataIndex: 'contact_email',
                render: (text, record, index) => {
                    return _.map(record.contact_email, (item, index) => {
                        return (<div key={index}>{item}</div>);
                    });
                }
            }, {
                title: Intl.get('crm.contact.role', '联系人角色'),
                width: column_width_min,
                dataIndex: 'contact_role',
            }, {
                title: Intl.get('crm.113', '部门'),
                width: column_width,
                dataIndex: 'contact_department',
            }, {
                title: Intl.get('crm.91', '职位'),
                width: column_width_min,
                dataIndex: 'contact_position',
            }, {
                title: Intl.get('menu.trace', '跟进记录'),
                width: column_width,
                dataIndex: 'trace_record',
            }, {
                title: Intl.get('crm.add.time', '添加时间'),
                width: column_width,
                dataIndex: 'start_time',
            }, {
                title: Intl.get('common.industry', '行业'),
                width: column_width_min,
                dataIndex: 'industry',
            }, {
                title: Intl.get('crm.province.in', '所属省份'),
                width: column_width_min,
                dataIndex: 'province',
            }, {
                title: Intl.get('common.address', '地址'),
                width: column_width,
                dataIndex: 'address',
            }, {
                title: Intl.get('crm.competing.products', '竞品'),
                width: column_width_min,
                dataIndex: 'competing_products',
                render: (text, record, index) => {
                    return _.map(record.competing_products, (item, index) => {
                        return (<div key={index}>{item}</div>);
                    });
                }
            }, {
                title: Intl.get('common.remark', '备注'),
                width: column_width,
                dataIndex: 'remarks',
            }, {
                title: Intl.get('common.operate', '操作'),
                width: 50,
                render: (text, record, index) => {
                    return (
                        <span className="cus-op" data-tracename="删除客户">
                            <Button className="order-btn-class handle-btn-item" 
                                onClick={this.deleteDuplicatImportCustomer.bind(this, index)}
                                title={Intl.get('common.delete', '删除')}>
                                    <i className="iconfont icon-delete"></i>
                                </Button>
                        </span>
                    );
                }
            }];
    };

    //是否包含此项内容
    isIncludesItem(list, item) {
        return !_.isEmpty(list) && _.includes(list, item);
    }

    //删除导入预览中的重复客户
    deleteDuplicatImportCustomer = (index, e) => {
        const route = _.find(routeList, route => route.handler === 'deleteDuplicatImportCustomer');

        const params = {
            index
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };
        Trace.traceEvent(e, '点击删除重复客户按钮');
        ajax(arg).then(result => {
            //    Trace.traceEvent('导入预览', '点击删除重复客户按钮');
            if (result && result.result === 'success') {
                var previewList = this.state.previewList;
                previewList.splice(index, 1);
                this.setState({
                    previewList: previewList
                });
            } else {
                message.error(Intl.get('crm.delete.duplicate.customer.failed', '删除重复客户失败'));
            }
        }, () => {
            message.error(Intl.get('crm.delete.duplicate.customer.failed', '删除重复客户失败'));
        });
        return e.stopPropagation();
    };

    //将导入预览的数据转换为预览列表中展示所需数据
    handlePreviewList(list) {
        return _.map(list, item => {
            let start_time = _.get(item, 'start_time', '');
            start_time = start_time ? moment(start_time).format(oplateConsts.DATE_FORMAT) : '';
            let previewCustomer = {
                name: _.get(item, 'name', ''),
                contact_name: _.get(item, 'contacts[0].name', ''),
                contact_phone: _.get(item, 'contacts[0].phone', ''),
                contact_qq: _.get(item, 'contacts[0].qq', ''),
                contact_email: _.get(item, 'contacts[0].email', ''),
                contact_role: _.get(item, 'contacts[0].role', ''),
                contact_department: _.get(item, 'contacts[0].department', ''),
                contact_position: _.get(item, 'contacts[0].position', ''),
                user_name: _.get(item, 'user_name', ''),
                trace_record: _.get(item, 'customer_traces[0].remark', ''),
                start_time,
                industry: _.get(item, 'industry', ''),
                province: _.get(item, 'province', ''),
                address: _.get(item, 'address', ''),
                competing_products: _.get(item, 'competing_products', ''),
                remarks: _.get(item, 'remarks', ''),
            };
            if (_.get(item, 'errors')) {
                previewCustomer.errors = item.errors;
                //导入组件中需要此参数进行判断是否展示错误提示
                previewCustomer.repeat = true;
            }
            return previewCustomer;
        });
    }

    onCustomerImport = (list) => {
        let member_id = crmUtil.getMyUserId();
        //导入客户前先校验，是不是超过了本人的客户上限
        CrmAction.getCustomerLimit({ member_id: member_id, num: list.length }, (result) => {
            if (_.isNumber(result)) {
                if (result === 0) {
                    //可以转入
                    this.setState({
                        isPreviewShow: true,
                        previewList: this.handlePreviewList(list),
                    });
                } else if (result > 0) {
                    //不可以转入
                    message.warn(Intl.get('crm.import.over.limit', '导入客户后会超过您拥有客户的上限，请您减少{num}个客户后再导入', { num: result }));
                }
            }
        });
    };

    doImport = (successCallback,errCallback) => {
        const route = _.find(routeList, route => route.handler === 'uploadCustomerConfirm');

        const params = {
            flag: true,
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };

        ajax(arg).then(result => {
            _.isFunction(this.props.afterImportCustomer) && this.props.afterImportCustomer();
            _.isFunction(successCallback) && successCallback();
        }, (errorMsg) => {
            _.isFunction(errCallback) && errCallback(errorMsg);
        });


    };

    render() {
        return (
            <ImportCrmTemplate
                uploadActionName='customers'
                importType={Intl.get('sales.home.customer', '客户')}
                title={this.props.title}
                templateHref='/rest/crm/download_template'
                uploadHref='/rest/crm/customers'
                previewList={this.state.previewList}
                showFlag
                getItemPrevList={this.getPreviewColumns}
                closeTemplatePanel={this.props.closeTemplatePanel}
                onItemListImport={this.onCustomerImport}
                doImportAjax={this.doImport}
                repeatAlertMessage={Intl.get('import.repeat.delete.tip', '红色标示数据已存在或不符合规则，请删除红色标示的数据后直接导入，或本地修改数据后重新导入')}
                regRules={XLS_FILES_TYPE_RULES}
            />
        );
    }

}

CustomerImport.defaultProps = {
    closeTemplatePanel: function() {},
    afterImportCustomer: function() {},
    title: null,//头部标题区域
};
CustomerImport.propTypes = {
    closeTemplatePanel: PropTypes.func,
    afterImportCustomer: PropTypes.func,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export default CustomerImport;