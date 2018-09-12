/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/12.
 */
export const LESSONESECOND = 24 * 60 * 60 * 1000 - 1000;//之前添加日程时，一天的开始时间是00:00:00 到24:59:59秒，但是这个组件中认为的一天是从第一天的00;00：00 到第二天的00:00：00 。所以存储的全天的日程就被认为少了1000毫秒 但是可以通过加allday这个属性，被分到全天的日程中