const Database = require('better-sqlite3');
const db = new Database('rsvp.db');

const sampleWishes = [
  { name: 'Siti Aminah', attendance: 'Hadir', notes: 'Selamat pengantin baru Mariani & Mazlan! Semoga berkekalan hingga ke Jannah.' },
  { name: 'Ahmad Faisal', attendance: 'Hadir', notes: 'Barakallahulakuma wa baraka alaikuma wa jamaa bainakuma fi khair.' },
  { name: 'Nurul Izzah', attendance: 'Hadir', notes: 'Tahniah! Cantik sangat jemputan ni. Tak sabar nak hadir.' },
  { name: 'Uncle Sam', attendance: 'Hadir', notes: 'Semoga berbahagia selalu anakanda berdua.' },
  { name: 'Farah Wahida', attendance: 'Hadir', notes: 'Selamat menempuh alam perkahwinan. Semoga dimurahkan rezeki selalu.' }
];

const seed = () => {
  const insert = db.prepare('INSERT INTO rsvps (name, attendance, guests, notes) VALUES (?, ?, ?, ?)');
  sampleWishes.forEach(wish => {
    insert.run(wish.name, wish.attendance, 1, wish.notes);
  });
  console.log('Database seeded with sample wishes.');
  db.close();
};

seed();
