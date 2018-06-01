
var globalContext = {
    groupMap: {},
    port: {}
};

$(function () {

    initPort();
    loadGroups();
    $("#save").click(function () {6
        var groupName = $("#groupname").val().trim();
        var groupDirectory = $("#directory").val().trim();
        var groupExtensions = $("#extensions").val().trim();

        if (groupName.length == 0 || groupDirectory.length == 0 || groupExtensions.length == 0) {
            alert("Please provide all details");
            return;
        }

        var group = new Group({
            groupName: groupName,
            directory: groupDirectory,
            extensionList: groupExtensions.split(",")
        });

        globalContext.port.postMessage({ command: "add-new-group", data: group });
    });
});

function initPort() {
    globalContext.port = chrome.runtime.connect({ name: "conn" });
    globalContext.port.onMessage.addListener(function (msg) {
        routeMessage(msg);
    });
}

function routeMessage(msg) {
    switch (msg.command) {
        case "get-loaded-groups": {
            console.log(msg.data);
            console.log("loaded group response");
            globalContext.groupMap = new GroupMap({ groupObjects: msg.data.groups });
            renderGroups(globalContext.groupMap);
            hookEventHandlers();
            break;
        }
        case "delete-group": {
            console.log("Group deleted " + msg.data);
            break;
        }
        case "delete-group-extension": {
            if (msg.data.status) {
                $("div[data-dm-groupname='" + msg.data.group.groupName + "'] a[data-dm-ext='" + msg.data.ext + "']").remove();
            }
            break;
        }
        case "add-group-extension": {
            if (msg.data.status) {
                var btn = extensionToButton(msg.data.ext);
                group = globalContext.groupMap.search(msg.data.ext);
                $("div[data-dm-groupname='" + group.groupName + "'] div:nth-child(2)").append(btn);
            }
            hookEventHandlers();
            break;
        }
        case "add-new-group": {
            if (!msg.data.status) {
                alert(msg.data.statusMsg);
                return;
            }

            var group = new Group(msg.data.group);
            globalContext.groupMap.addGroup(group);
            appendTableRows(renderGroupsToTableRow(group));
            hookEventHandlers();
            break;
        }
        default: {
            console.log("Unknown command: " + msg.command);
        }
    }
}

function renderGroups(groupMap) {
    var rows = groupMap.render(renderGroupsToTableRow);
    appendTableRows(rows);
}

function appendTableRows(rows) {
    $("#groups").append(rows);
}

function loadGroups() {
    console.log("Load groups command sent");
    globalContext.port.postMessage({ "command": "get-loaded-groups" });
}

function renderGroupsToTableRow(item, index) {
    var row = $("<div class='divTableRow'></div>")
    row.attr("data-dm-groupname", item.groupName);
    var name = $("<div class='divTableCell'></div>").append(item.groupName);
    var ext = $("<div class='divTableCell'></div>").append(item.extensions(extensionToButton));
    var dir = $("<div class='divTableCell'></div>").append(item.directory);
    var act = $("<div class='divTableCell'></div>")
        .append(addExtensionButton(item.groupName))
        //.append(editGroupButton(item.groupName))
        .append(deleteGroupButton(item.groupName));

    row.append(name)
        .append(ext)
        .append(dir)
        .append(act);
    return row;
}

function extensionToButton(ext) {
    var btn = $('<a href="#" class="btn btn-default btn-sm" ></a>');
    btn.attr("data-dm-ext", ext);
    btn.append(ext);
    btn.append('<span class="glyphicon glyphicon-remove btn-space"></span>');
    return btn;

}

function editGroupButton(groupName)  {
    var btn = $('<a href="#" class="btn btn-default btn-sm" data-dm-act="edit"></a>');
    btn.attr("data-dm-groupname", groupName);
    btn.append('<span class="glyphicon glyphicon-pencil btn-space"></span>');
    btn.append("Edit Group");
    return btn;

}

function deleteGroupButton(groupName) {
    var btn = $('<a href="#" class="btn btn-default btn-sm" data-dm-act="delg"></a>');
    btn.attr("data-dm-groupname", groupName);
    btn.append('<span class="glyphicon glyphicon-minus btn-space"></span>');
    btn.append("Delete Group");
    return btn;
}

function addExtensionButton(groupName) {
    var btn = $('<a href="#" class="btn btn-default btn-sm" data-dm-act="adde"></a>');
    btn.attr("data-dm-groupname", groupName);
    btn.append('<span class="glyphicon glyphicon-plus btn-space"></span>');
    btn.append("Add Extension");
    return btn;
}

function hookEventHandlers() {
    $("a[data-dm-act='adde']").click(function (event) {
        var ext = prompt("Extension suffix", "").trim();
        if (ext.length < 3) {
            return;
        }

        var groupName = this.getAttribute("data-dm-groupname");
        var group = globalContext.groupMap.findGroup(groupName);
        if (group == undefined) {
            return;
        }

        if (group.addExtension(ext)) {
            globalContext.port.postMessage({ command: "add-group-extension", data: { group: group, ext: ext } });
        }else {
            alert("Group already contains extension");
        }
    });

    $("a[data-dm-act='delg']").click(function () {
        var groupName = this.getAttribute("data-dm-groupname");
        globalContext.port.postMessage({ command: "delete-group", data: groupName });
        globalContext.groupMap.deleteGroup({ groupName: this.id });
        $(this).parent().parent().remove();
    });

    $("a[data-dm-ext]").click(function () {
        var target = $(this);
        var groupName = target.parent().parent().attr("data-dm-groupname");

        var group = globalContext.groupMap.findGroup(groupName);
        if (group == undefined) {
            return;
        }

        if (group.removeExtension(target.attr("data-dm-ext"))) {
            globalContext.port.postMessage({ command: "delete-group-extension", data: { group: group, ext: target.attr("data-dm-ext") } });
        }
        else {
            alert("Last extension can't be removed, try deleting group instead");
        };
    });

    $("a[data-dm-act='edit']").click(function () {
        var groupName = this.getAttribute("data-dm-groupname");
        //display modal form with data 
        //respond to modal form event 
        //update ui 
        //post message to server 

        globalContext.port.postMessage({ command: "delete-group", data: groupName });
        globalContext.groupMap.deleteGroup({ groupName: this.id });
        $(this).parent().parent().remove();
    });
}