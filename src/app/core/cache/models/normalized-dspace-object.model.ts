import { autoserialize, autoserializeAs } from "cerialize";
import { CacheableObject } from "../object-cache.reducer";
import { Metadatum } from "../../shared/metadatum.model";
import { ResourceType } from "../../shared/resource-type";

/**
 * An abstract model class for a DSpaceObject.
 */
export abstract class NormalizedDSpaceObject implements CacheableObject {

  @autoserialize
  self: string;

  /**
   * The human-readable identifier of this DSpaceObject
   */
  @autoserialize
  id: string;

  /**
   * The universally unique identifier of this DSpaceObject
   */
  @autoserialize
  uuid: string;

  /**
   * A string representing the kind of DSpaceObject, e.g. community, item, …
   */
  @autoserialize
  type: ResourceType;

  /**
   * The name for this DSpaceObject
   */
  @autoserialize
  name: string;

  /**
   * An array containing all metadata of this DSpaceObject
   */
  @autoserializeAs(Metadatum)
  metadata: Array<Metadatum>;

  /**
   * An array of DSpaceObjects that are direct parents of this DSpaceObject
   */
  @autoserialize
  parents: Array<string>;

  /**
   * The DSpaceObject that owns this DSpaceObject
   */
  @autoserialize
  owner: string;
}
