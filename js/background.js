chrome.runtime.onInstalled.addListener(function() {
	chrome.alarms.create("cantareira-config", { delayInMinutes: 0, periodInMinutes: 59 });
	
	// Getting information for 2 days ago
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	
	var beforeYesterday = new Date();
	beforeYesterday.setDate(beforeYesterday.getDate() - 2);
	
	// Yesterday
	getApiInformations(formatDate(yesterday), function(data) {
		if(isConsistent(data)) {
	 	 	localStorage.setObj(formatDate(yesterday), data);
		}
	});

	// Before Yesterday
	getApiInformations(formatDate(beforeYesterday), function(data) {
		if(isConsistent(data)) {
	 	 	localStorage.setObj(formatDate(beforeYesterday), data);
		}
	});
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	getApiInformations(null, function(data) {
		if(isConsistent(data)) {
			var dataYesterday = getDataFromYesterday(), nivelCantareiraOntem = null, 
			nivelCatareiraAgora = null, mensagemData = localStorage.getItem("mensagemData");
			
			for(var a in data) {
				if(data[a].name == "Cantareira") {
					nivelCatareiraAgora = data[a].data.volume_armazenado;
					
					nivelCatareiraAgora = parseFloat(
						nivelCatareiraAgora.replace("%", "").replace(",", "."));
				}
			}
			
			for(var b in dataYesterday) {
				if(dataYesterday[b].name == "Cantareira") {
					nivelCantareiraOntem = dataYesterday[b].data.volume_armazenado;
					nivelCantareiraOntem = parseFloat(
						nivelCantareiraOntem.replace("%", "").replace(",", "."));
				}
			}
			
			if(nivelCantareiraOntem < nivelCatareiraAgora && mensagemData != today()) {
				show("O nível da Cantareira subiu!!!", "De [ " + nivelCantareiraOntem + " ] para [ " + nivelCatareiraAgora + " ]");
				
				localStorage.setItem("mensagemData", today());
			}
			
	 	 	localStorage.setObj(today(), data);
		}
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === "get-informations") {
		var data = localStorage.getObj(today());
		
		if(data) {
			sendResponse(data);
		} else {
			data = getDataFromYesterday();
			
			if(data) {
				sendResponse(data);
			} else {
				sendResponse(getDataFromBeforeYesterday());
			}
		}
	}
});
