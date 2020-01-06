import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {Input,Button,Form} from 'antd';
import AlertTimer from 'CMP_DIR/alert-timer';
import applyTryAjax from './ajax/applyTryAjax';
import {userScales} from './util/apply_try_const';
import OperateSuccessTip from 'CMP_DIR/operate-success-tip';
import { nameLengthRule } from 'PUB_DIR/sources/utils/validate-util';
require('./css/index.less');

class Index extends React.Component {
    state={
        successFlag: false,
        userScales: '',
        saveResult: ''
    }

    static propTypes = {
        hideApply: PropTypes.func,
        versionKind: PropTypes.string,
        form: PropTypes.object,
        isShowMadal: PropTypes.bool,
        versionKindName: PropTypes.string
    }

    handleApplyClick = () => {
        this.props.form.validateFields((err,values) => {
            if(err) return;
            (this.props.versionKind && values.company) &&
            applyTryAjax.postApplyTry({
                company: values.company,
                user_scales: this.state.userScales,
                version_kind: this.props.versionKind,
                version_kind_name: this.props.versionKindName
            },() => {
                this.setState({
                    successFlag: true
                });
            },() => {
                this.setState({
                    saveResult: 'error'
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
                    <div className='apply-try-content-title'>{Intl.get('login.apply.trial','申请试用')}</div>
                    <Form layout="inline">
                        <Form.Item label={Intl.get('register.company.nickname','公司名称')} className='apply-try-content-componey'>
                            {getFieldDecorator('company', {
                                rules: [nameLengthRule],
                            })(<Input className='apply-try-content-componey-input'/>)}
                        </Form.Item>
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
                            <Button className='apply-try-content-apply-btn' 
                                type="primary" 
                                data-tracename='申请试用'
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
    isShowMadal: true,
    versionKindName: '企业版'
};
export default Form.create()(Index);