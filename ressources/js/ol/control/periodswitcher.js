goog.provide('ol.control.PeriodSwitcher');

goog.require('ol');
goog.require('ol.events');
goog.require('ol.events.EventType');
goog.require('ol.control.Control');
goog.require('ol.css');


/**
 * @classdesc
 * Some control buttons which, when pressed, 
 * changes the current period layer on the map.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.PeriodSwitcherOptions=} opt_options Options.
 * @api
 */
ol.control.PeriodSwitcher = function(opt_options) {
  var options = opt_options ? opt_options : {};

  var btnsOptions = [{
    period: 'T1',
    label: 'T1',
    tipLabel: 'Transition 1'
  },{
    period: 'PV1',
    label: 'PV1',
    tipLabel: 'Pré-vernal 1'
  },{
    period: 'PV2',
    label: 'PV2',
    tipLabel: 'Pré-vernal 2'
  },{
    period: 'T2',
    label: 'T2',
    tipLabel: 'Transition 2'
  },{
    period: 'V1',
    label: 'V1',
    tipLabel: 'Vernal 1'
  },{
    period: 'V2',
    label: 'V2',
    tipLabel: 'Vernal 2'
  },{
    period: 'V3',
    label: 'V3',
    tipLabel: 'Vernal 3'
  },{
    period: 'V4',
    label: 'V4',
    tipLabel: 'Vernal 4'
  },{
    period: 'T3',
    label: 'T3',
    tipLabel: 'Transition 3'
  },{
    period: 'E1',
    label: 'E1',
    tipLabel: 'Estival 1'
  },{
    period: 'E2',
    label: 'E2',
    tipLabel: 'Estival 2'
  },{
    period: 'T4',
    label: 'T4',
    tipLabel: 'Transition 4'
  },{
    period: 'EA',
    label: 'EA',
    tipLabel: 'Estivo-automnal'
  }];

  // UL
  var list = document.createElement('ul');
  list.className = "ol-periodswitcher-buttonslist";
  btnsOptions.forEach(function(btnOpt) {
    // LI
    var button = document.createElement('li');
    button.className = "ol-periodswitcher-button";
    button.title = btnOpt.tipLabel;
    button.appendChild(document.createTextNode(btnOpt.label));
    button.setAttribute('data-period', btnOpt.period);
    ol.events.listen(button, ol.events.EventType.CLICK,
        this.handleClick_, this);
    list.appendChild(button);
  }, this);

  // SPAN
  var span = document.createElement('span');
  span.className = "ol.periodswitcher-title";
  span.innerHTML = "-- Périodes de floraison (Guerriat-1996) --";
  span.title = "La commande « shift + roulette » permet de changer de période.";
  span.setAttribute('data-toggle', 'tooltip');
  span.setAttribute('data-placement', 'top');

  // DIV
  var className = options.className !== undefined ? options.className :
    'ol-periodswitcher';
  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
      ol.css.CLASS_CONTROL;
  var element = document.createElement('div');
  element.className = cssClasses;
  element.appendChild(span);
  element.appendChild(list);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.inherits(ol.control.PeriodSwitcher, ol.control.Control);


/**
 * @param {Event} event The event to handle
 * @private
 */
ol.control.PeriodSwitcher.prototype.handleClick_ = function(event) {
  event.preventDefault();
  this.handlePeriodSwitcher_(event.target.dataset.period);
};


/**
 * @param {String} period The period code
 * @private
 */
ol.control.PeriodSwitcher.prototype.handlePeriodSwitcher_ = function(period) {
  var map = this.getMap();
  // TODO: Display the layer
};