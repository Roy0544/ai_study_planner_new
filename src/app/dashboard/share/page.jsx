"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// ------------------------------
// Initial Mock Data
// ------------------------------
const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Advanced Soil Physics (SS-302) Midterm Exam",
    course: "SS-302: Soil Physics",
    category: "Soil Science",
    type: "Exam Paper",
    year: "2025",
    semester: "Semester I",
    uploader: {
      name: "Sanjay Kumar",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sanjay"
    },
    upvotes: 42,
    downloads: 128,
    fileSize: "2.4 MB",
    fileType: "PDF",
    createdAt: "2026-04-10",
    description: "Contains both subjective and objective questions covering Soil Water potential, Soil aeration, and Heat flow chapters. Answer key is included at the end."
  },
  {
    id: "doc-2",
    title: "Crop Physiology & Metabolism - Complete Lecture Notes",
    course: "CP-101: Crop Physiology",
    category: "Crop Physiology",
    type: "Notes",
    year: "2026",
    semester: "Semester II",
    uploader: {
      name: "Ananya R.",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya"
    },
    upvotes: 89,
    downloads: 345,
    fileSize: "8.1 MB",
    fileType: "PDF",
    createdAt: "2026-05-18",
    description: "Detailed, typed lecture notes covering Photosynthesis, Translocation, Respiration, Plant growth regulators, and Stress physiology. Very useful for quick exam review."
  },
  {
    id: "doc-3",
    title: "Introductory Genetics & Plant Breeding Quiz Prep",
    course: "GPB-201: Genetics & Plant Breeding",
    category: "Genetics",
    type: "Practice Sheets",
    year: "2025",
    semester: "Semester I",
    uploader: {
      name: "Pranav M.",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Pranav"
    },
    upvotes: 24,
    downloads: 98,
    fileSize: "1.1 MB",
    fileType: "DOCX",
    createdAt: "2026-03-05",
    description: "150 multiple choice questions with detailed explanation of answers. Covers Mendelian genetics, linkage, chromosomal aberrations, and plant breeding methods."
  },
  {
    id: "doc-4",
    title: "Agricultural Entomology - Pest Identification Guide",
    course: "ENT-211: Applied Entomology",
    category: "Entomology",
    type: "Study Guide",
    year: "2026",
    semester: "Semester II",
    uploader: {
      name: "Meera Nair",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Meera"
    },
    upvotes: 73,
    downloads: 212,
    fileSize: "15.4 MB",
    fileType: "PDF",
    createdAt: "2026-06-01",
    description: "High-resolution picture guide showing common crop pests in South India, their damage symptoms, and integrated pest management (IPM) strategies."
  },
  {
    id: "doc-5",
    title: "Weed Management & Agronomy Principles Exam Paper",
    course: "AGR-301: Weed Management",
    category: "Agronomy",
    type: "Exam Paper",
    year: "2024",
    semester: "Semester II",
    uploader: {
      name: "Vijay Gowda",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vijay"
    },
    upvotes: 31,
    downloads: 74,
    fileSize: "1.8 MB",
    fileType: "PDF",
    createdAt: "2026-02-12",
    description: "Final exam question paper of AGR-301. Contains questions on herbicide classification, biological weed control, and integrated weed management in wet-land rice."
  },
  {
    id: "doc-6",
    title: "Principles of Organic Farming Lecture Summaries",
    course: "AGR-102: Organic Farming",
    category: "Agronomy",
    type: "Notes",
    year: "2026",
    semester: "Semester I",
    uploader: {
      name: "Prof. S. R. Rao",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rao"
    },
    upvotes: 112,
    downloads: 502,
    fileSize: "4.5 MB",
    fileType: "PDF",
    createdAt: "2026-06-15",
    description: "Official summary slides and readings for the Organic Farming course. Topics: Biofertilizers, green manuring, organic certification standards, and composting techniques."
  }
];

const INITIAL_REQUESTS = [
  {
    id: "req-1",
    title: "Plant Biochemistry Final Paper (2025)",
    course: "BC-201",
    category: "Biochemistry",
    requestedBy: "Rohan D.",
    upvotes: 18,
    createdAt: "2026-06-19",
    status: "Open"
  },
  {
    id: "req-2",
    title: "Rainfed Agriculture & Watershed Management Notes",
    course: "AGR-312",
    category: "Agronomy",
    requestedBy: "Divya Teja",
    upvotes: 27,
    createdAt: "2026-06-18",
    status: "Open"
  },
  {
    id: "req-3",
    title: "Diseases of Field Crops (PP-301) Lab Manual",
    course: "PP-301",
    category: "Plant Pathology",
    requestedBy: "Vikram K.",
    upvotes: 14,
    createdAt: "2026-06-20",
    status: "Open"
  }
];

const CATEGORIES = [
  "All",
  "Soil Science",
  "Crop Physiology",
  "Genetics",
  "Entomology",
  "Agronomy",
  "Plant Pathology",
  "Biochemistry"
];

export default function SharingHubPage() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState("all"); // all, notes, papers, requests, my-uploads
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent"); // recent, downloads, ratings
  
  // Interaction States
  const [votedDocs, setVotedDocs] = useState({}); // { docId: 'up' | 'down' }
  const [votedRequests, setVotedRequests] = useState({});
  const [downloadingDocs, setDownloadingDocs] = useState({}); // { docId: progress }
  const [myUploadedDocIds, setMyUploadedDocIds] = useState(new Set());
  
  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isFulfillingReq, setIsFulfillingReq] = useState(null); // Request object being fulfilled
  
  // Form States
  const [uploadForm, setUploadForm] = useState({
    title: "",
    course: "",
    category: "Soil Science",
    type: "Notes",
    year: "2026",
    semester: "Semester I",
    description: "",
    fileAttached: null
  });
  
  const [requestForm, setRequestForm] = useState({
    title: "",
    course: "",
    category: "Soil Science"
  });

  const [uploadingState, setUploadingState] = useState({
    status: "idle", // idle, uploading, virus-scan, metadata, publishing, complete
    progress: 0,
    message: ""
  });

  const [aiScannerState, setAiScannerState] = useState({
    status: "idle", // idle, scanning, complete
    progress: 0,
    step: ""
  });

  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const triggerToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Upvote / Downvote handlers
  const handleUpvoteDoc = (e, docId) => {
    e.stopPropagation();
    e.preventDefault();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const currentVote = votedDocs[docId];
          let diff = 0;
          if (currentVote === "up") {
            diff = -1;
            setVotedDocs((v) => ({ ...v, [docId]: null }));
          } else {
            diff = currentVote === "down" ? 2 : 1;
            setVotedDocs((v) => ({ ...v, [docId]: "up" }));
          }
          return { ...doc, upvotes: doc.upvotes + diff };
        }
        return doc;
      })
    );
  };

  const handleUpvoteReq = (reqId) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === reqId) {
          const currentVote = votedRequests[reqId];
          let diff = 0;
          if (currentVote === "up") {
            diff = -1;
            setVotedRequests((v) => ({ ...v, [reqId]: null }));
          } else {
            diff = 1;
            setVotedRequests((v) => ({ ...v, [reqId]: "up" }));
          }
          return { ...req, upvotes: req.upvotes + diff };
        }
        return req;
      })
    );
  };

  // Download simulation
  const handleDownload = (e, doc) => {
    e.stopPropagation();
    e.preventDefault();
    if (downloadingDocs[doc.id] !== undefined) return;

    // Start progress
    setDownloadingDocs((prev) => ({ ...prev, [doc.id]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDownloadingDocs((prev) => ({ ...prev, [doc.id]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDownloadingDocs((prev) => {
            const next = { ...prev };
            delete next[doc.id];
            return next;
          });
          triggerToast(`Successfully downloaded "${doc.title}"!`);
          
          // Increment download count locally
          setDocuments(prevDocs =>
            prevDocs.map(d => d.id === doc.id ? { ...d, downloads: d.downloads + 1 } : d)
          );
        }, 800);
      }
    }, 150);
  };

  // Simulated AI Study Set Scan
  const handleAiScan = (doc) => {
    setAiScannerState({ status: "scanning", progress: 0, step: "Connecting to GKVK AI Engine..." });
    let progress = 0;
    const steps = [
      "Reading document structure...",
      "Analyzing technical terminologies...",
      "Synthesizing key exam questions...",
      "Formulating study guides & cards...",
      "Publishing to study sets library..."
    ];

    const interval = setInterval(() => {
      progress += 5;
      const stepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
      setAiScannerState({
        status: "scanning",
        progress,
        step: steps[stepIndex]
      });

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setAiScannerState({ status: "complete", progress: 100, step: "Study Suite Created!" });
          triggerToast("Successfully synthesized study set inside GKVK AI! View in Study Sets.");
          // Add a delay before closing the preview and scan
          setTimeout(() => {
            setAiScannerState({ status: "idle", progress: 0, step: "" });
            setIsPreviewOpen(false);
          }, 1500);
        }, 600);
      }
    }, 120);
  };

  // File Upload Handlers
  const triggerMockFileAttach = () => {
    setUploadForm((prev) => ({
      ...prev,
      fileAttached: {
        name: `${uploadForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "study_resource"}.pdf`,
        size: "3.2 MB"
      }
    }));
    triggerToast("Document file attached successfully!");
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.course || !uploadForm.description) {
      triggerToast("Please fill in all required fields", "error");
      return;
    }
    if (!uploadForm.fileAttached) {
      triggerToast("Please attach a document file before sharing", "error");
      return;
    }

    // Start upload simulation
    setUploadingState({ status: "uploading", progress: 10, message: "Uploading document files..." });
    let progress = 10;
    
    const steps = [
      { trigger: 30, msg: "Scanning files for malware..." },
      { trigger: 55, msg: "Extracting syllabus alignments..." },
      { trigger: 80, msg: "Compiling document metadata..." },
      { trigger: 100, msg: "Publishing to university feed..." }
    ];

    const interval = setInterval(() => {
      progress += 10;
      const currentStep = steps.find(s => progress <= s.trigger);
      
      setUploadingState({
        status: "uploading",
        progress: Math.min(progress, 100),
        message: currentStep ? currentStep.msg : "Wrapping up..."
      });

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const newDocId = `doc-${Date.now()}`;
          const newDoc = {
            id: newDocId,
            title: uploadForm.title,
            course: uploadForm.course,
            category: uploadForm.category,
            type: uploadForm.type,
            year: uploadForm.year,
            semester: uploadForm.semester,
            uploader: {
              name: "You (Student)",
              avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=You"
            },
            upvotes: 1,
            downloads: 0,
            fileSize: uploadForm.fileAttached.size,
            fileType: "PDF",
            createdAt: new Date().toISOString().split('T')[0],
            description: uploadForm.description
          };

          setDocuments((prev) => [newDoc, ...prev]);
          setMyUploadedDocIds((prev) => {
            const next = new Set(prev);
            next.add(newDocId);
            return next;
          });

          // If fulfilling request
          if (isFulfillingReq) {
            setRequests((prev) =>
              prev.map((r) => (r.id === isFulfillingReq.id ? { ...r, status: "Fulfilled" } : r))
            );
            triggerToast(`Fulfilled request for "${isFulfillingReq.title}"!`);
            setIsFulfillingReq(null);
          } else {
            triggerToast("Study resource successfully shared with the community!");
          }

          // Reset Upload Form & Modal state
          setUploadForm({
            title: "",
            course: "",
            category: "Soil Science",
            type: "Notes",
            year: "2026",
            semester: "Semester I",
            description: "",
            fileAttached: null
          });
          setUploadingState({ status: "idle", progress: 0, message: "" });
          setIsUploadOpen(false);
        }, 1000);
      }
    }, 250);
  };

  // Request Document Submission
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestForm.title || !requestForm.course) {
      triggerToast("Please fill in all requested fields", "error");
      return;
    }

    const newReq = {
      id: `req-${Date.now()}`,
      title: requestForm.title,
      course: requestForm.course,
      category: requestForm.category,
      requestedBy: "You (Student)",
      upvotes: 1,
      createdAt: new Date().toISOString().split('T')[0],
      status: "Open"
    };

    setRequests((prev) => [newReq, ...prev]);
    triggerToast("Resource request listed on the board!");
    setRequestForm({
      title: "",
      course: "",
      category: "Soil Science"
    });
    setIsRequestOpen(false);
  };

  // Fulfill request trigger
  const handleFulfillRequest = (req) => {
    setIsFulfillingReq(req);
    setUploadForm({
      title: `Study Material: ${req.title}`,
      course: req.course,
      category: req.category,
      type: req.title.toLowerCase().includes("paper") ? "Exam Paper" : "Notes",
      year: "2026",
      semester: "Semester I",
      description: `Fulfilling request placed by ${req.requestedBy} for this material.`,
      fileAttached: null
    });
    setIsUploadOpen(true);
  };

  // Filtering Logic
  const filteredDocuments = documents.filter((doc) => {
    // Search Query filter
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category pill filter
    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;

    // Sidebar tab filter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "notes" && doc.type === "Notes") ||
      (activeTab === "papers" && doc.type === "Exam Paper") ||
      (activeTab === "my-uploads" && myUploadedDocIds.has(doc.id));

    return matchesSearch && matchesCategory && matchesTab;
  });

  // Sorting Logic
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === "downloads") {
      return b.downloads - a.downloads;
    }
    if (sortBy === "ratings") {
      return b.upvotes - a.upvotes;
    }
    return 0;
  });

  // Color Mapping Helper
  const getBadgeColors = (type) => {
    switch (type) {
      case "Exam Paper":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Notes":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Study Guide":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Practice Sheets":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getDocIcon = (type) => {
    switch (type) {
      case "Exam Paper":
        return "quiz";
      case "Notes":
        return "description";
      case "Study Guide":
        return "menu_book";
      case "Practice Sheets":
        return "checklist";
      default:
        return "article";
    }
  };

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto w-full flex-1 relative">
      {/* Toast Messages */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 text-sm ${
                toast.type === "error"
                  ? "bg-red-950/80 border-red-500/30 text-red-200"
                  : "bg-surface-container-high/90 border-primary/20 text-[#c0c1ff]"
              } backdrop-blur-xl`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {toast.type === "error" ? "error" : "check_circle"}
              </span>
              <p className="font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-surface-container-low to-surface-container border border-muted-foreground/10 p-6 md:p-8 rounded-3xl relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/35">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-fixed">GKVK Community Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-[#c0c1ff] to-[#8B5CF6] bg-clip-text text-transparent">
            Notes & Exam Papers Share
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Instantly download quality course materials, past question banks, and notes shared by agriculture scholars. 
            Got study files? Share them with peers and claim appreciation credits!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 shrink-0">
          <Button 
            onClick={() => {
              setIsFulfillingReq(null);
              setIsUploadOpen(true);
            }} 
            className="rounded-2xl font-bold bg-gradient-to-r from-secondary-container to-[#8B5CF6] hover:brightness-110 shadow-lg shadow-secondary/20 h-12 text-sm transition-all"
          >
            <span className="material-symbols-outlined mr-2">upload</span>
            Upload & Share
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsRequestOpen(true)}
            className="rounded-2xl font-bold border-muted-foreground/20 hover:bg-muted/10 h-12 text-sm"
          >
            <span className="material-symbols-outlined mr-2">contact_support</span>
            Request Resource
          </Button>
        </div>
      </section>

      {/* Analytics Mini-cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Community Uploads", value: `${documents.length + 2420} shared`, icon: "folder_open", desc: "Lecture notes, study guides, and templates" },
          { label: "Total Downloads", value: "14,892 files", icon: "download", desc: "Resources accessed by students this semester" },
          { label: "Pending Requests", value: `${requests.filter(r => r.status === "Open").length} requests`, icon: "pending_actions", desc: "Materials looking for authors to fulfill" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col p-5 rounded-2xl bg-surface-container-low/40 border border-muted-foreground/10 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">{stat.icon}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground/75 mt-1 font-medium">{stat.desc}</span>
          </div>
        ))}
      </section>

      {/* Navigation and Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-muted-foreground/10 pb-4">
          {/* Main Tab Controls */}
          <div className="flex items-center overflow-x-auto gap-1 bg-surface-container-lowest/80 border border-muted-foreground/10 p-1 rounded-2xl w-fit max-w-full">
            {[
              { id: "all", label: "Browse All", icon: "grid_view" },
              { id: "notes", label: "Lecture Notes", icon: "description" },
              { id: "papers", label: "Exam Papers", icon: "quiz" },
              { id: "requests", label: "Requests Board", icon: "forum" },
              { id: "my-uploads", label: "My Uploads", icon: "cloud_done" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-secondary/15 text-[#8B5CF6] shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Filter, Sort Inputs */}
          {activeTab !== "requests" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">search</span>
                <Input
                  placeholder="Search titles, courses, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/20 border-muted-foreground/10 rounded-xl h-10 text-xs w-full focus-visible:ring-1 focus-visible:ring-[#8B5CF6]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-high/60 border border-muted-foreground/10 rounded-xl h-10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="recent">Sort by: Recent</option>
                <option value="downloads">Sort by: Downloads</option>
                <option value="ratings">Sort by: Upvotes</option>
              </select>
            </div>
          )}
        </div>

        {/* Category Pills Slider */}
        {activeTab !== "requests" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface-container-low/20 text-muted-foreground border-muted-foreground/10 hover:border-muted-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Main Grid View */}
      <section className="min-h-[400px]">
        {activeTab === "requests" ? (
          /* REQUESTS BOARD VIEW */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Unfulfilled Requests</h2>
                <p className="text-muted-foreground text-xs">Help fellow agriculture scholars by uploading what they are looking for.</p>
              </div>
            </div>

            {requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-surface-container-low/30 border border-muted-foreground/10 flex items-start gap-4 transition-all hover:border-secondary/30 relative"
                  >
                    <div className="flex flex-col items-center gap-1.5 p-2 px-3 bg-muted/20 rounded-xl shrink-0 border border-muted-foreground/5">
                      <button
                        onClick={() => handleUpvoteReq(req.id)}
                        className={`material-symbols-outlined text-[20px] transition-colors cursor-pointer ${
                          votedRequests[req.id] ? "text-[#8B5CF6] font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        expand_less
                      </button>
                      <span className="text-xs font-bold leading-none">{req.upvotes}</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-extrabold tracking-wider bg-secondary/5 text-[#8B5CF6] border-secondary/15 uppercase px-2 py-0">
                          {req.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{req.course}</span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground line-clamp-1">{req.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>Requested by {req.requestedBy}</span>
                        <span>•</span>
                        <span>{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2 justify-between h-full">
                      {req.status === "Fulfilled" ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-500/10 p-2 py-1.5 rounded-lg border border-emerald-500/20">
                          <span className="material-symbols-outlined text-[14px]">done_all</span>
                          Fulfilled
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleFulfillRequest(req)}
                          className="rounded-xl font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white border border-[#8B5CF6]/20 transition-all h-9 text-xs"
                        >
                          <span className="material-symbols-outlined mr-1 text-[14px]">file_upload</span>
                          Fulfill
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <span className="material-symbols-outlined text-5xl text-muted-foreground/40">assignment_turned_in</span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Requests are cleared</h3>
                  <p className="text-muted-foreground text-xs max-w-sm">
                    No active study material requests right now. Create a request if you are searching for resources.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* DOCUMENTS GRID VIEW */
          <>
            {sortedDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setPreviewDoc(doc);
                      setIsPreviewOpen(true);
                    }}
                    className="p-5 rounded-2xl bg-surface-container-low/20 border border-muted-foreground/10 hover:border-[#8B5CF6]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-xl relative overflow-hidden"
                  >
                    {/* Glowing effect inside card on hover */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-[#8B5CF6]/10 transition-colors pointer-events-none" />

                    <div>
                      {/* Card Top Details */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-muted/40 border border-muted-foreground/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">
                              {getDocIcon(doc.type)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">{doc.fileType} • {doc.fileSize}</span>
                          </div>
                        </div>

                        {/* Votes Block */}
                        <div 
                          className="flex items-center bg-muted/30 border border-muted-foreground/5 rounded-lg p-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleUpvoteDoc(e, doc.id)}
                            className={`p-1.5 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer ${
                              votedDocs[doc.id] === "up" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                          </button>
                          <span className="text-[10px] font-bold px-1.5 text-foreground">{doc.upvotes}</span>
                        </div>
                      </div>

                      {/* Info Block */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border tracking-wide ${getBadgeColors(doc.type)}`}>
                            {doc.type}
                          </Badge>
                          <span className="text-[10px] font-medium text-muted-foreground line-clamp-1">{doc.course}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-6 pt-4 border-t border-muted-foreground/10 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <img
                          src={doc.uploader.avatar}
                          alt={doc.uploader.name}
                          className="w-5 h-5 rounded-full border border-muted-foreground/20 bg-muted/40"
                        />
                        <span className="font-semibold text-foreground/80 truncate max-w-[100px]">{doc.uploader.name}</span>
                      </div>

                      {/* Download trigger */}
                      <button
                        onClick={(e) => handleDownload(e, doc)}
                        disabled={downloadingDocs[doc.id] !== undefined}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all relative overflow-hidden cursor-pointer ${
                          downloadingDocs[doc.id] !== undefined
                            ? "bg-secondary/10 text-secondary border border-secondary/20"
                            : "bg-[#8B5CF6]/5 hover:bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/10"
                        }`}
                      >
                        {downloadingDocs[doc.id] !== undefined ? (
                          <>
                            {/* Inner progress bar */}
                            <span 
                              className="absolute top-0 left-0 bottom-0 bg-[#8B5CF6]/15 transition-all duration-150"
                              style={{ width: `${downloadingDocs[doc.id]}%` }}
                            />
                            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                            <span className="z-10 text-[10px] font-bold">{downloadingDocs[doc.id]}%</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>{doc.downloads}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center border border-muted-foreground/10 text-muted-foreground/50">
                  <span className="material-symbols-outlined text-3xl">find_in_page</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">No results found</h3>
                  <p className="text-muted-foreground text-xs max-w-sm">
                    No documents matched your filters. Try resetting the category or adjust your search keywords.
                  </p>
                </div>
                {(searchQuery || selectedCategory !== "All") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="rounded-xl font-bold h-9 text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (aiScannerState.status === "idle") setIsPreviewOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface border border-muted-foreground/15 text-foreground rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row"
            >
              {/* Left Side: Mock Document Viewer */}
              <div className="flex-1 bg-surface-container-lowest/60 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-muted-foreground/10 max-h-[40vh] md:max-h-[85vh] relative overflow-hidden">
                {/* PDF Blueprint mockup */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                {aiScannerState.status === "scanning" ? (
                  /* AI Synthesizer animation state */
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 relative z-10">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center animate-spin border-t-primary border-r-primary">
                        <span className="material-symbols-outlined text-4xl text-[#8B5CF6] animate-pulse">auto_awesome</span>
                      </div>
                      <div className="absolute inset-0 w-24 h-24 rounded-full bg-secondary/5 blur-lg" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-foreground">AI Synthesis in Progress...</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">{aiScannerState.step}</p>
                    </div>
                    <div className="w-48 bg-muted/40 h-1.5 rounded-full overflow-hidden border border-muted-foreground/5">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-150"
                        style={{ width: `${aiScannerState.progress}%` }}
                      />
                    </div>
                  </div>
                ) : aiScannerState.status === "complete" ? (
                  /* AI complete success state */
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 animate-bounce">
                      <span className="material-symbols-outlined text-3xl font-extrabold">check_circle</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-foreground">Study Suite Generated!</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">Flashcards, practice tests, and outlines compiled inside Study Sets.</p>
                    </div>
                  </div>
                ) : (
                  /* Standard preview visual */
                  <>
                    <div className="flex items-center justify-between border-b border-muted-foreground/10 pb-3 mb-4 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span>PREVIEWING DOCUMENT</span>
                      </div>
                      <span>Page 1 of 8</span>
                    </div>

                    {/* Paper Mock Text Overlay */}
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2 relative opacity-75 select-none scrollbar-thin">
                      <div className="space-y-2 text-center pb-4 border-b border-muted-foreground/5">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6]">{previewDoc.course}</h4>
                        <h5 className="font-extrabold text-sm text-foreground">{previewDoc.title}</h5>
                        <p className="text-[10px] text-muted-foreground">GKVK UNIVERSITY PRESS • ACADEMIC YEAR {previewDoc.year}</p>
                      </div>

                      <div className="space-y-3 mt-4 text-[10px] text-foreground">
                        <p className="font-bold">PART A: OBJECTIVE QUESTIONS (Answer all questions)</p>
                        <div className="pl-3 space-y-2 border-l border-muted-foreground/10">
                          <p>Q1. Explain the relationship between matrix potential and hydraulic conductivity under varying saturation points.</p>
                          <p>Q2. Define the key differences between C3 and C4 pathway efficiencies under high thermal conditions.</p>
                          <p>Q3. Elaborate on biological vectors involved in the dissemination of late blight of potato.</p>
                        </div>
                        
                        <p className="font-bold pt-2">PART B: DETAILED EXPLANATIONS</p>
                        <div className="pl-3 space-y-1 border-l border-muted-foreground/10 text-muted-foreground">
                          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet...</p>
                          <p>Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero...</p>
                        </div>
                      </div>

                      {/* Faded watermark blur at the bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-surface-container-lowest/90 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex justify-center pt-4">
                      <span className="text-[9px] text-muted-foreground/50 tracking-wider font-semibold uppercase">Protected PDF Preview • GKVK AI Study Planner</span>
                    </div>
                  </>
                )}
              </div>

              {/* Right Side: Document info details */}
              <div className="w-full md:w-[350px] p-6 flex flex-col justify-between max-h-[45vh] md:max-h-[85vh]">
                <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[9px] font-extrabold px-2 py-0.5 border ${getBadgeColors(previewDoc.type)}`}>
                      {previewDoc.type}
                    </Badge>
                    <button 
                      onClick={() => setIsPreviewOpen(false)}
                      disabled={aiScannerState.status === "scanning"}
                      className="w-7 h-7 rounded-full bg-muted/30 border border-muted-foreground/10 flex items-center justify-center hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground leading-snug">{previewDoc.title}</h3>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Course Code:</span>
                        <span className="font-semibold">{previewDoc.course.split(':')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Academic Year:</span>
                        <span className="font-semibold">{previewDoc.year} ({previewDoc.semester})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Size:</span>
                        <span className="font-semibold">{previewDoc.fileSize} ({previewDoc.fileType})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/20 border border-muted-foreground/5 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={previewDoc.uploader.avatar}
                        alt={previewDoc.uploader.name}
                        className="w-5 h-5 rounded-full border border-muted-foreground/20"
                      />
                      <span className="font-semibold text-foreground/80">Uploaded by {previewDoc.uploader.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 block">Shared on {new Date(previewDoc.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{previewDoc.description}</p>
                  </div>
                </div>

                {/* Actions Bottom panel */}
                <div className="space-y-3 pt-6 border-t border-muted-foreground/10">
                  {/* Synthesis shortcut */}
                  <Button
                    onClick={() => handleAiScan(previewDoc)}
                    disabled={aiScannerState.status === "scanning" || aiScannerState.status === "complete"}
                    className="w-full rounded-xl font-bold bg-gradient-to-r from-secondary-container to-primary-container hover:brightness-110 shadow-md shadow-[#8B5CF6]/10 text-white h-11 text-xs transition-all"
                  >
                    <span className="material-symbols-outlined mr-2 text-[16px] animate-pulse">auto_awesome</span>
                    Convert to AI Study Set
                  </Button>

                  <div className="flex gap-2">
                    {/* Vote trigger */}
                    <Button
                      variant="outline"
                      onClick={(e) => handleUpvoteDoc(e, previewDoc.id)}
                      className={`flex-1 rounded-xl font-bold h-10 text-xs ${votedDocs[previewDoc.id] === "up" ? "text-primary border-primary/45" : ""}`}
                    >
                      <span className="material-symbols-outlined mr-1.5 text-[14px]">thumb_up</span>
                      {votedDocs[previewDoc.id] === "up" ? "Liked" : "Upvote"} ({previewDoc.upvotes})
                    </Button>

                    {/* Download PDF */}
                    <Button
                      onClick={(e) => handleDownload(e, previewDoc)}
                      disabled={downloadingDocs[previewDoc.id] !== undefined}
                      className="flex-1 rounded-xl font-bold h-10 text-xs bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                      <span className="material-symbols-outlined mr-1.5 text-[14px]">download</span>
                      {downloadingDocs[previewDoc.id] !== undefined ? "Downloading..." : "Download"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT UPLOAD DIALOG MODAL */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (uploadingState.status === "idle") setIsUploadOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface border border-muted-foreground/15 text-foreground rounded-2xl w-full p-6 shadow-2xl relative z-10 flex flex-col overflow-hidden max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-muted-foreground/10 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                  </div>
                  <h3 className="text-base font-extrabold">
                    {isFulfillingReq ? "Fulfill Resource Request" : "Upload to Sharing Hub"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  disabled={uploadingState.status === "uploading"}
                  className="w-7 h-7 rounded-full bg-muted/30 border border-muted-foreground/10 flex items-center justify-center hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {uploadingState.status === "uploading" ? (
                /* Upload progress state display */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center animate-spin border-t-primary border-r-primary">
                    <span className="material-symbols-outlined text-2xl text-primary animate-pulse">cloud_upload</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Sharing Document</h4>
                    <p className="text-xs text-muted-foreground max-w-xs">{uploadingState.message}</p>
                  </div>
                  <div className="w-64 bg-muted/40 h-1.5 rounded-full overflow-hidden border border-muted-foreground/5">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-150"
                      style={{ width: `${uploadingState.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* Form fields */
                <form onSubmit={handleUploadSubmit} className="space-y-4 overflow-y-auto pr-1 pb-1 scrollbar-thin">
                  {isFulfillingReq && (
                    <div className="p-3 bg-secondary/5 border border-secondary/15 rounded-xl text-xs space-y-1">
                      <span className="font-extrabold text-[#8B5CF6] block uppercase tracking-wider text-[9px]">Fulfilling Request Placed By:</span>
                      <p className="font-semibold">{isFulfillingReq.requestedBy} for "{isFulfillingReq.title}"</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Title *</label>
                    <Input
                      placeholder="e.g., Soil Microbiology Lecture Slides Week 1-4"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      required
                      className="bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Code *</label>
                      <Input
                        placeholder="e.g., GPB-201"
                        value={uploadForm.course}
                        onChange={(e) => setUploadForm({ ...uploadForm, course: e.target.value })}
                        required
                        className="bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                      <select
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                        className="w-full bg-surface-container-high border border-muted-foreground/10 rounded-xl h-10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary cursor-pointer"
                      >
                        {CATEGORIES.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Type</label>
                      <select
                        value={uploadForm.type}
                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                        className="w-full bg-surface-container-high border border-muted-foreground/10 rounded-xl h-10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary cursor-pointer"
                      >
                        <option value="Notes">Lecture Notes</option>
                        <option value="Exam Paper">Exam Paper</option>
                        <option value="Study Guide">Study Guide</option>
                        <option value="Practice Sheets">Practice Sheets</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Academic Year</label>
                      <select
                        value={uploadForm.year}
                        onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                        className="w-full bg-surface-container-high border border-muted-foreground/10 rounded-xl h-10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary cursor-pointer"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Semester</label>
                      <select
                        value={uploadForm.semester}
                        onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                        className="w-full bg-surface-container-high border border-muted-foreground/10 rounded-xl h-10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary cursor-pointer"
                      >
                        <option value="Semester I">Semester I</option>
                        <option value="Semester II">Semester II</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description *</label>
                    <Textarea
                      placeholder="Briefly describe what this file contains, e.g. units covered, question count, answers key status..."
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      required
                      rows={3}
                      className="bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-[#8B5CF6] text-xs resize-none"
                    />
                  </div>

                  {/* Drag and Drop Box Mock */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attach Document File *</label>
                    {uploadForm.fileAttached ? (
                      <div className="p-3.5 bg-secondary/5 border border-secondary/20 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
                          <div>
                            <span className="font-bold block text-foreground leading-tight line-clamp-1">{uploadForm.fileAttached.name}</span>
                            <span className="text-[10px] text-muted-foreground">{uploadForm.fileAttached.size}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadForm({ ...uploadForm, fileAttached: null })}
                          className="w-6 h-6 rounded-md hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={triggerMockFileAttach}
                        className="border border-dashed border-muted-foreground/20 hover:border-secondary/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/10 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-3xl text-muted-foreground/60 animate-pulse">cloud_upload</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">Click to simulate attaching a document</p>
                          <p className="text-[10px] text-muted-foreground">Supports PDF, DOCX, PPTX up to 50MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 border-t border-muted-foreground/10 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsUploadOpen(false)}
                      className="rounded-xl font-semibold h-10 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl font-bold bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-md shadow-[#8B5CF6]/20 h-10 text-xs"
                    >
                      <span className="material-symbols-outlined text-[14px] mr-1.5">share</span>
                      Publish Resource
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REQUEST DOCUMENT MODAL */}
      <AnimatePresence>
        {isRequestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface border border-muted-foreground/15 text-foreground rounded-2xl w-full p-6 shadow-2xl relative z-10 flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-muted-foreground/10 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">contact_support</span>
                  </div>
                  <h3 className="text-base font-extrabold">Request Study Resource</h3>
                </div>
                <button
                  onClick={() => setIsRequestOpen(false)}
                  className="w-7 h-7 rounded-full bg-muted/30 border border-muted-foreground/10 flex items-center justify-center hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Looking for something that isn't available? List a request. Scholars or class peers can see it on the Requests Board and upload the file.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Name / Topic *</label>
                  <Input
                    placeholder="e.g., Plant Biochemistry Final Exam Paper 2025"
                    value={requestForm.title}
                    onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                    required
                    className="bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Code *</label>
                    <Input
                      placeholder="e.g., BC-201"
                      value={requestForm.course}
                      onChange={(e) => setRequestForm({ ...requestForm, course: e.target.value })}
                      required
                      className="bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                    <select
                      value={requestForm.category}
                      onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                      className="w-full bg-surface-container-high border border-muted-foreground/10 rounded-xl h-10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-secondary cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-muted-foreground/10 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsRequestOpen(false)}
                    className="rounded-xl font-semibold h-10 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl font-bold bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-md shadow-[#8B5CF6]/20 h-10 text-xs"
                  >
                    Post Request
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
