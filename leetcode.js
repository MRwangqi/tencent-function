const request = require('request');
const TurndownService = require('turndown')
// 配置自己企微的 webhook 地址
const wechatWeebhook = "webhook 地址"

exports.main_handler = async (event, context,callback) => {
    questionOfToday()
    callback(null,"result")
};

// api 接口 http://cattiek.site/2019/03/03/Leetcode%E7%88%AC%E8%99%AB%E5%AE%9E%E8%B7%B5/
function questionOfToday() {
    var json = {
        "operationName": "questionOfToday",
        "variables": {},
        "query": "query questionOfToday { todayRecord {   question {     questionFrontendId     questionTitleSlug     __typename   }   lastSubmission {     id     __typename   }   date   userStatus   __typename }}"
    }
    request({
        method: 'POST',
        url: 'https://leetcode-cn.com/graphql',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(json)
    },
        function (error, response, body) {
            // if (error) {
            //   return console.error('upload failed:', error);
            // }

            // console.log(body);

            var json = JSON.parse(body);
            questionDetailsOfToday(json)

        });

}



function questionDetailsOfToday(data) {

    var questionTitleSlug = data.data.todayRecord[0].question.questionTitleSlug

    // # 获取今日每日一题的所有信息
    var urls = "https://leetcode-cn.com/graphql"
    var json = {
        "operationName": "questionData",
        "variables": { "titleSlug": questionTitleSlug },
        "query": "query questionData($titleSlug: String!) {  question(titleSlug: $titleSlug) {    questionId    questionFrontendId    boundTopicId    title    titleSlug    content    translatedTitle    translatedContent    isPaidOnly    difficulty    likes    dislikes    isLiked    similarQuestions    contributors {      username      profileUrl      avatarUrl      __typename    }    langToValidPlayground    topicTags {      name      slug      translatedName      __typename    }    companyTagStats    codeSnippets {      lang      langSlug      code      __typename    }    stats    hints    solution {      id      canSeeDetail      __typename    }    status    sampleTestCase    metaData    judgerAvailable    judgeType    mysqlSchemas    enableRunCode    envInfo    book {      id      bookName      pressName      source      shortDescription      fullDescription      bookImgUrl      pressImgUrl      productUrl      __typename    }    isSubscribed    isDailyQuestion    dailyRecordStatus    editorType    ugcQuestionId    style    __typename  }}"
    }


    request({
        method: 'POST',
        url: urls,
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(json)
    },
        function (error, response, body) {
            if (error) {
                return console.error('upload failed:', error);
            }
            // console.log('Upload successful!  Server responded with:', body);
            var json = JSON.parse(body);
            postWechat(json)
        });
}


function postWechat(json) {

    var question = json.data.question
    // 题号
    var id = question.questionFrontendId
    // 难度级别
    var level = question.difficulty
    // 标题
    var title = question.translatedTitle
    // 内容
    var content = question.translatedContent


    if (typeof String.prototype.replaceAll == "undefined") {
        String.prototype.replaceAll = function (match, replace) {
            return this.replace(new RegExp(match, 'g'), () => replace);
        }
    }
    
    var title = "<p><strong>题目:"+title+" 题号:"+id+"难度:"+level +"</strong></p>"
    content = title + content

    var turndownService = new TurndownService()
    var markdown = turndownService.turndown(content)

    console.log(markdown)
    console.log("************")
    var a = markdown.replaceAll("![]",">[图片链接请查看]")
    console.log(a)

  
    var msg = {
        "msgtype": "markdown",
        "markdown": {
            "content": a
        }
    }

    const result = JSON.stringify(msg)

    request({
        method: 'POST',
        url: wechatWeebhook,
        headers: {
            'content-type': 'application/json',
        },
        body: result
    },
        function (error, response, body) {
            if (error) {
                return console.error('upload failed:', error);
            }
            console.log('Upload successful!  Server responded with:', body);
        })

}

