/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2018/8/20.
 */
var React = require('react');
import {Button, Steps, message, Alert, Form, Input, Icon} from 'antd';
const FormItem = Form.Item;
const PropTypes = require('prop-types');
require('./access-user-template.less');
const Step = Steps.Step;
import DetailCard from 'CMP_DIR/detail-card';
import Spinner from 'CMP_DIR/spinner';
import Trace from 'LIB_DIR/trace';
import RightPanelScrollBar from 'MOD_DIR/crm/public/views/components/rightPanelScrollBar';
import DefaultUserLogoTitle from 'CMP_DIR/default-user-logo-title';
import CustomVariable from './custom-variable';
import rightPanelUtil from 'CMP_DIR/rightPanel';
var RightPanel = rightPanelUtil.RightPanel;
const SET_TIME_OUT = {
    TRANSITION_TIME: 600,//右侧面板动画隐藏的时间
    LOADING_TIME: 1500//避免在第三步时关闭太快，加上延时展示loading效果
};
const LAYOUT = {
    INITIALWIDTH: 504,
    SMALLWIDTH: 24,
    LARGEWIDTH: 75,
    TOP_DISTANCE: 150,
    BOTTOM_DISTANCE: 90,
    TABLE_TOP: 40

};
function noop() {}
import {isEqualArray} from 'LIB_DIR/func';
var className = require('classnames');
const steps = [{
    title: Intl.get('config.product.add', '添加产品'),
    content: 'First-content',
}, {
    title: Intl.get('app.manage.configure.access.info', '配置接入信息'),
    content: 'Second-content',
}];
const addProduct = {
    create_time: 1565255704592,
    id: 'e883f442-e4af-4047-8eee-2db0ae3fc8',
    integration_id: '187',
    integration_type: 'uem',
    name: 'test_add',
    realm_id: '36553nnfjC'
};
class AccessUserTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,//进度条的步骤
            isLoading: false,//正在上传
            previewList: this.props.previewList,//预览列表
            isImporting: false,//正在导入
            isAddingProduct: false, //正在添加产品
            addErrorMsg: '', //添加失败信息
            addProduct: addProduct,//添加的产品
            tableHeight: this.calculateTableHeight()
        };
    }

    componentDidMount = () => {
        $(window).on('resize', e => this.changeTableHeight());
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.previewList && !isEqualArray(nextProps.previewList, this.state.previewList)) {
            this.setState({
                previewList: nextProps.previewList
            });
        }
    }
    componentWillUnmount = () => {
        $(window).off('resize', this.changeTableHeight);
    };

    onItemListImport = (list) => {
        this.props.onItemListImport(list);
        this.setState({
            isPreviewShow: true,
        });
    };
    handleCancel = (e) => {
        this.props.closeTemplatePanel();
        setTimeout(() => {
            this.setState({
                current: 0,
                isLoading: false,
                isPreviewShow: false,
                isImporting: false,
            });
            e && e.preventDefault();
        },SET_TIME_OUT.TRANSITION_TIME);
    };

    //添加客户操作
    handleNextStep = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            this.setState({isAddingProduct: true});
            $.ajax({
                url: '/rest/product/uem',
                type: 'post',
                dataType: 'json',
                data: {name: _.trim(values.name)},
                success: (result) => {
                    if (result) {
                        this.setState({
                            addProduct: result,
                            addErrorMsg: '',
                            isAddingProduct: false,
                            current: 1
                        });
                    } else {
                        this.setState({
                            isAddingProduct: false,
                            addErrorMsg: Intl.get('crm.154', '添加失败')
                        });
                    }
                },
                error: (xhr) => {
                    this.setState({
                        isAddingProduct: false,
                        addErrorMsg: xhr.responseJSON || Intl.get('crm.154', '添加失败')
                    });
                }
            });
        });
    }

    renderFirstStepContent = () => {
        const formItemLayout = {colon: false};
        const {getFieldDecorator} = this.props.form;
        return (
            <div className="first-step-content">
                <Form className="integrate-config-form">
                    <FormItem
                        {...formItemLayout}
                    >
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: Intl.get('config.product.input.name', '请输入产品名称')
                            }],
                        })(
                            <Input placeholder={Intl.get('config.product.input.name', '请输入产品名称')}/>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout}>
                        <div className='first-step-buttons'>
                            <Button size='default' type="default" onClick={this.handleCancel}>
                                {Intl.get('config.manage.realm.canceltext', '取消')}
                            </Button>
                            <Button size='default' type="primary" onClick={this.handleNextStep}>
                                {Intl.get('user.user.add.next', '下一步')}
                            </Button>
                            <div className='prompt-info'>
                                {this.state.isAddingProduct ? (
                                    <Icon type="loading" className="save-loading"/>) : this.state.addErrorMsg ? (
                                    <span className="save-error">{this.state.addErrorMsg}</span>
                                ) : null}
                            </div>
                        </div>
                    </FormItem>
                </Form>
            </div>
        );
    };
    doImport =(e) => {
        Trace.traceEvent(e, '确定导入');
        this.setState({
            current: 2,
            isImporting: true
        });
        this.props.doImportAjax(() => {
            setTimeout(() => {
                message.success(Intl.get('clue.customer.import.clue.suceess', '导入{type}成功',{type: this.props.importType}));
                this.handleCancel();
            },SET_TIME_OUT.LOADING_TIME);
        },(errMsg) => {
            this.setState({isImporting: false});
            message.error(errMsg || Intl.get('clue.customer.import.clue.failed', '导入{type}失败',{type: this.props.importType}));
        });
    };
    renderImportFooter = () => {
        const disabledImportBtn = _.find(this.state.previewList, item => (item.repeat)) || _.isEmpty(this.state.previewList);
        return (
            <div className="prev-foot">
                {this.state.isImporting ? <div className="is-importing">
                    <Spinner/>
                </div> : <Button type="primary" onClick={this.doImport} disabled={disabledImportBtn}>
                    {Intl.get('common.import', '导入')}
                </Button>}
                <Button type="ghost" onClick={this.handleCancel} data-tracename="取消导入">
                    {Intl.get('common.cancel', '取消')}
                </Button>
            </div>
        );
    };
    calculateTableHeight = () => {
        return $(window).height() - LAYOUT.TOP_DISTANCE - LAYOUT.BOTTOM_DISTANCE;
    }
    changeTableHeight = () => {
        var tableHeight = this.calculateTableHeight();
        this.setState({tableHeight});
    };
    // 添加自定义属性
    saveCustomVariable = (saveObj, successFunc, errorFunc) => {
        //是否修改基本信息
        saveObj.isEditBasic = true;
        $.ajax({
            url: '/rest/product',
            type: 'put',
            dataType: 'json',
            data: saveObj,
            success: (data) => {
                //修改成功{editBasicSuccess: true, editTypeSuccess:true}
                if (_.get(data, 'editBasicSuccess') && _.get(data, 'editTypeSuccess')) {
                    //保存成功后的处理
                    message.success(Intl.get('user.user.add.success', '添加成功'));
                    _.isFunction(successFunc) && successFunc();
                    this.setState({
                        custom_variable: saveObj.custom_variable
                    });
                } else {
                    _.isFunction(errorFunc) && errorFunc(Intl.get('member.add.failed', '添加失败！'));
                }
            },
            error: (xhr) => {
                _.isFunction(errorFunc) && errorFunc(xhr.responseJSON);
            }
        });
    }
    renderCustomVariable = () => {
        return (
            <CustomVariable
                id={_.get(this.state.addProduct,'id')}
                value={this.state.custom_variable}
                hasEditPrivilege={true}
                addBtnTip={Intl.get('app.user.manage.add.custom.text', '添加属性')}
                saveEditInput={this.saveCustomVariable}
            />
        );
    }
    renderAccessTitle = () => {
        return (
            <div className='access-title' >
                <DefaultUserLogoTitle
                    nickName={this.state.addProduct.name}
                />
                <span>{this.state.addProduct.name} </span>
            </div>
        );
    }
    renderSecondStepContent = () => {
        return (
            <div className="second-step-content">
                <RightPanelScrollBar>
                    <DetailCard
                        content={this.renderAccessTitle()}
                    />
                    <DetailCard
                        className="add-user-data-card"
                        title={`${Intl.get('config.product.js.collect.user','使用JS脚本采集用户数据')}:`}
                        content={this.renderCustomVariable()}
                    />
                </RightPanelScrollBar>
            </div>
        );

    };
    //不同步骤渲染不同的内容
    renderStepsContent = (current) => {
        var stepContent = null;
        switch (current) {
            case 0:
                stepContent = this.renderFirstStepContent();
                break;
            case 1:
                stepContent = this.renderSecondStepContent();
                break;
        }
        return stepContent;
    };
    render() {
        var current = this.state.current;
        var width = LAYOUT.INITIALWIDTH;
        var cls = className('access-user-step-container',{
            'show-modal': this.props.showFlag
        });
        return (
            <div className={cls}>
                <RightPanel className="access-user-template-panel white-space-nowrap"
                    showFlag={this.props.showFlag} data-tracename="导入模板"
                    style={{width: width}}
                >
                    <span className="iconfont icon-close clue-import-btn" onClick={this.handleCancel}
                        data-tracename="点击关闭导入面板"></span>
                    <div className="access-user-detail-wrap" style={{width: width - LAYOUT.SMALLWIDTH}}>
                        <div className="access-top-title">
                            <div className='other-access-way'>
                                <a>{Intl.get('user.access.way.other.tip', '其他方式接入')}</a>
                            </div>
                            {Intl.get('app.manage.access.user', '接入用户')}
                        </div>
                        <div className="access-title-top">
                            <Steps current={current}>
                                {steps.map(item => <Step key={item.title} title={item.title}/>)}
                            </Steps>
                        </div>
                        <div className="access-detail-container">
                            {this.renderStepsContent(current)}
                        </div>
                    </div>
                </RightPanel>
            </div>
        );
    }
}

AccessUserTemplate.defaultProps = {
    uploadActionName: '',//导入类型的英文描述
    uploadHref: '',//导入的url
    importType: '',//导入类型的中文描述
    templateHref: '',//下载导入模板的url
    //todo 导入的表格传入时，一定把标识重复的字段设置为repeat，在重复item的名称上加类名时，统一加成repeat-item-name
    previewList: [],//展示的内容
    showFlag: false,//控制导入面板是否展示
    getItemPrevList: noop,//获取要展示的列
    closeTemplatePanel: noop,//关闭面板的回调
    onItemListImport: noop,//导入时的函数
    doImportAjax: noop,//确认导入时的函数
    repeatAlertMessage: '',//有重复数据后的提示信息
    regRules: [],//文件类型的校验规则,
};
AccessUserTemplate.propTypes = {
    uploadActionName: PropTypes.string,
    uploadHref: PropTypes.string,
    importType: PropTypes.string,
    templateHref: PropTypes.string,
    showFlag: PropTypes.bool,
    closeTemplatePanel: PropTypes.func,
    previewList: PropTypes.object,
    onItemListImport: PropTypes.func,
    doImportAjax: PropTypes.func,
    getItemPrevList: PropTypes.func,
    repeatAlertMessage: PropTypes.string,//有重复数据后的提示信息
    regRules: PropTypes.object,
    form: PropTypes.object
};
export default Form.create()(AccessUserTemplate);