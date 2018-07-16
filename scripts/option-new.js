(function ($) {
    $(function () {
        hookEventHandlers($);
    });
})(jQuery)

function hookEventHandlers($) {
    groupModalSetup($);
    //extensionModalSetup($);
}

function groupModalSetup($) {
    $(".add-group").click(() => {
        $(".new-extension-form")
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