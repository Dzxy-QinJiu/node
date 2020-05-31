const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
var addMoreInfoAction = require('../action/add-more-info-action');
var addMoreInfoStore = require('../store/add-more-info-store');
import TopTitleCMP from './top-title-component';
import BottomSaveCancelCMP from './bottom-save-cancel-component';
import {Form, Icon, Input} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
var FormItem = Form.Item;
const LAYOUT_CONST = {
    LABELSM: 5,//lable所占的宽度
    WRAPPERSM: 19,//输入框所占的宽度
    LABELXS: 24
};
class AddMoreInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: true,
            submittingErrMsg: ''
        };
    }

    componentDidMount() {
        addMoreInfoStore.listen(this.onStoreChange);
        //获取应用列表
        this.getAppLists();
    }

    onStoreChange = () => {
        this.setState(addMoreInfoStore.getState());
    };

    componentWillUnmount() {
        addMoreInfoStore.unlisten(this.onStoreChange);
    }

    //获取应用列表
    getAppLists() {
        addMoreInfoAction.getAppList();
    }

    //点击提交按钮
    handleSubmit = (e) => {
        Trace.traceEvent(e, '保存反馈');
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.props.handleSubmit(values);
            }
        });
    };
    //点击取消按钮
    handleCancel = (e) => {
        Trace.traceEvent(e, '取消保存反馈');
        this.props.handleCancel();
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                sm: {span: LAYOUT_CONST.LABELSM},
                xs: {span: LAYOUT_CONST.LABELXS}
            },
            wrapperCol: {
                sm: {span: LAYOUT_CONST.WRAPPERSM},
                xs: {span: LAYOUT_CONST.LABELXS}
            },
        };
        var appLists = this.state.appLists || [];
        //应用下拉列表
        var appListsOptions = appLists.map(function(app, index) {
            return (<Option key={index} value={app.app_id}>{app.app_name}</Option>);
        });
        return (
            <div className="add-more-info-content-container" data-tracename="增加产品反馈">
                <TopTitleCMP
                    titleText={'+' + Intl.get('call.record.product.feedback', '产品反馈')}
                />
                {/*添加日程 产品反馈 竞品信息*/}
                <div className="product-feedback-container">
                    <FormItem
                        label={Intl.get('call.record.application.product', '应用产品')}
                        id="product"
                        {...formItemLayout}
                    >
                        {this.state.isGettingAppLists ? (
                            <div className="app-list-loading">
                                <ReactIntl.FormattedMessage id="call.record.app.lists" defaultMessage="正在获取应用列表"/>
                                <Icon type="loading"/>
                            </div>) : (
                            getFieldDecorator('product', {
                                rules: [{
                                    required: true,
                                    message: Intl.get('call.record.feedback.prodcut', '请选择需要反馈的应用产品')
                                }],
                            })(
                                <AntcSelect
                                    size="large"
                                    placeholder={Intl.get('call.record.feedback.prodcut', '请选择需要反馈的应用产品')}
                                >
                                    {appListsOptions}
                                </AntcSelect>
                            ))}
                    </FormItem>
                    <FormItem
                        label={Intl.get('call.record.feedback.topic', '反馈主题')}
                        id="topic"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('topic', {
                            rules: [{
                                required: true,
                                message: Intl.get('call.record.input.feedback.topic', '请输入反馈主题'),
                                whitespace: true
                            }],
                        })(
                            <Input
                                name="topic"
                                id="topic"
                                placeholder={Intl.get('call.record.input.feedback.topic', '请输入反馈主题')}
                            />
                        )}
                    </FormItem>
                    <FormItem
                        label={Intl.get('call.record.feedback.content', '反馈内容')}
                        id="content"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('content', {
                            rules: [{
                                required: true,
                                message: Intl.get('call.record.input.feedback.content', '请输入反馈内容'),
                                whitespace: true
                            }]
                        })(
                            <Input
                                type="textarea"
                                id="content"
                                rows="3"
                                placeholder={Intl.get('call.record.input.feedback.content', '请输入反馈内容')}
                            />
                        )}
                    </FormItem>
                </div>
                <BottomSaveCancelCMP
                    handleSubmit={this.handleSubmit}
                    handleCancel={this.handleCancel}
                    isAddingAppFeedback={this.props.isAddingAppFeedback}
                    addAppFeedbackErrMsg={this.props.addAppFeedbackErrMsg}
                />
            </div>
        );
    }

}
AddMoreInfo.defaultProps = {
    isAddingAppFeedback: '',
    addAppFeedbackErrMsg: '',
    handleSubmit: function() {

    },
    handleCancel: function() {

    },
    form: {}
};
AddMoreInfo.propTypes = {
    isAddingAppFeedback: PropTypes.string,
    addAppFeedbackErrMsg: PropTypes.string,
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func,
    form: PropTypes.object
};
export default Form.create()(AddMoreInfo);