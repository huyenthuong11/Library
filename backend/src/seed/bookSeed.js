import mongoose from "mongoose";
import axios from "axios";
import Document from "../models/Document.js";

const MONGO_URI = "mongodb+srv://kmr22972_db_user:qo8SldzAVrW82aQV@cluster0.wpyd75w.mongodb.net/?appName=Cluster0"; 

// ===== CONFIG =====
const FETCH_LIMIT = 3000; 

// ===== FIXED CATEGORY =====
const CATEGORIES = [
  "novel", "science", "technology", "business", "history",
  "education", "children", "self-help",
  "vietnamese-literature", "comics", "exam-prep"
];

const VN_PUBLISHERS = [
  "NXB Trẻ", "NXB Kim Đồng", "NXB Văn học",
  "NXB Giáo dục", "NXB Tổng hợp TP.HCM"
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ===== UTILS =====
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const PLACEHOLDER = "https://didongviet.vn/dchannel/wp-content/uploads/2023/09/hinh-nen-chill-didongviet-23-1.jpg";

// ===== CATEGORY LOGIC =====
function assignCategory(title, description) {
  const txt = (title + " " + description).toLowerCase();

  if (/lịch sử|chiến tranh|thời gian|việt nam/.test(txt)) return ["history"];
  if (/thiếu nhi|trẻ em|cổ tích/.test(txt)) return ["children"];
  if (/kinh tế|quản trị|startup/.test(txt)) return ["business"];
  if (/khoa học|công nghệ|ai|lập trình/.test(txt)) return ["science","technology"];
  if (/giáo dục|thi|luyện/.test(txt)) return ["education","exam-prep"];
  if (/truyện tranh|comic/.test(txt)) return ["comics"];
  if (/sức khỏe|y học|health|medicine/.test(txt)) return ["health"];
  if (/du lịch|travel/.test(txt)) return ["travel"];
  if (/ẩm thực|cooking|cookbook/.test(txt)) return ["cooking"];
  if (/tâm lý|psychology/.test(txt)) return ["self-help"];  
  if (/thiết kế|design/.test(txt)) return ["technology","art"];
  if(/địa lý/.test(txt)) return ["geography"];
  return ["novel"];
}

const isValidImage = async (url) => {
  try {
    const res = await axios.head(url);
    return res.status === 200;
  } catch {
    return false;
  }
};
const getBestImage = async (info) => {
  const img =
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.medium ||
    info.imageLinks?.thumbnail;

  if (img) {
    return img
      .replace("http://", "https://")
      .replace("zoom=5", "zoom=1")
      .replace("zoom=2", "zoom=1")
      .replace("&edge=curl", "");
  }

  // fallback Open Library
  const isbn = info.industryIdentifiers?.find(i =>
    i.type.includes("ISBN")
  )?.identifier;

  if (isbn) {
    const openLib = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    if (await isValidImage(openLib)) return openLib;
  }

  return PLACEHOLDER;
};
// ===== FETCH GOOGLE  =====
async function fetchGoogleBooks() {
  let result = [];
  const queries = ["lịch sử", "chiến tranh", "việt nam", "thiếu nhi", "trẻ em", "cổ tích", "kinh tế", "quản trị", "startup",
    "khoa học", "công nghệ", "ai", "lập trình", "giáo dục", "truyện tranh", "comic", "history", "khoa học viễn tưởng", "tâm lý học", 
    "nấu ăn", "sức khỏe", "du lịch", "kinh doanh quốc tế", "giáo trình", "nghệ thuật", "thiết kế", "lập trình web", 
    "truyện ngắn", "tự truyện", "thời trang", "sách thiếu niên", "fiction", "history", "science", "business", "thriller", "self help", 
    "cookbook", "travel", "art", "programming"
   ];
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  for (let q of queries) {
    for (let startIndex = 0; startIndex < 120; startIndex += 40) {
      try {
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=40&startIndex=${startIndex}`
        );

        const items = res.data.items || [];
        if (items.length === 0) break;

        result.push(...items);

        console.log(`Fetch ${q} startIndex=${startIndex} got ${items.length}`);

        await delay(1000);
      } catch (err) {
        console.log("Fetch lỗi: - bookSeed.js:95", err.message);
        break;
      }
    }
  }

  const uniqueMap = new Map();

  for (const book of result) {
    const title = book.volumeInfo?.title || "";
    const isbn = (book.volumeInfo?.industryIdentifiers || [])
      .find(i => i.type?.includes("ISBN"))?.identifier;

    const key = isbn || title;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, book);
    }
  }

  console.log("Totally raw books:", result.length);
  console.log("Totally unique books:", uniqueMap.size);

  return Array.from(uniqueMap.values()).slice(0, FETCH_LIMIT);

}

// ===== CONVERT GOOGLE BOOK =====
async function convertGoogle(book) {
  const info = book.volumeInfo || {};
  const title = info.title || "Không rõ";

  const numberOfCopy = randInt(3, 15);
  const availableCopies = numberOfCopy;
  const pages = 
    Math.max(
      1,
      parseInt(info.pageCount) || randInt(100, 500)
    );
  const year = parseInt(info.publishedDate?.slice(0, 4));
  return {
    title,
    author: info.authors?.join(", ") || "Không rõ",
    publisher: info.publisher || pick(VN_PUBLISHERS),
    publishDate: !isNaN(year)
        ? new Date(year, 0, 1)
        : new Date(2000, 0, 1),
    pages: pages < 1 ? randInt(100, 500) : pages,
    description: info.description || "Không có mô tả",
    category: assignCategory(title, info.description || ""),
    style: "book",
    language: info.language === "vi" ? "vi" : "en",

    image: await getBestImage(info),

    coverPrice: randInt(50000,200000),
    numberOfCopy,
    availableCopies
  };
}

// ===== MAIN =====
async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected MongoDB - bookSeed.js:181");

  console.log("Fetching Google Books... - bookSeed.js:183");
  const googleRaw = await fetchGoogleBooks();

  const googleData = await Promise.all(
    googleRaw.map(convertGoogle)
  );

  console.log("Google books: - bookSeed.js:190", googleData.length);


  const finalData = shuffle([...googleData]);

  console.log("Total dataset: - bookSeed.js:202", finalData.length);

  await Document.deleteMany();
  await Document.insertMany(finalData);

  console.log("Seed thành công - bookSeed.js:207");

  await mongoose.disconnect();
}

run();