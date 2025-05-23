import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Github, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState, useEffect } from "react";

const HeroFooter = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const VideoContent = () => (
    <div className="relative pt-[56.25%] bg-primary">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src="https://www.loom.com/embed/7c56e8d5c65b42328adb10b6cd9f2180?sid=67751b8b-4c56-45f7-a8b0-26618bd08a90"
        title="Protocol Demo"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full sm:px-6 px-4">
      <div className="relative bg-muted rounded-[20px] sm:rounded-[35px] overflow-hidden p-4 sm:p-8 sm:py-6 mb-4 sm:mb-8 min-h-[60vh] sm:h-[85vh] grid place-items-center">
        {/* Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/80" />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full grid place-items-center p-1.5">
              <Image
                src="/logob.svg"
                width={40}
                height={40}
                alt="Hero Image"
                className="sm:w-[50px] sm:h-[50px]"
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-medium text-center">
                <span className="text-foreground">Automated </span>
                <span className="text-muted-foreground">Payroll</span>
                <br className="hidden sm:block" />
                <span className="text-muted-foreground">Distribution </span>
                <span className="text-foreground">System</span>
              </h1>
            </div>
          </div>

          <div className="grid place-items-center mt-4 sm:mt-6">
            <button
              className="group rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 bg-primary text-primary-foreground shadow hover:opacity-90 pl-3 sm:pl-4"
              onClick={() => setShowVideo(true)}
            >
              <p className="py-1.5 sm:py-2">View Demo</p>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background overflow-hidden grid place-items-center transition-transform duration-300 group-hover:translate-x-0.5">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={showVideo} onOpenChange={setShowVideo}>
          <DrawerContent>
            <DrawerHeader className="p-4">
              <DrawerTitle>Protocol Demo</DrawerTitle>
              <DrawerDescription>
                Watch how our{" "}
                <span className="text-foreground">Payroll Protocol</span> works.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <VideoContent />
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <button className="w-full rounded-full py-2 bg-muted text-sm font-medium transition-colors hover:bg-muted/80">
                  Close
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop Dialog */}
      {!isMobile && (
        <Dialog open={showVideo} onOpenChange={setShowVideo}>
          <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Protocol Demo</DialogTitle>
              <DialogDescription>
                Watch how our{" "}
                <span className="text-foreground">Payroll Protocol</span> works.
              </DialogDescription>
            </DialogHeader>
            <VideoContent />
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HeroFooter;
