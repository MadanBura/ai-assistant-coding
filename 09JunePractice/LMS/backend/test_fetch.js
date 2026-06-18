const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({ id: '6a32fff7813cee72401a4516', role: 'Learner' }, process.env.JWT_SECRET || 'supersecretchangeinproduction', { expiresIn: '1d' });

fetch('http://127.0.0.1:5000/api/courses/6a32ff82813cee72401a44f4/final-exam', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.text()).then(data => console.log("Response:", data)).catch(err => console.error("Error:", err));
