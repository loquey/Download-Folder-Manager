(function ($) {

    $(function () {
        hookEventHandlers($);
    });

})(jQuery)

function hookEventHandlers($) {
    $(".add-group").click(() => {
        $(".new-group-form").modal("show");
    })
}