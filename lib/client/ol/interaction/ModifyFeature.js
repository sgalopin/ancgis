/**
 * AncGIS - Web GIS for the analysis of honey resources around an apiary
 * Copyright (C) 2020  Sylvain Galopin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
 
/**
 * @module ancgis/client/ol/interaction/ModifyFeature
 */

import Modify from "ol/interaction/Modify.js";
import {platformModifierKeyOnly, singleClick} from "ol/events/condition.js";
import Collection from "ol/Collection.js";
import ModifyFeatureEventType from  "./ModifyFeatureEventType.js";
import {ModifyEvent} from "ol/interaction/Modify.js";
import EventType from "ol/events/EventType.js";
import {listen, listenOnce, unlisten} from "ol/events.js";

/**
 * @enum {string}
 */
const ModifyEventType = {
  /**
   * Triggered upon feature modification start
   * @event ModifyEvent#modifystart
   * @api
   */
  MODIFYSTART: "modifystart",
  /**
   * Triggered upon feature modification end
   * @event ModifyEvent#modifyend
   * @api
   */
  MODIFYEND: "modifyend"
};

/**
 * @classdesc
 * Allows the user to modify the selected feature.
 *
 * @api
 */
class ModifyFeature extends Modify {
  /**
   * @param {module:ol/interaction/EditProperties~Options=} optOptions Options.
   */
  constructor(optOptions) {

    const options = optOptions ? optOptions : {};
    options.deleteCondition = options.deleteCondition ? options.deleteCondition : function(mapBrowserEvent) {
      return platformModifierKeyOnly(mapBrowserEvent) &&
        singleClick(mapBrowserEvent);
    };

    super(options);

    /**
     * The collection of the last changed features
     * @type {module:ol/Collection}
     * @private
     */
    this.changedFeatures_ = new Collection([],{unique:true});

    listen(this, ModifyEventType.MODIFYEND, this.onModifyEnd_, this);
    listen(this, ModifyEventType.MODIFYSTART, this.onModifyStart_, this);
  }

  /**
   * Manages the "modifyend" event.
   * NOTE: The returned "modifyend" event features contains all the features.
   * We have to create an other event returning only the modified features.
   * @param {module:ol/interaction/ModifyEvent} event A modify event.
   * @private
   */
  onModifyEnd_(event) {
    var me = this;
    this.features_.forEach(function(feature){
      unlisten(feature, EventType.CHANGE, me.addChangedFeature_, me);
    });
    this.dispatchEvent(new ModifyEvent(ModifyFeatureEventType.MODIFYFEATURES, this.changedFeatures_, event));
  }

  /**
   * Manages the "modifystart" event.
   * @param {module:ol/interaction/ModifyEvent} event A modify event.
   * @private
   */
  onModifyStart_(event) {
    this.changedFeatures_.clear();
    var me = this;
    this.features_.forEach(function(feature){
      listenOnce(feature, EventType.CHANGE, me.addChangedFeature_, me);
    });
  }

  /**
   * Add the changed feature to the "changedFeatures_" collection.
   * @param {module:ol/interaction/ModifyEvent} event A modify event.
   * @private
   */
  addChangedFeature_(e) {
    this.changedFeatures_.push(e.target);
  }
}

export default ModifyFeature;
