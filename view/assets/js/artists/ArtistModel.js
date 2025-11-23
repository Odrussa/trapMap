/**
 * ArtistModel
 * Modello dati unico per artista.
 *
 * Garantisce coerenza tra:
 * - form
 * - preview
 * - salvataggio
 * - card visualizzata
 */

export class ArtistModel {
  constructor({
    artist_name = "",
    artist_alias = "",
    region = "",
    province = "",
    category = "",
    instagram = "",
    spotify = "",
    soundcloud = "",
    image = null
  } = {}) {

    this.artist_name = artist_name.trim();
    this.artist_alias = artist_alias.trim().replace(/^@+/, "");
    this.region = region.trim();
    this.province = province.trim();
    this.category = category.trim();
    this.instagram = instagram.trim();
    this.spotify = spotify.trim();
    this.soundcloud = soundcloud.trim();
    this.image = image; // base64, URL o path
  }

  /**
   * Metodo statico: costruisce il Model direttamente dal form
   */
  static fromForm(formElement, previewImageSrc = null) {
    const formData = new FormData(formElement);

    return new ArtistModel({
      artist_name: formData.get("artist_name"),
      artist_alias: formData.get("artist_alias"),
      region: formData.get("region"),
      province: formData.get("province"),
      category: formData.get("category"),
      instagram: formData.get("instagram"),
      spotify: formData.get("spotify"),
      soundcloud: formData.get("soundcloud"),
      image: previewImageSrc
    });
  }

  /**
   * Metodo statico: costruisce il Model per la PREVIEW live
   */
  static fromInputs(inputs, previewImageSrc) {
    return new ArtistModel({
      artist_name: inputs.artist_name?.value || "",
      artist_alias: inputs.artist_alias?.value || "",
      region: inputs.region?.value || "",
      province: inputs.province?.value || "",
      category: inputs.category?.value || "",
      instagram: inputs.instagram?.value || "",
      spotify: inputs.spotify?.value || "",
      soundcloud: inputs.soundcloud?.value || "",
      image: previewImageSrc
    });
  }
}
