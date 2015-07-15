function sendMessage() {
	chrome.runtime.sendMessage({
		action : "get-informations"
	}, function(response) {
		if (response) {
			buildGlasses(response);
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
	sendMessage();
	
	$(".botoes div:eq(0)").click(buildMananciais);
	$(".botoes div:eq(1)").click(buildGraph);
});