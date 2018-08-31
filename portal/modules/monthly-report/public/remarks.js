/**
 * 出勤备注组件
 */

import PropTypes from 'prop-types'; 
import ajax from 'ant-ajax';
import { LEAVE_TYPES, LEAVE_DAYS } from './consts';
import { Select, Popconfirm, Icon, message } from 'antd';
const Option = Select.Option;

class Remarks extends React.Component {
    static defaultProps = {
        data: [],
        userId: '',
        selectedMonth: moment(),
    };

    static propTypes = {
        data: PropTypes.array,
        userId: PropTypes.string,
        selectedMonth: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.state = {
            data: _.cloneDeep(this.props.data),
            formData: this.getInitialFormData(),
            isAdd: false,
            isLoading: false,
        };
    }

    getInitialFormData() {
        return {
            user_id: this.props.userId,
            leave_time: this.props.selectedMonth.startOf('month').valueOf(),
            leave_detail: 'leave',
            leave_days: 1,
        };
    }

    handleAdd() {
        this.setState({isAdd: true});
    }

    handleEdit(remarks) {
        this.setState({formData: remarks});
    }

    handleCancel() {
        this.setState({
            isAdd: false,
            formData: this.getInitialFormData(),
        });
    }

    handleSave(id, action) {
        this.setState({isLoading: true});

        let type = 'post';
        let url = '/rest/callrecord/v2/askforleave';
        let arg = {type, url};

        if (action === 'delete') {
            arg.type = 'delete';
            arg.url += '?ids=' + id;
        } else {
            arg.data = _.clone(this.state.formData);

            if (id) {
                arg.type = 'put';
                arg.data.id = id;
            }
        }

        ajax.send(arg).then(result => {
            let newState = {
                isAdd: false,
                isLoading: false,
            };

            //保存成功
            if (result.code === 0) {
                const remarksList = _.cloneDeep(this.state.data);

                const index = _.findIndex(remarksList, remarks => remarks.id === id);

                if (action === 'delete') {
                    remarksList.splice(index, 1);
                } else {
                    const newRemarks = _.get(result, 'result');

                    if (newRemarks) {
                        if (action === 'add') {
                            remarksList.push(newRemarks);
                        } else {
                            remarksList[index] = newRemarks;
                        }
                    }
                }

                newState.formData = this.getInitialFormData();
                newState.data = remarksList;

                message.success(result.msg);
            //保存失败
            } else {
                message.error(result.msg);
            }

            this.setState(newState);
        });
    }

    handleRemarksChange(field, value) {
        let formData = _.clone(this.state.formData);
        formData[field] = value; 

        this.setState({formData});
    }

    renderForm() {
        const action = this.state.isAdd ? 'add' : 'edit';
        const remarks = this.state.formData;
        const selectedMonth = this.props.selectedMonth;
        const days = selectedMonth.daysInMonth();
        const firstDay = selectedMonth.startOf('month');
        let dateOptions = [];

        for (let i = 0; i < days; i++) {
            const day = firstDay.clone().add(i, 'days');

            const timestamp = day.valueOf();
            const dateText = day.format('YYYY-MM-DD');
            dateOptions.push(<Option key={i} value={timestamp}>{dateText}</Option>);
        }

        const leaveDetailOptions = LEAVE_TYPES.map(leaveType => (
            <Option key={leaveType.value} value={leaveType.value}>{leaveType.label}</Option>
        ));

        const leaveDayOptions = LEAVE_DAYS.map(leaveDay => {
            return <Option key={leaveDay.value} value={leaveDay.value}>{leaveDay.label}</Option>;
        });

        return (
            <div className="remarks-form">
                <Select
                    defaultValue={remarks.leave_time}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleRemarksChange.bind(this, 'leave_time')}
                >
                    {dateOptions}
                </Select>
                <Select
                    defaultValue={remarks.leave_detail}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleRemarksChange.bind(this, 'leave_detail')}
                >
                    {leaveDetailOptions}
                </Select>
                <Select
                    defaultValue={remarks.leave_days}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleRemarksChange.bind(this, 'leave_days')}
                >
                    {leaveDayOptions}
                </Select>
                {this.state.isLoading ? (
                    <Icon type="loading" />
                ) : null}
                <i className="iconfont icon-choose" title={Intl.get('common.save', '保存')} onClick={this.handleSave.bind(this, remarks.id, action)}></i>
                <i className="iconfont icon-close" title={Intl.get('common.save', '取消')} onClick={this.handleCancel.bind(this)}></i>
            </div>
        );
    }

    render() {
        const remarksList = this.state.data;
        const editRemarksId = this.state.formData.id;
        const isAdd = this.state.isAdd;
        let remarksJsx = null;

        if (remarksList.length) {
            remarksJsx = _.map(remarksList, (remarks, index) => {
                if (remarks.id === editRemarksId) {
                    return this.renderForm();
                } else {
                    const leaveTime = moment(remarks.leave_time).format('YYYY-MM-DD');
                    const leaveDetail = remarks.leave_detail;
                    const leaveDays = remarks.leave_days;
                    const leaveType = _.find(LEAVE_TYPES, typeItem => typeItem.value === leaveDetail);
                    let leaveDetailLabel = '';

                    if (leaveType) {
                        leaveDetailLabel = leaveType.label;
                    }

                    return (
                        <div className="remarks-item">
                            {leaveTime}{leaveDetailLabel}{Intl.get('weekly.report.n.days', '{n}天', {n: leaveDays})}

                            <Popconfirm
                                title={Intl.get('weekly.report.are.you.sure.del.remark', '确定要删除该条请假信息吗？')}
                                onConfirm={this.handleSave.bind(this, remarks.id, 'delete')}
                            >
                                <i className="iconfont icon-delete" title={Intl.get('common.delete', '删除')} />
                            </Popconfirm>

                            <i className="iconfont icon-edit-btn" title={Intl.get('common.edit', '编辑')} onClick={this.handleEdit.bind(this, remarks)} />
                        </div>
                    );
                } 
            });
        } else if (!isAdd) {
            remarksJsx = (
                <div className="remarks-item">
                    {Intl.get('weekly.report.full.work.day', '全勤')}
                    <i className="iconfont icon-edit-btn" title={Intl.get('common.edit', '编辑')} onClick={this.handleAdd.bind(this)} />
                </div>
            );
        }

        return (
            <div className="remarks-list">
                {remarksJsx}

                {isAdd ? this.renderForm() : null}
                {!isAdd && remarksList.length ? (
                    <i className="iconfont icon-add" title={Intl.get('common.add', '添加')} onClick={this.handleAdd.bind(this)} />
                ) : null}
            </div>
        );
    }
}

export default Remarks;
