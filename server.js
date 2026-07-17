const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data', 'scriptures.json');

function readData() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

app.get('/api/scriptures', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read scriptures' });
  }
});

app.post('/api/scriptures', (req, res) => {
  try {
    const payload = req.body;
    const data = Array.isArray(payload) ? payload : [payload];
    writeData(data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save scriptures' });
  }
});

app.put('/api/scriptures/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = req.body;
    const data = readData();
    const index = data.findIndex((item) => String(item.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Scripture not found' });
    }

    data[index] = {
      ...data[index],
      ...updated,
      id: String(id),
      updatedAt: new Date().toISOString(),
    };

    writeData(data);
    res.json({ success: true, data: data[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update scripture' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
