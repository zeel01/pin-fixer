

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

Hooks.on("renderSceneConfig", (sceneConfig, html, data) => {
	const template = `
		<hr>
		<h3 class="form-header"><i class="fas fa-bookmark"></i> ${game.i18n.localize("pinfix.title")}</h3>
		<p class="notes">${game.i18n.localize("pinfix.description")}</p>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.enable.name")}</label>
			<input type="checkbox" name="flags.pinfix.enable" data-dtype="Boolean" ${data.entity.flags.pinfix?.enable ? "checked":""}>
			<p class="notes">${game.i18n.localize("pinfix.enable.desc")}</p>
		</div>`;
	html.find(".scroll").append(template);
});