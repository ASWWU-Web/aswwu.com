
var config = {
	title: "ASWWU",
	description: "the Associated Student Body of Walla Walla University",
	favicon: "images/mask_unknown.png",
	server: "/aswwu-server/",
	files: {
		js: [
			"static/js/navigation.js",
			"static/js/profile.js",
			"static/js/fields.js"
			// "static/js/upload.js"
		],
		css: [
			"static/css/navigation.css",
			"static/css/profile.css",
			"static/css/spinner.css",
			"static/css/general.css"
		]
	},
	defaults: {
		profilePhoto: "images/mask_unknown.png",
		mediaURL: "https://aswwu.com/media/",
		uploadPath: "uploads/",
		year: 1516
	},
};
config.favicon = config.defaults.mediaURL+"img-xs/"+config.favicon;
config.mu = {
	xs: config.defaults.mediaURL+"img-xs/",
	sm: config.defaults.mediaURL+"img-sm/",
	md: config.defaults.mediaURL+"img-md/",
	lg: config.defaults.mediaURL+"img-lg/",
	xl: config.defaults.mediaURL,
	bg: config.defaults.mediaURL+"background.php"
}
