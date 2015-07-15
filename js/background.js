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
			// Trying get yesterday data 
			var yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			
			data = localStorage.getObj(formatDate(yesterday));
			
			if(data) {
				sendResponse(data);
			} else {
				// Trying get beforeYesterday data
				var beforeYesterday = new Date();
				beforeYesterday.setDate(beforeYesterday.getDate() - 2);
				
				data = localStorage.getObj(formatDate(beforeYesterday));
				
				sendResponse(data);
			}
		}
	}
});