class PinFixer {
	/** @type {Number} */ 
	static get minCanvScale() { return 0.1; }
	/** @type {Number} */
	static get maxCanvScale() { return CONFIG.Canvas.maxZoom; }

	/** @type {object} */
	static get flags()        { return canvas.scene.data.flags; }

	static get enabled()      { return Boolean(this.flags.pinfix?.enable); }
	static get zoomFloor()    { return  Number(this.flags.pinfix?.zoomFloor ?? this.minCanvScale); }
	static get zoomCeil()     { return  Number(this.flags.pinfix?.zoomCeil  ?? this.maxCanvScale); }
	static get minScale()     { return  Number(this.flags.pinfix?.minScale  ?? 1); }
	static get maxScale()     { return  Number(this.flags.pinfix?.maxScale  ?? 1); }

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
		const scaled = this.noteScaleConfigured(scale);
		canvas.notes.objects.children.forEach(note => 
			this.scaleNote(note, scaled)
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

		const basicScale = this.noteScaleBasic(pan.scale);
		this.scalePinCushion(basicScale);
		this.scalePoiTp(basicScale);
	}
	static renderPinCushionHUD(hud, html, data) {
		const basicScale = this.noteScaleBasic(canvas.stage.scale.x);
		this.scalePinCushion(basicScale);
	}
	static renderPoiTpHUD(hud, html, data) {
		const basicScale = this.noteScaleBasic(canvas.stage.scale.x);
		this.scalePoiTp(basicScale);
	}

	static updateScene(scene, data, options) {
		this.canvasPan(canvas, { scale: canvas.stage.scale.x });
	}

	static renderSceneConfig(sceneConfig, html, data) {
		html.find(".form-group").last().after(this.template);
	}

	static get template() {
		return `
		<hr>
		<h3 class="form-header"><i class="fas fa-bookmark"></i> ${game.i18n.localize("pinfix.title")}</h3>
		<p class="notes">${game.i18n.localize("pinfix.description")}</p>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.enable.name")}</label>
			<input type="checkbox" name="flags.pinfix.enable" data-dtype="Boolean"${this.enabled ? " checked" : ""}>
			<p class="notes">${game.i18n.localize("pinfix.enable.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.minScale.name")}</label>
			<input type="text" name="flags.pinfix.minScale" data-dtype="Number" value="${this.minScale}">
			<p class="notes">${game.i18n.localize("pinfix.minScale.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.maxScale.name")}</label>
			<input type="text" name="flags.pinfix.maxScale" data-dtype="Number" value="${this.maxScale}">
			<p class="notes">${game.i18n.localize("pinfix.maxScale.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.zoomFloor.name")}</label>
			<input type="text" name="flags.pinfix.zoomFloor" data-dtype="Number" value="${this.zoomFloor}">
			<p class="notes">${game.i18n.localize("pinfix.zoomFloor.desc")}</p>
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.zoomCeil.name")}</label>
			<input type="text" name="flags.pinfix.zoomCeil" data-dtype="Number" value="${this.zoomCeil}">
			<p class="notes">${game.i18n.localize("pinfix.zoomCeil.desc")}</p>
		</div>`;
	}
}

Hooks.on("canvasPan", (...args) => PinFixer.canvasPan(...args));
Hooks.on("renderPinCushionHUD", (...args) => PinFixer.renderPinCushionHUD(...args));
Hooks.on("renderPoiTpHUD", (...args) => PinFixer.renderPoiTpHUD(...args));
Hooks.on("renderSceneConfig", (...args) => PinFixer.renderSceneConfig(...args));
Hooks.on("updateScene", (...args) => PinFixer.updateScene(...args));