import React, { useState, useEffect } from 'react';
import '../MemoryPopup.css'; // Add a dedicated CSS file for styling

const MemoryPopup = ({ marker, onClose, onSaveMemory, existingMemory }) => {
    // If we are editing, pre-populate the note and photos with the existing data
    const [note, setNote] = useState(existingMemory?.note || '');
    const [photos, setPhotos] = useState(existingMemory?.photos || []);

    useEffect(() => {
        // Initialize the state with the existing memory's data when popup opens
        if (existingMemory) {
            setNote(existingMemory.note || '');
            setPhotos(existingMemory.photos || []);
        }
    }, [existingMemory]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(files);
    };

    const handleSave = () => {
        if (!note.trim() && photos.length === 0) {
            alert('Please add a note or photo before saving.');
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
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <div className="memory-popup-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default MemoryPopup;
