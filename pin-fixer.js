class PinFixer {
	static get minScale() { return 0.1; }
	static get maxScale() { return CONFIG.Canvas.maxZoom; }

	static get flags() { return canvas.scene.data.flags; }

	static get enabled() { return !!this.flags.enable; }
	static get zoomFloor() { return this.flags.pinfix.zoomFloor ?? this.minScale; }
	static get zoomCeil() { return this.flags.pinfix.zoomFloor ?? this.maxScale; }
	static get minScale() { return this.flags.pinfix.minScale ?? 1; }
	static get maxScale() { return this.flags.pinfix.maxScale ?? 1; }

	static reciprocal(number) { return 1 / number; }

	static map(from, to, s) {
		return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
	}

	static clampZoom(zoom) {
		return Math.clamped(zoom, this.zoomFloor, this.zoomCeil);
	}
	static remapZoom(zoom) {
		return this.map([this.zoomFloor, this.zoomCeil], [this.minScale, this.maxScale], zoom);
	}
	static noteScaleFactor(scale) {
		return this.remapZoom(this.clampZoom(scale));
	}

	static noteScaleConfigured(scale) {
		return this.reciprocal(scale) * this.noteScaleFactor(scale);
	}
	static noteScaleBasic(scale) {
		return this.reciprocal(scale);
	}

	static scaleNotes(scale) {
		canvas.notes.objects.children.forEach(note => 
			this.scaleNote(note, this.noteScaleConfigured(scale))
		);
	}

	static scaleNote(note, scale) {
		note.transform.scale.x = scale;
		note.transform.scale.y = scale;
	}
	static scalePinCushion(scale) {
		const hud = document.getElementById("pin-cushion-hud");
		if (hud) hud.style.transform = `scale(${scale})`;
	}
	static scalePoiTp(scale) {
		const hud = document.getElementById("poi-tp-ctx-menu");
		if (hud) hud.style.transform = `scale(${scale})`;
	}

	static canvasPan(canvas, pan) {
		this.scaleNotes(pan.scale);
	}
}

Hooks.on("canvasPan", (...args) => PinFixer.canvasPan(...args));


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