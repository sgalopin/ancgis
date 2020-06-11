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
   * @module ancgis/client/ol/control/PeriodTypes
   */

 /**
  * @enum {string}
  */
 export default {
  CALENDAR: [{
      period: "1",
      label: "Jan",
      tipLabel: "Janvier"
    },{
      period: "2",
      label: "Fév",
      tipLabel: "Février"
    },{
      period: "3",
      label: "Mar",
      tipLabel: "Mars"
    },{
      period: "4",
      label: "Avr",
      tipLabel: "Avril"
    },{
      period: "5",
      label: "Mai",
      tipLabel: "Mai"
    },{
      period: "6",
      label: "Jui",
      tipLabel: "Juin"
    },{
      period: "7",
      label: "Jui",
      tipLabel: "Juillet"
    },{
      period: "8",
      label: "Aoû",
      tipLabel: "Août"
    },{
      period: "9",
      label: "Sep",
      tipLabel: "Septembre"
    },{
      period: "10",
      label: "Oct",
      tipLabel: "Octobre"
    },{
      period: "11",
      label: "Nov",
      tipLabel: "Novembre"
    },{
      period: "12",
      label: "Déc",
      tipLabel: "Décembre"
    }
  ],
  PHENOSEASON: [{
      period: "1",
      label: "T1",
      tipLabel: "Transition 1"
    },{
      period: "2",
      label: "PV1",
      tipLabel: "Pré-vernal 1"
    },{
      period: "3",
      label: "PV2",
      tipLabel: "Pré-vernal 2"
    },{
      period: "4",
      label: "T2",
      tipLabel: "Transition 2"
    },{
      period: "5",
      label: "V1",
      tipLabel: "Vernal 1"
    },{
      period: "6",
      label: "V2",
      tipLabel: "Vernal 2"
    },{
      period: "7",
      label: "V3",
      tipLabel: "Vernal 3"
    },{
      period: "8",
      label: "V4",
      tipLabel: "Vernal 4"
    },{
      period: "9",
      label: "T3",
      tipLabel: "Transition 3"
    },{
      period: "10",
      label: "E1",
      tipLabel: "Estival 1"
    },{
      period: "11",
      label: "E2",
      tipLabel: "Estival 2"
    },{
      period: "12",
      label: "T4",
      tipLabel: "Transition 4"
    },{
      period: "13",
      label: "EA",
      tipLabel: "Estivo-automnal"
    }
  ]
};
