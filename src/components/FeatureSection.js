import React from "react";
import { ChevronRight } from "lucide-react";
import HeroHeader from "./HeroHeader";

const FeatureSection = () => {
  return (
    <>
      <HeroHeader />
      {/* Adjusted padding and height for mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-4 py-8 sm:py-12 mt-6 sm:mt-10 min-h-screen sm:h-[80vh] my-auto grid place-items-center">
        {/* Header Section - Improved text sizing for mobile */}
        <div className="grid grid-cols-1 place-items-center gap-4 sm:gap-6 mb-4 sm:mb-6 w-full">
          <h1 className="text-4xl sm:text-6xl text-center font-medium leading-tight tracking-tight">
            <span className="text-foreground">Automated </span>
            <span className="text-muted-foreground">Payroll</span>
            <br className="hidden sm:block" />
            <span className="text-muted-foreground">Distribution </span>
            <span className="text-foreground">System</span>
          </h1>
        </div>

        {/* Feature Cards Grid - Adjusted spacing and layout for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {/* Large Feature Card - Enhanced padding for mobile */}
          <div className="lg:col-span-2 bg-primary rounded-3xl p-6 sm:p-8 group cursor-pointer">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-16 sm:mb-24">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                </div>
                <ChevronRight className="w-5 h-5 text-primary-foreground/70 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-medium text-primary-foreground mb-2 sm:mb-3">
                  Tailored payroll solutions
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Seamless integration with Web3 and blockchain platforms
                </p>
              </div>
            </div>
          </div>

          {/* Regular Feature Card - Adjusted for mobile */}
          <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border group cursor-pointer">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-8 sm:mb-12">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3">Employee portal</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Secure portal for payroll details
                </p>
              </div>
            </div>
          </div>

          {/* Regular Feature Card - Adjusted for mobile */}
          <div className="bg-accent rounded-3xl p-6 sm:p-8 group cursor-pointer">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-8 sm:mb-12">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-background flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3">Global payouts</h3>
                <p className="text-sm sm:text-base text-accent-foreground">
                  Efficient cross-border transfers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureSection;