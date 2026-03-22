/** Aspect ratio (width / height) for react-easy-crop from SiteImage.category */
export function aspectRatioForSiteImageCategory(category: string): number {
  switch (category) {
    case "blog":
    case "page":
      return 16 / 9;
    case "provider":
    case "branding":
      return 1;
    case "rescue":
      return 3 / 1;
    case "adoption":
      return 4 / 3;
    default:
      return 16 / 9;
  }
}
