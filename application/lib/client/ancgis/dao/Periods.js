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

class Periods extends Array {

  /**
   * Returns a string representation of the periods
   * Ex: [[6],[10,12]] => "6,10>12"
   * @static
   */
  toString() {
    let periodsString = [];
    this.forEach(function(period){
      if (period[1]) { // Interval
        periodsString += period[0] + '>' + period[1];
      } else {
        periodsString += period[0];
      }
      periodsString += ',';
    });
    return periodsString.substring(0, periodsString.length - 1);
  };
}

export default Periods;
