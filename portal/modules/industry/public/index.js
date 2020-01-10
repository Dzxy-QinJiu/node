require('./index.less');
const Spinner = require('CMP_DIR/spinner');
import {Icon, Alert, Input, Button, Form, message} from 'antd';
const FormItem = Form.Item;
const AlertTimer = require('CMP_DIR/alert-timer');
import Trace from 'LIB_DIR/trace';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {ajustTagWidth} from 'PUB_DIR/sources/utils/common-method-util';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import { validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';
import NoData from 'CMP_DIR/no-data';
import LoadDataError from 'CMP_DIR/load-data-error';

const PAGE_SIZE = 1000;
const PADDING_HEIGHT = 8; // 卡片容器的padding-top

class Industry extends React.Component {
    state = {
        isLoading: true, // 获取行业列表的loading，初始状态为true
        TagLists: [], //行业标签列表
        isAddloading: -1, //点击行业添加按钮的loading效果是否显示 否 -1 是 0
        DeletingItemId: -1, //当前正在删除的标签的id值 默认 -1
        isGetInforcorrect: -1, //能否正常获取数据 否 -1 是 0
        getErrMsg: '', //加载失败的提示信息
        addErrMsg: '', //添加失败的信息
    };

    //获取初始行业列表
    getInitialData = () => {
        $.ajax({
            url: '/rest/industries',
            type: 'get',
            dateType: 'json',
            data: {page_size: PAGE_SIZE},
            success: (list) => {
                this.setState({
                    TagLists: list,
                    isGetInforcorrect: 0,
                    isLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isGetInforcorrect: -1,
                    getErrMsg: errorMsg.responseJSON,
                    isLoading: false
                });
            }
        });

    };
    componentWillMount() {
        this.getInitialData();
    }

    //删除行业标签
    handleDeleteItem = (item) => {
        //当前正在删除的标签的id
        let id = _.get(item, 'id');
        this.setState({
            DeletingItemId: id
        });
        $.ajax({
            url: '/rest/delete_industries/' + id,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                if (result) {
                    //在数组中删除当前正在删除的行业
                    let TagLists = _.filter(this.state.TagLists, (industry) => industry.id !== id);
                    this.setState({
                        DeletingItemId: -1,
                        TagLists: TagLists
                    });
                } else {
                    this.setState({
                        DeletingItemId: -1,
                    });
                    message.error(Intl.get('crm.139','删除失败'));
                }
            },
            error: (errorInfo) => {
                this.setState({
                    DeletingItemId: -1,
                });
                message.error(errorInfo.responseJSON || Intl.get('crm.139','删除失败'));
            }
        });

    };

    //增加行业标签
    handleSubmit = (e) => {
        Trace.traceEvent(e, '点击添加行业按钮');
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            //显示添加的loading效果
            this.setState({
                isAddloading: 0
            });
            let submitObj = {
                industry: _.trim(values.industry)
            };
            $.ajax({
                url: '/rest/add_industries',
                type: 'post',
                dateType: 'json',
                data: submitObj,
                success: (result) => {
                    this.props.form.setFieldsValue({industry: ''});
                    //数组开头添加输入的标签
                    this.state.TagLists.unshift(result);
                    this.setState({
                        TagLists: this.state.TagLists,
                        isAddloading: -1,
                    });
                },
                error: (errorInfo) => {
                    this.setState({
                        isAddloading: -1,
                        addErrMsg: errorInfo.responseJSON || Intl.get('config.manage.add.industry.error','添加行业失败')
                    });
                }
            });
        });

    };

    //增加行业失败
    handleAddIndustryFail = () => {
        let hide = () => {
            this.setState({
                addErrMsg: '',
                isAddloading: -1
            });
            $('#addIndustrySaveBtn').removeAttr('disabled');
        };
        return (
            <div className="add-config-fail">
                <AlertTimer
                    time={4000}
                    message={this.state.addErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        );
    };

    // 行业唯一性校验
    getValidator = (name) => {
        return (rule, value, callback) => {
            let industryValue = _.trim(value); // 文本框中的值
            let existIndustryList = this.state.TagLists;
            let isExist = _.find(existIndustryList, item => item.industry === industryValue);

            if (industryValue) {
                if (isExist) { // 和已存在的订单阶段名称是相同
                    callback(Intl.get('industry.add.check.tips', '该行业名称已存在'));
                } else {
                    callback();
                }
            } else {
                callback(Intl.get('organization.tree.name.placeholder', '请输入{name}名称', {name: name}));
            }

        };
    };

    resetIndustryFlags = () => {
        this.setState({
            addErrMsg: ''
        });
    };

    renderTopNavOperation = () => {
        const { getFieldDecorator } = this.props.form;
        const name = Intl.get('common.industry', '行业');
        const addErrMsg = this.state.addErrMsg;
        let isLoading = (this.state.isAddloading === 0);
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <Form layout='horizontal' className='form' autoComplete='off'>
                        <FormItem
                            label=''
                        >
                            {getFieldDecorator('industry', {
                                rules: [{
                                    required: true,
                                    validator: this.getValidator(name),
                                }, validatorNameRuleRegex(10, name)]
                            })(
                                <Input
                                    placeholder={Intl.get('crm.basic.add.industry', '添加行业')}
                                    onPressEnter={this.handleSubmit}
                                    onFocus={this.resetIndustryFlags}
                                    addonAfter={
                                        isLoading ?
                                            <Icon type="loading"/> :
                                            <Icon type="plus" onClick={this.handleSubmit}/>
                                    }
                                />
                            )}
                        </FormItem>
                    </Form>
                    {
                        addErrMsg ? (
                            <div className="industry-check">{addErrMsg}</div>
                        ) : null
                    }
                </div>
            </div>
        );
    };

    renderNoDataOrLoadError = (contentHeight) => {
        let TagLists = this.state.TagLists;
        let length = _.get(TagLists, 'length', 0);

        const tipsZoneHeight = contentHeight - PADDING_HEIGHT;

        return (
            <div className="msg-tips" style={{height: tipsZoneHeight}}>
                {
                    length === 0 && !this.state.isLoading ? (
                        <NoData
                            textContent={Intl.get('industry.no.data.tips', '暂无行业，添加行业后，可以为您的客户设置不同行业')}
                        />
                    ) : null
                }
                {
                    this.state.getErrMsg ? (
                        <LoadDataError
                            retryLoadData={this.getInitialData}
                        />
                    ) : null
                }
            </div>
        );
    };

    renderIndustryConfig = () => {
        let TagLists = this.state.TagLists;
        // 内容区宽度
        let contentWidth = $(window).width() - BACKGROUG_LAYOUT_CONSTANTS.FRIST_NAV_WIDTH -
            BACKGROUG_LAYOUT_CONSTANTS.NAV_WIDTH - 2 * BACKGROUG_LAYOUT_CONSTANTS.PADDING_WIDTH;
        let tagWidth = ajustTagWidth(contentWidth);

        return (
            <div className="content-zone">
                {
                    this.state.isLoading ? <Spinner/> : null
                }

                <ul className="mb-taglist">
                    {
                        _.map(TagLists, (item, index) => {
                            let content = _.get(item, 'industry');
                            return (
                                <li className="mb-tag" key={index} style={{width: tagWidth}}>
                                    <div className="mb-tag-content">
                                        <span className="tag-content" title={content}>{content}</span>
                                        <span
                                            onClick={this.handleDeleteItem.bind(this, item)}
                                            data-tracename="点击删除某个行业按钮"
                                            className="ant-btn"
                                        >
                                            <i className="iconfont icon-delete handle-btn-item "></i>
                                        </span>
                                        { this.state.DeletingItemId === item.id ? (
                                            <span ><Icon type="loading"/></span>
                                        ) : null
                                        }
                                    </div>
                                </li>
                            );
                        }
                        )}
                </ul>
            </div>
        );
    };

    render = () => {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let contentHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        let TagLists = this.state.TagLists;
        let length = _.get(TagLists, 'length');
        return (
            <div className="industry-container" data-tracename="行业" style={{height: height}}>
                <div className="industry-content-wrap" style={{height: height}}>
                    <div className="industry-top-nav">
                        {this.renderTopNavOperation()}
                    </div>
                    <GeminiScrollBar style={{height: contentHeight}}>
                        <div className="industry-content">
                            {
                                length ? (this.renderIndustryConfig()) : this.renderNoDataOrLoadError(contentHeight)
                            }
                        </div>

                    </GeminiScrollBar>
                </div>
            </div>
        );
    }
}

Industry.propTypes = {
    form: PropTypes.form
};

module.exports = Form.create()(Industry);