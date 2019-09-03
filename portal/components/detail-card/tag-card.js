/**
 * 详情中信息展示的标签卡片
 * Created by wangliping on 2018/3/28.
 */
require('./tag-card.less');
import DetailCard from './index';
import classNames from 'classnames';
import {Button, Icon, Input, message} from 'antd';
import {DetailEditBtn} from '../rightPanel';
import {isUnmodifiableTag} from 'MOD_DIR/crm/public/utils/crm-util';
import Trace from 'LIB_DIR/trace';
import {isDiffOfTwoArray} from 'PUB_DIR/sources/utils/common-method-util';
class TagCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            displayType: 'text',
            submitErrorMsg: '',
            enableEdit: this.props.enableEdit,
            tags: $.extend(true, [], this.props.tags),
            recommendTags: $.extend(true, [], this.props.recommendTags)
        };
    }

    componentWillReceiveProps(nextProps) {
        //标签有变化
        if (isDiffOfTwoArray(this.state.tags, nextProps.tags)) {
            this.setState({tags: $.extend(true, [], nextProps.tags)});
        }
        this.setState({recommendTags: $.extend(true, [], nextProps.recommendTags)});
    }

    addTag() {
        const tag = _.trim(this.refs.newTag.refs.input.value);
        if (!tag) return;
        // ‘线索’、‘转出’、‘已回访’标签不可以添加
        if (isUnmodifiableTag(tag)) {
            message.error(Intl.get('crm.sales.clue.add.disable', '不能手动添加\'{label}\'标签', {label: tag}));
            return;
        }
        this.toggleTag(tag, true);
        Trace.traceEvent($(ReactDOM.findDOMNode(this.refs.newTagAdd)), `添加新${this.props.title}`);
        //清空输入框
        this.refs.newTag.refs.input.value = '';
    }

    toggleTag(tag, isAdd) {
        // 不可以操作'线索'和‘转出’和‘已回访’标签
        if (isUnmodifiableTag(tag)) {
            return;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this.refs[tag])), `点击选中/取消选中某个${this.props.title}`);
        let tags = this.state.tags || [];
        if (tags.indexOf(tag) > -1) {
            if (isAdd) return;
            tags = tags.filter(theTag => theTag != tag);
            this.state.tags = tags;
        } else {
            tags.push(tag);
            this.state.tags = tags;
            if (this.state.recommendTags.indexOf(tag) === -1) {
                this.state.recommendTags.push(tag);
            }
        }
        this.setState(this.state);
    }

    //回到展示状态
    backToDisplay() {
        this.setState({
            loading: false,
            displayType: 'text',
            submitErrorMsg: ''
        });
    }

    handleSubmit(e) {
        if (this.state.loading) return;
        let diff1 = _.difference(this.state.tags, this.props.tags);
        let diff2 = _.difference(this.props.tags, this.state.tags);
        //标签没有变化时，直接返回到展示界面
        if (!(diff1.length || diff2.length)) {
            this.backToDisplay();
            return;
        }
        if (_.isFunction(this.props.saveTags)) {
            Trace.traceEvent(e, `保存${this.props.title}`);
            this.setState({loading: true});
            this.props.saveTags(this.state.tags, () => {
                this.backToDisplay();
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.save.failed', '保存失败')
                });
            });
        }
    }

    handleCancel(e) {
        Trace.traceEvent(e, `取消对${this.props.title}的添加`);
        this.setState({
            tags: $.extend(true, [], this.props.tags),
            displayType: 'text',
            submitErrorMsg: ''
        });
    }

    setEditable(e) {
        Trace.traceEvent(e, `点击设置${this.props.title}`);
        this.setState({displayType: 'edit'});
    }

    renderTagContent() {
        let tagsArray = this.state.tags ? this.state.tags : [];
        let tags = tagsArray.map(function(tag, index) {
            return (<span key={index} className="common-tag tag-selected">{tag}</span>);
        });
        let selectedTagsArray = this.state.tags ? this.state.tags : [];
        let recommendTagsArray = _.isArray(this.state.recommendTags) ? this.state.recommendTags : [];
        let unionTagsArray = _.union(recommendTagsArray, selectedTagsArray);
        return (
            <div className="tag-list-containter" data-tracename="标签">
                {this.state.displayType === 'text' ? (<span className="tag-block">{tags}</span>) :
                    (<div className="inputWrap" ref="inputWrap">
                        <div className="tag-edit-block">
                            {unionTagsArray.map((tag, index) => {
                                let className = classNames('common-tag', {'tag-selected': selectedTagsArray.indexOf(tag) > -1});
                                return (<span key={index} onClick={this.toggleTag.bind(this, tag, false)} ref={tag}
                                    className={className}>{tag}</span>);
                            })}
                        </div>
                        <div className="tag-input-block">
                            <Input className="tag-input" ref="newTag"
                                placeholder={this.props.placeholder}/>
                            <span className="iconfont icon-add handle-btn-item" ref="newTagAdd"
                                onClick={this.addTag.bind(this)}/>
                        </div>
                    </div>)
                }
            </div>
        );
    }

    renderTagTitle() {
        if (!this.props.title) {
            return null;
        }
        return (<div className="tag-title-container">
            <span className="tag-title-text">{this.props.title}</span>
            {this.props.noDataTip && this.state.displayType == 'text' ?
                <span className="no-tag-text">{this.props.noDataTip}</span> : null}
            {this.props.enableEdit && this.state.displayType === 'text' ?
                <DetailEditBtn title={Intl.get('common.edit', '编辑')} onClick={(e) => {
                    this.setEditable(e);
                }}/> : null}
        </div>);
    }

    render() {
        //没有标签数据时，只展示标题、无数据的提示和编辑按钮
        if (this.props.title && this.props.noDataTip && this.state.displayType === 'text') {
            return (<DetailCard className="tag-card-container" content={this.renderTagTitle()}/>);
        }
        return (
            <DetailCard title={this.renderTagTitle()}
                className="tag-card-container"
                content={this.renderTagContent()}
                isEdit={this.state.displayType === 'edit'}
                loading={this.state.loading}
                saveErrorMsg={this.state.submitErrorMsg}
                handleSubmit={this.handleSubmit.bind(this)}
                handleCancel={this.handleCancel.bind(this)}
            />
        );
    }
}
DetailCard.defaultProps = {
    title: null,//标题的展示内容 (string\ReactNode)
    placeholder: '',//输入框的提示内容（string）
    tags: [], //标签(Array)
    recommendTags: [],//所有推荐标签的列表
    enableEdit: false,//能否编辑(Boolean)
    noDataTip: '',//无数据时的提示
    saveTags: function() {
    }//保存修改后的标签列表（Function）
};
export default TagCard;