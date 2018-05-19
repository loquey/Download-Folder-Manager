var defaultGroups = {
    "Documents": [
        "pdf", "xls", "doc", "docx", "xlsx", "rtf"
    ],
    "Programs": [
        "exe", "msi"
    ],
    "Music": [
        "mp3", 'm4a', "wav", "wma", "flac", "ogg"
    ],
    "Compressed": [
        "zip", "7z", "rar", "lzo", "lzma", "tar", "gz", "bz"
    ],
    "Pictures": [
        "png", "bmp", "jpg", "jpeg", "tiff", "gif", "tif", "jpe", "jfif", "dib"
    ]
};

var groupMap = null;

chrome.runtime.onStartup.addListener(function () {
    if (groupMap != null)
        return;

    groupMap = new groupMap();
    groupMap.load();
});

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
    var ext = extractExtension(downloadItem.filename);
    var group = groupMap.search(ext);
    suggest({ "filename": group.directory + "/" + downloadItem.filename, "conflictAction": "uniquify" });
});

function extractExtension(filename) {
    return filename.substr(filename.lastIndexOf(".") + 1);
}

chrome.runtime.onInstalled.addListener(function () {
    //TODO: Check the reason for installation and act accordingly
    var newGroups = [];
    for (const key in defaultGroups) {
        var group = new Group({ groupName: key, directory: key, extensionList: defaultGroups[key] });
        newGroups.push(group);
    }

    groupMap = new GroupMap({ groupTypes: newGroups });
    groupMap.save();
});

var port = null;
chrome.runtime.onConnect.addListener(function (requestPort) {
    port = requestPort;
    port.onMessage.addListener(handleMessages);
});

function handleMessages(msg) {
    if (port == null)
        return;

    switch (msg.command) {
        case "get-loaded-groups": {
            port.postMessage({ command: msg.command, data: groupMap });
            break;
        }
        case "delete-group": {
            groupMap.deleteGroup({ groupName: msg.data });
            groupMap.save();
            port.postMessage({ command: msg.command, data: msg.data })
            break;
        }
        case "delete-group-extension": {
            // var group = new Group(msg.data.group);
            // groupMap.replaceGroup(group.groupName, group);
            // groupMap.save();
            // port.postMessage({ command: msg.command, data: { status: true, ext: msg.data.ext } })
            // break;
        }
        case "add-group-extension" : {
            var group = new Group(msg.data.group);
            groupMap.replaceGroup(group.groupName, group);
            groupMap.save();
            port.postMessage({ command: msg.command, data: { status: true, ext: msg.data.ext } })
            break;
        }
        case "add-new-group": {
            //conver to group object 
            var group = new Group(msg.data);
            var status = true;
            var statusMsg = "New group added successfully ";

            if (!groupMap.addGroup(group)) {
                status = false;
                statusMsg = "Duplicate group found";
            }

            groupMap.save();
            port.postMessage({ command: "add-new-group", data: { status: status, statusMsg: statusMsg, group: group } });
            break;
        }
        default: {
            console.log("Unknown command: " + msg.command);
        }
    }
}