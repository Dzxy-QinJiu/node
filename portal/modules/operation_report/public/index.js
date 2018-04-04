/**
 * 运营报告
 * Created by wangliping on 2017/3/22.
 */
import "./css/index.less";
import {Select,Table,Button,Modal,Progress,message} from "antd";
const ProgressLine = Progress.Line;
import TopNav from "../../../components/top-nav";
import NatureTimeSelect from "../../../components/nature-time-select";
import BarChart from "./view/bar";
import CompositeLine from "../../oplate_user_analysis/public/views/composite-line";
import AreaLine from "./view/arealine";
import OperationReportAction from "./action/operation-report-action";
import OperationReportStore from "./store/operation-report-store";
import userData from "../../../public/sources/user-data"
import html2canvasExport from "html2canvas";
import jsPDF from "jspdf";
import Trace from "LIB_DIR/trace";
import { hasPrivilege } from "CMP_DIR/privilege/checker";
const storageUtil = require("LIB_DIR/utils/storage-util.js");

let Option = Select.Option;
const chartWidth = '100%', chartHeight = 214, rowHeight = 35;
const LAST_SELECT_APPS_KEY = "operation_report_select_app_ids";//localStorage保存运营报告中，所选应用id列表对应的key
let OperationReport = React.createClass({
    getInitialState(){
        let time = moment();
        let stateData = OperationReportStore.getState();
        return {
            ...stateData,
            yearTime: time.year() + Intl.get("common.time.unit.year", "年"),
            weekTime: time.week(),
            hasReportData: true//是否有报告数据
        }
    },
    onStateChange: function () {
        this.setState(OperationReportStore.getState());
    },
    componentDidMount: function () {
        OperationReportStore.listen(this.onStateChange);
        this.getAppList();
        //$('body').css('overflow','hidden');
        //绑定window的resize，进行缩放处理
        //$(window).on('resize',this.windowResize);
    },
    componentWillUnmount: function () {
        OperationReportStore.unlisten(this.onStateChange);
        //$('body').css('overflow','visible');
        //组件销毁时，清除缩放的延时
        //clearTimeout(this.resizeTimeout);
        //解除window上绑定的resize函数
        //$(window).off('resize',this.windowResize);
    },
    //获取应用列表
    getAppList(){
        OperationReportAction.getAppList(data=> {
            //获取本地缓存中保存的上次选择的appId列表
            let selectAppList = this.getLastSelectAppIds();
            // 缓存中有保存的上次所选的应用列表
            if (_.isArray(selectAppList) && selectAppList.length > 0) {
                if (data && data.length) {
                    let appList = _.pluck(data, 'id');
                    //取应用下拉列表中存在的应用（俩数组的交集）
                    selectAppList = _.intersection(selectAppList, appList);
                    if (selectAppList.length == 0) {
                        //应用下拉列表中不存在上次选择的应用，则默认展示第一个应用的分析数据
                        selectAppList = [data[0].id];
                    }
                }
            } else if (_.isArray(data) && data.length) {
                // 缓存中没有保存的上次所选的应用列表，则默认展示第一个应用的分析数据
                selectAppList = [data[0].id];
            }
            OperationReportAction.setSelectAppList(selectAppList);
            this.getReportData(selectAppList)
        });
    },
    //获取本地缓存中保存的上次选择的appId列表
    getLastSelectAppIds(){
        let user = userData.getUserData();
        //应用id列表的存储格式：LAST_SELECT_APPS_KEY:{userId:[appId1,appId2...]}
        let selectAppObj = storageUtil.get(LAST_SELECT_APPS_KEY);
        selectAppObj = selectAppObj ? JSON.parse(selectAppObj) : {};
        return selectAppObj[user.user_id];
    },
    getAnalysisDataType() {
        let type = "common";//USER_ANALYSIS_COMMON
        if (hasPrivilege("USER_ANALYSIS_MANAGER")) {
            type = "manager";
        }
        return type;
    },
    //获取报告的数据,首次获取数据时，会先获取应用列表后，传入第一个应用作为默认应用
    getReportData(selectAppList){
        let isInit = false;//是否是首次加载
        if (selectAppList) {
            //过滤掉空的
            selectAppList = _.filter(selectAppList, appId=>appId);
            isInit = true;
        } else {
            //过滤掉空的
            selectAppList = _.filter(this.state.selectAppList, appId=>appId);
        }

        if (_.isArray(selectAppList) && selectAppList.length) {
            let weekTimeObj = this.refs.timeSelect.state;
            let appId = selectAppList.join(',');
            //获取一周数据的参数
            let oneWeekParams = {
                app_id: appId,
                start_time: new Date(weekTimeObj.weekStartTime + " 00:00:00").getTime(),
                end_time: new Date(weekTimeObj.weekEndTime + " 23:59:59").getTime()
            };
            //获取近四周数据的参数
            let fourWeekParams = {
                app_id: appId,
                start_time: oneWeekParams.start_time - 3 * 7 * 24 * 60 * 60 * 1000,
                end_time: oneWeekParams.end_time
            };
            //获取各应用的登录情况
            OperationReportAction.getAppLoginUser(oneWeekParams);
            //获取近四周的登录对比数据
            OperationReportAction.getAppLoginComparison(fourWeekParams);
            //获取总用户数
            OperationReportAction.getAppsUserCount({
                app_id: appId,
                starttime: oneWeekParams.start_time,
                endtime: oneWeekParams.end_time,
                authType:this.getAnalysisDataType()
            });
            //近四周用户活跃度
            OperationReportAction.getUserActive(fourWeekParams);
            //近四周周登录总时长超过1小时的用户数对比s数据
            OperationReportAction.getAppWeeklyLoginTotalTime(fourWeekParams);
            //获取用户日活跃度
            OperationReportAction.getUserDailyActive(oneWeekParams);
            if (isInit) {
                //首次获取数据时，团队数据获取之前先获取团队列表
                OperationReportAction.getTeamList(()=> {
                    this.getTeamReportData(oneWeekParams);
                });
            } else {
                //切换应用、时间时，可以直接获取团队数据
                this.getTeamReportData(oneWeekParams);
            }
            //新开账号统计
            OperationReportAction.getAppNewTrialUser(oneWeekParams);
            //延期用户的统计
            OperationReportAction.getAppNewDelayUser(oneWeekParams);
            //各应用签约用户数
            OperationReportAction.getAppSignedUser(oneWeekParams);
            //各应用过期用户周在线总时长超1小时的数据
            OperationReportAction.getExpiredUserExceedLoginTime(oneWeekParams);
            //获取近四周过期用户的登录对比数据
            OperationReportAction.getAppExpiredLoginComparison(fourWeekParams);
            //近四周新开通用户对比
            OperationReportAction.getAppNewUserComparison(fourWeekParams);
            //近四周新增延期用户对比
            OperationReportAction.getAppNewDelayUserComparison(fourWeekParams);
            //近四周签约用户登录对比
            OperationReportAction.getAppFormalUserLoginComparison(fourWeekParams);
        }
    },
    //获取团队相关的数据
    getTeamReportData(oneWeekParams){
        //获取各应用用户登录情况的团队分布数据
        OperationReportAction.getTeamLoginUser(oneWeekParams);
        //获取各部门过期用户的登录表格数据
        OperationReportAction.getTeamExpiredLoginUser(oneWeekParams);
        //获取各部门签约用户的登录表格数据
        OperationReportAction.getTeamSignedLoginUser(oneWeekParams);
        //获取各部门过期用户登录时长统计表格数据(超过8个小时)
        let timeParams = $.extend(true, {}, oneWeekParams);
        timeParams.excced_loginlong = 8;
        OperationReportAction.getTeamExpiredUserLoginTime(timeParams);
        //获取各部门新开试用账号的统计表格
        OperationReportAction.getTeamNewTrialUser(oneWeekParams);
        //获取各部门新增延期用户的统计表格
        OperationReportAction.getTeamNewDelayUser(oneWeekParams);
        //获取各部门新开试用账号登录的统计表格
        OperationReportAction.getTeamNewTrialLoginUser(oneWeekParams);
        //获取各部门新增延期用户登录的统计表格
        OperationReportAction.getTeamNewDelayLoginUser(oneWeekParams);
        //获取各部门登录超过1小时的新增试用用户统计表格数据
        timeParams.excced_loginlong = 1;
        OperationReportAction.getTeamExceedLoginTime(timeParams);
        //获取各部门登录超过1小时的延期用户统计表格数据
        OperationReportAction.getTeamDelayUserLoginTime(timeParams);
    },
    //年的选择
    onChangeYear(index, year, e) {
        //year=[2017,"年"]
        let yearTime = year[0] + year[1];
        if (this.state.yearTime == yearTime) {
            return;
        }
        this.state.yearTime = yearTime;
        this.setState({
            yearTime: this.state.yearTime
        }, ()=> {
            this.getReportData();
        });
        Trace.traceEvent("运营报告","时间范围-选择年");
    },
    //周的选择
    onChangeWeek(week) {
        if (this.state.weekTime == week) {
            return;
        }
        this.state.weekTime = week;
        this.setState({
            weekTime: week
        }, ()=> {
            this.getReportData();
        });
        Trace.traceEvent("运营报告","时间范围-选择周");
    },
    //应用的选择
    onAppChange(appIdList){
        OperationReportAction.setSelectAppList(appIdList);
        //将选择的应用列表保存根据userId保存到本地缓存中
        this.saveSelectAppId(appIdList);
        setTimeout(()=> {
            this.getReportData()
        });     
        Trace.traceEvent("运营报告","选择应用");
    },
    //将选择的应用列表保存根据userId保存到本地缓存中
    saveSelectAppId(appIdList){
        let user = userData.getUserData();
        //应用id列表的存储格式：LAST_SELECT_APPS_KEY:{userId:[appId1,appId2...]}
        let selectAppObj = storageUtil.get(LAST_SELECT_APPS_KEY);
        selectAppObj = selectAppObj ? JSON.parse(selectAppObj) : {};
        selectAppObj[user.user_id] = appIdList;
        storageUtil.set(LAST_SELECT_APPS_KEY, JSON.stringify(selectAppObj));
    },
    //渲染应用下拉列表的选项
    renderSelectOptions(){
        let options = '', appList = this.state.appList, selectAppList = this.state.selectAppList;
        if (_.isArray(appList) && appList.length > 0) {
            options = appList.map(function (app) {
                var className = "";
                //应用（多选）选择后，从下拉列表中去掉已选的选项
                if (_.isArray(selectAppList) && selectAppList.length > 0) {
                    selectAppList.forEach(function (appId) {
                        if (appId == app.id) {
                            className = "app-options-selected";
                        }
                    });
                }
                return (
                    <Option className={className} key={app.id} value={app.id}>
                        {app.name}
                    </Option>
                );
            });
        } else {
            options = <Option disabled value=""><ReactIntl.FormattedMessage id="my.app.no.app"
                                                                            defaultMessage="暂无应用"/></Option>;
        }
        return options;
    },
    //登录统计条形图
    renderLoginBarChart () {
        let weekTimeObj = this.refs.timeSelect ? this.refs.timeSelect.state : {};
        var legend = [{name: Intl.get("operation.report.login.count", "登录人数"), key: "count"}];
        return (
            <BarChart
                width={chartWidth}
                list={this.state.appLoginUserObj.data}
                title={Intl.get("operation.report.app.login", "各应用登录情况")}
                legend={legend}
                startDate={weekTimeObj.weekStartTime}
                endDate={weekTimeObj.weekEndTime}
                resultType={this.state.appLoginUserObj.resultType}
            />
        );
    },
    //新开账号统计
    renderNewTrialUserBarChart(){
        let weekTimeObj = this.refs.timeSelect ? this.refs.timeSelect.state : {};
        var legend = [{name: Intl.get("operation.report.app.new.account", "新开通用户"), key: "count"}];
        return (
            <BarChart
                width={chartWidth}
                list={this.state.appNewTrialUser.data}
                title={Intl.get("operation.report.new.account.statistic", "新开通用户统计")}
                legend={legend}
                startDate={weekTimeObj.weekStartTime}
                endDate={weekTimeObj.weekEndTime}
                resultType={this.state.appNewTrialUser.resultType}
            />
        );
    },
    //延期用户统计
    renderNewDelayUserBarChart(){
        let weekTimeObj = this.refs.timeSelect ? this.refs.timeSelect.state : {};
        var legend = [{name: Intl.get("operation.report.app.delay.user", "延期用户"), key: "count"}];
        return (
            <BarChart
                width={chartWidth}
                list={this.state.appNewDelayUser.data}
                title={Intl.get("operation.report.delay.user.statistic", "新增延期用户情况统计")}
                legend={legend}
                startDate={weekTimeObj.weekStartTime}
                endDate={weekTimeObj.weekEndTime}
                resultType={this.state.appNewDelayUser.resultType}
            />
        );
    },
    //近四周登录情况对比图
    renderLoginLineChart(){
        return (<CompositeLine
            width={this.chartWidth}
            list={this.state.appLoginComparison.data}
            title={Intl.get("operation.report.login.comparison", "近四周登录情况对比")}
            height={this.chartHeight}
            showLabel={true}
            symbolSize={2}
            resultType={this.state.appLoginComparison.resultType}
        />);
    },
    //近四周周登录总时长超过1小时的用户数对比图
    renderWeeklyLoginTotalTimeLineChart(){
        return (<CompositeLine
            width={this.chartWidth}
            list={this.state.appWeeklyLoginTotalTime.data}
            title={Intl.get("operation.report.login.total.time.user.comparison","近四周周登录总时长超过1小时的用户数对比")}
            height={this.chartHeight}
            showLabel={true}
            symbolSize={2}
            resultType={this.state.appWeeklyLoginTotalTime.resultType}
        />);
    },
    //近四周过期用户登录情况对比图
    renderExpiredLoginLineChart(){
        return (<CompositeLine
            width={this.chartWidth}
            list={this.state.appExpiredLoginComparison.data}
            title={Intl.get("operation.report.expire.login.comparison", "近四周过期用户登录情况对比")}
            height={this.chartHeight}
            showLabel={true}
            symbolSize={2}
            resultType={this.state.appExpiredLoginComparison.resultType}
        />);
    },
    //近四周签约用户登录情况对比图
    renderFormalUserLoginLineChart(){
        return (<CompositeLine
            width={this.chartWidth}
            list={this.state.appFormalLoginComparison.data}
            title={Intl.get("operation.report.signed.user.comparison", "近四周签约用户登录情况对比")}
            height={this.chartHeight}
            showLabel={true}
            symbolSize={2}
            resultType={this.state.appFormalLoginComparison.resultType}
        />);
    },
    //近四周新开通用户对比
    renderNewUserLineChart(){
        return (<CompositeLine
            width={this.chartWidth}
            list={this.state.appNewUserComparison.data}
            title={Intl.get("operation.report.new.open.comparison", "近四周新开通用户情况对比")}
            height={this.chartHeight}
            showLabel={true}
            symbolSize={2}
            resultType={this.state.appNewUserComparison.resultType}
        />);
    },
    //近四周新增延期用户对比
    renderNewDelayUserLineChart(){
        return (<CompositeLine
            width={this.chartWidth}
            list={this.state.appNewDelayUserComparison.data}
            title={Intl.get("operation.report.delay.user.comparison", "近四周新增延期用户情况对比")}
            height={this.chartHeight}
            showLabel={true}
            symbolSize={2}
            resultType={this.state.appNewDelayUserComparison.resultType}
        />);
    },

    //近四周用户活跃度情况对比
    renderUserActiveChart(){
        let chartWidth = $(".report-chart-container").width() - 20;//20:padding
        return (
            <AreaLine
                list={this.state.userActive.data}
                title=""
                width={chartWidth}
                height={this.chartHeight}
                dataRange={"weekly"}
                resultType={this.state.userActive.resultType}
                startTime={this.state.startTime}
                endTime={this.state.endTime}
                showLabel={true}
            />);
    },
    //本周各应用每日登录情况（日活）
    renderUserDailyActiveChart(){
        let chartWidth = $(".report-chart-container").width() - 20;//20:padding
        return (
            <AreaLine
                list={this.state.userDailyActive.data}
                title=""
                width={chartWidth}
                height={this.chartHeight}
                dataRange={"daily"}
                resultType={this.state.userDailyActive.resultType}
                startTime={this.state.startTime}
                endTime={this.state.endTime}
                showLabel={true}
            />);
    },
    //获取表格列
    getTableClumns(){
        let columns = [{
            title: Intl.get("operation.report.department", "部门"),
            dataIndex: 'name',
            key: 'department'
        }];
        let selectAppList = this.state.selectAppList, appList = this.state.appList;
        if (_.isArray(selectAppList) && selectAppList.length) {
            let width = 100 / (selectAppList.length + 2);//宽度用剩下的60%平分，2：总计+部门
            columns[0].width = width + '%';
            selectAppList.forEach((appId, i)=> {
                let app = _.find(appList, app=>app.id == appId);
                if (app && app.name) {
                    columns.push({
                        title: app.name,
                        dataIndex: appId,
                        key: 'count' + i,
                        width: width + '%',
                        className:"data-float-right"
                    });
                }
            });
            columns.push({
                title: Intl.get("sales.home.total.compute", "总计"),
                dataIndex: 'total',
                key: 'count',
                width: width + '%',
                className:"data-float-right"
            });
        }
        return columns;
    },
    //团队登录数据统计表格的渲染
    renderTeamTable(columns, data, resultType){
        let rows = data.length, tableHeight = 150;
        if (rows > 0) {
            tableHeight = rows * rowHeight;
        }
        return (<div className="team-login-table">
            <div className="team-table-head" ref="thead">
                <Table
                    dataSource={[]}
                    columns={columns}
                    pagination={false}
                    bordered
                />
            </div>
            <div className="team-table-body" ref="tbody" style={{height:tableHeight}}>
                <Table
                    dataSource={data}
                    columns={columns}
                    pagination={false}
                    loading={resultType=="loading"?true:false}
                    bordered
                />
            </div>
        </div>);
    },
    //渲染各部门用户登录系统统计表格
    renderTeamLoginUserTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamLoginUser.data || [];
        return this.renderTeamTable(columns, data, this.state.teamLoginUser.resultType);
    },
    //渲染各部门过期用户登录系统统计表格
    renderTeamExpiredLoginUserTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamExpiredLoginUser.data || [];
        return this.renderTeamTable(columns, data, this.state.teamExpiredLoginUser.resultType);
    },
    //各部门过期用户登录时长统计表
    renderExpiredUserLoginTimeTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamExpiredUserLoginTime.data || [];
        return this.renderTeamTable(columns, data, this.state.teamExpiredUserLoginTime.resultType);
    },
    //各部门新开试用账号的统计表格
    renderTeamNewTrialUserTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamNewTrialUser.data || [];
        return this.renderTeamTable(columns, data, this.state.teamNewTrialUser.resultType);
    },
    //各部门新增用户的部门统计表格
    renderTeamNewDelayUserTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamNewDelayUser.data || [];
        return this.renderTeamTable(columns, data, this.state.teamNewDelayUser.resultType);
    },
    //各部门新开试用账号登录的统计表格
    renderTeamNewTrialLoginUserTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamNewTrialLoginUser.data || [];
        return this.renderTeamTable(columns, data, this.state.teamNewTrialLoginUser.resultType);
    },
    //各部门新增延期用登录的统计表格
    renderTeamDelayLoginUserTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamNewDelayLoginUser.data || [];
        return this.renderTeamTable(columns, data, this.state.teamNewDelayLoginUser.resultType);
    },
    //各部门登录超过x小时的统计表格数据
    renderTeamExceedLoginTimeTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamExceedLoginTime.data || [];
        return this.renderTeamTable(columns, data, this.state.teamExceedLoginTime.resultType);
    },
    //各部门登录超过小时的延期用户统计表格数据
    renderTeamDelayUserLoginTimeTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamDelayUserLoginTime.data || [];
        return this.renderTeamTable(columns, data, this.state.teamDelayUserLoginTime.resultType);
    },
    //各部门签约用户登录情况的统计表格
    renderTeamSignedUserLoginTable(){
        let columns = this.getTableClumns();
        let data = this.state.teamSignedLoginUser.data || [];
        return this.renderTeamTable(columns, data, this.state.teamSignedLoginUser.resultType);
    },
    //导出
    doExport() {
        $("body").scrollTop(0);

        this.setState({
            exportPercent: 0,
            isProgressShow: true,
        });

        const topNav = $(".topNav");
        const topNavTmp = $("<div class=\"topNav top-nav-tmp\"></div>");
        const title = this.state.yearTime + Intl.get("user.week.number", "第{n}周", {n: this.state.weekTime}) + Intl.get("menu.operation.report", "运营报告");
        let app = [];
        _.each(this.state.appList, item => {
            if (this.state.selectAppList.indexOf(item.id) > -1) {
                app.push(item.name);
            }
        });
        app = app.join();
        const startTime = this.refs.timeSelect.state.weekStartTime;
        const endTime = this.refs.timeSelect.state.weekEndTime;
        const time = startTime + Intl.get("contract.83", "至") + endTime;
        const info = app + "<span></span>" + time;
        topNavTmp.append("<div class=\"pull-left\">" + title + "</div>");
        topNavTmp.append("<div class=\"pull-right\">" + info + "</div>");
        topNav.after(topNavTmp);

        let progressInterval = setInterval(() => {
            //设置一个最大值，防止出现进度超出100%导致进度条超出模态框内容区域的问题
            if (this.state.exportPercent < 60) {
                this.setState({
                    exportPercent: this.state.exportPercent + 10,
                });
            } else {
                clearInterval(progressInterval);
                progressInterval = null;
            }
        }, 200);

        html2canvasExport($(".operation-report-container")).then(canvas => {
            topNavTmp.remove();

            const img = canvas.toDataURL("image/png");
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const doc = new jsPDF("p", "px", [imgWidth, imgHeight]);
            doc.addImage(img, "PNG", 0, 0, imgWidth, imgHeight);
            doc.save("operation-report.pdf");

            this.setState({
                exportPercent: 100,
                isProgressShow: false,
            });

            clearInterval(progressInterval);
        }, () => {
            topNavTmp.remove();

            this.setState({
                isProgressShow: false,
            });

            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }

            message.error(Intl.get("common.export.failure", "导出失败"));
        });
    },
    //获取百分比的数据
    getPercentData(data1, data2){
        let percentData = "";//百分比数据
        if (data2) {
            percentData = (data1 / data2 * 100).toFixed(2) + "%";
        }
        return percentData
    },
    //渲染各应用签约用户的登录数、总数和占比组成的提示信息
    renderAppSignedUserTips(){
        let appSignedUserTips = null;
        let dataList = this.state.appFormalLoginComparison.data;//近四周登录系统的签约用户统计数据
        let totalDataList = this.state.appSignedUser.data || [];//各应用的签约用户总数
        if (_.isArray(dataList) && dataList.length) {
            appSignedUserTips = _.map(dataList, appObj=> {
                let total = 0, count = 0, lastWeekCount = 0;
                let totalData = _.find(totalDataList, data=>data.app_id == appObj.app_id);
                total = totalData ? totalData.count : 0;
                if (_.isArray(appObj.data)) {
                    count = appObj.data[3] ? appObj.data[3].count : 0;
                    lastWeekCount = appObj.data[2] ? appObj.data[2].count : 0;
                }
                //其中鹰击304个，占鹰击总签约用户数的34.49%（304/870）（上周34.98%）；
                return (<div
                    className="chart-descr-tip">
                    {Intl.get("operation.report.app.singed.user.login.tip",
                        "其中{appName}{count}个，占{appName}总签约用户数的{percent}（{count}/{total}）,上周{lastWeekPercent}({lastWeekCount}/{total}）；",
                        {
                            appName: appObj.app_name || "",
                            percent: this.getPercentData(count, total),
                            count: count + "",
                            total: total + "",
                            lastWeekCount: lastWeekCount + "",
                            lastWeekPercent: this.getPercentData(lastWeekCount, total)
                        })}
                </div>);
            });
        }
        return appSignedUserTips;
    },
    getTimeDescrObj(){
        let timeObj = {};
        if (this.refs.timeSelect) {
            let weekTimeObj = this.refs.timeSelect.state;
            timeObj.start_time = weekTimeObj.weekStartTime;
            timeObj.end_time = weekTimeObj.weekEndTime;
            if (new Date(timeObj.end_time).getTime() > new Date().getTime()) {
                timeObj.end_time = moment().format(oplateConsts.DATE_FORMAT);
            }
        }
        return timeObj;
    },
    //渲染各应用周在线时长超过1小时的过期用户数
    renderAppExpiredUserOnlineTips(){
        let tips = [];
        let appDataList = this.state.expiredUserExceedLoginTime.data;//各应用过期用户周在线时长超过1小时的用户数列表
        if (_.isArray(appDataList) && appDataList.length) {
            _.each(appDataList, appData=> {
                tips.push(Intl.get("operation.report.app.online.expired.user.count", "{appName}{count}个，", {
                    appName: appData.appName,
                    count: appData.count
                }));
            });
        }
        return tips.join(", ");
    },
    render() {
        let timeObj = this.getTimeDescrObj();
        return (
            <div className="operation-report-container" data-tracename="运营报告">
                <TopNav>
                    <TopNav.MenuList />
                    <Button onClick={this.doExport} data-tracename="导出" className="btn-export">{Intl.get("common.export", "导出")}</Button>
                    <div className="report-time-container">
                        <NatureTimeSelect ref="timeSelect" onChangeYear={this.onChangeYear}
                                          onChangeWeek={this.onChangeWeek}
                                          showTimeTypeSelect={false}
                                          timeType="week"
                                          yearTime={this.state.yearTime}
                                          weekTime={this.state.weekTime}/>
                    </div>
                    <div className="report-app-select-container">
                        <Select multiple name="managers"
                                optionFilterProp="children"
                                searchPlaceholder={Intl.get("user.app.select.please", "请选择应用")}
                                notFoundContent={Intl.get("common.no.match", "暂无匹配项")}
                                value={this.state.selectAppList}
                                onChange={this.onAppChange}>
                            {this.renderSelectOptions()}
                        </Select>
                    </div>
                </TopNav>
                <div className="operation-report-content">
                    <div className="report-item">
                        <h4>{Intl.get("operation.report.total.login", "一、总体登录情况")}</h4>
                        <div className="report-item-content">
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.this.week.total.login.tip"
                                                                defaultMessage={`1、本周共有{num}个（上周{lastWeekNum}个）用户登录了应用`}
                                                                values={{num:this.state.appLoginUserObj.total+"", lastWeekNum:this.state.appLoginUserObj.lastWeekTotal+""}}/>
                                </div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.app.login" defaultMessage="各应用登录情况"/></div>
                                    {this.renderLoginBarChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.login.comparison.chart", "2、近四周登录情况对比图如下所示:")}</div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.login.comparison" defaultMessage="近四周登录情况对比"/></div>
                                    {this.renderLoginLineChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.user.activity.chart",
                                        "3、截止{curTime}，应用总计{total}个用户，本周的活跃度为{percent}({curData}/{total})，近四周的用户活跃度对比图如下所示:", {
                                            curTime: timeObj.end_time,
                                            total: this.state.appUserTotal + "",
                                            percent: this.getPercentData(this.state.appLoginUserObj.total, this.state.appUserTotal),
                                            curData: this.state.appLoginUserObj.total + ""
                                        })}</div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.user.activity.comparison" defaultMessage="近四周用户活跃度对比"/>
                                    </div>
                                    {this.renderUserActiveChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.app.login.time.comparison",
                                        "4、本周共有{total}个（上周{lastWeekTotal}个）用户周登录总时长超过1小时，占比为{percent}({total}/{loginTotal})，近四周各应用周登录总时长超过1小时的用户数对比图如下所示:",
                                        {
                                            total: this.state.appWeeklyLoginTotalTime.total,
                                            lastWeekTotal: this.state.appWeeklyLoginTotalTime.lastWeekTotal,
                                            percent: this.getPercentData(this.state.appWeeklyLoginTotalTime.total, this.state.appLoginUserObj.total),
                                            loginTotal: this.state.appLoginUserObj.total + ""
                                        }
                                    )}</div>
                                <div className="report-chart">
                                    <div className="report-chart-title"></div>
                                    {this.renderWeeklyLoginTotalTimeLineChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.user.activity.daily.chart",
                                        "5、{startTime}至{endTime},各应用每日用户登录情况如下图所示：", {
                                            startTime: timeObj.start_time,
                                            endTime: timeObj.end_time
                                        })}</div>
                                <div className="report-chart">
                                    {this.renderUserDailyActiveChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.user.login.team.table",
                                        "6、登录用户的部门分布情况如下表所示：")}</div>
                                <div className="report-chart">
                                    {this.renderTeamLoginUserTable()}
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="report-item">
                        <h4>{Intl.get("operation.report.expire.user.login", "二、过期用户登录情况")}</h4>
                        <div className="report-item-content">
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.expire.user.login.tip"
                                                                defaultMessage={`1、本周共有{num}个(上周{lastWeekNum}个)过期用户登录了应用`}
                                                                values={{num: this.state.teamExpiredLoginUser.total + "",
                                                                lastWeekNum:this.state.teamExpiredLoginUser.lastWeekTotal+""}}/>
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamExpiredLoginUserTable()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {//本周共有881个过期用户周在线总时长超过1小时：鹰击394个，鹰眼444个，鹰仔8个，包打听6个，鹰击APP 13个，鹰眼APP 16个。
                                        Intl.get("operation.report.expired.total.login.time.tip", "2、本周共有{total}个过期用户周在线总时长超过1小时：", {total: this.state.expiredUserExceedLoginTime.total})
                                    }
                                    {this.renderAppExpiredUserOnlineTips()}
                                </div>
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.total.average.login.tip"
                                                                defaultMessage={`共有{num}个(上周{lastWeekNum}个)过期用户一周内平均每天登录8个小时以上，具体情况如下表所示：`}
                                                                values={{num: this.state.teamExpiredUserLoginTime.total + "",lastWeekNum:this.state.teamExpiredUserLoginTime.lastWeekTotal+""}}/>
                                </div>
                                <div className="report-chart">
                                    {this.renderExpiredUserLoginTimeTable()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.expired.user.login.comparison", "4、近四周过期用户登录情况对比图如下所示:")}
                                </div>
                                <div className="report-chart">
                                    <div className="report-chart-title">
                                        <ReactIntl.FormattedMessage id="operation.report.expired.login.comparison.chart"
                                                                    defaultMessage="近四周过期用户登录情况对比图"/>
                                    </div>
                                    {this.renderExpiredLoginLineChart()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="report-item">
                        <h4>
                            <ReactIntl.FormattedMessage id="operation.report.open.account.login"
                                                        defaultMessage="三、新开通试用用户登录情况"/>
                        </h4>
                        <div className="report-item-content">
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.open.trial.app.distribute"
                                                                defaultMessage={`1、本周共开设{num}个(上周{lastWeekNum}个)试用用户，应用分布情况如下图所示：`}
                                                                values={{num: this.state.appNewTrialUser.total + "",lastWeekNum:this.state.appNewTrialUser.lastWeekTotal+""}}/>
                                </div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.open.account.statistic" defaultMessage="新开通试用用户情况统计"/>
                                    </div>
                                    {this.renderNewTrialUserBarChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.open.user.comparison.chart", "2、近四周新开通试用用户情况对比图如下所示:")}
                                </div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.open.user.comparison" defaultMessage="近四周新开通试用用户对比"/></div>
                                    {this.renderNewUserLineChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.open.trial.team.tip", "3、新开通试用用户部门分布情况如下表所示:")}
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamNewTrialUserTable()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.open.trial.login.tip"
                                                                defaultMessage={`4、新开通试用用户共登录{count}个（上周{lastWeekCount}个）,占比{percent}({count}/{allCount}),上周占比{lastWeekPercent}({lastWeekCount}/{lastWeekAllCount}),部门分布情况如下表所示:`}
                                                                values={{count: this.state.teamNewTrialLoginUser.total + "",
                                                                lastWeekCount:this.state.teamNewTrialLoginUser.lastWeekTotal+"",
                                                                percent:this.getPercentData(this.state.teamNewTrialLoginUser.total,this.state.appNewTrialUser.total),
                                                                allCount:this.state.appNewTrialUser.total+"",
                                                                lastWeekPercent:this.getPercentData(this.state.teamNewTrialLoginUser.lastWeekTotal,this.state.appNewTrialUser.lastWeekTotal),
                                                                lastWeekAllCount:this.state.appNewTrialUser.lastWeekTotal+""}}/>
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamNewTrialLoginUserTable()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.total.week.login.tip"
                                                                defaultMessage={`5、共有{count}个新开试用用户周登录总时长超过1小时，部门分布情况如下表所示:`}
                                                                values={{count: this.state.teamExceedLoginTime.total + ""}}/>
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamExceedLoginTimeTable()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="report-item">
                        <h4>{Intl.get("operation.report.signed.account.login", "四、签约账号登录情况")}</h4>
                        <div className="report-item-content">
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.singed.user.login.percent.tip"
                                                                defaultMessage={`1、本周共有{count}个(上周{lastWeekCount})签约用户登录各应用,占本周登录总用户数的{percent}({count}/{allCount}),上周{lastWeekPercent}（{lastWeekCount}/{allCount}）,部门分布情况如下表所示:`}
                                                                values={{count: this.state.appFormalLoginComparison.total + "",
                                                                lastWeekCount:this.state.appFormalLoginComparison.lastWeekTotal + "",
                                                                percent:this.getPercentData(this.state.appFormalLoginComparison.total,this.state.appUserTotal),
                                                                allCount:this.state.appUserTotal+"",
                                                                lastWeekPercent:this.getPercentData(this.state.appFormalLoginComparison.lastWeekTotal,this.state.appUserTotal)
                                                                }}/>
                                </div>
                                {this.renderAppSignedUserTips()}
                                <div className="chart-descr-tip">
                                    {Intl.get("operation.report.singed.user.login.table.tip", "签约用户登录情况的部门分布如下表所示：")}
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamSignedUserLoginTable()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.singed.user.login.tip", "2、近四周签约用户登录情况对比图如下所示：")}
                                </div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.signed.user.comparison" defaultMessage="近四周签约用户登录情况对比"/>
                                    </div>
                                    {this.renderFormalUserLoginLineChart()}
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="report-item">
                        <h4>
                            <ReactIntl.FormattedMessage id="operation.report.delay.user.login"
                                                        defaultMessage="五、延期用户登录情况"/>
                        </h4>
                        <div className="report-item-content">
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.delay.user.app.distribute"
                                                                defaultMessage={`1、本周新增{num}个(上周{lastWeekNum}个)延期用户，应用分布情况如下图所示：`}
                                                                values={{num: this.state.appNewDelayUser.total + "",lastWeekNum:this.state.appNewDelayUser.lastWeekTotal+""}}/>
                                </div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.delay.user.statistic" defaultMessage="新增延期用户情况统计"/></div>
                                    {this.renderNewDelayUserBarChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.delay.user.comparison.chart", "2、近四周新增延期用户情况对比图如下所示:")}
                                </div>
                                <div className="report-chart">
                                    <div className="report-chart-title"><ReactIntl.FormattedMessage
                                        id="operation.report.delay.user.comparison" defaultMessage="近四周新增延期用户对比"/></div>
                                    {this.renderNewDelayUserLineChart()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    {Intl.get("operation.report.delay.user.team.tip", "3、新增延期用户部门分布情况如下表所示:")}
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamNewDelayUserTable()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.delay.user.login.tip"
                                                                defaultMessage={`4、新增延期用户共登录{count}个（上周{lastWeekCount}个）,占比{percent}({count}/{allCount}),上周占比{lastWeekPercent}({lastWeekCount}/{lastWeekAllCount}),部门分布情况如下表所示:`}
                                                                values={{count: this.state.teamNewDelayLoginUser.total + "",
                                                                lastWeekCount:this.state.teamNewDelayLoginUser.lastWeekTotal+"",
                                                                percent:this.getPercentData(this.state.teamNewDelayLoginUser.total,this.state.appNewDelayUser.total),
                                                                allCount:this.state.appNewDelayUser.total+"",
                                                                lastWeekPercent:this.getPercentData(this.state.teamNewDelayLoginUser.lastWeekTotal,this.state.appNewDelayUser.lastWeekTotal),
                                                                lastWeekAllCount:this.state.appNewDelayUser.lastWeekTotal+""}}/>
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamDelayLoginUserTable()}
                                </div>
                            </div>
                            <div className="report-chart-container">
                                <div className="chart-descr">
                                    <ReactIntl.FormattedMessage id="operation.report.delay.user.week.login.tip"
                                                                defaultMessage={`5、共有{count}个延期用户周登录总时长超过1小时，部门分布情况如下表所示:`}
                                                                values={{count: this.state.teamDelayUserLoginTime.total + ""}}/>
                                </div>
                                <div className="report-chart">
                                    {this.renderTeamDelayUserLoginTimeTable()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    visible={this.state.isProgressShow}
                    closable={false}
                    footer={null}
                >
                    <ProgressLine percent={this.state.exportPercent}/>
                </Modal>
            </div>
        );
    }
});

module.exports = OperationReport;
