/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/26.
 */
import {Checkbox,InputNumber,Icon} from 'antd';
class RadioCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            commissionRadio: this.props.commissionRadio,//提成比例
            submitCommissionRadio: '',//要提交的提成比例
            newCommissionRatio: this.props.newCommissionRatio,//新签提成比例
            submitNewCommissionRadio: '',//要提交的新签提成比例
            renewalCommissionRatio: this.props.renewalCommissionRatio,//续约提成比例
            submitRenewalCommissionRadio: '',//要提交的续约提成比例
            memberInfo: $.extend(true,{},this.props.memberInfo),
            isEdittingRadio: false,//是否是编辑状态
            isCheckBoxChecked: false,//是否选中checkBox
            submitErrorMsg: ''//保存出错后的修改
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            memberInfo: $.extend(true, {}, nextProps.memberInfo),
            commissionRadio: nextProps.commissionRadio,
            newCommissionRatio: nextProps.newCommissionRatio,
            renewalCommissionRatio: nextProps.renewalCommissionRatio,
            id: nextProps.id
        });
    }
    //点击编辑按钮
    handleClickEditRadio = () => {
        //如果原来的新签或者续约提成比例有一个有有效数字
        if ((_.isNumber(this.state.newCommissionRatio) && this.state.newCommissionRatio > -1 ) || (_.isNumber(this.state.renewalCommissionRatio) && this.state.renewalCommissionRatio > -1)){
            this.setState({
                isCheckBoxChecked: true
            });
        }
        this.setState({
            isEdittingRadio: true
        });
    };
    //点击选中或者取消选中的checkbox
    handleCheckChange = (e) => {
        this.setState({
            isCheckBoxChecked: e.target.checked
        });
    };
    getQueryParams(){
        var user = {};
        //如果提成或者目标的id存在，就更新那条记录
        if (this.state.id) {
            user.id = this.state.id;
        }
        var memberInfo = this.state.memberInfo;
        if (memberInfo.id) {
            user.user_id = memberInfo.id;
            user.user_name = memberInfo.name;
            user.sales_team = memberInfo.teamName;
            user.sales_team_id = memberInfo.teamId;
        }
        var submitNewCommissionRadio = this.state.submitNewCommissionRadio;
        var submitRenewalCommissionRadio = this.state.submitRenewalCommissionRadio;
        //提交新签或者续约提成比例的时候，把提成比例这个字段设置为负值
        if (this.state.isCheckBoxChecked){
            //新签比例如果没修改，就用原来的props传过来的值
            user.new_commission_ratio = submitNewCommissionRadio || submitNewCommissionRadio === 0 ? submitNewCommissionRadio : this.state.newCommissionRatio;
            user.renewal_commission_ratio = submitRenewalCommissionRadio || submitRenewalCommissionRadio === 0 ? submitRenewalCommissionRadio : this.state.renewalCommissionRatio;
            user.commission_ratio = -1;
        }else{
            //设置提成比例这个字段时，把新签或者续约提成比例设置成负值
            user.new_commission_ratio = -1;
            user.renewal_commission_ratio = -1;
            user.commission_ratio = this.state.submitCommissionRadio;
        }
        return user;

    }
    //保存修改的数据
    handleSubmit(){
        this.setState({
            loading: true
        });
        var user = this.getQueryParams();
        this.props.setSalesGoals(user).then((result) => {
            if (result.id) {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                });
                if (this.state.isCheckBoxChecked){
                    this.setState({
                        newCommissionRatio: user.new_commission_ratio,
                        renewalCommissionRatio: user.renewal_commission_ratio,
                        commissionRadio: ''
                    });
                }else{
                    this.setState({
                        commissionRadio: user.commission_ratio,
                        newCommissionRatio: '',
                        renewalCommissionRatio: ''
                    });
                }
                this.handleCancel();
            } else {
                this.setState({
                    loading: false,
                    submitErrorMsg: Intl.get('common.edit.failed', '修改失败')
                });
            }
        },(errorMsg) => {
            this.setState({
                loading: false,
                submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
            });
        });
    }
    //点击取消按钮
    handleCancel(){
        this.setState({
            isEdittingRadio: false,
            isCheckBoxChecked: false,
            submitCommissionRadio: '',
            submitNewCommissionRadio: '',
            submitRenewalCommissionRadio: ''
        });
    }
    handleChangeNewCommissionRadio = (value) => {
        this.setState({
            submitNewCommissionRadio: value
        });
    };
    handleChangeRenewalCommissionRadio = (value) => {
        this.setState({
            submitRenewalCommissionRadio: value
        });
    };
    handleRadioCount = (value) => {
        this.setState({
            submitCommissionRadio: value
        });
    };
    renderEditRadioCount(){
        var errorBlock = this.state.submitErrorMsg ? (
            <div className="has-error"><span className="ant-form-explain">{this.state.submitErrorMsg}</span></div>
        ) : null;
        return (
            <div>
                <Checkbox onChange={this.handleCheckChange} checked={this.state.isCheckBoxChecked}>
                    {Intl.get('sales.if.switch.type', '是否区分新签和续约类型')}
                </Checkbox>
                {this.state.isCheckBoxChecked ? <div>
                    <div>
                        {Intl.get('sales.new.write.contract.radio', '新签提成比例')}:
                        <InputNumber min={0} max={100} defaultValue={this.state.newCommissionRatio} onChange={this.handleChangeNewCommissionRadio}/>%
                    </div>
                    <div>
                        {Intl.get('sales.rewrite.contract.radio', '续约提成比例')}:
                        <InputNumber min={0} max={100} defaultValue={this.state.renewalCommissionRatio} onChange={this.handleChangeRenewalCommissionRadio}/>%
                        {this.state.loading ? <Icon type="loading"/> : <span>
                            <i title={Intl.get('common.update', '修改')} className="iconfont icon-choose" onClick={(e) => {this.handleSubmit(e);}} data-tracename="保存修改新签和续约提成比例"></i>
                            <i title={Intl.get('common.cancel', '取消')} className="iconfont icon-close" onClick={(e) => {this.handleCancel(e);}} data-tracename="取消修改新签和续约提成比例"></i>
                        </span>}
                    </div>
                </div> : <div>
                    {Intl.get('contract.141', '提成比例')}:
                    <InputNumber min={0} max={100} defaultValue={this.state.commissionRadio} onChange={this.handleRadioCount}/>%
                    {this.state.loading ? <Icon type="loading"/> : <span>
                        <i title={Intl.get('common.update', '修改')} className="iconfont icon-choose" onClick={(e) => {this.handleSubmit(e);}} data-tracename="保存修改提成比例"></i>
                        <i title={Intl.get('common.cancel', '取消')} className="iconfont icon-close" onClick={(e) => {this.handleCancel(e);}} data-tracename="取消修改提成比例"></i>
                    </span>}
                </div>}
                {errorBlock}
            </div>
        );
    }
    render(){
        var newCommissionRatio = this.state.newCommissionRatio;
        var renewalCommissionRatio = this.state.renewalCommissionRatio;
        return (
            <div className="radio-container">
                {this.state.isEdittingRadio ? this.renderEditRadioCount() : <div className="text-show">
                    {(newCommissionRatio && newCommissionRatio > -1) || (renewalCommissionRatio && renewalCommissionRatio > -1) || newCommissionRatio === 0 || renewalCommissionRatio === 0 ? <div>
                        <p>
                            {Intl.get('sales.new.write.contract.radio', '新签提成比例')}: {newCommissionRatio}%
                        </p>
                        <p>
                            {Intl.get('sales.rewrite.contract.radio', '续约提成比例')}: {this.state.renewalCommissionRatio}%
                            <i className="iconfont icon-update" onClick={this.handleClickEditRadio} data-tracename="点击修改新签或续约提成比例"></i>
                        </p>
                    </div> : <div>
                        {Intl.get('contract.141', '提成比例')}: {this.state.commissionRadio}%
                        <i className="iconfont icon-update" onClick={this.handleClickEditRadio} data-tracename="点击修改提成比例"></i>
                    </div>}
                </div>}
            </div>
        );
    }
}

RadioCard.propTypes = {
    id: PropTypes.string,
    commissionRadio: PropTypes.number,
    newCommissionRatio: PropTypes.number,
    renewalCommissionRatio: PropTypes.number,
    memberInfo: PropTypes.object,
    setSalesGoals: PropTypes.func,
};

export default RadioCard;