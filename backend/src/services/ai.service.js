import OpenAI from "openai";
const genAI = new OpenAI({
  apiKey: process.env.GROG_RECOMMEND_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function recommendBook(books) {
    const prompt = `
    Bạn là một thủ thư ảo thông minh và tinh tế. Nhiệm vụ của bạn là phân tích danh sách sách được cung cấp và chọn ra những cuốn phù hợp nhất với người dùng.
    Sau đây là danh sách sách đã được tôi lọc ra theo sở thích 
    `
}