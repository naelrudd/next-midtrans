import CheckoutForm from "./checkout-form";

export default function CheckoutPage() {
  return (
    <main>
      <h1>next-midtrans demo</h1>
      <p style={{ marginBottom: "1.5rem", color: "#475569" }}>
        Server Action creates a Snap token, client page opens the Snap payment popup.
      </p>
      <CheckoutForm />
    </main>
  );
}