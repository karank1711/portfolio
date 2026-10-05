import { Github, Globe, Linkedin, Mail } from 'lucide-react';

const ICONS = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
};

export function SocialIcon({ platform, size = 16 }) {
  const Icon = ICONS[platform] || Globe;
  return <Icon size={size} aria-hidden />;
}
