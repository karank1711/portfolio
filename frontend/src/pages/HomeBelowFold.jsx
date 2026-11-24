import { About } from '@/components/about/About.jsx';
import { Achievements } from '@/components/achievements/Achievements.jsx';
import { Contact } from '@/components/contact/Contact.jsx';
import { Education } from '@/components/education/Education.jsx';
import { Experience } from '@/components/experience/Experience.jsx';
import { Projects } from '@/components/projects/Projects.jsx';
import { Skills } from '@/components/skills/Skills.jsx';

/** Below-the-fold home content; loaded after the hero paints. */
export default function HomeBelowFold({ data }) {
  return (
    <>
      <About about={data.about} profile={data.profile} resume={data.resume} />
      <Skills skills={data.skills || []} />
      <Experience items={data.experiences || []} />
      <Education items={data.education || []} />
      <Projects projects={data.projects || []} showViewAll />
      <Achievements items={data.achievements || []} />
      <Contact profile={data.profile} socialLinks={data.socialLinks || []} />
    </>
  );
}
