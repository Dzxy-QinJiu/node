/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/30.
 */
// 个人登录后完善资料
import './style.less';
import KefuImage from './kefu.png';
import { Form, Input, message } from 'antd';
const FormItem = Form.Item;
import { nameLengthRule, validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import userData from 'PUB_DIR/sources/user-data';
import history from 'PUB_DIR/sources/history';
import ajax from 'ant-ajax';

const LAYOUT = {
    LEFT_SIDEBAR_WIDTH: 75, // 左侧菜单栏宽度
};
class PersonalCompleteInformation extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            errMsg: '',
        };
    }

    handleSubmit = () => {
        if(this.state.isLoading) return false;
        this.props.form.validateFields((error, values) => {
            if(error) {return false;}
            this.setState({isLoading: true, errMsg: ''});
            this.submitTrialData(values);
        });
    };

    //暂不填写
    handleCancel = () => {
        this.setState({isLoading: true, errMsg: ''});
        this.setWebConfig().then(() => {
            history.replace('/clue_customer');
            _.isFunction(this.props.hideRightPanel) && this.props.hideRightPanel();
        }).catch((errMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errMsg
            });
        });
    };

    submitTrialData(saveObj) {
        ajax.send({
            url: '/rest/global/organization/personal/trial/info',
            type: 'put',
            data: saveObj
        }).done((res) => {
            if(res) {
                this.setWebConfig().then(() => {
                    history.replace('/clue_customer');
                    _.isFunction(this.props.hideRightPanel) && this.props.hideRightPanel();
                }).catch((errMsg) => {
                    this.setState({
                        isLoading: false,
                        errMsg: Intl.get('common.save.failed', '保存失败')
                    });
                });
            }else {
                this.setState({
                    isLoading: false,
                    errMsg: Intl.get('common.save.failed', '保存失败')
                });
            }
        }).fail((errorMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errorMsg || Intl.get('common.save.failed', '保存失败')
            });
        });
    }

    setWebConfig() {
        return new Promise((resolve, rejcet) => {
            ajax.send({
                url: '/rest/base/v1/user/website/config/personnel',
                type: 'post',
                data: {
                    no_show_personal_complete_info: true
                }
            }).done(result => {
                resolve(result);
            }).fail(err => {
                rejcet(err);
            });
        });
    }

    renderContent() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
            colon: false
        };
        const organization = getOrganization();
        const userInfo = userData.getUserData();
        return (
            <div className="personal-complete-container">
                <div className="personal-complete-content">
                    <div className='personal-complete-title'>
                        <div className='personal-complete-title-welcome'>
                            <img src={KefuImage}/>
                            <div className="personal-complete-title-dec">
                                <div>{Intl.get('personal.welcome.use.curtao', '欢迎使用客套')}</div>
                                <ReactIntl.FormattedMessage
                                    id="personal.open.success.tip"
                                    defaultMessage={'恭喜您成功开通个人试用版，试用期剩余 {count} 天'}
                                    values={{
                                        'count': <span className="personal-complete-remaining-day">{_.get(organization,'expireAfterDays',0)}</span>
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="personal-complete-box">
                        <Form layout='horizontal' className="personal-complete-form">
                            <FormItem
                                label={Intl.get('common.nickname', '昵称')}
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('nick_name', {
                                        initialValue: _.get(userInfo,'nick_name',''),
                                        rules: [nameLengthRule],
                                        validateTrigger: 'onBlur'
                                    })(
                                        <Input
                                            placeholder={Intl.get('user.info.input.nickname', '请输入昵称')}
                                        />
                                    )
                                }
                            </FormItem>
                            <FormItem
                                label={Intl.get('member.position', '职务')}
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('team_role',{
                                        initialValue: '',
                                    })(
                                        <Input
                                            placeholder={Intl.get('member.position.name.placeholder', '请输入职务名称')}
                                        />
                                    )
                                }
                            </FormItem>
                            <FormItem
                                label={Intl.get('common.company', '公司')}
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('organization',{
                                        initialValue: _.get(organization, 'officialName', ''),
                                        rules: [{
                                            required: true,
                                            ...validatorNameRuleRegex(25,Intl.get('common.company', '公司'))
                                        }]
                                    })(
                                        <Input
                                            placeholder={Intl.get('register.company.name.fill', '请输入公司名称')}
                                        />
                                    )
                                }
                            </FormItem>
                            <FormItem {...formItemLayout} label=" " className="form-item-btn">
                                <SaveCancelButton
                                    cancelBtnText={Intl.get('config.not.fill.in', '暂不填写')}
                                    loading={this.state.isLoading}
                                    saveErrorMsg={this.state.errMsg}
                                    handleSubmit={this.handleSubmit}
                                    handleCancel={this.handleCancel}
                                />
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        let width = this.props.width ? this.props.width : $(window).width() - LAYOUT.LEFT_SIDEBAR_WIDTH;
        return (
            <RightPanelModal
                isShowMadal
                closePanel={this.onClosePanel}
                showCloseBtn={this.props.showCloseBtn}
                width={width}
                content={this.renderContent()}
                dataTracename="个人试用完善资料"
            />
        );
    }
}
PersonalCompleteInformation.propTypes = {
    width: PropTypes.oneOfType([PropTypes.number,PropTypes.string]),
    showCloseBtn: PropTypes.bool,
    form: PropTypes.object,
    hideRightPanel: PropTypes.func
};
module.exports = Form.create()(PersonalCompleteInformation);