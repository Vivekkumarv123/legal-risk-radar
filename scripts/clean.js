import fs from 'fs';
import path from 'path';

const nextDir = path.join(process.cwd(), '.next');

if (fs.existsSync(nextDir)) {
  console.log('🧹 Clearing .next folder...');
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ .next folder cleared successfully!');
} else {
  console.log('.next folder does not exist.');
}
