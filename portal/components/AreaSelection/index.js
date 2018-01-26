import {Tabs, Form, Input, Icon} from "antd";
var TabPane = Tabs.TabPane;
var FormItem = Form.Item;
require("./css/index.less");
import routeList from "../../modules/common/route";
import ajax from "../../modules/common/ajax";
let areaData = null;//用来存储获取的地域数据,不用每次都取一遍
/* 地域选择组件 */
var AreaSelection = React.createClass({
    getInitialState: function () {
        return {
            areaData: areaData,
            activeKey: "1",
            prov: null,
            city: null,
            county: null,
            provName: this.props.prov || null,
            cityName: this.props.city || null,
            countyName: this.props.county || null,
            isAlwayShow: this.props.isAlwayShow || false,//地域下拉框是否一直展示
            isLoadingArea: false//是否正在加载地域数据
        };
    },
    componentWillMount: function () {
        if(!this.state.areaData){
            const route = _.find(routeList, route => route.handler === "getAreaData");
            const arg = {
                url: route.path,
            };
            this.setState({isLoadingArea:true});
            ajax(arg).then(result => {
                this.setState({areaData:result, isLoadingArea:false});
                areaData = result;
            });
        }
    },
    componentWillReceiveProps: function (nextProps) {
        if(!nextProps.isAlwayShow){
            this.switchLayer("none");
        }
        const state = {isAlwayShow: nextProps.isAlwayShow || false};

        if (nextProps.prov !== this.props.prov) {
            state.provName = nextProps.prov || null;
        }

        if (nextProps.city !== this.props.city) {
            state.cityName = nextProps.city || null;
        }

        if (nextProps.county !== this.props.county) {
            state.countyName = nextProps.county || null;
        }

        if (!_.isEmpty(state)) this.setState(state);
    },
    /* 选择省/直辖市 */
    selectProv: function (evt) {
        if (evt.target.nodeName == "LABEL") {
            var provName = evt.target.innerHTML;
            this.setState({
                activeKey: "2",
                prov: evt.target.htmlFor,
                city: '',
                county: '',
                provName: provName,
                cityName: null,
                countyName: null
            }, function () {
                this.switchClass(evt.target);
                this.props.updateLocation((provName ? provName : "") + (this.state.cityName ? "/" + this.state.cityName : "") + (this.state.countyName ? "/" + this.state.countyName : ""));
            });
        }
    },
    /* 选择地市 */
    selectCity: function (evt) {
        if (evt.target.nodeName == "LABEL") {
            var cityName = evt.target.innerHTML;
            this.setState({
                activeKey: "3",
                city: evt.target.htmlFor,
                county: '',
                provName: this.state.provName,
                cityName: cityName,
                countyName: null
            }, function () {
                this.switchClass(evt.target);
                this.props.updateLocation((this.state.provName ? this.state.provName : "") + (cityName ? "/" + cityName : "") + (this.state.countyName ? "/" + this.state.countyName : ""));
            });
        }
    },
    /* 选择县区 */
    selectCounty: function (evt) {
        if (evt.target.nodeName == "LABEL") {
            var countyName = evt.target.innerHTML;
            this.setState({
                county: evt.target.htmlFor,
                provName: this.state.provName,
                cityName: this.state.cityName,
                countyName: countyName
            });
            this.switchClass(evt.target);
            this.switchLayer();
            this.props.updateLocation((this.state.provName ? this.state.provName : "") + (this.state.cityName ? "/" + this.state.cityName : "") + (countyName ? "/" + countyName : ""));
        }
    },
    /* 切换激活样式 */
    switchClass: function (obj) {
        $(obj).addClass("active").siblings().removeClass("active");
    },
    switchLayer: function (status) {
        const container = $(".area-selector-container");

        if ((typeof status) === "string") {
            container.css("display", status);
        } else {
            if (this.state.isAlwayShow) {
                return;
            }
            container.toggle();// 地区选择容器展示/隐藏
        }
        $(".area-selector .anticon").toggleClass("active");// 箭头方向调整
        $(".area-selector .area-selector-shadow").toggle();// 遮罩层展示/隐藏

        if (container.css("display") === "block") {
            this.setTabsContentHeight(container);
        }
    },
    //设置tab内容区域高度
    setTabsContentHeight: function (container) {
        const tabsContent = container.find(".ant-tabs-content");
        tabsContent.height("auto");
        const tabsContentHeight = tabsContent.height();
        const tabsContentPadding = 20;
        const displayAreaHeight = $(window).height() - tabsContent.offset().top - tabsContentPadding;
        if (displayAreaHeight < tabsContentHeight) {
            tabsContent.height(displayAreaHeight);
        }
    },
    getAddressVal: function () {
        let addressVal = this.state.provName ? this.state.provName : "";
        addressVal += this.state.cityName ? "/" + this.state.cityName : "";
        addressVal += this.state.countyName ? "/" + this.state.countyName : "";
        return addressVal;
    },
    onChange: function (activeKey) {
        this.setState({activeKey});
    },
    render: function () {
        var AGProvs = [], HKProvs = [], LSProvs = [], TZProvs = [], citys = [], countys = [];
        var data = this.state.areaData;
        if (data) {
            for (var i in data.provinces) {
                switch (data.provinces[i].category) {
                    case "AG":
                        AGProvs.push([i, data.provinces[i].name]);
                        break;
                    case "HK":
                        HKProvs.push([i, data.provinces[i].name]);
                        break;
                    case "LS":
                        LSProvs.push([i, data.provinces[i].name]);
                        break;
                    case "TZ":
                        TZProvs.push([i, data.provinces[i].name]);
                        break;
                }
            }

            AGProvs = AGProvs.map(function (item) {
                return <label key={item[0]} htmlFor={item[0]}>{item[1]}</label>
            });
            HKProvs = HKProvs.map(function (item) {
                return <label key={item[0]} htmlFor={item[0]}>{item[1]}</label>
            });
            LSProvs = LSProvs.map(function (item) {
                return <label key={item[0]} htmlFor={item[0]}>{item[1]}</label>
            });
            TZProvs = TZProvs.map(function (item) {
                return <label key={item[0]} htmlFor={item[0]}>{item[1]}</label>
            });
            if (this.state.prov) {
                for (var i in data.provinces[this.state.prov].citys) {
                    citys.push([i, data.provinces[this.state.prov].citys[i].name])
                }
                citys = citys.map(function (item) {
                    return <label key={item[0]} htmlFor={item[0]}>{item[1]}</label>
                });
            }
            if (this.state.prov && this.state.city) {
                for (var i in data.provinces[this.state.prov].citys[this.state.city].countys) {
                    countys.push([i, data.provinces[this.state.prov].citys[this.state.city].countys[i].name])
                }
                countys = countys.map(function (item) {
                    return <label key={item[0]} htmlFor={item[0]}>{item[1]}</label>
                });
            }
        }
        var style = {
            width: this.props.width ? this.props.width + "px" : "40px"
        };

        return (
            <div className="area-selector" style={style}>
                <FormItem
                    id={this.props.id ? this.props.id : "location"}
                    labelCol={{span: this.props.labelCol ? this.props.labelCol : 6}}
                    wrapperCol={{span: this.props.wrapperCol ? this.props.wrapperCol : 17}}
                    className="input-arrow"
                    label={this.props.label ? this.props.label : Intl.get("realm.address", "地址")}
                    hasFeedback
                    help={this.props.help ? this.props.help : ""}
                >
                    <Input
                        placeholder={this.props.placeholder ? this.props.placeholder : Intl.get("realm.edit.address.placeholder", "请选择地址")}
                        id="area-input"
                        name="area-input"
                        readOnly=""
                        onClick={this.switchLayer}
                        value={this.getAddressVal()}/>
                    {this.props.isAlwayShow?null:<Icon type="down"/>}

                    <div className="area-selector-container">
                        <Tabs activeKey={this.state.activeKey} type="card" onChange={this.onChange}>
                            <TabPane tab={Intl.get("realm.select.address.province", "省份")} key="1">
                                {this.state.isLoadingArea ? <Icon type="loading" />:
                                    (<div onClick={this.selectProv}>
                                        <div className="address-prov"><span className="prov-nav-span">A-G</span>
                                            {AGProvs}
                                        </div>
                                        <div className="address-prov"><span className="prov-nav-span">H-K</span>
                                            {HKProvs}
                                        </div>
                                        <div className="address-prov"><span className="prov-nav-span">L-S</span>
                                            {LSProvs}
                                        </div>
                                        <div className="address-prov"><span className="prov-nav-span">T-Z</span>
                                            {TZProvs}
                                        </div>
                                    </div>)
                                }
                            </TabPane>
                            <TabPane tab={Intl.get("realm.select.address.city", "城市")} key="2">
                                <div onClick={this.selectCity}>{citys}</div>
                            </TabPane>
                            <TabPane tab={Intl.get("realm.select.address.country", "县区")} key="3">
                                <div onClick={this.selectCounty}>{countys}</div>
                            </TabPane>
                        </Tabs>
                    </div >
                </FormItem>
                <div className="area-selector-shadow" onClick={this.switchLayer}></div>
            </div>
        );
    }
});
module.exports = AreaSelection;
