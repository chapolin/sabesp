var Logger = function(label) {
	this.label = label;
}

Logger.prototype.error = function(str) {
	console.error("Error::", this.label + ":", str);
};

Logger.prototype.warning = function(str) {
	console.warn("Warning::", this.label + ":", str);
};

Logger.prototype.info = function(str) {
	console.info("Info::" + this.label, ":", str);
};