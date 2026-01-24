"use client";

import { Column, Heading, Text, Background } from "@once-ui-system/core";
import { opacity, SpacingToken } from "@once-ui-system/core";
import { mailchimp } from "@/resources";

const SERVICES = [
  {
    title: "Integration Services",
    description: "Seamless API and system integrations tailored to your business.",
  },
  {
    title: "AI Solutions",
    description: "AI-powered systems to automate and optimize operations.",
  },
  {
    title: "Custom Software Development",
    description: "Scalable software built specifically for your needs.",
  },
  {
    title: "Business Website Development",
    description: "High-performance, conversion-focused business websites.",
  },
  {
    title: "ERP & POS Systems",
    description: "Enterprise-grade ERP and POS solutions.",
  },
  {
    title: "Management Systems",
    description: "Internal systems to manage workflows and teams.",
  },
];

export default function ServicesSection() {
  return (
    <Column fillWidth gap="xl" marginBottom="xl">
      {/* SECTION HEADER */}
      <Column align="center" gap="s">
        <Heading variant="display-strong-xs">Our Services</Heading>
        <Text onBackground="neutral-weak">
          What we build for modern businesses
        </Text>
      </Column>

      {/* GRID */}
      <div className="services-grid">
        {SERVICES.map((service, index) => (
          <Column
            key={index}
            className="service-card"
            position="relative"
            overflow="hidden"
            padding="l"
            radius="l"
            background="surface"
            border="neutral-alpha-weak"
            gap="s"
            style={{
              minHeight: "160px",
              justifyContent: "center",
            }}
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

            {/* CONTENT */}
            <Column gap="xs" style={{ zIndex: 1 }}>
              <Heading variant="heading-strong-m">
                {service.title}
              </Heading>

              <Text
                size="s"
                onBackground="neutral-weak"
                style={{ lineHeight: 1.6 }}
              >
                {service.description}
              </Text>
            </Column>
          </Column>
        ))}
      </div>

      {/* FAST HOVER + RESPONSIVE */}
      <style jsx>{`
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
        }

        .service-card {
          transition:
            transform 140ms ease-out,
            box-shadow 140ms ease-out,
            border-color 140ms ease-out;
          will-change: transform;
        }

        @media (hover: hover) {
          .service-card:hover {
            transform: translateY(-6px);
            border-color: rgba(255, 255, 255, 0.22);
            box-shadow:
              0 18px 40px rgba(0, 0, 0, 0.45),
              0 0 0 1px rgba(255, 255, 255, 0.08);
          }
        }

        @media (max-width: 768px) {
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Column>
  );
}
