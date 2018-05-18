$(document).ready(function () {
	setTimeout(function() {
	    $(".alert").alert("close");
	}, 3000);
	if (document.URL.search("/user/leaderboard")) {
		var button = document.getElementById(document.getElementById("categoryDiv").innerHTML);
		button.classList.add("active");
	}
});

$("#myMessage").keypress(function (e) {
    if(e.which == 13 && !e.shiftKey) {        
        $(this).closest("form").submit();
        e.preventDefault();
        return false;
    }
});

function showSupportDetails() {
	$("#supportDetails").attr("hidden", false);
}

function hideSupportDetails() {
	$("#supportDetails").attr("hidden", true);
}