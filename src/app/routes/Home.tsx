import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, MessageSquare, Terminal, LayoutDashboard, ArrowDown } from 'lucide-react';
import { Link } from 'react-router';
import { trackEvent } from "../../utils/analytics";

export function Home() {
  const [dragText, setDragText] = useState("Drag Me");
  const words = ["DEVOPS ENGINEER", "ORACLE EXPERT", "KUBERNETES", "ASSOCIATE CONSULTANT", "SYSTEM DESIGN", "OBSERVABILITY", "BASH", "JAVA", "PYTHON", "BRUH", "HOW COOL IS THIS??", "THIS IS AWESOME", "I AM A GENIUS","WELL I SURVIVED ORACLE LAYOFFS"];

  return (
    <div 
      className="min-h-screen bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black flex flex-col relative"
      style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.15) 2px, transparent 2px)', backgroundSize: '32px 32px' }}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex justify-between items-center gap-4">
          <div className="font-black text-base sm:text-xl uppercase tracking-widest bg-[#FFC900] px-2 sm:px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-rotate-2 transition-transform flex-shrink">
            Dhruv bhagatkar
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link to="/chat" className="hidden sm:inline-flex items-center gap-2 font-bold uppercase tracking-wider text-black hover:bg-[#FF90E8] px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group whitespace-nowrap">
              <Terminal className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
              Chat
            </Link>
            <Link to="/normal" className="font-bold text-sm sm:text-base uppercase tracking-wider bg-[#38BDF8] px-3 sm:px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all inline-flex items-center gap-2 group whitespace-nowrap">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Resume
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Marquee */}
      <div className="mt-[80px] bg-black text-white border-b-4 border-black overflow-hidden flex whitespace-nowrap py-4">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 items-center shrink-0 font-black tracking-widest text-xl uppercase"
        >
          {[...words, ...words, ...words, ...words].map((word, idx) => (
            <div key={idx} className="flex items-center gap-8">
              <span>{word}</span>
              <span className="text-[#FFC900]">///</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative pb-32">
        <section className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full h-[calc(100vh-140px)] min-h-[500px] flex flex-col justify-center items-center">
          
          {/* Interactive Decorative background elements (Now visible on mobile) */}
          <motion.div 
            drag 
            whileDrag={{ scale: 1.1, zIndex: 50 }} 
            dragConstraints={{ left: -150, right: 150, top: -100, bottom: 300 }} 
            onDragStart={() => setDragText("WHEEEE!")}
            onDragEnd={() => {
              setDragText("OUCH.");
              trackEvent("hero_drag", { object: "yellow_circle" });
            }}
            className="absolute top-4 sm:top-12 right-2 sm:right-[10%] w-24 h-24 sm:w-48 sm:h-48 bg-[#FFC900] border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-grab active:cursor-grabbing hover:rotate-12 transition-transform z-0"
          >
            <span className="font-black text-[8px] sm:text-xs uppercase rotate-12 bg-white px-1 sm:px-2 py-0.5 sm:py-1 border-2 border-black truncate max-w-[80%] text-center">{dragText}</span>
          </motion.div>
          
          <motion.div drag whileDrag={{ scale: 1.1, zIndex: 50 }} dragConstraints={{ left: -150, right: 150, top: -300, bottom: 200 }} onDragEnd={() => trackEvent("hero_drag", { object: "blue_square" })} className="absolute bottom-32 sm:bottom-40 right-4 sm:right-[20%] w-16 h-16 sm:w-32 sm:h-32 bg-[#38BDF8] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:rotate-45 transition-transform duration-700 cursor-grab active:cursor-grabbing rotate-12 z-0" />

          <motion.div drag whileDrag={{ scale: 1.1, zIndex: 50 }} dragConstraints={{ left: -50, right: 300, top: -100, bottom: 400 }} className="absolute top-24 sm:top-40 left-4 sm:left-[10%] w-8 h-8 sm:w-12 sm:h-12 bg-black rotate-45 cursor-grab active:cursor-grabbing z-0" />
          
          <motion.div drag whileDrag={{ scale: 1.1, zIndex: 50 }} dragConstraints={{ left: -50, right: 300, top: -400, bottom: 200 }} className="absolute bottom-40 sm:bottom-60 left-8 sm:left-[5%] w-10 h-10 sm:w-16 sm:h-16 border-[4px] sm:border-8 border-black rounded-full cursor-grab active:cursor-grabbing z-0" />
          
          <motion.div drag whileDrag={{ scale: 1.1, zIndex: 50 }} dragConstraints={{ left: -100, right: 400, top: -300, bottom: 300 }} className="absolute hidden sm:block top-1/2 left-[15%] w-40 h-10 bg-[#FF90E8] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-6 cursor-grab active:cursor-grabbing z-0" />

          {/* Draggable Terminal Window */}
          <motion.div 
            drag 
            whileDrag={{ scale: 1.05, zIndex: 50, rotate: 0 }} 
            dragConstraints={{ left: -50, right: 400, top: -100, bottom: 400 }}
            onDragEnd={() => trackEvent("hero_drag", { object: "terminal_window" })}
            className="absolute left-2 sm:left-[5%] bottom-20 sm:bottom-auto sm:top-[20%] w-40 sm:w-64 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing transform -rotate-3 z-0"
          >
            <div className="bg-black text-white px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between border-b-4 border-black">
              <span className="font-black text-[8px] sm:text-[10px] tracking-widest truncate">root@cluster:~</span>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#FFC900] border-2 border-black rounded-full animate-pulse shrink-0" />
            </div>
            <div className="p-2 sm:p-4 font-mono text-[10px] sm:text-sm font-bold text-black flex flex-col gap-1 sm:gap-2">
              <p className="text-gray-500">❯ starting deployment</p>
              <p className="truncate">❯ loading k8s config</p>
              <p className="text-green-600 bg-green-100 px-1 inline-block border-2 border-black [box-shadow:2px_2px_0px_0px_rgba(0,0,0,1)] self-start my-1">✓ nodes ready</p>
              <p className="text-gray-500">❯ awaiting traffic...</p>
            </div>
          </motion.div>

          {/* Hero Content */}
          <div className="max-w-4xl relative z-10 mx-auto text-center w-full flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-block"
            >
              <div className="bg-black text-white font-black px-4 sm:px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,201,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] mb-6 sm:mb-8 uppercase tracking-widest text-xs sm:text-lg rotate-[-1deg] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                SYSTEMS + OBSERVABILITY
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[12vw] sm:text-7xl lg:text-8xl font-black uppercase text-black leading-[0.85] tracking-tighter flex flex-col items-center"
            >
              <span tabIndex={0} className="block hover:text-[#38BDF8] active:text-[#38BDF8] focus:text-[#38BDF8] transition-colors cursor-pointer focus:outline-none w-full text-center">Backend</span>
              <span tabIndex={0} className="inline-block bg-[#FFC900] px-2 sm:px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-2 sm:mt-4 rotate-1 hover:-rotate-1 active:-rotate-1 focus:-rotate-1 transition-transform text-[8.5vw] sm:text-7xl lg:text-8xl text-center cursor-pointer focus:outline-none self-center z-10 relative">Infrastructure</span>
              <span tabIndex={0} className="block mt-4 sm:mt-5 hover:text-[#FF90E8] active:text-[#FF90E8] focus:text-[#FF90E8] transition-colors cursor-pointer focus:outline-none w-full text-center">Glue Work</span>
            </motion.h1>

          </div>

          {/* Scroll Indicator (Moved down and enlarged) */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group z-50"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="font-black uppercase tracking-widest text-xs sm:text-sm bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-[#FFC900] transition-colors">Keep Scrolling</span>
            <div className="bg-[#FF90E8] p-2 sm:p-3 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-y-[4px] transition-all">
              <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
          </motion.div>
        </section>
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 relative z-10 w-full min-h-[80vh] flex flex-col justify-center items-center">
          <div className="max-w-4xl relative z-10 mx-auto text-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="bg-white border-4 border-black p-6 sm:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto transform rotate-[0.5deg] mb-16 sm:mb-24 relative"
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#38BDF8] border-4 border-black rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#FF90E8] border-4 border-black" />
              
              <p className="text-xl text-black font-bold leading-relaxed text-left">
                I have strong exposure to DevOps practices, backend development, and production support for enterprise systems. I am a continuous learner, passionate about designing scalable systems, writing robust backend code, and exploring new technologies. Choose how you want to explore my experience below.
              </p>
            </motion.div>

            {/* Path Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link to="/chat" className="block bg-[#FF90E8] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all group text-left h-full flex flex-col justify-between">
                  <div>
                    <div className="bg-black text-white w-16 h-16 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-6 group-hover:rotate-12 transition-transform">
                      <Terminal className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black uppercase mb-4">Interactive<br/>Terminal</h2>
                    <p className="text-lg font-bold mb-8">Chat with an AI assistant trained on my experience, projects, and technical skills.(YES ITS DESIGNED TO BRAG ABOUT ME A LOT)</p>
                  </div>
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest text-black border-2 border-black bg-white px-4 py-2 self-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white transition-colors">
                    Start Chat <ArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link to="/normal" className="block bg-[#38BDF8] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all group text-left h-full flex flex-col justify-between">
                  <div>
                    <div className="bg-white text-black w-16 h-16 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 group-hover:-rotate-12 transition-transform">
                      <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black uppercase mb-4">Manual<br/>Mode</h2>
                    <p className="text-lg font-bold mb-8">Browse my complete professional history, skill sets, and achievements in a standard layout.</p>
                  </div>
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest text-black border-2 border-black bg-[#FFC900] px-4 py-2 self-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-[#FFC900] transition-colors">
                    View Resume <ArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-6">
              <p className="text-2xl font-black uppercase tracking-wider text-black">Get in touch</p>
              <div className="flex gap-4 flex-wrap">
                <a href="https://github.com/dhruv2003" target="_blank" rel="noreferrer" className="font-bold bg-[#FFC900] border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black">GitHub</a>
                <a href="https://www.linkedin.com/in/dhruv-bhagatkar-1b267995" target="_blank" rel="noreferrer" className="font-bold bg-[#FF90E8] border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black">LinkedIn</a>
                <a href="https://www.thisisdhruv.in/" target="_blank" rel="noreferrer" className="font-bold bg-[#38BDF8] border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black">Website</a>
                <a href="mailto:bhagatkardhruv2003@gmail.com" className="font-bold bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black">Email</a>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-black border-4 border-black px-4 py-2 bg-black text-white shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] uppercase">
                READY TO DEPLOY.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}