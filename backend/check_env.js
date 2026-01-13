import dotenv from 'dotenv';
dotenv.config();

console.log('Checking Environment Variables...');
console.log('GEMINI_API_KEY Exists:', !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY Length:', process.env.GEMINI_API_KEY.length);
    console.log('GEMINI_API_KEY Starts With:', process.env.GEMINI_API_KEY.substring(0, 5));
} else {
    console.log('GEMINI_API_KEY is MISSING from process.env');
}
