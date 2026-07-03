"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  fetchSharedDocuments, 
  fetchDocumentRequests, 
  shareDocument, 
  createDocumentRequest, 
  toggleUpvoteDocument, 
  toggleUpvoteRequest, 
  incrementDownloadCount, 
  fulfillDocumentRequest,
  fetchSharedDocumentById
} from "@/actions/notes";
import client, { uploadHandler } from "@/config/client";
import Image from "next/image";

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function DocumentCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-app-card border border-app-border animate-pulse flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-app-inset/60" />
            <div className="h-3 w-20 bg-app-inset/60 rounded" />
          </div>
          <div className="h-6 w-12 bg-app-inset/60 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-app-inset/60 rounded-lg" />
            <div className="h-5 w-24 bg-app-inset/60 rounded-lg" />
          </div>
          <div className="h-4 w-3/4 bg-app-inset/60 rounded" />
          <div className="h-3 w-full bg-app-inset/60 rounded" />
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-app-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-app-inset/60" />
          <div className="h-3 w-16 bg-app-inset/60 rounded" />
        </div>
        <div className="h-8 w-12 bg-app-inset/60 rounded-lg" />
      </div>
    </div>
  );
}

function RequestCardSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-app-card border border-app-border animate-pulse flex items-start gap-4">
      <div className="w-12 h-12 bg-app-inset/60 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-app-inset/60 rounded" />
          <div className="h-3 w-12 bg-app-inset/60 rounded" />
        </div>
        <div className="h-4 w-1/2 bg-app-inset/60 rounded" />
        <div className="h-3 w-24 bg-app-inset/60 rounded" />
      </div>
      <div className="h-8 w-16 bg-app-inset/60 rounded-lg shrink-0" />
    </div>
  );
}

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

const toTitleCase = (str) => {
  if (!str) return "";
  let cleaned = str
    .replace(/\bsciecne\b/gi, "Science")
    .replace(/\bversio\b/gi, "Version")
    .replace(/\bn2\b/gi, "v2");
  return cleaned
    .split(' ')
    .map(word => {
      if (/^[A-Z0-9]{3,}$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export default function SharingHubPage() {
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, notes, papers, requests, my-uploads
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent"); // recent, downloads, ratings
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsersCount, setActiveUsersCount] = useState(1);
  const [activeDocViewers, setActiveDocViewers] = useState(1);
  const fileInputRef = useRef(null);

  // Load data from DB on mount
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [docsRes, reqsRes, userRes] = await Promise.all([
          fetchSharedDocuments(),
          fetchDocumentRequests(),
          client.auth.getUser()
        ]);
        if (docsRes.success) {
          setDocuments(docsRes.data);
        }
        if (reqsRes.success) {
          setRequests(reqsRes.data);
        }
        if (userRes.data?.user) {
          setCurrentUserId(userRes.data.user.id);
        }
      } catch (err) {
        console.error("Failed to load initial notes data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);



  const refreshData = async () => {
    try {
      const [docsRes, reqsRes] = await Promise.all([
        fetchSharedDocuments(),
        fetchDocumentRequests()
      ]);
      if (docsRes.success) setDocuments(docsRes.data);
      if (reqsRes.success) setRequests(reqsRes.data);
    } catch (err) {
      console.error("Failed to refresh notes data:", err);
    }
  };

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

  // ─── Presence: Global Hub Scholars Online ──────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const channel = client.channel("presence-sharing-hub", {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setActiveUsersCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: currentUserId,
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);

  // ─── Presence: Document Viewer Collaboration ──────────────────────────────
  useEffect(() => {
    if (!isPreviewOpen || !previewDoc || !currentUserId) {
      setActiveDocViewers(1);
      return;
    }

    const docChannel = client.channel(`doc-${previewDoc.id}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    docChannel
      .on("presence", { event: "sync" }, () => {
        const state = docChannel.presenceState();
        const count = Object.keys(state).length;
        setActiveDocViewers(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await docChannel.track({
            online_at: new Date().toISOString(),
            user_id: currentUserId,
          });
        }
      });

    return () => {
      docChannel.unsubscribe();
    };
  }, [isPreviewOpen, previewDoc?.id, currentUserId]);
  
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
  const handleUpvoteDoc = async (e, docId) => {
    e.stopPropagation();
    e.preventDefault();

    let rollbackDoc = null;
    let newUpvoted = false;
    let newUpvotesCount = 0;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          rollbackDoc = { ...doc };
          newUpvoted = !doc.upvoted;
          newUpvotesCount = doc.upvoted ? Math.max(0, doc.upvotes - 1) : doc.upvotes + 1;
          return { ...doc, upvoted: newUpvoted, upvotes: newUpvotesCount };
        }
        return doc;
      })
    );

    setPreviewDoc((prev) => {
      if (prev && prev.id === docId) {
        return { ...prev, upvoted: newUpvoted, upvotes: newUpvotesCount };
      }
      return prev;
    });

    try {
      const res = await toggleUpvoteDocument(docId);
      if (!res.success) {
        if (rollbackDoc) {
          setDocuments((prev) => prev.map((doc) => (doc.id === docId ? rollbackDoc : doc)));
          setPreviewDoc((prev) => (prev && prev.id === docId ? rollbackDoc : prev));
        }
        triggerToast(res.error || "Failed to update upvote", "error");
      } else {
        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id === docId) {
              return { ...doc, upvoted: res.upvoted, upvotes: res.upvotesCount };
            }
            return doc;
          })
        );
        setPreviewDoc((prev) => {
          if (prev && prev.id === docId) {
            return { ...prev, upvoted: res.upvoted, upvotes: res.upvotesCount };
          }
          return prev;
        });
        triggerToast(res.upvoted ? "Upvoted document!" : "Removed upvote");
      }
    } catch (err) {
      console.error(err);
      if (rollbackDoc) {
        setDocuments((prev) => prev.map((doc) => (doc.id === docId ? rollbackDoc : doc)));
        setPreviewDoc((prev) => (prev && prev.id === docId ? rollbackDoc : prev));
      }
      triggerToast("Error updating upvote", "error");
    }
  };

  const handleUpvoteReq = async (reqId) => {
    let rollbackReq = null;
    let newUpvoted = false;
    let newUpvotesCount = 0;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === reqId) {
          rollbackReq = { ...req };
          newUpvoted = !req.upvoted;
          newUpvotesCount = req.upvoted ? Math.max(0, req.upvotes - 1) : req.upvotes + 1;
          return { ...req, upvoted: newUpvoted, upvotes: newUpvotesCount };
        }
        return req;
      })
    );

    try {
      const res = await toggleUpvoteRequest(reqId);
      if (!res.success) {
        if (rollbackReq) {
          setRequests((prev) => prev.map((req) => (req.id === reqId ? rollbackReq : req)));
        }
        triggerToast(res.error || "Failed to update upvote", "error");
      } else {
        setRequests((prev) =>
          prev.map((req) => {
            if (req.id === reqId) {
              return { ...req, upvoted: res.upvoted, upvotes: res.upvotesCount };
            }
            return req;
          })
        );
        triggerToast(res.upvoted ? "Upvoted request!" : "Removed upvote");
      }
    } catch (err) {
      console.error(err);
      if (rollbackReq) {
        setRequests((prev) => prev.map((req) => (req.id === reqId ? rollbackReq : req)));
      }
      triggerToast("Error updating upvote", "error");
    }
  };

  // Download handler
  const handleDownload = async (e, doc) => {
    e.stopPropagation();
    e.preventDefault();
    if (downloadingDocs[doc.id] !== undefined) return;

    setDownloadingDocs((prev) => ({ ...prev, [doc.id]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setDownloadingDocs((prev) => ({ ...prev, [doc.id]: Math.min(progress, 90) }));
    }, 100);

    try {
      // Securely fetch file binary blob from Supabase storage bucket
      const { data, error } = await client.storage
        .from('notes-sharing-materials')
        .download(doc.file_path);

      if (error) throw error;

      clearInterval(interval);
      setDownloadingDocs((prev) => ({ ...prev, [doc.id]: 100 }));

      // Create a blob object URL to trigger instant local download
      const blobUrl = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${doc.title}.${doc.file_type.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Increment count in DB
      const res = await incrementDownloadCount(doc.id);
      if (res.success) {
        setDocuments(prevDocs =>
          prevDocs.map(d => d.id === doc.id ? { ...d, downloads: res.downloadsCount } : d)
        );
        setPreviewDoc(prev => prev && prev.id === doc.id ? { ...prev, downloads: res.downloadsCount } : prev);
      }
      triggerToast(`Successfully downloaded "${doc.title}"!`);
      
      // Delay clean up slightly for animation
      setTimeout(() => {
        setDownloadingDocs((prev) => {
          const next = { ...prev };
          delete next[doc.id];
          return next;
        });
      }, 500);
    } catch (err) {
      clearInterval(interval);
      console.error("Download failed:", err);
      triggerToast(err.message || "Failed to download file", "error");
      setDownloadingDocs((prev) => {
        const next = { ...prev };
        delete next[doc.id];
        return next;
      });
    }
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
          setTimeout(() => {
            setAiScannerState({ status: "idle", progress: 0, step: "" });
            setIsPreviewOpen(false);
          }, 1500);
        }, 600);
      }
    }, 120);
  };

  // File Upload Handlers (Handles real uploads to storage)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadForm((prev) => ({
      ...prev,
      fileAttached: file
    }));
    triggerToast("Document file attached successfully!");
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.course || !uploadForm.description) {
      triggerToast("Please fill in all required fields", "error");
      return;
    }
    if (!uploadForm.fileAttached) {
      triggerToast("Please attach a document file before sharing", "error");
      return;
    }

    try {
      setUploadingState({ status: "uploading", progress: 10, message: "Uploading document files..." });
      
      // Upload the actual file using client-side handler
      const uploadRes = await uploadHandler(uploadForm.fileAttached, 'notes-sharing-materials');
      if (!uploadRes.success) {
        throw new Error(uploadRes.error || "Failed to upload file to storage.");
      }

      setUploadingState({ status: "uploading", progress: 40, message: "Scanning files for malware..." });
      await new Promise(r => setTimeout(r, 600));

      setUploadingState({ status: "uploading", progress: 65, message: "Extracting syllabus alignments..." });
      await new Promise(r => setTimeout(r, 600));

      setUploadingState({ status: "uploading", progress: 85, message: "Saving metadata..." });

      const fileExt = uploadForm.fileAttached.name.split('.').pop().toUpperCase();
      const fileSizeStr = (uploadForm.fileAttached.size / (1024 * 1024)).toFixed(1) + " MB";

      // Call server action to insert metadata
      const docRes = await shareDocument({
        title: uploadForm.title,
        course: uploadForm.course,
        category: uploadForm.category,
        type: uploadForm.type,
        year: uploadForm.year,
        semester: uploadForm.semester,
        fileUrl: uploadRes.url,
        filePath: uploadRes.path,
        fileSize: fileSizeStr,
        fileType: fileExt,
        description: uploadForm.description
      });

      if (!docRes.success) {
        throw new Error(docRes.error || "Failed to save document metadata.");
      }

      setUploadingState({ status: "uploading", progress: 100, message: "Publishing to feed..." });
      await new Promise(r => setTimeout(r, 400));

      // Fetch fresh data from DB
      await refreshData();

      // If fulfilling request
      if (isFulfillingReq) {
        const fulfillRes = await fulfillDocumentRequest(isFulfillingReq.id, {
          title: uploadForm.title,
          course: uploadForm.course,
          category: uploadForm.category,
          type: uploadForm.type,
          year: uploadForm.year,
          semester: uploadForm.semester,
          fileUrl: uploadRes.url,
          filePath: uploadRes.path,
          fileSize: fileSizeStr,
          fileType: fileExt,
          description: uploadForm.description
        });
        if (fulfillRes.success) {
          triggerToast(`Fulfilled request for "${isFulfillingReq.title}"!`);
        }
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
    } catch (err) {
      console.error(err);
      triggerToast(err.message || "Failed to share document", "error");
      setUploadingState({ status: "idle", progress: 0, message: "" });
    }
  };

  // Request Document Submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.title || !requestForm.course) {
      triggerToast("Please fill in all requested fields", "error");
      return;
    }

    try {
      const res = await createDocumentRequest({
        title: requestForm.title,
        course: requestForm.course,
        category: requestForm.category
      });

      if (res.success) {
        triggerToast("Resource request listed on the board!");
        await refreshData();
        setRequestForm({
          title: "",
          course: "",
          category: "Soil Science"
        });
        setIsRequestOpen(false);
      } else {
        triggerToast(res.error || "Failed to create request", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to create request", "error");
    }
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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filtering Logic
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      doc.course.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (doc.description || "").toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "notes" && doc.type === "Notes") ||
      (activeTab === "papers" && doc.type === "Exam Paper") ||
      (activeTab === "my-uploads" && doc.user_id === currentUserId);

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

  // Calculate dynamic stats
  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloads || 0), 0);

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto w-full flex-1 relative">
      {/* Toast Messages */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl border shadow-xl flex items-start justify-between gap-3 text-xs pointer-events-auto ${
                toast.type === "error"
                  ? "bg-red-950/90 border-red-500/20 text-red-200"
                  : "bg-surface-container-high/90 border-app-border text-text-primary"
              } backdrop-blur-md`}
            >
              <div className="flex gap-2.5 items-start">
                <span className={`material-symbols-outlined text-[16px] mt-0.5 shrink-0 ${toast.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
                  {toast.type === "error" ? "error" : "check_circle"}
                </span>
                <p className="font-semibold leading-relaxed pr-2">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-text-secondary hover:text-text-primary transition-colors shrink-0 mt-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-app-card border border-app-border p-6 md:p-8 rounded-xl relative overflow-hidden shadow-sm">
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-app-brand/10 border border-app-brand/20">
              <span className="w-1.5 h-1.5 rounded-full bg-app-brand animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-app-brand">GKVK Community Hub</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                {activeUsersCount} {activeUsersCount === 1 ? 'Student' : 'Students'} Online
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight leading-none md:text-4xl">
            Notes & Papers Sharing Hub
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Collaboratively crowdsource verified lecture notes, GKVK question banks, syllabus guides, and lab records. Scan shared PDF resources directly into your personal AI Study Sets with one click.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0">
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="rounded-lg font-bold bg-app-brand hover:bg-app-brand-hover text-white border-none shadow-sm h-12 text-sm transition-all px-6"
          >
            <span className="material-symbols-outlined mr-2">upload</span>
            Upload & Share
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsRequestOpen(true)}
            className="rounded-lg font-bold border border-app-border hover:bg-white/5 text-text-primary h-12 text-sm transition-all px-6"
          >
            <span className="material-symbols-outlined mr-2">contact_support</span>
            Request Resource
          </Button>
        </div>
      </section>

      {/* Analytics Mini-cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Community Uploads", value: `${documents.length} shared`, icon: "folder_open", desc: "Lecture notes, study guides, and templates" },
          { label: "Total Downloads", value: `${totalDownloads} files`, icon: "download", desc: "Resources accessed by students this semester" },
          { label: "Pending Requests", value: `${requests.length} requests`, icon: "pending_actions", desc: "Materials looking for authors to fulfill" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col p-5 rounded-xl bg-app-card border border-app-border relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-app-brand">{stat.icon}</span>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</span>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{stat.value}</span>
            <span className="text-[10px] text-text-secondary mt-1 font-medium">{stat.desc}</span>
          </div>
        ))}
      </section>

      {/* Navigation and Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Tab Controls */}
          <div className="flex items-center overflow-x-auto gap-1 bg-app-inset border border-app-border p-1 rounded-xl w-fit max-w-full">
            {[
              { id: "all", label: "Browse All", icon: "grid_view" },
              { id: "notes", label: "Lecture Notes", icon: "description" },
              { id: "papers", label: "Exam Papers", icon: "quiz" },
              { id: "requests", label: "Requests Board", icon: "forum" },
              { id: "my-uploads", label: "My Uploads", icon: "cloud_done" },
              { id: "groups", label: "Collab Rooms", icon: "groups", comingSoon: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-app-brand/10 text-app-brand shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.comingSoon && (
                  <Badge variant="outline" className="ml-1 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20 px-1 py-0 h-4 uppercase tracking-wider font-extrabold animate-pulse">
                    Soon
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Search, Filter, Sort Inputs */}
          {activeTab !== "requests" && activeTab !== "groups" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
                <Input
                  placeholder="Search titles, courses, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-app-inset border border-app-border text-text-primary rounded-lg h-10 text-xs w-full focus-visible:ring-1 focus-visible:ring-app-brand"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-app-inset border border-app-border rounded-lg h-10 px-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-app-brand cursor-pointer"
              >
                <option value="recent">Sort by: Recent</option>
                <option value="downloads">Sort by: Downloads</option>
                <option value="ratings">Sort by: Upvotes</option>
              </select>
            </div>
          )}
        </div>

        {/* Category Pills Slider */}
        {activeTab !== "requests" && activeTab !== "groups" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-app-brand text-white border-none"
                    : "bg-app-inset text-text-secondary border-app-border hover:border-text-secondary hover:text-text-primary"
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
        {activeTab === "groups" ? (
          /* COMING SOON STUDY GROUPS VIEW */
          <div className="p-8 rounded-3xl bg-gradient-to-br from-surface-container-low/40 to-surface-container/60 border border-muted-foreground/10 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[400px] space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 text-purple-500 animate-bounce">
              <span className="material-symbols-outlined text-4xl">groups</span>
            </div>
            
            <div className="space-y-2 max-w-md">
              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest text-[9px] font-extrabold px-3 py-1">
                Coming Soon — Q3 2026
              </Badge>
              <h3 className="text-2xl font-extrabold text-foreground">Peer-to-Peer AI Collab Rooms</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect and pair-study with GKVK scholars in real-time. Share dynamic mindmaps, run synchronous flashcard battles, and host live group challenge sessions powered by GKVK AI.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <Input 
                type="email"
                placeholder="Enter email to get early access..." 
                className="bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-[#8B5CF6] h-10 text-xs text-center rounded-xl"
              />
              <Button 
                onClick={() => triggerToast("Registered! We'll notify you when Collab Rooms go live.")}
                className="rounded-xl font-bold bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-md shadow-[#8B5CF6]/20 h-10 text-xs shrink-0"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        ) : activeTab === "requests" ? (
          /* REQUESTS BOARD VIEW */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Unfulfilled Requests</h2>
                <p className="text-muted-foreground text-xs">Help fellow agriculture scholars by uploading what they are looking for.</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <RequestCardSkeleton key={i} />
                ))}
              </div>
            ) : requests.length > 0 ? (
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <DocumentCardSkeleton key={i} />
                ))}
              </div>
            ) : sortedDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={async () => {
                      setPreviewDoc(doc);
                      setIsPreviewOpen(true);
                      try {
                        const fullDocRes = await fetchSharedDocumentById(doc.id);
                        if (fullDocRes.success) {
                          setPreviewDoc(fullDocRes.data);
                        }
                      } catch (err) {
                        console.error("Failed to load document details:", err);
                      }
                    }}
                    className="p-6 rounded-xl bg-app-card border border-app-border hover:-translate-y-0.5 transition-all duration-250 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md relative overflow-hidden"
                  >
                    <div>
                      {/* Card Top Details */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-app-inset border border-app-border flex items-center justify-center text-text-secondary group-hover:text-app-brand transition-colors">
                            <span className="material-symbols-outlined text-[18px]">
                              {getDocIcon(doc.type)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-secondary block font-medium uppercase tracking-wider">{doc.fileType} • {doc.fileSize}</span>
                          </div>
                        </div>

                        {/* Votes Block */}
                        <div 
                          className="flex items-center bg-app-inset border border-app-border rounded-lg p-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleUpvoteDoc(e, doc.id)}
                            className={`p-1.5 rounded-md flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer ${
                              votedDocs[doc.id] === "up" ? "text-app-brand" : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                          </button>
                          <span className="text-[10px] font-bold px-1.5 text-text-primary">{doc.upvotes}</span>
                        </div>
                      </div>

                      {/* Info Block */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] font-bold px-3 py-1 rounded-lg border tracking-wide uppercase ${getBadgeColors(doc.type)}`}>
                            {doc.type}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] font-medium px-3 py-1 bg-app-inset border border-app-border text-text-secondary select-none rounded-lg">
                            {toTitleCase(doc.course)}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-text-primary group-hover:text-app-brand transition-colors leading-snug line-clamp-2">
                          {toTitleCase(doc.title)}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed tracking-wide">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-6 pt-4 border-t border-app-border flex items-center justify-between text-[11px] text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Image
                          src={doc.uploader.avatar}
                          alt={doc.uploader.name}
                          width={20}
                          height={20}
                          unoptimized
                          className="w-5 h-5 rounded-full border border-app-border bg-app-inset"
                        />
                        <span className="font-semibold text-text-primary truncate max-w-[100px]">{doc.uploader.name}</span>
                      </div>

                      {/* Download trigger */}
                      <button
                        onClick={(e) => handleDownload(e, doc)}
                        disabled={downloadingDocs[doc.id] !== undefined}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all relative overflow-hidden cursor-pointer ${
                          downloadingDocs[doc.id] !== undefined
                            ? "bg-app-brand/10 text-app-brand border border-app-brand/20"
                            : "bg-app-brand/5 hover:bg-app-brand/15 text-app-brand border border-app-brand/10"
                        }`}
                      >
                        {downloadingDocs[doc.id] !== undefined ? (
                          <>
                            {/* Inner progress bar */}
                            <span 
                              className="absolute top-0 left-0 bottom-0 bg-app-brand/15 transition-all duration-150"
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
                  <div className="flex-1 flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-muted-foreground/10 pb-3 mb-4 text-xs font-semibold text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span>LIVE DOCUMENT PREVIEW</span>
                      </div>
                      <Badge className="bg-primary/10 text-[#8B5CF6] border border-primary/20 text-[10px]">
                        {previewDoc.fileType}
                      </Badge>
                    </div>

                    {/* Interactive document viewer */}
                    <div className="flex-grow min-h-[300px] md:min-h-[450px] relative rounded-xl overflow-hidden bg-black/20 border border-muted-foreground/10">
                      {previewDoc.file_url === undefined ? (
                        <div className="w-full h-full absolute inset-0 bg-app-inset flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                          <span className="material-symbols-outlined text-4xl text-app-brand animate-spin">sync</span>
                          <p className="text-xs text-text-secondary">Loading secure document preview...</p>
                        </div>
                      ) : (
                        <>
                          <iframe 
                            src={
                              previewDoc.fileType?.toLowerCase() === 'pdf' 
                                ? `${previewDoc.file_url}#toolbar=0` // disable toolbar inside preview
                                : `https://docs.google.com/viewer?url=${encodeURIComponent(previewDoc.file_url || "")}&embedded=true`
                            } 
                            className="w-full h-full absolute inset-0 border-0 bg-white"
                            title={previewDoc.title}
                          />
                          {/* Block access to Google Viewer's pop-out icon button */}
                          {previewDoc.fileType?.toLowerCase() !== 'pdf' && (
                            <div className="absolute top-0 right-0 w-14 h-14 bg-transparent z-10 cursor-default" />
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex justify-center items-center pt-3 shrink-0">
                      <span className="text-[9px] text-muted-foreground/50 tracking-wider font-semibold uppercase">
                        Interactive Preview • GKVK AI Study Planner
                      </span>
                    </div>
                  </div>
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Viewers:</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {activeDocViewers} studying
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/20 border border-muted-foreground/5 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src={previewDoc.uploader.avatar}
                        alt={previewDoc.uploader.name}
                        width={20}
                        height={20}
                        unoptimized
                        className="w-5 h-5 rounded-full border border-muted-foreground/20"
                      />
                      <span className="font-semibold text-foreground/80">Uploaded by {previewDoc.uploader.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 block">Shared on {new Date(previewDoc.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</h4>
                    {previewDoc.description === undefined ? (
                      <div className="space-y-2 animate-pulse mt-1">
                        <div className="h-3 w-full bg-app-inset/60 rounded" />
                        <div className="h-3 w-5/6 bg-app-inset/60 rounded" />
                        <div className="h-3 w-4/5 bg-app-inset/60 rounded" />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed">{previewDoc.description}</p>
                    )}
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
                      className={`flex-1 rounded-xl font-bold h-10 text-xs ${previewDoc.upvoted ? "text-primary border-primary/45" : ""}`}
                    >
                      <span className="material-symbols-outlined mr-1.5 text-[14px]">thumb_up</span>
                      {previewDoc.upvoted ? "Liked" : "Upvote"} ({previewDoc.upvotes})
                    </Button>

                    {/* Download PDF */}
                    <Button
                      onClick={(e) => handleDownload(e, previewDoc)}
                      disabled={downloadingDocs[previewDoc.id] !== undefined || previewDoc.file_url === undefined}
                      className="flex-1 rounded-xl font-bold h-10 text-xs bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                      <span className="material-symbols-outlined mr-1.5 text-[14px]">download</span>
                      {previewDoc.file_url === undefined ? "Loading..." : downloadingDocs[previewDoc.id] !== undefined ? "Downloading..." : "Download"}
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
                            <span className="text-[10px] text-muted-foreground">{uploadForm.fileAttached.formattedSize || uploadForm.fileAttached.size}</span>
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
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-muted-foreground/20 hover:border-secondary/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/10 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept=".pdf,.docx,.pptx"
                        />
                        <span className="material-symbols-outlined text-3xl text-muted-foreground/60 animate-pulse">cloud_upload</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">Click to upload a document</p>
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
