


import React, { useEffect, useState } from 'react';
import SponsorForm from './sponsor_form';
import { CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editSponsor, setEditSponsor] = useState(null);

  const fetchSponsors = async (name = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sponsor?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      setSponsors(Array.isArray(data) ? data : []);
    } catch (err) {
      setSponsors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSponsors(search);
  };

  const handleAddSponsor = () => setShowForm(true);
  const handleFormSuccess = () => {
    setShowForm(false);
    fetchSponsors(search);
  };
  const handleFormCancel = () => setShowForm(false);
  const handleEditSponsor = (sponsor) => setEditSponsor(sponsor);
  const handleDeleteSponsor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) return;
    await fetch('/api/sponsor', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchSponsors(search);
  };

  return (
    <div className="p-6">
      {/* <h2 className="text-2xl font-bold mb-4">Sponsors</h2> */}
      <div className="flex items-center mb-4 gap-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        </form>
        <button
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleAddSponsor}
        >
          + Add Sponsor
        </button>
      </div>
      <table className="w-full text-left border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Department</th>
            <th className="p-2">Active</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="p-2 text-center">Loading...</td></tr>
          ) : sponsors.length === 0 ? (
            <tr><td colSpan={4} className="p-2 text-center">No sponsors found.</td></tr>
          ) : (
            sponsors.map(s => (
              <tr key={s._id} className="border-t">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.email}</td>
                <td className="p-2">{s.department}</td>
                <td className="p-2 text-center">
                  {s.active ? (
                    <CheckCircle className="inline text-green-600" title="Active" />
                  ) : (
                    <XCircle className="inline text-red-500" title="Inactive" />
                  )}
                </td>
                <td className="p-2 text-center space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                    onClick={() => handleEditSponsor(s)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                    onClick={() => handleDeleteSponsor(s._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showForm && (
        <SponsorForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      )}
      {editSponsor && (
        <SponsorForm initialData={editSponsor} onSuccess={() => { setEditSponsor(null); fetchSponsors(search); }} onCancel={() => setEditSponsor(null)} />
      )}
    </div>
  );
};

export default Sponsors;