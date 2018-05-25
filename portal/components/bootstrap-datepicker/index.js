require("bootstrap-datepicker");
require("bootstrap-datepicker/dist/css/bootstrap-datepicker.css");
var language = require("../../public/language/getLanguage");
var lang = 'zh-CN';
if (language.lan() == "es") {
    require("bootstrap-datepicker/dist/locales/bootstrap-datepicker.es.min");
    lang = 'es';
} else if (language.lan() == "zh") {
    require("bootstrap-datepicker/dist/locales/bootstrap-datepicker.zh-CN.min");
} else if (language.lan() == "en") {
    require("bootstrap-datepicker/dist/locales/bootstrap-datepicker.en-AU.min");
    lang = 'en-AU';
}


require("./index.less");
var classNames = require("classnames");
var YEAR_MODE = "years";
var MONTH_MODE = "months";
var BootstrapDatepicker = React.createClass({
    //获取日历初始化选项
    getDatepickerOptions: function (props) {
        var options = {
            format: oplateConsts.DATE_FORMAT,
            language: lang
        };
        if (props.onlyYear) {
            options.maxViewMode = YEAR_MODE;
            options.minViewMode = YEAR_MODE;
            options.startView = YEAR_MODE;
        } else if (props.monthMode) {
            options.minViewMode = MONTH_MODE;
            options.startView = MONTH_MODE;
        }
        if (props.multidate) {
            options.multidate = 2;
        }
        if (props.disableDateAfterToday) {
            options.endDate = new Date();
        }

        if (props.dateSelectRange) {
            options.startDate = new Date(Date.now() - props.dateSelectRange) ;
        }

        if (props.disableDateBeforeToday) {
            options.startDate = new Date();
        }

        if (props.disableDateBeforeRange) {
            if (props.selectRange === "1w") { // 一周
                options.startDate = moment().add(7 , "days").toDate();
            } else if (props.selectRange === "0.5m") { // 半个月
                options.startDate = moment().add(15 , "days").toDate();
            } else if (/^\d+m$/.test(props.selectRange)) {
                let num = props.selectRange.replace(/m$/,''); // 其他月份
                options.startDate = moment().add(num , "months").toDate();
            } else { // 自定义、永久
                options.startDate = new Date();
            }
        }

        if (_.isObject(props.options)) {
            _.extend(options, props.options);
        }

        return options;
    },
    componentDidMount: function () {
        var options = this.getDatepickerOptions(this.props);
        $(this.refs.instanceDom).datepicker(options);
        if (this.props.multidate) {
            $(this.refs.instanceDom).datepicker('update', this.state.start_time, this.state.end_time);
        } else {
            $(this.refs.instanceDom).datepicker('update', this.state.value);
        }
        var _this = this;
        $(this.refs.instanceDom).datepicker().on("changeDate", function (event) {
            _this.state.value = event.date;
            _this.props.onChange(event.date);
        });
        $(this.refs.instanceDom).find(".datepicker-inline").append('<span class="arrow"></span>');
    },
    //重新设置
    resetDatePicker: function (nextProps) {
        if (nextProps.disableDateBeforeRange) {
            var options = this.getDatepickerOptions(nextProps);
            $(this.refs.instanceDom).datepicker("destroy");
            $(this.refs.instanceDom).datepicker(options);
        } else if (nextProps.onlyYear != this.props.onlyYear || nextProps.monthMode != this.props.monthMode
            || nextProps.multidate != this.props.multidate) {
            var options = this.getDatepickerOptions(nextProps);
            $(this.refs.instanceDom).datepicker("destroy");
            $(this.refs.instanceDom).datepicker(options);
            if (nextProps.multidate) {
                $(this.refs.instanceDom).datepicker('update', nextProps.start_time, nextProps.end_time);
            } else {
                $(this.refs.instanceDom).datepicker('update', nextProps.value);
            }
        } else {
            if (nextProps.multidate) {
                let changed = false;
                if (!moment(this.props.start_time).isSame(moment(nextProps.start_time), "day")) {
                    this.state.start_time = nextProps.start_time;
                    changed = true;
                }
                if (!moment(this.props.end_time).isSame(moment(nextProps.end_time), "day")) {
                    this.state.end_time = nextProps.end_time;
                    changed = true;
                }
                if (changed) {
                    $(this.refs.instanceDom).datepicker('update', this.state.start_time, this.state.end_time);
                }
            } else {
                if (!moment(this.props.value).isSame(moment(nextProps.value), "day")) {
                    var newValue = nextProps.value;
                    if (newValue === 'today') {
                        newValue = moment().toDate();
                    }
                    this.state.value = newValue;
                    $(this.refs.instanceDom).datepicker('update', newValue);
                }
            }
        }
    },
    componentWillReceiveProps: function (nextProps) {
        this.resetDatePicker(nextProps);
    },
    /**
     * value 显示日历的时候，选中哪一天
     * onChange 当日期改变的时候，触发的回调
     */
    getDefaultProps: function () {
        return {
            value: 'today',
            //是否只能选择“年”
            onlyYear: false,
            //只能选择到月
            monthMode: false,
            //multidate,展示多个日期
            multidate: false,
            onChange: function () {
            },
            //不让选择今天之前的时间(默认：false)
            disableDateBeforeToday: false,
            // 不让选择范围之前的时间（默认：false）
            disableDateBeforeRange: false,
            //不让选择今天之后的时间(默认：false)
            disableDateAfterToday: false,
            // 选择查看的时间范围（默认： 0）
            dateSelectRange: 0
        };
    }
    ,
    getInitialState: function () {
        var value = this.props.value;
        if (value === 'today') {
            value = moment().format();
        }
        return {
            value: value,
            start_time: this.props.start_time||"",
            end_time: this.props.end_time||""
        };
    }
    ,
    /**
     * 提供一个接口，让外界能够直接调用jquery，对datepicker进行更新。
     */
    updateDatepicker: function () {
        $(this.refs.instanceDom).datepicker.apply($(this.refs.instanceDom), arguments);
    }
    ,
    render: function () {

        const {children, value, onChange, className, ...props} = this.props;
        var cls = classNames(className, "bootstrap-datepicker-wrap");

        if (this.props.type === "input") {
            return (
                <input ref="instanceDom" className={className + " bootstrap-datepicker-input"}/>
            );
        }

        return (
            <div ref="instanceDom" className={cls} {...props}></div>
        );
    }
});

module.exports = BootstrapDatepicker;
