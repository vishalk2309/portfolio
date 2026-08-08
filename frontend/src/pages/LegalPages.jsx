import { Link, useNavigate } from "react-router-dom";
import Background from "../components/Background";
import Footer from "../components/Footer";
import { useContent } from "../lib/ContentContext";

// NOTE: This is starter content to satisfy Razorpay activation and set clear
// expectations — it is NOT legal advice. Review the [bracketed] placeholders
// and adjust the wording for your situation before going live.

function LegalShell({ title, children }) {
  const { profile } = useContent();
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
  return (
    <div className="relative min-h-screen">
      <Background />
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="glass mx-auto flex max-w-3xl items-center justify-between rounded-b-2xl px-6 py-4">
          <button
            onClick={goBack}
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            ← Back
          </button>
          <Link to="/" className="text-lg font-bold">
            <span className="gradient-text">{profile.name}</span>
          </Link>
          <span className="w-12" />
        </nav>
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-32">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <div className="mt-8 space-y-5 text-white/70 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_a]:text-neon-cyan">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Terms() {
  const { profile } = useContent();
  return (
    <LegalShell title="Terms & Conditions">
      <p>
        These terms govern your use of this website and any digital resources
        purchased or downloaded from it, operated by {profile.name} ("we",
        "us"). By using the site or buying a resource, you agree to these terms.
      </p>
      <h2>Digital products</h2>
      <p>
        Resources are digital files licensed to you for personal, non-commercial
        use. You may not resell, redistribute, or publicly share the files
        without written permission.
      </p>
      <h2>Payments</h2>
      <p>
        Payments are processed securely by Razorpay. We do not store your card
        or bank details. Prices are shown in INR and include applicable taxes
        unless stated otherwise.
      </p>
      <h2>Accounts</h2>
      <p>
        You are responsible for the email account you sign in with. Access to
        purchased resources is available in your library while your account is
        active.
      </p>
      <h2>Disclaimer</h2>
      <p>
        Resources are provided "as is" without warranties of any kind. We are
        not liable for any loss arising from their use, to the extent permitted
        by law.
      </p>
      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, with jurisdiction in
        [Siwan/Bihar].
      </p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${profile.email}`}>{profile.email}</a>
        .
      </p>
    </LegalShell>
  );
}

export function Privacy() {
  const { profile } = useContent();
  return (
    <LegalShell title="Privacy Policy">
      <p>
        This policy explains what data we collect and how we use it when you use
        this website.
      </p>
      <h2>What we collect</h2>
      <p>
        Your email address (to create your account and send sign-in codes), your
        purchase records, and basic usage data. We collect payment confirmation
        details from Razorpay but never your full card or bank information.
      </p>
      <h2>How we use it</h2>
      <p>
        To provide sign-in, deliver purchased resources, maintain your library,
        respond to enquiries, and keep records of transactions. We do not sell
        your data.
      </p>
      <h2>Service providers</h2>
      <p>
        We use Supabase (authentication, database, file storage), Razorpay
        (payments), and Brevo (email delivery). Your data is processed by these
        providers only to run this service.
      </p>
      <h2>Data retention & your rights</h2>
      <p>
        We keep purchase records as required for accounting. You may request
        access to or deletion of your account data by emailing{" "}
        <a href={`mailto:${profile.email}`}>{profile.email}</a>.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions, email{" "}
        <a href={`mailto:${profile.email}`}>{profile.email}</a>.
      </p>
    </LegalShell>
  );
}

export function Refund() {
  const { profile } = useContent();
  return (
    <LegalShell title="Refund & Cancellation Policy">
      <p>This policy applies to digital resources purchased on this website.</p>
      <h2>Digital goods</h2>
      <p>
        Because resources are digital and delivered instantly (downloadable
        immediately after purchase), all sales are generally{" "}
        <b>final and non-refundable</b> once the file has been accessed or
        downloaded.
      </p>
      <h2>When we will help</h2>
      <p>
        If you were charged but did not receive access, the file is corrupted,
        or you were charged more than once, contact us within <b>[7] days</b> of
        purchase and we'll investigate and issue a refund or fresh access where
        appropriate.
      </p>
      <h2>How to request</h2>
      <p>
        Email <a href={`mailto:${profile.email}`}>{profile.email}</a> with your
        registered email and the payment/order id. Approved refunds are returned
        to the original payment method via Razorpay, typically within 5–7
        business days.
      </p>
    </LegalShell>
  );
}
