APIFactory.initAPI();

var globalContext = {
    groupMap: {},
    port: {}
};



(function ($) {
    $(function () {
        initPort();
        loadGroups();
        //hookEventHandlers($);
    });
})(jQuery)

function initPort() {
    globalContext.port = chrome.runtime.connect({ name: "conn" });
    globalContext.port.onMessage.addListener(function (msg) {
        routeMessage(msg);
    });
}

function loadGroups() {
    console.log("Load groups command sent");
    globalContext.port.postMessage({ "command": "get-loaded-groups" });
}

function hookEventHandlers($) {
    groupModalSetup($);
    //extensionModalSetup($);
}

function renderGroups(groupMap) {
    var rows = groupMap.render(renderGroupsToTableRow);
    appendTableRows(rows);
}

function renderGroupsToTableRow(item, index) {
    return `
        <div class="ui  segments">
            <div class="ui top attached block header">
                <i class="object group icon"></i>
                ${item.groupName}
                <i class="object group icon"></i>
            </div>
            <div class="ui segment">
                <a class="ui blue right bottom right attached label no-lower-right">
                    <i class="right plus circle icon"></i>
                    Add Extension
                </a>
                ${item.extensions(extensionToButton).join("")}
            </div>
            <div class="ui bottom attached block header">
                <i class="folder icon"></i>
                ${item.directory}
            </div>
        </div>`;

    // var row = $("<div class='divTableRow'></div>")
    // row.attr("data-dm-groupname", item.groupName);
    // var name = $("<div class='divTableCell'></div>").append(item.groupName);
    // var ext = $("<div class='divTableCell'></div>").append(item.extensions(extensionToButton));
    // var dir = $("<div class='divTableCell'></div>").append(item.directory);
    // var act = $("<div class='divTableCell'></div>")
    //     .append(addExtensionButton(item.groupName))
    //     //.append(editGroupButton(item.groupName))
    //     .append(deleteGroupButton(item.groupName));

    // row.append(name)
    //     .append(ext)
    //     .append(dir)
    //     .append(act);
    // return row;
}

function extensionToButton(ext) {
    return `
        <div class="ui label row-spacing">
            ${ext}
            <i class="close icon"></i>
        </div>`;
    // var btn = $('<a href="#" class="btn btn-default btn-sm" ></a>');
    // btn.attr("data-dm-ext", ext);
    // btn.append(ext);
    // btn.append('<span class="glyphicon glyphicon-remove btn-space"></span>');
    // return btn;
}

function appendTableRows(rows) {
    $(".group-list").append(rows);
}

function routeMessage(msg) {
    switch (msg.command) {
        case "get-loaded-groups": {
            console.log(msg.data);
            console.log("loaded group response");
            globalContext.groupMap = APIFactory.groupMapFactory({ groupObjects: msg.data });
            console.log(globalContext.groupMap);
            renderGroups(globalContext.groupMap);
            //hookEventHandlers();
            break;
        }
        case "delete-group": {
            console.log("Group deleted " + msg.data);
            break;
        }
        case "delete-group-extension": {
            console.log(`Extension deleted response ${msg.data.status}`);
            console.log(msg);
            if (msg.data.status) {
                $(`div[data-dm-groupname='${msg.data.group.groupName}'] a[data-dm-ext='${msg.data.ext}']`).remove();
            }
            break;
        }
        case "add-group-extension": {
            console.log(msg);
            if (msg.data.status) {
                var btn = extensionToButton(msg.data.ext);
                $(`div[data-dm-groupname='${msg.data.group.groupName}'] div:nth-child(2)`).append(btn);
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

function groupModalSetup($) {
    $(".add-group").click(() => {
        $(".new-group-form")
            .modal({
                closable: false,
                onDeny: () => {
                    // clear form field
                },
                onApprove: () => {
                    //approved function call here
                },
                transition: 'fade up'
            })
            .modal("show");
    });
}

function extensionModalSetup($) {
    $(".add-group").click(() => {
        $(".new-group-form")
            .modal({
                closable: false,
                onDeny: () => {
                    // clear form field
                },
                onApprove: () => {
                    //approved function call here
                },
                transition: 'fade up'
            })
            .modal("show");
    });
}