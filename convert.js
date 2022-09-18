const FileSystem = require("fs");
const Encoding = require("iconv-lite");

let EnableSingleServerMode = false;

if (process.argv[2] !== null) {
    if (typeof process.argv[2] !== "undefined") {
        if (process.argv[2] === "--enable-single-server-mode") {
            EnableSingleServerMode = true;
        }
    }
}

const GetMessageSender = (Line) => {
    let Result = /\<(.+?)\>/.exec(Line);
    return Result[1];
};

const GetMessageTime = (Line) => {
    let Result = /\[(.+?)\]/.exec(Line);
    return Result[1];
}

const GetMessageContent = (Line) => {
    let AdditionalInfoArray = Array.from(Line.matchAll(/\[(.+?)\]/g), temp => temp[0]);
    let Result = Line;
    for (let i = 0; i < AdditionalInfoArray.length; i++) {
        Result = Result.replaceAll(AdditionalInfoArray[i], "");
    }

    Result = Result.replaceAll(":", "").replaceAll("<" + GetMessageSender(Line) + ">", "").replaceAll("[]", "").replaceAll(/^\s+|\s+$/g, "");
    return Result;
}

const isMessage = (Line) => {
    let MatchResult = /\<(.+?)\>/.exec(Line);
    if (MatchResult !== null) {
        if (MatchResult[1] !== "null" && MatchResult[1].indexOf("init") === -1) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const GetMessageObject = (Line, CurrentLogFileDate, Source = "default") => {

    let MessageObject = {
        "Sender": GetMessageSender(Line),
        "Time": Date.parse(new Date(`${CurrentLogFileDate} ${GetMessageTime(Line)}`)),
        "Content": GetMessageContent(Line)
    };

    if (Source === "default") {
        return MessageObject;
    } else {
        MessageObject.Source = Source;
        return MessageObject;
    }
}

const GetContent = (buffer)=>{
    if(buffer.toString("utf-8").indexOf("�") !== -1){
        return Encoding.decode(buffer,"GB18030");
    }else{
        return buffer.toString("utf-8");
    }
}

let FinalResult = new Array();

if (EnableSingleServerMode) {

    const AllLogFileList = FileSystem.readdirSync(`${__dirname}/source/`,{withFileTypes: true});

    let LogFileList = new Array();

    for(let i=0;i<AllLogFileList.length;i++){
        if(AllLogFileList[i].isFile()){
            LogFileList.push(AllLogFileList[i].name);
        }
    }

    for (let i = 0; i < LogFileList.length; i++) {
        if (LogFileList[i].length === 16 && LogFileContent[i].indexOf(".log") !== -1) {
            let CurrentLogFileDate = `${LogFileList[i].substring(0, 4)}/${LogFileList[i].substring(5, 7)}/${LogFileList[i].substring(8, 10)}`;
            let CurrentLogFileContentArray = GetContent(FileSystem.readFileSync(`${__dirname}/source/${LogFileList[i]}`)).split(/\r?\n/);
            for (let j = 0; j < CurrentLogFileContentArray.length; j++) {
                if (isMessage(CurrentLogFileContentArray[j])) {
                    FinalResult.push(GetMessageObject(CurrentLogFileContentArray[j], CurrentLogFileDate));
                }
            }
        }
    }
} else {
    const AllFileList = FileSystem.readdirSync(`${__dirname}/source/`, { withFileTypes: true });

    let FolderList = new Array();

    for (let i = 0; i < AllFileList.length; i++) {
        if (AllFileList[i].isDirectory()) {
            FolderList.push(AllFileList[i].name);
        }
    }

    for (let i = 0; i < FolderList.length; i++) {

        const CurrentFolderAllLogFileList = FileSystem.readdirSync(`${__dirname}/source/${FolderList[i]}/`, { withFileTypes: true });

        let CurrentFolderLogFileList = new Array();

        for (let n = 0; n < CurrentFolderAllLogFileList.length; n++) {
            if (CurrentFolderAllLogFileList[n].isFile()) {
                CurrentFolderLogFileList.push(CurrentFolderAllLogFileList[n].name);
            }
        }

        for (let j = 0; j < CurrentFolderLogFileList.length; j++) {
            if (CurrentFolderLogFileList[j].length === 16 && CurrentFolderLogFileList[j].indexOf(".log") !== -1) {
                let CurrentLogFileDate = `${CurrentFolderLogFileList[j].substring(0, 4)}/${CurrentFolderLogFileList[j].substring(5, 7)}/${CurrentFolderLogFileList[j].substring(8, 10)}`;
                let CurrentLogFileContentArray = GetContent(FileSystem.readFileSync(`${__dirname}/source/${FolderList[i]}/${CurrentFolderLogFileList[j]}`)).split(/\r?\n/);
                for (let k = 0; k < CurrentLogFileContentArray.length; k++) {
                    if (isMessage(CurrentLogFileContentArray[k])) {
                        FinalResult.push(GetMessageObject(CurrentLogFileContentArray[k], CurrentLogFileDate, FolderList[i]));
                    }
                }
            }

        }
    }
}

FileSystem.writeFileSync(`${__dirname}/output/output.json`, JSON.stringify(FinalResult));