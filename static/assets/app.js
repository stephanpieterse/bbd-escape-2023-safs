function getAuthHeader() {
    var username = $('#input_name').val();
    var password = $('#input_password').val();
    return "Basic " + btoa(username + ":" + password);
}

$('#input_name').on('keyup', function () {
    $('#input_name').val($('#input_name').val().replace(/[^a-z]/gi, ''));
});

$('#input_number').on('keyup', function () {
    $('#input_number').val(parseInt($('#input_number').val().replace(/[^0-9]/gi, '')) || 0);
});

$('#button_submit').on('click', function () {

    var sendDataObject = JSON.stringify({
        name: $('#input_name').val(),
        number: $('#input_number').val()
    });

    $.ajax({
        "method": "POST",
        "url": "/api/stats",
        "headers": {
            Authorization: getAuthHeader()
        },
        "contentType": "application/json",
        "data": sendDataObject
    }).then(function (data) {
        $("#section_output_stats").text("");
        for (let d in data) {
            let elem = $('<div></div>').text(d + " : " + data[d]);
            $("#section_output_stats").append(elem);
        }
    }).catch(function (e) {
        console.log(e);
        $("#section_output_stats").text(JSON.stringify(e));
    });

    $.ajax({
        "method": "GET",
        "url": "/api/lastqueries",
        "headers": {
            Authorization: getAuthHeader()
        }
    }).then(function (data) {
        $("#section_output_lastqueries").text("");
        console.log(data);
        var rows = data;
        for (let r in rows) {
            let query = JSON.parse(rows[r].query);
            let elem = $('<div></div>').text("Name: " + query.na + " , Number: " + query.nu);
            $("#section_output_lastqueries").append(elem);
        }
    }).catch(function (e) {
        console.log(e);
        $("#section_output_lastqueries").text(JSON.stringify(e));
    });
});
