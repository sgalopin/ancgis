/**
 * @module ancgis/client/ancgis/dao/AbstractDAO
 */

/**
 * @classdesc
 * Abstract DAO
 *
 * @api
 */
class AbstractDAO {

  /**
   * @param {module:ancgis/client/ancgis/dao/AbstractDAO~Dbm=} dbm Dbm.
   */
  constructor(dbm) {
    if(dbm){
      this.dbm = dbm;
    } else {
      throw new Error("A Database Manager is required");
    }
  }

  createFeature(collection, geoJsonFeature) {
    return this.dbm.create(collection, geoJsonFeature)
    .catch(error => console.error(error));
  }

  readFeature(collection, id){

  }

  updateFeature(collection, geoJsonFeature) {
    return this.dbm.update(collection, geoJsonFeature)
    .catch(error => console.error(error));
  }

  deleteFeature(collection, id) {
    return this.dbm.delete(collection, id)
    .catch(error => console.error(error));
  }
};

export default AbstractDAO;