import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {Input,Button,Form} from 'antd';
import AlertTimer from 'CMP_DIR/alert-timer';
import applyTryAjax from './ajax/applyTryAjax';
import {userScales} from './util/apply_try_const';
import OperateSuccessTip from 'CMP_DIR/operate-success-tip';
import { nameLengthRule } from 'PUB_DIR/sources/utils/validate-util';
const Spinner = require('CMP_DIR/spinner');
require('./css/index.less');

class Index extends React.Component {
    state={
        successFlag: false,
        userScales: '',
        saveResult: '',
        notShowLoading: true,
    }

    static propTypes = {
        hideApply: PropTypes.func,
        versionKind: PropTypes.string,
        form: PropTypes.object,
        isShowMadal: PropTypes.bool
    }

    handleApplyClick = () => {
        this.props.form.validateFields((err,values) => {
            if(err) return;
            if(!this.state.notShowLoading) return;
            this.setState({
                notShowLoading: false
            });
            (this.props.versionKind && values.company) &&
            applyTryAjax.postApplyTry({
                company: values.company,
                user_scales: this.state.userScales,
                version_kind: this.props.versionKind
            },() => {
                this.setState({
                    successFlag: true,
                    notShowLoading: true
                });
            },() => {
                this.setState({
                    saveResult: 'error',
                    notShowLoading: true
                });
            });
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
    hideErrorMsg = () => {
        this.setState({
            saveResult: ''
        });
    }


    renderApplyTryContent(){
        const { getFieldDecorator } = this.props.form;
        const saveResult = this.state.saveResult;
        return <div className='apply-try-content'>
            {this.state.successFlag ? this.renderApplyResult() : (
                <div className='apply-try-content-wrapper'>
                    <div className='apply-try-content-title'>{Intl.get('personal.apply.trial.enterprise.edition','申请试用企业版')}</div>
                    <Form layout="inline">
                        <Form.Item label={Intl.get('register.company.nickname','公司名称')} className='apply-try-content-componey'>
                            {getFieldDecorator('company', {
                                rules: [nameLengthRule],
                            })(<Input className='apply-try-content-componey-input'/>)}
                        </Form.Item>
                        <div className='apply-try-content-use-number-wrapper'>
                            <span>{Intl.get('common.apply.try.user.scales','使用人数')}</span>
                            {
                                _.map(userScales,item => {
                                    let btnClass = 'apply-try-content-use-number';
                                    this.state.userScales === item.value ? btnClass += ' active-number' : '';
                                    return <Button className={btnClass} 
                                        onClick={this.setUserScales.bind(this,item.value)}>{item.value}</Button>;
                                })
                            }
                        </div>
                        <div className='apply-try-content-apply-btn-wrapper'>
                            <Button className='apply-try-content-apply-btn' 
                                type="primary" 
                                data-tracename='申请试用'
                                loading={!this.state.notShowLoading}
                                onClick={this.handleApplyClick}>{Intl.get('home.page.apply.type','申请')}</Button>
                        </div>
                    </Form>
                    {
                        saveResult ? 
                            <AlertTimer time={3000}
                                message={Intl.get('common.apply.failed','申请失败')}
                                type={saveResult} showIcon
                                onHide={saveResult === 'error' && this.hideErrorMsg}/> : null
                    }
                </div>
            )}
        </div>;
    }
    renderApplyResult(){
        return <OperateSuccessTip
            isShowBtn={false}
            title={Intl.get('user.apply.success','申请成功')}
            tip={Intl.get('common.apply.try.success.tip','稍后会有客户经理专门为您服务')}
        />;
    }
    renderApplyTry(){
        return<RightPanelModal
            content={this.renderApplyTryContent()}
            width='300'
            onClosePanel={this.handleClose}
            dataTracename='申请试用界面'
            isShowMadal={this.props.isShowMadal}
            isShowCloseBtn={true}/>;
    }
    render() {
        return <div className='apply-try-wrapper'>
            {this.renderApplyTry()}
        </div>;
    }
}
Index.defaultProps = {
    isShowMadal: true
};
export default Form.create()(Index);