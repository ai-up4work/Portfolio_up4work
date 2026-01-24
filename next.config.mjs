import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "alzia.vercel.app",
      pathname: "**",
    },
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
      pathname: "**",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "**",
    },
  ],
},
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default withMDX(nextConfig);