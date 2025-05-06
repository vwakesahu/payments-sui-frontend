import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const Features = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 mb-6 w-full h-[50vh] place-items-center">
        <h1 className="text-6xl font-medium text-center leading-tight tracking-tight">
          <span className="text-foreground">Effortless </span>
          <span className="text-muted-foreground">Payroll</span>
          <br />
          <span className="text-muted-foreground">Distribution </span>
          <span className="text-foreground">Solution.</span>
        </h1>
      </div>
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Numbers Column */}
          <div className="space-y-6">
            <div className="bg-primary rounded-3xl p-8 aspect-square">
              <div className="h-full flex flex-col justify-between">
                <div className="text-8xl font-medium text-primary-foreground">01</div>
                <div>
                  <h3 className="text-xl text-primary-foreground mb-2">
                    Confidential Payments
                  </h3>
                  <p className="text-muted-foreground">
                    Distribute funds on-chain with encrypted amounts
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border">
              <div className="text-8xl font-medium text-foreground">02</div>
              <div className="mt-auto">
                <h3 className="text-xl mb-2">Stealth USDC</h3>
                <p className="text-muted-foreground">
                  Store stablecoins, hiding amounts from public visibility
                </p>
              </div>
            </div>
          </div>

          {/* Center Preview Column */}
          <div className="space-y-6">
            <div className="bg-muted rounded-3xl p-8 aspect-[4/3]">
              <div className="relative h-full flex items-center justify-center">
                <Image
                  src="/hero2.svg"
                  alt="Dashboard Preview"
                  width={200}
                  height={200}
                  className=""
                />
              </div>
            </div>

            <div className="bg-primary rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4">
                <button className="bg-background text-foreground px-6 py-3 rounded-full text-sm font-medium hover:bg-muted transition-all duration-300">
                  Live preview
                </button>
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center hover:bg-muted transition-all duration-300 cursor-pointer">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border">
              <div className="text-8xl font-medium text-foreground">03</div>
              <div className="mt-auto">
                <h3 className="text-xl mb-2">Effortless Payroll</h3>
                <p className="text-muted-foreground">
                  Easily manage payroll with encrypted addresses
                </p>
              </div>
            </div>

            <div className="bg-primary rounded-3xl p-8 aspect-square">
              <div className="h-full flex flex-col justify-between">
                <div className="text-7xl font-medium text-primary-foreground">100%</div>
                <p className="text-muted-foreground text-lg">
                  Confidentiality in every transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;