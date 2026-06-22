import { Html, Body, Container, Text, Hr, Link } from "@react-email/components";

export function SupportAutoReply({ name }: { name: string }) {
  return (
    <Html>
      <Body style={{ fontFamily: "sans-serif", background: "#fff", color: "#111" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "24px" }}>
          <Text style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            qu00b — we got your message
          </Text>
          <Hr />
          <Text>Hi {name},</Text>
          <Text>
            Thanks for reaching out. We received your message and will get back to you
            within a day or two.
          </Text>
          <Text>
            In the meantime, feel free to keep experimenting at{" "}
            <Link href="https://qu00b.app/circuit">qu00b.app</Link>.
          </Text>
          <Hr />
          <Text style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
            — The qu00b team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
