function update2(e) {
	var htmlContent = [
		'<!doctype html>', '<html>', '<head>', '<style>body { background: white; } .pjs-meta { color: #fff; } canvas { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }</style>', '<link rel="stylesheet" type="text/css" href="css/s.css">', '<script src="js/require.js"></script>', '</head>', '<body>', '<script src="js/j.js"></script>', '<canvas id="viewport" width="100%" height="100%" tabindex="0"></canvas>', '</body></html>'
	].join('\n');

	var display = document.getElementById("display");
	// remove previous display
	if (display.children.length > 0) {
		display.removeChild(display.firstChild);
	}

	var iframe = document.createElement('iframe');
	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.style.border = '0';
	display.appendChild(iframe);

	var content = iframe.contentDocument || iframe.contentWindow.document;

	content.open();
	content.write(htmlContent);
	content.close();
	
	iframe.focus();

}