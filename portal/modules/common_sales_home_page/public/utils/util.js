/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/27.
 */
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
exports.getRelativeTime = function (time) {
    var relativeTime = "";
    var todayStartTime = TimeStampUtil.getTodayTimeStamp().start_time;
    var todayEndTime = TimeStampUtil.getTodayTimeStamp().end_time;
    if (time >= todayStartTime && time <= todayEndTime) {
        relativeTime = Intl.get("user.time.today", "今天");
    } else if (time >= todayStartTime - 1 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime - 1 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get("user.time.yesterday", "昨天");
    } else if (time >= todayStartTime - 2 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime - 2 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get("sales.frontpage.before.yesterday", "前天");
    } else if (time >= todayStartTime + 1 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime + 1 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get("sales.frontpage.tomorrow", "明天");
    } else if (time >= todayStartTime + 2 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime + 2 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get("sales.frontpage.after.tomorrow", "后天");
    } else {
        relativeTime = moment(time).format(oplateConsts.DATE_FORMAT);
    }
    return relativeTime;
};