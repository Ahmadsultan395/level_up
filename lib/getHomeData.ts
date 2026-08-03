import { connectDB } from "@/lib/mongodb";
import HeroSection from "@/models/HeroSection";
import Service from "@/models/Service";
import Project from "@/models/Project";
import Testimonial from "@/models/Testimonial";
import Team from "@/models/Team";
import Settings from "@/models/Settings";

export async function getHomeData() {
  await connectDB();

  const [hero, services, projects, testimonials, team, settings] = await Promise.all([
    HeroSection.findOne({ status: "active" }).sort("-createdAt").lean(),
    Service.find({ status: "active" }).sort("-createdAt").limit(8).lean(),
    Project.find().sort("-createdAt").limit(6).lean(),
    Testimonial.find({ status: "active" }).sort("-createdAt").limit(6).lean(),
    Team.find({ status: "active" }).sort("order").limit(4).lean(),
    Settings.findOne().lean()
  ]);

  return { hero, services, projects, testimonials, team, settings };
}
