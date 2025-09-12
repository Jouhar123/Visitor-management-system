import React, { useState } from 'react';

const Card = ({ visitorData, onClose }) => {
  if (!visitorData) return null;

  const [formData, setFormData] = useState({
    name: visitorData.visitor?.name || '',
    email: visitorData.visitor?.email || '',
    phone: visitorData.visitor?.phone || '',
    purpose: visitorData.purpose || '',
    whomToMeet: visitorData.whomToMeet || '',
    time: visitorData.time || '',
    photoUrl: visitorData.photoUrl || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      setSuccessMsg('');

      const res = await fetch(`/api/visitor/filter?id=${visitorData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }

      setSuccessMsg('Visitor updated successfully');
    } catch (err) {
      console.error(err);
      alert('Error updating visitor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-500 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative flex gap-6">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Left: Editable fields */}
        <div className="flex-1 flex flex-col justify-center">
          {['name', 'email', 'phone', 'purpose', 'whomToMeet'].map((field) => (
            <div className="mb-3" key={field}>
              <label className="block font-medium capitalize">{field}</label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="border rounded px-3 py-1 w-full"
              />
            </div>
          ))}
          <p className="text-sm text-gray-600 mb-2">
            Registered Time: {new Date(formData.time).toLocaleString()}
          </p>

          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>

          {successMsg && (
            <p className="text-green-600 mt-2 font-medium">{successMsg}</p>
          )}
        </div>

        {/* Right: Image + Name */}
        <div className="flex flex-col items-center w-1/3">
          <img
            src={formData.photoUrl}
            alt="Visitor"
            className="w-40 h-40 object-cover rounded-full shadow mb-3"
          />
          <span className="text-center text-lg font-semibold">
            {formData.name || '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;
