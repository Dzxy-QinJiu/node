var React = require('react');
import Trace from 'LIB_DIR/trace';
import { AntcAreaSelection } from 'antc';
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';
require('./css/location-select.less');
class LocationSelectField extends React.Component {
    static defaultProps = {
        id: '',
        hasEditPrivilege: false,
        provinceName: '',
        cityName: '',
        countyName: '',
        //编辑区的宽度
        width: '100%',
        //无数据时的提示（没有修改权限时提示没有数据）
        noDataTip: '',
        //添加数据的提示（有修改权限时，提示补充数据）
        addDataTip: '',
        //编辑按钮的提示文案
        editBtnTip: Intl.get('crm.175', '设置地域'),
        onChange: function() {
        },
        onModifySuccess: function() {
        }
    };

    initData = () => {
        return {
            loading: false,//正在保存
            displayType: 'text',
            id: this.props.id,
            province: this.props.province,
            city: this.props.city,
            county: this.props.county,
            province_code: this.props.province_code,
            city_code: this.props.city_code,
            county_code: this.props.county_code,
            submitErrorMsg: ''
        };
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.state.id) {
            //切换客户时,重新设置state数据
            let stateData = this.initData();
            stateData.id = nextProps.id;
            stateData.province = nextProps.province;
            stateData.city = nextProps.city;
            stateData.county = nextProps.county;
            stateData.province_code = nextProps.province_code;
            stateData.city_code = nextProps.city_code;
            stateData.county_code = nextProps.county_code;
            this.setState(stateData);
        }
    }

    changeDisplayType = (type) => {
        if (type === 'text') {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '取消对地域的修改');
            this.setState({
                province: this.props.province,
                city: this.props.city,
                county: this.props.county,
                province_code: this.props.province_code,
                city_code: this.props.city_code,
                county_code: this.props.county_code,
                displayType: type,
                submitErrorMsg: ''
            });
        } else {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '点击设置地域按钮');
            this.setState({
                loading: false,
                displayType: type,
                submitErrorMsg: ''
            });
        }
    };

    //回到展示状态
    backToDisplay = () => {
        this.setState({
            loading: false,
            displayType: 'text',
            submitErrorMsg: ''
        });
    };

    handleSubmit = () => {
        if (this.state.loading) return;
        if (this.state.province === this.props.province
            && this.state.city === this.props.city
            && this.state.county === this.props.county) {
            this.backToDisplay();
            return;
        }
        let submitData = {
            id: this.state.id,
            province: this.state.province,
            city: this.state.city,
            county: this.state.county,
            province_code: this.state.province_code,
            city_code: this.state.city_code,
            county_code: this.state.county_code,
        };
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存对地域的修改');
        this.props.saveEditLocation(submitData, () => {
            this.backToDisplay();
        }, (errorMsg) => {
            this.setState({
                loading: false,
                submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
            });
        });
    };

    handleCancel = (e) => {
        Trace.traceEvent(e, '取消对地域的修改');
        this.changeDisplayType('text');
    };

    //更新地址
    updateLocation = (addressObj) => {
        this.state.province = addressObj.provName || '';
        this.state.city = addressObj.cityName || '';
        this.state.county = addressObj.countyName || '';
        this.state.province_code = addressObj.provCode || '';
        this.state.city_code = addressObj.cityCode || '';
        this.state.county_code = addressObj.countyCode || '';
        Trace.traceEvent(ReactDOM.findDOMNode(this), '修改地域');
    };

    state = this.initData();

    render() {
        var location = [];
        if (this.state.province) {
            location.push(this.state.province);
        }
        if (this.state.city) {
            location.push(this.state.city);
        }
        if (this.state.county) {
            location.push(this.state.county);
        }
        if (this.state.displayType === 'text') {
            if (location.length) {
                return (
                    <div className="basic-location-field basic-edit-field">
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn title={this.props.editBtnTip}
                                onClick={this.changeDisplayType.bind(this, 'edit')}/>) : null
                        }
                        <span className="inline-block basic-info-text">{location.join('/')}</span>
                    </div>);
            } else {
                return (
                    <div className="basic-location-field basic-edit-field">
                        <span className="inline-block basic-info-text no-data-descr">
                            {this.props.hasEditPrivilege ? (
                                <a onClick={this.changeDisplayType.bind(this, 'edit')} className="handle-btn-item">{this.props.addDataTip}</a>) : <span className="no-data-descr-nodata">{this.props.noDataTip}</span>}

                        </span>
                    </div>
                );
            }
        }

        return (<div className="basic-edit-field location-edit-field">
            <AntcAreaSelection labelCol="0" wrapperCol="24" width={this.props.width || '100%'}
                placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                provName={this.state.province}
                cityName={this.state.city}
                countyName={this.state.county} updateLocation={this.updateLocation}/>
            <SaveCancelButton loading={this.state.loading}
                saveErrorMsg={this.state.submitErrorMsg}
                handleSubmit={this.handleSubmit}
                handleCancel={this.handleCancel}
            />
        </div>);
    }
}

module.exports = LocationSelectField;
