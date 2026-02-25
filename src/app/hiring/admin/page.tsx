"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";

// --- Interfaces ---
interface Application {
  _id: string;
  name: string;
  chitkaraEmail: string;
  rollNumber: string;
  contactNumber: string;
  gender: string;
  department: string;
  group: string;
  specialization: string;
  hosteller: string;
  title: string;
  role: string;
  team: string;
  resumeUrl?: string;
  status: "pending" | "approved" | "done"; // Adjusted status type
  createdAt: string;
  updatedAt: string;
}

interface Career {
  _id: string;
  title: string;
  team: string;
  role: string;
}

interface UpcomingEvent {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  poster: string;
}

// --- Helper Components ---
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  itemType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  itemType: string;
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700 rounded-2xl shadow-2xl shadow-orange-500/10 w-full max-w-md p-6 sm:p-8 text-center transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center ring-2 ring-red-500/30">
          <TrashIcon />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Confirm Deletion
        </h3>
        <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
          Are you sure you want to permanently delete this {itemType}? This
          action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-zinc-700 text-white font-semibold hover:bg-zinc-600 hover:scale-105 transition-all duration-200 disabled:opacity-50 cursor-pointer order-2 sm:order-1 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer order-1 sm:order-2 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// --- Main Dashboard Component ---
export default function AdminDashboard() {
  const router = useRouter();
  const [pendingApplications, setPendingApplications] = useState<Application[]>(
    [],
  );
  const [completedApplications, setCompletedApplications] = useState<
    Application[]
  >([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "application" | "career";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCareerTitle, setNewCareerTitle] = useState("");
  const [newCareerTeam, setNewCareerTeam] = useState("");
  const [newCareerRole, setNewCareerRole] = useState("");
  const [isAddingCareer, setIsAddingCareer] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventPoster, setNewEventPoster] = useState("");
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventPosterFile, setNewEventPosterFile] = useState<File | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "applications" | "openings" | "upcomingEvents"
  >("applications");

  const ITEMS_PER_PAGE = 10;
  const [visiblePendingCount, setVisiblePendingCount] =
    useState(ITEMS_PER_PAGE);
  const [visibleCompletedCount, setVisibleCompletedCount] =
    useState(ITEMS_PER_PAGE);

  const [pendingFilter, setPendingFilter] = useState({
    title: "",
    team: "",
    role: "",
  });
  const [completedFilter, setCompletedFilter] = useState({
    title: "",
    team: "",
    role: "",
  });

  useEffect(() => {
    setMounted(true);

    // Check authentication & role before loading admin data
    (async () => {
      try {
        const res = await fetch("/api/hiring/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/hiring/signin");
          return;
        }
        const data = await res.json();
        if (!data.user || data.user.role !== "admin") {
          router.push("/hiring/signin");
          return;
        }

        await Promise.all([
          fetchApplications(),
          fetchCareers(),
          fetchUpcomingEvents(),
        ]);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/hiring/signin");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const pendingTeams = useMemo(
    () => [...new Set(pendingApplications.map((app) => app.team))],
    [pendingApplications],
  );
  const pendingRoles = useMemo(
    () => [...new Set(pendingApplications.map((app) => app.role))],
    [pendingApplications],
  );
  const pendingTitles = useMemo(
    () => [...new Set(pendingApplications.map((app) => app.title))],
    [pendingApplications],
  );
  const completedTeams = useMemo(
    () => [...new Set(completedApplications.map((app) => app.team))],
    [completedApplications],
  );
  const completedRoles = useMemo(
    () => [...new Set(completedApplications.map((app) => app.role))],
    [completedApplications],
  );
  const completedTitles = useMemo(
    () => [...new Set(completedApplications.map((app) => app.title))],
    [completedApplications],
  );

  const filteredPendingApps = useMemo(() => {
    return pendingApplications.filter((app) => {
      const titleMatch = pendingFilter.title
        ? app.title === pendingFilter.title
        : true;
      const teamMatch = pendingFilter.team
        ? app.team === pendingFilter.team
        : true;
      const roleMatch = pendingFilter.role
        ? app.role === pendingFilter.role
        : true;
      return titleMatch && teamMatch && roleMatch;
    });
  }, [pendingApplications, pendingFilter]);

  const filteredCompletedApps = useMemo(() => {
    return completedApplications.filter((app) => {
      const titleMatch = completedFilter.title
        ? app.title === completedFilter.title
        : true;
      const teamMatch = completedFilter.team
        ? app.team === completedFilter.team
        : true;
      const roleMatch = completedFilter.role
        ? app.role === completedFilter.role
        : true;
      return titleMatch && teamMatch && roleMatch;
    });
  }, [completedApplications, completedFilter]);

  useEffect(() => {
    setVisiblePendingCount(ITEMS_PER_PAGE);
  }, [pendingFilter]);

  useEffect(() => {
    setVisibleCompletedCount(ITEMS_PER_PAGE);
  }, [completedFilter]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/hiring/admin/applications", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPendingApplications(data.pendingForms);

        const now = new Date();
        const fortyFiveDaysInMs = 45 * 24 * 60 * 60 * 1000;

        const recentCompletedApplications = data.completedForms.filter(
          (app: Application) => {
            const completedDate = new Date(app.updatedAt);
            return now.getTime() - completedDate.getTime() < fortyFiveDaysInMs;
          },
        );

        setCompletedApplications(recentCompletedApplications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCareers = async () => {
    try {
      const res = await fetch("/api/hiring/admin/careers", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const sortedCareers = [...data.careers].sort((a, b) => {
          // First, sort by role: "Head" comes before "Executive"
          if (a.role !== b.role) {
            if (a.role === "Head" && b.role === "Executive") return -1;
            if (a.role === "Executive" && b.role === "Head") return 1;
            return 0;
          }
          // Then, sort alphabetically by title within the same role
          return a.title.localeCompare(b.title);
        });
        setCareers(sortedCareers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const res = await fetch("/api/admin/upcoming-events", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUpcomingEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCareer = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCareerTitle || !newCareerTeam || !newCareerRole) return;
    setIsAddingCareer(true);
    try {
      const res = await fetch("/api/hiring/admin/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newCareerTitle,
          team: newCareerTeam,
          role: newCareerRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCareerTitle("");
        setNewCareerTeam("");
        setNewCareerRole("");
        fetchCareers();
      } else {
        console.error("Failed to add career:", data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingCareer(false);
    }
  };

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !newEventName ||
      !newEventDescription ||
      !newEventDate ||
      !newEventLocation ||
      (!newEventPoster && !newEventPosterFile)
    )
      return;
    setIsAddingEvent(true);
    try {
      let posterUrl = newEventPoster;

      if (newEventPosterFile) {
        const formData = new FormData();
        formData.append("file", newEventPosterFile);

        const uploadRes = await fetch("/api/admin/upload-poster", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
          console.error("Poster upload failed:", uploadData.error);
          alert("Failed to upload poster. Please try again.");
          setIsAddingEvent(false);
          return;
        }

        posterUrl = uploadData.url as string;
      }

      if (!posterUrl) {
        alert("Poster URL is required.");
        setIsAddingEvent(false);
        return;
      }

      const res = await fetch("/api/admin/upcoming-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newEventName,
          description: newEventDescription,
          date: newEventDate,
          location: newEventLocation,
          poster: posterUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewEventName("");
        setNewEventDescription("");
        setNewEventDate("");
        setNewEventLocation("");
        setNewEventPoster("");
        setNewEventPosterFile(null);
        fetchUpcomingEvents();
      } else {
        console.error("Failed to add event:", data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingEvent(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/hiring/admin/toggleStatus/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        fetchApplications();

        // ✨ Check for the new emailSent flag and show an alert
        if (data.emailSent) {
          alert("Welcome email sent successfully!");
        }
      } else {
        console.error("Failed to update status:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const openDeleteModal = (
    id: string,
    type: "application" | "career" | "event",
  ) => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      let url = "";
      if (itemToDelete.type === "application") {
        url = `/api/hiring/admin/applications/${itemToDelete.id}`;
      } else if (itemToDelete.type === "career") {
        url = `/api/hiring/admin/careers/${itemToDelete.id}`;
      } else if (itemToDelete.type === "event") {
        url = `/api/admin/upcoming-events/${itemToDelete.id}`;
      }

      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        if (itemToDelete.type === "application") {
          fetchApplications();
        } else if (itemToDelete.type === "career") {
          fetchCareers();
        } else if (itemToDelete.type === "event") {
          fetchUpcomingEvents();
        }
      } else {
        console.error(`Failed to delete ${itemToDelete.type}:`, data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const handleResumeDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      let finalFilename = filename || "resume";
      if (!finalFilename.toLowerCase().endsWith(".pdf")) {
        finalFilename += ".pdf";
      }

      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download resume.");
    }
  };

  const renderTable = (applications: Application[], isPending: boolean) => {
    return (
      <div className="overflow-x-auto bg-gradient-to-br from-zinc-950 to-black border border-zinc-800 rounded-2xl hover:border-orange-500/30 transition-all duration-300 shadow-xl shadow-black/50">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Roll No
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Dept
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Group
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Spec.
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Accom.
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Opening
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Resume
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Submitted On
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {applications.map((app, index) => {
              const resumeFilename = app.resumeUrl
                ? decodeURIComponent(
                    app.resumeUrl.substring(app.resumeUrl.lastIndexOf("/") + 1),
                  )
                : "";
              return (
                <tr
                  key={app._id}
                  className="hover:bg-gradient-to-r hover:from-zinc-900/50 hover:to-zinc-950 transition-all duration-300 border-b border-zinc-900 last:border-0 group"
                >
                  <td className="px-4 py-4 text-sm text-white font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 text-sm text-white font-semibold whitespace-nowrap">
                    {app.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.chitkaraEmail}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.contactNumber}
                  </td>
                  <td className="px-4 py-4 text-sm text-white">
                    {app.rollNumber}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.gender}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.department}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.group}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.specialization}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.hosteller}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.role}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {app.team}
                  </td>
                  <td className="px-4 py-4 text-sm text-white">
                    {app.resumeUrl ? (
                      <button
                        onClick={() =>
                          handleResumeDownload(app.resumeUrl!, resumeFilename)
                        }
                        className="text-orange-500 hover:text-orange-400 hover:underline bg-transparent border-none p-0 cursor-pointer transition-all duration-200 font-semibold"
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-white whitespace-nowrap">
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(app._id)}
                        className={`py-2 px-4 rounded-lg font-semibold text-black text-xs transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md cursor-pointer active:scale-95 ${
                          isPending
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/50"
                            : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-yellow-500/50"
                        }`}
                      >
                        {isPending ? "Approve" : "To Pending"}
                      </button>
                      <button
                        onClick={() => openDeleteModal(app._id, "application")}
                        className="p-2 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600/40 hover:text-red-400 hover:scale-110 transition-all duration-200 cursor-pointer active:scale-95"
                        aria-label="Delete application"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-zinc-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/20 to-transparent blur-xl animate-pulse"></div>
          </div>
          <p className="text-gray-400 font-semibold tracking-wide">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={isDeleting}
        itemType={itemToDelete?.type || ""}
      />
      <div className="min-h-screen relative overflow-hidden text-white bg-transparent">
        <div
          className={`relative z-10 p-4 sm:p-6 md:p-8 lg:p-10 transition-all duration-1000 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent mb-2 animate-in fade-in slide-in-from-top duration-700">
              Admin Dashboard
            </h1>
            <div className="relative w-20 sm:w-24 h-1 mx-auto mt-3 sm:mt-4 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
            <p className="text-gray-400 text-sm mt-3 sm:mt-4 animate-in fade-in slide-in-from-bottom duration-700">
              Manage applications, openings, and upcoming events
            </p>
          </div>

          <div className="mb-6 sm:mb-8 md:mb-10 flex justify-center overflow-x-auto pb-2">
            <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 p-1 rounded-full flex items-center border border-zinc-800 hover:border-orange-500/30 transition-all duration-300 min-w-fit shadow-lg shadow-black/50">
              <span
                className={`absolute top-1 bottom-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/50 transition-all duration-500 ease-out`}
                style={{
                  width:
                    activeTab === "applications"
                      ? "7rem"
                      : activeTab === "openings"
                        ? "7rem"
                        : "8rem",
                  left: "0.25rem",
                  transform:
                    activeTab === "applications"
                      ? "translateX(0)"
                      : activeTab === "openings"
                        ? "translateX(7rem)"
                        : "translateX(14rem)",
                }}
              ></span>
              <button
                onClick={() => setActiveTab("applications")}
                className={`relative z-10 w-28 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  activeTab === "applications"
                    ? "text-black scale-105"
                    : "text-gray-400 hover:text-white hover:scale-105"
                }`}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab("openings")}
                className={`relative z-10 w-28 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  activeTab === "openings"
                    ? "text-black scale-105"
                    : "text-gray-400 hover:text-white hover:scale-105"
                }`}
              >
                Openings
              </button>
              <button
                onClick={() => setActiveTab("upcomingEvents")}
                className={`relative z-10 w-32 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  activeTab === "upcomingEvents"
                    ? "text-black scale-105"
                    : "text-gray-400 hover:text-white hover:scale-105"
                }`}
              >
                Events
              </button>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform:
                  activeTab === "applications"
                    ? "translateX(0%)"
                    : activeTab === "openings"
                      ? "translateX(-100%)"
                      : "translateX(-200%)",
              }}
            >
              <div className="w-full flex-shrink-0">
                <div className="space-y-12">
                  <section>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                          Pending Applications
                        </h2>
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 rounded-full text-orange-500 text-sm font-semibold shadow-lg shadow-orange-500/20 hover:scale-110 transition-transform duration-300">
                          {filteredPendingApps.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <select
                          value={pendingFilter.title}
                          onChange={(e) =>
                            setPendingFilter((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 border text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-500/50 block w-full p-2.5 transition-all duration-300 cursor-pointer"
                        >
                          <option value="">All Openings</option>
                          {pendingTitles.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                        <select
                          value={pendingFilter.team}
                          onChange={(e) =>
                            setPendingFilter((prev) => ({
                              ...prev,
                              team: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 border text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-500/50 block w-full p-2.5 transition-all duration-300 cursor-pointer"
                        >
                          <option value="">All Teams</option>
                          {pendingTeams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                        <select
                          value={pendingFilter.role}
                          onChange={(e) =>
                            setPendingFilter((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 border text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-500/50 block w-full p-2.5 transition-all duration-300 cursor-pointer"
                        >
                          <option value="">All Roles</option>
                          {pendingRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {filteredPendingApps.length === 0 ? (
                      <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center hover:border-orange-500/30 transition-all duration-300">
                        <p className="text-gray-400">
                          No matching pending applications found.
                        </p>
                      </div>
                    ) : (
                      <>
                        {renderTable(
                          filteredPendingApps.slice(0, visiblePendingCount),
                          true,
                        )}
                        {filteredPendingApps.length > ITEMS_PER_PAGE && (
                          <div className="mt-6 flex justify-center gap-4">
                            {visiblePendingCount > ITEMS_PER_PAGE && (
                              <button
                                onClick={() =>
                                  setVisiblePendingCount(ITEMS_PER_PAGE)
                                }
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 text-white font-semibold hover:from-zinc-700 hover:to-zinc-800 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer active:scale-95"
                              >
                                View Less
                              </button>
                            )}
                            {filteredPendingApps.length >
                              visiblePendingCount && (
                              <button
                                onClick={() =>
                                  setVisiblePendingCount(
                                    (prev) => prev + ITEMS_PER_PAGE,
                                  )
                                }
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 text-white font-semibold hover:from-zinc-700 hover:to-zinc-800 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer active:scale-95"
                              >
                                View More
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </section>
                  <section>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                          Completed Applications
                        </h2>
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 rounded-full text-green-500 text-sm font-semibold shadow-lg shadow-green-500/20 hover:scale-110 transition-transform duration-300">
                          {filteredCompletedApps.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <select
                          value={completedFilter.title}
                          onChange={(e) =>
                            setCompletedFilter((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 border text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-500/50 block w-full p-2.5 transition-all duration-300 cursor-pointer"
                        >
                          <option value="">All Openings</option>
                          {completedTitles.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                        <select
                          value={completedFilter.team}
                          onChange={(e) =>
                            setCompletedFilter((prev) => ({
                              ...prev,
                              team: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 border text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-500/50 block w-full p-2.5 transition-all duration-300 cursor-pointer"
                        >
                          <option value="">All Teams</option>
                          {completedTeams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                        <select
                          value={completedFilter.role}
                          onChange={(e) =>
                            setCompletedFilter((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 border text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-500/50 block w-full p-2.5 transition-all duration-300 cursor-pointer"
                        >
                          <option value="">All Roles</option>
                          {completedRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {filteredCompletedApps.length === 0 ? (
                      <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center hover:border-orange-500/30 transition-all duration-300">
                        <p className="text-gray-400">
                          No matching completed applications found.
                        </p>
                      </div>
                    ) : (
                      <>
                        {renderTable(
                          filteredCompletedApps.slice(0, visibleCompletedCount),
                          false,
                        )}
                        {filteredCompletedApps.length > ITEMS_PER_PAGE && (
                          <div className="mt-6 flex justify-center gap-4">
                            {visibleCompletedCount > ITEMS_PER_PAGE && (
                              <button
                                onClick={() =>
                                  setVisibleCompletedCount(ITEMS_PER_PAGE)
                                }
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 text-white font-semibold hover:from-zinc-700 hover:to-zinc-800 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer active:scale-95"
                              >
                                View Less
                              </button>
                            )}
                            {filteredCompletedApps.length >
                              visibleCompletedCount && (
                              <button
                                onClick={() =>
                                  setVisibleCompletedCount(
                                    (prev) => prev + ITEMS_PER_PAGE,
                                  )
                                }
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 text-white font-semibold hover:from-zinc-700 hover:to-zinc-800 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer active:scale-95"
                              >
                                View More
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </section>
                </div>
              </div>

              <div className="w-full flex-shrink-0 px-2 sm:px-4 md:px-6 lg:px-8">
                <section>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent mb-6 sm:mb-8 md:mb-10 text-center animate-in fade-in duration-700">
                    Manage Career Openings
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:sticky lg:top-8 hover:border-orange-500/30 transition-all duration-300 shadow-lg shadow-black/50">
                        <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                          Add New Opening
                        </h3>
                        <form
                          onSubmit={handleAddCareer}
                          className="flex flex-col gap-3 sm:gap-4"
                        >
                          <input
                            type="text"
                            value={newCareerTitle}
                            onChange={(e) => setNewCareerTitle(e.target.value)}
                            placeholder="Enter Title"
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white placeholder-gray-600 transition-all duration-300 hover:border-orange-500/50"
                            required
                          />
                          <select
                            value={newCareerTeam}
                            onChange={(e) => setNewCareerTeam(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white transition-all duration-300 hover:border-orange-500/50 cursor-pointer"
                            required
                          >
                            <option value="">Select Team</option>
                            {[
                              "Content+Documentation",
                              "Events",
                              "Graphics",
                              "Hr(Human Resource)",
                              "Logistics+Marketing",
                              "Media",
                              "Outreach",
                              "Social Media",
                              "Technical",
                            ].map((team) => (
                              <option key={team} value={team}>
                                {team}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newCareerRole}
                            onChange={(e) => setNewCareerRole(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white transition-all duration-300 hover:border-orange-500/50 cursor-pointer"
                            required
                          >
                            <option value="">Select Role</option>
                            {["Executive", "Head"].map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            disabled={isAddingCareer}
                            className="w-full flex-shrink-0 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-black font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                          >
                            <PlusIcon /> Add Opening
                          </button>
                        </form>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-orange-500/30 transition-all duration-300 shadow-lg shadow-black/50">
                        <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                          Current Openings
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                          {careers.length > 0 ? (
                            careers.map((career) => (
                              <div
                                key={career._id}
                                className="flex items-center justify-between bg-gradient-to-br from-zinc-900 to-zinc-950 p-3 sm:p-4 rounded-lg border border-zinc-800 hover:border-orange-500/50 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-base sm:text-lg truncate group-hover:from-orange-200 group-hover:to-white transition-all duration-300">
                                    {career.title}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Team: {career.team}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-400">
                                    Role: {career.role}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    openDeleteModal(career._id, "career")
                                  }
                                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-4 col-span-full">
                              No career openings found.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="w-full flex-shrink-0 px-2 sm:px-4 md:px-6 lg:px-8">
                <section>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent mb-6 sm:mb-8 md:mb-10 text-center animate-in fade-in duration-700">
                    Upcoming Events
                  </h2>
                  <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-orange-500/30 transition-all duration-300 shadow-lg shadow-black/50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl sm:rounded-2xl p-4 border border-zinc-800 hover:border-orange-500/30 transition-all duration-300 shadow-lg">
                          <h3 className="text-sm sm:text-base font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                            Add Upcoming Event
                          </h3>
                          <form
                            onSubmit={handleAddEvent}
                            className="flex flex-col gap-3"
                          >
                            <input
                              type="text"
                              value={newEventName}
                              onChange={(e) => setNewEventName(e.target.value)}
                              placeholder="Event name"
                              className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white placeholder-gray-600 transition-all duration-300 hover:border-orange-500/50"
                              required
                            />
                            <textarea
                              value={newEventDescription}
                              onChange={(e) =>
                                setNewEventDescription(e.target.value)
                              }
                              placeholder="Event description"
                              className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white placeholder-gray-600 transition-all duration-300 min-h-[80px] hover:border-orange-500/50"
                              required
                            />
                            <input
                              type="date"
                              value={newEventDate}
                              onChange={(e) => setNewEventDate(e.target.value)}
                              className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white transition-all duration-300 hover:border-orange-500/50 cursor-pointer"
                              required
                            />
                            <input
                              type="text"
                              value={newEventLocation}
                              onChange={(e) =>
                                setNewEventLocation(e.target.value)
                              }
                              placeholder="Location"
                              className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white placeholder-gray-600 transition-all duration-300 hover:border-orange-500/50"
                              required
                            />
                            <div className="flex flex-col gap-2">
                              <label className="text-xs text-gray-400">
                                Poster (upload image or paste URL)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setNewEventPosterFile(file);
                                }}
                                className="w-full text-xs text-gray-300 file:mr-2 sm:file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-orange-600 file:px-2 file:py-1.5 sm:file:px-3 sm:file:py-2 file:text-xs file:font-semibold file:text-black hover:file:from-orange-600 hover:file:to-orange-700 file:transition-all file:duration-300 cursor-pointer"
                              />
                              <div className="relative">
                                <span className="text-xs text-gray-500 absolute left-3 -top-2 bg-zinc-900 px-1">
                                  OR
                                </span>
                              </div>
                              <input
                                type="text"
                                value={newEventPoster}
                                onChange={(e) =>
                                  setNewEventPoster(e.target.value)
                                }
                                placeholder="Enter poster image URL"
                                className="w-full p-3 rounded-xl bg-black border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none text-white placeholder-gray-600 transition-all duration-300 text-sm hover:border-orange-500/50"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isAddingEvent}
                              className="w-full flex-shrink-0 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-black font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                              <PlusIcon />
                              {isAddingEvent ? "Adding..." : "Add Event"}
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                          {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => (
                              <div
                                key={event._id}
                                className="flex flex-col bg-gradient-to-br from-zinc-900 to-zinc-950 p-3 sm:p-4 rounded-lg gap-3 border border-zinc-800 hover:border-orange-500/50 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group"
                              >
                                <div className="flex justify-between items-start gap-2 sm:gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-base sm:text-lg truncate group-hover:from-orange-200 group-hover:to-white transition-all duration-300">
                                      {event.name}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(event.date).toLocaleDateString(
                                        "en-IN",
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        },
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 truncate">
                                      {event.location}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      openDeleteModal(event._id, "event")
                                    }
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95"
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-300 line-clamp-3">
                                  {event.description}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-4 col-span-full">
                              No upcoming events found.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center animate-in fade-in duration-700">
            <p className="text-xs text-gray-600">
              Powered by{" "}
              <span className="font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                CN_CUIET
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
