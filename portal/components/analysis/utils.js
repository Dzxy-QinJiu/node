import { DATE_FORMAT } from "./consts";

//获取xx年xx月xx日格式的截至时间
export function getEndDateText(endDate) {
    return moment(endDate).format(DATE_FORMAT);
}
