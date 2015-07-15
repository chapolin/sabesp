const WRONG_VALUES = "0,0%,0 %,0,0 %,00%,00,0%,00,0 %";
var urlApi = "https://sabesp-api.herokuapp.com/v2/";

var getApiInformations = function(date, callbackApi) {
	doAjaxHC(urlApi + (date ? date : ""), function(data, status) {
		callbackApi(data);
	}, function(error) {
		handleAjaxErrors(error, "Get api informations");

		callbackApi(null);
	});
};

var doAjaxHC = function(address, callback, callbackError) {
	$.get(address, function(data, status){
		callback(data, status);
	}).fail(function(error) {
		callbackError(error);
	});
};

var buildGlasses = function(data) {
	var template = $(".place-holder").clone();

	$(".place-holder").html("");

	// Just verify data information and correct format percent values
	for(var i in data) {
		var regExp = new RegExp("(\-?\\d+,?(\\d+)?\\s*\%)"),
			retorno = regExp.exec(data[i].data.volume_armazenado), value = "0";

		if(retorno && retorno.length > 1 && retorno[1].length <= 9) {
			value = retorno[1];
		}

		var percent = value.replace("%", "").replace(" ", "");

		data[i].data.volume_armazenado = percent;
	}

	data.sort(orderDataASC);

	for(var i in data) {
		var actualTemplate = $(template).clone(),
				percent = data[i].data.volume_armazenado;

		$(actualTemplate).find(".manancial").removeClass("template");
		$(actualTemplate).find(".percent").html(percent + "%");
		$(actualTemplate).find(".nome-manancial").html(data[i].name);
		$(actualTemplate).find(".da-water").attr("rel", "manancial-" + (parseInt(i) + 1));

		$(".place-holder").append($(actualTemplate).html());

		loadWater(parseInt(i) + 1, parseInt(percent));
	}

	$(".last-update").html(formatToBrazilianDate(today(), "/"));
};

var loadWater = function(i, percent) {
	setTimeout(function() {
		$("[rel=manancial-" + i + "]").css("height", percent + "%");
	}, Math.random() * 1000);
};

function handleAjaxErrors(error, origin) {
	//
}

function show(title, text, tag) {
	if (window.Notification) {
		var notification = new Notification(title, {
			icon: "images/health-check-48-warning.png",
			body: text,
			tag: tag
		});

		notification.onclose = verifyWhenNotificationClose;
	}
}

function verifyWhenNotificationClose(a, b, c) {
	//console.log(a, b, c);
}

Storage.prototype.setObj = function(key, obj) {
	return this.setItem(key, JSON.stringify(obj));
};

Storage.prototype.getObj = function(key) {
	return JSON.parse(this.getItem(key));
};

Storage.prototype.getAllKeys = function() {
    var archive = {},
        keys = Object.keys(localStorage);

    for (var i = 0; i < keys.length; i++) {
    	archive[keys[i]] = localStorage.getObj(keys[i]);
    }

    return archive;
};

var today = function() {
	var date = new Date();

	return formatDate(date);
};

var formatDate = function(date) {
	var day = (date.getDate() < 9 ? "0" : "") + date.getDate(),
	month = (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1);
	year = date.getFullYear();

	return year + "-" + month + "-" + day;
};

// YYYY-MM-DD
var formatToBrazilianDate = function(stringDate, sep) {
	var arrDate = stringDate.split("-");

	return arrDate[2] +  sep + arrDate[1] + sep + arrDate[0];
};

var orderDataASC = function (a, b) {
	if (a.data.volume_armazenado > b.data.volume_armazenado) {
		return 1;
	} else if (a.data.volume_armazenado < b.data.volume_armazenado) {
		return -1;
	}

	return 0;
};

var isConsistent = function(data) {
	var log = new Logger("actions.js:isConsistent");

	if(!data || data.length === 0) {
		return false;
	}

	for(var i in data) {
		if(!data[i].name || !data[i].data.volume_armazenado ||
				WRONG_VALUES.indexOf(data[i].data.volume_armazenado) != -1) {
			log.warning("Name: ");
			log.warning(data[i].name);

			log.warning("Volume Armazenado: ");
			log.warning(data[i].data.volume_armazenado);

			return false;
		}
	}

	return true;
};

var buildMananciais = function() {
	$(".botoes div").removeClass("ativo");
	$(".botoes div:eq(0)").addClass("ativo");

	$(".content-place-holder").show();
	$("#graph").hide();
};

var buildGraph = function() {
	var dados = localStorage.getAllKeys();
	var dias = [];
	var data = [];
	var finalData = [];

	for(var dia in dados) {
		dias.push(formatToBrazilianDate(dia, "."));

		for(var i in dados[dia]) {
			if(data[dados[dia][i].name] == undefined) {
				data[dados[dia][i].name] = {
					name: dados[dia][i].name
				};
			}

			if(data[dados[dia][i].name].data == undefined) {
				data[dados[dia][i].name].data = [];
			}

			var regExp = new RegExp("(\-?\\d+,?(\\d+)?\\s*\%)"),
					retorno = regExp.exec(dados[dia][i].data.volume_armazenado),
					value = "0";

			if(retorno && retorno.length > 1 && retorno[1].length <= 9) {
				value = retorno[1];
			}

			var percent = value.replace(" %", "").replace(",", ".");

			if(!isNaN(percent)) {
				data[dados[dia][i].name].data.push(parseFloat(percent));
			}
		}
	}

	for(var j in data) {
		finalData.push({
			name: data[j].name,
			data: data[j].data
		});
	}

	$(".botoes div").removeClass("ativo");
	$(".botoes div:eq(1)").addClass("ativo");

	$(".content-place-holder").hide();

    $("#graph").show().highcharts({
    	chart: {
    		height: 289
    	},
        title: {
            text: 'Sistema Cantareira'
        },
        xAxis: {
            categories: dias,
            labels: {
                formatter: function () {
                    return this.value; // clean, unformatted number for year
                }
            }
        },
        yAxis: {
            title: {
                text: 'Níveis anteriores dos mananciais'
            },
            labels: {
                formatter: function () {
                    return this.value / 1 + '%';
                }
            }
        },
        tooltip: {
            pointFormat: 'Nível {series.name} <b>{point.y:,.2f}%</b>'
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: finalData
    });
};
