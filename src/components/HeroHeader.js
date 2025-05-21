import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOutIcon, Menu, X } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LoogoutButton from "./logout";

const VideoContent = () => (
  <div className="relative pt-[56.25%]">
    <iframe
      className="absolute top-0 left-0 w-full h-full"
      src="https://www.youtube.com/embed/?si=rKZZhYTfKIhuEMTp"
      title="Protocol Demo"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

const HeroHeader = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [activeRoute, setActiveRoute] = useState("/");
  const [showVideo, setShowVideo] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      setActiveRoute(pathname);
    }
    if (pathname === "/") {
      setActiveRoute("/withdraw");
    }
  }, [pathname]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation items configuration
  const navItems = [
    { path: "/payroll", label: "Payroll" },
    { path: "/vesting", label: "Vesting" },
    { path: "/token-stream", label: "Token Stream" },
  ];

  // Handle logout functionality
  const handleLogout = () => {
    // Implement your custom logout functionality here
    console.log("User logged out");
    // You can add your own logout logic here
  };

  const renderNavItem = (item, isMobile = false) => {
    const isActive = activeRoute === item.path;

    return (
      <Link
        key={item.path}
        href={item.path}
        className="no-underline w-full"
        onClick={() => isMobile && setIsOpen(false)}
      >
        <motion.div
          className={`
            h-9 rounded-full grid place-items-center px-4
            transition-colors duration-200 w-full
            ${
              isMobile
                ? "bg-background hover:bg-muted text-foreground my-1"
                : isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-background hover:bg-muted text-foreground"
            }
          `}
        >
          <span
            className={`${
              isMobile
                ? "text-foreground"
                : isActive
                ? "text-primary-foreground"
                : "text-foreground"
            } truncate whitespace-nowrap ${
              item.label === "Token Stream" ? "px-10" : ""
            }`}
          >
            {item.label}
          </span>
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.div className="flex justify-between items-center max-w-7xl mx-auto pr-2 md:px-4 relative">
      <Link href="/" className="no-underline">
        <motion.div
          className={`bg-background p-1.5 rounded-full px-2.5 pr-4  ${
            activeRoute === "/" ? "ring-2 ring-primary" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary w-9 h-9 rounded-full grid place-items-center p-1.5">
              <Image src="/logo1.svg" width={32} height={32} alt="Hero Image" />
            </div>
            <p className="text-foreground font-medium">Payroll Protocol</p>
          </div>
        </motion.div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <div className="grid place-items-center">
          <button
            className="group rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 hover:opacity-90 px-4 hover:underline"
            onClick={() => setShowVideo(true)}
          >
            <p className="py-2">View Demo</p>
          </button>
        </div>
        <div className="bg-background p-1.5 rounded-full text-sm">
          <div className="flex items-center gap-2">
            {navItems.map((item) => renderNavItem(item))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LoogoutButton />
        </div>
      </div>

      {/* Mobile Navigation with Popover */}
      <div className="md:hidden">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="bg-primary w-9 h-9 rounded-full grid place-items-center p-1.5 cursor-pointer hover:bg-primary/80">
              {isOpen ? (
                <X size={16} className="text-primary-foreground" />
              ) : (
                <Menu size={16} className="text-primary-foreground" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-4" align="end">
            <div className="flex flex-col gap-2">
              <button
                className="text-sm font-medium w-full text-center py-2 hover:bg-muted rounded-full"
                onClick={() => {
                  setShowVideo(true);
                  setIsOpen(false);
                }}
              >
                View Demo
              </button>
              {navItems.map((item) => renderNavItem(item, true))}
              <div
                className="h-9 rounded-full grid place-items-center px-4 bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 mt-2"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <span className="text-primary-foreground">Logout</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={showVideo} onOpenChange={setShowVideo}>
          <DrawerContent>
            <DrawerHeader className="p-4">
              <DrawerTitle>Protocol Demo</DrawerTitle>
              <DrawerDescription>
                Watch how our{" "}
                <span className="text-black">Payroll Protocol</span> works.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <VideoContent />
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <button className="w-full rounded-full py-2 bg-gray-100 text-sm font-medium transition-colors hover:bg-gray-200">
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
                <span className="text-black">Payroll Protocol</span> works.
              </DialogDescription>
            </DialogHeader>
            <VideoContent />
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default HeroHeader;
