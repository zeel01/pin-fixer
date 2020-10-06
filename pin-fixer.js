

Hooks.on("canvasPan", (canvas, pan) => {
	const flags = canvas.scene.data.flags;
	if (!flags.pinfix.enable) return;

	function mapRange(from, to, s) {
		return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
	};

	const reciprocal = 1 / pan.scale;
	const clamped = Math.clamped(pan.scale, flags.pinfix.zoomFloor, flags.pinfix.zoomCeil);
	const mapped = mapRange([flags.pinfix.zoomFloor, flags.pinfix.zoomCeil], [flags.pinfix.minScale, flags.pinfix.maxScale], clamped);
	
	const scale = reciprocal * mapped;// mapRange([.33, 10], [.75, 2], reciprocal);

	canvas.notes.objects.children.forEach(note => {
		note.transform.scale.x = scale;
		note.transform.scale.y = scale;
	});
	document.getElementById("pin-cushion-hud").style.transform = `scale(${scale})`;
//	document.getElementById("poi-tp-ctx-menu").style.transform = `scale(${scale})`;
})

Hooks.on("renderSceneConfig", (sceneConfig, html, data) => {
	const flags = data.entity.flags;
	const template = `
		<hr>
		<h3 class="form-header"><i class="fas fa-bookmark"></i> ${game.i18n.localize("pinfix.title")}</h3>
		<p class="notes">${game.i18n.localize("pinfix.description")}</p>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.enable.name")}</label>
			<input type="checkbox" name="flags.pinfix.enable" data-dtype="Boolean" ${flags.pinfix?.enable ? "checked":""}>
			<p class="notes">${game.i18n.localize("pinfix.enable.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.minScale.name")}</label>
			<input type="text" name="flags.pinfix.minScale" data-dtype="Number" value="${flags.pinfix?.minScale ?? 1}">
			<p class="notes">${game.i18n.localize("pinfix.minScale.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.maxScale.name")}</label>
			<input type="text" name="flags.pinfix.maxScale" data-dtype="Number" value="${flags.pinfix?.maxScale ?? 1}">
			<p class="notes">${game.i18n.localize("pinfix.maxScale.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.zoomFloor.name")}</label>
			<input type="text" name="flags.pinfix.zoomFloor" data-dtype="Number" value="${flags.pinfix?.zoomFloor ?? .1}">
			<p class="notes">${game.i18n.localize("pinfix.zoomFloor.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.zoomCeil.name")}</label>
			<input type="text" name="flags.pinfix.zoomCeil" data-dtype="Number" value="${flags.pinfix?.zoomCeil ?? 3}">
			<p class="notes">${game.i18n.localize("pinfix.zoomCeil.desc")}</p>
		</div>`;
	html.find(".form-group").last().after(template);
});