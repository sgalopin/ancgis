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
 
import * as log from "loglevel";

// Add Service worker for cache
export function addServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/cache.js")
    .then(function(registration) {
      log.debug("Registration successful, scope is:", registration.scope);
    })
    .catch(function(error) {
      log.error("Service worker registration failed, error:", error);
    });
  }
}
