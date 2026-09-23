// Images for the kid-friendly demo are bundled with the build (copied from
// assets/ by jspsych-builder), so every path is relative to the page.
export const KID_IMAGE_DIR = "assets/images/kid/";

export function kidImage(filename) {
  return KID_IMAGE_DIR + filename;
}
