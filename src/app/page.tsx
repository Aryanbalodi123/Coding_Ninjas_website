import { Hero } from "@/components/home/Hero";
import { AchievementsStrip } from "@/components/home/AchievementsStrip";
import TeamsPage from "@/components/home/TeamsSection";
import { Sponsors } from "@/components/home/Sponsors";
import { JoinSection } from "@/components/home/JoinSection";
import { FAQ } from "@/components/home/FAQ";

export const revalidate = 3600;

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-24">
      <Hero />
      <AchievementsStrip />
      <TeamsPage />
      <Sponsors />
      <JoinSection />
      <FAQ />
    </div>
  );
}
