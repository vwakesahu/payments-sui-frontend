import React from "react";
import Image from "next/image";
import { Lock } from "lucide-react";

const HeadingWithAvatars = () => {
  return (
    <div className="bg-background md:h-screen grid place-items-center pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto my-auto px-4 py-20 grid place-items-center">
        <div className="flex flex-col items-center gap-12">
          {/* Top Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
            <Lock className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">
              Uses Fully Homomorphic Encryption
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-center font-semibold leading-[1.1] tracking-tight text-foreground">
            Built for secure
            <br />
            transactions
          </h2>

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center">
              <Image
                src="/user1.png"
                alt="Anonymous user 1"
                width={56}
                height={56}
                className="rounded-full border-2 border-background ring-2 ring-primary -mr-4"
              />
              <Image
                src="/user2.png"
                alt="Anonymous user 2"
                width={56}
                height={56}
                className="rounded-full border-2 border-background ring-2 ring-primary -mr-4"
              />
              <Image
                src="/user3.svg"
                alt="Anonymous user 3"
                width={56}
                height={56}
                className="rounded-full border-2 border-background bg-background ring-2 ring-primary"
              />
            </div>
            <p className="text-muted-foreground text-lg text-center">
              Trusted by leading financial institutions
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeadingWithAvatars;