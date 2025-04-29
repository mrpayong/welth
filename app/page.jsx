// "use client";
// import HeroSection from "@/components/hero";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
// import { SignIn } from "@clerk/nextjs";
// import Image from "next/image";
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
// import { useEffect } from "react";
// import { useAuth, useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";



// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronRight,
  Play,
  HelpCircle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Printer,
  Share2,
  Video,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  Lightbulb,
  CreditCard,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  ArrowUp,
  Headset,
  LineChart,
  Bot,
  Layers,
  Mail,
  Book,
  CalendarDays,
  ChartLine,
  Triangle
} from "lucide-react";



const Home = () => {
  const [activeSection, setActiveSection] = useState("cashflow");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState([]);
  const mainContentRef = useRef(null);
  const [showButton, setShowButton] = useState(false);
  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowButton(true); // Show button when scrolled down
      } else {
        setShowButton(false); // Hide button when at the top
      }
    
      if (!mainContentRef.current) return;
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.body.offsetHeight;
      const progress = (scrollPosition / (fullHeight - windowHeight)) * 100;
      setScrollProgress(progress);
      // Update active section based on scroll position
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        const sectionTop = (section).offsetTop - 100;
        const sectionHeight = (section).offsetHeight;
        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(section.id);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const toggleBookmark = (sectionId) => {
    if (bookmarked.includes(sectionId)) {
      setBookmarked(bookmarked.filter((id) => id !== sectionId));
    } else {
      setBookmarked([...bookmarked, sectionId]);
    }
  };
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  const features = [
    {
      id: "cashflow",
      title: "Cashflow Statement Creation",
      icon: <ChartLine/>,
      description: 
        "Learn how to create and manage your cashflow statements efficiently.",
      steps: [
        "Step number one",
        "Step number two",
        "Step number three",
        "Step number four",
        "Step number five",
      ],
      imagePrompt:
        "Professional financial dashboard showing cashflow statement creation interface with charts, graphs, and financial data visualization on a clean light background with blue and white color scheme, high quality 3D rendering",
      tryItLink: "/cashflow",
    },
    {
      id: "ai-transaction",
      title: "AI-Powered Transaction Recording",
      icon: <Bot/>,
      description:
        "Record transactions effortlessly with the help of Gemini AI technology.",
      steps: [
        "Step number one",
        "Step number two",
        "Step number three",
        "Step number four",
        "Step number five",
      ],
      imagePrompt:
        "Futuristic AI interface processing financial transaction data with glowing blue elements, showing natural language input being converted to structured transaction data by Gemini AI on a minimalist white background with subtle tech elements",
      tryItLink: "/transactions",
    },
    {
      id: "grouping",
      title: "Transaction Grouping System",
      icon: <Layers/>,
      description:
        "Organize your transactions into meaningful groups for better financial management.",
      steps: [
        "Step number one",
        "Step number two",
        "Step number three",
        "Step number four",
        "Step number five",
      ],
      imagePrompt:
        "Clean modern interface showing transaction grouping system with color-coded categories and drag-drop functionality, displaying financial data organization with a light professional design and subtle grid background",
      tryItLink: "/groups",
    },
    {
      id: "email-support",
      title: "AI Email Decision Support",
      icon: <Mail/>,
      description:
        "Receive intelligent financial insights and recommendations via email.",
      steps: [
        "Step number one",
        "Step number two",
        "Step number three",
        "Step number four",
        "Step number five",
      ],
      imagePrompt:
        "Professional email interface showing AI-powered financial decision support system with data visualization, recommendation cards, and actionable insights on a clean white background with subtle blue accents",
      tryItLink: "/email-settings",
    },
    {
      id: "auto-recording",
      title: "Auto Recording System",
      icon: <Book/>,
      description:
        "Automatically record transactions in Cash Receipt and Disbursement Books.",
      steps: [
        "Step number one",
        "Step number two",
        "Step number three",
        "Step number four",
        "Step number five",
      ],
      imagePrompt:
        "Digital accounting interface showing automated transaction recording system with cash receipt and disbursement books, featuring clean spreadsheet-like design with transaction history and automatic categorization on light background",
      tryItLink: "/auto-recording",
    },
    {
      id: "date-filtering",
      title: "Date Filtering Features",
      icon: <CalendarDays/>,
      description:
        "Filter your financial records by date ranges for targeted analysis.",
      steps: [
        "Step number one",
        "Step number two",
        "Step number three",
        "Step number four",
        "Step number five",
      ],
      imagePrompt:
        "Clean date filtering interface for financial application showing calendar selection, date range picker, and filtered transaction results with data visualization elements on minimal white background with light blue accents",
      tryItLink: "/filters",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm pt-11">
        <div className="container mx-auto px-4 py-4">
          
          <Progress value={scrollProgress} className="h-1 mt-4" />
        </div>

        {/* Navigation tabs */}
        <div className="container mx-auto px-4">
          <Tabs>
              <TabsList className="w-full justify-start overflow-x-auto py-2 space-x-2">
            {features.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                onClick={() => scrollToSection(feature.id)}
                className={`${activeSection === feature.id ? "bg-blue-100 text-blue-700" : ""} cursor-pointer whitespace-nowrap`}
              >
                {/* <i className={`${feature.icon} mr-2`}></i> */}
                {feature.icon}
                {feature.title}
              </TabsTrigger>
            ))}
          </TabsList>
          </Tabs>
        
        </div>
      </header>

      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-transparent">
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10">
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 bg-blue-100 text-blue-700 border-blue-200"
            >
              Getting Started Guide
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Teruel Accounting Financial Management System
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Welcome to your comprehensive guide to using our Web-Based
              Financial Management System. Learn how to leverage AI-powered
              features to streamline your financial workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white !rounded-button whitespace-nowrap cursor-pointer">
                <i className="fa-solid fa-play mr-2"></i>
                Watch Tutorial
              </Button>
              <Button
                variant="outline"
                className="!rounded-button whitespace-nowrap cursor-pointer"
                onClick={() => scrollToSection("cashflow")}
              >
                <i className="fa-solid fa-book-open mr-2"></i>
                Start Reading
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <img
              src="https://readdy.ai/api/search-image?query=Modern%20financial%20dashboard%20interface%20with%20AI%20assistant%20helping%20user%20navigate%20through%20various%20financial%20tools%20and%20features%2C%20showing%20clean%20UI%20with%20data%20visualization%20elements%2C%20charts%20and%20helpful%20tooltips%20on%20a%20light%20background%20with%20blue%20accents&width=600&height=400&seq=hero1&orientation=landscape"
              alt="Financial System Overview"
              className="rounded-lg shadow-xl object-cover w-full h-auto"
            />
          </div>
        </div>
      </div>


      {/* Main content */}
      <div ref={mainContentRef} className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-16">
          {features.map((feature, index) => (
            <section key={feature.id} id={feature.id} className="scroll-mt-24">
              <Card className="overflow-hidden border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        {/* <i
                          className={`${feature.icon} text-blue-600 text-xl`}
                        ></i> */}
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBookmark(feature.id)}
                            className="cursor-pointer"
                          >
                            <Bookmark className={`${bookmarked.includes(feature.id) ? "text-amber-400" : "bg-white"}`}/>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>  
                          <p>
                            {bookmarked.includes(feature.id)
                              ? "Remove bookmark"
                              : "Bookmark this section"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Step-by-Step Guide
                      </h3>
                      <ol className="space-y-4">
                        {feature.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-medium">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-700 pt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Detailed Instructions
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="tips">
                            <AccordionTrigger className="text-blue-600">
                              Tips & Best Practices
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li>
                                  bullet 1
                                </li>
                                <li>
                                  bullet 2
                                </li>
                                <li>
                                  bullet 3
                                </li>
                                <li>
                                  bullet 4
                                </li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="common-issues">
                            <AccordionTrigger className="text-blue-600">
                              Common Issues & Solutions
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 text-gray-700">
                                <p>
                                  <strong>Issue:</strong> issue #1
                                </p>
                                <p>
                                  <strong>Solution:</strong> answer to issue #1
                                </p>
                                <p className="mt-2">
                                  <strong>Issue:</strong> issue #2
                                </p>
                                <p>
                                  <strong>Solution:</strong> answer to issue #2
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Visual Guide
                      </h3>
                      <div className="rounded-lg overflow-hidden shadow-md flex-grow">
                        <img
                          src={`https://readdy.ai/api/search-image?query=$%7Bfeature.imagePrompt%7D&width=600&height=400&seq=${feature.id}&orientation=landscape`}
                          alt={feature.title}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="mt-6 flex flex-col space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <h4 className="font-medium text-blue-700 mb-1">
                            Pro Tip
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {index === 0 &&
                              "Use the 'Save Template' feature to quickly generate similar statements in the future."}
                            {index === 1 &&
                              "The more you use AI transaction recording, the better it becomes at understanding your specific financial patterns."}
                            {index === 2 &&
                              "Create custom tags for your transaction groups to make them even more organized and searchable."}
                            {index === 3 &&
                              "Set priority levels for different types of financial insights to ensure you see the most important ones first."}
                            {index === 4 &&
                              "Schedule a monthly review of your auto-recorded transactions to ensure everything is categorized correctly."}
                            {index === 5 &&
                              "Save your most frequently used date filters as presets for quick access in the future."}
                          </p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-auto !rounded-button whitespace-nowrap cursor-pointer">
                          <i className="fa-solid fa-external-link-alt mr-2"></i>
                          Try It Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      </div>
      {/* Additional resources section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-video text-green-600 text-xl"></i>
                </div>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Watch comprehensive video guides for each feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <i className="fa-solid fa-play-circle text-green-500 mr-2"></i>
                    <span className="text-gray-700">
                      Getting Started (5:32)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <i className="fa-solid fa-play-circle text-green-500 mr-2"></i>
                    <span className="text-gray-700">
                      AI Transaction Recording (8:15)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <i className="fa-solid fa-play-circle text-green-500 mr-2"></i>
                    <span className="text-gray-700">
                      Advanced Filtering (6:47)
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full !rounded-button whitespace-nowrap cursor-pointer"
                >
                  View All Videos
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-file-alt text-purple-600 text-xl"></i>
                </div>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Detailed guides and reference materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <i className="fa-solid fa-file-pdf text-purple-500 mr-2"></i>
                    <span className="text-gray-700">User Manual (PDF)</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fa-solid fa-file-code text-purple-500 mr-2"></i>
                    <span className="text-gray-700">API Documentation</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fa-solid fa-file-alt text-purple-500 mr-2"></i>
                    <span className="text-gray-700">
                      Frequently Asked Questions
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full !rounded-button whitespace-nowrap cursor-pointer"
                >
                  Browse Documentation
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-users text-orange-600 text-xl"></i>
                </div>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>
                  Connect with other users and experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <i className="fa-solid fa-comments text-orange-500 mr-2"></i>
                    <span className="text-gray-700">Discussion Forums</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fa-solid fa-calendar-alt text-orange-500 mr-2"></i>
                    <span className="text-gray-700">Upcoming Webinars</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fa-solid fa-lightbulb text-orange-500 mr-2"></i>
                    <span className="text-gray-700">Feature Requests</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full !rounded-button whitespace-nowrap cursor-pointer"
                >
                  Join Community
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>


      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-lg font-medium text-gray-800">
                  FAQ #1?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, sapien id laoreet varius, risus nunc viverra libero, at dignissim justo magna in nisi. Curabitur vulputate, ex non interdum fermentum, enim nunc feugiat nulla, at cursus arcu sapien in metus. Fusce a turpis vel est elementum vehicula. Integer malesuada eros vitae odio congue, quis porttitor metus vulputate.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-lg font-medium text-gray-800">
                  FAQ #2?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, sapien id laoreet varius, risus nunc viverra libero, at dignissim justo magna in nisi. Curabitur vulputate, ex non interdum fermentum, enim nunc feugiat nulla, at cursus arcu sapien in metus. Fusce a turpis vel est elementum vehicula. Integer malesuada eros vitae odio congue, quis porttitor metus vulputate.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-lg font-medium text-gray-800">
                  FAQ #3?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, sapien id laoreet varius, risus nunc viverra libero, at dignissim justo magna in nisi. Curabitur vulputate, ex non interdum fermentum, enim nunc feugiat nulla, at cursus arcu sapien in metus. Fusce a turpis vel est elementum vehicula. Integer malesuada eros vitae odio congue, quis porttitor metus vulputate.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-lg font-medium text-gray-800">
                  FAQ #3?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, sapien id laoreet varius, risus nunc viverra libero, at dignissim justo magna in nisi. Curabitur vulputate, ex non interdum fermentum, enim nunc feugiat nulla, at cursus arcu sapien in metus. Fusce a turpis vel est elementum vehicula. Integer malesuada eros vitae odio congue, quis porttitor metus vulputate.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger className="text-lg font-medium text-gray-800">
                  FAQ #4?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, sapien id laoreet varius, risus nunc viverra libero, at dignissim justo magna in nisi. Curabitur vulputate, ex non interdum fermentum, enim nunc feugiat nulla, at cursus arcu sapien in metus. Fusce a turpis vel est elementum vehicula. Integer malesuada eros vitae odio congue, quis porttitor metus vulputate.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">List of items</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 1
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 2
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 3
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 4
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 5
                  </a>
                </li>
              </ul>
            </div>


            <div>
              <h3 className="text-lg font-semibold mb-4">List of items</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 1
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 2
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 3
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 4
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 5
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">List of items</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 1
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 2
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 3
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 4
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 5
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">List of items</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 1
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 2
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 3
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 4
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    Item 5
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            
          </div>
        </div>
      </footer>


      {/* Floating action button */}
     
      {showButton && (
        <div className="fixed bottom-6 right-6 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg cursor-pointer"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <Triangle className="text-white" size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Back to Top</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      



      {/* Bookmarks panel */}
      {bookmarked.length > 0 && (
        <div className="fixed top-32 right-6 z-10">
          <Card className="w-64 shadow-lg border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Your Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[200px]">
                <ul className="space-y-1">
                  {bookmarked.map((id) => {
                    const feature = features.find((f) => f.id === id);
                    return feature ? (
                      <li key={id} className="flex items-center py-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-blue-600 cursor-pointer"
                          onClick={() => scrollToSection(id)}
                        >
                          <i className={`${feature.icon} mr-2`}></i>
                          <span className="truncate">{feature.title}</span>
                        </Button>
                      </li>
                    ) : null;
                  })}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
export default Home;
