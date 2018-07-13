/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/9.
 */
import ContactItem from './contact-item';
import {Button, Input, Icon} from 'antd';
const {TextArea} = Input;
require('../css/sales-clue-item.less');
import AlertTimer from 'CMP_DIR/alert-timer';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var SalesHomeAction = require('../action/sales-home-actions');
var Spinner = require('CMP_DIR/spinner');
import ClueRightPanel from 'MOD_DIR/clue_customer/public/views/clue-right-panel';
const DELAY_TIME = 3000;
var classNames = require('classnames');
class SalesClueItem extends React.Component {
    constructor(props) {
        super(props);
        var propsItem = this.props.salesClueItemDetail;
        this.state = {
            salesClueItemDetail: propsItem,
            isEdittingItem: {},//正在编辑的那一条
            submitContent: this.getSubmitContent(propsItem),//要提交的跟进记录的内容
            submitTraceErrMsg: '',//提交跟进记录出错的信息
            submitTraceLoading: false,//正在提交跟进记录
            isRemarkingItem: '',//正在标记线索是否有效的线索
            remarkingErrMsg: '',//标记出错
            isAssocaiteItem: '',//正在关联客户的线索
            isShowClueDetail: false,//正在查看线索详情
            assocaitedItemSuccessItem: ''//正确关联了客户的线索
        };
    }
    getSubmitContent(propsItem) {
        return _.get(propsItem,'customer_traces[0]','') ? propsItem.customer_traces[0].remark : '';
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'salesClueItemDetail.id','') !== this.state.salesClueItemDetail.id) {
            this.setState({
                salesClueItemDetail: nextProps.salesClueItemDetail,
                submitContent: this.getSubmitContent(nextProps.salesClueItemDetail),
            });
        }
    }

    handleEditTrace = (updateItem) => {
        this.setState({
            isEdittingItem: updateItem
        });
    };
    handleCancelBtn = () => {
        this.setState({
            submitTraceErrMsg: '',
            isEdittingItem: {},
            submitContent: this.getSubmitContent(this.state.salesClueItemDetail)
        });
    };
    handleInputChange = (e) => {
        this.setState({
            submitContent: e.target.value
        });
    };
    handleSubmitContent = (item) => {
        if (this.state.submitTraceLoading){
            return;
        }
        //获取填写的保存跟进记录的内容
        var textareVal = $.trim(this.state.submitContent);
        if (!textareVal) {
            this.setState({
                submitTraceErrMsg: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
            });
        } else {
            var submitObj = {
                'customer_id': item.id,
                'remark': textareVal
            };
            this.setState({
                submitTraceLoading: true,
            });
            clueCustomerAction.addCluecustomerTrace(submitObj, (result) => {
                if (result && result.error) {
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: Intl.get('common.save.failed', '保存失败')
                    });
                } else {
                    var clueItem = this.state.salesClueItemDetail;
                    if (!clueItem.customer_traces){
                        clueItem.customer_traces = [{remark: textareVal}];
                    }else {
                        //原来有customer_traces这个属性时，数组中除了remark还有别的属性
                        clueItem.customer_traces[0].remark = textareVal;
                    }
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: '',
                        salesClueItemDetail: clueItem,
                        isEdittingItem: {},
                    });
                }
            });
        }
    };

    renderEditTraceContent(salesClueItem) {
        //点击增加按钮 补充跟进记录
        var hide = () => {
            this.setState({
                submitTraceErrMsg: '',
            });
        };
        return (
            <div className="edit-trace-content">
                {this.state.submitTraceErrMsg ? (
                    <div className="has-error">
                        <AlertTimer
                            time={DELAY_TIME}
                            message={this.state.submitTraceErrMsg}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                    </div>
                ) : null}
                <TextArea type='textarea' value={this.state.submitContent}
                    placeholder={Intl.get('sales.home.fill.in.trace.content', '请输入跟进内容')}
                    onChange={this.handleInputChange}/>
                <div className="save-cancel-btn">
                    <Button type='primary' onClick={this.handleSubmitContent.bind(this, salesClueItem)}
                        disabled={this.state.submitTraceLoading}>{Intl.get('common.save', '保存')}
                        {this.state.submitTraceLoading ? <Icon type="loading"/> : null}
                    </Button>
                    <Button className='cancel-btn'
                        onClick={this.handleCancelBtn}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>
        );
    }

    //关联客户
    handleAssociateCustomer = (salesClueItem) => {
        this.setState({
            isAssocaiteItem: salesClueItem
        });
    };
    //标记线索无效
    handleRemakClueAble = (item) => {
        var submitObj = {
            id: item.id,
            availability: '1'
        };
        this.setState({
            isRemarkingItem: item.id,
        });
        clueCustomerAction.updateCluecustomerDetail(submitObj, (result) => {
            setTimeout(() => {
                this.setState({
                    isRemarkingItem: '',
                });
                //标记出错了
                if (_.isString(result)) {
                    this.setState({
                        remarkingErrMsg: result
                    });
                } else {
                    this.setState({
                        remarkingErrMsg: ''
                    });
                    //在列表中删除该线索
                    SalesHomeAction.afterRemarkClue({id: item.id});
                }
            }, DELAY_TIME);
        });
    };

    renderTextContent(salesClueItem, hasRecordTrace) {
        return (
            <div className="clue-btns">
                <div className="record-trace">
                    {hasRecordTrace ?
                        <div className="record-trace-container">
                            <span>
                                {_.get(salesClueItem,'customer_traces[0].add_time') ? moment(salesClueItem.customer_traces[0].add_time).format(oplateConsts.DATE_FORMAT) : ''}
                            </span>
                            <span className="trace-author">
                                {Intl.get('sales.home.i.trace', '我')}:
                            </span>
                            <span>
                                {_.get(salesClueItem,'customer_traces[0].remark','')}
                                <i className="iconfont icon-edit-btn"
                                    onClick={this.handleEditTrace.bind(this, salesClueItem)}></i>
                            </span>
                        </div>

                        : <Button
                            onClick={this.handleEditTrace.bind(this, salesClueItem)}>+{Intl.get('call.record.follow.content', '跟进内容')}</Button>
                    }

                </div>
                <div className="add-btn">
                    {salesClueItem.customer_id ? null : <Button
                        onClick={this.handleAssociateCustomer.bind(this, salesClueItem)}>{Intl.get('clue.customer.associate.customer', '关联客户')}</Button>}
                    {salesClueItem.availability === '1' ? null : <Button className="remark-clue"
                        onClick={this.handleRemakClueAble.bind(this, salesClueItem)}>{Intl.get('sales.remark.clue.able', '线索无效')}</Button>}

                </div>
            </div>
        );
    }
    afterModifiedAssocaitedCustomer = (updateItem) => {
        this.setState({
            assocaitedItemSuccessItem: updateItem
        });
    };
    hideRightPanel = () => {
        //关闭后，主要是判断一下刚才是否有对该线索进行过关联，如果成功关联了客户，那么在手动关闭右侧面板后，在列表中删除该条记录，在列表中会有一个loading状态
        this.setState({
            isAssocaiteItem: '',
        },() => {
            var assocaiteItem = this.state.assocaitedItemSuccessItem;
            if (assocaiteItem){
                this.setState({
                    isRemarkingItem: assocaiteItem
                });
                setTimeout(() => {
                    SalesHomeAction.afterRemarkClue({id: assocaiteItem.id});
                    this.setState({
                        isRemarkingItem: '',
                        isShowClueDetail: false
                    });
                },DELAY_TIME);
            }else{
                this.setState({
                    isRemarkingItem: '',
                    isShowClueDetail: false
                });
            }
        });
    };
    handleShowClueDetail = (item) => {
        this.setState({
            isShowClueDetail: true,
            isAssocaiteItem: item
        });
    };
    render() {
        var salesClueItem = this.state.salesClueItemDetail;
        //联系人的相关信息
        var contacts = salesClueItem.contacts ? salesClueItem.contacts : [];
        var hasRecordTrace = _.isArray(salesClueItem.customer_traces) && salesClueItem.customer_traces.length;
        var hide = () => {
            this.setState({
                remarkingErrMsg: '',
            });
        };
        //如果是点击关联客户的时候有模态框，点击查看详情的时候没有模态框
        var associateCls = classNames({
            'associate-wrap': !this.state.isShowClueDetail
        });
        var itemCls = classNames('sales-clue-item-container customer-detail-item',{
            'cur-clue': this.state.isShowClueDetail
        });
        return (
            <div className={itemCls}>
                <div className="clue-top-title">
                    {hasRecordTrace ? null :
                        <span className="clue-stage">{Intl.get('sales.home.will.trace', '待跟进')}</span>}
                    <span className="clue-name" onClick={this.handleShowClueDetail.bind(this, salesClueItem)}>{salesClueItem.name}</span>
                </div>
                <div className="clue-content">
                    <div className="clue-trace-content">
                        <span>{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}</span>
                        {salesClueItem.access_channel ? <span className="clue-access-channel">{salesClueItem.access_channel}:</span> : null}
                        <span>{salesClueItem.source}</span>
                    </div>
                    {_.isArray(contacts) && contacts.length ? <ContactItem
                        contacts={contacts}
                        customerData={salesClueItem}
                        showContactLabel={false}
                        callNumber={this.props.callNumber}
                        errMsg={this.props.errMsg}
                    /> : null}
                </div>
                <div className="clue-foot">
                    {_.isEmpty(this.state.isEdittingItem) ? this.renderTextContent(salesClueItem, hasRecordTrace) :
                        this.renderEditTraceContent(salesClueItem)}
                </div>
                {this.state.isRemarkingItem ?
                    <div className="loading-container-wrap">
                        <div className="is-loading">
                            <Spinner/>
                            <p>{Intl.get('sales.home.no.show.frontpage', '本条线索处理完毕后，将不在首页展示')}</p>
                        </div>
                    </div>
                    : null}
                {this.state.remarkingErrMsg ?
                    <div className="remark-error">
                        <AlertTimer
                            time={DELAY_TIME}
                            message={this.state.remarkingErrMsg}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                    </div>
                    : null}
                {this.state.isAssocaiteItem ?
                    <div className={associateCls}>
                        <ClueRightPanel
                            showFlag={true}
                            currentId={this.state.isAssocaiteItem.id}
                            hideRightPanel={this.hideRightPanel}
                            afterModifiedAssocaitedCustomer ={this.afterModifiedAssocaitedCustomer}
                            curCustomer={this.state.isAssocaiteItem}
                        />
                    </div>
                    : null}
            </div>
        );
    }
}

SalesClueItem.defaultProps = {
    salesClueItemDetail: {},
    callNumber: '',
    errMsg: ''
};
SalesClueItem.propTypes = {
    salesClueItemDetail: React.PropTypes.object,
    callNumber: React.PropTypes.string,
    errMsg: React.PropTypes.string
};
export default SalesClueItem;
