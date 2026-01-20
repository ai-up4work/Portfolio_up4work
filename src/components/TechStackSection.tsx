"use client";

import { Column, Heading, Text, Background } from "@once-ui-system/core";
import { opacity, SpacingToken } from "@once-ui-system/core";
import { mailchimp } from "@/resources";

const TECH_STACK = [
  { name: "Next.js", logo: "/tech/nextjs.png" },
  { name: "AWS", logo: "/tech/aws.png" },
  { name: "Vercel", logo: "/tech/vercel.png" },
  { name: "Supabase", logo: "/tech/supabase.png" },
  { name: "TypeScript", logo: "/tech/typescript.png" },
  { name: "Snowflake", logo: "/tech/snowflake.png" },
  { name: "LangGraph", logo: "/tech/langgraph.png" },
  { name: "Python", logo: "/tech/python.png" },
  { name: "Docker", logo: "/tech/docker.png" },
];

export default function TechStackSection() {
  return (
    <Column fillWidth gap="xl" marginBottom="xl">
      {/* SECTION HEADER */}
      <Column align="center" gap="s">
        <Heading variant="display-strong-xs">Tech Stack We Use</Heading>
        <Text onBackground="neutral-weak">
          Modern, scalable, production-ready technologies
        </Text>
      </Column>

      {/* GRID */}
      <div className="tech-grid">
        {TECH_STACK.map((tech) => (
          <Column
            key={tech.name}
            className="tech-card"
            position="relative"
            overflow="hidden"
            padding="l"
            radius="l"
            background="surface"
            border="neutral-alpha-weak"
            horizontal="center"
            align="center"
            style={{ minHeight: "200px" }}
          >
            {/* MAILCHIMP EFFECT */}
            <Background
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              mask={{
                x: mailchimp.effects.mask.x,
                y: mailchimp.effects.mask.y,
                radius: mailchimp.effects.mask.radius,
                cursor: mailchimp.effects.mask.cursor,
              }}
              gradient={{
                display: mailchimp.effects.gradient.display,
                opacity: mailchimp.effects.gradient.opacity as opacity,
                x: mailchimp.effects.gradient.x,
                y: mailchimp.effects.gradient.y,
                width: mailchimp.effects.gradient.width,
                height: mailchimp.effects.gradient.height,
                tilt: mailchimp.effects.gradient.tilt,
                colorStart: mailchimp.effects.gradient.colorStart,
                colorEnd: mailchimp.effects.gradient.colorEnd,
              }}
              dots={{
                display: mailchimp.effects.dots.display,
                opacity: mailchimp.effects.dots.opacity as opacity,
                size: mailchimp.effects.dots.size as SpacingToken,
                color: mailchimp.effects.dots.color,
              }}
            />

            {/* LOGO */}
            <img
              src={tech.logo}
              alt={tech.name}
              style={{
                width: "96px",
                height: "96px",
                objectFit: "contain",
                marginBottom: "12px",
                zIndex: 1,
              }}
            />

            {/* NAME */}
            <Text variant="body-strong-s" style={{ zIndex: 1 }}>
              {tech.name}
            </Text>
          </Column>
        ))}
      </div>

      {/* STYLES */}
      <style jsx>{`
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
        }

        .tech-card {
          transition:
            transform 140ms ease-out,
            box-shadow 140ms ease-out,
            border-color 140ms ease-out;
          will-change: transform;
        }

        @media (hover: hover) {
          .tech-card:hover {
            transform: translateY(-6px);
            border-color: rgba(255, 255, 255, 0.22);
            box-shadow:
              0 18px 40px rgba(0, 0, 0, 0.45),
              0 0 0 1px rgba(255, 255, 255, 0.08);
          }
        }

        /* TABLET */
        @media (max-width: 900px) {
          .tech-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* MOBILE */
        @media (max-width: 600px) {
          .tech-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          /* CENTER LAST ITEM */
          .tech-card:last-child {
            grid-column: 1 / -1;
            justify-self: center;
            width: 60%;
          }
        }
      `}</style>
    </Column>
  );
}
