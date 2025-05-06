'use client'
import Features from "@/components/Features";
import FeatureSection from "@/components/FeatureSection";
import Foot from "@/components/Foot";
import HeadingWithAvatars from "@/components/HeadingWithAvatars";
import HeroFooter from "@/components/HeroFooter";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen md:p-8 pt-4">
      <FeatureSection />
      <HeadingWithAvatars />
       <HeroFooter />
      <Features />
      <Foot />  
    </div>
  );
}
