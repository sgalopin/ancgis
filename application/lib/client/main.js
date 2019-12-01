import {setCookie, getCookie, hasVerifiedJWT, deleteCookie, getUserInfo} from "./ancgis/tool/cookie.js";
import sigPageTemplate from "../views/subpages/sig.hbs";
import loginPageTemplate from "../views/subpages/login.hbs";
import getSig from "./ancgis/map/sig.js";
import {confirm} from "./ancgis/tool/modal.js";
import jwt from "jsonwebtoken";
import {displayLoginMessage} from "./ancgis/tool/message.js";
import {addServiceWorker} from "./ancgis/tool/service-worker.js";
import * as log from "loglevel";
import Env from "@environment";

$(document).ready(function(){

  log.setLevel(Env.LOG_LEVEL); // Logging is filtered to "warn" level by default.

  function bootstrapSetup() {
    // Tooltip activation
    $("[data-toggle=\"tooltip\"]").tooltip({
      trigger : "hover"
    });
    // Removes focus of the button.
    $(".btn").click(function(){
      $(this).blur();
    });
  }

  function updatePage(pageTemplate, data) {
    if ($(".page-container")) {
      $(".page-container").remove();
    }
    $("#current-page").append(pageTemplate(data));
    bootstrapSetup();
  }

  function disconnect() {
    // server logout
    $.ajax({
      type: "GET",
      url: "/logout",
      dataType: "json",
      success (response) {
        document.location.href = "/";
      },
      error (jqXHR, textStatus, errorThrown) {
        if (jqXHR.readyState === 0) { // Network error
          // local logout
          deleteCookie("jwt");
          document.location.href = "/";
        }
        else if (jqXHR.readyState === 4) {
          // HTTP error (can be checked by jqXHR.status and jqXHR.statusText)
          displayLoginMessage("La demande de déconnexion a echouée suite à une erreur HTTP.", "error", true);
        }
        else {
          // something weird is happening
          displayLoginMessage("La demande de déconnexion a echouée suite à une erreur inconnue.", "error", true);
        }
        log.error( "Request Failed with status : " + textStatus );
        if (errorThrown) { log.error(errorThrown); }
      }
    });
  }

  async function openSIGPage(isOnline = false) {
    // Adds the sig page (static part)
    updatePage(sigPageTemplate, {user: getUserInfo(), isOnline});
    // Adds the sig page (dynamic part)
    let sig = await getSig(isOnline);
    if (Env.SET_GLOBAL_VAR) {
      // Add ancgis global var
      window.ancgis = sig;
    }

    // Management of the logout button
    $("#ancgis-topright-logout, #ancgis-topright-logout2").click(function() {
      confirm("Confirmez-vous la déconnexion ? Attention, l'authentification requiert une connexion.").then(
        disconnect,
        $.noop
      );
    });
  }

  function getConnectionState(){
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "GET",
        url: "/status",
        success(response) {
          resolve({ serverConnection: true, activeSession: response.activeSession });
        },
        error(jqXHR, textStatus, errorThrown) { // eslint-disable-line complexity
          log.error( "Request Failed with status : " + textStatus );
          if (errorThrown) { log.error(errorThrown); }
          resolve({ serverConnection: false });
        }
      });
    });
  }

  function openLoginPage() {
    // Display the login page
    updatePage(loginPageTemplate);
    $("#login-form").bind("submit", function(e) {
      e.preventDefault();
      // Remote authentification
      $.ajax({
        type: "POST",
        url: $("#login-form").prop("action"),
        data: $("#login-form").serialize(),
        dataType: "json",
        success(response) {
          if (response.success === true && hasVerifiedJWT("jwt")) {
            openSIGPage(true); // true for online
            // Add Service worker for cache
            addServiceWorker();
          } else {
            displayLoginMessage(response.message, "error", true);
          }
        },
        error(jqXHR, textStatus, errorThrown) { // eslint-disable-line complexity
          if (jqXHR.readyState === 0) {
            // Network error (i.e. connection refused, access denied due to CORS, etc.)
            displayLoginMessage("La demande de connexion a echouée suite à une erreur réseau.", "error", true);
          } else if (jqXHR.readyState === 4) {
            // HTTP error (can be checked by jqXHR.status and jqXHR.statusText)
            displayLoginMessage("La demande de connexion a echouée suite à une erreur HTTP.", "error", true);
          } else {
            // something weird is happening
            displayLoginMessage("La demande de connexion a echouée suite à une erreur inconnue.", "error", true);
          }
          log.error( "Request Failed with status : " + textStatus );
          if (errorThrown) { log.error(errorThrown); }
        }
      });
    });
  }

  getConnectionState().then(function(state){
    if(state.serverConnection){ // Server responds
      if(state.activeSession && hasVerifiedJWT("jwt") ) {
        openSIGPage(true); // true for online
        // Add Service worker for cache
        addServiceWorker();
      } else {
        openLoginPage();
        displayLoginMessage("Votre session serveur a expiré. Veuillez vous authentifier de nouveau.", "info", true);
      }
    } else { // No server
      // Local authentification
      if (hasVerifiedJWT("jwt")) { // Valid JWT
        openSIGPage();
      } else { // Invalid JWT
        openLoginPage();
        displayLoginMessage("Votre session locale a expiré et le serveur n'est pas joignable. Une connexion réseau est nécessaire afin de pouvoir vous authentifier de nouveau.", "info", true);
      }
    }
  });
});
