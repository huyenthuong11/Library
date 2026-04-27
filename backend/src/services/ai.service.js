import OpenAI from "openai";
import Document from "../models/Document.js";
import EBook from "../models/EBook.js";

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
    
    const eDocs = await EBook.find({
      $or: [
        {title: {$regex: query, $options: 'i'}},
        {author: {$regex: query, $options: 'i'}},
        {content: {$regex: query, $options: 'i'}}
      ]
    }).limit(2);

    if (docs.length === 0 && eDocs.length === 0) {
      return "Tiếc quá, Mộc không tìm thấy cuốn nào phù hợp trong kho sách giấy lẫn kho Ebook.";
    }

    let res = "";

    if (docs.length > 0) {
      res += "Sách vật lý: \n";
      const docsList = docs.map(d => {
        const loc = d.locations.find(l => l.status === "available" && !l.isDeleted);
        return `- ${d.title} (${d.author}) - Vị trí: ${loc ? loc.position : "Hết hàng"}`;
      }).join('\n');
      res += docsList + "\n\n";
    } 

    if (eDocs.length > 0) {
      res += "E-book:\n";
      const eDocsList = eDocs.map(e => `- ${e.title} (Tác giả: ${e.author})`).join('\n');
      res += eDocsList;
    }

    return res;

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
1. Phân loại rõ ràng: Khi trả kết quả từ công cụ, Mộc PHẢI chia làm 2 mục rõ rệt là "Sách vật lý tại kệ" và "E-book đọc online" (nếu có đủ cả hai).
2. Định dạng Sách vật lý: Hiện đầy đủ Tên sách, Tác giả và Vị trí kệ.
3. Định dạng E-book: Hiện Tên sách, Tác giả và thêm lời mời đọc online.
4. Nếu chỉ có một loại: Chỉ hiện loại đó, không cần hiện mục còn lại.
5. Nếu người dùng hỏi về một chủ đề/cảm xúc, hãy tự suy luận ra các từ khóa liên quan (keywords) hoặc tên các tác giả nổi tiếng về chủ đề đó để truyền vào hàm search_books_from_db
6. Nếu kết quả từ database trả về rỗng, đừng vội nói là không có. Hãy dựa vào kiến thức sẵn có của Mộc để gợi ý 2-3 cuốn sách nổi tiếng thế giới về chủ đề đó, và nói thêm: 'Dù hiện tại kệ sách của Mộc chưa cập nhật bản này, nma ${userName} tham khảo thử xem sao nhé!

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