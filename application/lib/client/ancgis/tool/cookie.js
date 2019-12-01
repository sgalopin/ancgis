/**
 * Cookie tools
 */
import jwt from "jsonwebtoken";
import jwks from "../../../../encryption/jwks.json";
import * as log from "loglevel";

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i]; // eslint-disable-line security/detect-object-injection
        while (c.charAt(0) === " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

export function deleteCookie(cname) {
    var d = new Date(); //Create an date object
    d.setTime(d.getTime() - (1000*60*60*24)); //Set the time to the past. 1000 milliseonds = 1 second
    var expires = "expires=" + d.toGMTString(); //Compose the expirartion date
    window.document.cookie = cname+"="+"; "+expires;//Set the cookie with name and the expiration date
}

export function hasCookie(cname) {
    return getCookie(cname) !== null;
}

export function hasVerifiedJWT() {
  try {
    const token = getCookie("jwt");
    jwt.verify(token, jwks.keys[0].n);
    return true;
  } catch (e) {
    log.error("The JSON Web Token (JWT) requires a valid https certificate.");
    log.error("The JSON Web Key Set (JWKS) must contain the public key of the certificate.");
    log.error(e.stack);
    return false;
  }
}

export function getUserInfo() {
  const token = getCookie("jwt");
  return jwt.verify(token, jwks.keys[0].n);
}
