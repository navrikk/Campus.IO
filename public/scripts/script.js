$(document).ready(function () {
	setTimeout(function() {
	    $(".alert").alert("close");
	}, 3000);
});

function showSupportDetails() {
	$("#supportDetails").attr("hidden", false);
}

function hideSupportDetails() {
	$("#supportDetails").attr("hidden", true);
}