/**
 * A static class for manipulating the scale of map pins
 *
 * @class PinFixer
 */
class PinFixer {
	/** @type {Number} */ 
	static get minCanvScale() { return 0.1; }
	/** @type {Number} */
	static get maxCanvScale() { return CONFIG.Canvas.maxZoom; }

	/** @type {Number} */
	static get mapScale() { return canvas.stage.scale.x; }

	/** @type {object} */
	static get flags()        { return canvas.scene.data.flags; }
	
	static get enabled()      { return Boolean(this.flags.pinfix?.enable); }
	static get zoomFloor()    { return  Number(this.flags.pinfix?.zoomFloor ?? this.minCanvScale); }
	static get zoomCeil()     { return  Number(this.flags.pinfix?.zoomCeil  ?? this.maxCanvScale); }
	static get minScale()     { return  Number(this.flags.pinfix?.minScale  ?? 1); }
	static get maxScale()     { return  Number(this.flags.pinfix?.maxScale  ?? 1); }
	static get hudScale()     { return  Number(this.flags.pinfix?.hudScale  ?? 1); }
	static get pinLocker()    { return Boolean(this.flags.pinfix?.pinLocker); }
	static get aboveFog()     { return Boolean(this.flags.pinfix?.aboveFog); }

	static get onNotesLayer() { return canvas.activeLayer?.constructor?.name == "NotesLayer"; }
	static get lockPins()     { return this.enabled && this.pinLocker && !this.onNotesLayer; }

	/**
	 * This set of data is used to define any HUDs from
	 * other modules that could benefit from scaling.
	 *
	 * @typedef HudData - A set of data about a HUD for pins
	 * @property {string} hook - The name of the hook for rendering this HUD
	 * @property {string} id - The HTML id attribute of this HUDs HTML
	 *
	 * @readonly
	 * @static
	 * @memberof PinFixer
	 */
	static get huds() {
		return [
			{ hook: "renderPinCushionHUD", id: "pin-cushion-hud" },
			{ hook: "renderPoiTpHUD", id: "poi-tp-ctx-menu" }
		]
	}

	/**
	 * Calculates the reciprocal of a number
	 *
	 * @static
	 * @param {number} number - The number to calculate the reciprocal of
	 * @return {number} The reciprocal
	 * @memberof PinFixer
	 */
	static reciprocal(number) { return 1 / number; }

	/**
	 * Map one range of numbers to another range,
	 * then take an input number to the first range
	 * and output the mapped number from the second range.
	 *
	 * https://rosettacode.org/wiki/Map_range#JavaScript
	 *
	 * @static
	 * @param {[number, number]} from - The first range in which the input falls
	 * @param {[number, number]} to - The range to map to, from which to draw the output
	 * @param {number} s - The number in the first range to map to the second range
	 * @return {number} The mapped number
	 * @memberof PinFixer
	 */
	static map(from, to, s) {
		return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
	}
	
	/**
	 * Clamps the zoom level between zoomFloor and zoomCeil
	 *
	 * @static
	 * @param {number} zoom - The current zoom level
	 * @return {number} The zoom after being clamped 
	 * @memberof PinFixer
	 */
	static clampZoom(zoom) {
		return Math.clamped(zoom, this.zoomFloor, this.zoomCeil);
	}
	/**
	 * Maps the zoom level from the clamped range to the
	 * user configured range limits for scaling.
	 *
	 * @static
	 * @param {number} zoom - The current zoom level
	 * @return {number} The zoom after being mapped
	 * @memberof PinFixer
	 */
	static remapZoom(zoom) {
		return this.map([this.zoomFloor, this.zoomCeil], [this.minScale, this.maxScale], zoom);
	}
	/**
	 * Calculates the scale factor for the note pins,
	 * this value adjust their scale based on the canvas
	 * zoom.
	 *
	 * @static
	 * @param {number} scale - The current canvas scale
	 * @return {number} The scale factor
	 * @memberof PinFixer
	 */
	static noteScaleFactor(scale) {
		return this.remapZoom(this.clampZoom(scale));
	}

	/**
	 * Calculates the scale factor for HUDs
	 * based on basic reciprical scaling and the
	 * user configured scale factor.
	 *
	 * @static
	 * @param {number} scale - The canvas scale
	 * @return {number} The scale factor
	 * @memberof PinFixer
	 */
	static hudScaleFactor(scale) {
		return this.noteScaleBasic(scale) * this.hudScale;
	}

	/**
	 * Calculates the scale for a note based on the
	 * note scale factor.
	 *
	 * @static
	 * @param {number} scale - The canvas scale
	 * @return {number} The scale for the note
	 * @memberof PinFixer
	 */
	static noteScaleConfigured(scale) {
		return this.reciprocal(scale) * this.noteScaleFactor(scale);
	}
	/**
	 * Calculates the scale for a note bases on the 
	 * reciprocal of the canvas scale.
	 *
	 * @static
	 * @param {number} scale - The canvas scale
	 * @return {number} The scale for the note
	 * @memberof PinFixer
	 */
	static noteScaleBasic(scale) {
		return this.reciprocal(scale);
	}

	/**
	 * Returns true if the the zoom level is 
	 * outside the range specified for the note.
	 *
	 * @static
	 * @param {Note} note - The note that might be hidden
	 * @param {number} scale - The current scale of the scene
	 * @return {boolean} 
	 * @memberof PinFixer
	 */
	static shouldHide(note, scale) {
		if (!note._canView()) return true;
		const flags = note.data.flags?.pinfix;
		if (!flags || this.onNotesLayer) return false;
		return flags.minZoomLevel > scale || flags.maxZoomLevel < scale;
	}
	
	/**
	 * Set the scale of a note on the canvas.
	 *
	 * @static
	 * @param {Note} note - The Note object representing a map pin
	 * @param {number} scale - The scale to set the note to
	 * @memberof PinFixer
	 */
	static scaleNote(note, scale) {
		note.transform.scale.x = scale;
		note.transform.scale.y = scale;
	}
	/**
	 * Scale all the notes in the scene
	 *
	 * @static
	 * @param {number} scale - The scale to set the notes to
	 * @memberof PinFixer
	 */
	static scaleNotes(scale) {
		const scaled = this.noteScaleConfigured(scale);
		canvas.notes.objects.children.forEach(note => 
			this.scaleNote(note, scaled)
		);
	}
	/**
	 * Hides notes that need hidden
	 *
	 * @static
	 * @param {number} scale - The current map scale
	 * @param {boolean} unhide - If true, unhide regardless of scale
	 * @memberof PinFixer
	 */
	static hideNotes(scale, unhide) {
		canvas.notes.objects.children.forEach(note =>
			this.hideNote(note, scale, unhide)
		);
	}
	/**
	 * Hides a note that needs hidden
	 *
	 * @static
	 * @param {Note} note - The note that may need hidden
	 * @param {number} scale - The current map scale
	 * @param {boolean} unhide - If true, unhide regardless of scale
	 * @memberof PinFixer
	 */
	static hideNote(note, scale, unhide) {
		note.visible = unhide || !this.shouldHide(note, scale);
	}

	/**
	 * Show the names of all notes that should have them shown
	 *
	 * @static
	 * @memberof PinFixer
	 */
	static showNoteNames() {
		canvas.notes.objects.children.forEach(note =>
			this.showNoteName(note)
		);
	}

	/**
	 * Show the name of a note if it should be shown
	 *
	 * @static
	 * @param {Note} note - The note to show the name of
	 * @memberof PinFixer
	 */
	static showNoteName(note) {
		note.tooltip.visible = this.shouldShowName(note);
	}

	/**
	 * Check whether or not the name of a note should be shown
	 *
	 * By default, the name is shown when `note._hover` is true
	 * when it is, the name should be shown regardless of this module.
	 * The name should only be shown when it is false if the setting
	 * flag on the note is true *and* this module is enabled on the scene.
	 *
	 * @static
	 * @param {Note} note - The note to check the status on
	 * @return {boolean} Whether or not to show the name 
	 * @memberof PinFixer
	 */
	static shouldShowName(note) {
		const flags = note.data.flags?.pinfix;
		return (this.enabled && flags?.showName) || note._hover;
	}
	
	/**
	 * Scale a HUD HTML by setting the CSS transform.
	 *
	 * @static
	 * @param {string} hudId - The HTML id of the HUD
	 * @param {number} scale - The scale to set the HUD to
	 * @memberof PinFixer
	 */
	static scaleHUD(hudId, scale) {
		const hud = document.getElementById(hudId);
		if (hud) hud.style.transform = `scale(${scale})`;
	}
	/**
	* Scale all the HUDs
	*
	* @static
	* @param {number} scale - The scale to set the HUDs to
	* @memberof PinFixer
	*/
	static scaleHUDs(scale) {
		const hudScale = this.hudScaleFactor(scale);
		this.huds.forEach(hud => this.scaleHUD(hud.id, hudScale));
	}
	
	/**
	 * Reset the CSS transform of the HUD HTML
	 * by setting it to an empty string.
	 *
	 * @static
	 * @param {string} hudId - The HTML id of the HUD
	 * @memberof PinFixer
	 */
	static resetHudScale(hudId) {
		const hud = document.getElementById(hudId);
		if (hud) hud.style.transform = "";
	}
	/**
	 * Reset the scale of all HUDs
	 *
	 * @static
	 * @memberof PinFixer
	 */
	static resetHUDs() {
		this.huds.forEach(hud => this.resetHudScale(hud.id));
	}
	
	/**
	 * Reset all pins to normal size,
	 * and reset all HUDs, and unhide hidden notes
	 *
	 * @static
	 * @memberof PinFixer
	 */
	static reset() {
		this.scaleNotes(1);
		this.hideNotes(1, true);
		this.showNoteNames();
		this.resetHUDs();
	}

	/**
	 * Handles the main init Hook
	 *
	 * Loads the template files
	 *
	 * @static
	 * @param {array} args - Not really doing anything with the args, if there even are any
	 * @memberof PinFixer
	 */
	static init(...args) {
		loadTemplates([
			"modules/pin-fixer/sceneSettings.html"
			//"modules/pinfixer/.html"
		]);
	}

	/**
	 * Handle the canvasPan Hook
	 *
	 * @static
	 * @param {Canvas} canvas - The main canvas
	 * @param {object} pan - A data object of canvas pan data
	 * @param {number} pan.x - The x coordinate of the canvas after paning
	 * @param {number} pan.y - The y coordinate of the canvas after paning
	 * @param {number} pan.scale - The scale factor of the canvas after paning.
	 * @return {void} Return early if Pin Fixer isn't enabled for the scene
	 * @memberof PinFixer
	 */
	static canvasPan(canvas, pan) {
		if (!this.enabled) return;
		this.scaleNotes(pan.scale);
		this.hideNotes(pan.scale);
		this.showNoteNames(true);
		this.scaleHUDs(pan.scale);
	}

	/**
	 * Handles the hoverNote Hook
	 *
	 * Triggers showing the names of notes that are set to always
	 * show thier names.
	 *
	 * @static
	 * @param {array} args
	 * @memberof PinFixer
	 */
	static hoverNote(...args) {
		if (!this.enabled) return;
		this.showNoteNames(true);
	}

	/**
	 * Handles the updateNote Hook
	 *
	 * Updates names that should be shown and notes that need hidden.
	 *
	 * @static
	 * @param {*} args
	 * @memberof PinFixer
	 */
	static updateNote(...args) {
		this.showNoteNames(true);
		this.hideNotes(this.mapScale);
	}


	/**
	 * Handle the rendering Hooks for HUDs
	 *
	 * @static
	 * @param {string} id - The HTML id of the HUD
	 * @param {PlaceblesHUD} hud - The HUD object
	 * @param {jQuery} html - The HTML of the HUD
	 * @param {object} data - data associated with this rendering
	 * @return {void} Return early if Pin Fixer isn't enabled for the scene
	 * @memberof PinFixer
	 */
	static renderHUD(id, hud, html, data) {
		if (!this.enabled) return;
		const hudScale = this.hudScaleFactor(this.mapScale);
		this.scaleHUD(id, hudScale);
	}
	/**
	 * Handles the updateScene Hook
	 * If Pin Fixer is inabled for the scene
	 * updated everything as if the canvas had paned
	 * 
	 * Otherwise, reset everything.
	 *
	 * @static
	 * @param {Scene} scene - The Scene object
	 * @param {object} data - The data of the update
	 * @param {object} options - The update options
	 * @memberof PinFixer
	 */
	static updateScene(scene, data, options) {
		if (!this.enabled) return this.reset();
		this.pullAboveFog();
		this.canvasPan(canvas, { scale: this.mapScale });
	}

	/**
	 * Adds event listeners to the sliders and inputs
	 * so that they change eachothers values.
	 *
	 * @static
	 * @param {jQuery} html - The HTML of the form.
	 * @memberof PinFixer
	 */
	static attachEventListeners(html) {
		const slideWrapper = html.find(".pin-fixer .range-slider-with-icons");
		slideWrapper.find(".range-slider")
			.change((event) => this.inputToInput(event, ".range-editor"));
		slideWrapper.find(".range-editor")
			.change((event) => this.inputToInput(event, ".range-slider"));
	}

	/**
	 * Sets the value of the destination to
	 * the same value as the event target.
	 *
	 * @static
	 * @param {Event} event - The percipitating input change event
	 * @param {string} destination - The query string for the destination input
	 * @memberof PinFixer
	 */
	static inputToInput(event, destination) {
		const source = $(event.currentTarget);
		const dest = source.siblings(destination);
		dest.val(source.val());
	}

	/**
	 * Handles the renderSceneConfig Hook
	 *
	 * Injects HTML into the scene config.
	 *
	 * @static
	 * @param {SceneConfig} sceneConfig - The Scene config sheet
	 * @param {jQuery} html - The HTML of the sheet
	 * @param {object} data - Data associated with the sheet rendering
	 * @memberof PinFixer
	 */
	static async renderSceneConfig(sceneConfig, html, data) {
		const ambItem = html.find(".item[data-tab=ambience]");
		const ambTab  = html.find(".tab[data-tab=ambience]");

		ambItem.after(`<a class="item" data-tab="pin-fixer"><i class="fas fa-bookmark"></i> ${game.i18n.localize("pinfix.title")}</a>`);
		ambTab.after(await this.getSceneHtml(this.getSceneTemplateData(data)));
		this.attachEventListeners(html);
	}

	/**
	 * Handles the renderNoteConfig Hook
	 *
	 * Injects HTML into the note config.
	 *
	 * @static
	 * @param {NoteConfig} noteConfig - The Note config sheet
	 * @param {jQuery} html - The HMTL of the sheet
	 * @param {object} data - Data associated with the sheet rendering
	 * @memberof PinFixer
	 */
	static async renderNoteConfig(noteConfig, html, data) {
		if (!this.enabled) return;
		html.find(".form-group").last().after(await this.getNoteHtml(this.getNoteTemplateData(data)));
		this.attachEventListeners(html);
	}

	/**
	 * Handles the renderSceneControls Hooks
	 *
	 * Refreshes the hidden state of the notes
	 * in case they might need revealed for the 
	 * notes layer.
	 *
	 * @static
	 * @param {array} args
	 * @memberof PinFixer
	 */
	static renderSceneControls(...args) {
		this.hideNotes(this.mapScale);
	}

	/**
	 * An object containing settings for the Pin Fixer module for a given scene
	 *
	 * @typedef PinFixSettings
	 * @property {boolean} enable - Whether or not the module is enabled for the given scene
	 * @property {boolean} pinLocker - Whether or not to lock pins when not on the note layer
	 * @property {number} zoomFloor - The lower limit of scaling 
	 * @property {number} zoomCeil - The upper limit of scaling
	 * @property {number} minScale - The smallest allowed pin scale
	 * @property {number} maxScale - The largest allowed pin scale
	 * @property {number} hudScale - The scale factor for the HUD
	 * 
	*/

	/**
	 * An object containing settigns for individual notes
	 *
	 * @typedef NoteSettings
	 * @property {number} minZoomLevel - The note is hidden when zoom scale is under this number
	 * @property {number} maxZoomLevel - The note is hidden when zoom scale is over this number
	 * 
	 */
	
	/**
	 * Maps the data and property name of the PinFixSetings
	 * to data that produces a slider in the temmplate.
	 *
	 * @param {PinFixSettings} data - The settings data
	 * @param {string} name - The name of the property in the settings data
	 * @return {object} Data needed to properly display a slider
	 * @memberof PinFixer
	 */
	static mapSliderData(data, name) {
		return {
			name,
			value: data[name],
			label: `pinfix.${name}.name`,
			description: `pinfix.${name}.desc`
		}
	}

	/**
	 * Retrieves the current data for the scene being configured.
	 *
	 * @static
	 * @param {object} data - The data being passed to the scene config template
	 * @return {PinFixSettings}
	 * @memberof PinFixer
	 */
	static getSceneTemplateData(hookData) {
		const data = hookData.data?.flags?.pinfix || {
			enable: false,
			pinLocker: false,
			zoomFloor: this.minCanvScale,
			zoomCeil: this.maxCanvScale,
			minScale: 1,
			maxScale: 1,
			hudScale: 1
		}
		data.sliders = ["zoomFloor", "zoomCeil", "minScale", "maxScale", "hudScale"]
			.map(name => this.mapSliderData(data, name));

		return data;
	}
	/**
	 * Retrieves the current data for the note being configured.
	 *
	 * @static
	 * @param {object} data - The data being passed to the note config template
	 * @return {NoteSettings}
	 * @memberof PinFixer
	 */
	static getNoteTemplateData(data) {
		return data.data?.flags?.pinfix || {
			minZoomLevel: this.minCanvScale,
			maxZoomLevel: this.maxCanvScale
		}
	}

	/**
	 * The HTML to be added to the scene configuration
	 * in order to configure Pin Fixer for the scene.
	 *
	 * @param {PinFixSettings} settings - The Pin Fixer settings of the scene being configured.
	 * @static
	 * @return {string} The HTML to be injected
	 * @memberof PinFixer
	 */
	static async getSceneHtml(settings) {
		return await renderTemplate("modules/pin-fixer/sceneSettings.html", settings);
	}

	/**
	 * The HTML to be added to the note configuration
	 * in order to configure Pin Fixer for the note.
	 *
	 * @param {NoteSettings} settings - The Note settings of the note being configured.
	 * @static
	 * @return {string} The HTML to be injected
	 * @memberof PinFixer
	 */
	static async getNoteHtml(settings) {
		return await renderTemplate("modules/pin-fixer/noteSettings.html", settings);
	}

	static pullAboveFog() {
		if (this.aboveFog && this.enabled) canvas.notes.zIndex = 300;
		else canvas.notes.zIndex = 60;
	}

	/**
	 * Registers render Hooks for each HUD
	 *
	 * @static
	 * @memberof PinFixer
	 */
	static createHudHooks() {
		this.huds.forEach(hud => {
			Hooks.on(hud.hook, (...args) => this.renderHUD(hud.id, ...args));
		});
	}
}

/**
 * This scetion is a money-patch of Note#_canDrag()
 * by making thie method return false dragging can be prevented.
 */

// Copy the original method
PinFixer.noteCanDrag = Note.prototype._canDrag;

/**
 * This patched method returns false either when
 * the user has insufficient permissions, or
 * when the pin locking feature is enabled.
 * This prevents pins from being moved in
 * unwanted contexts.
 *
 * @param {User} user - The current user
 * @param {Event} event - The precipitating event
 * @return {boolean} Whether or not dragging the note is permitted for the user on this layer
 * @memberof Note
 */
Note.prototype._canDrag = function(user, event) {
	if (PinFixer.lockPins) return false;
	else return PinFixer.noteCanDrag.bind(this)(user, event); // When lockPins isn't true, return the result of the original method
}

/**
 * This is the Hooks section, hooks are registered here to call methods
 * of PinFixer with all arguments.
 */

Hooks.once("init", (...args) => PinFixer.init(...args));

Hooks.once("ready", () => {
	PinFixer.pullAboveFog();
	Hooks.on("renderSceneControls", (...args) => PinFixer.renderSceneControls(...args));
})

Hooks.on("canvasPan", (...args) => PinFixer.canvasPan(...args));
Hooks.on("renderSceneConfig", (...args) => PinFixer.renderSceneConfig(...args));
Hooks.on("renderNoteConfig", (...args) => PinFixer.renderNoteConfig(...args));
Hooks.on("hoverNote", (...args) => PinFixer.hoverNote(...args));

Hooks.on("updateNote", (...args) => PinFixer.updateNote(...args));
Hooks.on("updateScene", (...args) => PinFixer.updateScene(...args));

PinFixer.createHudHooks();