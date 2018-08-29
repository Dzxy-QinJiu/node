/**
 * Created by wangliping on 2017/3/9.
 */
var React = require('react');
import {Tag, Icon, Input, message} from 'antd';
let BatchChangeStore = require('../../store/batch-change-store');
let BatchChangeActions = require('../../action/batch-change-actions');
let CrmBasicAjax = require('../../ajax/index');
import Trace from 'LIB_DIR/trace';
import {isClueTag, isTurnOutTag} from '../../utils/crm-util';

let TagEditField = React.createClass({
    getDefaultProps: function() {
        return {
            //是否能修改
            disabled: false,
            customerId: '',
            //标签
            labels: '',
            //修改成功
            modifySuccess: function() {
            }
        };
    },
    getInitialState: function() {
        return {
            loading: false,
            disabled: this.props.disabled,
            displayType: 'text',
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            labels: $.extend(true, [], this.props.labels),
            recommendTags: BatchChangeStore.getState().recommendTags,
            submitErrorMsg: ''
        };
    },
    onStoreChange: function() {
        this.setState({recommendTags: BatchChangeStore.getState().recommendTags});
    },
    componentDidMount: function() {
        BatchChangeStore.listen(this.onStoreChange);
        BatchChangeActions.getRecommendTags();
    },
    componentWillUnmount: function() {
        BatchChangeStore.unlisten(this.onStoreChange);
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.customerId != this.state.customerId) {
            //切换客户时，重新设置state数据
            let stateData = this.getInitialState();
            stateData.isMerge = nextProps.isMerge;
            stateData.customerId = nextProps.customerId;
            stateData.labels = $.extend(true, [], nextProps.labels);
            stateData.disabled = nextProps.disabled;
            this.setState(stateData);
        } else {
            let diff1 = _.difference(this.state.labels, nextProps.labels);
            let diff2 = _.difference(nextProps.labels, this.state.labels);
            //标签有变化
            if (diff1.length || diff2.length) {
                this.setState({labels: nextProps.labels});
            }
        }
    },
    addTag: function(e) {
        if (e.keyCode !== 13) return;

        const tag = e.target.value.trim();
        if (!tag) return;
        //”线索“、”转出“标签“不可以添加
        if (isClueTag(tag) || isTurnOutTag(tag)) {
            message.error(Intl.get('crm.sales.clue.add.disable', '不能手动添加\'{label}\'标签', {label: tag}));
            return;
        }
        this.toggleTag(tag, true);
        Trace.traceEvent($(this.getDOMNode()).find('.tag-input'), '按enter键添加新标签');
        //清空输入框
        this.refs.newTag.refs.input.value = '';
    },
    toggleTag: function(tag, isAdd) {
        //不可以操作'线索'和‘转出’标签
        if (isClueTag(tag) || isTurnOutTag(tag)) {
            return;
        }
        Trace.traceEvent($(this.getDOMNode()).find('.block-tag-edit'), '点击选中/取消选中某个标签');
        let labels = this.state.labels || [];

        if (labels.indexOf(tag) > -1) {
            if (isAdd) return;

            labels = labels.filter(theTag => theTag != tag);
            this.state.labels = labels;
        }
        else {
            labels.push(tag);

            this.state.labels = labels;

            if (this.state.recommendTags.indexOf(tag) === -1) {
                this.state.recommendTags.push(tag);
            }
        }

        this.setState(this.state);
    },

    //回到展示状态
    backToDisplay: function() {
        this.setState({
            loading: false,
            displayType: 'text',
            submitErrorMsg: ''
        });
    },
    handleSubmit: function(e) {
        if (this.state.loading) return;
        let diff1 = _.difference(this.state.labels, this.props.labels);
        let diff2 = _.difference(this.props.labels, this.state.labels);
        //标签没有变化时，直接返回到展示界面
        if (!(diff1.length || diff2.length)) {
            this.backToDisplay();
            return;
        }
        //保存前先过滤掉线索、转出标签
        let labels = _.filter(this.state.labels, label => !isClueTag(label) && !isTurnOutTag(label));
        let submitData = {
            id: this.props.customerId,
            type: 'label',
            labels: labels
        };
        Trace.traceEvent(e, '保存对标签的添加');
        if (this.props.isMerge) {
            this.props.updateMergeCustomer(submitData);
            this.backToDisplay();
        } else {
            this.setState({loading: true});
            CrmBasicAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    this.backToDisplay();
                    //更新列表中的客户名
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('crm.164', '修改客户标签失败')
                });
            });
        }
    },

    handleCancel: function(e) {
        Trace.traceEvent(e, '取消对标签的添加');
        this.setState({
            labels: $.extend(true, [], this.props.labels),
            displayType: 'text',
            submitErrorMsg: ''
        });
    },

    setEditable: function(e) {
        Trace.traceEvent(e, '点击设置标签');
        this.setState({displayType: 'edit'});
    },
    render: function() {
        //标签
        let tagsArray = this.state.labels ? this.state.labels : [];
        var tags = tagsArray.map(function(tag, index) {
            return (<Tag key={index}>{tag}</Tag>);
        });

        let textBlock = this.state.displayType === 'text' ? (
            <div>
                <span className="inline-block block-tag">{tags}</span>
                {
                    !this.state.disabled ? (
                        <i className="inline-block iconfont icon-update" title={Intl.get('crm.165', '设置标签')}
                            onClick={(e) => {
                                this.setEditable(e);
                            }}/>
                    ) : null
                }

            </div>
        ) : null;

        let errorBlock = this.state.submitErrorMsg ? (
            <div className="has-error"><span className="ant-form-explain">{this.state.submitErrorMsg}</span></div>
        ) : null;

        let buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get('common.save', '保存')} className="inline-block iconfont icon-choose" onClick={(e) => {
                    this.handleSubmit(e);
                }}/>
                <i title={Intl.get('common.cancel', '取消')} className="inline-block iconfont icon-close"
                    onClick={(e) => {
                        this.handleCancel(e);
                    }}/>
            </div>
        );
        var selectedTagsArray = this.state.labels ? this.state.labels : [];
        var recommendTagsArray = _.isArray(this.state.recommendTags) ? this.state.recommendTags : [];
        //过滤掉线索、转出标签，保证selectedTagsArray中有”线索“、“转出”标签，则只展示，没有就不展示
        recommendTagsArray = _.filter(recommendTagsArray, tag => tag != Intl.get('crm.sales.clue', '线索') && tag != Intl.get('crm.qualified.roll.out', '转出'));
        var unionTagsArray = _.union(recommendTagsArray, selectedTagsArray);
        var tagsJsx = unionTagsArray.map((tag, index) => {
            let className = 'customer-tag';
            className += selectedTagsArray.indexOf(tag) > -1 ? ' tag-selected' : '';
            return (<span key={index} onClick={() => this.toggleTag(tag)} className={className}>{tag}</span>);
        });

        let inputBlock = this.state.displayType === 'edit' ? (
            <div className="inputWrap" ref="inputWrap">
                <div className="block-tag-edit">
                    {tagsJsx}
                </div>
                <div className="tag-input">
                    <Input placeholder={Intl.get('crm.28', '按Enter键添加新标签')} ref="newTag"
                        onKeyUp={this.addTag}
                    />
                </div>
                <div className="buttons">
                    {buttonBlock}
                </div>
                {errorBlock}
            </div>
        ) : null;

        return (
            <div data-tracename="标签">
                {textBlock}
                {inputBlock}
            </div>
        );
    }
});
module.exports = TagEditField;
