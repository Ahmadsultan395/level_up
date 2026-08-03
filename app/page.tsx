import { getHomeData } from "@/lib/getHomeData";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Portfolio from "@/components/sections/Portfolio";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import TeamPreview from "@/components/sections/Team";
import CTA from "@/components/sections/CTA";

export const revalidate = 60;

export default async function HomePage() {
  const { hero, services, projects, testimonials, team, settings } = await getHomeData();

  return (
    <>
      <Hero hero={hero as any} />
      <Services services={services as any} />
      <Portfolio projects={projects as any} />
      <WhyChooseUs items={settings?.whyChooseUs} />
      <Process steps={settings?.process} />
      <Testimonials testimonials={testimonials as any} />
      <TeamPreview team={team as any} />
      <CTA />
    </>
  );
}
