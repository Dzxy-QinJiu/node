/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-leave-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker, Select} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
var user = require('PUB_DIR/sources/user-data').getUserData();
import {applyComponentsType} from '../../../apply_approve_manage/public/utils/apply-approve-utils';
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
import {calculateTotalTimeRange,calculateRangeType} from 'PUB_DIR/sources/utils/common-data-util';
import { LEAVE_TYPE } from 'PUB_DIR/sources/utils/consts';
var ApplyApproveAction = require('MOD_DIR/apply_approve_manage/public/action/apply_approve_manage_action');
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {ALL_COMPONENTS, SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import {DELAY_TIME_RANGE, LEAVE_TIME_RANGE,AM_AND_PM} from 'PUB_DIR/sources/utils/consts';
import classNames from 'classnames';
class AddLeaveApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {

    }
    componentDidUpdate() {

    }



    handleSubmit = () => {
        var submitObj = {},conditionObj = {};
        var refObj = this.refs;
        for (var key in refObj){
            var onSaveCallBack = _.get(refObj[key],'onSaveAllData');
            if (_.isFunction(onSaveCallBack)){
                var saveObj = onSaveCallBack();
                var refTarget = refObj[key];
                for (var key in saveObj){
                    if (saveObj[key]['condition']){
                        _.extend(conditionObj, saveObj[key]['condition']);
                        delete saveObj[key].condition;
                    }
                    if (_.get(refTarget,'props.component_type') === ALL_COMPONENTS.CUSTOMERSEARCH){
                        saveObj['customers'] = [saveObj[key]];
                        delete saveObj[key];
                    }
                }

                _.extend(submitObj,saveObj );
            }
        }
        ApplyApproveAction.addSelfSettingApply({'detail': submitObj,'type': SELF_SETTING_FLOW.VISITAPPLY, condition: conditionObj},(result) => {
            if (result){
                message.success('添加成功');
                this.hideLeaveApplyAddForm();
            }
        });
    };


    onSaveAllData = () => {
        console.log(arguments);
    };
    hideLeaveApplyAddForm = () => {
        this.props.hideLeaveApplyAddForm();
    };
    render() {
        var formData = this.state.formData;
        var _this = this;
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        const formDataLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };
        let saveResult = this.state.saveResult;
        var workConfig = user.workFlowConfigs[0];
        var customizForm = workConfig.customiz_form;
        return (
            <RightPanel showFlag={true} data-tracename="添加拜访申请" className="add-leave-container">
                <span className="iconfont icon-close add-leave-apply-close-btn"
                    onClick={this.hideLeaveApplyAddForm}
                    data-tracename="关闭添加拜访申请面板"></span>

                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={_.get(workConfig,'description')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' className="sales-clue-form" id="add-leave-apply-form">
                                    {_.map(customizForm,(formItem,index) => {
                                        var target = _.find(applyComponentsType, item => item.name === _.get(formItem, 'component_type'));
                                        if (target){
                                            if (formItem.component_type === ALL_COMPONENTS.CUSTOMERSEARCH){
                                                formItem['hideButtonBlock'] = true;
                                            }
                                            var ApplyComponent = target.component;
                                            var applyItem = classNames('ant-row ant-form-item form-item-label',{
                                                'require-item': _.get(formItem,'is_required')
                                            });
                                            // return <FormItem
                                            //     label={_.get(formItem,'title')}
                                            //     id={_.get(formItem,'key')}
                                            //     {...formItemLayout}
                                            // >
                                            //     {
                                            //         getFieldDecorator(_.get(formItem,'key'),{
                                            //             rules: [{required: _.get(formItem,'is_required') , }],
                                            //         })(
                                            //             <ApplyComponent {...formItem} labelKey={_.get(formItem,'key')} ref={'apply_component_' + index}/>
                                            //         )}
                                            // </FormItem>
                                            // ;


                                            return <div className={applyItem}>
                                                <div className="ant-form-item-label ant-col-xs-24 ant-col-sm-6">
                                                    <label className={_.get(formItem,'is_required') ? 'ant-form-item-required' : ''}>
                                                        {_.get(formItem,'title')}
                                                    </label>

                                                </div>
                                                <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18"><ApplyComponent {...formItem} labelKey={_.get(formItem,'key')} ref={'apply_component_' + index}/>

                                                </div>

                                            </div>;

                                        }
                                    })}

                                    <div className="submit-button-container">
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                            disabled={this.state.isSaving} data-tracename="点击保存添加
                                            拜访申请">
                                            {Intl.get('common.save', '保存')}
                                            {this.state.isSaving ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.hideLeaveApplyAddForm}
                                            data-tracename="点击取消添加拜访申请按钮">
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                        <div className="indicator">
                                            {saveResult ?
                                                (
                                                    <AlertTimer
                                                        time={saveResult === 'error' ? DELAY_TIME_RANGE.ERROR_RANGE : DELAY_TIME_RANGE.SUCCESS_RANGE}
                                                        message={this.state.saveMsg}
                                                        type={saveResult} showIcon
                                                        onHide={this.hideSaveTooltip}/>
                                                ) : ''
                                            }
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </GeminiScrollbar>
                    </div>
                </div>
            </RightPanel>

        );
    }
}
AddLeaveApply.defaultProps = {
    hideLeaveApplyAddForm: function() {
    },
    form: {}
};
AddLeaveApply.propTypes = {
    hideLeaveApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddLeaveApply);