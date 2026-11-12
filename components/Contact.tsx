import BackgroundVideo from '@/components/BackgroundVideo';
import EnquiryForm from '@/components/EnquiryForm';

export default function Contact({ standalone }: { standalone?: boolean }) {
  return (
    <section
      className={`contact${standalone ? ' contact--page' : ''}`}
      id="contact"
    >
      <div className="contact__media">
        <BackgroundVideo className="contact__video" src="/video/cta.mp4" />
      </div>
      <div className="contact__scrim" aria-hidden="true" />

      <div className="wrap">
        <div className="contact__inner">
          <h2 className="contact__title reveal">Tell us what you are building.</h2>
          <p className="contact__sub reveal">
            Send a few lines about the brand and where you want it to be in a year.
            We reply to every enquiry within two working days.
          </p>

          <EnquiryForm />
        </div>
      </div>
    </section>
  );
}
