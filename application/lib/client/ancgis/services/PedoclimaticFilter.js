/**
 * @module ancgis/client/ancgis/services/PedoclimaticFilter
 */

import * as log from "loglevel";
import PedoclimaticZoneDAO from "../dao/PedoclimaticZoneDAO.js";

/**
 * @classdesc
 * A pedoclimatic filter for the taxon list.
 *
 * @api
 */
class PedoclimaticFilter {

  /**
   * @param {module:ancgis/client/ancgis/services/PedoclimaticFilter~Options=} options Options.
   */
  constructor(options) { // eslint-disable-line complexity
    // Checks the required options
    if (!options.idbm) {
      throw new Error("PedoclimaticFilter requires a database connection.");
    }
    if (!options.vegetationZone) {
      throw new Error("PedoclimaticFilter requires a vegetation zone.");
    }
    if (!options.taxonsList) {
      throw new Error("PedoclimaticFilter requires a taxons list.");
    }

    // Sets the class attributs
    this.idbm = options.idbm;
    this.vegetationZone = options.vegetationZone;
    this.fullTaxonsList = options.taxonsList;
    this.filteredTaxonsList = this.getFilteredTaxonsList();

  }

  /**
   * Get the pedoclimatic zones intersecting the vegetation zone from the locale table.
   * @return {array} The pedoclimatic zones.
   * @private
   */
  getPedoclimaticZones() {
    const self = this;
    let pcZoneDAO = new PedoclimaticZoneDAO(self.idbm); // TODO
    console.log(pcZoneDAO);
    return pcZoneDAO.getIntersectedZones(self.vegetationZone); // TODO
  }

  /**
   * Get the pedoclimatic vectors.
   * @return {array} The pedoclimatic vectors.
   * @private
   */
  getPedoclimaticVectors() {
    const self = this;
    let pcZones = self.getPedoclimaticZones();
    let pcVectors = [];
    if ((typeof pcZones[0].acidity == 'object') & (pcZones[0].acidity != null ) ) {

      max_acidity = Math.max(...pcZones[0].acidity);
      min_acidity = Math.min(...pcZones[0].acidity);
    }
    else {
      max_acidity = pcZones[0].acidity;
      min_acidity = pcZones[0].acidity;
    }
    if (( typeof pcZones[0].moisture == 'object') & (pcZones[0].moisture != null ) ){
      max_moisture = Math.max(...pcZones[0].moisture);
      min_moisture = Math.min(...pcZones[0].moisture);
    }
    else {
      max_moisture = pcZones[0].moisture;
      min_moisture = pcZones[0].moisture;
    }

    if ((typeof pcZones[0].texture == 'object') & (pcZones[0].texture != null ) ){
     max_texture = Math.max(...pcZones[0].texture);
     min_texture = Math.min(...pcZones[0].texture);
    }
    else {
     max_texture = pcZones[0].texture;
     min_texture = pcZones[0].texture;
    }

    if( (typeof pcZones[0].salinity == 'object' ) & (pcZones[0].salinity != null ) ){
     max_salinity = Math.max(...pcZones[0].salinity);
     min_salinity = Math.min(...pcZones[0].salinity);
    }
    else {
     max_salinity = pcZones[0].salinity;
     min_salinity = pcZones[0].salinity;
    }

    if ((typeof pcZones[0].organicmat == 'object') & (pcZones[0].organicmat != null ) ){
     max_organicmat = Math.max(...pcZones[0].organicmat);
     min_organicmat = Math.min(...pcZones[0].organicmat);
    }
    else {
     max_organicmat= pcZones[0].organicmat;
     min_organicmat = pcZones[0].organicmat;
    }

    if ((typeof pcZones[0].nutrients == 'object' )& (pcZones[0].nutrients != null ) ){
     max_nutrients = Math.max(...pcZones[0].nutrients);
     min_nutrients = Math.min(...pcZones[0].nutrients);
    }
    else{
     max_nutrients= pcZones[0].nutrients;
     min_nutrients = pcZones[0].nutrients;
    }

    if ((typeof pcZones[0].brightness == 'object') & (pcZones[0].brightness!= null ) ){
     max_brightness = Math.max(...pcZones[0].brightness);
     min_brightness = Math.min(...pcZones[0].brightness);
    }
    else {
     max_brightness = pcZones[0].brightness;
     min_brightness = pcZones[0].brightness;
    }

    if ((typeof pcZones[0].moisture_atmo == 'object') & (pcZones[0].moisture_atmo != null ) ){
     max_moisture_atmo = Math.max(...pcZones[0].moisture_atmo);
     min_moisture_atmo = Math.min(...pcZones[0].moisture_atmo);
    }
    else {
     max_moisture_atmo = pcZones[0].moisture_atmo;
     min_moisture_atmo = pcZones[0].moisture_atmo;
    }

    if ((typeof pcZones[0].temperature == 'object') & (pcZones[0].temperature != null ) ){
     max_temperature  = Math.max(...pcZones[0].temperature );
     min_temperature  = Math.min(...pcZones[0].temperature );
    }
    else {
     max_temperature  = pcZones[0].temperature ;
     min_temperature  = pcZones[0].temperature ;
    }

    if ((typeof pcZones[0].continentalite == 'object') & (pcZones[0].continentalite != null ) ){
     max_continentalite = Math.max(...pcZones[0].continentalite);
     min_continentalite = Math.min(...pcZones[0].continentalite);
    }
    else {
     max_continentalite = pcZones[0].continentalite;
     min_continentalite = pcZones[0].continentalite;
    }

    for (i = 1;i < pcZones.length;i++){

      if ((typeof pcZones[i].acidity == 'object')  & (pcZones[0].acidity != null ) ){
       if (max_acidity < Math.max(...pcZones[i].acidity) ) { max_acidity = Math.max(...pcZones[i].acidity); }
       if (min_acidity > Math.min(...pcZones[i].acidity) ) { min_acidity = Math.min(...pcZones[i].acidity); }
      }
      else if (typeof pcZones[i].acidity == 'number') {
       if (max_acidity < pcZones[i].acidity)  { max_acidity = pcZones[i].acidity; }
       if (min_acidity > pcZones[i].acidity)  { min_acidity = pcZones[i].acidity; }
      }
       //si valeur 'null' on fait rien

      if ((typeof pcZones[i].moisture == 'object') & (pcZones[0].moisture != null ) ){
       if (max_moisture < Math.max(...pcZones[i].moisture) ) { max_moisture = Math.max(...pcZones[i].moisture); }
       if (min_moisture > Math.min(...pcZones[i].moisture) ) { min_moisture = Math.min(...pcZones[i].moisture); }
      }
      else if (typeof pcZones[i].moisture == 'number'){
       if (max_moisture < pcZones[i].moisture)  { max_moisture = pcZones[i].moisture; }
       if (min_moisture > pcZones[i].moisture)  { min_moisture = pcZones[i].moisture; }
       }
      if ((typeof pcZones[i].texture == 'object') & (pcZones[0].texture != null ) ){
       if (max_texture < Math.max(...pcZones[i].texture) ) { max_moisture = Math.max(...pcZones[i].texture); }
       if (min_texture > Math.min(...pcZones[i].texture) ) { min_moisture = Math.min(...pcZones[i].texture); }
      }
      else if (typeof pcZones[i].texture == 'number') {
       if (max_texture < pcZones[i].texture)  { max_texture = pcZones[i].texture; }
       if (min_texture > pcZones[i].texture)  { min_texture = pcZones[i].texture; }
      }
      if ((typeof pcZones[i].salinity == 'object')  & (pcZones[0].salinity != null )  ){
       if (max_salinity < Math.max(...pcZones[i].salinity) ) { max_salinity = Math.max(...pcZones[i].salinity); }
       if (min_salinity > Math.min(...pcZones[i].salinity) ) { min_salinity = Math.min(...pcZones[i].salinity); }
      }
      else if (typeof pcZones[i].salinity == 'number'){
       if (max_salinity < pcZones[i].salinity)  { max_salinity = pcZones[i].salinity; }
       if (min_salinity > pcZones[i].salinity)  { min_salinity= pcZones[i].salinity; }
      }
      if ((typeof pcZones[i].organicmat == 'object') & (pcZones[0].organicmat != null ) ){
       if (max_organicmat < Math.max(...pcZones[i].organicmat) ) { max_organicmat = Math.max(...pcZones[i].organicmat); }
       if (min_organicmat > Math.min(...pcZones[i].organicmat) ) { min_organicmat = Math.min(...pcZones[i].organicmat); }
      }
      else if ((typeof pcZones[i].organicmat == 'number') & (pcZones[0].continentalite != null ) ){
       if (max_organicmat < pcZones[i].organicmat)  { max_organicmate = pcZones[i].organicmat; }
       if (min_organicmat > pcZones[i].organicmat)  { min_organicmat = pcZones[i].organicmat; }
      }
      if ((typeof pcZones[i].nutrients == 'object') & (pcZones[0].nutrients != null ) ){
       if (max_nutrients < Math.max(...pcZones[i].nutrients) ) { max_nutrients = Math.max(...pcZones[i].nutrients); }
       if (min_nutrients > Math.min(...pcZones[i].nutrients) ) { min_nutrients = Math.min(...pcZones[i].nutrients); }
      }
      else if (typeof pcZones[i].nutrients == 'number'){
       if (max_nutrients < pcZones[i].nutrients)  { max_nutrients = pcZones[i].nutrients; }
       if (min_nutrients > pcZones[i].moisture)  { min_nutrients = pcZones[i].nutrients; }
      }
      if ((typeof pcZones[i].brightness == 'object') & (pcZones[0].brightness != null ) ){
       if (max_brightness < Math.max(...pcZones[i].brightness) ) { max_brightness = Math.max(...pcZones[i].brightness); }
       if (min_brightness > Math.min(...pcZones[i].brightness) ) { min_brightness = Math.min(...pcZones[i].brightness); }
      }
      else if (typeof pcZones[i].brightness == 'number'){
       if (max_brightness < pcZones[i].brightness)  { max_brightness = pcZones[i].brightness; }
       if (min_brightness > pcZones[i].brightness)  { min_brightness = pcZones[i].brightness; }
      }
      if ((typeof pcZones[i].moisture_atmo == 'object') & (pcZones[0].moisture_atmo != null ) ){
       if (max_moisture_atmo < Math.max(...pcZones[i].moisture_atmo) ) { max_moisture_atmo = Math.max(...pcZones[i].moisture_atmo); }
       if (min_moisture_atmo > Math.min(...pcZones[i].moisture_atmo) ) { min_moisture_atmo = Math.min(...pcZones[i].moisture_atmo); }
      }
      else if (typeof pcZones[i].moisture_atmo == 'number'){
       if (max_moisture_atmo < pcZones[i].moisture_atmo)  { max_moisture = pcZones[i].moisture_atmo; }
       if (min_moisture_atmo > pcZones[i].moisture_atmo)  { min_moisture = pcZones[i].moisture_atmo; }
      }
      if ((typeof pcZones[i].temperature == 'object') & (pcZones[0].temperature != null ) ){
       if (max_temperature < Math.max(...pcZones[i].temperature) ) { max_temperature = Math.max(...pcZones[i].temperature); }
       if (min_temperature > Math.min(...pcZones[i].temperature) ) { min_temperature = Math.min(...pcZones[i].temperature); }
      }
      else if (typeof pcZones[i].temperature == 'number'){
       if (max_temperature < pcZones[i].temperature)  { max_temperature = pcZones[i].temperature; }
       if (min_temperature > pcZones[i].temperature)  { min_temperature = pcZones[i].temperature; }
      }
      if ((typeof pcZones[i].continentalite == 'object') & (pcZones[0].continentalite != null ) ){
       if (max_continentalite < Math.max(...pcZones[i].continentalite) ) { max_continentalite = Math.max(...pcZones[i].continentalite); }
       if (min_continentalite > Math.min(...pcZones[i].continentalite) ) { min_continentalite = Math.min(...pcZones[i].continentalite); }
      }
      else if (typeof pcZones[i].continentalite == 'number'){
       if (max_continentalite < pcZones[i].continentalite)  { max_continentalite = pcZones[i].continentalite; }
       if (min_continentalite > pcZones[i].continentalite)  { min_continentalite = pcZones[i].continentalite; }
      }
      pcVectors = [[min_acidity,max_acidity],[min_moisture,max_moisture],[min_texture,max_texture],[min_salinity,max_salinity],[min_organicmat,max_organicmat],[min_nutrients,max_nutrients],
      [min_brightness,max_brightness],[min_moisture_atmo,max_moisture_atmo],[min_temperature,max_temperature],[min_continentalite,max_continentalite]]
    }
    return pcVectors;
  }
  /*
   * L'objectif de la fonction est de construire un vecteur contenant les 10 infos de chaque taxon (acidity, salinity..) à partir de la table complète
   */
  function getTaxonsVectors(doc_taxons){
    let taxons = doc_taxons;
    var taxonsVectors = [];
    for (i = 1;i < doc_taxons.features.length;i++){
      let taxon = [];

      taxon.push(taxons.features[i].ecology.soil.acidity);
      taxon.push(taxons.features[i].ecology.soil.moisture);
      taxon.push(taxons.features[i].ecology.soil.texture);
      taxon.push(taxons.features[i].ecology.soil.nutrients);
      taxon.push(taxons.features[i].ecology.soil.salinity);
      taxon.push(taxons.features[i].ecology.soil.organicMaterial);
      taxon.push(taxons.features[i].ecology.climate.brightness);
      taxon.push(taxons.features[i].ecology.climate.moisture);
      taxon.push(taxons.features[i].ecology.climate.temperature);
      taxon.push(taxons.features[i].ecology.climate.continentality);

      taxonsVectors.push(taxon);

     }
     return taxonsVectors;
   }
/**
 * Get the filtered taxons list.
 * @return {array} The filtered taxons list.
 * @private
 */
  getFilteredTaxonsList() {
    const self = this;
    let pcZones = self.getPedoclimaticVectors();
    let filteredTaxonsList = [];
    let taxonsVectors = getTaxonsVectors(this.fullTaxonsList);

   let filteredIndices = [];
   for (i= 0;i < taxonsVectors.length;i++){

     dist = calculDistance(pcZoneVectors,taxonsVectors[i]);
     if (dist<5){
       filteredIndices.push(i)
     }
   }
   var filteredTaxonsList = getRecupNameTaxon(filteredIndices,doc_taxons)
   return filteredTaxonsList;
  }
  /*
  * Cette fonction calcul la distance euclidienne entre deux vecteurs
  */
  function calculDistance(vectZones,vectPlantes){
    //Initialisation de la variable somme

    //1er cas : les critères sont sous formes d'un nombre
    if ((typeof vectPlantes[0] == "number") & (typeof vectZones[0] == "number")) {
      var somme = Math.pow(Math.abs(vectZones[0] - vectPlantes[0]),2);
    }
    //2eme cas : Le critere plante est sous forme d'un nombre et le critere zone d'un vecteur
    else if ((typeof vectPlantes[0] == "number") & (typeof vectZones[0] != "number")){
      if ((vectPlantes[0] >= vectZones[0][0]) & (vectPlantes[0] <= vectZones[0][1])){
        var somme = 0;
      }
      else {
        var somme = somme + Math.pow(Math.min(Math.abs(vectZones[0][0]-vectPlantes[0]),Math.abs(vectZones[0][1]-vectPlantes[0])),2);
      }
    }
    //3eme cas : Le critere zone est sous forme d'un nombre et le critere plante d'un vecteur
    else if ((typeof vectPlantes[0] != "number") & (typeof vectZones[0] == "number")){
      if (((vectZones[0] >= vectPlantes[0][0]) & (vectZones[0] <= vectPlantes[0][1]))){
        var somme = 0;
      }
      else {
        var somme = somme + Math.pow(Math.min(Math.abs(vectZones[0]-vectPlantes[0][0]),Math.abs(vectZones[0]-vectPlantes[0][1])),2);
      }
    }
    //4eme cas : Les deux critères sont la forme d'un vecteur
    else if ((typeof vectPlantes[0] != "number") & (typeof vectZones[0] != "number")){
      var vP1 = vectPlantes[0][0]
      var vP2 = vectPlantes[0][1]
      var vZ1 = vectZones[0][0]
      var vZ2 = vectZones[0][1]
      if (((vZ1 <= vP2 ) & (vP2 <= vZ2 )) || ((vP1 <= vZ2 ) & (vP1 <= vZ2 ))) {
        var somme = 0;
      }
      else {
        var somme = somme + Math.pow(Math.min(Math.abs(vP2-vZ1),Math.abs(vP1-vZ2)),2);
      }
    }
    //Fin Initialisation de la variable somme


    for (var i = 1; i < vectZones.length; i++) {
      if ((typeof vectPlantes[i] == "number") & (typeof vectZones[i] == "number")) {
         somme = somme + Math.pow(vectZones[i] - vectPlantes[i],2);
      }
      //2eme cas : Le critere plante est sous forme d'un nombre et le critere zone d'un vecteur
      else if ((typeof vectPlantes[i] == "number") & (typeof vectZones[i] != "number")){
        if ((vectPlantes[i] >= vectZones[i][0]) & (vectPlantes[i] <= vectZones[i][1])){
          somme = somme + 0;
        }
        else {
          somme = somme + Math.pow(Math.min(Math.abs(vectZones[i][0]-vectPlantes[i]),Math.abs(vectZones[i][1]-vectPlantes[i])),2);
        }
      }
      //3eme cas : Le critere zone est sous forme d'un nombre et le critere plante d'un vecteur
      else if ((typeof vectPlantes[i] != "number") & (typeof vectZones[i] == "number")){
        if ((vectZones[i] >= vectPlantes[i][0]) & (vectZones[i] <= vectPlantes[i][1])){
          somme = somme + 0;

        }
        else {
          somme = somme + Math.pow(Math.min(Math.abs(vectZones[i]-vectPlantes[i][0]),Math.abs(vectZones[i]-vectPlantes[i][1])),2);

        }
      }
      //4eme cas : Les deux critères sont la forme d'un vecteur
      else if ((typeof vectPlantes[i] != "number") & (typeof vectZones[i] != "number")){
        var vP1 = vectPlantes[i][0]
        var vP2 = vectPlantes[i][1]
        var vZ1 = vectZones[i][0]
        var vZ2 = vectZones[i][1]
        if (((vZ1 <= vP2 ) & (vP2 <= vZ2 )) || ((vZ1 <= vP1 ) & (vP1 <= vZ2 )) ){
           somme = somme + 0;

        }
        else {
           somme = somme + Math.pow(Math.min(Math.abs(vP2-vZ1),Math.abs(vP1-vZ2)),2);

        }
      }
    }
  return Math.sqrt(somme);
  };

  function getRecupNameTaxon(filteredIndices,taxons){
   var taxonsFilteredName = [];
   for (i= 0;i < filteredIndices.length;i++){
     taxonsFilteredName.push(taxons.features[i].name.fr)
   }
  this.filteredTaxonsList = taxonsFilteredName;
  }
  /**
   * Get the filtered taxons list.
   * @return {array} The filtered taxons list.
   * @public
   */
  getList() {
    return this.filteredTaxonsList;
  }
}

export default PedoclimaticFilter;
