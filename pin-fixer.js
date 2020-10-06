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
	static get hudScale()     { return  Number(this.flags.pinfix?.hudScale  ?? 1); }

	static get huds() {
		return [
			{ hook: "renderPinCushionHUD", id: "pin-cushion-hud" },
			{ hook: "renderPoiTpHUD", id: "poi-tp-ctx-menu" }
		]
	}

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

	static hudScaleFactor(scale) {
		return this.noteScaleBasic(scale) * this.hudScale;
	}

	static noteScaleConfigured(scale) {
		return this.reciprocal(scale) * this.noteScaleFactor(scale);
	}
	static noteScaleBasic(scale) {
		return this.reciprocal(scale);
	}
	
	static scaleNote(note, scale) {
		note.transform.scale.x = scale;
		note.transform.scale.y = scale;
	}
	static scaleNotes(scale) {
		const scaled = this.noteScaleConfigured(scale);
		canvas.notes.objects.children.forEach(note => 
			this.scaleNote(note, scaled)
		);
	}
	
	static scaleHUD(hudId, scale) {
		const hud = document.getElementById(hudId);
		if (hud) hud.style.transform = `scale(${scale})`;
	}
	static scaleHUDs(scale) {
		const hudScale = this.hudScaleFactor(scale);
		this.huds.forEach(hud => this.scaleHUD(hud.id, hudScale));
	}
	
	static resetHudScale(hudId) {
		const hud = document.getElementById(hudId);
		if (hud) hud.style.transform = "";
	}
	static resetHUDs() {
		this.huds.forEach(hud => this.resetHudScale(hud.id));
	}
	
	static reset() {
		this.scaleNotes(1);
		this.resetHUDs();
	}


	static canvasPan(canvas, pan) {
		if (!this.enabled) return;
		this.scaleNotes(pan.scale);
		this.scaleHUDs(pan.scale);
	}
	static renderHUD(id, hud, html, data) {
		if (!this.enabled) return;
		const hudScale = this.hudScaleFactor(canvas.stage.scale.x);
		this.scaleHUD(id, hudScale);
	}
	static updateScene(scene, data, options) {
		if (!this.enabled) this.reset();
		else this.canvasPan(canvas, { scale: canvas.stage.scale.x });
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
		</div>
		<div class="form-group">
			<label>${game.i18n.localize("pinfix.hudScale.name")}</label>
			<input type="text" name="flags.pinfix.hudScale" data-dtype="Number" value="${this.hudScale}">
			<p class="notes">${game.i18n.localize("pinfix.hudScale.desc")}</p>
		</div>`;
	}

	static createHudHooks() {
		this.huds.forEach(hud => {
			Hooks.on(hud.hook, (...args) => this.renderHUD(hud.id, ...args));
		});
	}
}

Hooks.on("canvasPan", (...args) => PinFixer.canvasPan(...args));
Hooks.on("renderSceneConfig", (...args) => PinFixer.renderSceneConfig(...args));
Hooks.on("updateScene", (...args) => PinFixer.updateScene(...args));
PinFixer.createHudHooks();