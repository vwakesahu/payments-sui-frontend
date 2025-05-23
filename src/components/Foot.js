import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Github, X } from "lucide-react";

const Foot = () => {
  const fadeInVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
  };

  const linkVariants = {
    initial: { color: "hsl(var(--foreground))" },
    hover: { color: "hsl(var(--muted-foreground))" },
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 pb-6 max-w-7xl mx-auto mt-16 sm:mt-32 px-4 sm:px-6"
      initial="initial"
      animate="animate"
      variants={fadeInVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Left - Logo */}
      <Link href="/" className="no-underline w-full sm:w-auto">
        <motion.div className="bg-background p-1.5 rounded-full px-2.5 pr-4 flex justify-center sm:justify-start w-full">
          <div className="flex items-center gap-4">
            <div className="bg-primary w-8 sm:w-9 h-8 sm:h-9 rounded-full grid place-items-center p-1.5">
              <Image 
                src="/logo1.svg" 
                width={28} 
                height={28} 
                alt="Hero Image"
                // className="sm:w-8 sm:h-8" 
              />
            </div>
            <p className="text-foreground font-medium text-sm sm:text-base">Payroll Protocol</p>
          </div>
        </motion.div>
      </Link>

      {/* Center - Credits */}
      <motion.div
        className="text-center text-muted-foreground text-xs sm:text-sm order-last sm:order-none w-full sm:w-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="px-4 sm:px-0">Presenting you with ❤️ from Payroll Protocol Team.</p>
      </motion.div>

      {/* Right - GitHub Link */}
      <motion.div
        className="bg-background p-1.5 rounded-full px-4 text-sm w-full sm:w-auto"
        whileHover={{ scale: 1.02 }}
      >
        <Link
          href="https://github.com/muskbuster/Sui-payroll"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline text-foreground hover:text-muted-foreground transition-colors"
        >
          <motion.div
            className="flex items-center gap-2 justify-center sm:justify-start"
            variants={linkVariants}
            initial="initial"
            whileHover="hover"
          >
            <Github size={18} className="sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">GitHub</span>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Foot;