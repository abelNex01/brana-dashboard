// ─── Cloudinary Image Catalog ────────────────────────────────────────────────
// Maps semantic keys to Cloudinary public IDs or full URLs.
// This is the SINGLE SOURCE OF TRUTH for all default/seed images.
// To update an image, change only the URL here — every component picks it up.

export const CloudinaryImages = {
  gear: {
    // Cameras
    sonyFx3:    "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796795/camera1_lpet4k.webp",
    canonR5:    "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796795/camera2_tiosmi.webp",
    sonyA7iv:   "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796795/camera3_gnkxet.webp",

    // Drones
    djiMavic3:  "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796795/drone1_ohtk2o.webp",
    djiAir2s:   "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796796/drone2_wghuxx.webp",

    // Lenses
    sigma2470:  "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796795/lens1_aj8tyi.webp",
    canonRf50:  "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796796/lens2_smx6xq.webp",
    sony70200:  "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796796/lens3_kvg0nu.webp",
    tamron1728: "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796796/lens4_gsoqdn.webp",
    sigma85:    "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796796/lens5_phvven.webp",
    sony35:     "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796796/lens6_ggbgyh.webp",

    // Lighting
    aputure600d:     "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796796/light1_f0v2tn.webp",
    godoxV1:         "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796797/light2_mua2vv.webp",
    aputureLightDome:"https://res.cloudinary.com/dssxrvi97/image/upload/v1784796797/light3_hvehaf.webp",
    amaran200x:      "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796798/light4_f22wsr.webp",

    // Audio
    rodeWireless:   "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796799/mic1_cmhvfc.webp",
    sennheiser416:  "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796799/mic2_kk3sl5.webp",

    // Stabilizers
    roninRs4:     "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796799/stablizer1_uy4wzn.webp",
    roninS:       "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796800/stablizer2_w3eo3n.webp",
    zhiyunCrane3: "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796800/stablizer3_hohohd.webp",

    // Editing
    davinciResolve: "https://res.cloudinary.com/dssxrvi97/image/upload/v1784796795/editor_ciqabk.webp",
  },
} as const;

/** Flat lookup: gear name → Cloudinary URL (used by the seed script mapping) */
export const GEAR_IMAGE_MAP: Record<string, string> = {
  "Sony FX3":            CloudinaryImages.gear.sonyFx3,
  "Canon EOS R5":        CloudinaryImages.gear.canonR5,
  "Sony A7 IV":          CloudinaryImages.gear.sonyA7iv,
  "DJI Mavic 3 Pro":     CloudinaryImages.gear.djiMavic3,
  "DJI Air 2S":          CloudinaryImages.gear.djiAir2s,
  "Sigma 24-70mm":       CloudinaryImages.gear.sigma2470,
  "Canon RF 50mm":       CloudinaryImages.gear.canonRf50,
  "Sony 70-200mm":       CloudinaryImages.gear.sony70200,
  "Tamron 17-28mm":      CloudinaryImages.gear.tamron1728,
  "Sigma 85mm":          CloudinaryImages.gear.sigma85,
  "Sony 35mm":           CloudinaryImages.gear.sony35,
  "Aputure 600D":        CloudinaryImages.gear.aputure600d,
  "Godox V1":            CloudinaryImages.gear.godoxV1,
  "Aputure Light Dome":  CloudinaryImages.gear.aputureLightDome,
  "Amaran 200x":         CloudinaryImages.gear.amaran200x,
  "Rode Wireless Pro":   CloudinaryImages.gear.rodeWireless,
  "Sennheiser MKH 416":  CloudinaryImages.gear.sennheiser416,
  "DJI Ronin RS4":       CloudinaryImages.gear.roninRs4,
  "DJI Ronin-S":         CloudinaryImages.gear.roninS,
  "Zhiyun Crane 3S":     CloudinaryImages.gear.zhiyunCrane3,
  "DaVinci Resolve":     CloudinaryImages.gear.davinciResolve,
};

export const AuthSlides = {
  slide1: "https://res.cloudinary.com/dssxrvi97/image/upload/v1710000000/samples/landscapes/nature-mountains.jpg",
  slide2: "https://res.cloudinary.com/dssxrvi97/image/upload/v1710000000/samples/landscapes/architecture-signs.jpg",
  slide3: "https://res.cloudinary.com/dssxrvi97/image/upload/v1710000000/samples/landscapes/beach-boat.jpg",
  avatar: "https://res.cloudinary.com/dssxrvi97/image/upload/v1710000000/samples/people/smiling-man.jpg",
};
