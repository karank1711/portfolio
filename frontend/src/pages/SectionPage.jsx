import { Helmet } from 'react-helmet-async';
import { About } from '@/components/about/About.jsx';
import { Achievements } from '@/components/achievements/Achievements.jsx';
import { Contact } from '@/components/contact/Contact.jsx';
import { Education } from '@/components/education/Education.jsx';
import { Experience } from '@/components/experience/Experience.jsx';
import { Projects } from '@/components/projects/Projects.jsx';
import { Skills } from '@/components/skills/Skills.jsx';
import { usePortfolio } from '@/context/PortfolioContext.jsx';
import { PortfolioGate } from '@/pages/PortfolioGate.jsx';

const PAGES = {
  about: {
    title: 'About',
    render: (data) => <About about={data.about} profile={data.profile} resume={data.resume} />,
  },
  skills: {
    title: 'Skills',
    render: (data) => <Skills skills={data.skills || []} />,
  },
  experience: {
    title: 'Experience',
    render: (data) => <Experience items={data.experiences || []} />,
  },
  education: {
    title: 'Education',
    render: (data) => <Education items={data.education || []} />,
  },
  projects: {
    title: 'Projects',
    render: (data) => <Projects projects={data.projects || []} />,
  },
  achievements: {
    title: 'Achievements',
    render: (data) => <Achievements items={data.achievements || []} />,
  },
  contact: {
    title: 'Contact',
    render: (data) => <Contact profile={data.profile} socialLinks={data.socialLinks || []} />,
  },
};

export function SectionPage({ name }) {
  const page = PAGES[name];
  const { data } = usePortfolio();
  const person = data?.profile?.fullName;

  return (
    <PortfolioGate>
      {(portfolio) => (
        <>
          <Helmet>
            <title>{person ? `${page.title} · ${person}` : page.title}</title>
          </Helmet>
          {page.render(portfolio)}
        </>
      )}
    </PortfolioGate>
  );
}
