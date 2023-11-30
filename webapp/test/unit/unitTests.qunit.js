/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com.ibm.zpurchase08/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
