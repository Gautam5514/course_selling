import Hero from "./Hero";
import ThreeSteps from "./ThreeSteps";
import FeaturedCourses from "./FeaturedCourses";
import VirtualClassroom from "./VirtualClassroom";
import Benefits from "./Benefits";
import Partners from "./Partners";
import BecomeInstructor from "./BecomeInstructor";
import Testimonials from "./Testimonials";
import BlogInsights from "./BlogInsights";

export default function HomePageContent({ blogCards = [], featuredNotes = null, reviews = null }) {
  return (
    <>
      <Hero />
      <ThreeSteps />
      <FeaturedCourses initialNotes={featuredNotes} />
      <VirtualClassroom />
      <Benefits />
      <Partners />
      <BecomeInstructor />
      <Testimonials initialReviews={reviews} />
      <BlogInsights posts={blogCards} />
    </>
  );
}

