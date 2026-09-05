export const projectDomains = [
  "automobile",
  "security",
  "energy",
  "industry",
  "digital",
  "networks",
] as const;

export type ProjectDomain = (typeof projectDomains)[number];
export type ProjectMediaType = "image" | "video";

export type ProjectMedia = {
  id: string;
  domain: ProjectDomain;
  type: ProjectMediaType;
  src: string;
  title: string;
};

const mediaModules = import.meta.glob<string>(
  "../assets/media/projects/**/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm,mov}",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
);

const videoExtensions = new Set(["mp4", "webm", "mov"]);

const formatTitle = (path: string) => {
  const filename = path.split("/").pop() ?? "Réalisation TSB";

  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[\s_-]*/, "")
    .replace(/[\s_-]+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
};

const findDomain = (path: string): ProjectDomain | null =>
  projectDomains.find((domain) =>
    path.toLowerCase().includes(`/projects/${domain}/`)
  ) ?? null;

export const projectMedia: ProjectMedia[] = Object.entries(mediaModules)
  .map(([path, src]) => {
    const domain = findDomain(path);
    if (!domain) return null;

    const extension = path.split(".").pop()?.toLowerCase() ?? "";

    return {
      id: path,
      domain,
      type: videoExtensions.has(extension) ? "video" : "image",
      src,
      title: formatTitle(path),
    } satisfies ProjectMedia;
  })
  .filter((media): media is ProjectMedia => media !== null)
  .sort((a, b) => a.id.localeCompare(b.id));

export const getProjectMedia = (domain: ProjectDomain) =>
  projectMedia.filter((media) => media.domain === domain);
