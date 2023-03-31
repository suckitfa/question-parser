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

// get question and answer pairs
const getQuestionAndAnwserPairs = async (fileName) => {
    const data = await getDataFromFile(fileName)
    const questions = data.split(/^[0-9]+\./gm)
    questions.forEach((question, index) => {
        const reg = /（*）/gm
        console.log(reg.exec(question))
        console.log(`index=${index},question=${question}`)
    })
}

// 单选题或者多选题
const matchSingleChoicie = (question) => {
    const answersMap = {A:0,B:0,C:0,D:0}
    const matches = []
    const realAnswer = []
    const regex = /[A-Z]+/gm
    let match
    while (match = regex.exec(question)) {
        answersMap[match[0]]++;
        matches.push(match[0]);
    }
    // loop through answersMap
    for (const [key, value] of Object.entries(answersMap)) {
        if(value >= 2) {
            console.log(`key=${key},value=${value}`)
            realAnswer.push(key)
        }
    }
    return realAnswer
}
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

// getQuestionAndAnwserPairs('./three.txt')

// 单选题
const t = `在国家信息化体系六要素中，（  B   ）是国家信息化的核心任务，是信息化建设取得实效的关键。
A．信息技术和产业       　 　B．信息资源的开发和利用
C．信息人才     　　 　      D．信息化政策法规和标准规范`

// 多选题
const m = `3.如果节流装置的结构不符合标准要求时，则基本流量公式中的流量系数会变小的是（Ｂ、Ｃ、Ｅ）。
A、孔板直角入口边缘不锐利        B、孔板厚度超过规定值
C、孔板开孔圆筒部分长度太大　    D、角接取压法正取压孔离孔板端面距离偏大 E、负取压孔离孔板端面距离偏大F、孔板弯曲`
// console.log('an =   ', an)  
// matchSingleChoicie(m)
// mathMultiChoicie(m)

// const cRegex = /\uFF08(*)\uFF09/gm
// cRegex.exec(t)

// let pattern = /\u4e00*\u9fa5/gim;
// let str = "（  B   ）";
// let result = str.match(pattern);
// console.log(result);
// // 输出字符的Unicode编码
// console.log('Ｂ'.charCodeAt(0).toString(16));
// console.log('\uFF08')
// // console.log(`Ｂ、Ｃ、Ｅ`)

// const getUniCode16FromStr = (str) => {
//     return str.charCodeAt(0).toString(16)
// }
// console.log('getUniCode16FromStr = ', getUniCode16FromStr('Ａ'))
// console.log('getUniCode16FromStr = ', getUniCode16FromStr('Ｂ'))
// console.log('getUniCode16FromStr = ', getUniCode16FromStr('Ｃ'))
// console.log('getUniCode16FromStr = ', getUniCode16FromStr('Ｄ'))
// console.log('getUniCode16FromStr = ', getUniCode16FromStr('Ｅ'))
// console.log('getUniCode16FromStr = ', getUniCode16FromStr('Ｆ'))
// console.log('getUniCode16FromStr = ', getUniCode16FromStr('Ｇ'))
// console.log('getUniCode16FromStr = ',getUniCode16FromStr('√'))
// console.log('getUniCode16FromStr = ',getUniCode16FromStr('×'))

const s = `361、应用级网关防火墙是内部网和外部网的隔离点,它可对应用层的通信数据流进行监控和过滤。（　√  ）`
const w = `×`
// matchSingleChoicie(s)
// console.log('res = ', mathWrongOrRight(s))
// console.log('res = ', mathWrongOrRight(w))

// 答案格式化成如下格式
// [["云计算技术服务有几种形式",["IaaS","PaaS","SaaS"]]