"use client";

import { useState } from "react";
import {
  Button,
  Heading,
  Text,
  Column,
  Background,
} from "@once-ui-system/core";
import { opacity, SpacingToken } from "@once-ui-system/core";
import { mailchimp } from "@/resources";

const WHATSAPP_NUMBER = "94779633340";

export default function ContactCTA() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    const finalMessage = `
Hello Up4Work Team,

We are looking for a technology solution.

Requirement:
${message}

Sent from portfolio website
    `.trim();

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        finalMessage
      )}`,
      "_blank"
    );
  };

  return (
    <Column
      position="relative"
      overflow="hidden"
      fillWidth
      padding="xl"
      radius="l"
      marginBottom="m"
      horizontal="center"
      align="center"
      background="surface"
      border="neutral-alpha-weak"
    >
      {/* ✅ EXACT SAME EFFECT ENGINE AS NEWSLETTER */}
      <Background
        position="absolute"
        top="0"
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
        grid={{
          display: mailchimp.effects.grid.display,
          opacity: mailchimp.effects.grid.opacity as opacity,
          color: mailchimp.effects.grid.color,
          width: mailchimp.effects.grid.width,
          height: mailchimp.effects.grid.height,
        }}
        lines={{
          display: mailchimp.effects.lines.display,
          opacity: mailchimp.effects.lines.opacity as opacity,
          size: mailchimp.effects.lines.size as SpacingToken,
          thickness: mailchimp.effects.lines.thickness,
          angle: mailchimp.effects.lines.angle,
          color: mailchimp.effects.lines.color,
        }}
      />

      {/* CONTENT */}
      <Column
        maxWidth="xs"
        horizontal="center"
        style={{ position: "relative", zIndex: 1 }}
      >
        <Heading marginBottom="s" variant="display-strong-xs">
          Build Your Technology Solution
        </Heading>

        <Text
          wrap="balance"
          marginBottom="l"
          variant="body-default-l"
          onBackground="neutral-weak"
        >
          Share your requirement and connect instantly with our team on WhatsApp.
        </Text>
      </Column>

      <Column
        fillWidth
        maxWidth={24}
        gap="8"
        style={{ position: "relative", zIndex: 1 }}
      >
        <textarea
          placeholder="Describe your project or requirement..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid var(--neutral-alpha-weak)",
            background: "var(--surface)",
            color: "inherit",
            resize: "none",
          }}
        />

        <Button size="m" fillWidth onClick={handleSend}>
          Contact on WhatsApp
        </Button>

        <Text variant="body-default-xs" onBackground="neutral-weak">
          Instant response via WhatsApp. No forms. No delays.
        </Text>
      </Column>
    </Column>
  );
}
