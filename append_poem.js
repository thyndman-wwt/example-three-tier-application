const fs = require('fs');
const poem = `

---

## The Journey of a Task

A user clicks, a task is born,
From morning light to evening morn,
Through layers it travels, swift and true,
A journey that the three-tier knew.

**The Click**
In the browser, fingers dance,
A title typed, a second glance,
The frontend captures every word,
A request sent, a signal heard.

**The Network Call**
Through the wire, the data flies,
To the API, where logic lies,
Express receives with open arms,
Validates against all harms.

**The Database Speaks**
PostgreSQL listens, understands,
Stores the task in steady hands,
A row inserted, clean and bright,
The database holds it tight.

**The Response**
Back through the layers, swift return,
The frontend waits, eager to learn,
The task appears upon the screen,
A seamless flow, a sight serene.

**The Completion**
When checked complete, the cycle turns,
The database updates, the API learns,
The frontend glows with checkmark true,
A three-tier dance, forever new.

**The Wisdom**
In this simple task we see,
The power of architecture's key,
Three tiers working as designed,
A harmony of code and mind.

---

*A celebration of the elegant simplicity and power of three-tier application design.*
`;
fs.appendFileSync('repo/POEM.md', poem);
