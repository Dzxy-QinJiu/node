/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * ��Ȩ���� (c) 2015-2018 �����Ϸ�����ɷ����޹�˾����������Ȩ����
 * Created by zhangshujuan on 2018/4/26.
 */
import {Checkbox,InputNumber,Icon} from 'antd';
class RadioCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            commissionRadio: this.props.commissionRadio,//��ɱ���
            submitCommissionRadio: '',//Ҫ�ύ����ɱ���
            newCommissionRatio: this.props.newCommissionRatio,//��ǩ��ɱ���
            submitNewCommissionRadio: '',//Ҫ�ύ����ǩ��ɱ���
            renewalCommissionRatio: this.props.renewalCommissionRatio,//��Լ��ɱ���
            submitRenewalCommissionRadio: '',//Ҫ�ύ����Լ��ɱ���
            memberInfo: $.extend(true,{},this.props.memberInfo),
            isEdittingRadio: false,//�Ƿ��Ǳ༭״̬
            isCheckBoxChecked: false,//�Ƿ�ѡ��checkBox
            submitErrorMsg: ''//����������޸�
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
    //����༭��ť
    handleClickEditRadio = () => {
        //���ԭ������ǩ������Լ��ɱ�����һ������Ч����
        if ((_.isNumber(this.state.newCommissionRatio) && this.state.newCommissionRatio > -1 ) || (_.isNumber(this.state.renewalCommissionRatio) && this.state.renewalCommissionRatio > -1)){
            this.setState({
                isCheckBoxChecked: true
            });
        }
        this.setState({
            isEdittingRadio: true
        });
    };
    //���ѡ�л���ȡ��ѡ�е�checkbox
    handleCheckChange = (e) => {
        this.setState({
            isCheckBoxChecked: e.target.checked
        });
    };
    getQueryParams(){
        var user = {};
        //�����ɻ���Ŀ���id���ڣ��͸���������¼
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
        //�ύ��ǩ������Լ��ɱ�����ʱ�򣬰���ɱ�������ֶ�����Ϊ��ֵ
        if (this.state.isCheckBoxChecked){
            //��ǩ�������û�޸ģ�����ԭ����props��������ֵ
            user.new_commission_ratio = submitNewCommissionRadio || submitNewCommissionRadio === 0 ? submitNewCommissionRadio : this.state.newCommissionRatio;
            user.renewal_commission_ratio = submitRenewalCommissionRadio || submitRenewalCommissionRadio === 0 ? submitRenewalCommissionRadio : this.state.renewalCommissionRatio;
            user.commission_ratio = -1;
        }else{
            //������ɱ�������ֶ�ʱ������ǩ������Լ��ɱ������óɸ�ֵ
            user.new_commission_ratio = -1;
            user.renewal_commission_ratio = -1;
            user.commission_ratio = this.state.submitCommissionRadio;
        }
        return user;

    }
    //�����޸ĵ�����
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
                    submitErrorMsg: Intl.get('common.edit.failed', '�޸�ʧ��')
                });
            }
        },(errorMsg) => {
            this.setState({
                loading: false,
                submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '�޸�ʧ��')
            });
        });
    }
    //���ȡ����ť
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
                    {Intl.get('sales.if.switch.type', '�Ƿ�������ǩ����Լ����')}
                </Checkbox>
                {this.state.isCheckBoxChecked ? <div>
                    <div>
                        {Intl.get('sales.new.write.contract.radio', '��ǩ��ɱ���')}:
                        <InputNumber min={0} max={100} defaultValue={this.state.newCommissionRatio} onChange={this.handleChangeNewCommissionRadio}/>%
                    </div>
                    <div>
                        {Intl.get('sales.rewrite.contract.radio', '��Լ��ɱ���')}:
                        <InputNumber min={0} max={100} defaultValue={this.state.renewalCommissionRatio} onChange={this.handleChangeRenewalCommissionRadio}/>%
                        {this.state.loading ? <Icon type="loading"/> : <span>
                            <i title={Intl.get('common.update', '�޸�')} className="iconfont icon-choose" onClick={(e) => {this.handleSubmit(e);}} data-tracename="�����޸���ǩ����Լ��ɱ���"></i>
                            <i title={Intl.get('common.cancel', 'ȡ��')} className="iconfont icon-close" onClick={(e) => {this.handleCancel(e);}} data-tracename="ȡ���޸���ǩ����Լ��ɱ���"></i>
                        </span>}
                    </div>
                </div> : <div>
                    {Intl.get('contract.141', '��ɱ���')}:
                    <InputNumber min={0} max={100} defaultValue={this.state.commissionRadio} onChange={this.handleRadioCount}/>%
                    {this.state.loading ? <Icon type="loading"/> : <span>
                        <i title={Intl.get('common.update', '�޸�')} className="iconfont icon-choose" onClick={(e) => {this.handleSubmit(e);}} data-tracename="�����޸���ɱ���"></i>
                        <i title={Intl.get('common.cancel', 'ȡ��')} className="iconfont icon-close" onClick={(e) => {this.handleCancel(e);}} data-tracename="ȡ���޸���ɱ���"></i>
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
                            {Intl.get('sales.new.write.contract.radio', '��ǩ��ɱ���')}: {newCommissionRatio}%
                        </p>
                        <p>
                            {Intl.get('sales.rewrite.contract.radio', '��Լ��ɱ���')}: {this.state.renewalCommissionRatio}%
                            <i className="iconfont icon-update" onClick={this.handleClickEditRadio} data-tracename="����޸���ǩ����Լ��ɱ���"></i>
                        </p>
                    </div> : <div>
                        {Intl.get('contract.141', '��ɱ���')}: {this.state.commissionRadio}%
                        <i className="iconfont icon-update" onClick={this.handleClickEditRadio} data-tracename="����޸���ɱ���"></i>
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