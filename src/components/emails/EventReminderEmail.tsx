import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EventReminderEmailProps {
  eventTitle: string;
  eventLink: string;
  deadlineString: string;
  venue: string;
}

export const EventReminderEmail = ({
  eventTitle,
  eventLink,
  deadlineString,
  venue
}: EventReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Last chance to register for {eventTitle}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Registration closes in 1 hour!</Heading>
          
          <Text style={text}>
            Hi there,
          </Text>
          <Text style={text}>
            You saved <strong>{eventTitle}</strong> on EventsOfSSN. This is a quick reminder that registrations will close at {deadlineString}.
          </Text>
          <Text style={text}>
            <strong>Venue:</strong> {venue}
          </Text>
          
          <Section style={btnContainer}>
            <Button style={button} href={eventLink}>
              Register Now
            </Button>
          </Section>
          
          <Text style={footer}>
            If you've already registered, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #eee",
  borderRadius: "5px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0 48px",
  margin: "40px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 48px",
};

const btnContainer = {
  textAlign: "center" as const,
  padding: "20px 48px",
};

const button = {
  backgroundColor: "#6b21a8",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 48px",
  marginTop: "40px",
};

export default EventReminderEmail;
