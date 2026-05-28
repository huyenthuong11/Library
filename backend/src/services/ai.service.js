import OpenAI from "openai";
import Document from "../models/Document.js";
import EBook from "../models/EBook.js";
import BorrowRecord from "../models/BorrowRecord.js";
import mongoose from "mongoose";

async function gextractSuggestedBookTitles(historyText){
  const regex = /-\s+([^(:\n-]+)/g;
  const titles = [];
  let match;
  while ((match = regex.exec(historyText)) !== null) {
    if (match[1]) {
      titles.push(match[1].trim());
    }
  }
  return titles;
}
async function getBooksFromDB(query, readerId, historyText) {
  try {
    const suggestedTitles = await gextractSuggestedBookTitles(historyText);
    console.log("Tìm kiếm sách với query:", query);
    const borrowed = await BorrowRecord.aggregate([
      { $match: { readerId: new mongoose.Types.ObjectId(readerId) } },
      { $group: { _id: "$documentId"} }
    ]);
    console.log("readerId:", readerId);
    console.log("Borrowed records:", borrowed);
    const borrowedIds = borrowed.map(b => b._id);
    
    console.log("Borrowed documents:", borrowedIds);
    const keywords = query.split(" ");
    const docs = await Document.find({
      _id: { $nin: borrowedIds },
      title: { $nin: suggestedTitles },
      $or:[
        {title: {
            $in: keywords.map(k => new RegExp(k, "i"))
          }},
        {author: {
            $in: keywords.map(k => new RegExp(k, "i"))
          }},
        {
          category: {
            $in: keywords.map(k => new RegExp(k, "i"))
          }
        }
      ],
      deleted: false,
      locations: {
        $elemMatch: { 
          status: "available", 
          isDeleted: false 
        }
      }
    }).limit(3);
    console.log("Found documents:", docs);

    const eDocs = await EBook.find({
      $or: [
        {title: {$in: keywords.map(k => new RegExp(k, "i"))}},
        {author: {$in: keywords.map(k => new RegExp(k, "i"))}},
        {content: {$in: keywords.map(k => new RegExp(k, "i"))}}
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
    console.error("Lỗi truy vấn database:", error);
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

export async function recommendBook(userMessage, userName, chatHistory, readerId) {
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
5. KHI TÌM KIẾM SÁCH:
Hệ thống thư viện hiện có các nhóm sách:

- technology 
- science 
- mathematics 
- history 
- geography 
- politics 
- philosophy 
- psychology 
- religion 
- business 
- finance 
- marketing 
- economics 
- education 
- language 
- exam_prep 
- literature 
- novel 
- children 
- comics 
- self_help 
- health 
- art 
- cooking 
- travel 
- biography 

Khi suy luận keyword tìm kiếm:
- ưu tiên sử dụng các chủ đề và thuật ngữ gần với các nhóm sách trên
- keyword nên ngắn gọn và phù hợp để tìm kiếm cả:
  + sách vật lý
  + E-book
- Không dùng nguyên văn câu người dùng làm keyword tìm kiếm
- Hãy suy luận và mở rộng thành các keyword liên quan
- Ưu tiên keyword phổ biến và dễ xuất hiện trong tên sách, thể loại hoặc nội dung Ebook.
- lưu ý nếu người dùng chỉ nhắc đến cảm xúc hãy phân tích xem cảm xúc đó thì cần cuốn sách nào để chữa lành cảm xúc đó, đừng chỉ dùng cảm xúc làm keyword tìm kiếm mà hãy suy luận ra chủ đề hoặc thể loại sách phù hợp với cảm xúc đó. 
ví dụ: người dùng thấy chán thì có thể suy luận là ra thể loại novel hoặc truyện tranh để giải trí, người dùng thấy áp lực thì có thể suy luận ra thể loại self-help để giúp họ giải tỏa áp lực, người dùng thấy tò mò về thế giới thì có thể suy luận ra chủ đề khoa học hoặc du lịch để thỏa mãn,...
- chủ đề
- cảm xúc
- lĩnh vực liên quan
- thể loại phù hợp

Mục tiêu là giúp tìm kiếm được cả:
- sách vật lý
- E-book

Sau khi suy luận keyword phù hợp, hãy gọi tool:
search_books_from_db
6. Nếu kết quả từ database trả về rỗng, nhớ là chỉ khi nào hàm không trả về kết quả, đừng vội nói là không có. Hãy dựa vào kiến thức sẵn có của Mộc để gợi ý 2-3 cuốn sách nổi tiếng thế giới về chủ đề đó, và nói thêm: 'Dù hiện tại kệ sách của Mộc chưa có cuốn sách nào mới về đề tài này, nma ${userName} tham khảo thử xem sao nhé!
Còn nếu có kết quả, thì cứ trả về kết quả không gợi ý thêm sách ngoài nữa. và sau khi trả kết quả về thì đừng nói quá dài dòng, chỉ nói thêm tối đa 2-3 câu.
7. Nếu không câu hỏi không liên quan đến việc tìm kiếm sách, Mộc vẫn sẽ trả lời một cách nhẹ nhàng và tích cực
8. Luôn phải trả lời câu hỏi của người dùng, đừng để người dùng phải hỏi lại lần 2. Nếu Mộc không hiểu câu hỏi, hãy chủ động hỏi lại người dùng để làm rõ ý hơn, đừng trả lời vòng vo hoặc không liên quan.
ĐỊNH DẠNG:
- Sử dụng xuống dòng để dễ đọc.
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
    const dbResult = await getBooksFromDB(functionArgs.query, readerId, historyText);

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
      tools: tools,
      tool_choice: "auto",
    });
    return secondResponse.choices[0].message.content;
  }
  return responseMessage.content;
  } catch (error) {
    console.error("Lỗi AI Service:", error);
    return `Mộc đang gặp chút vấn đề về kết nối, ${userName} chờ Mộc một chút nhé!`;
  }


}