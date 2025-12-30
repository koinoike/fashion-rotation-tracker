export class Outfit {
  constructor(data, context = {}) {
    this.price = data.price;
    this.currency = data.currency;
    this.setName = data.setName;
    this.name = data.name || []; // ← Make optional, default to empty array
    this.designer = data.designer;
    this.date = data.date;

    this.collectionId = context.collectionId;
    this.podiumIndex = context.podiumIndex;
    this.season = context.season;
    this.timeIndex = context.timeIndex;
    this.outfitId = context.outfitId || data.outfitId; // ID from JSON

    // Build image path from the 'image' field in JSON
    // This is bullet-proof: exact filename from JSON
    const imageFilename = data.image;
    if (!imageFilename) {
      console.error("Missing 'image' field in outfit data:", data);
    }
    this.imagePath = `/assets/transparent/${this.season}/${imageFilename}`;
  }

  get displayPrice() {
    return this.price.toLocaleString("ru-RU");
  }

  get nr() {
    if (!this.collectionId || this.podiumIndex === undefined) return null;
    return `${this.collectionId}_${this.podiumIndex + 1}`;
  }

  get priceLabel() {
    const currencyName = this.currency === "coins" ? "коинов" : "румбиков";
    return `${this.displayPrice} ${currencyName}`;
  }

  get currencyIcon() {
    const iconName = this.currency === "coins" ? "coin.png" : "rumb.png";
    return `/assets/currencies/${iconName}`;
  }

  get formattedDate() {
    return this.date ? new Date(this.date).toLocaleDateString("ru-RU") : null;
  }

  get details() {
    return Array.isArray(this.name)
      ? this.name.filter(Boolean)
      : this.name
      ? [this.name]
      : [];
  }

  get hasDetails() {
    return this.details.length > 0;
  }

  getTransparentImage() {
    return this.imagePath;
  }

  getCloseupImage() {
    if (!this.imagePath) return null;
    // Use the same filename but in closeups folder
    const filename = this.imagePath.split("/").pop();
    return `/assets/closeups/${filename}`;
  }

  getFallbackImage() {
    return this.getTransparentImage();
  }

  isValid() {
    return !!(
      this.price &&
      this.currency &&
      this.setName &&
      this.collectionId &&
      this.podiumIndex !== undefined &&
      this.outfitId
    );
  }

  toDetailCard() {
    return {
      setName: this.setName,
      price: this.displayPrice,
      currency: this.currency,
      currencyIcon: this.currencyIcon,
      designer: this.designer,
      date: this.formattedDate,
      details: this.details,
      image: this.getTransparentImage(),
      priceLabel: this.priceLabel,
    };
  }

  static fromJSON(data, context) {
    return new Outfit(data, context);
  }

  static fromCollectionData(collectionData, collectionId, season) {
    if (!Array.isArray(collectionData)) return [];
    return collectionData.map(
      (item, podiumIndex) =>
        new Outfit(item, {
          collectionId,
          podiumIndex,
          season,
          outfitId: item.outfitId, // Pass through the outfitId
        })
    );
  }

  static fromIndependentPodium(
    data,
    timeIndex,
    podiumIndex,
    season,
    actualCollectionId
  ) {
    return new Outfit(data, {
      collectionId: actualCollectionId,
      podiumIndex,
      season,
      timeIndex,
      outfitId: data.outfitId, // Pass through the outfitId
    });
  }
}
