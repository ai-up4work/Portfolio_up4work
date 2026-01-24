"use client";

import {
  Button,
  Heading,
  Icon,
  Tag,
  Text,
  Meta,
  Background,
  Column,
  Row,
  opacity,         // Added import
  SpacingToken,    // Added import
} from "@once-ui-system/core";
import { baseURL, mailchimp } from "@/resources"; // Added mailchimp import
import styles from "@/components/about/about.module.scss";

const company = {
  name: "Up4Work",
  email: "ai.up4work@gmail.com",
  phone: "+94779633340",
  mission:
    "At Up4Work, our mission is to deliver robust and scalable solutions that empower businesses with modern technology. We transform complex business requirements into elegant, high-performance software that drives growth and efficiency.",
};

const expertise = [
  {
    role: "Software Developers",
    count: "5+",
    description: "Expert full-stack developers specializing in Next.js, React, PHP, and modern web frameworks.",
    skills: ["Next.js", "React", "PHP", "Node.js"]
  },
  {
    role: "Data Engineers",
    count: "3+",
    description: "Database architects and data pipeline experts working with SQL, NoSQL, and real-time analytics.",
    skills: ["PostgreSQL", "Supabase", "MongoDB", "Redis"]
  },
  {
    role: "AI Engineers",
    count: "2+",
    description: "Machine learning specialists implementing intelligent automation and predictive analytics.",
    skills: ["Python", "TensorFlow", "ML", "NLP"]
  },
  {
    role: "Digital Marketers",
    count: "3+",
    description: "SEO experts and growth strategists who optimize your digital presence and drive traffic.",
    skills: ["SEO", "Analytics", "Content Strategy"]
  },
];

export default function About() {
  return (
    <Column className={styles.about} fillWidth>
      
      {/* Mission Section */}
      <Column className={styles.section}>
        <Heading variant="display-strong-l" className={styles.sectionTitle}>
          Our Mission
        </Heading>
        <Text variant="body-default-m" className={styles.missionText}>
          {company.mission}
        </Text>
      </Column>

      {/* Expertise Section */}
      <Column className={styles.expertiseSection} fillWidth>
        <Column className={styles.expertiseIntro}>
          <Heading variant="display-strong-l" className={styles.expertiseTitle}>
            Our Expert Team
          </Heading>
          <Text variant="body-default-l" className={styles.expertiseSubtitle}>
            A diverse team of specialists bringing innovation and excellence to every project
          </Text>
        </Column>
        
        {/* GRID */}
        <div className={styles.expertiseGrid}>
          {expertise.map((expert, index) => (
            <Column
              key={index}
              className={styles.expertiseCard} // We'll keep this for hover logic
              position="relative"
              overflow="hidden"
              padding="l"
              radius="l"
              background="surface"
              border="neutral-alpha-weak"
              gap="s"
            >
              {/* --- MAILCHIMP EFFECT (COPIED EXACTLY) --- */}
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

              {/* CONTENT (With zIndex to sit on top of effect) */}
              <Column fillWidth style={{ zIndex: 1 }} gap="m">
                <div className={styles.expertiseHeader}>
                  <Text className={styles.expertiseCount}>
                    {expert.count}
                  </Text>
                  <Heading variant="heading-strong-l" className={styles.expertiseRole}>
                    {expert.role}
                  </Heading>
                </div>
                
                <Text variant="body-default-m" className={styles.expertiseDescription}>
                  {expert.description}
                </Text>
                
                <Row gap="xs" wrap className={styles.expertiseSkills}>
                  {expert.skills.map((skill, skillIndex) => (
                    <Tag key={skillIndex} size="s" variant="neutral">
                      {skill}
                    </Tag>
                  ))}
                </Row>
              </Column>
            </Column>
          ))}
        </div>
      </Column>

      {/* Contact Section */}
      <Column className={styles.contactSection}>
        <Heading variant="display-strong-l" className={styles.sectionTitle}>
          Let's Build Something Great
        </Heading>
        <Text variant="body-default-l" className={styles.missionText}>
          Ready to transform your business with modern technology? Get in touch with us today.
        </Text>
        
        <div className={styles.contactButtons}>
          <Button 
            href={`mailto:${company.email}`} 
            variant="secondary" 
            size="l"
          >
            ✉️ Email Us
          </Button>
          <Button 
            href={`tel:${company.phone}`} 
            variant="secondary" 
            size="l"
          >
             📞 Call Us
          </Button>
        </div>
      </Column>

    </Column>
  );
}
