import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Up4Work",
  lastName: "",
  name: "Up4Work",
  role: "Software Development",
  avatar: "/images/avatar.png",
  email: "ai.up4work@gmail.com",
  location: "Asia/Colombo", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>Updates about our latest projects, web solutions, and digital services.</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  // Set essentials: true for links you want to show on the about page
  // {
  //   name: "GitHub",
  //   icon: "github",
  //   link: "https://github.com/awork",
  //   essential: true,
  // },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/company/onaaaa/",
    essential: true,
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/up4work.io?igsh=c2l2czFkZWg3NnI4&utm_source=qr",
    essential: false,
  },
  // {
  //   name: "Threads",
  //   icon: "threads",
  //   link: "https://www.threads.com/@once_ui",
  //   essential: true,
  // },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}`,
  description: `We build websites, software and digital solutions in Sri Lanka ${person.role}`,
  headline: <>Bringing your digital ideas to life</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Up4Work</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work",
  },
  subline: (

    <>
      We are <Text as="span" size="xl" weight="strong">Up4Work</Text>, a modern AI and software development team. <br />
      We build scalable intelligent systems and custom software solutions for startups and businesses.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        <strong>Up4Work</strong> is a software development company bringing digital ideas to life.
        We focus on developing modern websites, scalable software solutions, and also provide digital marketing
        services to help businesses grow online.
      </>
    ),
  },
  work: {
    display: true,
    title: "Featured Projects",
    experiences: [
      {
        company: "Alzia",
        timeframe: "2026",
        role: "Web Application",
        achievements: [
          <>A premium e-commerce platform for luxury natural cosmetic products.</>,
          <>Developed using Next.js and React to ensure high-performance, SEO-friendly storefronts.</>,
          <>Integrated secure payment gateways and scalable database management for a seamless shopping experience.</>,
        ],
        images: [
          {
            src: "/images/alzia.png",  // Add your Alzia screenshot here
            alt: "Alzia Web Application",
            width: 16,
            height: 9,
          },
        ],
      },

    ],
  },
  studies: {
    display: true,
    title: "What We Can Build for You",
    institutions: [
      {
        name: "Web, Mobile & Cloud Apps",
        description: <>Full-stack web applications, mobile apps, and cloud-based solutions.</>,
        images: [
          {
            src: "/images/Web.png",
            alt: "Web, Mobile & Cloud Apps",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        name: "AI Solutions",
        description: <>AI-powered applications and intelligent automation systems.</>,
        images: [
          {
            src: "/images/AI solution.png",
            alt: "AI Solutions",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        name: "Business Management Systems",
        description: <>Custom software for inventory, CRM, and workflow management.</>,
        images: [
          {
            src: "/images/BMS.png",
            alt: "Business Management Systems",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
  technical: {
    display: true,
    title: "Our Tech Stack",
    skills: [
      {
        title: "Frontend Technologies",
        tags: [
          { name: "Next.js", icon: "nextjs" },
          { name: "React", icon: "react" },
          { name: "JavaScript", icon: "javascript" },
          { name: "TypeScript", icon: "typescript" },
        ],
        images: [],  // No images
      },
      {
        title: "Backend & Database",
        tags: [
          { name: "Node.js", icon: "nodejs" },
          { name: "Java" },
          { name: "Python" },
          { name: "MongoDB", icon: "mongodb" },
          { name: "Supabase" },
        ],
        images: [],  // No images
      },
      {
        title: "Cloud & Deployment",
        tags: [
          { name: "Vercel" },
          { name: "AWS" },
          { name: "Firebase" },
          { name: "Snowflake" },
        ],
        images: [],  // No images
      },
    ],
  },


};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Articles & Updates",
  description: `Read updates from ${person.name}`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Projects and solutions by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
