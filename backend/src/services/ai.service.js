import OpenAI from "openai";
import Document from "../models/Document.js";

async function getBooksFromDB(query) {
  try {
    const docs = await Document.find({
      $or:[
        {title: {$regex: query, $options: 'i'}},
        {author: {$regex: query, $options: 'i'}},
        {category: { $in: [new RegExp(query, 'i')] }}
      ],
      deleted: false,
      locations: {
        $elemMatch: { 
          status: "available", 
          isDeleted: false 
        }
      }
    }).limit(3);
    if (docs.length === 0) return "Hiện tại kệ sách không có cuốn nào phù hợp.";
    return docs.map(d => {
      const availableLoc = d.locations.find(l => l.status === "available" && !l.isDeleted);
      return `- ${d.title} (Tác giả: ${d.author}) (Vị trí: ${availableLoc ? availableLoc.position : "Liên hệ thủ thư"})`;
    }).join('\n');
  } catch (error) {
    return "Lỗi truy vấn dữ liệu.";
  }
}

const genAI = new OpenAI({
  apiKey: process.env.GROG_RECOMMEND_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const tools = [
  {
    type: "function",
    function: {
      name: "search_books_from_db",
      description: "Tìm kiếm danh sách sách thực tế từ database của thư viện",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Từ khóa tìm kiếm (tên sách, tác giả, hoặc thể loại)",
          },
        },
        required: ["query"],
      },
    },
  },
];

export async function recommendBook(userMessage, userName, chatHistory) {
  const historyText = chatHistory
  .map(m => `${m.role}: ${m.message}`)
  .join("\n");

    const prompt = `
Bạn là "Thủ thư Mộc" - một người bạn đồng hành ấm áp, tinh tế và điềm đạm trong hệ thống quản lý thư viện LMS. 
Nhiệm vụ của bạn là hỗ trợ người dùng tìm kiếm sách và đưa ra những lời khuyên đọc sách mang tính "chữa lành" (healing).

Lịch sử hội thoại: ${historyText}

TÍNH CÁCH:
- Xưng hô: Gọi người dùng là ${userName} và xưng là "Mộc".
- Ngôn ngữ: Nhẹ nhàng, dùng từ ngữ mang tính khích lệ, tránh máy móc. 
- Thái độ: Luôn lắng nghe và sẵn lòng giúp đỡ.

QUY TẮC PHẢN HỒI:
1. Nếu người dùng hỏi về sách: Luôn ưu tiên sử dụng công cụ (functions) để tra cứu dữ liệu thực tế từ database. Không được bịa đặt thông tin sách không có thật.
2. Nếu người dùng đang buồn/stress: Hãy đưa ra một lời an ủi ngắn trước, sau đó gợi ý một cuốn sách phù hợp với tâm trạng đó.
3. Nếu thông tin sách không có trong thư viện: Hãy nói "Mộc chưa tìm thấy cuốn này trên kệ, nhưng Thương thử tham khảo cuốn [Tên sách tương tự] nhé, cũng rất hợp gu đấy!".
4. Giới hạn: Chỉ trả lời các vấn đề liên quan đến sách, tâm lý đọc sách và quy định thư viện. Khéo léo từ chối các câu hỏi chính trị, tôn giáo hoặc nhạy cảm.

ĐỊNH DẠNG:
- Sử dụng xuống dòng để dễ đọc.
- Bôi đậm tên sách bằng **Tên sách**.
`;

  try {
    const response = await genAI.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {role: "system", content: prompt},
      {role: "user", content: userMessage}
    ],
    tools: tools,
    tool_choice: "auto",
  });

  const responseMessage = response.choices[0].message;
  if (responseMessage.tool_calls) {
    const toolCall = responseMessage.tool_calls[0];
    const functionArgs = JSON.parse(toolCall.function.arguments);
    const dbResult = await getBooksFromDB(functionArgs.query);

    const secondResponse = await genAI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {role: "system", content: prompt},
        {role: "user", content: userMessage},
        responseMessage,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          name: "search_books_from_db",
          content: dbResult,
        },
      ],
    });
    return secondResponse.choices[0].message.content;
  }
  return responseMessage.content;
  } catch (error) {
    console.error("Lỗi AI Service:", error);
    return `Mộc đang gặp chút vấn đề về kết nối, ${userName} chờ Mộc một chút nhé!`;
  }


}