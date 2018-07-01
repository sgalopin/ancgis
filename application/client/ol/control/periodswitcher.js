/*global ol goog*/
goog.provide("ol.control.PeriodSwitcher");

goog.require("ol");
goog.require("ol.events");
goog.require("ol.events.EventType");
goog.require("ol.control.Control");
goog.require("ol.css");

goog.require("ol.control.PeriodSwitcherEvent");
goog.require("ol.control.PeriodSwitcherEventType");


/**
 * @classdesc
 * Some control buttons which, when pressed,
 * changes the current period layer on the map.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.PeriodSwitcherOptions=} optOptions Options.
 * @api
 */
ol.control.PeriodSwitcher = function(optOptions) {
  var options = optOptions ? optOptions : {};

  var btnsOptions = [{
    period: "T1",
    label: "T1",
    tipLabel: "Transition 1"
  },{
    period: "PV1",
    label: "PV1",
    tipLabel: "Pré-vernal 1"
  },{
    period: "PV2",
    label: "PV2",
    tipLabel: "Pré-vernal 2"
  },{
    period: "T2",
    label: "T2",
    tipLabel: "Transition 2"
  },{
    period: "V1",
    label: "V1",
    tipLabel: "Vernal 1"
  },{
    period: "V2",
    label: "V2",
    tipLabel: "Vernal 2"
  },{
    period: "V3",
    label: "V3",
    tipLabel: "Vernal 3"
  },{
    period: "V4",
    label: "V4",
    tipLabel: "Vernal 4"
  },{
    period: "T3",
    label: "T3",
    tipLabel: "Transition 3"
  },{
    period: "E1",
    label: "E1",
    tipLabel: "Estival 1"
  },{
    period: "E2",
    label: "E2",
    tipLabel: "Estival 2"
  },{
    period: "T4",
    label: "T4",
    tipLabel: "Transition 4"
  },{
    period: "EA",
    label: "EA",
    tipLabel: "Estivo-automnal"
  }];

  /**
   * Simulate a mouse over on the elements with the same period.
   * @param {MouseEvent} evt The mouse over event.
   */
  function simulateHover(evt) {
    var period = this.getAttribute("data-period");
    var periodElements = document.querySelectorAll("[data-period="+period+"]:not(."+this.className+")");
    periodElements.forEach(function(periodElement){
      periodElement.classList.toggle("hover");
    });
  };

  // Buttons list
  var list = document.createElement("ul");
  list.className = "ol-periodswitcher-buttonslist";
  btnsOptions.forEach(function(btnOpt) {
    // Buttons
    var button = document.createElement("li");
    button.className = "ol-periodswitcher-button";
    button.title = btnOpt.tipLabel;
    button.appendChild(document.createTextNode(btnOpt.label));
    button.setAttribute("data-period", btnOpt.period);
    ol.events.listen(button, ol.events.EventType.CLICK,
        this.handleClick_, this);
    button.onmouseover = simulateHover;
    button.onmouseout = simulateHover;
    list.appendChild(button);
  }, this);

  // Potentials nectar histogram
  var histo = document.createElement("div");
  histo.className = "ol-periodswitcher-histogram";
  btnsOptions.forEach(function(btnOpt) {
    // Histo Column
    var histoColumn = document.createElement("div");
    histoColumn.className = "ol-periodswitcher-histo-column";
    histoColumn.setAttribute("data-period", btnOpt.period);
    histoColumn.onmouseover = simulateHover;
    histoColumn.onmouseout = simulateHover;
    histo.appendChild(histoColumn);
    // Nectar Column
    var nectarColumn = document.createElement("div");
    nectarColumn.className = "ol-periodswitcher-nectar-column";
    histoColumn.appendChild(nectarColumn);
    // Pollen Column
    var pollenColumn = document.createElement("div");
    pollenColumn.className = "ol-periodswitcher-pollen-column";
    histoColumn.appendChild(pollenColumn);
  }, this);

  // Title
  var span = document.createElement("span");
  span.className = "ol.periodswitcher-title";
  span.innerHTML = "-- Périodes de floraison (Guerriat-1996) --";
  span.title = "La commande « shift + roulette » permet de changer de période.";
  span.setAttribute("data-toggle", "tooltip");
  span.setAttribute("data-placement", "top");

  // Switcher
  var className = options.className ? options.className : "ol-periodswitcher";
  var cssClasses = className + " " + ol.css.CLASS_UNSELECTABLE + " " +
      ol.css.CLASS_CONTROL;
  var element = document.createElement("div");
  element.className = cssClasses;
    // Top
    var top = document.createElement("div");
    top.className = "ol-periodswitcher-top";
    top.appendChild(histo);
    element.appendChild(top)
    // Bottom
    var bottom = document.createElement("div");
    bottom.className = "ol-periodswitcher-bottom";
    bottom.appendChild(span);
    bottom.appendChild(list);
    element.appendChild(bottom);

  ol.control.Control.call(this, {
    element,
    target: options.target
  });
};
ol.inherits(ol.control.PeriodSwitcher, ol.control.Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.PluggableMap} map Map.
 * @override
 * @api
 */
ol.control.PeriodSwitcher.prototype.setMap = function(map) {
  // Add the handler for the period potential change on the map
  // Note: The map is not avilable in the control until the call of the setMap function.
  ol.events.listen(map, ol.control.PeriodSwitcherEventType.PERIODPOTENTIALCHANGE, this.handlePeriodPotentialChange_, this);
  // Call the parent setMap function
  ol.control.Control.prototype.setMap.call(this, map);
  // Initialize the histogram
  this.updateHistogram_(this.getPeriodPotentialFromMap_());
};

/**
 * @param {Event} event The event to handle
 * @private
 */
ol.control.PeriodSwitcher.prototype.handlePeriodPotentialChange_ = function(event) {
  event.preventDefault();
  this.updateHistogram_(this.getPeriodPotentialFromMap_());
};

/**
 * Clear the histogram on the map
 * @private
 */
ol.control.PeriodSwitcher.prototype.clearHistogram_ = function() {
  // Clear the histogram columns heights
  var histoColumns = document.querySelectorAll(".ol-periodswitcher-nectar-column, .ol-periodswitcher-pollen-column");
  histoColumns.forEach(function(column) {
    column.style["height"] = "0px";
  }, this);
}

/**
 * Update the histogram on the map
 * @param {Array} periodsPotential The periods potential array ( periodsPotential[period] : { nectar: 0, pollen: 0 } )
 * @private
 */
ol.control.PeriodSwitcher.prototype.updateHistogram_ = function(periodsPotential) {
  this.clearHistogram_();
  // Get the maximum potential
  var maxNectar = 0;
  var maxPollen = 0;
  for(var period in periodsPotential) {
    if (periodsPotential.hasOwnProperty(period)) {
      if (periodsPotential[period].nectar > maxNectar){
        maxNectar = periodsPotential[period].nectar;
      }
      if (periodsPotential[period].pollen > maxPollen){
        maxPollen = periodsPotential[period].pollen;
      }
    }
  }
  // Set the histogram columns news heights
  var maxColumnHeight = 100; // Pixels
  for(var period in periodsPotential) {
     if (periodsPotential.hasOwnProperty(period)) {
      var nectarColumn = document.querySelector(".ol-periodswitcher-histo-column[data-period="+period+"]>.ol-periodswitcher-nectar-column");
      nectarColumn.style["height"] = (periodsPotential[period].nectar * maxColumnHeight / maxNectar) + "px";
      var pollenColumn = document.querySelector(".ol-periodswitcher-histo-column[data-period="+period+"]>.ol-periodswitcher-pollen-column");
      pollenColumn.style["height"] = (periodsPotential[period].pollen * maxColumnHeight / maxPollen) + "px";
    }
  }
};

/**
 * Get the period potential from the map
 * @private
 */
ol.control.PeriodSwitcher.prototype.getPeriodPotentialFromMap_ = function() {
  var map = this.getMap();
  var vegetationsLayer = map.getLayerByName("vegetationsLayer");
  var vegetationsLayerSource = vegetationsLayer.getSource();
  var periodsPotential = {};
  vegetationsLayerSource.forEachFeature(function(feature){
    if (feature.getProperties().flore) {
      feature.getProperties().flore.forEach(function(specie){
        var factor = specie.recovery / 100;
        if ( feature.getGeometry().getType() === ol.geom.GeometryType.CIRCLE ) {
          factor *= Math.PI * Math.pow(feature.getGeometry().getRadius(),2);
        } else {
          // TODO: Search why the "ol.Sphere.getArea" return the half of the "feature.getGeometry().getArea" function
          // see https://openlayers.org/en/latest/examples/measure.html
          // factor *= ol.Sphere.getArea(feature.getGeometry());
          factor *= feature.getGeometry().getArea();
        }
        specie.taxon.periods.forEach(function(period){
          periodsPotential[period] = periodsPotential[period] ? periodsPotential[period] : { nectar: 0, pollen: 0 };
          periodsPotential[period].nectar = Math.round((periodsPotential[period].nectar + (specie.taxon.nectarPotential * factor)) * 10) / 10;
          periodsPotential[period].pollen = Math.round((periodsPotential[period].pollen + (specie.taxon.pollenPotential * factor)) * 10) / 10;
        }, this);
      }, this);
    }
  }, this);
  return periodsPotential;
};

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