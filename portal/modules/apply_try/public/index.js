import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {Input,Button,message,Form} from 'antd';
import applyTryAjax from './ajax/applyTryAjax';
import {userScales} from './util/apply_try_const';
import OperateSuccessTip from 'CMP_DIR/operate-success-tip';
import { nameLengthRule } from 'PUB_DIR/sources/utils/validate-util';
require('./css/index.less');

class Index extends React.Component {
    state={
        successFlag: false,
        userScales: '',
        company: '',
        remark: '',
    }

    static propTypes = {
        hideApply: PropTypes.func,
        versionKind: PropTypes.string,
        form: PropTypes.object
    }

    handleApplyClick = () => {
        (this.props.versionKind && this.state.company) &&
            applyTryAjax.postApplyTry({
                company: this.state.company,
                user_scales: this.state.userScales,
                remark: this.state.remark,
                version_kind: this.props.versionKind
            },() => {
                this.setState({
                    successFlag: !this.state.successFlag,
                    showSuccess: true 
                });
            },() => {
                message.error(Intl.get('common.apply.failed','申请失败'));
            });
    }

    handleClose = () => {
        this.props.hideApply();
    }
    setUserScales = (value) => {
        this.setState({
            userScales: value
        });
    }
    setCompany = (e) => {
        this.setState({
            company: e.target.value
        });
    }


    renderApplyTryContent(){
        const { getFieldDecorator } = this.props.form;
        return <div className='apply-try-content'>
            {this.state.successFlag ? this.renderApplyResult() : (
                <div className='apply-try-content-wrapper'>
                    <div className='apply-try-content-title'>{Intl.get('login.apply.trial','申请试用')}</div>
                    <Form>
                        <div className='apply-try-content-componey'>
                            <Form.Item>
                                <span>{Intl.get('register.company.nickname','公司名称')}</span>
                                {getFieldDecorator('apply-try-content-componey-input', {
                                    rules: [nameLengthRule],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input id='apply-try-content-componey-input' 
                                        className='apply-try-content-componey-input' 
                                        onBlur={this.setCompany} />
                                )}
                            </Form.Item>
                        </div>
                        <div className='apply-try-content-useNumber-wrapper'>
                            <span>{Intl.get('common.apply.try.user.scales','使用人数')}</span>
                            {
                                _.map(userScales,item => {
                                    return <Button className='apply-try-content-useNumber' 
                                        type={this.state.userScales === item.value ? 'primary' : ''} 
                                        onClick={this.setUserScales.bind(this,item.value)}>{item.value}</Button>;
                                })
                            }
                        </div>
                        <div className='apply-try-content-apply-btn-wrapper'>
                            <Button className='apply-try-content-apply-btn' type="primary" onClick={this.handleApplyClick}>{Intl.get('home.page.apply.type','申请')}</Button>
                        </div>
                    </Form>
                </div>
            )}
        </div>;
    }
    renderApplyResult(){
        if(this.state.showSuccess){
            return <OperateSuccessTip
                isShowBtn={false}
                title={Intl.get('user.apply.success','申请成功')}
                tip={Intl.get('common.apply.try.success.tip','稍后会有客户经理专门为您服务')}
            />;
        }
    }
    renderApplyTry(){
        return<RightPanelModal
            content={this.renderApplyTryContent()}
            width='300'
            onClosePanel={this.handleClose}
            isShowCloseBtn={true}/>;
    }
    render() {
        return <div className='apply-try-wrapper'>
            {this.renderApplyTry()}
        </div>;
    }
}
export default Form.create()(Index);