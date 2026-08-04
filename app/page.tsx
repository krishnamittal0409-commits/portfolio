// app/page.tsx
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

import {
  getProfile,
  getExperience,
  getProjects,
  getSkillGroups,
  getCertifications,
  getEducation,
} from "@/lib/content";

export default async function Home() {
  const [profile, experience, projects, skillGroups, certifications, education] =
    await Promise.all([
      getProfile(),
      getExperience(),
      getProjects(),
      getSkillGroups(),
      getCertifications(),
      getEducation(),
    ]);

  return (
    <>
      <Nav />
      <main>
        <Hero profile={profile} />
        <Experience experience={experience} />
        <Projects projects={projects} />
        <Skills skillGroups={skillGroups} />
        <Certifications certifications={certifications} education={education} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}