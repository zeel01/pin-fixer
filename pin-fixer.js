

Hooks.on("canvasPan", (canvas, pan) => {
	function mapRange(from, to, s) {
		return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
	};

	const reciprocal = 1 / pan.scale;
	const clamped = Math.clamped(pan.scale, .5, 3);
	const mapped = mapRange([.5, 3], [.75, 2], clamped);
	
	const scale = reciprocal * mapped;// mapRange([.33, 10], [.75, 2], reciprocal);

	canvas.notes.objects.children.forEach(note => {
		note.transform.scale.x = scale;
		note.transform.scale.y = scale;
	});
	document.getElementById("pin-cushion-hud").style.transform = `scale(${scale})`;
//	document.getElementById("poi-tp-ctx-menu").style.transform = `scale(${scale})`;
})