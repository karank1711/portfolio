import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/common/Button.jsx';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { SocialIcon } from '@/components/common/SocialIcon.jsx';
import { sendMessage } from '@/services/portfolio.js';
import { isExternal, socialHref } from '@/utils/social.js';

const fieldClass = 'w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent';

export function Contact({ profile, socialLinks = [] }) {
  const reduce = useReducedMotion();
  const [form, setForm] = useState({ name: '', email: '', message: '', company: '' });
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setNotice(null);
    try {
      await sendMessage(form);
      setForm({ name: '', email: '', message: '', company: '' });
      setNotice({ id: Date.now(), type: 'success' });
    } catch {
      setNotice({ id: Date.now(), type: 'error' });
    } finally {
      setStatus('idle');
    }
  }

  const details = [
    profile?.email ? { label: 'Email', value: profile.email, href: `mailto:${profile.email}` } : null,
    profile?.phone ? { label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` } : null,
    profile?.location ? { label: 'Location', value: profile.location } : null,
  ].filter(Boolean);

  return (
    <Section id="contact">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            intro="Send a note and it will land in the portfolio inbox."
          />
          {details.length === 0 && socialLinks.length === 0 ? (
            <EmptyNote>Contact details will appear here once they are added.</EmptyNote>
          ) : (
            <div className="-mt-4 space-y-5">
              {details.map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-faint">{item.label}</p>
                  {item.href ? <a href={item.href} className="mt-1 inline-block text-ink hover:underline">{item.value}</a> : <p className="mt-1 text-ink">{item.value}</p>}
                </div>
              ))}
              {socialLinks.length ? (
                <ul className="flex flex-wrap gap-2 pt-2">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={socialHref(link)}
                        aria-label={link.label || link.platform}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-ink hover:text-ink"
                        {...(isExternal(link) ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        <SocialIcon platform={link.platform} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </Reveal>
        <Reveal delay={0.06}>
          <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-line bg-elevated p-5 sm:p-6" noValidate>
            <label className="grid gap-1.5 text-sm text-muted">
              Name
              <input className={fieldClass} name="name" value={form.name} onChange={update} required autoComplete="name" placeholder="Your name" />
            </label>
            <label className="grid gap-1.5 text-sm text-muted">
              Email
              <input className={fieldClass} type="email" name="email" value={form.email} onChange={update} required autoComplete="email" placeholder="Your email" />
            </label>
            <label className="grid gap-1.5 text-sm text-muted">
              Message
              <textarea className={`${fieldClass} min-h-36 resize-none`} name="message" value={form.message} onChange={update} required placeholder="Your message" />
            </label>
            <div className="sr-only" aria-hidden="true">
              <label>
                Company
                <input name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={update} />
              </label>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Reveal>
      </div>
      <AnimatePresence>
        {notice ? (
          <motion.div
            key={notice.id}
            role={notice.type === 'error' ? 'alert' : 'status'}
            aria-live={notice.type === 'error' ? 'assertive' : 'polite'}
            initial={reduce ? { opacity: 1, x: '-50%', y: 0 } : { opacity: 0, x: '-50%', y: 8 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={reduce ? { opacity: 0, x: '-50%', y: 0 } : { opacity: 0, x: '-50%', y: -8 }}
            transition={{ duration: reduce ? 0.01 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[min(100%-2.5rem,20rem)] rounded-2xl border border-line bg-elevated px-4 py-3 shadow-lift"
          >
            {notice.type === 'success' ? (
              <>
                <p className="text-sm text-ink">Message sent successfully!</p>
                <p className="mt-0.5 text-xs text-muted">Thank you for reaching out.</p>
              </>
            ) : (
              <p className="text-sm text-accent">Unable to send message. Please try again.</p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Section>
  );
}
