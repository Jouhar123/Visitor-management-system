"use client";
import React, { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Trash2, Users, Calendar, User } from "lucide-react";
import Visitorcard from "./card";

const VisitorList = ({ showTitle = true, dashboardMode = false }) => {
  const [visitors, setVisitors] = useState([]);
  const [allVisitors, setAllVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('today'); 
  const [selectedVisitorVisits, setSelectedVisitorVisits] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    if (dashboardMode) {
      // Dashboard mode: only show today's visits
      fetchTodayVisits(currentPage);
    } else {
      // Visitors section mode: can toggle between views
      if (viewMode === 'today') {
        fetchTodayVisits(currentPage);
      } else {
        fetchAllVisitors(currentPage);
      }
    }
  }, [currentPage, viewMode, dashboardMode]);

  const fetchTodayVisits = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/visitor/filter?filter=today&page=${page}&limit=${itemsPerPage}`
      );
      const data = await res.json();
      const visitorList = Array.isArray(data) ? data : [];
      const total = visitorList.length;

      setVisitors(visitorList);
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
    } catch (err) {
      console.error("Failed to fetch today's visits:", err);
      setVisitors([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVisitors = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/visitor/filter?filter=latest&page=${page}&limit=${itemsPerPage}`
      );
      const data = await res.json();
      const visitorList = Array.isArray(data) ? data : [];
      const total = visitorList.length;

      setAllVisitors(visitorList);
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
    } catch (err) {
      console.error("Failed to fetch all visitors:", err);
      setAllVisitors([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorVisits = async (visitorId) => {
    try {
      const visitor = allVisitors.find(v => v.visitor?._id === visitorId);
      if (!visitor) return;

      const res = await fetch(`/api/visitor/filter?email=${visitor.visitor.email}`);
      const visits = await res.json();
      setSelectedVisitorVisits({
        visitor: visitor.visitor,
        visits: visits
      });
    } catch (err) {
      console.error("Failed to fetch visitor visits:", err);
    }
  };

  const handleDelete = async (visitId) => {
    if (!confirm("Are you sure you want to delete this visit? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/visitor/filter?visitId=${visitId}`, { 
        method: "DELETE" 
      });
      
      if (response.ok) {
        // Remove the deleted visit from the current list
        if (dashboardMode || viewMode === 'today') {
          setVisitors(prevVisitors => prevVisitors.filter(v => v._id !== visitId));
        } else {
          setAllVisitors(prevVisitors => prevVisitors.filter(v => v._id !== visitId));
        }
        alert("Visit deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to delete visit: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Failed to delete visit:", err);
      alert("Failed to delete visit. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const renderTodayVisits = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border border-gray-300 rounded-md min-w-[600px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Purpose</th>
            <th className="p-2">Meeting Person</th>
            <th className="p-2">Entry Time</th>
            <th className="p-2">Approval</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((v) => (
            <tr key={v._id} className="border-t">
              <td className="p-2 max-w-xs truncate">{v.visitor?.name || "—"}</td>
              <td className="p-2 max-w-xs truncate">{v.visitor?.email || "—"}</td>
              <td className="p-2 max-w-xs truncate">{v.purpose || "—"}</td>
              <td className="p-2 max-w-xs truncate">{v.whomToMeet || "—"}</td>
              <td className="p-2">
                {v.time ? new Date(v.time).toLocaleTimeString() : "—"}
              </td>
              <td className="p-2 text-center">
                {v.approval ? (
                  <CheckCircle className="inline text-green-600" title="Approved" />
                ) : (
                  <XCircle className="inline text-red-500" title="Not Approved" />
                )}
              </td>
              <td className="p-2 space-x-2">
                <div className="flex space-x-2">
                  <div className="relative group inline-block">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                      onClick={() => setSelectedVisitor(v)}
                    >
                      <Eye size={18} />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      View
                    </div>
                  </div>
                  <div className="relative group inline-block">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition disabled:opacity-50"
                      onClick={() => handleDelete(v._id)}
                      disabled={deleting}
                      title="Delete Visit"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      Delete
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAllVisitors = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border border-gray-300 rounded-md min-w-[600px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Total Visits</th>
            <th className="p-2">Latest Visit</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allVisitors.map((v) => (
            <tr key={v._id} className="border-t">
              <td className="p-2 max-w-xs truncate">{v.visitor?.name || "—"}</td>
              <td className="p-2 max-w-xs truncate">{v.visitor?.email || "—"}</td>
              <td className="p-2 max-w-xs truncate">{v.visitor?.phone || "—"}</td>
              <td className="p-2 text-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {/* This would need to be calculated from the API */}
                  —
                </span>
              </td>
              <td className="p-2 max-w-xs truncate">
                {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}
              </td>
              <td className="p-2 space-x-2">
                <div className="flex space-x-2">
                  <div className="relative group inline-block">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      onClick={() => fetchVisitorVisits(v.visitor?._id)}
                      title="View All Visits"
                    >
                      <Calendar size={18} />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      View Visits
                    </div>
                  </div>
                  <div className="relative group inline-block">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                      onClick={() => setSelectedVisitor(v)}
                    >
                      <Eye size={18} />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      View Details
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {dashboardMode ? "Today's Visitors" : (viewMode === 'today' ? "Today's Visitors" : "All Visitors")}
          </h2>
          {!dashboardMode && (
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'today' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setViewMode('today')}
              >
                <Calendar className="inline w-4 h-4 mr-2" />
                Today's Visits
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setViewMode('all')}
              >
                <Users className="inline w-4 h-4 mr-2" />
                All Visitors
              </button>
            </div>
          )}
        </div>
      )}

      {/* Show toggle buttons even when showTitle is false (for visitors section) */}
      {!showTitle && !dashboardMode && (
        <div className="flex justify-end mb-4">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'today' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setViewMode('today')}
            >
              <Calendar className="inline w-4 h-4 mr-2" />
              Today's Visits
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setViewMode('all')}
            >
              <Users className="inline w-4 h-4 mr-2" />
              All Visitors
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (dashboardMode ? visitors.length === 0 : (viewMode === 'today' ? visitors.length === 0 : allVisitors.length === 0)) ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {dashboardMode || viewMode === 'today' ? "No visitors found for today." : "No visitors found."}
          </p>
        </div>
      ) : (
        <>
          {dashboardMode || viewMode === 'today' ? renderTodayVisits() : renderAllVisitors()}

          <div className="mt-4 flex justify-center space-x-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>

          {/* Visitor Details Modal */}
          <Visitorcard
            visitorData={selectedVisitor}
            onClose={() => setSelectedVisitor(null)}
          />

          {/* Visitor Visits Modal */}
          {selectedVisitorVisits && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Visit History - {selectedVisitorVisits.visitor.name}
                  </h3>
                  <button
                    onClick={() => setSelectedVisitorVisits(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Visitor Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {selectedVisitorVisits.visitor.name}</div>
                    <div><strong>Email:</strong> {selectedVisitorVisits.visitor.email}</div>
                    <div><strong>Phone:</strong> {selectedVisitorVisits.visitor.phone}</div>
                    <div><strong>Total Visits:</strong> {selectedVisitorVisits.visits.length}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-gray-300 rounded-md">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Purpose</th>
                        <th className="p-2">Meeting Person</th>
                        <th className="p-2">Approval</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVisitorVisits.visits.map((visit) => (
                        <tr key={visit._id} className="border-t">
                          <td className="p-2">
                            {visit.createdAt ? new Date(visit.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-2 max-w-xs truncate">{visit.purpose || "—"}</td>
                          <td className="p-2 max-w-xs truncate">{visit.whomToMeet || "—"}</td>
                          <td className="p-2 text-center">
                            {visit.approval ? (
                              <CheckCircle className="inline text-green-600" title="Approved" />
                            ) : (
                              <XCircle className="inline text-red-500" title="Not Approved" />
                            )}
                          </td>
                          <td className="p-2">
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm"
                              onClick={() => handleDelete(visit._id)}
                              disabled={deleting}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VisitorList;
