import React, { useState } from 'react';
import './Email.scss';

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
            const response = await fetch('http://127.0.0.1:5000/send-mail', request);

            if (!response.ok) {
                throw new Error("Failed to send email");
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
                        <h1>Compose Email</h1>
                        <p>Send your message instantly</p>
                    </header>

                    <form onSubmit={handleSubmit} className="email-form">
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
                                placeholder="Your message here..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {msgContent && (
                            <div className={`status-message ${status}`}>
                                {msgContent}
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Sending...' : 'Send Email'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Email;