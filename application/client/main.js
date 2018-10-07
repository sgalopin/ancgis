import {setCookie, getCookie, hasVerifiedJWT, deleteCookie} from './ancgis/tool/cookie.js'
import sigPageTemplate from "../views/subpages/sig.hbs"
import loginPageTemplate from "../views/subpages/login.hbs"
import appMessageTemplate from "../views/partials/app-message.hbs"
import Sig from "./ancgis/map/sig.js"
import {confirm} from "./ancgis/tool/modal.js";
import jwt from 'jsonwebtoken';
import Sidbm from "./ancgis/dbms/SyncIdbManager.js"

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

  function updatePage(pageTemplate) {
    if ($(".page-container")) {
      $(".page-container").remove();
    }
    $("#current-page").append(pageTemplate());
    bootstrapSetup();
  }

  function displayMessage(message) {
    const appMessageHTML = appMessageTemplate({messages:{error: message}});
    if ($(".alert-dismissible")) {
      $(".alert-dismissible").remove();
    }
    $(".ancgis-appmessage").append(appMessageHTML);
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
    updatePage(sigPageTemplate);
    // Adds the sig page (dynamic part)
    Sig();

    // Management of the logout button
    $("#ancgis-topright-logout").click(function() {
      if ( !navigator.onLine ) {
        confirm("Confirmez-vous la déconnexion ? Attention, l'authentification requiert une connexion.").then(
          disconnect,
          $.noop
        );
      } else {
        disconnect();
      }
    });

    // Management of the sync button
    let idbm = await Sidbm;
    $("#ancgis-topright-sync").click(function() {
      if ( !navigator.onLine ) {
        displayMessage("La synchronisation requiert une connexion.");
      } else {
        idbm.populateFeaturesCollection("hives");
        idbm.populateFeaturesCollection("vegetation-zones");
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
        displayMessage("L'authentification requiert une connexion.");
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
              /*if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/cache.js')
                .then(function(registration) {
                  console.log('Registration successful, scope is:', registration.scope);
                })
                .catch(function(error) {
                  console.log('Service worker registration failed, error:', error);
                });
              }*/
            } else {
              displayMessage(response.message);
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
