import React, { useState } from 'react';
import './Email.scss';

// Port 5000 is deliberately avoided: macOS binds it for the AirPlay Receiver,
// which answers every request with a 403 and makes the API look broken.
// Override with REACT_APP_API_URL when the backend lives elsewhere.
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5055';

function Email() {
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [msgContent, setMsgContent] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const isEmpty = !formData.to && !formData.subject && !formData.message;

    const handleReset = () => {
        setFormData({ to: '', subject: '', message: '' });
        setStatus('idle');
        setMsgContent('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMsgContent('');

        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        };

        try {
            const response = await fetch(`${API_URL}/send-mail`, request);

            // Surface the server's own message ("'to' is required", "Mail is
            // not configured…") instead of a generic failure string.
            if (!response.ok) {
                const detail = await response.json().catch(() => null);
                throw new Error(detail?.message || `Failed to send email (${response.status})`);
            }

            const result = await response.json();
            setStatus('success');
            setMsgContent('Email sent successfully!');
            setFormData({ to: '', subject: '', message: '' }); // Reset form
            console.log("Email sent successfully", result);
        } catch (error) {
            setStatus('error');
            setMsgContent(`Error sending email: ${error.message}`);
            console.error("Error sending email", error);
        }
    };

    return (
        <div className="email-page">
            <div className="email-wrapper">
                <div className="email-card">
                    <header className="email-header">
                        <h1>New message</h1>
                        <p>Delivered over SMTP by the Flask API.</p>
                    </header>

                    {/* The submit button lives in the action bar outside the
                        form, so it associates back via form="compose-form". */}
                    <form id="compose-form" onSubmit={handleSubmit} className="email-form">
                        <div className="form-group">
                            <label htmlFor="to">Recipient</label>
                            <input
                                type="email"
                                id="to"
                                name="to"
                                placeholder="recipient@example.com"
                                value={formData.to}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder="What is this about?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Write your message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* role/aria-live so a screen reader announces the result;
                            the colour change alone is not an accessible signal. */}
                        {msgContent && (
                            <div
                                className={`status-message ${status}`}
                                role={status === 'error' ? 'alert' : 'status'}
                                aria-live="polite"
                            >
                                {msgContent}
                            </div>
                        )}
                    </form>

                    <div className="email-actions">
                        <button
                            type="button"
                            className="ghost-btn"
                            onClick={handleReset}
                            disabled={status === 'loading' || isEmpty}
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            form="compose-form"
                            className="submit-btn"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Sending…' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Email;