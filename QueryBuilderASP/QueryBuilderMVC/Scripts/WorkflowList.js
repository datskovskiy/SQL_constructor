$(function() {

    $(".portlet")
      .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
        .find(".portlet-header")
        .addClass("ui-widget-header ui-corner-all")
        .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

    $(".nonSortable")
      .addClass(" ui-widget-content ui-helper-clearfix ui-corner-all")
        .find(".portlet-header")
        .addClass("ui-widget-header ui-corner-all")

    $(".viewDialogDelete")
        .prepend("<span class='iconHeaderDelete iconHeader portlet-2'></span>");

    $(".portlet")
           .find(".viewDialogEdit")
               .prepend("<span class='iconHeaderEdit iconHeader portlet-3'></span>");

      $(".portlet-toggle").click(function () {
                var icon = $(this);
                icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
                icon.closest(".portlet").find(".portlet-content").toggle();
            });
});


function get_cookie(cookie_name) {
    var result = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
    if (result) {
        return (unescape(result[2]));
    }
    else {
        return null;
    }
};
function set_blocks(id) {
    var right = get_cookie("sort_right" + id);
    var left = get_cookie("sort_left" + id);
    var pattern = /(id=[0-9])/gmi;
    while ((array = pattern.exec(left)) != null) {
        var result = array[0];
        result += pattern.lastIndex;
        var s = "#" + array[0];
        var ss = s.replace(/=/, "_")
        $(".column_left").append($(ss));

    }
    while ((array = pattern.exec(right)) != null) {
        var result = array[0];
        result += pattern.lastIndex;
        var s = "#" + array[0];
        console.log(s);
        var ss = s.replace(/=/, "_")
        console.log(ss);
        $(".column_right").append($(ss));

    }
};

function AjaxPostWithDialog2(url) {
    $.ajax({
        url: url,
        type: "POST",
        data: $('form').serialize(),
        datatype: "json",
        success: function (result) {
            $("#dialogContent").html(result);
        }
    });
};

function ModalPostDialogSend(selector, url) {
    $(selector).on("click", function (e) {
        e.preventDefault();
        $("<div id='dialogContent'></div>")
            .addClass("dialog")
            .appendTo("body")
            .load(this.href)
            .dialog({
                title: $(this).attr("data-dialog-title"),
                close: function () { $(this).remove() },
                modal: true,
                success: {
                    "": function () {
                        AjaxPostWithDialog2(url);
                    }
                }
            }
            );
    });
};

function SetGetWindow(id) {
    $(".column").sortable(
        {
            connectWith: ".column",
            handle: ".portlet-header",
            cancel: ".portlet-toggle",
            placeholder: "portlet-placeholder ui-corner-all",
            update: function (event, ui) {
                var sort_right = $('.column_right').sortable('serialize', { key: 'id' });
                var sort_left = $('.column').sortable('serialize', { key: 'id' });
                document.cookie = "sort_right" + id + "= " + sort_right;
                document.cookie = "sort_left" + id + "= " + sort_left;
            }

        });

    var x = get_cookie("sort_left" + id);
    set_blocks(id);

};