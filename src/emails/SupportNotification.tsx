import { Html, Body, Container, Text, Hr } from "@react-email/components";

export function SupportNotification({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  return (
    <Html>
      <Body style={{ fontFamily: "sans-serif", background: "#fff", color: "#111" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "24px" }}>
          <Text style={{ fontSize: "1.1rem", fontWeight: "bold" }}>New support message — qu00b</Text>
          <Hr />
          <Text><strong>Name:</strong> {name}</Text>
          <Text><strong>Email:</strong> {email}</Text>
          <Text><strong>Message:</strong></Text>
          <Text style={{ whiteSpace: "pre-wrap", background: "#F9FAFB", padding: "12px", borderRadius: "8px" }}>{message}</Text>
          <Hr />
          <Text style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
            Reply directly to {email} to respond.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
