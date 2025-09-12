import React, { useState, useEffect } from 'react';

const SponsorForm = ({ onSuccess, onCancel, initialData }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        department: initialData.department || '',
        active: initialData.active !== undefined ? initialData.active : true,
        _id: initialData._id,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (form._id) {
        res = await fetch('/api/sponsor', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch('/api/sponsor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error('Failed to save sponsor');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 relative"
      >
        <h2 className="text-xl font-bold mb-2">{form._id ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onCancel}
        >
          ×
        </button>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="border p-2 w-full rounded"
          required
          disabled={!!form._id}
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-2 w-full rounded"
        />
        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company"
          className="border p-2 w-full rounded"
        />
        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Department"
          className="border p-2 w-full rounded"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          Active
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? (form._id ? 'Saving...' : 'Adding...') : (form._id ? 'Save Changes' : 'Add Sponsor')}
        </button>
      </form>
    </div>
  );
};

export default SponsorForm; 