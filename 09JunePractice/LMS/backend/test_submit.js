const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userId = '6a32fff7813cee72401a4516';
const courseId = '6a32ff82813cee72401a44f4';

const token = jwt.sign({ id: userId, role: 'Learner' }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });

fetch(`http://127.0.0.1:5000/api/courses/${courseId}/final-exam/submit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    answers: [{ questionId: 'mock_fe_q0', selectedOptionIndex: 0 }]
  })
}).then(res => res.json()).then(data => console.log(data)).catch(console.error);
