import { motion } from "motion/react";
import { Link } from "react-router";
import { Terminal } from "lucide-react";

export function NotFound() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-lg w-full text-center"
      >
        <div className="bg-black text-white border-4 border-black px-6 py-4 mb-8 shadow-[8px_8px_0px_0px_rgba(255,201,0,1)] inline-block">
          <p className="font-mono text-sm sm:text-base">
            <span className="text-[#FFC900]">root@cluster:~$</span> curl /this-page
          </p>
          <p className="font-mono text-sm sm:text-base mt-2 text-red-400">
            HTTP/1.1 404 Not Found
          </p>
          <p className="font-mono text-sm sm:text-base text-gray-400">
            Error: route crashed in production.
          </p>
        </div>

        <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter mb-4">
          <span className="bg-[#FFC900] px-3 py-1 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block rotate-[-2deg]">
            404
          </span>
        </h1>

        <p className="text-xl sm:text-2xl font-bold leading-relaxed mb-8">
          This page was deployed to /dev/null.
          <br />
          No logs. No traces. No survivors.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm bg-[#FFC900] px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all group"
        >
          <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Return to production
        </Link>
      </motion.div>
    </div>
  );
}
