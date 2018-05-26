// Spinner jQuery
$(document).ready(function() {
	//Preloader
	$(window).on("load", function() {
		preloaderFadeOutTime = 500;
		function hidePreloader() {
			var preloader = $('.spinner-wrapper');
			preloader.fadeOut(preloaderFadeOutTime);
		}
		hidePreloader();
	});
});

$(document).ready(function () {
	setTimeout(function() {
	    $(".alert").alert("close");
	}, 3000);
	
	$("#oopGraph").toggle();
    $("#dsGraph").toggle();
    $("#dbsGraph").toggle();
    $("#nwGraph").toggle();
    $("#osGraph").toggle();
    $("#aptGraph").toggle();

	if (document.URL.search("leaderboard")) {
		if (document.getElementById("categoryDiv") !== null) {
			var button = document.getElementById(document.getElementById("categoryDiv").innerHTML);
			button.classList.add("active");
		}
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

function toggleGraph(id) {
	$("#" + id).toggle("slow", "swing", function() {
	});
}

// Add slideDown animation to Bootstrap dropdown when expanding.
$('.dropdown').on('show.bs.dropdown', function() {
	$(this).find('.dropdown-menu').first().stop(true, true).slideDown();
});

// Add slideUp animation to Bootstrap dropdown when collapsing.
$('.dropdown').on('hide.bs.dropdown', function() {
	$(this).find('.dropdown-menu').first().stop(true, true).slideUp();
});