import { useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Mail,
  Globe,
  Linkedin,
  Github,
  Terminal,
  Cpu,
  Award,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Download,
} from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { trackEvent } from "../../utils/analytics";

export function NormalPortfolio() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const data = {
    name: "Dhruv Bhagatkar",
    title: "Associate Consultant, DevOps Engineer",
    summary:
      "I am an Associate Consultant at Oracle Financial Services Software. I have strong exposure to DevOps practices, backend development, and production support for enterprise systems. Rather than calling myself an expert, I consider myself a continuous learner constantly exploring system design, building scalable architectures, and diving deep into backend engineering. My technical focus spans across Oracle technologies, Kubernetes, and robust automation.",
    contact: {
      email: "bhagatkardhruv2003@gmail.com",
      phone: "+91-9867229860",
      website: "https://www.thisisdhruv.in/",
      linkedin:
        "https://www.linkedin.com/in/dhruv-bhagatkar-1b267995",
      github: "https://github.com/dhruv2003",
    },
    education: [
      {
        degree: "B.Tech",
        major: "Electronics & Telecommunication Engineering",
        institution: "K. J. Somaiya College of Engineering",
        years: "2021 – 2025",
        cgpa: "7.59 / 10",
      },
    ],
    experience: [
      {
        company: "Oracle Financial Services Software",
        role: "Associate Consultant",
        duration: "July 2025 - Present",
        summary:
          "Work as a backend and platform engineer on enterprise banking systems, with strong focus on authentication architecture, platform integrations, production tooling, and operational reliability.",
        details: [
          "Architect and build an enterprise SSO/SAML authentication application from scratch, including gateway flows, backend auth logic, token handling, redirects, validation behavior, and error handling.",
          "Work on backend and platform integrations across Oracle banking environments, including FCUBS and Oracle WebLogic-based systems.",
          "Implement authentication enhancements across connected applications, including NTLM authentication support in Saga and improvements across JSF, JSP, and frontend login flows.",
          "Build internal operational tooling such as a WebLogic monitoring application for server visibility and a log pruner utility for efficient production log management.",
          "Handle runtime configuration, database connectivity, JNDI, and multi-data-source setup across enterprise environments.",
          "Contribute to release automation, deployment workflows, and production reliability using Jenkins, Bash, Kubernetes, Linux, and system-level debugging.",
          "Resolve build issues, deployment failures, environment-related incidents, and other platform problems in production-oriented enterprise setups.",
        ],
      },
      {
        company: "Affix Center",
        role: "IT Intern",
        duration: "January 2025 - June 2025",
        summary:
          "Worked on cloud migration, backend support, database-related tasks, and a smart heart rate tracker project.",
        details: [
          "Supported data migration from on-premise systems to cloud environments.",
          "Worked on data segregation efforts during migration and system restructuring.",
          "Contributed to backend development and database-related tasks for internal projects.",
          "Worked on the development of a smart heart rate tracker.",
        ],
      },
    ],
    projects: [
      {
        name: "FitterCoin",
        date: "September 2025",
        description:
          "A blockchain-driven fitness application that converts user activity into crypto rewards to improve user motivation and retention.",
        details: [
          "Built a Web3-enabled fitness rewards engine that converts user steps into on-chain tokens using smart contract integrations.",
          "Built the project during the 36-hour ETH Global New Delhi hackathon.",
          "Led backend architecture and feature development, including token reward logic, smart contract deployment, and tokenomics design.",
        ],
      },
      {
        name: "Data Scrapper",
        date: "January 2025",
        description:
          "An end-to-end data scraper for a website with dynamic content.",
        details: [
          "Used Redis to create and distribute jobs across workers for dynamic scraping workloads.",
          "Improved the existing scraper's performance by 91.67 percent.",
          "Hosted the backend on AWS and exposed APIs for downstream consumption.",
          "Built the system to handle more than 5000 requests at a time.",
        ],
      },
      {
        name: "Medicare",
        date: "October 2024",
        description:
          "An end-to-end IoT product designed to support senior citizens in their medical journey.",
        details: [
          "Built the hardware prototype around a custom PCB for the IoT workflow.",
          "Worked on the backend by developing APIs for device and application communication.",
          "Handled embedded programming with Firebase and ESP-based components.",
        ],
      },
    ],
    achievements: [
      {
        title: "Winner",
        event: "ETH Global New Delhi",
        date: "September 2025",
        details: [
          "Won 3500$ across two tracks.",
          "Built FitterCoin during the hackathon.",
        ],
      },
    ],
    skills: {
      programming_languages: [
        "Bash Scripting",
        "Java",
        "Python",
        "Solidity",
        "TypeScript",
      ],
      devops_tools: [
        "Kubernetes",
        "Docker",
        "CI/CD Pipelines",
        "Git",
        "Gradle",
        "JNDI",
        "Hardhat",
      ],
      databases: ["Oracle DB (connectivity across hosts)"],
      cloud_platforms: [
        "Kubernetes (pod management, debugging)",
      ],
      oracle_technologies: [
        "OBTFPM",
        "OBMA",
        "FCUBS Integrations",
      ],
      operating_systems: [
        "Linux (commands, permissions, file operations)",
      ],
      methodologies: [
        "DevOps",
        "Production Support",
        "System Integration",
        "Automation",
      ],
      emerging_tech: [
        "AI/ML (OpenAI API, Claude, Codex capabilities, token cost awareness)",
        "Blockchain & Web3 (Smart Contracts, Tokenomics)",
      ],
    },
  };

  const skillColors = [
    "bg-[#FFC900]",
    "bg-[#FF90E8]",
    "bg-[#38BDF8]",
    "bg-[#FFFFFF]",
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="sticky top-0 z-50 bg-white border-b-4 border-black px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex justify-between items-center gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-4 shrink">
          <Link
            to="/"
            className="bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </Link>
          <div className="font-black text-sm sm:text-xl uppercase tracking-widest bg-[#38BDF8] px-2 sm:px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] truncate flex-shrink">
            Manual_Mode //
          </div>
        </div>
        <Link
          to="/chat"
          className="hidden sm:inline-flex items-center gap-2 font-bold uppercase tracking-wider bg-[#FF90E8] px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all shrink-0"
        >
          <Terminal className="w-4 h-4" />
          Terminal
        </Link>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 lg:px-12 pt-16 space-y-24">
        {/* Hero */}
        <section className="relative">
          <div className="flex flex-col-reverse lg:flex-row lg:items-start items-center gap-8 lg:gap-12">
            <div className="flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block bg-[#FFC900] text-black font-black px-3 py-1.5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 uppercase tracking-widest text-xs rotate-[-2deg]"
              >
                {data.title}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase text-black mb-6 leading-[0.9] tracking-tighter break-words"
              >
                <span className="block">Dhruv</span>
                <span className="block">Bhagatkar</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border-4 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-2xl"
              >
                <p className="text-lg sm:text-xl font-bold leading-relaxed">
                  {data.summary}
                </p>
              </motion.div>

              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href={`mailto:${data.contact.email}`}
                  onClick={() => trackEvent("social_click", { network: "Email" })}
                  className="flex items-center gap-2 font-bold border-2 border-black px-3 py-1.5 bg-[#FF90E8] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-sm"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
                <a
                  href={data.contact.github}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("social_click", { network: "GitHub" })}
                  className="flex items-center gap-2 font-bold border-2 border-black px-3 py-1.5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-sm"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a
                  href={data.contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("social_click", { network: "LinkedIn" })}
                  className="flex items-center gap-2 font-bold border-2 border-black px-3 py-1.5 bg-[#38BDF8] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-sm"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a
                  href={data.contact.website}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("social_click", { network: "Website" })}
                  className="flex items-center gap-2 font-bold border-2 border-black px-3 py-1.5 bg-[#FFC900] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-sm"
                >
                  <Globe className="w-4 h-4" /> Website
                </a>
                <a
                  href="/Dhruv_Bhagatkar_Resume.pdf"
                  download
                  onClick={() => trackEvent("download_resume")}
                  className="flex items-center gap-2 font-bold border-2 border-black px-3 py-1.5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-sm group text-black"
                >
                  <Download className="w-4 h-4 group-hover:block transition-all" /> Download Resume
                </a>
              </div>
            </div>

            {/* Profile Image Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="shrink-0 relative w-56 h-56 sm:w-72 sm:h-72 lg:w-[320px] lg:h-[320px] lg:mt-4"
            >
              {/* Decorative elements behind image */}
              <div className="absolute top-3 -right-3 w-full h-full bg-[#38BDF8] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" />
              <div className="absolute -bottom-3 -left-3 w-full h-full bg-[#FF90E8] border-4 border-black" />

              {/* Actual Image Container */}
              <div tabIndex={0} className="absolute inset-0 bg-white border-4 border-black overflow-hidden group cursor-pointer focus:outline-none">
                <ImageWithFallback
                  src="/profile.jpeg"
                  alt="Dhruv Bhagatkar"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-active:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100 group-active:scale-100 group-focus:grayscale-0 group-focus:scale-100"
                />
              </div>

              <div className="absolute -bottom-5 -right-5 bg-[#FFC900] text-black font-black px-3 py-1.5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider rotate-[-6deg] z-10 text-sm">
                Hi, I'm Dhruv!
              </div>
            </motion.div>
          </div>
        </section>

        {/* Experience */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#FFC900] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-3">
              <Briefcase className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-wider">
              Experience
            </h2>
          </div>

          <div className="space-y-8">
            {data.experience.map((exp, idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-[4px] active:shadow-none focus:outline-none focus:translate-y-0 focus:translate-x-[4px] focus:shadow-none transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-4 border-black pb-6">
                  <div>
                    <h3 className="text-3xl font-black uppercase">
                      {exp.company}
                    </h3>
                    <p className="text-xl font-bold text-[#FF90E8] [text-shadow:1px_1px_0px_#000] mt-1">
                      {exp.role}
                    </p>
                  </div>
                  <div className="bg-black text-white font-black px-4 py-2 border-2 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,201,0,1)]">
                    {exp.duration}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-xl font-bold bg-[#E5E5E5] p-4 border-2 border-black">
                    {exp.summary}
                  </p>
                </div>
                <ul className="space-y-4">
                  {exp.details.map((resp, rIdx) => (
                    <li
                      key={rIdx}
                      className="flex gap-4 items-start font-bold text-lg"
                    >
                      <div className="w-3 h-3 bg-[#38BDF8] border-2 border-black mt-1.5 shrink-0 rotate-45" />
                      <span className="leading-snug">
                        {resp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#FF90E8] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-6">
              <FolderGit2 className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-wider">
              Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {data.projects.map((proj, idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="bg-[#FFFDF9] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-[4px] active:shadow-none focus:outline-none focus:translate-y-0 focus:translate-x-[4px] focus:shadow-none transition-all flex flex-col cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <h3 className="text-2xl font-black uppercase bg-[#FFC900] px-3 py-1 border-2 border-black inline-block">
                    {proj.name}
                  </h3>
                  <span className="font-black text-sm uppercase sm:text-right border-b-4 border-black pb-1 shrink-0 whitespace-nowrap self-start sm:self-center">
                    {proj.date}
                  </span>
                </div>
                <p className="text-lg font-bold mb-6 flex-1">
                  {proj.description}
                </p>
                <div className="bg-black text-white p-4 border-2 border-black space-y-3">
                  {proj.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex gap-3 items-start"
                    >
                      <span className="text-[#FF90E8] font-bold">
                        ▹
                      </span>
                      <span className="font-bold text-sm">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#38BDF8] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-3">
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-wider">
              Skills & Tech
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(data.skills).map(
              ([category, skills], idx) => {
                const bgClass =
                  skillColors[idx % skillColors.length];
                return (
                  <div
                    key={category}
                    tabIndex={0}
                    className={`${bgClass} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[6px_10px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-[6px] active:shadow-none focus:outline-none focus:translate-y-0 focus:translate-x-[6px] focus:shadow-none transition-all cursor-pointer`}
                  >
                    <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">
                      {category.replace("_", " ")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          tabIndex={0}
                          className="bg-white text-black font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm hover:bg-black hover:text-white active:bg-black active:text-white focus:bg-black focus:text-white transition-colors cursor-pointer focus:outline-none"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#FFC900] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-6">
              <Award className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-wider">
              Achievements
            </h2>
          </div>

          <div className="space-y-6">
            {data.achievements.map((achievement, idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="bg-black text-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(255,201,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(255,201,0,1)] active:translate-y-0 active:translate-x-[4px] active:shadow-none focus:outline-none focus:translate-y-0 focus:translate-x-[4px] focus:shadow-none transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase text-[#FFC900]">
                      {achievement.title}
                    </h3>
                    <p className="text-xl font-bold uppercase tracking-wider mt-1">
                      {achievement.event}
                    </p>
                  </div>
                  <div className="bg-white text-black font-black px-3 py-1 border-2 border-black uppercase self-start sm:self-center shadow-[4px_4px_0px_0px_rgba(255,144,232,1)]">
                    {achievement.date}
                  </div>
                </div>
                <ul className="space-y-3">
                  {achievement.details.map((detail, dIdx) => (
                    <li
                      key={dIdx}
                      className="flex gap-4 items-start font-bold text-lg"
                    >
                      <div className="text-[#38BDF8]">▹</div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-6">
              <GraduationCap className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-wider">
              Education
            </h2>
          </div>

          <div className="space-y-6">
            {data.education.map((edu, idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="bg-[#E5E5E5] border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-[4px] active:shadow-none focus:outline-none focus:translate-y-0 focus:translate-x-[4px] focus:shadow-none transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
              >
                <div>
                  <h3 className="text-2xl font-black uppercase">
                    {edu.institution}
                  </h3>
                  <p className="text-xl font-bold">
                    {edu.degree} in {edu.major}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-[#FFC900] text-black font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                    {edu.years}
                  </span>
                  <span className="bg-white text-black font-bold px-3 py-1 border-2 border-black">
                    CGPA: {edu.cgpa}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}