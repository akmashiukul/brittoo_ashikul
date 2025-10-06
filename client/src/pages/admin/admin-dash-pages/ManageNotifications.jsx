import { useState, useEffect } from 'react';
import api from '../../../lib/api';

const ManageNotifications = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targets, setTargets] = useState('');
  const [sent, setSent] = useState([]);

  useEffect(() => {
    api.get('/api/v1/notifications/sent').then(res => setSent(res.data.data));
  }, []);

  const handleSend = async () => {
    const targetArray = targets === 'all' ? 'all' : targets.split(',').map(t => t.trim());
    await api.post('/api/v1/notifications/custom', { title, body, targets: targetArray });
    // Refresh sent
    const res = await api.get('/api/v1/notifications/sent');
    setSent(res.data.data);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Manage Notifications</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <textarea
        placeholder="Body"
        value={body}
        onChange={e => setBody(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Targets: 'all' or comma-separated emails/ids"
        value={targets}
        onChange={e => setTargets(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <button onClick={handleSend} className="bg-blue-500 text-white p-2">Send</button>

      <h3 className="text-xl mt-6">Past Sent Notifications</h3>
      <ul>
        {sent.map(n => (
          <li key={n.id} className="border p-2 mb-2">
            <strong>{n.title}</strong>: {n.body} <br />
            Targets: {n.targets} <br />
            Sent: {new Date(n.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageNotifications;