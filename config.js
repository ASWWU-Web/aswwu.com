
var config = {
	title: "ASWWU",
	description: "the Associated Student Body of Walla Walla University",
	favicon: "images/mask_unknown.png",
	server: "http://127.0.0.1:8888/",
	// server: "https://aswwu.com/server/",
	files: {
		js: [
			"static/js/navigation.js",
			"static/js/profile.js",
			"static/js/volunteer.js",
      "static/js/forms.js",
			"static/js/fields.js"
		],
		css: [
			"static/css/navigation.css",
			"static/css/profile.css",
			"static/css/spinner.css",
			"static/css/general.css"
		]
	},
	defaults: {
    collegianURL: "https://aswwu.com/c_archives/",
		profilePhoto: "images/mask_unknown.png",
		mediaURL: "https://aswwu.com/media/",
		uploadPath: "uploads/",
		year: 1617
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
