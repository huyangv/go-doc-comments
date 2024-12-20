export enum CommentType {
    Package,
    Struct,
    Function,
    Field,
    Interface
}

export type Comment = {
    type?: CommentType,
    directOut?: string,
    name?: string,
    args?: FunctionArg[]
    returns?: FunctionArg[]
}

export type FunctionArg = {
    name: string,
    type: string,
    next: boolean
}

export const splitFuncLine = (line: string) => {
    if (line.startsWith("func ")) {
        line = line.substring(5);
    }
    if (line.startsWith("(")) {
        // 结构体方法 todo 暂时不处理，直接去掉
        const end = line.indexOf(")")
        if (end <= 0) {
            throw new Error("结构体方法解析失败。")
        }
        line = line.substring(end + 1)
    }
    if (line.endsWith("{")) {
        line = line.substring(0, line.length - 1);
    }

    const data = {
        funcName: "",
        generics: "",
        arg: "",
        returns: ""
    }

    // 1 方法名称
    let index = line.indexOf("(")
    data.funcName = line.substring(0, index).trim()

    index = data.funcName.indexOf("[")
    if (index != -1) {
        const name = data.funcName
        data.funcName = name.substring(0, index)
        data.generics = name.substring(index)
    }

    line = line.substring(index)
    // 参数分段
    const argSectionData = getCloseIndexData(line, "(", ")")
    data.arg = argSectionData.range

    line = line.substring(argSectionData.end + 1)
    // 返回值分段
    while (line.startsWith(" ")) {
        line = line.substring(1)
    }

    if (!line.startsWith("(")) {
        data.returns = line
    } else {
        const sectionData = getCloseIndexData(line, "(", ")")
        data.returns = sectionData.range
    }

    return data
}

// 使用特定符号获取行数据闭合段
// hole 遍历整个字符串 否则满足闭合就返回
export const getCloseIndexData = (line: string, open: string, close: string, hole: boolean = false) => {
    const data = {
        start: -1,
        end: -1,
        range: "",
        min: 0,
        max: 0
    }

    data.start = line.indexOf(open)
    if (data.start < 0) {
        return data
    }

    const charMap: { [key: string]: number } = {
        [open]: 0,
        [close]: 0,
    }
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const v = charMap[char]
        if (typeof v !== "number") continue
        charMap[char] = v + 1
        if (char == close && charMap[open] == charMap[close]) {
            data.end = i
        }
        if (!hole && data.end != -1) {
            break
        }
    }

    if (data.start != -1 && data.end != data.start) {
        data.range = line.substring(data.start + 1, data.end)
    }
    data.min = charMap[open]
    data.max = charMap[close]
    return data
}

export const parseArg = (line: string, fromReturn: boolean) => {
    const ary = line.split(",")

    let next = ary.shift()

    const after: string[] = []

    while (next) {
        if (next.includes("(")) {
            let tmp = getCloseIndexData(next, "(", ")", true)
            if (tmp.min != tmp.max) {
                next = next + "," + ary.shift()
                continue
            }
        }
        after.push(next)
        next = ary.shift()
    }

    const out: FunctionArg[] = []
    if (after.length > 0) {
        for (let i = 0; i < after.length; i++) {
            let item = after[i]
            if (item.startsWith(" ")) item = item.substring(1)
            after[i] = item
            let isAny = item == "any"
            if (isAny) {
                item = "interface{}"
            }
            let matchName = item.match(goStyleVariableRegexBlank)
            if (!matchName) {
                if (!item.includes("(") && !item.includes("{") && !item.includes("[")) {
                    out.push({
                        name: item,
                        type: "",
                        next: true
                    })
                    continue
                }
                out.push({
                    name: "",
                    type: isAny ? "any" : item,
                    next: false
                })
                continue
            }
            out.push({
                name: matchName[0].trim(),
                type: item.replace(matchName[0], ""),
                next: false
            })
        }

    }
    out.reverse().forEach((item, index) => {
        if (index + 1 < out.length) {
            const last = out[index + 1]
            if (last.next) {
                last.type = item.type
            }
        }
    })

    return out.reverse()
}

// go类型变量匹配
const goStyleVariableRegexBlank = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b /g;
const goStyleVariableRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;