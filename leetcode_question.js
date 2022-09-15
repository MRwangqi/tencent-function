const request = require('request');
const wechatWeebhook = "企业微信 webhook 地址"

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
            var json = JSON.parse(body);
            var questionTitleSlug = json.data.todayRecord[0].question.questionTitleSlug
            getProblemList(questionTitleSlug)
        });
}



function getProblemList(questionTitleSlug) {
    var json = {
        "operationName": "questionSolutionArticles",
        "variables": { "questionSlug": questionTitleSlug, "first": 10, "skip": 0, "orderBy": "DEFAULT" },
        "query": "query questionSolutionArticles($questionSlug: String!, $skip: Int, $first: Int, $orderBy: SolutionArticleOrderBy, $userInput: String, $tagSlugs: [String!]) {\n  questionSolutionArticles(questionSlug: $questionSlug, skip: $skip, first: $first, orderBy: $orderBy, userInput: $userInput, tagSlugs: $tagSlugs) {\n    totalNum\n    edges {\n      node {\n        ...solutionArticle\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment solutionArticle on SolutionArticleNode {\n  rewardEnabled\n  canEditReward\n  uuid\n  title\n  slug\n  sunk\n  chargeType\n  status\n  identifier\n  canEdit\n  canSee\n  reactionType\n  reactionsV2 {\n    count\n    reactionType\n    __typename\n  }\n  tags {\n    name\n    nameTranslated\n    slug\n    tagType\n    __typename\n  }\n  createdAt\n  thumbnail\n  author {\n    username\n    profile {\n      userAvatar\n      userSlug\n      realName\n      __typename\n    }\n    __typename\n  }\n  summary\n  topic {\n    id\n    commentCount\n    viewCount\n    __typename\n  }\n  byLeetcode\n  isMyFavorite\n  isMostPopular\n  isEditorsPick\n  hitCount\n  videosInfo {\n    videoId\n    coverUrl\n    duration\n    __typename\n  }\n  __typename\n}\n"
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
            var json = JSON.parse(body);
            var slug = json.data.questionSolutionArticles.edges[0].node.slug
            var title = json.data.questionSolutionArticles.edges[0].node.title
            // console.log(slug)
            // console.log(title)

            getProblemDetails(questionTitleSlug,slug)
        });
}

function getProblemDetails(questionTitleSlug,slug) {
    var json = {
        "operationName": "solutionDetailArticle",
        "variables": {
            "slug": slug,
            "orderBy": "DEFAULT"
        },
        "query": "query solutionDetailArticle($slug: String!, $orderBy: SolutionArticleOrderBy!) {\n  solutionArticle(slug: $slug, orderBy: $orderBy) {\n    ...solutionArticle\n    content\n    question {\n      questionTitleSlug\n      __typename\n    }\n    position\n    next {\n      slug\n      title\n      __typename\n    }\n    prev {\n      slug\n      title\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment solutionArticle on SolutionArticleNode {\n  rewardEnabled\n  canEditReward\n  uuid\n  title\n  slug\n  sunk\n  chargeType\n  status\n  identifier\n  canEdit\n  canSee\n  reactionType\n  reactionsV2 {\n    count\n    reactionType\n    __typename\n  }\n  tags {\n    name\n    nameTranslated\n    slug\n    tagType\n    __typename\n  }\n  createdAt\n  thumbnail\n  author {\n    username\n    profile {\n      userAvatar\n      userSlug\n      realName\n      __typename\n    }\n    __typename\n  }\n  summary\n  topic {\n    id\n    commentCount\n    viewCount\n    __typename\n  }\n  byLeetcode\n  isMyFavorite\n  isMostPopular\n  isEditorsPick\n  hitCount\n  videosInfo {\n    videoId\n    coverUrl\n    duration\n    __typename\n  }\n  __typename\n}\n"
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
            var json = JSON.parse(body);    
            var markdown = json.data.solutionArticle.content    
            
             var urls = "https://leetcode-cn.com/problems/"+questionTitleSlug+"/solution/"+slug+"/"
            markdown = "#### [题解]("+urls+")" + markdown
            postWechat(markdown)
        });
}




function postWechat(markdown) {

//   if (typeof String.prototype.replaceAll == "undefined") {
        String.prototype.replaceAll = function (match, replace) {
            return this.replace(new RegExp(match, 'gs'), () => replace);
        }
    // }


    markdown =  markdown.replaceAll("```Python.*?```","")
    markdown =  markdown.replaceAll("```C\\+\\+.*?```","")
    markdown =  markdown.replaceAll("```C#.*?```","")
    markdown =  markdown.replaceAll("```go.*?```","")
    markdown =  markdown.replaceAll("```JavaScript.*?```","")
    

    console.log(markdown.length)

    var msg = {
        "msgtype": "markdown",
        "markdown": {
            "content": markdown.substring(0,3000)
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

