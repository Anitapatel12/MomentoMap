import React, { useState, useEffect } from 'react';
import '../MemoryPopup.css'; // Add a dedicated CSS file for styling

const MemoryPopup = ({ marker, onClose, onSaveMemory, existingMemory }) => {
    const [note, setNote] = useState(existingMemory?.note || '');
    const [photos, setPhotos] = useState(existingMemory?.photos || []);

    useEffect(() => {
        if (existingMemory) {
            setNote(existingMemory.note || '');
            setPhotos(existingMemory.photos || []);  // Ensure multiple photos are set correctly
        }
    }, [existingMemory]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos((prevPhotos) => [...prevPhotos, ...files]);  // Add multiple photos
    };

    const handleSave = () => {
        if (!note.trim() && photos.length === 0) {
            alert('Please add a note or a photo before saving.');
            return;
        }

        // Pass memory data back to parent component for saving
        onSaveMemory({
            marker,
            note,
            photos,
            isNew: !existingMemory // If it's a new memory, set isNew to true
        });

        // Close the popup
        onClose();
    };

    return (
        <div className="memory-popup-overlay">
            <div className="memory-popup">
                <h2>{existingMemory ? 'Edit Memory' : 'Add Memory'}</h2>

                <textarea
                    placeholder="Write a note about this place..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                ></textarea>

                <div className="photos-preview">
                    {photos.length > 0 && photos.map((photo, index) => (
                        <div className="photo-preview" key={index}>
                            <img src={URL.createObjectURL(photo)} alt={`memory ${index}`} />
                        </div>
                    ))}
                </div>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    id="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">
                    {photos.length === 0 ? 'Add Photo(s)' : 'Change Photo(s)'}
                </label>

                <div className="memory-popup-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default MemoryPopup;
