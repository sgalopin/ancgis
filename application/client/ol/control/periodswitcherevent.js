goog.provide('ol.control.PeriodSwitcherEvent');

goog.require('ol');
goog.require('ol.events.Event');


/**
 * @classdesc
 * Events emitted as period switcher events are instances of this type.
 *
 * @constructor
 * @extends {ol.events.Event}
 * @implements {oli.control.PeriodSwitcherEvent}
 * @param {string} type Event type.
 * @param {ol.PluggableMap} map Map.
 */
ol.control.PeriodSwitcherEvent = function(type, map) {

  ol.events.Event.call(this, type);

  /**
   * The map where the event occurred.
   * @type {ol.PluggableMap}
   * @api
   */
  this.map = map;

};
ol.inherits(ol.control.PeriodSwitcherEvent, ol.events.Event);