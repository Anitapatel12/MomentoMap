import React, { useState } from 'react';
import '../MemoryPopup.css'; // Add a dedicated CSS file for styling

const MemoryPopup = ({ marker, onClose, onSaveMemory }) => {
    const [note, setNote] = useState('');
    const [photos, setPhotos] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(files);
    };

    const handleSave = () => {
        if (!note.trim() && photos.length === 0) {
            alert('Please add a note or photo before saving.');
            return;
        }

        // Pass memory data back to parent component
        onSaveMemory({
            marker,
            note,
            photos,
        });

        // Close the popup
        onClose();
    };

    return (
        <div className="memory-popup-overlay">
            <div className="memory-popup">
                <h2>Add Memory</h2>
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
