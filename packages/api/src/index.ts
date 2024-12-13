import dotenv from 'dotenv';
import app from './config/express';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 