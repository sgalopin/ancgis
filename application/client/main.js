import {setCookie, getCookie, hasVerifiedJWT, deleteCookie, getUserInfo} from './ancgis/tool/cookie.js'
import sigPageTemplate from "../views/subpages/sig.hbs"
import loginPageTemplate from "../views/subpages/login.hbs"
import Sig from "./ancgis/map/sig.js"
import {confirm} from "./ancgis/tool/modal.js";
import jwt from 'jsonwebtoken';
import {displayLoginMessage, displayFormatedLoginMessage} from "./ancgis/tool/message.js";
import {addServiceWorker} from "./ancgis/tool/service-worker.js";

$(document).ready(function(){

  function bootstrapSetup() {
    // Tooltip activation
    $("[data-toggle=\"tooltip\"]").tooltip({
      trigger : 'hover'
    });
    // Removes focus of the button.
    $(".btn").click(function(){
      $(this).blur();
    })
  }

  function updatePage(pageTemplate, data) {
    if ($(".page-container")) {
      $(".page-container").remove();
    }
    $("#current-page").append(pageTemplate(data));
    bootstrapSetup();
  }

  function disconnect() {
    if (navigator.onLine) { // server logout
      $.ajax({
        type: "GET",
        url: "/logout",
        dataType: 'json',
        success: function(response){
          document.location.href = "/";
        }
      });
    } else { // local logout
      deleteCookie("jwt");
      document.location.href = "/";
    }
  }

  async function openSIGPage() {
    // Adds the sig page (static part)
    updatePage(sigPageTemplate, {user: getUserInfo()});
    // Adds the sig page (dynamic part)
    Sig();

    // Management of the logout button
    $("#ancgis-topright-logout, #ancgis-topright-logout2").click(function() {
      if ( !navigator.onLine ) {
        confirm("Confirmez-vous la déconnexion ? Attention, l'authentification requiert une connexion.").then(
          disconnect,
          $.noop
        );
      } else {
        disconnect();
      }
    });
  }

  function openLoginPage() {
    // Display the login page
    updatePage(loginPageTemplate);
    $("#login-form").bind("submit", function(e) {
      e.preventDefault();
      // Authentification
      if ( !navigator.onLine ) {
        displayLoginMessage("L'authentification requiert une connexion.", 'error', true);
      } else {
        $.ajax({
          type: "POST",
          url: $("#login-form").prop('action'),
          data: $('#login-form').serialize(),
          dataType: 'json',
          success: function(response){
            if (response.success === true && hasVerifiedJWT("jwt")) { // TODO: Check the JWT validity
              openSIGPage();
              // Add Service worker for cache
              addServiceWorker();
            } else {
              displayFormatedLoginMessage(response.message, true);
            }
          }
        });
      }
    });
  }

  if ( !navigator.onLine && hasVerifiedJWT("jwt") ) {
    openSIGPage();
  } else {
    openLoginPage();
  }
});
