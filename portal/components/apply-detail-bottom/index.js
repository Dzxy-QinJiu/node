/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/30.
 */
import {Row, Col, Button} from 'antd';
require('./index.less');
class ApplyDetailBottom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderBottomText = () => {
        var assigenedContext = _.isFunction(this.props.renderAssigenedContext) ? this.props.renderAssigenedContext() : null;
        if (assigenedContext) {
            return assigenedContext;
        } else {
            return <div className="pull-right">
                <Button type="primary" className="btn-primary-sure" size="small"
                    onClick={this.props.submitApprovalForm.bind(this, 'pass')}>
                    {Intl.get('user.apply.detail.button.pass', '通过')}
                </Button>
                <Button type="primary" className="btn-primary-sure" size="small"
                    onClick={this.props.submitApprovalForm.bind(this, 'reject')}>
                    {Intl.get('common.apply.reject', '驳回')}
                </Button>
            </div>;
        }
    };

    render() {
        return (
            <div className="approval_block">
                <Row className="approval_person clearfix">
                    <Col span={10}>
                        <span className="approval-info-label">
                            {this.props.create_time ? moment(this.props.create_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) : ''}
                        </span>
                        <span className="approval-info-label">
                            {this.props.applicantText}
                        </span>
                    </Col>
                    <Col span={14}>
                        {this.props.isConsumed ? (
                            <div className="pull-right">
                                <span className="approval-info-label">
                                    {this.props.update_time ? moment(this.props.update_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) : ''}
                                </span>
                                <span className="approval-info-label">
                                    {this.props.approvalText}
                                </span>
                            </div>) : (
                            this.props.showApproveBtn ?
                                this.renderBottomText()
                                : null
                        )}
                    </Col>
                </Row>
            </div>
        );
    }
}
ApplyDetailBottom.defaultProps = {
    create_time: '',
    applicantText: '',
    isConsumed: false,
    update_time: '',
    approvalText: '',
    showApproveBtn: false,
    submitApprovalForm: function() {

    },
    renderAssigenedContext: function(){

    }
};
ApplyDetailBottom.propTypes = {
    create_time: PropTypes.string,
    applicantText: PropTypes.string,
    isConsumed: PropTypes.boolean,
    update_time: PropTypes.string,
    approvalText: PropTypes.string,
    showApproveBtn: PropTypes.boolean,
    submitApprovalForm: PropTypes.func,
    renderAssigenedContext: PropTypes.func,
};

export default ApplyDetailBottom;
