/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
let emotionUtils = {
    getEmotionType() {
        let emotionList = this.getEmotionList();
        return Object.keys(emotionList);
    },
    replaceUnifiedWithImg(text) {
        if (text && text.length) {
            let emotions = this.getEmotionList();
            let emotionStr = '';
            for (var type in emotions) {
                var arr = emotions[type];
                for (var item in arr) {
                    emotionStr += arr[item].shortname + '|';
                }
            }
            if (emotionStr.length) {
                emotionStr = emotionStr.substr(0, emotionStr.length - 1);
            }
            var regx = new RegExp(emotionStr, 'g');
            return text.replace(regx, function(rs) {
                // let url = "#icon-" + rs.substring(1, rs.length - 1);
                // return "<svg><use xlink:href='" + url + "'/></svg>";
                let emotionUrl = rs.substring(1, rs.length - 1) + '.svg';
                let url = require(`../../../static/images/emotion/${emotionUrl}`);
                return '<img src=\'' + url + '\' class=\'emotion-item\' name=\'' + rs.substring(1, rs.length - 1) + '\'/>';
            });
        } else {
            return text;
        }
    },
    replaceUnifiedWithSvg(text) {
        if (text && text.length) {
            let emotions = this.getEmotionList();
            let emotionStr = '';
            for (var type in emotions) {
                var arr = emotions[type];
                for (var item in arr) {
                    emotionStr += arr[item].shortname + '|';
                }
            }
            if (emotionStr.length) {
                emotionStr = emotionStr.substr(0, emotionStr.length - 1);
            }
            var regx = new RegExp(emotionStr, 'g');
            return text.replace(regx, function(rs) {
                let emotionUrl = rs.substring(1, rs.length - 1) + '.svg';
                let url = require(`../../../static/images/emotion/${emotionUrl}`);
                return '<img src=\'' + url + '\' class=\'emotion-item\' name=\'' + rs.substring(1, rs.length - 1) + '\'/>';
                // let url = '#icon-' + rs.substring(1, rs.length - 1);
                // return "<svg><use xlink:href='" + url + "'/></svg>";
            });
        } else {
            return text;
        }
    },
    getEmotionList() {
        // 暂时保留一段时间
        // return {
        //     'people': [{
        //         'shortname': ':grinning:'
        //     },
        //     {
        //         'shortname': ':grin:'
        //     },
        //     {
        //         'shortname': ':joy:'
        //     },
        //     {
        //         'shortname': ':rofl:'
        //     },
        //     {
        //         'shortname': ':smiley:'
        //     },
        //     {
        //         'shortname': ':smile:'
        //     },
        //     {
        //         'shortname': ':sweat_smile:'
        //     },
        //     {
        //         'shortname': ':laughing:'
        //     },
        //     {
        //         'shortname': ':wink:'
        //     },
        //     {
        //         'shortname': ':blush:'
        //     },
        //     {
        //         'shortname': ':yum:'
        //     },
        //     {
        //         'shortname': ':sunglasses:'
        //     },
        //     {
        //         'shortname': ':heart_eyes:'
        //     },
        //     {
        //         'shortname': ':kissing_heart:'
        //     },
        //     {
        //         'shortname': ':kissing:'
        //     },
        //     {
        //         'shortname': ':kissing_smiling_eyes:'
        //     },
        //     {
        //         'shortname': ':kissing_closed_eyes:'
        //     },
        //     {
        //         'shortname': ':relaxed:'
        //     },
        //     {
        //         'shortname': ':hugging:'
        //     },
        //     {
        //         'shortname': ':slight_smile:'
        //     },
        //     {
        //         'shortname': ':thinking:'
        //     },
        //     {
        //         'shortname': ':neutral_face:'
        //     },
        //     {
        //         'shortname': ':expressionless:'
        //     },
        //     {
        //         'shortname': ':no_mouth:'
        //     },
        //     {
        //         'shortname': ':rolling_eyes:'
        //     },
        //     {
        //         'shortname': ':smirk:'
        //     },
        //     {
        //         'shortname': ':persevere:'
        //     },
        //     {
        //         'shortname': ':disappointed_relieved:'
        //     },
        //     {
        //         'shortname': ':open_mouth:'
        //     },
        //     {
        //         'shortname': ':zipper_mouth:'
        //     },
        //     {
        //         'shortname': ':hushed:'
        //     },
        //     {
        //         'shortname': ':sleepy:'
        //     },
        //     {
        //         'shortname': ':tired_face:'
        //     },
        //     {
        //         'shortname': ':sleeping:'
        //     },
        //     {
        //         'shortname': ':relieved:'
        //     },
        //     {
        //         'shortname': ':nerd:'
        //     },
        //     {
        //         'shortname': ':stuck_out_tongue:'
        //     },
        //     {
        //         'shortname': ':stuck_out_tongue_winking_eye:'
        //     },
        //     {
        //         'shortname': ':stuck_out_tongue_closed_eyes:'
        //     },
        //     {
        //         'shortname': ':drooling_face:'
        //     },
        //     {
        //         'shortname': ':unamused:'
        //     },
        //     {
        //         'shortname': ':sweat:'
        //     },
        //     {
        //         'shortname': ':pensive:'
        //     },
        //     {
        //         'shortname': ':confused:'
        //     },
        //     {
        //         'shortname': ':upside_down:'
        //     },
        //     {
        //         'shortname': ':money_mouth:'
        //     },
        //     {
        //         'shortname': ':astonished:'
        //     },
        //     {
        //         'shortname': ':frowning2:'
        //     },
        //     {
        //         'shortname': ':slight_frown:'
        //     },
        //     {
        //         'shortname': ':confounded:'
        //     },
        //     {
        //         'shortname': ':disappointed:'
        //     },
        //     {
        //         'shortname': ':worried:'
        //     },
        //     {
        //         'shortname': ':frowning:'
        //     },
        //     {
        //         'shortname': ':cry:'
        //     },
        //     {
        //         'shortname': ':sob:'
        //     },
        //     {
        //         'shortname': ':anguished:'
        //     },
        //     {
        //         'shortname': ':fearful:'
        //     },
        //     {
        //         'shortname': ':weary:'
        //     },
        //     {
        //         'shortname': ':grimacing:'
        //     },
        //     {
        //         'shortname': ':cold_sweat:'
        //     },
        //     {
        //         'shortname': ':scream:'
        //     },
        //     {
        //         'shortname': ':flushed:'
        //     },
        //     {
        //         'shortname': ':rage:'
        //     },
        //     {
        //         'shortname': ':dizzy_face:'
        //     },
        //     {
        //         'shortname': ':angry:'
        //     },
        //     {
        //         'shortname': ':mask:'
        //     },
        //     {
        //         'shortname': ':thermometer_face:'
        //     },
        //     {
        //         'shortname': ':head_bandage:'
        //     },
        //     {
        //         'shortname': ':sneezing_face:'
        //     },
        //     {
        //         'shortname': ':muscle:'
        //     },
        //     {
        //         'shortname': ':point_left:'
        //     },
        //     {
        //         'shortname': ':point_right:'
        //     },
        //     {
        //         'shortname': ':point_up:'
        //     },
        //     {
        //         'shortname': ':point_down:'
        //     },
        //     {
        //         'shortname': ':v:'
        //     },
        //     {
        //         'shortname': ':ok_hand:'
        //     },
        //     {
        //         'shortname': ':thumbsup:'
        //     },
        //     {
        //         'shortname': ':thumbsdown:'
        //     },
        //     {
        //         'shortname': ':clap:'
        //     },
        //     {
        //         'shortname': ':writing_hand:'
        //     },
        //     {
        //         'shortname': ':pray:'
        //     },
        //     {
        //         'shortname': ':handshake:'
        //     },
        //     {
        //         'shortname': ':footprints:'
        //     },
        //     {
        //         'shortname': ':zzz:'
        //     },
        //     {
        //         'shortname': ':shamrock:'
        //     }
        //     ]
        // };
        return {
            'people': [{
                'shortname': ':relaxed:'
            },
            {
                'shortname': ':heart_eyes:'
            },
            {
                'shortname': ':neutral_face:'
            },
            {
                'shortname': ':sunglasses:'
            },
            {
                'shortname': ':sob:'
            },
            {
                'shortname': ':zipper_mouth:'
            },
            {
                'shortname': ':sleepy:'
            },
            {
                'shortname': ':cry:'
            },
            {
                'shortname': ':rage:'
            },
            {
                'shortname': ':stuck_out_tongue:'
            },
            {
                'shortname': ':grin:'
            },
            {
                'shortname': ':astonished:'
            },
            {
                'shortname': ':frowning2:'
            },
            {
                'shortname': ':cold_sweat:'
            },
            {
                'shortname': ':blush:'
            },
            {
                'shortname': ':rolling_eyes:'
            },
            {
                'shortname': ':drooling_face:'
            },
            {
                'shortname': ':scream:'
            },
            {
                'shortname': ':sweat:'
            },
            {
                'shortname': ':laughing:'
            },
            {
                'shortname': ':confused:'
            },
            {
                'shortname': ':dizzy_face:'
            },
            {
                'shortname': ':tired_face:'
            },
            {
                'shortname': ':disappointed:'
            },
            {
                'shortname': ':skull:'
            },
            {
                'shortname': ':applause:'
            },
            {
                'shortname': ':kissing_closed_eyes:'
            },
            {
                'shortname': ':stuck_out_tongue_winking_eye:'
            },
            {
                'shortname': ':joy:'
            },
            {
                'shortname': ':thinking:'
            },
            {
                'shortname': ':stuck_out_tongue_closed_eyes:'
            },
            {
                'shortname': ':watermelon:'
            },
            {
                'shortname': ':beer:'
            },
            {
                'shortname': ':basketball:'
            },
            {
                'shortname': ':ping_pong:'
            },
            {
                'shortname': ':tea:'
            },
            {
                'shortname': ':coffee:'
            },
            {
                'shortname': ':rice:'
            },
            {
                'shortname': ':pig:'
            },
            {
                'shortname': ':rose:'
            },
            {
                'shortname': ':wilted_rose:'
            },
            {
                'shortname': ':heart:'
            },
            {
                'shortname': ':broken_heart:'
            },
            {
                'shortname': ':birthday:'
            },
            {
                'shortname': ':zap:'
            },
            {
                'shortname': ':bomb:'
            },
            {
                'shortname': ':knife:'
            },
            {
                'shortname': ':soccer:'
            },
            {
                'shortname': ':beetle:'
            },
            {
                'shortname': ':poop:'
            },
            {
                'shortname': ':sun_with_face:'
            },
            {
                'shortname': ':gift:'
            },
            {
                'shortname': ':thumbsup:'
            },
            {
                'shortname': ':thumbsdown:'
            },
            {
                'shortname': ':handshake:'
            },
            {
                'shortname': ':v:'
            },
            {
                'shortname': ':bao_quan:'
            },
            {
                'shortname': ':fist:'
            },
            {
                'shortname': ':metal:'
            },
            {
                'shortname': ':point_up:'
            },
            {
                'shortname': ':ok_hand:'
            },
            {
                'shortname': ':double_happiness:'
            },
            {
                'shortname': ':firecrackers:'
            },
            {
                'shortname': ':izakaya_lantern:'
            },
            {
                'shortname': ':microphone:'
            },
            {
                'shortname': ':tada:'
            },
            {
                'shortname': ':anger:'
            },
            {
                'shortname': ':lollipop:'
            },
            {
                'shortname': ':baby_bottle:'
            },
            {
                'shortname': ':airplane:'
            },
            {
                'shortname': ':yen:'
            },
            {
                'shortname': ':pill:'
            },
            {
                'shortname': ':gun:'
            },
            {
                'shortname': ':egg:'
            },
            {
                'shortname': ':crab:'
            }
            ]
        };
    }
};

export default emotionUtils;