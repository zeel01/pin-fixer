Hooks.on("canvasPan", (canvas, pan) => {
	canvas.notes.objects.children.forEach(note => {
		note.transform.scale.x = 1 / pan.scale;
		note.transform.scale.y = 1 / pan.scale;
	});
})