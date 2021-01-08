const { response } = require("express")

$(document).ready(function () {
    $('form').submit(function (event) {
        event.preventDefault
        var Form_Data = $(this).serialize()
        $.ajax({
            url: '/u/comment',
            method: 'post',
            data: Form_Data,
            dataType: 'json',
            success: (response) => {

                $('#comDiv').addClass('has-error')
                $('#comdiv').append('<div id="comments" class="mx-auto"> <div> < i class= "fa fa-user float-left " ></i > <h5 class="">' + Form_Data + '</h5> </div><div> <p class="ml-4"> </p></div> <hr>')
                $("#message").fadeIn(3000);
                $('#message').addClass('has-error')
                $('#message').append('<div class="help-block" >' + 'shared' + '</div>')
                var delay = 3000
                setTimeout(function () {
                    $("#message").fadeOut(3000);
                    console.log('fine')



                }, delay)
            }
        })
    })
})
$('form').submit(function () {
    $('#message').removeClass('has-error');
    $('.help-block').remove();
})