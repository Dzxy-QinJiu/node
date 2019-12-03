/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/30.
 */
// 个人登录后完善资料
import './style.less';
import KefuImage from './kefu.png';
import { Form, Input, Button, message, Col, Row } from 'antd';
const FormItem = Form.Item;
import { nameLengthRule, validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import userData from 'PUB_DIR/sources/user-data';
import history from 'PUB_DIR/sources/history';
import ajax from 'ant-ajax';
import { AntcAreaSelection } from 'antc';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import Trace from 'LIB_DIR/trace';
import Spinner from 'CMP_DIR/spinner';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import classNames from 'classnames';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');

const LAYOUT = {
    LEFT_SIDEBAR_WIDTH: 75, // 左侧菜单栏宽度
};
const STEPS_MAPS = {
    SET_FIRST: 'FIRST',//第一步
    SET_SECOND: 'SECOND',//第二步
};

//默认最多展示的数目
const MAX_COUNT = 16;
//默认最小高度
const MIN_HEIGHT = 80;

class BootCompleteInformation extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            errMsg: '',
            currentStep: STEPS_MAPS.SET_FIRST,
            industryList: [],//行业列表
            showIndustryList: [],
            industryListHeight: MIN_HEIGHT,
            stepData: {
                industrys: [],
                areaData: {}
            },
            isGetIndustrys: false
        };
    }

    hasSetWebConfigSuccess = false;

    componentDidMount() {
        this.getRecommendCustomerIndustry();
    }

    getRecommendCustomerIndustry = () => {
        this.setState({isGetIndustrys: true});
        $.ajax({
            url: '/rest/clue/condition/industries',
            type: 'get',
            dataType: 'json',
            success: (list) => {
                let industryList = this.state.industryList, showIndustryList = [];
                let industryListHeight = this.state.industryListHeight;
                industryList = _.isArray(list) ? list : [];
                if(industryList.length > MAX_COUNT) {//超过16个，在末尾添加一个更多按钮
                    showIndustryList = industryList.slice(0, MAX_COUNT - 1);
                    showIndustryList.push(Intl.get('crm.basic.more', '更多'));
                    industryListHeight = 4 * MIN_HEIGHT;
                }else {//没有超过时,计算整个高度
                    showIndustryList = industryList;
                    let col = Math.ceil(showIndustryList.length / 4);
                    industryListHeight = col * MIN_HEIGHT;
                }
                this.setState({
                    industryList,
                    showIndustryList: showIndustryList,
                    industryListHeight,
                    isGetIndustrys: false
                });
            },
            error: (xhr) => {
                this.setState({isGetIndustrys: false});
            }
        });
    };

    setRecommends = () => {
        this.setState({isLoading: true});
        let recommendParams = {};
        let areaData = _.cloneDeep(this.state.stepData.areaData);
        if(!_.isEmpty(this.state.stepData.industrys)) {
            recommendParams.industrys = this.state.stepData.industrys;
        }
        if(!_.isEmpty(areaData)) {
            for (var key in areaData){
                if (!areaData[key]){
                    delete areaData[key];
                }
            }
            recommendParams = {...recommendParams,...areaData};
        }
        var _this = this;
        setWebConfig(() => {
            this.hasSetWebConfigSuccess = true;
        });
        $.ajax({
            url: '/rest/clue/recommend/condition',
            dataType: 'json',
            type: 'post',
            data: recommendParams,
            success: (data) => {
                //保存成功后跳转到推荐线索列表
                var targetObj = _.get(data, '[0]');
                clueCustomerAction.saveSettingCustomerRecomment(targetObj);
                setTimeout(() => {
                    jumpLeadPage();
                });
            },
            error: (xhr) => {
                jumpLeadPage();
            }
        });

        function jumpLeadPage() {
            setWebConfig();
            //保存成功后跳转到推荐线索列表
            history.replace('/leads', {
                showRecommendCluePanel: true
            });
            _.isFunction(_this.props.hideRightPanel) && _this.props.hideRightPanel();
        }
        function setWebConfig(callback) {
            if(!_this.hasSetWebConfigSuccess) {
                _this.setWebConfig({
                    no_show_boot_complete_set_recommend: true
                }).then(() => {
                    _.isFunction(callback) && callback();
                });
            }
        }
    };

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
                this.setWebConfig({
                    no_show_personal_complete_info: true
                }).then(() => {
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

    setWebConfig(data) {
        return new Promise((resolve, rejcet) => {
            ajax.send({
                url: '/rest/base/v1/user/website/config/personnel',
                type: 'post',
                data: data
            }).done(result => {
                resolve(result);
            }).fail(err => {
                rejcet(err);
            });
        });
    }

    renderFormContent() {
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
                                    defaultMessage={'恭喜您成功开通试用版，试用期剩余 {count} 天'}
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

    //更新地址
    updateLocation = (addressObj) => {
        let areaData = this.state.stepData.areaData;
        areaData.province = addressObj.provName || '';
        areaData.city = addressObj.cityName || '';
        areaData.district = addressObj.countyName || '';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)), '第二步选择地址');
    };

    onReturnBack = (step) => {
        this.setState({currentStep: step});
    };

    //选择行业
    handleSelectIndustrysItem = (item) => {
        let {stepData} = this.state;
        let industrys = stepData.industrys;
        if(item === Intl.get('crm.basic.more', '更多')) {
            this.setState({
                showIndustryList: this.state.industryList
            });
            return false;
        }
        let index = _.findIndex(industrys, industry => industry === item);
        if(index > -1) {//如果选中，那就需要移除选中
            industrys.splice(index, 1);
        }else {//没有就选中
            industrys.push(item);
        }
        this.setState({stepData});
    };

    //渲染行业
    renderIndustriysBlock() {
        let industryList = this.state.industryList;
        //加载中的展示
        if (this.state.isGetIndustrys) {
            return (
                <div className="load-content">
                    <Spinner/>
                </div>
            );
        }
        else if (!industryList.length) {
            return (
                <div className="no-data-wrapper">
                    <NoDataIconTip
                        tipContent={Intl.get('crm.24', '暂无行业')}
                    />
                </div>
            );
        }
        else {
            return (
                <div style={{height: this.state.industryListHeight}}>
                    <GeminiScrollBar>
                        <div className="recommend-industrys-container">
                            <Row gutter={4} className="recommend-industrys-content">
                                {this.state.showIndustryList.map((item, index) => {
                                    const isSelected = _.includes(this.state.stepData.industrys, item);
                                    const cls = classNames('recommend-industrys-item',{
                                        'is-active': isSelected
                                    });
                                    return (
                                        <Col span={6} key={index}>
                                            <div className={cls} title={item} onClick={this.handleSelectIndustrysItem.bind(this, item)}>
                                                <span>{item}</span>
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </div>
                    </GeminiScrollBar>
                </div>
            );
        }
    }

    //渲染步骤一
    renderFirstStepBlock() {
        return (
            <div className="boot-complete-step-first-wrapper">
                <div className="boot-complete-step-title">{Intl.get('boot.complete.step.set.industry', '您关注哪些行业的客户?')}</div>
                <div className="boot-complete-set-recommend-container">
                    <div className="boot-complete-set-recommend-wrapper">
                        {this.renderIndustriysBlock()}
                    </div>
                </div>
                <div className="btn-container">
                    <Button size="large" type='primary' className='btn-item pull-right' onClick={this.onReturnBack.bind(this, STEPS_MAPS.SET_SECOND)}>{Intl.get('user.user.add.next', '下一步')}</Button>
                </div>
            </div>
        );
    }

    //渲染步骤二
    renderSecondBlock() {
        const areaData = this.state.stepData.areaData;
        return (
            <div className='boot-complete-step-second-wrapper'>
                <div className="boot-complete-step-title">{Intl.get('boot.complete.step.set.area', '您关注哪个地域的客户?')}</div>
                <AntcAreaSelection
                    labelCol="0"
                    wrapperCol="24"
                    width="100%"
                    colon={false}
                    placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                    provName={areaData.province}
                    cityName={areaData.city}
                    countyName={areaData.district}
                    isAlwayShow={false}
                    updateLocation={this.updateLocation}
                />
                <div className="btn-container">
                    <SaveCancelButton
                        loading={this.state.isLoading}
                        saveErrorMsg={this.state.errMsg}
                        handleSubmit={this.setRecommends}
                        handleCancel={this.onReturnBack.bind(this, STEPS_MAPS.SET_FIRST)}
                        okBtnText={Intl.get('clue.see.recommend', '查看推荐')}
                        cancelBtnText={Intl.get('user.user.add.back', '上一步')}
                    />
                </div>
            </div>
        );
    }

    renderContent() {
        const currentStep = this.state.currentStep;
        return (
            <div className="boot-complete-container">
                <span className='boot-complete-title'>{Intl.get('personal.welcome.use.curtao', '欢迎使用客套系统')}</span>
                <div className="boot-complete-content">
                    <div className="boot-complete-step-container">
                        {currentStep === STEPS_MAPS.SET_FIRST ? (
                            this.renderFirstStepBlock()
                        ) : (
                            this.renderSecondBlock()
                        )}
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
                className="boot-complete-info-wrapper"
                dataTracename="线索推荐引导"
            />
        );
    }
}
BootCompleteInformation.propTypes = {
    width: PropTypes.oneOfType([PropTypes.number,PropTypes.string]),
    showCloseBtn: PropTypes.bool,
    form: PropTypes.object,
    hideRightPanel: PropTypes.func
};
module.exports = Form.create()(BootCompleteInformation);