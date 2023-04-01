const { match } = require('assert');
const fs = require('fs');
const path = require('path');
// read file from the file system
const  getDataFromFile = async (fileName) => {
    const filePath = path.join(__dirname, fileName);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err)
                return
            }
            resolve(data)
        });
    })
}

// get questions
const getQuestions = async (fileName) => {
    const data = await getDataFromFile(fileName)
    const questions = data.split(/^[0-9]+\./gm)
    return questions.filter(item => item !== '')
}

// 单选题或者多选题
const matchSingleChoicie = (question) => {
    const regx = /[A-Z]/gm
    const match = regx.exec(question)[0]
    return match
}

getQuestions('./three.txt').then((questions) => {
    questions.forEach((question,index) => {
        const result = matchSingleChoicie(question)
        console.log(`第${index+1}题的答案是：${result}`)
    })
})

// 答案格式化成如下格式
// [["云计算技术服务有几种形式",["IaaS","PaaS","SaaS"]]
// 多选题匹配

const mathMultiChoicie = (question) => {
    const regex = /[A-Z]+/gm
    while(match = regex.exec(m)) {
        console.log(match[0])
    }
}

// 判断题匹配
const mathWrongOrRight = (question) => {
    const regex = /√|×/gm
    let match
    while(match = regex.exec(question)) {
        const result = match[0]
        return result === '√' ? true : false
    }
}
